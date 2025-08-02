-- Create Infrastructure & Network Intelligence and Financial & Performance Intelligence tables
-- This migration completes the table creation phase for the v2 requirements

-- Network Infrastructure Table
CREATE TABLE network_infrastructure (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Infrastructure classification
    infrastructure_type VARCHAR(100) NOT NULL,
    -- Examples: 'fiber_optic', 'wireless_tower', 'data_center', 'relay_station', 'edge_node'
    
    infrastructure_name VARCHAR(255),
    infrastructure_code VARCHAR(100),
    
    -- Technical specifications
    technology_standard VARCHAR(100),
    -- Examples: 'gpon', 'ethernet', '5g', 'lte', 'wifi6'
    
    capacity_specifications JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"max_bandwidth": "10gbps", "concurrent_users": 1000, "coverage_radius": 5}
    
    -- Coverage and performance
    coverage_quality INTEGER CHECK (coverage_quality >= 1 AND coverage_quality <= 5),
    signal_strength_average DECIMAL(5,2),
    coverage_area_sqkm DECIMAL(10,4) CHECK (coverage_area_sqkm >= 0),
    
    -- Physical infrastructure details
    installation_date DATE,
    last_upgrade_date DATE,
    infrastructure_age_years INTEGER GENERATED ALWAYS AS (
        EXTRACT(YEAR FROM CURRENT_DATE) - EXTRACT(YEAR FROM installation_date)
    ) STORED,
    
    physical_condition INTEGER CHECK (physical_condition >= 1 AND physical_condition <= 5),
    maintenance_frequency VARCHAR(100),
    
    -- Geographic and location data
    location_coordinates GEOMETRY(POINT, 4326),
    elevation_meters DECIMAL(8,2),
    accessibility_score INTEGER CHECK (accessibility_score >= 1 AND accessibility_score <= 5),
    
    -- Operational metrics
    operational_status VARCHAR(50) DEFAULT 'active',
    -- Examples: 'active', 'maintenance', 'degraded', 'offline', 'decommissioned'
    
    uptime_percentage DECIMAL(5,2) CHECK (uptime_percentage >= 0 AND uptime_percentage <= 100),
    reliability_score INTEGER CHECK (reliability_score >= 1 AND reliability_score <= 5),
    
    -- Investment and financial
    original_investment_amount DECIMAL(15,2),
    current_book_value DECIMAL(15,2),
    depreciation_rate DECIMAL(5,2),
    
    -- Strategic importance
    strategic_importance INTEGER CHECK (strategic_importance >= 1 AND strategic_importance <= 5),
    redundancy_level VARCHAR(50),
    -- Examples: 'none', 'basic', 'full', 'n_plus_one'
    
    -- Compliance and regulatory
    regulatory_approvals JSONB DEFAULT '[]'::JSONB,
    environmental_impact_rating INTEGER CHECK (environmental_impact_rating >= 1 AND environmental_impact_rating <= 5),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Capacity Metrics Table
CREATE TABLE capacity_metrics (
    id SERIAL PRIMARY KEY,
    infrastructure_id INTEGER NOT NULL REFERENCES network_infrastructure(id) ON DELETE CASCADE,
    
    -- Utilization metrics
    utilization_rate DECIMAL(5,2) NOT NULL CHECK (utilization_rate >= 0 AND utilization_rate <= 100),
    peak_utilization_rate DECIMAL(5,2) CHECK (peak_utilization_rate >= 0 AND peak_utilization_rate <= 100),
    
    -- Performance metrics
    performance_metrics JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Examples: {"throughput_mbps": 850, "latency_ms": 15, "packet_loss_percent": 0.1, "jitter_ms": 2}
    
    -- Capacity planning
    current_capacity DECIMAL(12,2),
    capacity_unit VARCHAR(50),
    -- Examples: 'mbps', 'users', 'transactions_per_second'
    
    available_capacity DECIMAL(12,2),
    capacity_threshold_warning DECIMAL(5,2) DEFAULT 80,
    capacity_threshold_critical DECIMAL(5,2) DEFAULT 95,
    
    -- Time period and measurement
    measurement_period DATE NOT NULL,
    measurement_interval VARCHAR(50) DEFAULT 'daily',
    -- Examples: 'hourly', 'daily', 'weekly', 'monthly'
    
    peak_hours JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["08:00-09:00", "19:00-22:00"]
    
    -- Quality of service metrics
    service_level_met BOOLEAN DEFAULT TRUE,
    sla_compliance_percentage DECIMAL(5,2) CHECK (sla_compliance_percentage >= 0 AND sla_compliance_percentage <= 100),
    
    -- Trend analysis
    capacity_trend VARCHAR(50),
    -- Examples: 'increasing', 'stable', 'decreasing', 'seasonal'
    
    growth_rate_monthly DECIMAL(8,4),
    projected_exhaustion_date DATE,
    
    -- Issue tracking
    performance_issues_count INTEGER DEFAULT 0 CHECK (performance_issues_count >= 0),
    downtime_minutes INTEGER DEFAULT 0 CHECK (downtime_minutes >= 0),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Infrastructure Investments Table
CREATE TABLE infrastructure_investments (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Investment classification
    investment_type VARCHAR(100) NOT NULL,
    -- Examples: 'fiber_deployment', 'tower_installation', 'equipment_upgrade', 'capacity_expansion'
    
    investment_category VARCHAR(100),
    -- Examples: 'capex', 'opex', 'maintenance', 'expansion', 'replacement'
    
    -- Investment details
    investment_name VARCHAR(255),
    description TEXT,
    
    -- Financial metrics
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'NGN',
    
    -- ROI and performance metrics
    roi_metrics JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"expected_roi": 25.5, "payback_period_months": 18, "npv": 5000000}
    
    expected_roi_percentage DECIMAL(8,4),
    actual_roi_percentage DECIMAL(8,4),
    payback_period_months INTEGER CHECK (payback_period_months >= 0),
    
    -- Timeline and status
    planned_start_date DATE,
    actual_start_date DATE,
    planned_completion_date DATE,
    actual_completion_date DATE,
    
    investment_status VARCHAR(50) DEFAULT 'planned',
    -- Examples: 'planned', 'approved', 'in_progress', 'completed', 'cancelled', 'on_hold'
    
    -- Performance and impact
    business_impact_score INTEGER CHECK (business_impact_score >= 1 AND business_impact_score <= 5),
    market_impact_description TEXT,
    
    customer_impact_metrics JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"new_customers_enabled": 500, "service_improvement": "50% faster speeds"}
    
    -- Risk and strategic alignment
    risk_level VARCHAR(50),
    -- Examples: 'low', 'medium', 'high', 'critical'
    
    strategic_alignment_score INTEGER CHECK (strategic_alignment_score >= 1 AND strategic_alignment_score <= 5),
    competitive_advantage JSONB DEFAULT '[]'::JSONB,
    
    -- Approval and governance
    approval_status VARCHAR(50) DEFAULT 'pending',
    approved_by VARCHAR(255),
    approval_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue Analytics Table
CREATE TABLE revenue_analytics (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Revenue categorization
    revenue_type VARCHAR(100) NOT NULL,
    -- Examples: 'subscription', 'installation', 'equipment', 'support', 'fintech_fees', 'delivery_fees'
    
    service_category VARCHAR(100),
    -- Examples: 'internet', 'fintech', 'delivery', 'money_transfer', 'mailing'
    
    -- Financial metrics
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'NGN',
    
    -- Time period
    period DATE NOT NULL,
    period_type VARCHAR(20) DEFAULT 'monthly',
    -- Examples: 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
    
    -- Customer and market metrics
    customer_count INTEGER DEFAULT 0 CHECK (customer_count >= 0),
    average_revenue_per_customer DECIMAL(10,2),
    market_share_contribution DECIMAL(5,2) CHECK (market_share_contribution >= 0 AND market_share_contribution <= 100),
    
    -- Growth and performance analysis
    growth_rate_period_over_period DECIMAL(8,4),
    revenue_trend VARCHAR(50),
    -- Examples: 'growing', 'stable', 'declining', 'seasonal'
    
    seasonality_factor DECIMAL(5,4),
    
    -- Profitability analysis
    gross_margin_percentage DECIMAL(5,2),
    cost_of_revenue DECIMAL(15,2),
    net_revenue DECIMAL(15,2),
    
    -- Quality and confidence metrics
    data_quality_score INTEGER CHECK (data_quality_score >= 1 AND data_quality_score <= 5),
    forecast_accuracy_percentage DECIMAL(5,2),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investment Tracking Table
CREATE TABLE investment_tracking (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Investment identification
    investment_type VARCHAR(100) NOT NULL,
    -- Examples: 'infrastructure', 'marketing', 'customer_acquisition', 'technology', 'operations'
    
    investment_name VARCHAR(255),
    description TEXT,
    
    -- Financial tracking
    amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) DEFAULT 'NGN',
    
    expected_roi DECIMAL(8,4),
    actual_roi DECIMAL(8,4),
    
    -- Performance tracking
    performance_indicators JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"customers_acquired": 150, "revenue_increase": 250000, "market_share_gain": 2.5}
    
    success_metrics JSONB DEFAULT '{}'::JSONB,
    milestone_achievements JSONB DEFAULT '[]'::JSONB,
    
    -- Timeline tracking
    investment_date DATE NOT NULL,
    expected_return_date DATE,
    actual_return_start_date DATE,
    
    -- Status and monitoring
    investment_status VARCHAR(50) DEFAULT 'active',
    -- Examples: 'planned', 'active', 'returning', 'completed', 'failed'
    
    monitoring_frequency VARCHAR(50) DEFAULT 'monthly',
    last_review_date DATE,
    next_review_date DATE,
    
    -- Risk and impact assessment
    risk_assessment JSONB DEFAULT '{}'::JSONB,
    impact_on_business JSONB DEFAULT '{}'::JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Market Opportunities Table
CREATE TABLE market_opportunities (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Opportunity identification
    opportunity_type VARCHAR(100) NOT NULL,
    -- Examples: 'new_service', 'market_expansion', 'customer_segment', 'pricing_optimization', 'partnership'
    
    opportunity_name VARCHAR(255),
    description TEXT,
    
    -- Value assessment
    potential_value DECIMAL(15,2) CHECK (potential_value >= 0),
    currency VARCHAR(10) DEFAULT 'NGN',
    
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5),
    probability_of_success DECIMAL(5,2) CHECK (probability_of_success >= 0 AND probability_of_success <= 100),
    
    -- Risk assessment
    risk_assessment JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"market_risk": "medium", "execution_risk": "low", "competitive_risk": "high"}
    
    risk_level VARCHAR(50),
    -- Examples: 'low', 'medium', 'high', 'critical'
    
    -- Market analysis
    market_size_estimate DECIMAL(15,2),
    target_customer_segment VARCHAR(100),
    competitive_landscape JSONB DEFAULT '{}'::JSONB,
    
    -- Implementation requirements
    required_investment DECIMAL(15,2),
    required_capabilities JSONB DEFAULT '[]'::JSONB,
    implementation_complexity INTEGER CHECK (implementation_complexity >= 1 AND implementation_complexity <= 5),
    
    -- Timeline and priority
    opportunity_priority INTEGER CHECK (opportunity_priority >= 1 AND opportunity_priority <= 5),
    urgency_level VARCHAR(50),
    -- Examples: 'immediate', 'short_term', 'medium_term', 'long_term'
    
    estimated_time_to_market_months INTEGER CHECK (estimated_time_to_market_months >= 0),
    
    -- Status and tracking
    opportunity_status VARCHAR(50) DEFAULT 'identified',
    -- Examples: 'identified', 'evaluated', 'approved', 'in_development', 'launched', 'abandoned'
    
    identified_date DATE DEFAULT CURRENT_DATE,
    last_evaluated_date DATE,
    
    -- Strategic alignment
    strategic_fit_score INTEGER CHECK (strategic_fit_score >= 1 AND strategic_fit_score <= 5),
    alignment_with_goals JSONB DEFAULT '[]'::JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for network_infrastructure
CREATE INDEX idx_network_infrastructure_estate_id ON network_infrastructure(estate_id);
CREATE INDEX idx_network_infrastructure_type ON network_infrastructure(infrastructure_type);
CREATE INDEX idx_network_infrastructure_status ON network_infrastructure(operational_status);
CREATE INDEX idx_network_infrastructure_coverage ON network_infrastructure(coverage_quality);
CREATE INDEX idx_network_infrastructure_location ON network_infrastructure USING GIST(location_coordinates);
CREATE INDEX idx_network_infrastructure_capacity_gin ON network_infrastructure USING GIN(capacity_specifications);

-- Create indexes for capacity_metrics
CREATE INDEX idx_capacity_metrics_infrastructure_id ON capacity_metrics(infrastructure_id);
CREATE INDEX idx_capacity_metrics_period ON capacity_metrics(measurement_period);
CREATE INDEX idx_capacity_metrics_utilization ON capacity_metrics(utilization_rate);
CREATE INDEX idx_capacity_metrics_trend ON capacity_metrics(capacity_trend);
CREATE INDEX idx_capacity_metrics_performance_gin ON capacity_metrics USING GIN(performance_metrics);

-- Create indexes for infrastructure_investments
CREATE INDEX idx_infrastructure_investments_estate_id ON infrastructure_investments(estate_id);
CREATE INDEX idx_infrastructure_investments_type ON infrastructure_investments(investment_type);
CREATE INDEX idx_infrastructure_investments_status ON infrastructure_investments(investment_status);
CREATE INDEX idx_infrastructure_investments_amount ON infrastructure_investments(amount);
CREATE INDEX idx_infrastructure_investments_roi ON infrastructure_investments(expected_roi_percentage);
CREATE INDEX idx_infrastructure_investments_roi_gin ON infrastructure_investments USING GIN(roi_metrics);

-- Create indexes for revenue_analytics
CREATE INDEX idx_revenue_analytics_estate_id ON revenue_analytics(estate_id);
CREATE INDEX idx_revenue_analytics_type ON revenue_analytics(revenue_type);
CREATE INDEX idx_revenue_analytics_category ON revenue_analytics(service_category);
CREATE INDEX idx_revenue_analytics_period ON revenue_analytics(period);
CREATE INDEX idx_revenue_analytics_amount ON revenue_analytics(amount);
CREATE INDEX idx_revenue_analytics_trend ON revenue_analytics(revenue_trend);

-- Create indexes for investment_tracking
CREATE INDEX idx_investment_tracking_estate_id ON investment_tracking(estate_id);
CREATE INDEX idx_investment_tracking_type ON investment_tracking(investment_type);
CREATE INDEX idx_investment_tracking_status ON investment_tracking(investment_status);
CREATE INDEX idx_investment_tracking_date ON investment_tracking(investment_date);
CREATE INDEX idx_investment_tracking_roi ON investment_tracking(expected_roi);
CREATE INDEX idx_investment_tracking_performance_gin ON investment_tracking USING GIN(performance_indicators);

-- Create indexes for market_opportunities
CREATE INDEX idx_market_opportunities_estate_id ON market_opportunities(estate_id);
CREATE INDEX idx_market_opportunities_type ON market_opportunities(opportunity_type);
CREATE INDEX idx_market_opportunities_status ON market_opportunities(opportunity_status);
CREATE INDEX idx_market_opportunities_priority ON market_opportunities(opportunity_priority);
CREATE INDEX idx_market_opportunities_value ON market_opportunities(potential_value);
CREATE INDEX idx_market_opportunities_confidence ON market_opportunities(confidence_level);
CREATE INDEX idx_market_opportunities_risk ON market_opportunities(risk_level);

-- Create unique constraints
CREATE UNIQUE INDEX idx_capacity_metrics_unique ON capacity_metrics(infrastructure_id, measurement_period);
CREATE UNIQUE INDEX idx_revenue_analytics_unique ON revenue_analytics(estate_id, revenue_type, service_category, period);

-- Create triggers for updated_at timestamps
CREATE TRIGGER network_infrastructure_updated_at_trigger
    BEFORE UPDATE ON network_infrastructure
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER capacity_metrics_updated_at_trigger
    BEFORE UPDATE ON capacity_metrics
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER infrastructure_investments_updated_at_trigger
    BEFORE UPDATE ON infrastructure_investments
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER revenue_analytics_updated_at_trigger
    BEFORE UPDATE ON revenue_analytics
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER investment_tracking_updated_at_trigger
    BEFORE UPDATE ON investment_tracking
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER market_opportunities_updated_at_trigger
    BEFORE UPDATE ON market_opportunities
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();