-- ClubOS Database Schema
-- Complete rewrite for better organization and maintainability

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'secretary');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'treat');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (extends auth.users)
CREATE TABLE users (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username text NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'staff',
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Product categories
CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    CONSTRAINT no_self_reference CHECK (id != parent_id)
);

-- Products/Items
CREATE TABLE products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    description text,
    price decimal(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity integer NOT NULL DEFAULT 0 CHECK (stock_quantity >= -1), -- -1 = unlimited
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    image_url text,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

-- ============================================================================
-- REGISTER & SALES TABLES
-- ============================================================================

-- Register sessions
CREATE TABLE register_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    opened_at timestamptz NOT NULL DEFAULT now(),
    opened_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    closed_at timestamptz,
    closed_by uuid REFERENCES users(id) ON DELETE RESTRICT,
    notes jsonb,
    
    CONSTRAINT valid_session_times CHECK (closed_at IS NULL OR closed_at > opened_at)
);

-- Orders (transactions)
CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES register_sessions(id) ON DELETE CASCADE,
    subtotal decimal(10,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount decimal(10,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_method payment_method NOT NULL,
    card_discounts_applied integer NOT NULL DEFAULT 0 CHECK (card_discounts_applied >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    CONSTRAINT valid_total CHECK (total_amount = subtotal - discount_amount)
);

-- Order items (individual sales)
CREATE TABLE order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
    line_total decimal(10,2) NOT NULL CHECK (line_total >= 0),
    is_treat boolean NOT NULL DEFAULT false,
    is_deleted boolean NOT NULL DEFAULT false,
    deleted_at timestamptz,
    deleted_by uuid REFERENCES users(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT valid_line_total CHECK (line_total = unit_price * quantity),
    CONSTRAINT deletion_consistency CHECK (
        (is_deleted = false AND deleted_at IS NULL AND deleted_by IS NULL) OR
        (is_deleted = true AND deleted_at IS NOT NULL AND deleted_by IS NOT NULL)
    )
);

-- Register closings
CREATE TABLE register_closings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id uuid NOT NULL REFERENCES register_sessions(id) ON DELETE CASCADE,
    cash_sales_count integer NOT NULL DEFAULT 0 CHECK (cash_sales_count >= 0),
    cash_sales_total decimal(10,2) NOT NULL DEFAULT 0 CHECK (cash_sales_total >= 0),
    card_sales_count integer NOT NULL DEFAULT 0 CHECK (card_sales_count >= 0),
    card_sales_total decimal(10,2) NOT NULL DEFAULT 0 CHECK (card_sales_total >= 0),
    treat_count integer NOT NULL DEFAULT 0 CHECK (treat_count >= 0),
    treat_total decimal(10,2) NOT NULL DEFAULT 0 CHECK (treat_total >= 0),
    total_discounts integer NOT NULL DEFAULT 0 CHECK (total_discounts >= 0),
    notes jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT one_closing_per_session UNIQUE (session_id)
);

-- ============================================================================
-- BOOKING TABLES
-- ============================================================================

-- General appointments
CREATE TABLE appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name text NOT NULL,
    contact_info text NOT NULL,
    appointment_date timestamptz NOT NULL,
    num_children integer NOT NULL CHECK (num_children > 0),
    num_adults integer NOT NULL DEFAULT 0 CHECK (num_adults >= 0),
    notes text,
    status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT
);

-- Football field bookings
CREATE TABLE football_bookings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name text NOT NULL,
    contact_info text NOT NULL,
    booking_datetime timestamptz NOT NULL,
    field_number integer NOT NULL CHECK (field_number BETWEEN 1 AND 5),
    num_players integer NOT NULL CHECK (num_players BETWEEN 2 AND 12),
    notes text,
    status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),
    created_at timestamptz NOT NULL DEFAULT now(),
    created_by uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    
    CONSTRAINT unique_field_slot UNIQUE (field_number, booking_datetime)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Category indexes
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = true;

-- Product indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));

-- Register session indexes
CREATE INDEX idx_sessions_open ON register_sessions(opened_at);
CREATE INDEX idx_sessions_active ON register_sessions(closed_at) WHERE closed_at IS NULL;

-- Order indexes
CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_date ON orders(created_at);
CREATE INDEX idx_orders_payment ON orders(payment_method);

-- Order item indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_treats ON order_items(is_treat) WHERE is_treat = true;
CREATE INDEX idx_order_items_active ON order_items(is_deleted) WHERE is_deleted = false;

-- Booking indexes
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_football_datetime ON football_bookings(booking_datetime);
CREATE INDEX idx_football_field ON football_bookings(field_number);
CREATE INDEX idx_football_status ON football_bookings(status);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE register_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE register_closings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE football_bookings ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "users_read" ON users FOR SELECT TO authenticated USING (true);
CREATE POLICY "users_update_own" ON users FOR UPDATE TO authenticated 
    USING (id = auth.uid()) WITH CHECK (id = auth.uid() AND role != 'admin');
CREATE POLICY "users_admin_full" ON users FOR ALL TO authenticated 
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Category policies
CREATE POLICY "categories_read" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "categories_admin_write" ON categories FOR INSERT TO authenticated 
    WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "categories_admin_update" ON categories FOR UPDATE TO authenticated 
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "categories_admin_delete" ON categories FOR DELETE TO authenticated 
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Product policies
CREATE POLICY "products_read" ON products FOR SELECT TO authenticated USING (true);
CREATE POLICY "products_admin_write" ON products FOR INSERT TO authenticated 
    WITH CHECK ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "products_admin_update" ON products FOR UPDATE TO authenticated 
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "products_admin_delete" ON products FOR DELETE TO authenticated 
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Register session policies
CREATE POLICY "sessions_read" ON register_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "sessions_write" ON register_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "sessions_update" ON register_sessions FOR UPDATE TO authenticated USING (true);

-- Order policies
CREATE POLICY "orders_read" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "orders_create_own" ON orders FOR INSERT TO authenticated 
    WITH CHECK (created_by = auth.uid());

-- Order item policies
CREATE POLICY "order_items_read" ON order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "order_items_write" ON order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "order_items_update" ON order_items FOR UPDATE TO authenticated USING (true);

-- Register closing policies
CREATE POLICY "closings_read" ON register_closings FOR SELECT TO authenticated USING (true);
CREATE POLICY "closings_write" ON register_closings FOR INSERT TO authenticated WITH CHECK (true);

-- Appointment policies
CREATE POLICY "appointments_read" ON appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "appointments_write" ON appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "appointments_admin_manage" ON appointments FOR UPDATE TO authenticated 
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "appointments_admin_delete" ON appointments FOR DELETE TO authenticated 
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- Football booking policies
CREATE POLICY "football_read" ON football_bookings FOR SELECT TO authenticated USING (true);
CREATE POLICY "football_write" ON football_bookings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "football_admin_manage" ON football_bookings FOR UPDATE TO authenticated 
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');
CREATE POLICY "football_admin_delete" ON football_bookings FOR DELETE TO authenticated 
    USING ((SELECT role FROM users WHERE id = auth.uid()) = 'admin');

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO users (id, username, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email, 'user_' || NEW.id::text),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'staff')
    );
    RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Triggers for updated_at columns
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to validate stock before sale
CREATE OR REPLACE FUNCTION check_product_stock()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    available_stock integer;
    product_name text;
BEGIN
    -- Get current stock and product name
    SELECT stock_quantity, name INTO available_stock, product_name
    FROM products WHERE id = NEW.product_id;
    
    -- Skip check for unlimited stock (-1)
    IF available_stock = -1 THEN
        RETURN NEW;
    END IF;
    
    -- Check if enough stock available
    IF available_stock < NEW.quantity THEN
        RAISE EXCEPTION 'Insufficient stock for product "%". Available: %, Requested: %', 
            product_name, available_stock, NEW.quantity;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger for stock validation
CREATE TRIGGER validate_stock_before_sale
    BEFORE INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION check_product_stock();

-- Function to update stock after sale
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update stock for non-unlimited items
    UPDATE products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id AND stock_quantity != -1;
    
    RETURN NEW;
END;
$$;

-- Trigger for stock updates
CREATE TRIGGER update_stock_after_sale
    AFTER INSERT ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();

-- Function to close register session
CREATE OR REPLACE FUNCTION close_register_session(
    p_session_id uuid,
    p_notes jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_closing_id uuid;
    v_cash_count integer;
    v_cash_total decimal(10,2);
    v_card_count integer;
    v_card_total decimal(10,2);
    v_treat_count integer;
    v_treat_total decimal(10,2);
    v_total_discounts integer;
BEGIN
    -- Verify session exists and is open
    IF NOT EXISTS (
        SELECT 1 FROM register_sessions 
        WHERE id = p_session_id AND closed_at IS NULL
    ) THEN
        RAISE EXCEPTION 'Register session not found or already closed';
    END IF;
    
    -- Calculate totals
    WITH session_stats AS (
        SELECT 
            COUNT(CASE WHEN o.payment_method = 'cash' THEN 1 END) as cash_orders,
            COALESCE(SUM(CASE WHEN o.payment_method = 'cash' THEN o.total_amount END), 0) as cash_amount,
            COUNT(CASE WHEN o.payment_method = 'card' THEN 1 END) as card_orders,
            COALESCE(SUM(CASE WHEN o.payment_method = 'card' THEN o.total_amount END), 0) as card_amount,
            COALESCE(SUM(
                (SELECT COUNT(*) FROM order_items oi 
                 WHERE oi.order_id = o.id AND oi.is_treat = true AND oi.is_deleted = false)
            ), 0) as treats,
            COALESCE(SUM(
                (SELECT SUM(oi.line_total) FROM order_items oi 
                 WHERE oi.order_id = o.id AND oi.is_treat = true AND oi.is_deleted = false)
            ), 0) as treat_amount,
            COALESCE(SUM(o.card_discounts_applied), 0) as discounts
        FROM orders o
        WHERE o.session_id = p_session_id
    )
    SELECT cash_orders, cash_amount, card_orders, card_amount, treats, treat_amount, discounts
    INTO v_cash_count, v_cash_total, v_card_count, v_card_total, v_treat_count, v_treat_total, v_total_discounts
    FROM session_stats;
    
    -- Create closing record
    INSERT INTO register_closings (
        session_id, cash_sales_count, cash_sales_total, card_sales_count, 
        card_sales_total, treat_count, treat_total, total_discounts, notes
    ) VALUES (
        p_session_id, v_cash_count, v_cash_total, v_card_count,
        v_card_total, v_treat_count, v_treat_total, v_total_discounts, p_notes
    ) RETURNING id INTO v_closing_id;
    
    -- Close the session
    UPDATE register_sessions 
    SET closed_at = now(), closed_by = auth.uid(), notes = p_notes
    WHERE id = p_session_id;
    
    RETURN v_closing_id;
END;
$$;

-- ============================================================================
-- STORAGE SETUP
-- ============================================================================

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images', 
    'product-images', 
    true, 
    5242880, -- 5MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp']
);

-- Storage policies
CREATE POLICY "product_images_read" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'product-images');

CREATE POLICY "product_images_admin_write" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'product-images' AND 
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "product_images_admin_update" ON storage.objects FOR UPDATE TO authenticated
    USING (
        bucket_id = 'product-images' AND 
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

CREATE POLICY "product_images_admin_delete" ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'product-images' AND 
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
    );

-- ============================================================================
-- PERMISSIONS
-- ============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

COMMIT;