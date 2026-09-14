package com.darlemlih.apiculture.entities;

import com.darlemlih.apiculture.entities.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String orderNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @lombok.Builder.Default
    private OrderStatus status = OrderStatus.PENDING;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal shippingCost;
    
    @Column(precision = 10, scale = 2)
    @lombok.Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    @Column(nullable = false)
    @lombok.Builder.Default
    private String currency = "MAD";
    
    private String paymentProvider;
    
    private String paymentIntentId;

    /**
     * Stripe Checkout Session id (`cs_...`). Captured at session creation so the
     * `checkout.session.completed` webhook can look up the order before the
     * payment_intent id is even known.
     */
    private String stripeSessionId;
    
    private String trackingNumber;
    
    @Embedded
    private ShippingAddress shippingAddress;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @lombok.Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
