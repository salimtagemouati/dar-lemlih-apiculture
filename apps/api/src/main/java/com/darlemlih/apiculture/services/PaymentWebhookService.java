package com.darlemlih.apiculture.services;

import com.darlemlih.apiculture.entities.Order;
import com.darlemlih.apiculture.entities.OrderItem;
import com.darlemlih.apiculture.entities.Product;
import com.darlemlih.apiculture.entities.WebhookEvent;
import com.darlemlih.apiculture.entities.enums.OrderStatus;
import com.darlemlih.apiculture.payments.PaymentGateway;
import com.darlemlih.apiculture.repositories.OrderRepository;
import com.darlemlih.apiculture.repositories.ProductRepository;
import com.darlemlih.apiculture.repositories.WebhookEventRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookService {

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private PaymentWebhookService self;

    private final PaymentGateway paymentGateway;
    private final WebhookEventRepository webhookEventRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    /**
     * Distinguishes "permanent" failures (bad signature, malformed payload, unknown order)
     * from "transient" failures so the webhook controller can return 4xx vs 5xx
     * to Stripe accordingly.
     */
    public static class WebhookSignatureException extends RuntimeException {
        public WebhookSignatureException(String msg) { super(msg); }
    }

    /**
     * Process a Stripe webhook from raw bytes (preserves byte-exact signature input).
     */
    public void processWebhook(String signature, byte[] payloadBytes) {
        // Stripe's Java SDK currently parses payload as a string; we keep the bytes
        // and decode for parsing while ensuring signature input is the original payload.
        String payload = new String(payloadBytes, StandardCharsets.UTF_8);

        if (!paymentGateway.verifyWebhook(signature, payload)) {
            // Permanent failure: bad signature. Stripe should NOT retry.
            throw new WebhookSignatureException("Invalid webhook signature");
        }

        JsonNode json;
        try {
            json = objectMapper.readTree(payload);
        } catch (Exception e) {
            throw new WebhookSignatureException("Malformed webhook payload");
        }

        String eventId = json.path("id").asText();
        String eventType = json.path("type").asText();

        // 1. Save incoming webhook in its own transaction (committed immediately)
        WebhookEvent event = self.saveWebhookEvent(eventId, eventType, payload, signature);
        if (event == null) {
            // Duplicate event, skip processing
            return;
        }

        try {
            // 2. Process actual order status updates and emails in standard transactional context
            self.processBusinessLogic(json, eventType);

            // 3. Mark processed in its own transaction (committed immediately)
            self.markWebhookEventProcessed(event.getId());
        } catch (Exception e) {
            // 4. Mark failed in its own transaction (committed immediately) so audit is preserved
            self.markWebhookEventFailed(event.getId(), e.getClass().getSimpleName() + ": " + e.getMessage());
            log.error("Webhook handler {} failed for event {}", eventType, eventId, e);
            throw e;
        }
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public WebhookEvent saveWebhookEvent(String eventId, String eventType, String payload, String signature) {
        WebhookEvent event = WebhookEvent.builder()
                .provider("stripe")
                .eventId(eventId)
                .eventType(eventType)
                .payload(payload)
                .signature(signature)
                .processed(false)
                .build();
        try {
            return webhookEventRepository.saveAndFlush(event);
        } catch (DataIntegrityViolationException duplicate) {
            Optional<WebhookEvent> existing = webhookEventRepository.findByEventId(eventId);
            if (existing.isPresent()
                    && !Boolean.TRUE.equals(existing.get().getProcessed())
                    && existing.get().getError() != null) {
                log.info("Retrying previously failed webhook event {}", eventId);
                return existing.get();
            }
            log.info("Duplicate webhook event {} — skipping", eventId);
            return null;
        }
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void markWebhookEventProcessed(Long id) {
        webhookEventRepository.findById(id).ifPresent(event -> {
            event.setProcessed(true);
            event.setProcessedAt(LocalDateTime.now());
            event.setError(null);
            webhookEventRepository.save(event);
        });
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    public void markWebhookEventFailed(Long id, String error) {
        webhookEventRepository.findById(id).ifPresent(event -> {
            event.setProcessed(false);
            event.setError(error);
            webhookEventRepository.save(event);
        });
    }

    @Transactional
    public void processBusinessLogic(JsonNode json, String eventType) {
        switch (eventType) {
            case "checkout.session.completed":
                handleCheckoutSessionCompleted(json);
                break;
            case "payment_intent.succeeded":
                handlePaymentIntentSucceeded(json);
                break;
            case "payment_intent.payment_failed":
                handlePaymentFailure(json);
                break;
            default:
                log.info("Unhandled webhook event type: {}", eventType);
        }
    }

    /**
     * Primary path: when a Checkout Session completes, look up the order by
     * stripe_session_id (set when we created the session) and capture the now-known
     * payment_intent id from the event payload.
     */
    private void handleCheckoutSessionCompleted(JsonNode json) {
        JsonNode sessionObj = json.path("data").path("object");
        String sessionId = sessionObj.path("id").asText();
        String paymentIntentId = sessionObj.path("payment_intent").asText(null);

        Optional<Order> orderOpt = orderRepository.findByStripeSessionId(sessionId);
        if (orderOpt.isEmpty()) {
            // Permanent: we don't know this session — log and ignore.
            log.warn("checkout.session.completed for unknown stripe_session_id={}", sessionId);
            return;
        }

        Order order = orderOpt.get();
        if (paymentIntentId != null && !paymentIntentId.isBlank()) {
            order.setPaymentIntentId(paymentIntentId);
        }
        markOrderPaid(order);
    }

    /**
     * Secondary path: payment_intent.succeeded. May arrive before or after
     * checkout.session.completed. We look up the order by the now-stored
     * payment_intent id. If the order is already PAID we skip side-effects.
     */
    private void handlePaymentIntentSucceeded(JsonNode json) {
        String paymentIntentId = json.path("data").path("object").path("id").asText();

        Optional<Order> orderOpt = orderRepository.findByPaymentIntentId(paymentIntentId);
        if (orderOpt.isEmpty()) {
            log.warn("payment_intent.succeeded for unknown payment_intent_id={}", paymentIntentId);
            return;
        }
        markOrderPaid(orderOpt.get());
    }

    private void markOrderPaid(Order order) {
        if (order.getStatus() == OrderStatus.PAID) {
            log.debug("Order {} already PAID — skipping duplicate side effects", order.getOrderNumber());
            return;
        }
        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        try {
            emailService.sendOrderConfirmationEmail(order.getUser().getEmail(), order.getOrderNumber());
        } catch (Exception e) {
            // Email failure must NOT roll back the PAID transition or trigger Stripe retries.
            log.warn("Failed to send order confirmation email for {}: {}", order.getOrderNumber(), e.getMessage());
        }

        log.info("Order {} marked as PAID", order.getOrderNumber());
    }

    private void handlePaymentFailure(JsonNode json) {
        String paymentIntentId = json.path("data").path("object").path("id").asText();

        Optional<Order> orderOpt = orderRepository.findByPaymentIntentId(paymentIntentId);
        if (orderOpt.isEmpty()) {
            log.warn("payment_intent.payment_failed for unknown payment_intent_id={}", paymentIntentId);
            return;
        }

        Order order = orderOpt.get();
        if (order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == OrderStatus.PAID) {
            return;
        }
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);

        // Restore stock that was decremented during checkout.
        restoreStock(order);

        log.info("Order {} marked as CANCELLED due to payment failure (stock restored)", order.getOrderNumber());
    }

    /**
     * Re-adds the quantities from each order item back to the respective product's
     * stock. Called when a payment fails so inventory is not permanently leaked.
     */
    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new IllegalStateException(
                            "Cannot restore stock for missing product " + item.getProduct().getId()));
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }
    }
}
