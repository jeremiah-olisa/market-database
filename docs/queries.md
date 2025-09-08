# Query System Documentation

## Overview
The query system provides modular access to market intelligence data through specialized query modules.

## Architecture

### Query Orchestrator
`queries/index.js` - Central coordinator that imports and manages all query modules.

### Core Query Modules
- `estateQueries.js` - Estate analysis and insights
- `productQueries.js` - Product performance analysis  
- `areaQueries.js` - Geographic market analysis
- `estateUnitQueries.js` - Unit-level analytics
- `priceTrendQueries.js` - Pricing trend analysis
- `aggregatedViewQueries.js` - Comprehensive market overview

### Extended Intelligence Modules
- `marketIntelligenceQueries.js` - Competitive analysis (core schema only)
- `customerIntelligenceQueries.js` - Customer analytics (core schema only)
- `infrastructureQueries.js` - Infrastructure insights (core schema only)
- `financialQueries.js` - Financial performance (core schema only)

## Usage

### Basic Usage
```javascript
import { estateQueries, areaQueries } from './queries/index.js';

// Get estate occupancy analysis
const occupancy = await estateQueries.getEstateOccupancyAnalysis();

// Get area classification distribution
const distribution = await areaQueries.getAreaClassificationDistribution();
```

### Run All Queries
```javascript
import queryOrchestrator from './queries/index.js';

// Execute all query modules
const results = await queryOrchestrator.runAllQueries();
```

## Query Modules

### estateQueries.js

#### getEstateOccupancyAnalysis()
Returns occupancy status distribution across estates.

**Returns:**
```javascript
[
  {
    classification: 'luxury',
    estate_type: 'bungalow',
    total_estates: 12,
    fully_occupied: 8,
    partially_occupied: 3,
    under_construction: 1
  }
]
```

#### getEstatePerformanceMetrics()
Returns performance metrics by estate classification.

**Returns:**
```javascript
[
  {
    classification: 'luxury',
    estate_type: 'bungalow',
    avg_unit_count: 15.2,
    gated_count: 10,
    secured_count: 12
  }
]
```

### areaQueries.js

#### getAreaClassificationDistribution()
Returns estate distribution by area and classification.

**Returns:**
```javascript
[
  {
    area_name: 'Victoria Island',
    state: 'Lagos',
    luxury_count: 8,
    middle_income_count: 5,
    low_income_count: 2,
    total_estates: 15
  }
]
```

#### getAreaMarketPotential()
Returns market potential analysis by area.

**Returns:**
```javascript
[
  {
    area_name: 'Victoria Island',
    state: 'Lagos',
    avg_unit_count: 18.5,
    total_estates: 15,
    market_potential_score: 85.2
  }
]
```

### priceTrendQueries.js

#### getPriceTrendsByArea()
Returns price trends grouped by geographic area.

**Returns:**
```javascript
[
  {
    area_name: 'Victoria Island',
    state: 'Lagos',
    avg_rent_price: 250000,
    avg_sale_price: 45000000,
    trend_count: 24
  }
]
```

#### getPriceTrendsByProduct()
Returns price trends grouped by product type.

**Returns:**
```javascript
[
  {
    product_name: 'MDU',
    avg_rent_price: 180000,
    avg_sale_price: 32000000,
    trend_count: 42
  }
]
```

### aggregatedViewQueries.js

#### getSystemOverview()
Returns comprehensive system overview.

**Returns:**
```javascript
{
  total_products: 4,
  total_areas: 12,
  total_estates: 37,
  total_units: 148,
  total_price_trends: 168,
  system_status: 'operational'
}
```

#### getBusinessExpansionOpportunities()
Returns business expansion analysis.

**Returns:**
```javascript
[
  {
    area_name: 'Victoria Island',
    classification: 'luxury',
    estate_type: 'bungalow',
    market_gap: 'high_demand_low_supply',
    opportunity_score: 8.5
  }
]
```

## Extended Intelligence Queries

**Note:** These modules currently work with core schema data only. Extended tables will be implemented in Phase 5.

### marketIntelligenceQueries.js

#### getCompetitiveLandscape()
Returns competitive landscape analysis using estate and area data.

**Returns:**
```javascript
[
  {
    area_name: 'Victoria Island',
    state: 'Lagos',
    total_estates: 15,
    luxury_estates: 8,
    middle_income_estates: 5,
    low_income_estates: 2,
    avg_unit_count: 18.5,
    premium_estate_percentage: 86.7
  }
]
```

### customerIntelligenceQueries.js

#### getCustomerUsagePatterns()
Returns usage patterns derived from estate and unit data.

**Returns:**
```javascript
[
  {
    classification: 'luxury',
    estate_type: 'bungalow',
    total_units: 120,
    occupied_units: 95,
    vacant_units: 20,
    under_construction_units: 5,
    occupancy_rate: 79.2
  }
]
```

## Query Performance

### Index Usage
All queries are optimized to use appropriate indexes:
- Foreign key indexes for JOIN operations
- Classification and type indexes for filtering
- Spatial indexes for geographic queries
- Composite indexes for complex filters

### Performance Benchmarks
- **Basic queries**: < 50ms
- **JOIN queries**: 50-200ms  
- **Aggregation queries**: 100-500ms
- **Complex analytics**: 200-1000ms

## Error Handling

### Database Errors
```javascript
try {
  const result = await estateQueries.getEstateOccupancyAnalysis();

  # Query Modules

  ## Core Query Modules

  - `estateQueries.js`: Estate analysis and insights
  - `areaQueries.js`: Area and geographic analysis
  - `businessQueries.js`: Business ecosystem analytics
  - `customerQueries.js`: Customer profiles and usage
  - `competitiveQueries.js`: Competitive benchmarking and market share
  - `financialQueries.js`: Financial and investment analytics
  - `infrastructureQueries.js`: Infrastructure coverage and quality

  ## Query Orchestration

  - Use `queries/index.js` for orchestrating comprehensive analysis:
    - `runComprehensiveAnalysis()` (replaces `runAllQueries`)
    - `getModule(name)` for specific query modules

  ## Usage Example

  ```js
  import queryOrchestrator from './queries/index.js';
  await queryOrchestrator.runComprehensiveAnalysis();
  ```

  ## Query Status

  - Core modules: Working and covered by tests
  - Extended modules: Implemented for new tables (see schema)

  ## Notes

  - Query modules match the latest schema and business logic
  - Aggregated and advanced analytics available for estates, areas, business, customer, competitive, financial, and infrastructure domains
