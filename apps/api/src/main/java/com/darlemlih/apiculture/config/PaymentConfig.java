package com.darlemlih.apiculture.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.util.Arrays;

/**
 * Validates payment provider configuration at startup. In particular, refuses
 * to boot the application in the {@code prod} profile if {@code payment.provider}
 * is set to {@code mock} (which would silently approve any webhook signature).
 */
@Configuration
@Slf4j
public class PaymentConfig {

    private final Environment environment;

    @Value("${payment.provider:}")
    private String provider;

    public PaymentConfig(Environment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void validate() {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");
        if (isProd && "mock".equalsIgnoreCase(provider)) {
            throw new IllegalStateException(
                    "FATAL: payment.provider=mock is not allowed in the 'prod' profile. " +
                    "Set payment.provider=stripe and configure STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET.");
        }
        log.info("Payment provider configured: provider='{}', activeProfiles={}",
                provider,
                Arrays.toString(environment.getActiveProfiles()));
    }
}
