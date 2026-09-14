package com.darlemlih.apiculture.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static class Counter { long windowStart; int count; }
    private final Map<String, Counter> buckets = new ConcurrentHashMap<>();
    private static final long WINDOW_MS = 60_000; // 1 minute
    private static final int MAX_AUTH = 20;     // per minute
    private static final int MAX_CART = 60;     // per minute
    private static final int MAX_CONTACT = 10;  // per minute
    private static final int MAX_CHECKOUT = 15; // per minute

    /**
     * Eviction counter: every N requests we scan and remove entries that are
     * older than 2 windows. This prevents unbounded memory growth if many
     * unique IPs hit the server (e.g. DDoS, bots).
     */
    private static final int EVICTION_INTERVAL = 100;
    private final java.util.concurrent.atomic.AtomicInteger requestCounter =
            new java.util.concurrent.atomic.AtomicInteger(0);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        String group = resolveGroup(path);
        if (group == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Periodic eviction of stale entries to prevent memory leak
        if (requestCounter.incrementAndGet() % EVICTION_INTERVAL == 0) {
            evictStaleEntries();
        }

        String clientIp = extractClientIp(request);
        String key = clientIp + ":" + group;
        long now = Instant.now().toEpochMilli();
        Counter c = buckets.computeIfAbsent(key, k -> { Counter x = new Counter(); x.windowStart = now; x.count = 0; return x; });
        synchronized (c) {
            if (now - c.windowStart > WINDOW_MS) { c.windowStart = now; c.count = 0; }
            c.count++;
            int limit = resolveLimit(group);
            if (c.count > limit) {
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"rate_limited\"}");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private String extractClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            int commaIdx = forwarded.indexOf(',');
            return (commaIdx != -1) ? forwarded.substring(0, commaIdx).trim() : forwarded.trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return (remoteAddr != null && !remoteAddr.isBlank()) ? remoteAddr : "unknown";
    }

    private String resolveGroup(String path) {
        if (path.startsWith("/api/auth/")) return "auth";
        if (path.equals("/api/orders/checkout")) return "checkout";
        if (path.startsWith("/api/cart/") || path.equals("/api/cart")) return "cart";
        if (path.startsWith("/api/contact")) return "contact";
        return null;
    }

    private int resolveLimit(String group) {
        return switch (group) {
            case "auth"     -> MAX_AUTH;
            case "cart"     -> MAX_CART;
            case "contact"  -> MAX_CONTACT;
            case "checkout" -> MAX_CHECKOUT;
            default         -> MAX_CART;
        };
    }

    private void evictStaleEntries() {
        long now = Instant.now().toEpochMilli();
        long staleThreshold = 2 * WINDOW_MS;
        buckets.entrySet().removeIf(entry -> {
            Counter c = entry.getValue();
            synchronized (c) {
                return (now - c.windowStart) > staleThreshold;
            }
        });
    }
}

