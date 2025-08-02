-- Create Customer & Usage Intelligence tables
-- This migration includes customer profiles, usage patterns, feedback, and cross-service adoption

-- Customer Profiles Table
CREATE TABLE customer_profiles (
    id SERIAL PRIMARY KEY,
    estate_id INTEGER NOT NULL REFERENCES estates(id) ON DELETE CASCADE,
    
    -- Customer identification (anonymized for privacy)
    customer_hash VARCHAR(255) UNIQUE NOT NULL, -- Anonymized customer identifier
    customer_segment VARCHAR(100),
    -- Examples: 'residential', 'soho', 'sme', 'enterprise', 'government'
    
    -- Demographic information
    demographics JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"age_range": "25-35", "income_bracket": "middle", "household_size": 4, "occupation": "professional"}
    
    lifestyle_indicators JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"work_from_home": true, "streaming_heavy": true, "gaming": false, "business_owner": false}
    
    -- Service subscription and relationship
    service_tenure_months INTEGER DEFAULT 0 CHECK (service_tenure_months >= 0),
    customer_lifetime_value DECIMAL(12,2),
    acquisition_channel VARCHAR(100),
    -- Examples: 'referral', 'online', 'agent', 'walk_in', 'telemarketing'
    
    -- Usage classification and behavior
    usage_profile VARCHAR(100),
    -- Examples: 'light_user', 'moderate_user', 'heavy_user', 'power_user', 'business_user'
    
    service_preferences JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"preferred_support": "chat", "billing_preference": "monthly", "notification_method": "email"}
    
    -- Customer value and risk metrics
    monthly_spend_average DECIMAL(10,2) CHECK (monthly_spend_average >= 0),
    payment_behavior_score INTEGER CHECK (payment_behavior_score >= 1 AND payment_behavior_score <= 5),
    churn_risk_score INTEGER CHECK (churn_risk_score >= 1 AND churn_risk_score <= 5),
    
    -- Engagement and interaction
    support_interaction_frequency VARCHAR(50),
    -- Examples: 'never', 'rare', 'occasional', 'frequent', 'very_frequent'
    
    digital_engagement_score INTEGER CHECK (digital_engagement_score >= 1 AND digital_engagement_score <= 5),
    referral_count INTEGER DEFAULT 0 CHECK (referral_count >= 0),
    
    -- Technology and device information
    device_profile JSONB DEFAULT '{}'::JSONB,
    -- Examples: {"primary_device": "smartphone", "secondary_devices": ["laptop", "smart_tv"], "os_preference": "android"}
    
    technology_adoption_level VARCHAR(50),
    -- Examples: 'early_adopter', 'mainstream', 'late_adopter', 'technology_resistant'
    
    -- Privacy and data handling
    data_sharing_consent BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    last_consent_update TIMESTAMP,
    
    -- Status and lifecycle
    customer_status VARCHAR(50) DEFAULT 'active',
    -- Examples: 'active', 'suspended', 'churned', 'win_back'
    
    lifecycle_stage VARCHAR(50),
    -- Examples: 'new', 'growing', 'mature', 'at_risk', 'churned'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Usage Patterns Table
CREATE TABLE usage_patterns (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    
    -- Service and usage identification
    service_type VARCHAR(100) NOT NULL,
    -- Examples: 'internet', 'voice', 'fintech', 'delivery', 'mobile_data'
    
    -- Usage metrics and consumption
    usage_metrics JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Examples: {"data_consumed_gb": 45.5, "peak_hours": ["19:00-23:00"], "avg_session_duration": 120}
    
    -- Temporal patterns
    period DATE NOT NULL,
    period_type VARCHAR(20) DEFAULT 'monthly',
    usage_frequency VARCHAR(50),
    -- Examples: 'daily', 'weekly', 'occasional', 'rare'
    
    peak_usage_hours JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["08:00-09:00", "19:00-23:00"]
    
    seasonal_patterns JSONB DEFAULT '{}'::JSONB,
    
    -- Performance and quality metrics
    service_quality_experienced DECIMAL(3,2) CHECK (service_quality_experienced >= 1 AND service_quality_experienced <= 5),
    performance_issues_count INTEGER DEFAULT 0 CHECK (performance_issues_count >= 0),
    
    -- Behavioral insights
    usage_efficiency_score INTEGER CHECK (usage_efficiency_score >= 1 AND usage_efficiency_score <= 5),
    feature_adoption_rate DECIMAL(5,2) CHECK (feature_adoption_rate >= 0 AND feature_adoption_rate <= 100),
    
    usage_trend VARCHAR(50),
    -- Examples: 'increasing', 'stable', 'decreasing', 'seasonal'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer Feedback Table
CREATE TABLE customer_feedback (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    
    -- Feedback categorization
    service_type VARCHAR(100),
    feedback_category VARCHAR(100),
    -- Examples: 'service_quality', 'support_experience', 'billing', 'product_feature', 'general'
    
    feedback_type VARCHAR(50),
    -- Examples: 'complaint', 'compliment', 'suggestion', 'inquiry', 'review'
    
    -- Feedback content and ratings
    rating DECIMAL(3,2) CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    
    -- Sentiment and analysis
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    -- -1 (very negative) to +1 (very positive)
    
    sentiment_category VARCHAR(50),
    -- Examples: 'positive', 'neutral', 'negative'
    
    topics_mentioned JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["speed", "support", "pricing", "reliability"]
    
    -- Resolution and follow-up
    resolution_status VARCHAR(50) DEFAULT 'pending',
    -- Examples: 'pending', 'in_progress', 'resolved', 'escalated', 'closed'
    
    resolution_time_hours INTEGER,
    follow_up_required BOOLEAN DEFAULT FALSE,
    
    -- Channel and context
    feedback_channel VARCHAR(100),
    -- Examples: 'support_call', 'email', 'chat', 'survey', 'social_media', 'app_review'
    
    interaction_context JSONB DEFAULT '{}'::JSONB,
    
    -- Impact and priority
    business_impact_level VARCHAR(50),
    -- Examples: 'low', 'medium', 'high', 'critical'
    
    priority_score INTEGER CHECK (priority_score >= 1 AND priority_score <= 5),
    
    feedback_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cross Service Adoption Table
CREATE TABLE cross_service_adoption (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    
    -- Service information
    service_type VARCHAR(100) NOT NULL,
    -- Examples: 'internet', 'fintech', 'delivery', 'money_transfer', 'mailing'
    
    adoption_status VARCHAR(50) DEFAULT 'not_adopted',
    -- Examples: 'not_adopted', 'trial', 'active', 'paused', 'churned'
    
    -- Adoption timeline and behavior
    adoption_date DATE,
    trial_start_date DATE,
    activation_date DATE,
    last_usage_date DATE,
    
    -- Usage and engagement metrics
    usage_frequency VARCHAR(50),
    monthly_transactions INTEGER DEFAULT 0 CHECK (monthly_transactions >= 0),
    monthly_value DECIMAL(12,2) DEFAULT 0 CHECK (monthly_value >= 0),
    
    engagement_level VARCHAR(50),
    -- Examples: 'low', 'medium', 'high', 'very_high'
    
    feature_adoption_score INTEGER CHECK (feature_adoption_score >= 1 AND feature_adoption_score <= 5),
    
    -- Cross-selling and upselling opportunities
    upsell_potential VARCHAR(50),
    -- Examples: 'low', 'medium', 'high'
    
    related_services_interest JSONB DEFAULT '[]'::JSONB,
    -- Examples: ["premium_internet", "business_fintech", "express_delivery"]
    
    -- Performance and satisfaction
    service_satisfaction_rating DECIMAL(3,2) CHECK (service_satisfaction_rating >= 1 AND service_satisfaction_rating <= 5),
    retention_probability DECIMAL(5,2) CHECK (retention_probability >= 0 AND retention_probability <= 100),
    
    -- Revenue impact
    monthly_revenue_contribution DECIMAL(10,2) DEFAULT 0,
    lifetime_value_contribution DECIMAL(12,2) DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for customer_profiles
CREATE INDEX idx_customer_profiles_estate_id ON customer_profiles(estate_id);
CREATE INDEX idx_customer_profiles_customer_hash ON customer_profiles(customer_hash);
CREATE INDEX idx_customer_profiles_segment ON customer_profiles(customer_segment);
CREATE INDEX idx_customer_profiles_usage_profile ON customer_profiles(usage_profile);
CREATE INDEX idx_customer_profiles_status ON customer_profiles(customer_status);
CREATE INDEX idx_customer_profiles_lifecycle ON customer_profiles(lifecycle_stage);
CREATE INDEX idx_customer_profiles_churn_risk ON customer_profiles(churn_risk_score);
CREATE INDEX idx_customer_profiles_monthly_spend ON customer_profiles(monthly_spend_average);

-- Create GIN indexes for JSONB fields in customer_profiles
CREATE INDEX idx_customer_profiles_demographics ON customer_profiles USING GIN(demographics);
CREATE INDEX idx_customer_profiles_lifestyle ON customer_profiles USING GIN(lifestyle_indicators);
CREATE INDEX idx_customer_profiles_preferences ON customer_profiles USING GIN(service_preferences);

-- Create indexes for usage_patterns
CREATE INDEX idx_usage_patterns_customer_id ON usage_patterns(customer_id);
CREATE INDEX idx_usage_patterns_service_type ON usage_patterns(service_type);
CREATE INDEX idx_usage_patterns_period ON usage_patterns(period);
CREATE INDEX idx_usage_patterns_quality ON usage_patterns(service_quality_experienced);
CREATE INDEX idx_usage_patterns_trend ON usage_patterns(usage_trend);
CREATE INDEX idx_usage_patterns_metrics ON usage_patterns USING GIN(usage_metrics);

-- Create indexes for customer_feedback
CREATE INDEX idx_customer_feedback_customer_id ON customer_feedback(customer_id);
CREATE INDEX idx_customer_feedback_service_type ON customer_feedback(service_type);
CREATE INDEX idx_customer_feedback_category ON customer_feedback(feedback_category);
CREATE INDEX idx_customer_feedback_type ON customer_feedback(feedback_type);
CREATE INDEX idx_customer_feedback_rating ON customer_feedback(rating);
CREATE INDEX idx_customer_feedback_sentiment ON customer_feedback(sentiment_score);
CREATE INDEX idx_customer_feedback_status ON customer_feedback(resolution_status);
CREATE INDEX idx_customer_feedback_channel ON customer_feedback(feedback_channel);
CREATE INDEX idx_customer_feedback_date ON customer_feedback(feedback_date);
CREATE INDEX idx_customer_feedback_topics ON customer_feedback USING GIN(topics_mentioned);

-- Create full-text search index for feedback text
CREATE INDEX idx_customer_feedback_fts ON customer_feedback 
USING GIN(to_tsvector('english', COALESCE(feedback_text, '')));

-- Create indexes for cross_service_adoption
CREATE INDEX idx_cross_service_customer_id ON cross_service_adoption(customer_id);
CREATE INDEX idx_cross_service_service_type ON cross_service_adoption(service_type);
CREATE INDEX idx_cross_service_status ON cross_service_adoption(adoption_status);
CREATE INDEX idx_cross_service_engagement ON cross_service_adoption(engagement_level);
CREATE INDEX idx_cross_service_satisfaction ON cross_service_adoption(service_satisfaction_rating);
CREATE INDEX idx_cross_service_upsell ON cross_service_adoption(upsell_potential);
CREATE INDEX idx_cross_service_revenue ON cross_service_adoption(monthly_revenue_contribution);

-- Create unique constraints
CREATE UNIQUE INDEX idx_usage_patterns_unique ON usage_patterns(customer_id, service_type, period);
CREATE UNIQUE INDEX idx_cross_service_unique ON cross_service_adoption(customer_id, service_type);

-- Create triggers for updated_at timestamps
CREATE TRIGGER customer_profiles_updated_at_trigger
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER usage_patterns_updated_at_trigger
    BEFORE UPDATE ON usage_patterns
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER customer_feedback_updated_at_trigger
    BEFORE UPDATE ON customer_feedback
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();

CREATE TRIGGER cross_service_adoption_updated_at_trigger
    BEFORE UPDATE ON cross_service_adoption
    FOR EACH ROW EXECUTE FUNCTION update_table_updated_at();