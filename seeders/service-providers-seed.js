import pool from "../utils/pool.js";

export async function seedServiceProviders(client) {
  console.log("🏢 Seeding service providers data...");
  
  const serviceProvidersData = [
    {
      name: 'TechConnect NG',
      service_type: 'internet',
      coverage_area: 'Victoria Island',
      technology_stack: 'Fiber Optic',
      network_capacity: '10 Gbps',
      metadata: {
        technology_stack: 'Fiber Optic',
        network_capacity: '10 Gbps',
        established_year: 2015,
        coverage_estates: ['Victoria Island', 'Lekki', 'Ikoyi'],
        service_quality: 'premium'
      }
    },
    {
      name: 'NetSpeed Solutions',
      service_type: 'internet',
      coverage_area: 'Lekki',
      technology_stack: 'Hybrid Fiber-Coaxial',
      network_capacity: '5 Gbps',
      metadata: {
        technology_stack: 'Hybrid Fiber-Coaxial',
        network_capacity: '5 Gbps',
        established_year: 2018,
        coverage_estates: ['Lekki', 'Ajah', 'Sangotedo'],
        service_quality: 'standard'
      }
    },
    {
      name: 'ConnectPlus',
      service_type: 'internet',
      coverage_area: 'Ikoyi',
      technology_stack: 'Fiber Optic',
      network_capacity: '8 Gbps',
      metadata: {
        technology_stack: 'Fiber Optic',
        network_capacity: '8 Gbps',
        established_year: 2016,
        coverage_estates: ['Ikoyi', 'Victoria Island', 'Banana Island'],
        service_quality: 'premium'
      }
    },
    {
      name: 'SwiftNet',
      service_type: 'internet',
      coverage_area: 'Surulere',
      technology_stack: 'Wireless',
      network_capacity: '2 Gbps',
      metadata: {
        technology_stack: 'Wireless',
        network_capacity: '2 Gbps',
        established_year: 2020,
        coverage_estates: ['Surulere', 'Yaba', 'Mushin'],
        service_quality: 'basic'
      }
    }
  ];

  for (const data of serviceProvidersData) {
    await client.query(`
      INSERT INTO service_providers (
        name, service_type, coverage_area, technology_stack, 
        network_capacity, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      data.name, data.service_type, data.coverage_area,
      data.technology_stack, data.network_capacity, JSON.stringify(data.metadata)
    ]);
  }

  console.log(`✅ Seeded ${serviceProvidersData.length} service provider records`);
}
