import {
  MAJOR_ISPS,
  INTERNET_PACKAGES,
  generateEmail,
  generatePhoneNumber,
  randomChoice,
  randomInt,
  randomDecimal
} from './utils/dataGenerators.js';

export async function seedServiceProviders(client) {
  console.log('🏢 Seeding service providers...');

  for (const isp of MAJOR_ISPS) {
    const contactPerson = `${isp.name} Representative`;
    await client.query(
      `INSERT INTO service_providers (
         name, type, contact_person, contact_email,
         contact_phone, website, status, metadata
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        isp.name,
        'ISP',
        contactPerson,
        generateEmail(contactPerson),
        generatePhoneNumber(),
        `https://www.${isp.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com.ng`,
        'active',
        JSON.stringify({
          marketShare: isp.marketShare,
          yearEstablished: randomInt(1990, 2010),
          coverage: randomInt(60, 95)
        })
      ]
    );
  }
}

export async function seedProviderCoverage(client) {
  console.log('📡 Seeding provider coverage...');

  const { rows: providers } = await client.query('SELECT id FROM service_providers');
  const { rows: estates } = await client.query('SELECT id FROM estates');

  for (const provider of providers) {
    // Each provider covers 60-90% of estates
    const coveredEstates = estates
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(estates.length * randomDecimal(0.6, 0.9)));

    for (const estate of coveredEstates) {
      await client.query(
        `INSERT INTO provider_coverage (
           provider_id, estate_id, coverage_type,
           service_quality, coverage_percentage,
           installation_date, last_assessment_date
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          provider.id,
          estate.id,
          randomChoice(['fiber', 'wireless', 'hybrid']),
          randomChoice(['excellent', 'good', 'fair', 'poor']),
          randomDecimal(70, 100, 2),
          new Date(Date.now() - randomInt(0, 1000) * 24 * 60 * 60 * 1000),
          new Date(Date.now() - randomInt(0, 30) * 24 * 60 * 60 * 1000)
        ]
      );
    }
  }
}

export async function seedServiceOfferings(client) {
  console.log('📦 Seeding service offerings...');

  const { rows: providers } = await client.query('SELECT id FROM service_providers');

  for (const provider of providers) {
    for (const [name, details] of Object.entries(INTERNET_PACKAGES)) {
      // Add some variation to base prices
      const priceVariation = randomDecimal(0.8, 1.2);
      const price = Math.round(details.price * priceVariation);

      await client.query(
        `INSERT INTO service_offerings (
           provider_id, name, description, price,
           currency, billing_cycle, features,
           availability_zones
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          provider.id,
          `${name} Package`,
          `${details.speed} high-speed internet package`,
          price,
          'NGN',
          'monthly',
          JSON.stringify({
            speed: details.speed,
            dataLimit: 'Unlimited',
            setupFee: Math.round(price * 2),
            features: [
              'Static IP',
              '24/7 Support',
              'Network Monitoring',
              'Free Installation'
            ]
          }),
          JSON.stringify(['Abuja', 'Lagos', 'Port Harcourt'])
        ]
      );
    }
  }
}

export async function seedMarketShareData(client) {
  console.log('📊 Seeding market share data...');

  const { rows: providers } = await client.query('SELECT id FROM service_providers');
  const { rows: estates } = await client.query('SELECT id FROM estates');
  
  // Generate 12 months of historical data
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 12);
  
  for (let month = 0; month < 12; month++) {
    const period = new Date(startDate);
    period.setMonth(period.getMonth() + month);

    for (const estate of estates) {
      // Distribute 100% market share among providers
      let remainingShare = 100;
      const providersCount = providers.length;

      for (let i = 0; i < providersCount; i++) {
        const isLast = i === providersCount - 1;
        const share = isLast ? remainingShare : randomInt(1, remainingShare - (providersCount - i - 1));
        remainingShare -= share;

        await client.query(
          `INSERT INTO market_share_data (
             provider_id, estate_id, period,
             market_share_percentage, total_customers,
             revenue, currency, data_source,
             confidence_score
           )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            providers[i].id,
            estate.id,
            period.toISOString().split('T')[0],
            share,
            randomInt(50, 500),
            randomDecimal(1000000, 10000000, 2),
            'NGN',
            randomChoice(['market survey', 'sales data', 'customer records']),
            randomDecimal(0.7, 1.0, 2)
          ]
        );
      }
    }
  }
}
