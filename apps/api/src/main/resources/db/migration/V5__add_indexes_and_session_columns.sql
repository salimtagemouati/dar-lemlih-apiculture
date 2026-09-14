-- Add stripe_session_id column for webhook lookup (checkout.session.completed)
-- and add indexes / @Version column needed by application code.

ALTER TABLE orders
    ADD COLUMN stripe_session_id VARCHAR(255) NULL AFTER payment_intent_id;

-- Optimistic locking version column for products (used during stock decrement)
ALTER TABLE products
    ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Add indexes for hot lookups (Phase 2.10 also lives here to avoid an extra migration)
CREATE INDEX idx_orders_payment_intent_id ON orders(payment_intent_id);
CREATE INDEX idx_orders_stripe_session_id ON orders(stripe_session_id);
CREATE INDEX idx_users_refresh_token ON users(refresh_token(255));
CREATE INDEX idx_users_reset_token ON users(reset_password_token(255));

-- product_images had no PK; add a surrogate so duplicates are prevented and rows are addressable
ALTER TABLE product_images
    ADD COLUMN id BIGINT AUTO_INCREMENT PRIMARY KEY FIRST;
