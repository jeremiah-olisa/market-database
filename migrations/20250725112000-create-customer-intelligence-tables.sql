-- Create customer intelligence tables for customer analytics
-- These tables support customer behavior analysis and service adoption tracking

-- Customer profiles table
CREATE TABLE customer_profiles (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    customer_type VARCHAR(50) NOT NULL, -- 'residential', 'business', 'enterprise'
    demographics JSONB, -- {"age_group": "26-35", "income_level": "middle", "occupation": "professional"}
    lifestyle_indicators JSONB, -- {"internet_usage": "high", "tech_savvy": true, "entertainment": "streaming"}
    contact_preferences JSONB, -- {"email": true, "sms": false, "phone": true}
    service_preferences JSONB, -- {"internet_speed": "100mbps", "data_usage": "unlimited"}
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Usage patterns table
CREATE TABLE usage_patterns (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL, -- 'internet', 'fintech', 'delivery', 'money_transfer'
    usage_metrics JSONB NOT NULL, -- {"data_consumption": "50GB", "peak_hours": "7-9PM", "devices": 3}
    period DATE NOT NULL,
    billing_amount DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'paid',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Customer feedback table
CREATE TABLE customer_feedback (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    feedback_category VARCHAR(100), -- 'service_quality', 'support', 'pricing', 'reliability'
    sentiment_score DECIMAL(3,2), -- -1.0 to 1.0
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Cross-service adoption table
CREATE TABLE cross_service_adoption (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    adoption_status VARCHAR(50) NOT NULL CHECK (adoption_status IN ('adopted', 'trial', 'interested', 'not_interested')),
    adoption_date DATE,
    churn_date DATE,
    usage_frequency VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'occasional'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(customer_id, service_type)
);

-- Add indexes for customer intelligence tables
CREATE INDEX idx_customer_profiles_estate_id ON customer_profiles(estate_id);
CREATE INDEX idx_customer_profiles_customer_type ON customer_profiles(customer_type);
CREATE INDEX idx_customer_profiles_demographics_gin ON customer_profiles USING GIN(demographics);
CREATE INDEX idx_customer_profiles_lifestyle_gin ON customer_profiles USING GIN(lifestyle_indicators);

CREATE INDEX idx_usage_patterns_customer_id ON usage_patterns(customer_id);
CREATE INDEX idx_usage_patterns_service_type ON usage_patterns(service_type);
CREATE INDEX idx_usage_patterns_period ON usage_patterns(period);
CREATE INDEX idx_usage_patterns_usage_metrics_gin ON usage_patterns USING GIN(usage_metrics);
CREATE INDEX idx_usage_patterns_customer_service_period ON usage_patterns(customer_id, service_type, period);

CREATE INDEX idx_customer_feedback_customer_id ON customer_feedback(customer_id);
CREATE INDEX idx_customer_feedback_service_type ON customer_feedback(service_type);
CREATE INDEX idx_customer_feedback_rating ON customer_feedback(rating);
CREATE INDEX idx_customer_feedback_category ON customer_feedback(feedback_category);
CREATE INDEX idx_customer_feedback_sentiment ON customer_feedback(sentiment_score);
CREATE INDEX idx_customer_feedback_created_at ON customer_feedback(created_at);

CREATE INDEX idx_cross_service_adoption_customer_id ON cross_service_adoption(customer_id);
CREATE INDEX idx_cross_service_adoption_service_type ON cross_service_adoption(service_type);
CREATE INDEX idx_cross_service_adoption_status ON cross_service_adoption(adoption_status);
CREATE INDEX idx_cross_service_adoption_adoption_date ON cross_service_adoption(adoption_date);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_customer_intelligence_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customer_profiles_updated_at_trigger
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_customer_intelligence_updated_at();

CREATE TRIGGER usage_patterns_updated_at_trigger
    BEFORE UPDATE ON usage_patterns
    FOR EACH ROW EXECUTE FUNCTION update_customer_intelligence_updated_at();

CREATE TRIGGER customer_feedback_updated_at_trigger
    BEFORE UPDATE ON customer_feedback
    FOR EACH ROW EXECUTE FUNCTION update_customer_intelligence_updated_at();

CREATE TRIGGER cross_service_adoption_updated_at_trigger
    BEFORE UPDATE ON cross_service_adoption
    FOR EACH ROW EXECUTE FUNCTION update_customer_intelligence_updated_at();
