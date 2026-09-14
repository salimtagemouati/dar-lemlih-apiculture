package com.darlemlih.apiculture.repositories;

import com.darlemlih.apiculture.entities.Order;
import com.darlemlih.apiculture.entities.User;
import com.darlemlih.apiculture.entities.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Page<Order> findByUser(User user, Pageable pageable);
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
    Optional<Order> findByPaymentIntentId(String paymentIntentId);
    Optional<Order> findByStripeSessionId(String stripeSessionId);

    /**
     * Loads order with items + product fetch-joined to avoid N+1 when serialising
     * the {@code OrderDto}. Use this from {@code OrderService.getOrder}.
     */
    @Query("SELECT o FROM Order o " +
            "LEFT JOIN FETCH o.items i " +
            "LEFT JOIN FETCH i.product " +
            "WHERE o.orderNumber = :orderNumber")
    Optional<Order> findByOrderNumberWithItems(@Param("orderNumber") String orderNumber);
}
