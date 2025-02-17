-- Add is_deleted column to profiles table
ALTER TABLE profiles
ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;

-- Update RLS policies to exclude deleted profiles
CREATE POLICY "Profiles are viewable by everyone except deleted ones"
ON profiles FOR SELECT
TO authenticated
USING (
  is_deleted = false
); 