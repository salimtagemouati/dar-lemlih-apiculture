-- Dev-only seed: addresses + sample paid order tied to the customer user
-- created at runtime by DataInitializer (customer@darlemlih.ma).
--
-- Wrapped in a SELECT to resolve the user id; if the user does not exist yet
-- (e.g. tests that don't run DataInitializer), the inserts are skipped.
-- Note: applied only when SPRING_PROFILES_ACTIVE=dev (Flyway location includes db/migration-dev).

-- Customer addresses (only insert if customer exists)
INSERT INTO addresses (user_id, line1, line2, city, region, postal_code, country, is_default)
SELECT u.id, '123 Rue Mohammed V', 'Appartement 4', 'Casablanca', 'Casablanca-Settat', '20000', 'Morocco', true
FROM users u
WHERE u.email = 'customer@darlemlih.ma'
  AND NOT EXISTS (SELECT 1 FROM addresses a WHERE a.user_id = u.id AND a.line1 = '123 Rue Mohammed V');

INSERT INTO addresses (user_id, line1, line2, city, region, postal_code, country, is_default)
SELECT u.id, '456 Avenue Hassan II', NULL, 'Rabat', 'Rabat-Salé-Kénitra', '10000', 'Morocco', false
FROM users u
WHERE u.email = 'customer@darlemlih.ma'
  AND NOT EXISTS (SELECT 1 FROM addresses a WHERE a.user_id = u.id AND a.line1 = '456 Avenue Hassan II');

-- Sample paid order (idempotent on order_number)
INSERT INTO orders (order_number, user_id, status, subtotal, shipping_cost, discount, total, currency, payment_provider, payment_intent_id, shipping_name, shipping_phone, shipping_line1, shipping_city, shipping_region, shipping_postal_code, shipping_country)
SELECT 'ORD-DEV-000001', u.id, 'PAID', 274.00, 30.00, 0.00, 304.00, 'MAD', 'mock', 'pi_dev_seed', 'Customer User', '+212600000002', '123 Rue Mohammed V', 'Casablanca', 'Casablanca-Settat', '20000', 'Morocco'
FROM users u
WHERE u.email = 'customer@darlemlih.ma'
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_number = 'ORD-DEV-000001');

-- Sample order items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
SELECT o.id, 1, 2, 89.00, 178.00
FROM orders o
WHERE o.order_number = 'ORD-DEV-000001'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = 1);

INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
SELECT o.id, 2, 1, 95.00, 95.00
FROM orders o
WHERE o.order_number = 'ORD-DEV-000001'
  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id AND oi.product_id = 2);
