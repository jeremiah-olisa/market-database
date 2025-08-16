-- Fix missing columns in infrastructure tables
-- This migration adds the missing columns that are referenced in constraints and seeders
-- but were not created in the original table definitions

-- Add missing columns to network_infrastructure table
ALTER TABLE network_infrastructure 
ADD COLUMN current_utilization_percentage DECIMAL(5,2) CHECK (current_utilization_percentage >= 0 AND current_utilization_percentage <= 100),
ADD COLUMN reliability_score DECIMAL(5,2) CHECK (reliability_score >= 0 AND reliability_score <= 100);

-- Add missing columns to capacity_metrics table
-- Note: The table already has utilization_rate, we're adding additional metrics
ALTER TABLE capacity_metrics 
ADD COLUMN peak_utilization DECIMAL(5,2) CHECK (peak_utilization >= 0 AND peak_utilization <= 100),
ADD COLUMN availability_percentage DECIMAL(5,2) CHECK (availability_percentage >= 0 AND availability_percentage <= 100);

-- Add missing columns to usage_patterns table
ALTER TABLE usage_patterns 
ADD COLUMN data_consumption_gb DECIMAL(10,2),
ADD COLUMN service_quality_rating DECIMAL(3,2) CHECK (service_quality_rating >= 1 AND service_quality_rating <= 5);

-- Analyze the updated tables
ANALYZE network_infrastructure;
ANALYZE capacity_metrics;
ANALYZE usage_patterns;
