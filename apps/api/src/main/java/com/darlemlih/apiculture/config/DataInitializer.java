package com.darlemlih.apiculture.config;

import com.darlemlih.apiculture.entities.User;
import com.darlemlih.apiculture.entities.enums.UserRole;
import com.darlemlih.apiculture.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds development user accounts so the dev environment has a working admin/customer login.
 *
 * <p>Profile-restricted to {@code dev} and {@code portfolio} so it never runs in production. Passwords are
 * generated at runtime with the {@link PasswordEncoder} (no hardcoded BCrypt hashes
 * in source control) and the default password is sourced from the {@code SEED_DEFAULT_PASSWORD}
 * environment variable, falling back to a development-only default.
 */
@Component
@Profile("dev | portfolio")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final String DEV_DEFAULT_PASSWORD = "ChangeMe!2025";
    private static final String ADMIN_EMAIL = "admin@darlemlih.ma";
    private static final String CUSTOMER_EMAIL = "customer@darlemlih.ma";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String seedPassword = resolveSeedPassword();

        ensureUser(ADMIN_EMAIL, "Admin User", "+212600000001", UserRole.ADMIN, seedPassword);
        ensureUser(CUSTOMER_EMAIL, "Customer User", "+212600000002", UserRole.CUSTOMER, seedPassword);

        log.info("DataInitializer (dev profile) ran. Default seed credentials available for the dev database.");
    }

    private void ensureUser(String email, String name, String phone, UserRole role, String rawPassword) {
        userRepository.findByEmail(email).ifPresentOrElse(
                existing -> log.debug("Dev user already present: {}", email),
                () -> {
                    User user = User.builder()
                            .name(name)
                            .email(email)
                            .password(passwordEncoder.encode(rawPassword))
                            .phone(phone)
                            .role(role)
                            .enabled(true)
                            .emailVerified(true)
                            .build();
                    userRepository.save(user);
                    log.info("Created dev user {} with role {}", email, role);
                });
    }

    private String resolveSeedPassword() {
        String env = System.getenv("SEED_DEFAULT_PASSWORD");
        if (env != null && !env.isBlank()) {
            return env;
        }
        log.warn("SEED_DEFAULT_PASSWORD env var not set; using dev default. DO NOT use in production.");
        return DEV_DEFAULT_PASSWORD;
    }
}
