-- Product status enum
DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('active', 'inactive', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estate type enum
DO $$ BEGIN
    CREATE TYPE estate_type AS ENUM ('bungalow', 'duplex', 'block_of_flats');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Occupancy status enum
DO $$ BEGIN
    CREATE TYPE occupancy_status AS ENUM ('fully_occupied', 'vacant', 'under_construction');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Estate classification enum
DO $$ BEGIN
    CREATE TYPE estate_classification AS ENUM ('luxury', 'middle_income', 'low_income');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Unit status enum
DO $$ BEGIN
    CREATE TYPE unit_status AS ENUM ('occupied', 'vacant', 'under_construction');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Price type enum
DO $$ BEGIN
    CREATE TYPE price_type AS ENUM ('rent', 'sale');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
