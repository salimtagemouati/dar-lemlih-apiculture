package com.darlemlih.apiculture.services;

import com.darlemlih.apiculture.dto.order.CheckoutRequest;
import com.darlemlih.apiculture.dto.order.CheckoutResponse;
import com.darlemlih.apiculture.dto.order.OrderDto;
import com.darlemlih.apiculture.dto.order.ShippingAddressDto;
import com.darlemlih.apiculture.entities.*;
import com.darlemlih.apiculture.entities.enums.OrderStatus;
import com.darlemlih.apiculture.entities.enums.UserRole;
import com.darlemlih.apiculture.exceptions.BadRequestException;
import com.darlemlih.apiculture.exceptions.UnauthorizedException;
import com.darlemlih.apiculture.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OrderServiceTest {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private OrderRepository orderRepository;

    private User testUser;
    private User otherUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .name("Order User")
                .email("order-user@darlemlih.ma")
                .password("hash")
                .role(UserRole.CUSTOMER)
                .enabled(true)
                .build());

        otherUser = userRepository.save(User.builder()
                .name("Other User")
                .email("other-user@darlemlih.ma")
                .password("hash")
                .role(UserRole.CUSTOMER)
                .enabled(true)
                .build());

        Category category = categoryRepository.save(Category.builder()
                .slug("test-miels")
                .nameFr("Miels")
                .nameEn("Honeys")
                .nameAr("عسل")
                .isActive(true)
                .build());

        testProduct = productRepository.save(Product.builder()
                .sku("TEST-HNY-1")
                .slug("test-honey-1")
                .nameFr("Miel Test 1")
                .nameEn("Test Honey 1")
                .nameAr("عسل تجريبي 1")
                .price(new BigDecimal("100.00"))
                .currency("MAD")
                .stockQuantity(10)
                .category(category)
                .isActive(true)
                .images(new ArrayList<>(List.of("https://example.com/img.jpg")))
                .build());
    }

    @Test
    @DisplayName("Cannot access another customer's order by order number (IDOR prevention)")
    void testGetOrderUnauthorizedAccess() {
        Order order = orderRepository.save(Order.builder()
                .orderNumber("ORD-2026-TEST0001")
                .user(otherUser)
                .status(OrderStatus.PENDING)
                .subtotal(new BigDecimal("100.00"))
                .shippingCost(new BigDecimal("30.00"))
                .total(new BigDecimal("130.00"))
                .currency("MAD")
                .items(new ArrayList<>())
                .build());

        assertThrows(UnauthorizedException.class, () -> {
            orderService.getOrder(testUser.getEmail(), order.getOrderNumber());
        });
    }

    @Test
    @DisplayName("Checkout fails on empty cart")
    void testCheckoutEmptyCart() {
        CheckoutRequest req = new CheckoutRequest();
        req.setPaymentMethod("card");
        req.setShippingAddress(ShippingAddressDto.builder()
                .name("Test User")
                .phone("+212600000000")
                .line1("123 Rue Atlas")
                .city("Casablanca")
                .region("Casablanca-Settat")
                .postalCode("20000")
                .country("Morocco")
                .build());

        assertThrows(BadRequestException.class, () -> {
            orderService.checkout(testUser.getEmail(), req);
        });
    }

    @Test
    @DisplayName("Successful checkout creates order, decrements stock, and returns checkout response")
    void testSuccessfulCheckout() {
        Cart cart = Cart.builder()
                .user(testUser)
                .items(new ArrayList<>())
                .build();
        cart = cartRepository.save(cart);

        CartItem item = CartItem.builder()
                .cart(cart)
                .product(testProduct)
                .quantity(2)
                .build();
        cart.getItems().add(item);
        cartRepository.save(cart);

        CheckoutRequest req = new CheckoutRequest();
        req.setPaymentMethod("card");
        req.setShippingAddress(ShippingAddressDto.builder()
                .name("Test User")
                .phone("+212600000000")
                .line1("123 Rue Atlas")
                .city("Casablanca")
                .region("Casablanca-Settat")
                .postalCode("20000")
                .country("Morocco")
                .build());

        CheckoutResponse resp = orderService.checkout(testUser.getEmail(), req);

        assertNotNull(resp);
        assertNotNull(resp.getOrderNumber());
        assertEquals("pending", resp.getStatus());

        Product updatedProduct = productRepository.findById(testProduct.getId()).orElseThrow();
        assertEquals(8, updatedProduct.getStockQuantity());
    }
}
