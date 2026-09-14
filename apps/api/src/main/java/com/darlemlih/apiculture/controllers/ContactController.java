package com.darlemlih.apiculture.controllers;

import com.darlemlih.apiculture.dto.contact.ContactRequest;
import com.darlemlih.apiculture.services.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Public contact form endpoint. Validates the payload and forwards it to the
 * configured admin mailbox via {@link EmailService}. Rate limited via the
 * existing {@code RateLimitFilter} (matches /api/auth/* + /api/cart/* today;
 * adding /api/contact to the limited paths is a follow-up).
 */
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    @Value("${app.mail.admin:${app.email.admin:}}")
    private String adminEmail;

    @PostMapping
    public ResponseEntity<Map<String, String>> submit(@Valid @RequestBody ContactRequest request) {
        emailService.sendContactMessage(
                request.getName(),
                request.getEmail(),
                request.getSubject(),
                request.getMessage(),
                adminEmail
        );
        return ResponseEntity.ok(Map.of("message", "Message reçu — nous vous répondrons sous peu."));
    }
}
