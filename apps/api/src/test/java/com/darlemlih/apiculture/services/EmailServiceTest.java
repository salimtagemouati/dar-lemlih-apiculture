package com.darlemlih.apiculture.services;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.timeout;
import static org.mockito.Mockito.verify;

@SpringBootTest
@ActiveProfiles("test")
class EmailServiceTest {

    @Autowired
    private EmailService emailService;

    @MockBean
    private JavaMailSender mailSender;

    @Test
    void sendsOrderConfirmation() {
        emailService.sendOrderConfirmationEmail("test@example.com", "ORD-TEST-123");

        // EmailService methods are @Async; wait briefly for the executor to run.
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender, timeout(2000)).send(captor.capture());

        SimpleMailMessage msg = captor.getValue();
        assertThat(msg.getTo()).contains("test@example.com");
        assertThat(msg.getSubject()).contains("ORD-TEST-123");
    }
}
