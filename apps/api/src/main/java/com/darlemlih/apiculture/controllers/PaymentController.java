package com.darlemlih.apiculture.controllers;

import com.darlemlih.apiculture.dto.request.CreatePaymentRequest;
import com.darlemlih.apiculture.dto.response.PaymentSessionResponse;
import com.darlemlih.apiculture.dto.response.RefundResponse;
import com.darlemlih.apiculture.services.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment processing operations")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(summary = "Create payment session",
        description = "Creates a Stripe Checkout session for an order owned by the authenticated user.",
        security = @SecurityRequirement(name = "bearer-jwt"))
    @PostMapping("/create-session")
    public ResponseEntity<PaymentSessionResponse> createPaymentSession(
            @Valid @RequestBody CreatePaymentRequest request,
            @AuthenticationPrincipal UserDetails principal) {
        return ResponseEntity.ok(
                paymentService.createPaymentSession(request, principal.getUsername()));
    }

    @Operation(summary = "Get payment status",
        security = @SecurityRequirement(name = "bearer-jwt"))
    @GetMapping("/status/{sessionId}")
    public ResponseEntity<PaymentSessionResponse> getPaymentStatus(@PathVariable String sessionId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(sessionId));
    }

    @Operation(summary = "Process refund (admin only)",
        security = @SecurityRequirement(name = "bearer-jwt"))
    @PostMapping("/refund/{paymentIntentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RefundResponse> processRefund(
            @PathVariable String paymentIntentId,
            @RequestParam(required = false) String amount) {
        return ResponseEntity.ok(paymentService.processRefund(paymentIntentId, amount));
    }
}
