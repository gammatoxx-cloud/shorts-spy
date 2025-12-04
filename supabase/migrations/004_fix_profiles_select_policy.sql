-- Fix profiles SELECT policy to allow all authenticated users to view profiles
-- This is necessary because:
-- 1. Profile data is public information
-- 2. When creating a new profile via upsert(), Supabase needs to SELECT first
--    to check if the profile exists, which requires SELECT access
-- 3. The previous policy required the user to have scraped the profile first,
--    creating a chicken-and-egg problem

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view profiles they have scraped" ON profiles;

-- Create a new policy that allows all authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

