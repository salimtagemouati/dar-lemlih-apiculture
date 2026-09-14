package com.darlemlih.apiculture.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.web-base-url}")
    private String webBaseUrl;

    @Async("emailExecutor")
    public void sendPasswordResetEmail(String to, String token) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Réinitialisation de votre mot de passe - Dar Lemlih Apiculture");
            message.setText("Bonjour,\n\n" +
                    "Vous avez demandé la réinitialisation de votre mot de passe.\n" +
                    "Cliquez sur le lien suivant pour réinitialiser votre mot de passe:\n" +
                    webBaseUrl + "/reset-password?token=" + token + "\n\n" +
                    "Ce lien expirera dans 24 heures.\n\n" +
                    "Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\n" +
                    "Cordialement,\n" +
                    "L'équipe Dar Lemlih Apiculture");
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }

    @Async("emailExecutor")
    public void sendOrderConfirmationEmail(String to, String orderNumber) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Confirmation de commande #" + orderNumber + " - Dar Lemlih Apiculture");
            message.setText("Bonjour,\n\n" +
                    "Merci pour votre commande!\n\n" +
                    "Votre commande #" + orderNumber + " a été confirmée et sera bientôt expédiée.\n" +
                    "Vous pouvez suivre votre commande sur: " + webBaseUrl + "/orders/" + orderNumber + "\n\n" +
                    "Cordialement,\n" +
                    "L'équipe Dar Lemlih Apiculture");
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send order confirmation email to {}: {}", to, e.getMessage());
        }
    }

    @Async("emailExecutor")
    public void sendNewOrderAdminNotification(String orderNumber, String customerEmail, String totalSummary, String adminEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo((adminEmail != null && !adminEmail.isBlank()) ? adminEmail : fromEmail);
            message.setSubject("[New Order] #" + orderNumber + " - " + customerEmail);
            message.setText("Nouvelle commande reçue\n\n" +
                    "Commande: #" + orderNumber + "\n" +
                    "Client: " + customerEmail + "\n" +
                    "Total: " + totalSummary + "\n\n" +
                    "Dashboard: " + webBaseUrl + "/admin");
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send admin order notification for {}: {}", orderNumber, e.getMessage());
        }
    }

    /**
     * Generic contact-form email. Used by the public /api/contact endpoint.
     */
    @Async("emailExecutor")
    public void sendContactMessage(String fromName, String fromEmailAddr, String subject, String body, String adminEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo((adminEmail != null && !adminEmail.isBlank()) ? adminEmail : fromEmail);
            message.setReplyTo(fromEmailAddr);
            message.setSubject("[Contact] " + subject);
            message.setText("Nouveau message reçu via le formulaire de contact\n\n" +
                    "De: " + fromName + " <" + fromEmailAddr + ">\n\n" +
                    "Message:\n" + body);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send contact form email from {}: {}", fromEmailAddr, e.getMessage());
        }
    }
}
