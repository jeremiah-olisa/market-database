-- Fix missing columns in customer_profiles table
-- This migration adds the missing satisfaction_score and tenure_months columns
-- that are referenced in constraints and seeders but were not created in the original table

-- Add missing columns to customer_profiles table
ALTER TABLE customer_profiles 
ADD COLUMN satisfaction_score DECIMAL(3,2) CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
ADD COLUMN tenure_months INTEGER CHECK (tenure_months >= 0);





-- Update the existing constraint to use the newly added column
-- (The constraint was already defined in the data-validation-constraints migration)

-- Analyze the updated table
ANALYZE customer_profiles;
ANALYZE usage_patterns;
