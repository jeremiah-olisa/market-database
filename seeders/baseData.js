import {
  ABUJA_DISTRICTS,
  ESTATE_TYPES,
  UNIT_TYPES,
  INTERNET_PACKAGES,
  generateNigerianCoordinates,
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedProducts(client) {
  console.log('🏢 Seeding products...');
  
  const products = [
    {
      name: 'MDU Data Collection Service',
      slug: 'mdu-data-collection',
      description: 'Comprehensive data collection and analysis service for Multi-Dwelling Units',
      status: 'active'
    },
    {
      name: 'Residential Internet Service',
      slug: 'residential-internet',
      description: 'High-speed fiber internet service for residential customers',
      status: 'active'
    },
    {
      name: 'Business Internet Solutions',
      slug: 'business-internet',
      description: 'Enterprise-grade internet connectivity for businesses',
      status: 'active'
    },
    {
      name: 'Smart Home Integration',
      slug: 'smart-home',
      description: 'IoT and smart home automation solutions',
      status: 'active'
    }
  ];

  for (const product of products) {
    await client.query(
      `INSERT INTO products (name, slug, description, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [product.name, product.slug, product.description, product.status]
    );
  }
}

export async function seedAreas(client) {
  console.log('📍 Seeding areas...');

  for (const [name, details] of Object.entries(ABUJA_DISTRICTS)) {
    const coords = generateNigerianCoordinates();
    const geometry = `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`;
    
    await client.query(
      `INSERT INTO areas (name, state, geo_code, geometry)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [name, 'FCT', `ABJ-${name.substring(0, 3).toUpperCase()}`, geometry]
    );
  }
}

export async function seedEstates(client) {
  console.log('🏘️ Seeding estates...');
  
  const { rows: products } = await client.query('SELECT id FROM products');
  const { rows: areas } = await client.query('SELECT id, name FROM areas');
  
  for (const area of areas) {
    const numEstates = randomInt(3, 8); // 3-8 estates per area
    const areaDetails = ABUJA_DISTRICTS[area.name];
    
    for (let i = 0; i < numEstates; i++) {
      const estateType = randomChoice(Object.keys(ESTATE_TYPES));
      const coords = generateNigerianCoordinates();
      const geometry = `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`;
      
      const estate = {
        name: `${area.name} ${['Gardens', 'Estate', 'Heights', 'Residences'][randomInt(0, 3)]} ${i + 1}`,
        estate_type: estateType,
        product_id: randomChoice(products).id,
        area_id: area.id,
        unit_count: randomInt(10, 100),
        occupancy_status: randomChoice(['fully_occupied', 'vacant', 'under_construction']),
        classification: areaDetails.tier === 'platinum' ? 'luxury' :
                       areaDetails.tier === 'gold' ? 'middle_income' : 'low_income',
        gated: Math.random() > 0.2, // 80% chance of being gated
        has_security: Math.random() > 0.3 // 70% chance of having security
      };

      await client.query(
        `INSERT INTO estates (
           name, estate_type, product_id, area_id, unit_count,
           occupancy_status, classification, gated, has_security, geometry
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          estate.name, estate.estate_type, estate.product_id,
          estate.area_id, estate.unit_count, estate.occupancy_status,
          estate.classification, estate.gated, estate.has_security,
          geometry
        ]
      );
    }
  }
}

export async function seedEstateUnits(client) {
  console.log('🏠 Seeding estate units...');
  
  const { rows: estates } = await client.query('SELECT id, unit_count FROM estates');
  
  for (const estate of estates) {
    for (let i = 0; i < estate.unit_count; i++) {
      const unitType = randomChoice(Object.keys(UNIT_TYPES));
      const floorLevel = randomInt(0, 4).toString();
      const status = randomChoice(['occupied', 'vacant', 'under_construction']);
      const rentPrice = randomDecimal(300000, 5000000, 2);
      const salePrice = rentPrice * 15; // Approximate sale price based on rent

      await client.query(
        `INSERT INTO estate_units (
           estate_id, unit_type, floor_level, status,
           last_surveyed_at, rent_price, sale_price
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          estate.id, unitType, floorLevel, status,
          new Date(Date.now() - randomInt(0, 90) * 24 * 60 * 60 * 1000),
          rentPrice, salePrice
        ]
      );
    }
  }
}

export async function seedPriceTrends(client) {
  console.log('💰 Seeding price trends...');
  
  const { rows: products } = await client.query('SELECT id FROM products');
  const { rows: areas } = await client.query('SELECT id FROM areas');
  const unitTypes = Object.keys(UNIT_TYPES);
  
  // Generate 12 months of historical data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  
  for (let month = 0; month < 12; month++) {
    const period = new Date(startDate);
    period.setMonth(period.getMonth() + month);
    
    for (const area of areas) {
      for (const unitType of unitTypes) {
        // Generate both rent and sale prices
        for (const priceType of ['rent', 'sale']) {
          const basePrice = priceType === 'rent' ? 
            randomDecimal(300000, 5000000, 2) : 
            randomDecimal(25000000, 250000000, 2);
          
          await client.query(
            `INSERT INTO price_trends (
               product_id, area_id, unit_type, price_type,
               price, currency, period, source
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              randomChoice(products).id,
              area.id,
              unitType,
              priceType,
              basePrice,
              'NGN',
              period.toISOString().split('T')[0],
              randomChoice(['field agent', 'market analysis', 'broker data'])
            ]
          );
        }
      }
    }
  }
}
