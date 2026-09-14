package com.darlemlih.apiculture.services;

import com.darlemlih.apiculture.dto.admin.DashboardDto;
import com.darlemlih.apiculture.entities.enums.OrderStatus;
import com.darlemlih.apiculture.repositories.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public DashboardDto getDashboardStats() {
        return DashboardDto.builder()
                .todaySales(BigDecimal.ZERO) // TODO: aggregate from orders by created_at >= start_of_day
                .weekSales(BigDecimal.ZERO)
                .monthSales(BigDecimal.ZERO)
                .totalOrders(orderRepository.count())
                .pendingOrders(orderRepository.findByStatus(OrderStatus.PENDING, PageRequest.of(0, 1)).getTotalElements())
                .totalCustomers(userRepository.count())
                .totalProducts(productRepository.count())
                .lowStockProducts(0L) // TODO: count products where stock_quantity < threshold
                .topProducts(new ArrayList<>())
                .build();
    }
}
