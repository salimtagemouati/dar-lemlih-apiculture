package com.darlemlih.apiculture.payments;

import com.darlemlih.apiculture.exceptions.BadRequestException;
import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.Refund;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.RefundCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@ConditionalOnProperty(name = "payment.provider", havingValue = "stripe")
@Slf4j
public class StripePaymentGateway implements PaymentGateway {

    @Value("${payment.stripe.secret-key}")
    private String secretKey;

    @Value("${payment.stripe.webhook-secret}")
    private String webhookSecret;

    @PostConstruct
    public void init() {
        Stripe.apiKey = secretKey;
        log.info("Stripe payment gateway initialized");
    }

    @Override
    public PaymentSession createCheckoutSession(String orderId, BigDecimal amount, String currency, String successUrl, String cancelUrl) {
        try {
            log.info("Creating Stripe checkout session for order: {} with amount: {} {}", orderId, amount, currency);

            // Convert amount to centimes (Stripe uses smallest currency unit for MAD).
            // setScale(0, HALF_UP) rounds correctly; longValueExact() prevents silent overflow.
            long amountInCents = amount.multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValueExact();

            SessionCreateParams params = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl(successUrl)
                    .setCancelUrl(cancelUrl)
                    .addLineItem(
                            SessionCreateParams.LineItem.builder()
                                    .setPriceData(
                                            SessionCreateParams.LineItem.PriceData.builder()
                                                    .setCurrency(currency.toLowerCase())
                                                    .setUnitAmount(amountInCents)
                                                    .setProductData(
                                                            SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                    .setName("Order #" + orderId)
                                                                    .setDescription("Dar Lemlih Apiculture Products")
                                                                    .build()
                                                    )
                                                    .build()
                                    )
                                    .setQuantity(1L)
                                    .build()
                    )
                    .putMetadata("order_number", orderId)
                    .setPaymentIntentData(
                            SessionCreateParams.PaymentIntentData.builder()
                                    .putMetadata("order_number", orderId)
                                    .build()
                    )
                    .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                    .build();

            Session session = Session.create(params);

            log.info("Stripe checkout session created successfully: {}", session.getId());

            // Note: session.getPaymentIntent() is null at session creation. The
            // payment_intent id is only available after the customer completes
            // checkout. We persist session.getId() as the lookup key (see
            // OrderService.checkout / Order.stripeSessionId) and resolve the
            // payment_intent in the webhook handler.
            return PaymentSession.builder()
                    .sessionId(session.getId())
                    .paymentIntentId(session.getPaymentIntent())
                    .checkoutUrl(session.getUrl())
                    .status("pending")
                    .build();

        } catch (StripeException e) {
            log.error("Failed to create Stripe checkout session for order: {}", orderId, e);
            throw new BadRequestException("STRIPE_SESSION_FAILED",
                    "Failed to create payment session: " + e.getMessage());
        }
    }

    /**
     * String overload retained for backwards compatibility with tests/callers
     * that still pass a decoded payload. Webhooks should prefer the byte[]
     * overload to preserve byte-exact signature matching.
     */
    @Override
    public boolean verifyWebhook(String signature, String payload) {
        if (signature == null || webhookSecret == null) {
            log.warn("Missing signature or webhook secret for webhook verification");
            return false;
        }
        try {
            Event event = Webhook.constructEvent(payload, signature, webhookSecret);
            log.debug("Webhook verified: {}", event.getType());
            return true;
        } catch (SignatureVerificationException e) {
            log.warn("Webhook signature verification failed");
            return false;
        }
    }

    @Override
    public RefundResult refund(String paymentIntentId, BigDecimal amount) {
        try {
            log.info("Processing refund for payment intent: {} with amount: {}", paymentIntentId, amount);

            long amountInCents = amount.multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValueExact();

            RefundCreateParams params = RefundCreateParams.builder()
                    .setPaymentIntent(paymentIntentId)
                    .setAmount(amountInCents)
                    .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
                    .build();

            Refund refund = Refund.create(params);

            log.info("Refund processed successfully: {}", refund.getId());

            return RefundResult.builder()
                    .refundId(refund.getId())
                    .status(refund.getStatus())
                    .amount(new BigDecimal(refund.getAmount())
                            .divide(new BigDecimal(100), java.math.MathContext.DECIMAL64))
                    .reason(refund.getReason())
                    .build();

        } catch (StripeException e) {
            log.error("Failed to process refund for payment intent: {}", paymentIntentId, e);
            throw new BadRequestException("STRIPE_REFUND_FAILED",
                    "Failed to process refund: " + e.getMessage());
        }
    }
}
