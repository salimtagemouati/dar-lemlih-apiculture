package com.darlemlih.apiculture.controllers;

import com.darlemlih.apiculture.services.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentWebhookController {

    private final PaymentWebhookService webhookService;

    /**
     * Stripe webhook. Reads the request body as a raw {@code byte[]} so the
     * signature input is byte-exact (no charset round-trip). Returns:
     * <ul>
     *   <li>200 — event accepted (or duplicate, or order unknown for soft-ignore)</li>
     *   <li>400 — invalid signature / malformed payload (Stripe will not retry)</li>
     *   <li>500 — transient handler failure (Stripe will retry)</li>
     * </ul>
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(
            @RequestHeader(value = "Stripe-Signature", required = false) String signature,
            @RequestBody byte[] payload) {
        try {
            webhookService.processWebhook(signature, payload);
            return ResponseEntity.ok("ok");
        } catch (PaymentWebhookService.WebhookSignatureException bad) {
            log.warn("Rejecting webhook: {}", bad.getMessage());
            return ResponseEntity.status(400).body("invalid_signature");
        }
    }
}
