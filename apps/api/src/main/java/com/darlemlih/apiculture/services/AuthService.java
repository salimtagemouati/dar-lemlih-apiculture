package com.darlemlih.apiculture.services;

import com.darlemlih.apiculture.dto.auth.*;
import com.darlemlih.apiculture.entities.User;
import com.darlemlih.apiculture.entities.enums.UserRole;
import com.darlemlih.apiculture.repositories.UserRepository;
import com.darlemlih.apiculture.exceptions.ConflictException;
import com.darlemlih.apiculture.exceptions.NotFoundException;
import com.darlemlih.apiculture.exceptions.UnauthorizedException;
import com.darlemlih.apiculture.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("EMAIL_EXISTS", "Email already exists");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(UserRole.CUSTOMER)
                .enabled(true)
                .emailVerified(false)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);
        storeHashedRefreshToken(user, refreshToken);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (Exception e) {
            throw new UnauthorizedException("INVALID_CREDENTIALS", "Invalid email or password");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);
        storeHashedRefreshToken(user, refreshToken);

        return buildAuthResponse(user, accessToken, refreshToken);
    }

    /**
     * Refresh path: identify the user from the JWT subject (email claim), then
     * verify the bearer token matches the BCrypt hash we stored on issue. This
     * keeps refresh tokens hashed at rest while still allowing rotation.
     */
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        String email;
        try {
            email = jwtUtils.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new UnauthorizedException("INVALID_REFRESH_TOKEN", "Invalid refresh token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("INVALID_REFRESH_TOKEN", "Invalid refresh token"));

        String storedHash = user.getRefreshToken();
        if (storedHash == null || !passwordEncoder.matches(refreshToken, storedHash)) {
            throw new UnauthorizedException("INVALID_REFRESH_TOKEN", "Invalid refresh token");
        }

        // Validate JWT signature + expiry before issuing a new pair.
        if (!jwtUtils.validateToken(refreshToken, user)) {
            throw new UnauthorizedException("INVALID_REFRESH_TOKEN", "Invalid refresh token");
        }

        String newAccessToken = jwtUtils.generateAccessToken(user);
        String newRefreshToken = jwtUtils.generateRefreshToken(user);
        storeHashedRefreshToken(user, newRefreshToken);

        return buildAuthResponse(user, newAccessToken, newRefreshToken);
    }

    @Transactional
    public void logout(String email) {
        if (email == null) return;
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("USER_NOT_FOUND", "User not found"));
        return buildUserDto(user);
    }

    /**
     * Always returns silently (caller maps to 200 OK with a generic body).
     * Internally swallows the not-found case to avoid the email-enumeration oracle.
     */
    @Transactional
    public void forgotPassword(String email) {
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                log.debug("forgotPassword for unknown email — no-op");
                return;
            }
            String token = UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(24));
            userRepository.save(user);

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), token);
            } catch (Exception e) {
                log.warn("Password reset email send failed for {}: {}", email, e.getMessage());
            }
        } catch (Exception e) {
            // Never expose internal failures via this endpoint
            log.warn("forgotPassword internal error", e);
        }
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new UnauthorizedException("INVALID_RESET_TOKEN", "Invalid token"));

        if (user.getResetPasswordTokenExpiry() == null
                || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("RESET_TOKEN_EXPIRED", "Token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        // Invalidate any active refresh tokens after a password reset.
        user.setRefreshToken(null);
        userRepository.save(user);
    }

    private void storeHashedRefreshToken(User user, String rawRefreshToken) {
        user.setRefreshToken(passwordEncoder.encode(rawRefreshToken));
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user, String accessToken, String refreshToken) {
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtUtils.getAccessTokenExpirationMillis() / 1000L)
                .user(buildUserDto(user))
                .build();
    }

    private UserDto buildUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .emailVerified(user.getEmailVerified())
                .build();
    }
}
