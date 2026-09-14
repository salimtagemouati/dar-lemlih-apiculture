package com.darlemlih.apiculture.payments;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@Profile("!prod")
@ConditionalOnProperty(name = "payment.provider", havingValue = "mock")
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public PaymentSession createCheckoutSession(String orderId, BigDecimal amount, String currency, String successUrl, String cancelUrl) {
        String separator = successUrl.contains("?") ? "&" : "?";
        return PaymentSession.builder()
                .sessionId("mock_session_" + UUID.randomUUID())
                .paymentIntentId("pi_mock_" + UUID.randomUUID())
                .checkoutUrl(successUrl + separator + "mock=true")
                .status("pending")
                .build();
    }

    @Override
    public boolean verifyWebhook(String signature, String payload) {
        // Belt-and-suspenders: this method must never be called in production.
        // The bean is profile-restricted to !prod, but if it ever is, fail loudly
        // rather than silently approving every webhook.
        throw new UnsupportedOperationException(
                "MockPaymentGateway.verifyWebhook must not be invoked. Configure payment.provider=stripe.");
    }

    @Override
    public RefundResult refund(String paymentIntentId, BigDecimal amount) {
        return RefundResult.builder()
                .refundId("refund_mock_" + UUID.randomUUID())
                .status("succeeded")
                .amount(amount)
                .reason("requested_by_customer")
                .build();
    }
}
