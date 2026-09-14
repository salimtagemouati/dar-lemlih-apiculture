package com.darlemlih.apiculture.security;

import com.darlemlih.apiculture.entities.User;
import com.darlemlih.apiculture.entities.enums.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class JwtUtilsTest {

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    @DisplayName("Generate access and refresh tokens and validate claims")
    void testTokenGenerationAndValidation() {
        User user = User.builder()
                .email("jwt-test@darlemlih.ma")
                .name("JWT Test User")
                .password("hash")
                .role(UserRole.CUSTOMER)
                .enabled(true)
                .build();

        String accessToken = jwtUtils.generateAccessToken(user);
        assertNotNull(accessToken);
        assertEquals("jwt-test@darlemlih.ma", jwtUtils.extractUsername(accessToken));
        assertTrue(jwtUtils.validateToken(accessToken, user));

        String refreshToken = jwtUtils.generateRefreshToken(user);
        assertNotNull(refreshToken);
        assertEquals("jwt-test@darlemlih.ma", jwtUtils.extractUsername(refreshToken));
        assertTrue(jwtUtils.validateToken(refreshToken, user));

        assertTrue(jwtUtils.getAccessTokenExpirationMillis() > 0);
        assertTrue(jwtUtils.getRefreshTokenExpirationMillis() > jwtUtils.getAccessTokenExpirationMillis());
    }
}
