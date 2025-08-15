-- Create financial intelligence tables for revenue analysis and financial metrics
-- This migration adds tables for tracking revenue, costs, and financial performance

-- Revenue tracking table
CREATE TABLE revenue_metrics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    revenue_amount DECIMAL(12,2) NOT NULL CHECK (revenue_amount >= 0),
    revenue_type VARCHAR(50) NOT NULL CHECK (revenue_type IN ('subscription', 'one_time', 'recurring', 'overage')),
    customer_count INTEGER NOT NULL CHECK (customer_count >= 0),
    average_revenue_per_customer DECIMAL(10,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cost and profitability tracking
CREATE TABLE cost_metrics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    cost_category VARCHAR(100) NOT NULL,
    cost_type VARCHAR(50) NOT NULL CHECK (cost_type IN ('operational', 'infrastructure', 'maintenance', 'marketing', 'personnel')),
    amount DECIMAL(12,2) NOT NULL CHECK (amount >= 0),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    cost_allocation_method VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Profitability analysis table
CREATE TABLE profitability_analysis (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    analysis_period VARCHAR(20) NOT NULL CHECK (analysis_period IN ('monthly', 'quarterly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(12,2) NOT NULL,
    total_costs DECIMAL(12,2) NOT NULL,
    gross_profit DECIMAL(12,2) NOT NULL,
    net_profit DECIMAL(12,2) NOT NULL,
    profit_margin_percentage DECIMAL(5,2),
    roi_percentage DECIMAL(5,2),
    breakeven_point DECIMAL(10,2),
    metadata JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for financial intelligence tables
CREATE INDEX idx_revenue_metrics_estate_id ON revenue_metrics(estate_id);
CREATE INDEX idx_revenue_metrics_product_id ON revenue_metrics(product_id);
CREATE INDEX idx_revenue_metrics_period ON revenue_metrics(period_start, period_end);
CREATE INDEX idx_revenue_metrics_type ON revenue_metrics(revenue_type);
CREATE INDEX idx_revenue_metrics_metadata_gin ON revenue_metrics USING GIN(metadata);

CREATE INDEX idx_cost_metrics_estate_id ON cost_metrics(estate_id);
CREATE INDEX idx_cost_metrics_category ON cost_metrics(cost_category);
CREATE INDEX idx_cost_metrics_type ON cost_metrics(cost_type);
CREATE INDEX idx_cost_metrics_period ON cost_metrics(period_start, period_end);
CREATE INDEX idx_cost_metrics_metadata_gin ON cost_metrics USING GIN(metadata);

CREATE INDEX idx_profitability_analysis_estate_id ON profitability_analysis(estate_id);
CREATE INDEX idx_profitability_analysis_period ON profitability_analysis(period_start, period_end);
CREATE INDEX idx_profitability_analysis_type ON profitability_analysis(analysis_period);
CREATE INDEX idx_profitability_analysis_margin ON profitability_analysis(profit_margin_percentage);
CREATE INDEX idx_profitability_analysis_metadata_gin ON profitability_analysis USING GIN(metadata);

-- Add compound indexes for improved query performance
CREATE INDEX idx_revenue_metrics_estate_period ON revenue_metrics(estate_id, period_start, period_end);
CREATE INDEX idx_cost_metrics_estate_category ON cost_metrics(estate_id, cost_category, period_start);
CREATE INDEX idx_profitability_analysis_estate_period_type ON profitability_analysis(estate_id, analysis_period, period_start);

-- Add constraints for data integrity
ALTER TABLE revenue_metrics ADD CONSTRAINT check_period_validity 
    CHECK (period_end > period_start);

ALTER TABLE cost_metrics ADD CONSTRAINT check_cost_period_validity 
    CHECK (period_end > period_start);

ALTER TABLE profitability_analysis ADD CONSTRAINT check_profitability_period_validity 
    CHECK (period_end > period_start);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_financial_tables_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER revenue_metrics_updated_at_trigger
    BEFORE UPDATE ON revenue_metrics
    FOR EACH ROW EXECUTE FUNCTION update_financial_tables_updated_at();

CREATE TRIGGER cost_metrics_updated_at_trigger
    BEFORE UPDATE ON cost_metrics
    FOR EACH ROW EXECUTE FUNCTION update_financial_tables_updated_at();

CREATE TRIGGER profitability_analysis_updated_at_trigger
    BEFORE UPDATE ON profitability_analysis
    FOR EACH ROW EXECUTE FUNCTION update_financial_tables_updated_at();
