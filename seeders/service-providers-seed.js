import pool from "../utils/pool.js";

export async function seedServiceProviders(client) {
  console.log("🏢 Seeding service providers data...");
  
  const serviceProvidersData = [
    {
      name: 'TechConnect NG',
      service_type: 'internet',
      coverage_area: 'POLYGON((3.4088 6.4279, 3.4088 6.4479, 3.4288 6.4479, 3.4288 6.4279, 3.4088 6.4279))', // Victoria Island approximate bounds
      technology_stack: {
        fiber: true,
        '5g': false,
        lte: true
      },
      service_quality_rating: 4.8,
      metadata: {
        network_capacity: '10 Gbps',
        established_year: 2015,
        coverage_estates: ['Victoria Island', 'Lekki', 'Ikoyi'],
        service_quality: 'premium'
      }
    },
    {
      name: 'NetSpeed Solutions',
      service_type: 'internet',
      coverage_area: 'POLYGON((3.4500 6.4400, 3.4500 6.4600, 3.4700 6.4600, 3.4700 6.4400, 3.4500 6.4400))', // Lekki approximate bounds
      technology_stack: {
        fiber: true,
        '5g': false,
        lte: true
      },
      service_quality_rating: 4.0,
      metadata: {
        network_capacity: '5 Gbps',
        established_year: 2018,
        coverage_estates: ['Lekki', 'Ajah', 'Sangotedo'],
        service_quality: 'standard'
      }
    },
    {
      name: 'ConnectPlus',
      service_type: 'internet',
      coverage_area: 'POLYGON((3.4300 6.4500, 3.4300 6.4700, 3.4500 6.4700, 3.4500 6.4500, 3.4300 6.4500))', // Ikoyi approximate bounds
      technology_stack: {
        fiber: true,
        '5g': true,
        lte: true
      },
      service_quality_rating: 4.5,
      metadata: {
        network_capacity: '8 Gbps',
        established_year: 2016,
        coverage_estates: ['Ikoyi', 'Victoria Island', 'Banana Island'],
        service_quality: 'premium'
      }
    },
    {
      name: 'SwiftNet',
      service_type: 'internet',
      coverage_area: 'POLYGON((3.3500 6.4900, 3.3500 6.5100, 3.3700 6.5100, 3.3700 6.4900, 3.3500 6.4900))', // Surulere approximate bounds
      technology_stack: {
        fiber: false,
        '5g': false,
        lte: true
      },
      service_quality_rating: 3.5,
      metadata: {
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
        service_quality_rating, metadata
      ) VALUES ($1, $2, ST_GeomFromText($3, 4326), $4, $5, $6)
    `, [
      data.name, data.service_type, data.coverage_area,
      JSON.stringify(data.technology_stack), data.service_quality_rating, JSON.stringify(data.metadata)
    ]);
  }

  console.log(`✅ Seeded ${serviceProvidersData.length} service provider records`);
}
