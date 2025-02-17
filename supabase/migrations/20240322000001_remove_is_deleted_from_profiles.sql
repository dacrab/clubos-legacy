-- Drop the RLS policy first
DROP POLICY IF EXISTS "Profiles are viewable by everyone except deleted ones" ON profiles;

-- Remove is_deleted column from profiles table
ALTER TABLE profiles DROP COLUMN IF EXISTS is_deleted; 