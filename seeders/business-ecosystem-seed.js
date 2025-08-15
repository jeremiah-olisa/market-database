import pool from "../utils/pool.js";

export async function seedBusinessEcosystem(client) {
  console.log("🏪 Seeding business ecosystem data...");
  
  // First, seed business categories
  const businessCategoriesData = [
    { name: 'Restaurants', description: 'Food and dining establishments', parent_category_id: null },
    { name: 'Retail', description: 'Shopping and retail stores', parent_category_id: null },
    { name: 'Healthcare', description: 'Medical and health services', parent_category_id: null },
    { name: 'Education', description: 'Schools and educational institutions', parent_category_id: null },
    { name: 'Banking', description: 'Financial services and banks', parent_category_id: null },
    { name: 'Fast Food', description: 'Quick service restaurants', parent_category_id: 1 },
    { name: 'Fine Dining', description: 'High-end restaurants', parent_category_id: 1 },
    { name: 'Supermarkets', description: 'Large retail stores', parent_category_id: 2 },
    { name: 'Boutiques', description: 'Fashion and clothing stores', parent_category_id: 2 },
    { name: 'Hospitals', description: 'Medical facilities', parent_category_id: 3 },
    { name: 'Pharmacies', description: 'Drug stores', parent_category_id: 3 },
    { name: 'Primary Schools', description: 'Elementary education', parent_category_id: 4 },
    { name: 'Universities', description: 'Higher education', parent_category_id: 4 }
  ];

  for (const data of businessCategoriesData) {
    await client.query(`
      INSERT INTO business_categories (name, description, parent_category_id)
      VALUES ($1, $2, $3)
    `, [data.name, data.description, data.parent_category_id]);
  }

  // Then, seed local businesses
  const localBusinessesData = [
    {
      name: 'Spice Garden Restaurant',
      category_id: 1, // Restaurants
      estate_id: 1,
      business_type: 'restaurant',
      address: '123 Victoria Island Drive',
      contact_info: { phone: '+234-801-234-5678', email: 'info@spicegarden.ng' },
      operating_hours: { open: '08:00', close: '22:00' },
      metadata: {
        cuisine_type: 'Nigerian',
        price_range: 'medium',
        rating: 4.5,
        specialties: ['Jollof Rice', 'Pepper Soup', 'Suya']
      }
    },
    {
      name: 'Victoria Mall',
      category_id: 2, // Retail
      estate_id: 1,
      business_type: 'shopping_center',
      address: '456 Victoria Island Boulevard',
      contact_info: { phone: '+234-801-234-5679', email: 'info@victoriamall.ng' },
      operating_hours: { open: '09:00', close: '21:00' },
      metadata: {
        store_count: 50,
        anchor_tenants: ['ShopRite', 'Game', 'Mr Price'],
        parking_spaces: 200
      }
    },
    {
      name: 'Lekki Medical Center',
      category_id: 3, // Healthcare
      estate_id: 2,
      business_type: 'hospital',
      address: '789 Lekki Expressway',
      contact_info: { phone: '+234-801-234-5680', email: 'info@lekkihealth.ng' },
      operating_hours: { open: '24/7', close: '24/7' },
      metadata: {
        specialties: ['Cardiology', 'Pediatrics', 'Emergency Medicine'],
        bed_count: 100,
        accreditation: 'ISO 9001'
      }
    },
    {
      name: 'Lekki International School',
      category_id: 4, // Education
      estate_id: 2,
      business_type: 'school',
      address: '321 Lekki Phase 1',
      contact_info: { phone: '+234-801-234-5681', email: 'info@lekkiinternational.ng' },
      operating_hours: { open: '07:30', close: '15:30' },
      metadata: {
        curriculum: 'British',
        student_count: 800,
        grade_levels: ['Nursery', 'Primary', 'Secondary']
      }
    },
    {
      name: 'Ikoyi Bank Branch',
      category_id: 5, // Banking
      estate_id: 3,
      business_type: 'bank',
      address: '654 Ikoyi Road',
      contact_info: { phone: '+234-801-234-5682', email: 'ikoyi@bank.ng' },
      operating_hours: { open: '08:00', close: '16:00' },
      metadata: {
        services: ['Savings', 'Current Accounts', 'Loans', 'Investment'],
        atm_count: 3,
        drive_through: true
      }
    }
  ];

  for (const data of localBusinessesData) {
    await client.query(`
      INSERT INTO local_businesses (
        name, category_id, estate_id, business_type, address, 
        contact_info, operating_hours, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      data.name, data.category_id, data.estate_id, data.business_type,
      data.address, JSON.stringify(data.contact_info), 
      JSON.stringify(data.operating_hours), JSON.stringify(data.metadata)
    ]);
  }

  console.log(`✅ Seeded ${businessCategoriesData.length} business categories and ${localBusinessesData.length} local business records`);
}
