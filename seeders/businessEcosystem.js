import {
  BUSINESS_CATEGORIES,
  generateNigerianCoordinates,
  generateEmail,
  generatePhoneNumber,
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedBusinessCategories(client) {
  console.log('🏪 Seeding business categories...');
  
  // Create root categories first
  const rootCategories = [
    { name: 'Retail & Shopping', description: 'Retail businesses and shopping centers' },
    { name: 'Food & Dining', description: 'Restaurants, cafes, and food services' },
    { name: 'Professional Services', description: 'Business and professional services' },
    { name: 'Healthcare', description: 'Medical and health-related services' },
    { name: 'Education', description: 'Schools, training centers, and educational services' },
    { name: 'Entertainment', description: 'Entertainment and recreational services' }
  ];

  for (const category of rootCategories) {
    // Create valid ltree path: convert to lowercase, replace spaces and special chars with underscores
    const path = category.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters except spaces
      .replace(/\s+/g, '_'); // Replace spaces with underscores
    
    await client.query(
      `INSERT INTO business_categories (name, description, level, path)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [category.name, category.description, 1, path]
    );
  }

  // Create subcategories
  const { rows: rootCats } = await client.query('SELECT id, name FROM business_categories WHERE level = 1');
  
  for (const rootCat of rootCats) {
    const subcategories = BUSINESS_CATEGORIES[rootCat.name.split(' & ')[0]] || [];
    
    for (const subcat of subcategories) {
      // Create valid ltree path: parent_path.child_path
      const parentPath = rootCat.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      
      const childPath = subcat.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '_');
      
      const fullPath = `${parentPath}.${childPath}`;
      
      await client.query(
        `INSERT INTO business_categories (name, parent_id, description, level, path)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          subcat,
          rootCat.id,
          `${subcat} services`,
          2,
          fullPath
        ]
      );
    }
  }
}

export async function seedLocalBusinesses(client) {
  console.log('🏬 Seeding local businesses...');
  
  const { rows: categories } = await client.query('SELECT id, name FROM business_categories WHERE level = 2');
  const { rows: estates } = await client.query('SELECT id, name FROM estates');
  
  const businessNames = {
    'Shopping Mall': ['Jabi Lake Mall', 'Ceddi Plaza', 'Silverbird Galleria', 'Grand Towers Mall'],
    'Supermarket': ['Shoprite', 'Game', 'Next Cash & Carry', 'Ebeano Supermarket'],
    'Restaurant': ['Nkoyo', 'Zuma', 'Bamboo House', 'Spice Route'],
    'Fast Food': ['KFC', 'Domino\'s', 'Chicken Republic', 'Mr Bigg\'s'],
    'Bank': ['GTBank', 'First Bank', 'Zenith Bank', 'Access Bank'],
    'Hospital': ['National Hospital', 'Garki Hospital', 'Asokoro Hospital', 'Wuse Hospital'],
    'School': ['British School', 'American School', 'Lycée Français', 'German School'],
    'Gym': ['Fitness First', 'Ultimate Fitness', 'Body Sculpt', 'Power House Gym']
  };

  for (const estate of estates) {
    const numBusinesses = randomInt(2, 8); // 2-8 businesses per estate
    
    for (let i = 0; i < numBusinesses; i++) {
      const category = randomChoice(categories);
      const businessType = category.name;
      const businessName = businessNames[businessType] ? 
        randomChoice(businessNames[businessType]) : 
        `${businessType} ${estate.name} ${i + 1}`;
      
      const coords = generateNigerianCoordinates();
      const location = `SRID=4326;POINT(${coords.longitude} ${coords.latitude})`;
      
      const business = {
        name: businessName,
        category_id: category.id,
        estate_id: estate.id,
        business_type: businessType,
        status: randomChoice(['active', 'active', 'active', 'temporary_closed']), // 75% active
        establishment_date: new Date(Date.now() - randomInt(365, 3650) * 24 * 60 * 60 * 1000),
        employee_count: randomInt(5, 50),
        floor_area_sqm: randomDecimal(50, 500, 2),
        contact_person: `${businessName} Manager`,
        contact_email: generateEmail(businessName),
        contact_phone: generatePhoneNumber(),
        location: location
      };

      await client.query(
        `INSERT INTO local_businesses (
           name, category_id, estate_id, business_type, status,
           establishment_date, employee_count, floor_area_sqm,
           contact_person, contact_email, contact_phone, location,
           operating_hours, business_metrics, metadata
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
        [
          business.name, business.category_id, business.estate_id,
          business.business_type, business.status, business.establishment_date,
          business.employee_count, business.floor_area_sqm, business.contact_person,
          business.contact_email, business.contact_phone, business.location,
          JSON.stringify({
            monday: '8:00 AM - 6:00 PM',
            tuesday: '8:00 AM - 6:00 PM',
            wednesday: '8:00 AM - 6:00 PM',
            thursday: '8:00 AM - 6:00 PM',
            friday: '8:00 AM - 6:00 PM',
            saturday: '9:00 AM - 4:00 PM',
            sunday: 'Closed'
          }),
          JSON.stringify({
            average_daily_customers: randomInt(20, 200),
            monthly_revenue: randomDecimal(500000, 5000000, 2),
            customer_satisfaction: randomDecimal(3.5, 5.0, 1)
          }),
          JSON.stringify({
            amenities: ['Parking', 'WiFi', 'Air Conditioning'],
            payment_methods: ['Cash', 'Card', 'Transfer'],
            special_features: ['24/7 Service', 'Delivery Available']
          })
        ]
      );
    }
  }
}

export async function seedBusinessReviews(client) {
  console.log('⭐ Seeding business reviews...');
  
  const { rows: businesses } = await client.query('SELECT id FROM local_businesses');
  
  for (const business of businesses) {
    const numReviews = randomInt(3, 15); // 3-15 reviews per business
    
    for (let i = 0; i < numReviews; i++) {
      const reviewDate = new Date(Date.now() - randomInt(0, 365) * 24 * 60 * 60 * 1000);
      
      await client.query(
        `INSERT INTO business_reviews (
           business_id, rating, review_text, reviewer_type,
           review_date, verified, helpful_count
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          business.id,
          randomInt(1, 5),
          randomChoice([
            'Great service and friendly staff!',
            'Good quality but could be faster',
            'Excellent experience, highly recommended',
            'Average service, room for improvement',
            'Outstanding customer service',
            'Good value for money',
            'Could be better organized',
            'Fantastic atmosphere and food'
          ]),
          randomChoice(['customer', 'visitor', 'local resident', 'tourist']),
          reviewDate.toISOString().split('T')[0],
          Math.random() > 0.3, // 70% verified
          randomInt(0, 25)
        ]
      );
    }
  }
}

export async function seedBusinessMetrics(client) {
  console.log('📊 Seeding business metrics...');
  
  const { rows: businesses } = await client.query('SELECT id FROM local_businesses');
  
  // Generate 6 months of historical data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  for (let month = 0; month < 6; month++) {
    const metricDate = new Date(startDate);
    metricDate.setMonth(metricDate.getMonth() + month);
    
    for (const business of businesses) {
      await client.query(
        `INSERT INTO business_metrics (
           business_id, metric_date, foot_traffic,
           sales_volume, currency, peak_hours,
           customer_demographics
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          business.id,
          metricDate.toISOString().split('T')[0],
          randomInt(50, 500),
          randomDecimal(200000, 8000000, 2),
          'NGN',
          JSON.stringify({
            morning: randomInt(10, 30),
            afternoon: randomInt(20, 50),
            evening: randomInt(15, 40)
          }),
          JSON.stringify({
            age_groups: {
              '18-25': randomInt(15, 35),
              '26-35': randomInt(25, 45),
              '36-50': randomInt(20, 40),
              '50+': randomInt(10, 25)
            },
            income_levels: {
              'low': randomInt(10, 30),
              'middle': randomInt(40, 60),
              'high': randomInt(20, 40)
            }
          })
        ]
      );
    }
  }
}
