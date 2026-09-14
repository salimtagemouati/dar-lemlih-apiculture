package com.darlemlih.apiculture.repositories;

import com.darlemlih.apiculture.entities.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, Long> {
    Optional<WebhookEvent> findByEventId(String eventId);
    boolean existsByEventId(String eventId);
    long deleteByProcessedTrueAndCreatedAtBefore(LocalDateTime threshold);
}
