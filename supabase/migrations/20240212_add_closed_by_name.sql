-- Add closed_by_name column to registers table
ALTER TABLE registers
ADD COLUMN closed_by_name TEXT;

-- Update RLS policies to allow updating the closed_by_name column
CREATE POLICY "Staff can update closed_by_name"
ON registers
FOR UPDATE
USING (auth.uid() = closed_by)
WITH CHECK (auth.uid() = closed_by); 