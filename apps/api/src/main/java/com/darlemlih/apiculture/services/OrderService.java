package com.darlemlih.apiculture.services;

import com.darlemlih.apiculture.dto.order.*;
import com.darlemlih.apiculture.entities.*;
import com.darlemlih.apiculture.entities.enums.OrderStatus;
import com.darlemlih.apiculture.exceptions.BadRequestException;
import com.darlemlih.apiculture.exceptions.ConflictException;
import com.darlemlih.apiculture.exceptions.NotFoundException;
import com.darlemlih.apiculture.exceptions.UnauthorizedException;
import com.darlemlih.apiculture.payments.PaymentGateway;
import com.darlemlih.apiculture.payments.PaymentSession;
import com.darlemlih.apiculture.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    @org.springframework.beans.factory.annotation.Autowired
    @org.springframework.context.annotation.Lazy
    private OrderService self;

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final PaymentGateway paymentGateway;
    private final EmailService emailService;

    @Value("${app.web-base-url}")
    private String webBaseUrl;

    @Value("${payment.stripe.success-url:${app.web-base-url}/checkout/success}")
    private String successUrlBase;

    @Value("${payment.stripe.cancel-url:${app.web-base-url}/checkout/cancel}")
    private String cancelUrlBase;

    @Value("${app.email.admin:${app.mail.admin:}}")
    private String adminEmail;

    @Value("${app.shipping-cost:30.00}")
    private BigDecimal shippingCost;

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int MAX_ORDER_NUMBER_RETRIES = 5;

    @Transactional(readOnly = true)
    public Page<OrderDto> getUserOrders(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));
        return orderRepository.findByUser(user, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public OrderDto getOrder(String userEmail, String orderNumber) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));

        Order order = orderRepository.findByOrderNumberWithItems(orderNumber)
                .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", "Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            // 403, not 500. Use NotFoundException to also avoid leaking that the order exists.
            throw new UnauthorizedException("ORDER_FORBIDDEN", "You do not have access to this order");
        }
        return toDto(order);
    }

    public CheckoutResponse checkout(String userEmail, CheckoutRequest request) {
        OptimisticLockingFailureException lastError = null;
        for (int attempt = 0; attempt < 3; attempt++) {
            try {
                return self.performCheckout(userEmail, request);
            } catch (OptimisticLockingFailureException e) {
                lastError = e;
                log.debug("Optimistic-lock conflict on checkout (attempt {}): {}", attempt + 1, e.getMessage());
                try { Thread.sleep(50); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); break; }
            }
        }
        throw new ConflictException("STOCK_CONFLICT",
                "Could not finalize the order — stock changed during checkout. Please retry. (" +
                        (lastError != null ? lastError.getMessage() : "unknown") + ")");
    }

    @Transactional
    public CheckoutResponse performCheckout(String userEmail, CheckoutRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("CART_EMPTY", "Cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("CART_EMPTY", "Cart is empty");
        }

        // Call persistOrder directly (no inner retry loop)
        Order order = persistOrder(user, cart, request);

        // Build per-order success/cancel URLs so the frontend can show the
        // confirmation for the right order.
        String orderQuery = "?order=" + java.net.URLEncoder.encode(order.getOrderNumber(), java.nio.charset.StandardCharsets.UTF_8);
        String successUrl = successUrlBase + (successUrlBase.contains("?") ? "&" : "") + orderQuery.substring(1);
        String cancelUrl = cancelUrlBase;

        // Create payment session with stripe_session_id captured.
        PaymentSession session = paymentGateway.createCheckoutSession(
                order.getOrderNumber(),
                order.getTotal(),
                order.getCurrency(),
                successUrl,
                cancelUrl
        );

        order.setStripeSessionId(session.getSessionId());
        if (session.getPaymentIntentId() != null) {
            order.setPaymentIntentId(session.getPaymentIntentId());
        }
        orderRepository.save(order);

        // Clear cart with custom JPQL bulk delete to prevent N+1 query amplification
        cartRepository.clearCartItems(cart.getId());
        cart.getItems().clear();

        // Order confirmation is sent by the webhook handler when payment succeeds, NOT here.
        // Admin notification of "new (pending) order" is fine to send synchronously.
        try {
            String totalSummary = order.getTotal() + " " + order.getCurrency();
            emailService.sendNewOrderAdminNotification(order.getOrderNumber(), user.getEmail(), totalSummary, adminEmail);
        } catch (Exception e) {
            log.warn("Admin notification failed for order {}: {}", order.getOrderNumber(), e.getMessage());
        }

        return CheckoutResponse.builder()
                .orderNumber(order.getOrderNumber())
                .paymentUrl(session.getCheckoutUrl())
                .sessionId(session.getSessionId())
                .status("pending")
                .build();
    }

    private Order persistOrder(User user, Cart cart, CheckoutRequest request) {
        // Re-read each cart product fresh and check stock atomically with the version field.
        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new NotFoundException("PRODUCT_NOT_FOUND",
                            "Product not found: " + item.getProduct().getId()));
            if (product.getStockQuantity() < item.getQuantity()) {
                throw new ConflictException("INSUFFICIENT_STOCK",
                        "Insufficient stock for product: " + product.getNameFr());
            }
        }

        BigDecimal subtotal = cart.getTotal();
        BigDecimal total = subtotal.add(shippingCost);

        ShippingAddressDto src = request.getShippingAddress();
        ShippingAddress shippingAddress = ShippingAddress.builder()
                .name(src.getName())
                .phone(src.getPhone())
                .line1(src.getLine1())
                .line2(src.getLine2())
                .city(src.getCity())
                .region(src.getRegion())
                .postalCode(src.getPostalCode())
                .country(src.getCountry())
                .build();

        // Generate a unique order number with retry on collision (DB unique constraint).
        Order order = null;
        DataIntegrityViolationException lastConflict = null;
        for (int i = 0; i < MAX_ORDER_NUMBER_RETRIES; i++) {
            Order candidate = Order.builder()
                    .orderNumber(generateOrderNumber())
                    .user(user)
                    .status(OrderStatus.PENDING)
                    .subtotal(subtotal)
                    .shippingCost(shippingCost)
                    .discount(BigDecimal.ZERO)
                    .total(total)
                    .currency("MAD")
                    .paymentProvider(request.getPaymentMethod())
                    .shippingAddress(shippingAddress)
                    .notes(request.getNotes())
                    .items(new java.util.ArrayList<>())
                    .build();
            try {
                order = orderRepository.saveAndFlush(candidate);
                break;
            } catch (DataIntegrityViolationException e) {
                lastConflict = e;
                log.debug("Order number collision, retrying (attempt {})", i + 1);
            }
        }
        if (order == null) {
            throw new ConflictException("ORDER_NUMBER_COLLISION",
                    "Could not generate a unique order number after " + MAX_ORDER_NUMBER_RETRIES + " attempts. ("
                            + (lastConflict != null ? lastConflict.getMessage() : "unknown") + ")");
        }

        // Create order items + decrement product stock with optimistic locking.
        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new NotFoundException("PRODUCT_NOT_FOUND", "Product no longer exists"));

            int newStock = product.getStockQuantity() - cartItem.getQuantity();
            if (newStock < 0) {
                // Another transaction got there first; surface as a conflict.
                throw new ConflictException("INSUFFICIENT_STOCK",
                        "Insufficient stock for product: " + product.getNameFr());
            }
            product.setStockQuantity(newStock);
            productRepository.saveAndFlush(product); // triggers @Version check

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getPrice())
                    .totalPrice(product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity())))
                    .build();
            order.getItems().add(orderItem);
        }
        return orderRepository.save(order);
    }

    /**
     * Generates an order number of the form ORD-YYYY-XXXXXXXX, using a SecureRandom-backed
     * 8-char Crockford-style suffix. Combined with a unique constraint + retry on
     * collision, this gives effectively zero collisions in practice.
     */
    private String generateOrderNumber() {
        int year = java.time.LocalDate.now().getYear();
        // 8 hex chars from a random 32-bit value -> 4 billion possible suffixes per year
        int suffix = RANDOM.nextInt() & 0x7FFFFFFF;
        // Mix in a UUID-derived nibble so two threads sharing the same RNG state diverge
        long mix = UUID.randomUUID().getLeastSignificantBits();
        long combined = ((long) suffix << 4) ^ (mix & 0xF);
        return String.format("ORD-%d-%08X", year, (int) (combined & 0xFFFFFFFFL));
    }

    private OrderDto toDto(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .status(order.getStatus())
                .subtotal(order.getSubtotal())
                .shippingCost(order.getShippingCost())
                .discount(order.getDiscount())
                .total(order.getTotal())
                .currency(order.getCurrency())
                .paymentProvider(order.getPaymentProvider())
                .trackingNumber(order.getTrackingNumber())
                .shippingAddress(toShippingDto(order.getShippingAddress()))
                .items(order.getItems().stream()
                        .map(this::toItemDto)
                        .collect(Collectors.toList()))
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private ShippingAddressDto toShippingDto(ShippingAddress address) {
        if (address == null) return null;
        return ShippingAddressDto.builder()
                .name(address.getName())
                .phone(address.getPhone())
                .line1(address.getLine1())
                .line2(address.getLine2())
                .city(address.getCity())
                .region(address.getRegion())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .build();
    }

    private OrderItemDto toItemDto(OrderItem item) {
        return OrderItemDto.builder()
                .id(item.getId())
                .productId(item.getProduct().getId())
                .productName(item.getProduct().getNameFr())
                .productSku(item.getProduct().getSku())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }
}
