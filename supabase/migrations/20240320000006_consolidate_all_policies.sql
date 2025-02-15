-- Enable RLS on sale_items table
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Policy for admin users to do everything with sale_items
CREATE POLICY "Admins can do everything with sale_items"
ON sale_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy for staff to read all sale_items
CREATE POLICY "Staff can read all sale_items"
ON sale_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
);

-- Policy for staff to update sale_items within 5 minutes
CREATE POLICY "Staff can update recent sale_items"
ON sale_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
  AND 
  EXTRACT(EPOCH FROM (NOW() - created_at)) <= 300
);

-- Policy for staff to delete sale_items within 5 minutes
CREATE POLICY "Staff can delete recent sale_items"
ON sale_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'staff'
  )
  AND 
  EXTRACT(EPOCH FROM (NOW() - created_at)) <= 300
);

-- Grant necessary permissions to authenticated users
GRANT SELECT, UPDATE, DELETE ON sale_items TO authenticated; 