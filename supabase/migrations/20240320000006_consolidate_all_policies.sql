-- Begin transaction
BEGIN;

-- Drop all existing policies
DO $$ 
BEGIN
  -- Drop products policies
  DROP POLICY IF EXISTS "Products are viewable by authenticated users" ON products;
  DROP POLICY IF EXISTS "Only admins can manage products" ON products;
  DROP POLICY IF EXISTS "Staff can update stock" ON products;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON products;
  DROP POLICY IF EXISTS "Enable insert for admin users" ON products;
  DROP POLICY IF EXISTS "Enable update for admin users" ON products;

  -- Drop sale_items policies
  DROP POLICY IF EXISTS "Sale items are viewable by staff and admin" ON sale_items;
  DROP POLICY IF EXISTS "Staff and admin can insert sale items" ON sale_items;
  DROP POLICY IF EXISTS "Staff and admin can update sale items" ON sale_items;
  DROP POLICY IF EXISTS "Staff and admin can delete sale items" ON sale_items;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sale_items;
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sale_items;
  DROP POLICY IF EXISTS "Enable update for authenticated users" ON sale_items;

  -- Drop sales policies
  DROP POLICY IF EXISTS "Sales are viewable by staff and admin" ON sales;
  DROP POLICY IF EXISTS "Staff and admin can insert sales" ON sales;
  DROP POLICY IF EXISTS "Staff and admin can update sales" ON sales;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON sales;
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON sales;
  DROP POLICY IF EXISTS "Enable update for authenticated users" ON sales;

  -- Drop registers policies
  DROP POLICY IF EXISTS "Registers are viewable by staff and admin" ON registers;
  DROP POLICY IF EXISTS "Staff and admin can insert registers" ON registers;
  DROP POLICY IF EXISTS "Staff and admin can update registers" ON registers;
  DROP POLICY IF EXISTS "Staff can update closed_by_name" ON registers;

  -- Drop profiles policies
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

  -- Drop appointments policies
  DROP POLICY IF EXISTS "Appointments are viewable by secretary and admin" ON appointments;
  DROP POLICY IF EXISTS "Secretary and admin can manage appointments" ON appointments;
END $$;

-- Ensure RLS is enabled on all tables
ALTER TABLE products FORCE ROW LEVEL SECURITY;
ALTER TABLE sale_items FORCE ROW LEVEL SECURITY;
ALTER TABLE sales FORCE ROW LEVEL SECURITY;
ALTER TABLE registers FORCE ROW LEVEL SECURITY;
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;

-- Grant necessary privileges
GRANT ALL PRIVILEGES ON TABLE products TO service_role;

-- Create profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create products policies
CREATE POLICY "Products are viewable by authenticated users"
  ON products FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can manage products"
  ON products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Staff can update stock"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Create sale_items policies
CREATE POLICY "Sale items are viewable by staff and admin"
  ON sale_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff and admin can insert sale items"
  ON sale_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff and admin can update sale items"
  ON sale_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff and admin can delete sale items"
  ON sale_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Create sales policies
CREATE POLICY "Sales are viewable by staff and admin"
  ON sales FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff and admin can insert sales"
  ON sales FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff and admin can update sales"
  ON sales FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

-- Create registers policies
CREATE POLICY "Registers are viewable by staff and admin"
  ON registers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff and admin can insert registers"
  ON registers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff and admin can update registers"
  ON registers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can update closed_by_name"
  ON registers FOR UPDATE
  USING (auth.uid() = closed_by)
  WITH CHECK (auth.uid() = closed_by);

-- Create appointments policies
CREATE POLICY "Appointments are viewable by secretary and admin"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'secretary')
    )
  );

CREATE POLICY "Secretary and admin can manage appointments"
  ON appointments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'secretary')
    )
  );

COMMIT; 