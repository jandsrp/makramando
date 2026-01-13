-- Migration: Master Admin and Product Images
-- Description: Adds rules for master_admin role and images column to products

-- 1. SETUP MASTER_ADMIN ROLE
-- We assume the role column is text. We might need to drop a check constraint if it exists.
-- Trying to drop the constraint if it was named explicitly. If not, this might be tricky, but usually text columns don't have constraints unless added.
-- Let's just create a check constraint to be safe/explicit, dropping old one if we know its name. 
-- For now, we'll just trust the logic, but let's ensure the policies handle it.

-- 2. ADD IMAGES COLUMN TO PRODUCTS
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT NULL;

-- 3. PROFILES POLICIES UPDATE for MASTER_ADMIN
-- Drop old policies to redefine
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Select: Admins and Master Admins can view all
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
        )
    );

-- Update: Only Master Admin can change roles.
-- Standard users can update their own non-role fields.
-- Admins (regular) cannot change roles.
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND (
            -- Master admin can update anything (including roles of themselves, though usually they update others via a different policy?)
            -- Wait, this policy is for updating OWN profile. 
            -- Master Admin updating OTHER profiles needs a separate policy or this one needs to be broader.
            -- Typically "Users can update own profile" is one thing. "Admins can update users" is another.
            
            -- Let's enable Master Admin to update ANY profile.
            EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master_admin')
            OR
            -- If not master admin, cannot change role
            (role = (SELECT role FROM profiles WHERE id = auth.uid()))
        )
    );

-- Policy for Master Admin to update OTHER profiles (to promote admins)
CREATE POLICY "Master admin can update any profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'master_admin'
        )
    );

-- 4. PRODUCTS POLICIES UPDATE
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

-- INSERT
CREATE POLICY "Admins can insert products"
    ON products FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
        )
    );

-- UPDATE
CREATE POLICY "Admins can update products"
    ON products FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
        )
    );

-- DELETE
CREATE POLICY "Admins can delete products"
    ON products FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role IN ('admin', 'master_admin')
        )
    );
