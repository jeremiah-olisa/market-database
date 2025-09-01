DO $$
BEGIN

CREATE TYPE estate_tier AS ENUM ('platinum', 'gold', 'silver', 'bronze');
CREATE TYPE provider_status AS ENUM ('active', 'inactive');
CREATE TYPE service_quality AS ENUM ('excellent', 'good', 'fair', 'poor');
CREATE TYPE business_status AS ENUM ('active', 'inactive', 'closed');
CREATE TYPE customer_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE satisfaction_level AS ENUM ('very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied');
CREATE TYPE service_category AS ENUM ('internet', 'fintech', 'delivery', 'mailing');
CREATE TYPE infrastructure_type AS ENUM ('fiber', 'tower', 'router');
CREATE TYPE infrastructure_status AS ENUM ('operational', 'maintenance', 'down');

-- Core Tables for Estate and Geographic Intelligence
CREATE TABLE IF NOT EXISTS public.areas (
    id serial NOT NULL,
    name character varying(255) NOT NULL,
    state character varying(100) NOT NULL,
    geo_code character varying(50),
    geometry geometry(MultiPolygon,4326),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT areas_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.estates (
    id serial NOT NULL,
    name character varying(255) NOT NULL,
    area_id integer NOT NULL,
    tier estate_tier NOT NULL DEFAULT 'bronze'::estate_tier,
    unit_count integer NOT NULL,
    gated boolean NOT NULL DEFAULT false,
    geometry geometry(Point,4326),
    economic_indicators jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT estates_pkey PRIMARY KEY (id),
    CONSTRAINT estates_area_id_fkey FOREIGN KEY (area_id)
        REFERENCES public.areas (id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_estates_area_id ON public.estates(area_id);
CREATE INDEX IF NOT EXISTS idx_estates_geometry ON public.estates USING GIST (geometry);

CREATE TABLE IF NOT EXISTS public.demographics (
    id serial NOT NULL,
    estate_id integer NOT NULL,
    total_population integer NOT NULL,
    avg_household_size numeric(4, 2) NOT NULL,
    avg_household_income numeric(12, 2),
    age_distribution jsonb NOT NULL DEFAULT '{}'::jsonb,
    income_distribution jsonb NOT NULL DEFAULT '{}'::jsonb,
    lifestyle_indicators jsonb DEFAULT '{}'::jsonb,
    updated_date date NOT NULL DEFAULT CURRENT_DATE,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT demographics_pkey PRIMARY KEY (id),
    CONSTRAINT demographics_unique UNIQUE (estate_id),
    CONSTRAINT demographics_estate_id_fkey FOREIGN KEY (estate_id)
        REFERENCES public.estates (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_demographics_estate_id ON public.demographics(estate_id);
CREATE INDEX IF NOT EXISTS idx_demographics_metadata ON public.demographics USING GIN (metadata);

-- Market and Competitive Intelligence
CREATE TABLE IF NOT EXISTS public.service_providers (
    id serial NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    contact_email character varying(255),
    contact_phone character varying(20),
    website character varying(255),
    status provider_status NOT NULL DEFAULT 'active'::provider_status,
    competitive_advantages text[],
    competitive_disadvantages text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_providers_pkey PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_service_providers_metadata ON public.service_providers USING GIN (metadata);

CREATE TABLE IF NOT EXISTS public.service_offerings (
    id serial NOT NULL,
    provider_id integer NOT NULL,
    name character varying(255) NOT NULL,
    price numeric(12, 2) NOT NULL,
    currency character varying(3) NOT NULL DEFAULT 'NGN',
    billing_cycle character varying(50) NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    service_category service_category NOT NULL DEFAULT 'internet'::service_category,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_offerings_pkey PRIMARY KEY (id),
    CONSTRAINT service_offerings_provider_id_fkey FOREIGN KEY (provider_id)
        REFERENCES public.service_providers (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_service_offerings_provider ON public.service_offerings(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_offerings_metadata ON public.service_offerings USING GIN (metadata);

CREATE TABLE IF NOT EXISTS public.provider_coverage (
    id serial NOT NULL,
    provider_id integer NOT NULL,
    estate_id integer NOT NULL,
    coverage_type character varying(50) NOT NULL,
    service_quality service_quality NOT NULL,
    coverage_percentage numeric(5, 2),
    last_assessment_date date,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT provider_coverage_pkey PRIMARY KEY (id),
    CONSTRAINT provider_coverage_unique UNIQUE (provider_id, estate_id, coverage_type),
    CONSTRAINT provider_coverage_provider_id_fkey FOREIGN KEY (provider_id)
        REFERENCES public.service_providers (id) ON DELETE CASCADE,
    CONSTRAINT provider_coverage_estate_id_fkey FOREIGN KEY (estate_id)
        REFERENCES public.estates (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_provider_coverage_provider ON public.provider_coverage(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_coverage_estate ON public.provider_coverage(estate_id);

CREATE TABLE IF NOT EXISTS public.competitive_benchmarking (
    id serial NOT NULL,
    our_service_id integer NOT NULL,
    competitor_service_id integer NOT NULL,
    comparison_date date NOT NULL DEFAULT CURRENT_DATE,
    price_difference numeric(12, 2),
    feature_comparison jsonb DEFAULT '{}'::jsonb,
    market_positioning_score integer,
    customer_preference_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT competitive_benchmarking_pkey PRIMARY KEY (id),
    CONSTRAINT competitive_benchmarking_unique UNIQUE (our_service_id, competitor_service_id, comparison_date),
    CONSTRAINT competitive_benchmarking_our_service_id_fkey FOREIGN KEY (our_service_id)
        REFERENCES public.service_offerings (id) ON DELETE CASCADE,
    CONSTRAINT competitive_benchmarking_competitor_service_id_fkey FOREIGN KEY (competitor_service_id)
        REFERENCES public.service_offerings (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_competitive_benchmarking_our_service ON public.competitive_benchmarking(our_service_id);
CREATE INDEX IF NOT EXISTS idx_competitive_benchmarking_competitor_service ON public.competitive_benchmarking(competitor_service_id);

CREATE TABLE IF NOT EXISTS public.market_share_data (
    id serial NOT NULL,
    provider_id integer NOT NULL,
    estate_id integer NOT NULL,
    period date NOT NULL,
    market_share_percentage numeric(5, 2),
    total_customers integer,
    revenue numeric(12, 2),
    currency character varying(3) NOT NULL DEFAULT 'NGN',
    confidence_score numeric(3, 2),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT market_share_data_pkey PRIMARY KEY (id),
    CONSTRAINT market_share_unique UNIQUE (provider_id, estate_id, period),
    CONSTRAINT market_share_data_provider_id_fkey FOREIGN KEY (provider_id)
        REFERENCES public.service_providers (id) ON DELETE CASCADE,
    CONSTRAINT market_share_data_estate_id_fkey FOREIGN KEY (estate_id)
        REFERENCES public.estates (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_market_share_provider ON public.market_share_data(provider_id);
CREATE INDEX IF NOT EXISTS idx_market_share_estate ON public.market_share_data(estate_id);

-- Business Ecosystem Intelligence
CREATE TABLE IF NOT EXISTS public.local_businesses (
    id serial NOT NULL,
    name character varying(255) NOT NULL,
    estate_id integer NOT NULL,
    business_type character varying(100) NOT NULL,
    status business_status NOT NULL DEFAULT 'active'::business_status,
    operating_hours jsonb DEFAULT '{}'::jsonb,
    contact_email character varying(255),
    contact_phone character varying(20),
    location geometry(Point,4326) NOT NULL,
    business_metrics jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT local_businesses_pkey PRIMARY KEY (id),
    CONSTRAINT local_businesses_estate_id_fkey FOREIGN KEY (estate_id)
        REFERENCES public.estates (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_local_businesses_estate ON public.local_businesses(estate_id);
CREATE INDEX IF NOT EXISTS idx_local_businesses_location ON public.local_businesses USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_local_businesses_metadata ON public.local_businesses USING GIN (metadata);

-- Customer and Usage Intelligence
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id serial NOT NULL,
    estate_id integer NOT NULL,
    customer_type character varying(50) NOT NULL,
    status customer_status NOT NULL DEFAULT 'active'::customer_status,
    registration_date date NOT NULL,
    household_size integer,
    income_bracket character varying(50),
    age_bracket character varying(50),
    lifestyle_tags text[],
    preferences jsonb DEFAULT '{}'::jsonb,
    contact_email character varying(255),
    contact_phone character varying(20),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT customer_profiles_estate_id_fkey FOREIGN KEY (estate_id)
        REFERENCES public.estates (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_estate ON public.customer_profiles(estate_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_metadata ON public.customer_profiles USING GIN (metadata);

CREATE TABLE IF NOT EXISTS public.usage_patterns (
    id serial NOT NULL,
    customer_id integer NOT NULL,
    service_type character varying(100) NOT NULL,
    usage_date date NOT NULL,
    data_consumed numeric(12, 2),
    peak_usage_time time without time zone,
    usage_duration integer,
    usage_metrics jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT usage_patterns_pkey PRIMARY KEY (id),
    CONSTRAINT usage_patterns_unique UNIQUE (customer_id, service_type, usage_date),
    CONSTRAINT usage_patterns_customer_id_fkey FOREIGN KEY (customer_id)
        REFERENCES public.customer_profiles (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_customer ON public.usage_patterns(customer_id);
CREATE INDEX IF NOT EXISTS idx_usage_patterns_metadata ON public.usage_patterns USING GIN (metadata);

CREATE TABLE IF NOT EXISTS public.customer_feedback (
    id serial NOT NULL,
    customer_id integer NOT NULL,
    service_type character varying(100) NOT NULL,
    feedback_date date NOT NULL DEFAULT CURRENT_DATE,
    satisfaction_level satisfaction_level NOT NULL,
    feedback_text text,
    priority integer,
    resolution_status character varying(50) DEFAULT 'pending',
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_feedback_pkey PRIMARY KEY (id),
    CONSTRAINT customer_feedback_customer_id_fkey FOREIGN KEY (customer_id)
        REFERENCES public.customer_profiles (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_customer ON public.customer_feedback(customer_id);

CREATE TABLE IF NOT EXISTS public.churn_risk_indicators (
    id serial NOT NULL,
    customer_id integer NOT NULL,
    assessment_date date NOT NULL DEFAULT CURRENT_DATE,
    churn_probability numeric(5, 2),
    risk_factors jsonb DEFAULT '{}'::jsonb,
    usage_trends jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT churn_risk_indicators_pkey PRIMARY KEY (id),
    CONSTRAINT churn_risk_indicators_unique UNIQUE (customer_id, assessment_date),
    CONSTRAINT churn_risk_indicators_customer_id_fkey FOREIGN KEY (customer_id)
        REFERENCES public.customer_profiles (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_churn_risk_customer ON public.churn_risk_indicators(customer_id);

-- Infrastructure and Network Intelligence
CREATE TABLE IF NOT EXISTS public.network_infrastructure (
    id serial NOT NULL,
    estate_id integer NOT NULL,
    infrastructure_type infrastructure_type NOT NULL,
    status infrastructure_status NOT NULL DEFAULT 'operational'::infrastructure_status,
    installation_date date NOT NULL,
    capacity_specs jsonb DEFAULT '{}'::jsonb,
    location geometry(Point,4326) NOT NULL,
    coverage_area geometry(Polygon,4326),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT network_infrastructure_pkey PRIMARY KEY (id),
    CONSTRAINT network_infrastructure_estate_id_fkey FOREIGN KEY (estate_id)
        REFERENCES public.estates (id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_estate ON public.network_infrastructure(estate_id);
CREATE INDEX IF NOT EXISTS idx_network_infrastructure_location ON public.network_infrastructure USING GIST (location);

CREATE TABLE IF NOT EXISTS public.service_quality_metrics (
    id serial NOT NULL,
    estate_id integer NOT NULL,
    service_type character varying(100) NOT NULL,
    period date NOT NULL,
    uptime_percentage numeric(5, 2),
    avg_response_time integer,
    customer_satisfaction_score numeric(3, 2),
    incident_count integer,
    bandwidth_usage numeric(12, 2),
    latency_ms numeric(8, 2),
    quality_metrics jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_quality_metrics_pkey PRIMARY KEY (id),
    CONSTRAINT service_quality_metrics_unique UNIQUE (estate_id, service_type, period),
    CONSTRAINT service_quality_metrics_estate_id_fkey FOREIGN KEY (estate_id)
        REFERENCES public.estates (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_service_quality_estate ON public.service_quality_metrics(estate_id);

-- Financial and Performance Intelligence
CREATE TABLE IF NOT EXISTS public.cross_platform_revenue (
    id serial NOT NULL,
    estate_id integer NOT NULL,
    period date NOT NULL,
    service_category service_category NOT NULL,
    revenue numeric(12, 2) NOT NULL,
    currency character varying(3) NOT NULL DEFAULT 'NGN',
    customer_count integer NOT NULL,
    growth_rate numeric(5, 2),
    revenue_metrics jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT cross_platform_revenue_pkey PRIMARY KEY (id),
    CONSTRAINT cross_platform_revenue_unique UNIQUE (estate_id, service_category, period),
    CONSTRAINT cross_platform_revenue_estate_id_fkey FOREIGN KEY (estate_id)
        REFERENCES public.estates (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cross_platform_revenue_estate ON public.cross_platform_revenue(estate_id);

CREATE TABLE IF NOT EXISTS public.market_opportunities (
    id serial NOT NULL,
    estate_id integer,
    area_id integer,
    opportunity_type character varying(100) NOT NULL,
    potential_revenue numeric(12, 2),
    currency character varying(3) NOT NULL DEFAULT 'NGN',
    probability numeric(5, 2),
    competition_level integer,
    market_size integer,
    price_trend_data jsonb DEFAULT '{}'::jsonb,
    analysis_data jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT market_opportunities_pkey PRIMARY KEY (id),
    CONSTRAINT market_opportunities_estate_id_fkey FOREIGN KEY (estate_id)
        REFERENCES public.estates (id) ON DELETE SET NULL,
    CONSTRAINT market_opportunities_area_id_fkey FOREIGN KEY (area_id)
        REFERENCES public.areas (id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_estate ON public.market_opportunities(estate_id);
CREATE INDEX IF NOT EXISTS idx_market_opportunities_area ON public.market_opportunities(area_id);

-- Materialized View for Analytical Queries
CREATE MATERIALIZED VIEW IF NOT EXISTS public.estate_analytics AS
    SELECT 
        e.id AS estate_id,
        e.name AS estate_name,
        e.tier,
        d.total_population,
        d.avg_household_income,
        COALESCE(ms.market_share_percentage, 0) AS market_share_percentage,
        COALESCE(cpr.revenue, 0) AS total_revenue,
        COALESCE(sqm.uptime_percentage, 0) AS avg_uptime_percentage
    FROM public.estates e
    LEFT JOIN public.demographics d ON e.id = d.estate_id
    LEFT JOIN public.market_share_data ms ON e.id = ms.estate_id AND ms.period = CURRENT_DATE - INTERVAL '1 month'
    LEFT JOIN public.cross_platform_revenue cpr ON e.id = cpr.estate_id AND cpr.period = CURRENT_DATE - INTERVAL '1 month'
    LEFT JOIN public.service_quality_metrics sqm ON e.id = sqm.estate_id AND sqm.period = CURRENT_DATE - INTERVAL '1 month'
    WITH DATA;

CREATE INDEX IF NOT EXISTS idx_estate_analytics_estate_id ON public.estate_analytics(estate_id);

EXCEPTION WHEN others THEN
        RAISE NOTICE 'Error: %', SQLERRM;
        ROLLBACK;
END;
$$;