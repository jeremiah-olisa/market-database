-- Investment type enum
DO $$ BEGIN
    CREATE TYPE investment_type AS ENUM (
        'infrastructure', 'service_expansion', 'upgrade', 'maintenance', 
        'new_market_entry', 'technology', 'acquisition'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Investment status enum
DO $$ BEGIN
    CREATE TYPE investment_status AS ENUM (
        'planned', 'approved', 'in_progress', 'completed', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create investment planning table
CREATE TABLE IF NOT EXISTS investment_plans (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER REFERENCES estates(id) ON DELETE SET NULL,
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    investment_type investment_type NOT NULL,
    status investment_status NOT NULL DEFAULT 'planned',
    planned_amount DECIMAL(12,2) NOT NULL CHECK (planned_amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    start_date DATE,
    end_date DATE,
    expected_roi DECIMAL(5,2) CHECK (expected_roi > 0),
    payback_period INTEGER CHECK (payback_period > 0), -- in months
    risk_assessment JSONB DEFAULT '{}',
    feasibility_metrics JSONB DEFAULT '{}',
    approval_status JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT investment_plans_currency_check CHECK (length(trim(currency)) = 3),
    CONSTRAINT investment_plans_dates_check CHECK (end_date > start_date),
    CONSTRAINT investment_plans_area_check CHECK (
        (estate_id IS NOT NULL AND area_id IS NULL) OR 
        (estate_id IS NULL AND area_id IS NOT NULL)
    )
);

-- Create capital expenditure tracking
CREATE TABLE IF NOT EXISTS capital_expenditure (
    id SERIAL PRIMARY KEY,
    investment_plan_id INTEGER REFERENCES investment_plans(id) ON DELETE SET NULL,
    expenditure_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    category VARCHAR(100) NOT NULL,
    vendor VARCHAR(255),
    payment_status VARCHAR(50) NOT NULL,
    invoice_reference VARCHAR(100),
    expenditure_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT capital_expenditure_category_check CHECK (length(trim(category)) > 0),
    CONSTRAINT capital_expenditure_currency_check CHECK (length(trim(currency)) = 3),
    CONSTRAINT capital_expenditure_status_check CHECK (length(trim(payment_status)) > 0)
);

-- Create ROI tracking table
CREATE TABLE IF NOT EXISTS roi_tracking (
    id SERIAL PRIMARY KEY,
    investment_plan_id INTEGER REFERENCES investment_plans(id) ON DELETE CASCADE,
    tracking_period DATE NOT NULL,
    actual_revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    actual_costs DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'NGN',
    roi_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN actual_costs > 0 
            THEN ROUND(((actual_revenue - actual_costs) / actual_costs) * 100, 2)
            ELSE 0 
        END
    ) STORED,
    performance_metrics JSONB DEFAULT '{}',
    variance_analysis JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT roi_tracking_unique UNIQUE(investment_plan_id, tracking_period),
    CONSTRAINT roi_tracking_currency_check CHECK (length(trim(currency)) = 3)
);

-- Create investment performance metrics
CREATE TABLE IF NOT EXISTS investment_performance_metrics (
    id SERIAL PRIMARY KEY,
    investment_plan_id INTEGER REFERENCES investment_plans(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    actual_progress INTEGER CHECK (actual_progress BETWEEN 0 AND 100),
    budget_utilization DECIMAL(5,2) CHECK (budget_utilization BETWEEN 0 AND 100),
    quality_score INTEGER CHECK (quality_score BETWEEN 1 AND 100),
    milestone_completion JSONB DEFAULT '{}',
    performance_indicators JSONB DEFAULT '{}',
    risk_indicators JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT investment_performance_unique UNIQUE(investment_plan_id, metric_date)
);

-- Create triggers
CREATE TRIGGER update_investment_plans_updated_at
    BEFORE UPDATE ON investment_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_capital_expenditure_updated_at
    BEFORE UPDATE ON capital_expenditure
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roi_tracking_updated_at
    BEFORE UPDATE ON roi_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_performance_metrics_updated_at
    BEFORE UPDATE ON investment_performance_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_investment_plans_estate ON investment_plans(estate_id);
CREATE INDEX IF NOT EXISTS idx_investment_plans_area ON investment_plans(area_id);
CREATE INDEX IF NOT EXISTS idx_investment_plans_type ON investment_plans(investment_type);
CREATE INDEX IF NOT EXISTS idx_investment_plans_status ON investment_plans(status);
CREATE INDEX IF NOT EXISTS idx_investment_plans_dates ON investment_plans(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_investment_plans_roi ON investment_plans(expected_roi);
CREATE INDEX IF NOT EXISTS idx_investment_plans_risk ON investment_plans USING gin(risk_assessment);
CREATE INDEX IF NOT EXISTS idx_investment_plans_metrics ON investment_plans USING gin(feasibility_metrics);

CREATE INDEX IF NOT EXISTS idx_capital_expenditure_plan ON capital_expenditure(investment_plan_id);
CREATE INDEX IF NOT EXISTS idx_capital_expenditure_date ON capital_expenditure(expenditure_date);
CREATE INDEX IF NOT EXISTS idx_capital_expenditure_category ON capital_expenditure(category);
CREATE INDEX IF NOT EXISTS idx_capital_expenditure_status ON capital_expenditure(payment_status);
CREATE INDEX IF NOT EXISTS idx_capital_expenditure_details ON capital_expenditure USING gin(expenditure_details);

CREATE INDEX IF NOT EXISTS idx_roi_tracking_plan ON roi_tracking(investment_plan_id);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_period ON roi_tracking(tracking_period);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_roi ON roi_tracking(roi_percentage);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_metrics ON roi_tracking USING gin(performance_metrics);
CREATE INDEX IF NOT EXISTS idx_roi_tracking_variance ON roi_tracking USING gin(variance_analysis);

CREATE INDEX IF NOT EXISTS idx_investment_performance_plan ON investment_performance_metrics(investment_plan_id);
CREATE INDEX IF NOT EXISTS idx_investment_performance_date ON investment_performance_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_investment_performance_progress ON investment_performance_metrics(actual_progress);
CREATE INDEX IF NOT EXISTS idx_investment_performance_budget ON investment_performance_metrics(budget_utilization);
CREATE INDEX IF NOT EXISTS idx_investment_performance_quality ON investment_performance_metrics(quality_score);
CREATE INDEX IF NOT EXISTS idx_investment_performance_milestones ON investment_performance_metrics USING gin(milestone_completion);
CREATE INDEX IF NOT EXISTS idx_investment_performance_indicators ON investment_performance_metrics USING gin(performance_indicators);

-- Create materialized view for investment analysis
CREATE MATERIALIZED VIEW investment_analysis AS
SELECT 
    ip.id as investment_plan_id,
    ip.investment_type,
    ip.status,
    ip.planned_amount,
    ip.expected_roi,
    SUM(ce.amount) as total_expenditure,
    ROUND(AVG(rt.roi_percentage), 2) as average_roi,
    ROUND(AVG(ipm.actual_progress), 2) as average_progress,
    ROUND(AVG(ipm.budget_utilization), 2) as average_budget_utilization,
    ROUND(AVG(ipm.quality_score), 2) as average_quality_score,
    COUNT(DISTINCT ce.id) as expenditure_count,
    json_build_object(
        'on_track', COUNT(DISTINCT CASE WHEN ipm.actual_progress >= 90 THEN ipm.id END),
        'in_progress', COUNT(DISTINCT CASE WHEN ipm.actual_progress BETWEEN 20 AND 89 THEN ipm.id END),
        'delayed', COUNT(DISTINCT CASE WHEN ipm.actual_progress < 20 THEN ipm.id END)
    ) as progress_distribution
FROM 
    investment_plans ip
    LEFT JOIN capital_expenditure ce ON ip.id = ce.investment_plan_id
    LEFT JOIN roi_tracking rt ON ip.id = rt.investment_plan_id
    LEFT JOIN investment_performance_metrics ipm ON ip.id = ipm.investment_plan_id
GROUP BY 
    ip.id, ip.investment_type, ip.status, ip.planned_amount, ip.expected_roi;

-- Create index on the materialized view
CREATE UNIQUE INDEX ON investment_analysis (investment_plan_id);

-- Create refresh function and trigger
CREATE OR REPLACE FUNCTION refresh_investment_analysis()
RETURNS trigger AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY investment_analysis;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_investment_analysis_on_plan_change
    AFTER INSERT OR UPDATE OR DELETE ON investment_plans
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_investment_analysis();

CREATE TRIGGER refresh_investment_analysis_on_expenditure_change
    AFTER INSERT OR UPDATE OR DELETE ON capital_expenditure
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_investment_analysis();

CREATE TRIGGER refresh_investment_analysis_on_roi_change
    AFTER INSERT OR UPDATE OR DELETE ON roi_tracking
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_investment_analysis();
