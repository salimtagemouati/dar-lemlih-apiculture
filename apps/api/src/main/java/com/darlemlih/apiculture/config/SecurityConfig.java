package com.darlemlih.apiculture.config;

import com.darlemlih.apiculture.security.JwtAuthenticationFilter;
import com.darlemlih.apiculture.config.properties.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.darlemlih.apiculture.security.RateLimitFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;
    private final AppProperties appProperties;
    private final RateLimitFilter rateLimitFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/").permitAll()
            // Public auth endpoints
            .requestMatchers("/api/auth/login", "/api/auth/register",
                             "/api/auth/refresh", "/api/auth/forgot-password",
                             "/api/auth/reset-password").permitAll()
            // /api/auth/me and /api/auth/logout require an authenticated user
            .requestMatchers("/api/auth/me", "/api/auth/logout").authenticated()
            .requestMatchers("/api/products/**").permitAll()
            .requestMatchers("/api/categories/**").permitAll()
            .requestMatchers("/api/contact").permitAll()
            .requestMatchers("/api/payments/webhook").permitAll()
            // Health and actuator endpoints
            .requestMatchers("/actuator/health").permitAll()
            .requestMatchers("/actuator/health/**").permitAll()
            // Swagger / OpenAPI
            .requestMatchers("/swagger-ui.html").permitAll()
            .requestMatchers("/swagger-ui/**").permitAll()
            .requestMatchers("/v3/api-docs/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        if (appProperties.getCors().getAllowedOrigins() != null) {
            configuration.setAllowedOrigins(appProperties.getCors().getAllowedOrigins());
        }
        if (appProperties.getCors().getAllowedMethods() != null) {
            configuration.setAllowedMethods(Arrays.asList(appProperties.getCors().getAllowedMethods().split(",")));
        }
        configuration.setAllowedHeaders(appProperties.getCors().getAllowedHeaders() == null ? Arrays.asList("*") : Arrays.asList(appProperties.getCors().getAllowedHeaders().split(",")));
        configuration.setAllowCredentials(Boolean.TRUE.equals(appProperties.getCors().getAllowCredentials()));
        configuration.setMaxAge(appProperties.getCors().getMaxAge());
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
