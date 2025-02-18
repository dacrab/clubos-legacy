-- Begin transaction
BEGIN;

-- Create function to handle user deletion
CREATE OR REPLACE FUNCTION handle_user_deletion(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Delete from profiles first (due to foreign key constraint)
    DELETE FROM profiles WHERE id = user_id;
    
    -- Delete from auth.users
    DELETE FROM auth.users WHERE id = user_id;
END;
$$;

-- Create an API function that can be called with appropriate permissions
CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if the calling user has admin role
    IF NOT EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only administrators can delete users';
    END IF;

    -- Call the actual deletion function
    PERFORM handle_user_deletion(user_id);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user(UUID) TO authenticated;

COMMIT; 