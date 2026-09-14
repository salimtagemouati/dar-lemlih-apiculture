package com.darlemlih.apiculture.services;

import com.darlemlih.apiculture.entities.*;
import com.darlemlih.apiculture.entities.enums.OrderStatus;
import com.darlemlih.apiculture.entities.enums.UserRole;
import com.darlemlih.apiculture.payments.PaymentGateway;
import com.darlemlih.apiculture.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PaymentWebhookServiceTest {

    @Autowired
    private PaymentWebhookService paymentWebhookService;

    @MockBean
    private PaymentGateway paymentGateway;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private User testUser;
    private Product testProduct;
    private Order testOrder;

    @BeforeEach
    void setUp() {
        when(paymentGateway.verifyWebhook(any(), any())).thenReturn(true);

        testUser = userRepository.save(User.builder()
                .name("Webhook User")
                .email("webhook-user@darlemlih.ma")
                .password("hash")
                .role(UserRole.CUSTOMER)
                .enabled(true)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .slug("webhook-miels")
                .nameFr("Miels")
                .nameEn("Honeys")
                .nameAr("عسل")
                .isActive(true)
                .build());

        testProduct = productRepository.save(Product.builder()
                .sku("WH-HNY-1")
                .slug("wh-honey-1")
                .nameFr("Miel Webhook")
                .nameEn("Webhook Honey")
                .nameAr("عسل تجريبي")
                .price(new BigDecimal("100.00"))
                .currency("MAD")
                .stockQuantity(8)
                .category(category)
                .isActive(true)
                .images(new ArrayList<>(List.of("https://example.com/img.jpg")))
                .build());

        testOrder = orderRepository.save(Order.builder()
                .orderNumber("ORD-2026-WH0001")
                .user(testUser)
                .status(OrderStatus.PENDING)
                .subtotal(new BigDecimal("100.00"))
                .shippingCost(new BigDecimal("30.00"))
                .total(new BigDecimal("130.00"))
                .currency("MAD")
                .stripeSessionId("cs_test_session_123")
                .paymentIntentId("pi_test_intent_123")
                .items(new ArrayList<>())
                .build());

        OrderItem orderItem = OrderItem.builder()
                .order(testOrder)
                .product(testProduct)
                .quantity(2)
                .unitPrice(new BigDecimal("100.00"))
                .totalPrice(new BigDecimal("200.00"))
                .build();
        testOrder.getItems().add(orderItem);
        orderRepository.save(testOrder);
    }

    @Test
    @DisplayName("checkout.session.completed webhook marks order as PAID")
    void testCheckoutSessionCompleted() {
        String payload = """
        {
          "id": "evt_test_checkout_complete_1",
          "type": "checkout.session.completed",
          "data": {
            "object": {
              "id": "cs_test_session_123",
              "payment_intent": "pi_test_intent_123"
            }
          }
        }
        """;

        paymentWebhookService.processWebhook("test_signature", payload.getBytes(StandardCharsets.UTF_8));

        Order order = orderRepository.findByStripeSessionId("cs_test_session_123").orElseThrow();
        assertEquals(OrderStatus.PAID, order.getStatus());
    }

    @Test
    @DisplayName("payment_intent.payment_failed restores stock and marks order CANCELLED")
    void testPaymentFailedRestoresStock() {
        String payload = """
        {
          "id": "evt_test_payment_failed_1",
          "type": "payment_intent.payment_failed",
          "data": {
            "object": {
              "id": "pi_test_intent_123"
            }
          }
        }
        """;

        paymentWebhookService.processWebhook("test_signature", payload.getBytes(StandardCharsets.UTF_8));

        Order order = orderRepository.findByPaymentIntentId("pi_test_intent_123").orElseThrow();
        assertEquals(OrderStatus.CANCELLED, order.getStatus());

        Product product = productRepository.findById(testProduct.getId()).orElseThrow();
        assertEquals(10, product.getStockQuantity());
    }
}
