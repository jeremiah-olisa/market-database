# Seeders

## Seeder Files
- `database-seeder.js`: Main seeder for all tables
- `seed.js`: Entry point for seeding process

## Seeded Data
- Areas (with Nigerian states)
- Estates (with tiers, classifications, and area linkage)
- Demographics (population, household, distributions)
- Service Providers (at least 5 major providers)
- Service Offerings (linked to providers)
- Provider Coverage (linked to estates and providers)
- Competitive Benchmarking (service comparisons)
- Market Share Data (provider-estate-period)
- Local Businesses (various types, linked to estates)
- Customer Profiles (residential, business, linked to estates)
- Usage Patterns (linked to customer profiles)
- Customer Feedback (linked to customer profiles)

## Usage
Run `pnpm seed` to seed the database

## Notes
- Seeders are idempotent and safe for re-run
- Data covers all core and extended tables
- Ensures realistic and diverse data for testing and analytics
# Data Seeders Documentation

## Overview
Data seeding system for populating the database with sample data for development and testing.

## Seeder Structure

### Main Seeder
`seeders/seed.js` - Primary seeder that orchestrates all data seeding operations.

### Specialized Seeders
- `baseData.js` - Core product and area data
- `businessEcosystem.js` - Business ecosystem data (future)
- `competitiveIntelligence.js` - Competitive data (future)
- `customerIntelligence.js` - Customer data (future)
- `economicActivity.js` - Economic indicators (future)
- `estateData.js` - Estate and unit data
- `extendedServices.js` - Extended services (future)
- `financialIntelligence.js` - Financial data (future)
- `infrastructure.js` - Infrastructure data (future)
- `marketIntelligence.js` - Market intelligence (future)

### Utilities
- `utils/dataGenerators.js` - Data generation utilities
- `cleanup.js` - Data cleanup and reset utilities

## Data Structure

### Products (4 records)
```javascript
[
  {
    name: 'MDU',
    slug: 'mdu',
    description: 'Multi-Dwelling Unit services',
    status: 'active'
  },
  {
    name: 'Internet Services',
    slug: 'internet-services',
    description: 'High-speed internet connectivity',
    status: 'active'
  },
  {
    name: 'Business Solutions',
    slug: 'business-solutions',
    description: 'Enterprise business services',
    status: 'active'
  },
  {
    name: 'Smart Home Technology',
    slug: 'smart-home-technology',
    description: 'IoT and automation services',
    status: 'active'
  }
]
```

### Areas (12 records)
```javascript
[
  {
    name: 'Victoria Island',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.4216 6.4281)'
  },
  {
    name: 'Ikoyi',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.4220 6.4491)'
  },
  {
    name: 'Lekki',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.4690 6.4444)'
  },
  {
    name: 'Banana Island',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.4220 6.4491)'
  },
  {
    name: 'Ajah',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.4690 6.4444)'
  },
  {
    name: 'Surulere',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.3500 6.5000)'
  },
  {
    name: 'Yaba',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.3800 6.5200)'
  },
  {
    name: 'Ikeja',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.3500 6.6000)'
  },
  {
    name: 'Opebi',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.3500 6.6000)'
  },
  {
    name: 'Allen',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.3500 6.6000)'
  },
  {
    name: 'Maryland',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.3500 6.6000)'
  },
  {
    name: 'Gbagada',
    state: 'Lagos',
    country: 'Nigeria',
    coordinates: 'POINT(3.3800 6.5500)'
  }
]
```

### Estates (37 records)
```javascript
// Sample estate structure
{
  name: 'Victoria Court',
  product_id: 1, // MDU
  area_id: 1,    // Victoria Island
  estate_type: 'apartment',
  classification: 'luxury',
  unit_count: 24,
  gated: true,
  has_security: true,
  occupancy_status: 'fully_occupied'
}
```

### Estate Units (148 records)
```javascript
// Sample unit structure
{
  estate_id: 1,
  unit_type: '2BR',
  status: 'occupied',
  rent_price: 250000,
  sale_price: 45000000
}
```

### Price Trends (168 records)
```javascript
// Sample price trend structure
{
  product_id: 1,
  area_id: 1,
  price_type: 'rent',
  price: 250000,
  date: '2024-01-15'
}
```

## Usage

### Run All Seeders
```bash
# Seed complete database
node seeders/seed.js
```

### Individual Seeders
```javascript
import { seedBaseData, seedEstateData } from './seeders/index.js';

// Seed base data only
await seedBaseData();

// Seed estate data only
await seedEstateData();
```

### Seeding Process
```javascript
// Main seeding flow
async function seedDatabase() {
    console.log('🌱 Starting database seeding...');
    
    try {
        // 1. Seed base data
        await seedBaseData();
        console.log('✅ Base data seeded');
        
        // 2. Seed estate data
        await seedEstateData();
        console.log('✅ Estate data seeded');
        
        // 3. Seed price trends
        await seedPriceTrends();
        console.log('✅ Price trends seeded');
        
        console.log('🎉 Database seeding completed successfully');
        
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        throw error;
    }
}
```

## Data Generation

### Random Data Generation
```javascript
// Generate random estate names
function generateEstateName() {
    const prefixes = ['Victoria', 'Royal', 'Golden', 'Silver', 'Platinum'];
    const suffixes = ['Court', 'Gardens', 'Residence', 'Manor', 'Palace'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${suffix}`;
}

// Generate random coordinates within area bounds
function generateCoordinates(areaBounds) {
    const lat = areaBounds.minLat + Math.random() * (areaBounds.maxLat - areaBounds.minLat);
    const lng = areaBounds.minLng + Math.random() * (areaBounds.maxLng - areaBounds.minLng);
    
    return `POINT(${lng} ${lat})`;
}
```

### Realistic Data Patterns
```javascript
// Estate classification distribution
const classificationDistribution = {
    luxury: 0.4,        // 40% luxury estates
    middle_income: 0.4, // 40% middle income
    low_income: 0.2     // 20% low income
};

// Estate type distribution
const estateTypeDistribution = {
    apartment: 0.5,     // 50% apartments
    bungalow: 0.3,      // 30% bungalows
    duplex: 0.1,        // 10% duplexes
    mansion: 0.05,      // 5% mansions
    penthouse: 0.05     // 5% penthouses
};
```

## Data Validation

### Constraint Validation
```javascript
// Validate enum values
const validClassifications = ['luxury', 'middle_income', 'low_income'];
const validEstateTypes = ['apartment', 'bungalow', 'duplex', 'mansion', 'penthouse'];

// Validate data before insertion
function validateEstateData(estate) {
    if (!validClassifications.includes(estate.classification)) {
        throw new Error(`Invalid classification: ${estate.classification}`);
    }
    
    if (!validEstateTypes.includes(estate.estate_type)) {
        throw new Error(`Invalid estate type: ${estate.estate_type}`);
    }
    
    if (estate.unit_count < 0) {
        throw new Error('Unit count must be positive');
    }
}
```

### Foreign Key Validation
```javascript
// Ensure referenced records exist
async function validateForeignKeys(estate) {
    const productExists = await pool.query(
        'SELECT id FROM products WHERE id = $1',
        [estate.product_id]
    );
    
    if (productExists.rows.length === 0) {
        throw new Error(`Product ${estate.product_id} does not exist`);
    }
    
    const areaExists = await pool.query(
        'SELECT id FROM areas WHERE id = $1',
        [estate.area_id]
    );
    
    if (areaExists.rows.length === 0) {
        throw new Error(`Area ${estate.area_id} does not exist`);
    }
}
```

## Cleanup and Reset

### Data Cleanup
```javascript
// Clean all seeded data
async function cleanupDatabase() {
    console.log('🧹 Cleaning database...');
    
    try {
        // Delete in reverse dependency order
        await pool.query('DELETE FROM price_trends');
        await pool.query('DELETE FROM estate_units');
        await pool.query('DELETE FROM estates');
        await pool.query('DELETE FROM areas');
        await pool.query('DELETE FROM products');
        
        console.log('✅ Database cleaned');
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        throw error;
    }
}
```

### Reset Sequences
```javascript
// Reset auto-increment sequences
async function resetSequences() {
    const tables = ['products', 'areas', 'estates', 'estate_units', 'price_trends'];
    
    for (const table of tables) {
        await pool.query(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`);
    }
    
    console.log('✅ Sequences reset');
}
```

## Configuration

### Environment Variables
```bash
# Database connection
DATABASE_URL=postgresql://user:password@localhost:5432/market_database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=market_database
DB_USER=your_username
DB_PASSWORD=your_password

# Seeding configuration
SEED_DATA_SIZE=medium  # small, medium, large
SEED_RANDOM_SEED=12345 # For reproducible random data
```

### Seeding Options
```javascript
// Seeding configuration
const seedingConfig = {
    dataSize: process.env.SEED_DATA_SIZE || 'medium',
    randomSeed: process.env.SEED_RANDOM_SEED || Date.now(),
    enableLogging: true,
    validateData: true,
    cleanupBeforeSeed: false
};

// Data size mappings
const dataSizeMap = {
    small: {
        estates: 10,
        units: 40,
        priceTrends: 50
    },
    medium: {
        estates: 37,
        units: 148,
        priceTrends: 168
    },
    large: {
        estates: 100,
        units: 400,
        priceTrends: 500
    }
};
```

## Performance Considerations

### Batch Insertion
```javascript
// Use batch inserts for better performance
async function batchInsertEstates(estates) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        for (const estate of estates) {
            await client.query(`
                INSERT INTO estates (name, product_id, area_id, estate_type, classification, unit_count, gated, has_security, occupancy_status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [estate.name, estate.product_id, estate.area_id, estate.estate_type, estate.classification, estate.unit_count, estate.gated, estate.has_security, estate.occupancy_status]);
        }
        
        await client.query('COMMIT');
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
        
    } finally {
        client.release();
    }
}
```

### Transaction Management
```javascript
// Wrap seeding in transaction
async function seedWithTransaction(seedingFunction) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        await seedingFunction(client);
        await client.query('COMMIT');
        
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
        
    } finally {
        client.release();
    }
}
```
