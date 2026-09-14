package com.darlemlih.apiculture.services;

import com.darlemlih.apiculture.repositories.WebhookEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Periodically purges processed webhook records older than retention threshold (30 days)
 * to avoid unbounded database table growth.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebhookCleanupTask {

    private final WebhookEventRepository webhookEventRepository;
    private static final int RETENTION_DAYS = 30;

    @Scheduled(cron = "0 0 3 * * ?") // Daily at 03:00 AM
    @Transactional
    public void cleanupOldWebhookEvents() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(RETENTION_DAYS);
        try {
            long deletedCount = webhookEventRepository.deleteByProcessedTrueAndCreatedAtBefore(threshold);
            if (deletedCount > 0) {
                log.info("Webhook cleanup purged {} processed webhook events older than {} days", deletedCount, RETENTION_DAYS);
            }
        } catch (Exception e) {
            log.warn("Failed to cleanup old webhook events: {}", e.getMessage());
        }
    }
}
