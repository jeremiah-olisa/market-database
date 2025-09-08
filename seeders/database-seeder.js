import { pool } from "../utils";
import { NIGERIAN_DATA } from "./utils/dataGenerators.js";

export class DatabaseSeeder {
    constructor() {
        this.areaIds = [];
        this.estateIds = [];
        this.providerIds = [];
        this.serviceIds = [];
        this.businessIds = [];
        this.customerIds = [];
    }

    async seed() {
        try {
            console.log('Starting Nigerian Market Intelligence Database Seeding...');

            await this.seedAreas();
            await this.seedEstates();
            await this.seedDemographics();
            await this.seedServiceProviders();
            await this.seedServiceOfferings();
            await this.seedProviderCoverage();
            await this.seedMarketShareData();
            await this.seedLocalBusinesses();
            await this.seedCustomerProfiles();
            await this.seedUsagePatterns();
            await this.seedCustomerFeedback();
            await this.seedChurnRiskIndicators();
            await this.seedNetworkInfrastructure();
            await this.seedServiceQualityMetrics();
            await this.seedCrossPlatformRevenue();
            await this.seedMarketOpportunities();
            await this.seedCompetitiveBenchmarking();

            console.log('✅ Database seeding completed successfully!');
        } catch (error) {
            console.error('❌ Seeding error:', error);
        } finally {
            await pool.end();
        }
    }


    async seedAreas() {
        console.log('Seeding areas...');
        const areas = [];

        // Lagos areas
        NIGERIAN_DATA.lagosAreas.forEach(area => {
            const baseLon = 3.4; // Base longitude for Lagos
            const baseLat = 6.5; // Base latitude for Lagos

            // Generate 4 distinct points for a simple quadrilateral
            const point1 = `${baseLon + Math.random() * 0.1} ${baseLat + Math.random() * 0.1}`;
            const point2 = `${baseLon + Math.random() * 0.1} ${baseLat + Math.random() * 0.1 + 0.05}`;
            const point3 = `${baseLon + Math.random() * 0.1 + 0.05} ${baseLat + Math.random() * 0.1 + 0.05}`;
            const point4 = `${baseLon + Math.random() * 0.1 + 0.05} ${baseLat + Math.random() * 0.1}`;

            areas.push({
                name: area,
                state: 'Lagos',
                geo_code: `LG${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                geometry: `SRID=4326;MULTIPOLYGON((( ${point1}, ${point2}, ${point3}, ${point4}, ${point1} )))`
            });
        });

        // Abuja areas
        NIGERIAN_DATA.abujaAreas.forEach(area => {
            const baseLon = 7.5; // Base longitude for Abuja
            const baseLat = 9.0; // Base latitude for Abuja

            // Generate 4 distinct points for a simple quadrilateral
            const point1 = `${baseLon + Math.random() * 0.1} ${baseLat + Math.random() * 0.1}`;
            const point2 = `${baseLon + Math.random() * 0.1} ${baseLat + Math.random() * 0.1 + 0.05}`;
            const point3 = `${baseLon + Math.random() * 0.1 + 0.05} ${baseLat + Math.random() * 0.1 + 0.05}`;
            const point4 = `${baseLon + Math.random() * 0.1 + 0.05} ${baseLat + Math.random() * 0.1}`;

            areas.push({
                name: area,
                state: 'Abuja',
                geo_code: `ABJ${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
                geometry: `SRID=4326;MULTIPOLYGON((( ${point1}, ${point2}, ${point3}, ${point4}, ${point1} )))`
            });
        });

        for (const area of areas) {
            try {
                // console.log(`Inserting area: ${area.name} with geometry: ${area.geometry}`);
                const result = await pool.query(
                    `INSERT INTO areas (name, state, geo_code, geometry) 
                 VALUES ($1, $2, $3, ST_GeomFromEWKT($4)) 
                 RETURNING id`,
                    [area.name, area.state, area.geo_code, area.geometry]
                );
                this.areaIds.push(result.rows[0].id);
            } catch (error) {
                console.error(`Error inserting area ${area.name}:`, error.message);
                // Insert without geometry if there's an error
                const result = await pool.query(
                    `INSERT INTO areas (name, state, geo_code) 
                 VALUES ($1, $2, $3) 
                 RETURNING id`,
                    [area.name, area.state, area.geo_code]
                );
                this.areaIds.push(result.rows[0].id);
            }
        }
    }

    async seedEstates() {
        console.log('Seeding estates...');
        const estates = [];

        // Lagos estates
        NIGERIAN_DATA.lagosEstates.forEach((estate, index) => {
            const baseLon = 3.4;
            const baseLat = 6.5;

            estates.push({
                name: estate,
                area_id: this.areaIds[index % NIGERIAN_DATA.lagosAreas.length],
                tier: ['platinum', 'gold', 'silver', 'bronze'][Math.floor(Math.random() * 4)],
                unit_count: Math.floor(Math.random() * 500) + 100,
                gated: Math.random() > 0.3,
                geometry: `SRID=4326;POINT(${baseLon + Math.random() * 0.2} ${baseLat + Math.random() * 0.2})`,
                economic_indicators: JSON.stringify({
                    average_rent: Math.floor(Math.random() * 5000000) + 1000000,
                    property_value: Math.floor(Math.random() * 100000000) + 50000000,
                    commercial_activity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
                })
            });
        });

        // Abuja estates
        NIGERIAN_DATA.abujaEstates.forEach((estate, index) => {
            const baseLon = 7.5;
            const baseLat = 9.0;

            estates.push({
                name: estate,
                area_id: this.areaIds[NIGERIAN_DATA.lagosAreas.length + (index % NIGERIAN_DATA.abujaAreas.length)],
                tier: ['platinum', 'gold', 'silver', 'bronze'][Math.floor(Math.random() * 4)],
                unit_count: Math.floor(Math.random() * 400) + 80,
                gated: Math.random() > 0.2,
                geometry: `SRID=4326;POINT(${baseLon + Math.random() * 0.2} ${baseLat + Math.random() * 0.2})`,
                economic_indicators: JSON.stringify({
                    average_rent: Math.floor(Math.random() * 6000000) + 1500000,
                    property_value: Math.floor(Math.random() * 120000000) + 60000000,
                    commercial_activity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)]
                })
            });
        });

        for (const estate of estates) {
            try {
                const result = await pool.query(
                    `INSERT INTO estates (name, area_id, tier, unit_count, gated, geometry, economic_indicators) 
                 VALUES ($1, $2, $3, $4, $5, ST_GeomFromEWKT($6), $7) 
                 RETURNING id`,
                    [estate.name, estate.area_id, estate.tier, estate.unit_count, estate.gated, estate.geometry, estate.economic_indicators]
                );
                this.estateIds.push(result.rows[0].id);
            } catch (error) {
                console.error(`Error inserting estate ${estate.name}:`, error.message);
                // Insert without geometry if there's an error
                const result = await pool.query(
                    `INSERT INTO estates (name, area_id, tier, unit_count, gated, economic_indicators) 
                 VALUES ($1, $2, $3, $4, $5, $6) 
                 RETURNING id`,
                    [estate.name, estate.area_id, estate.tier, estate.unit_count, estate.gated, estate.economic_indicators]
                );
                this.estateIds.push(result.rows[0].id);
            }
        }
    }

    async seedDemographics() {
        console.log('Seeding demographics...');
        for (const estateId of this.estateIds) {
            await pool.query(
                `INSERT INTO demographics (estate_id, total_population, avg_household_size, avg_household_income, 
                 age_distribution, income_distribution, lifestyle_indicators) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    estateId,
                    Math.floor(Math.random() * 5000) + 1000,
                    (Math.random() * 3 + 2).toFixed(2),
                    Math.floor(Math.random() * 5000000) + 1000000,
                    JSON.stringify({
                        '18-25': Math.floor(Math.random() * 20) + 10,
                        '26-35': Math.floor(Math.random() * 30) + 20,
                        '36-45': Math.floor(Math.random() * 25) + 15,
                        '46-55': Math.floor(Math.random() * 15) + 10,
                        '56+': Math.floor(Math.random() * 10) + 5
                    }),
                    JSON.stringify({
                        'Low (<₦100k)': Math.floor(Math.random() * 20) + 5,
                        'Lower Middle (₦100k-₦300k)': Math.floor(Math.random() * 30) + 15,
                        'Middle (₦300k-₦700k)': Math.floor(Math.random() * 25) + 20,
                        'Upper Middle (₦700k-₦1.5m)': Math.floor(Math.random() * 15) + 10,
                        'High (>₦1.5m)': Math.floor(Math.random() * 10) + 5
                    }),
                    JSON.stringify({
                        restaurants: Math.floor(Math.random() * 20) + 5,
                        entertainment: Math.floor(Math.random() * 15) + 3,
                        shopping: Math.floor(Math.random() * 25) + 10,
                        fitness: Math.floor(Math.random() * 10) + 2
                    })
                ]
            );
        }
    }

    async seedServiceProviders() {
        console.log('Seeding service providers...');

        // Define arrays properly for PostgreSQL
        const advantagesOptions = [
            ['Fast speeds', 'Good coverage'],
            ['Reliable service', 'Good customer support'],
            ['Affordable pricing', 'Wide coverage'],
            ['Latest technology', '24/7 support']
        ];

        const disadvantagesOptions = [
            ['Expensive', 'Limited coverage'],
            ['Poor customer service', 'Frequent outages'],
            ['Slow speeds', 'Limited data caps'],
            ['Long contract terms', 'Hidden fees']
        ];

        for (const providerName of NIGERIAN_DATA.internetProviders) {
            const randomAdvantages = advantagesOptions[Math.floor(Math.random() * advantagesOptions.length)];
            const randomDisadvantages = disadvantagesOptions[Math.floor(Math.random() * disadvantagesOptions.length)];

            const result = await pool.query(
                `INSERT INTO service_providers (name, type, contact_email, contact_phone, website, status, 
             competitive_advantages, competitive_disadvantages) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
             RETURNING id`,
                [
                    providerName,
                    'Internet Service Provider',
                    `contact@${providerName.toLowerCase().replace(/\s+/g, '')}.com`,
                    NIGERIAN_DATA.generatePhoneNumber(),
                    `https://www.${providerName.toLowerCase().replace(/\s+/g, '')}.com`,
                    'active',
                    randomAdvantages, // This is now an array, not a string
                    randomDisadvantages // This is now an array, not a string
                ]
            );
            this.providerIds.push(result.rows[0].id);
        }
    }

    async seedServiceOfferings() {
        console.log('Seeding service offerings...');
        const plans = [
            { name: 'Basic 10Mbps', price: 15000, speed: '10Mbps', data: 'Unlimited' },
            { name: 'Standard 25Mbps', price: 25000, speed: '25Mbps', data: 'Unlimited' },
            { name: 'Premium 50Mbps', price: 40000, speed: '50Mbps', data: 'Unlimited' },
            { name: 'Business 100Mbps', price: 75000, speed: '100Mbps', data: 'Unlimited' }
        ];

        for (const providerId of this.providerIds) {
            for (const plan of plans) {
                const result = await pool.query(
                    `INSERT INTO service_offerings (provider_id, name, price, currency, billing_cycle, 
                     features, service_category) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) 
                     RETURNING id`,
                    [
                        providerId,
                        plan.name,
                        plan.price,
                        'NGN',
                        'monthly',
                        JSON.stringify({
                            speed: plan.speed,
                            data_cap: plan.data,
                            installation_fee: Math.floor(Math.random() * 20000) + 10000,
                            contract_length: '12 months'
                        }),
                        'internet'
                    ]
                );
                this.serviceIds.push(result.rows[0].id);
            }
        }
    }

    async seedProviderCoverage() {
        console.log('Seeding provider coverage...');
        for (const providerId of this.providerIds) {
            for (const estateId of this.estateIds) {
                // Not all providers cover all estates
                if (Math.random() > 0.4) {
                    await pool.query(
                        `INSERT INTO provider_coverage (provider_id, estate_id, coverage_type, 
                         service_quality, coverage_percentage, last_assessment_date) 
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [
                            providerId,
                            estateId,
                            'fiber',
                            ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
                            Math.floor(Math.random() * 100) + 1,
                            new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000)
                        ]
                    );
                }
            }
        }
    }

    async seedMarketShareData() {
        console.log('Seeding market share data...');
        const currentDate = new Date();

        for (const providerId of this.providerIds) {
            for (const estateId of this.estateIds) {
                // Only seed for some combinations
                if (Math.random() > 0.6) {
                    await pool.query(
                        `INSERT INTO market_share_data (provider_id, estate_id, period, 
                         market_share_percentage, total_customers, revenue, currency, confidence_score) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                        [
                            providerId,
                            estateId,
                            new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
                            (Math.random() * 50 + 10).toFixed(2),
                            Math.floor(Math.random() * 500) + 50,
                            Math.floor(Math.random() * 50000000) + 10000000,
                            'NGN',
                            (Math.random() * 0.5 + 0.5).toFixed(2)
                        ]
                    );
                }
            }
        }
    }

    async seedLocalBusinesses() {
        console.log('Seeding local businesses...');
        const businessCategories = Object.keys(NIGERIAN_DATA.businessTypes);

        for (const estateId of this.estateIds) {
            // Create 5-15 businesses per estate
            const businessCount = Math.floor(Math.random() * 10) + 5;

            for (let i = 0; i < businessCount; i++) {
                const category = businessCategories[Math.floor(Math.random() * businessCategories.length)];
                const businessName = NIGERIAN_DATA.getRandomBusiness(category);

                // Generate proper coordinates for Lagos area
                const longitude = (3.4 + Math.random() * 0.2).toFixed(6); // Lagos longitude range: 3.4-3.6
                const latitude = (6.5 + Math.random() * 0.2).toFixed(6);  // Lagos latitude range: 6.5-6.7
                const geometry = `SRID=4326;POINT(${longitude} ${latitude})`;

                try {
                    const result = await pool.query(
                        `INSERT INTO local_businesses (name, estate_id, business_type, status, 
                     operating_hours, contact_phone, location, business_metrics) 
                     VALUES ($1, $2, $3, $4, $5, $6, ST_GeomFromEWKT($7), $8) 
                     RETURNING id`,
                        [
                            businessName,
                            estateId,
                            category,
                            'active',
                            JSON.stringify({
                                monday_friday: '8:00 AM - 6:00 PM',
                                saturday: '9:00 AM - 4:00 PM',
                                sunday: 'Closed'
                            }),
                            NIGERIAN_DATA.generatePhoneNumber(),
                            geometry,
                            JSON.stringify({
                                monthly_revenue: Math.floor(Math.random() * 5000000) + 500000,
                                customer_traffic: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
                                employee_count: Math.floor(Math.random() * 20) + 3
                            })
                        ]
                    );
                    this.businessIds.push(result.rows[0].id);
                } catch (error) {
                    console.error(`Error inserting business ${businessName}:`, error.message);
                    // Insert without geometry if there's an error
                    const result = await pool.query(
                        `INSERT INTO local_businesses (name, estate_id, business_type, status, 
                     operating_hours, contact_phone, business_metrics) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) 
                     RETURNING id`,
                        [
                            businessName,
                            estateId,
                            category,
                            'active',
                            JSON.stringify({
                                monday_friday: '8:00 AM - 6:00 PM',
                                saturday: '9:00 AM - 4:00 PM',
                                sunday: 'Closed'
                            }),
                            NIGERIAN_DATA.generatePhoneNumber(),
                            JSON.stringify({
                                monthly_revenue: Math.floor(Math.random() * 5000000) + 500000,
                                customer_traffic: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
                                employee_count: Math.floor(Math.random() * 20) + 3
                            })
                        ]
                    );
                    this.businessIds.push(result.rows[0].id);
                }
            }
        }
    }

    async seedCustomerProfiles() {
        console.log('Seeding customer profiles...');
        this.customerIds = []; // Reset to ensure clean array

        // Define lifestyle tags options as arrays
        const lifestyleOptions = [
            ['internet_user'],
            ['streaming'],
            ['gaming'],
            ['remote_work'],
            ['small_business'],
            ['internet_user', 'streaming'],
            ['gaming', 'streaming'],
            ['remote_work', 'internet_user'],
            ['small_business', 'internet_user'],
            ['streaming', 'gaming', 'internet_user']
        ];

        for (const estateId of this.estateIds) {
            // Create 50-200 customers per estate
            const customerCount = Math.floor(Math.random() * 150) + 50;

            for (let i = 0; i < customerCount; i++) {
                const customerName = NIGERIAN_DATA.customerNames[Math.floor(Math.random() * NIGERIAN_DATA.customerNames.length)];

                try {
                    const result = await pool.query(
                        `INSERT INTO customer_profiles (estate_id, customer_type, status, registration_date, 
                     household_size, income_bracket, age_bracket, lifestyle_tags, contact_email, contact_phone) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                     RETURNING id`,
                        [
                            estateId,
                            ['residential', 'business'][Math.floor(Math.random() * 2)],
                            'active',
                            new Date(Date.now() - Math.floor(Math.random() * 365 * 2) * 24 * 60 * 60 * 1000),
                            Math.floor(Math.random() * 6) + 1,
                            NIGERIAN_DATA.generateIncomeBracket(),
                            NIGERIAN_DATA.generateAgeBracket(),
                            lifestyleOptions[Math.floor(Math.random() * lifestyleOptions.length)], // This is now an array
                            NIGERIAN_DATA.generateEmail(customerName),
                            NIGERIAN_DATA.generatePhoneNumber()
                        ]
                    );
                    this.customerIds.push(result.rows[0].id);
                } catch (error) {
                    console.error('Error inserting customer profile:', error.message);
                    // Continue with next customer
                    continue;
                }
            }
        }

        console.log(`✅ Created ${this.customerIds.length} customer profiles`);
    }

    async seedUsagePatterns() {
        console.log('Seeding usage patterns...');
        const currentDate = new Date();

        for (const customerId of this.customerIds) {
            // Create usage data for the last 3 months for each customer
            for (let i = 0; i < 3; i++) {
                const usageDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);

                await pool.query(
                    `INSERT INTO usage_patterns (customer_id, service_type, usage_date, 
                 data_consumed, peak_usage_time, usage_duration, usage_metrics) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        customerId,
                        'internet',
                        usageDate,
                        Math.floor(Math.random() * 500) + 50, // GB
                        `${Math.floor(Math.random() * 12) + 8}:00`, // 8AM-8PM
                        Math.floor(Math.random() * 6) + 2, // hours per day
                        JSON.stringify({
                            daily_avg_usage: (Math.random() * 8 + 2).toFixed(1),
                            peak_hours: ['19:00-21:00', '20:00-22:00', '18:00-20:00'][Math.floor(Math.random() * 3)],
                            weekend_usage: (Math.random() * 30 + 20).toFixed(1) + '% higher',
                            devices_connected: Math.floor(Math.random() * 8) + 2
                        })
                    ]
                );
            }
        }
    }

    async seedCustomerFeedback() {
        console.log('Seeding customer feedback...');

        // Check if we have customer IDs
        if (this.customerIds.length === 0) {
            console.warn('⚠️ No customer IDs available. Skipping customer feedback seeding.');
            return;
        }

        const feedbackTypes = ['billing', 'speed', 'reliability', 'customer_service', 'coverage'];
        const statuses = ['pending', 'in_progress', 'resolved', 'closed'];

        for (let i = 0; i < 200; i++) {
            const customerId = this.customerIds[Math.floor(Math.random() * this.customerIds.length)];

            // Double-check that customerId is not null/undefined
            if (!customerId) {
                console.warn('⚠️ Skipping customer feedback due to null customer ID');
                continue;
            }

            const feedbackDate = new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000);

            try {
                await pool.query(
                    `INSERT INTO customer_feedback (customer_id, service_type, feedback_date, 
                 satisfaction_level, feedback_text, priority, resolution_status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        customerId,
                        'internet',
                        feedbackDate,
                        ['very_satisfied', 'satisfied', 'neutral', 'dissatisfied', 'very_dissatisfied'][Math.floor(Math.random() * 5)],
                        `Issue with ${feedbackTypes[Math.floor(Math.random() * feedbackTypes.length)]} service. ${[
                            'Speed is too slow during peak hours',
                            'Billing amount seems incorrect',
                            'Frequent disconnections in the evening',
                            'Customer service response time is slow',
                            'Network coverage is poor in some areas'
                        ][Math.floor(Math.random() * 5)]}`,
                        Math.floor(Math.random() * 5) + 1,
                        statuses[Math.floor(Math.random() * statuses.length)]
                    ]
                );
            } catch (error) {
                console.error('Error inserting customer feedback:', error.message);
                // Continue with next iteration instead of stopping
                continue;
            }
        }
    }

    async seedChurnRiskIndicators() {
        console.log('Seeding churn risk indicators...');
        const currentDate = new Date();

        for (const customerId of this.customerIds) {
            // Only assess 30% of customers for churn risk
            if (Math.random() < 0.3) {
                await pool.query(
                    `INSERT INTO churn_risk_indicators (customer_id, assessment_date, 
                 churn_probability, risk_factors, usage_trends) 
                 VALUES ($1, $2, $3, $4, $5)`,
                    [
                        customerId,
                        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15),
                        (Math.random() * 50 + 10).toFixed(2), // 10-60% probability
                        JSON.stringify({
                            complaint_count: Math.floor(Math.random() * 5),
                            payment_delays: Math.random() > 0.7,
                            usage_decline: (Math.random() * 40 + 10).toFixed(1) + '%',
                            competitor_approaches: Math.random() > 0.8
                        }),
                        JSON.stringify({
                            last_3_months: [
                                Math.floor(Math.random() * 400) + 100,
                                Math.floor(Math.random() * 380) + 90,
                                Math.floor(Math.random() * 350) + 80
                            ],
                            trend: ['stable', 'declining', 'volatile'][Math.floor(Math.random() * 3)]
                        })
                    ]
                );
            }
        }
    }

    async seedNetworkInfrastructure() {
        console.log('Seeding network infrastructure...');
        const infrastructureTypes = ['fiber', 'tower', 'router'];
        const statuses = ['operational', 'maintenance', 'down'];

        for (const estateId of this.estateIds) {
            // Create 2-5 infrastructure items per estate
            const infraCount = Math.floor(Math.random() * 4) + 2;

            for (let i = 0; i < infraCount; i++) {
                // Generate proper coordinates for Lagos area
                const baseLon = 3.4; // Base longitude for Lagos
                const baseLat = 6.5; // Base latitude for Lagos

                // Point location
                const pointLon = (baseLon + Math.random() * 0.2).toFixed(6);
                const pointLat = (baseLat + Math.random() * 0.2).toFixed(6);
                const pointGeometry = `SRID=4326;POINT(${pointLon} ${pointLat})`;

                // Simple polygon around the point (small coverage area)
                const polyLon1 = (baseLon + Math.random() * 0.1).toFixed(6);
                const polyLat1 = (baseLat + Math.random() * 0.1).toFixed(6);
                const polyLon2 = (parseFloat(polyLon1) + 0.01).toFixed(6);
                const polyLat2 = (parseFloat(polyLat1) + 0.01).toFixed(6);
                const polyLon3 = (parseFloat(polyLon1) + 0.01).toFixed(6);
                const polyLat3 = (parseFloat(polyLat1) - 0.01).toFixed(6);
                const polyLon4 = (parseFloat(polyLon1) - 0.01).toFixed(6);
                const polyLat4 = (parseFloat(polyLat1) - 0.01).toFixed(6);

                const polygonGeometry = `SRID=4326;POLYGON((
                ${polyLon1} ${polyLat1},
                ${polyLon2} ${polyLat2},
                ${polyLon3} ${polyLat3},
                ${polyLon4} ${polyLat4},
                ${polyLon1} ${polyLat1}
            ))`;

                try {
                    await pool.query(
                        `INSERT INTO network_infrastructure (estate_id, infrastructure_type, status, 
                     installation_date, capacity_specs, location, coverage_area) 
                     VALUES ($1, $2, $3, $4, $5, ST_GeomFromEWKT($6), ST_GeomFromEWKT($7))`,
                        [
                            estateId,
                            infrastructureTypes[Math.floor(Math.random() * infrastructureTypes.length)],
                            statuses[Math.floor(Math.random() * statuses.length)],
                            new Date(Date.now() - Math.floor(Math.random() * 365 * 2) * 24 * 60 * 60 * 1000),
                            JSON.stringify({
                                capacity: `${Math.floor(Math.random() * 1000) + 100}Mbps`,
                                users_supported: Math.floor(Math.random() * 500) + 100,
                                uptime: (Math.random() * 10 + 99).toFixed(2) + '%',
                                last_upgrade: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000)
                            }),
                            pointGeometry,
                            polygonGeometry
                        ]
                    );
                } catch (error) {
                    console.error('Error inserting network infrastructure:', error.message);
                    // Try inserting without coverage_area (polygon)
                    try {
                        await pool.query(
                            `INSERT INTO network_infrastructure (estate_id, infrastructure_type, status, 
                         installation_date, capacity_specs, location) 
                         VALUES ($1, $2, $3, $4, $5, ST_GeomFromEWKT($6))`,
                            [
                                estateId,
                                infrastructureTypes[Math.floor(Math.random() * infrastructureTypes.length)],
                                statuses[Math.floor(Math.random() * statuses.length)],
                                new Date(Date.now() - Math.floor(Math.random() * 365 * 2) * 24 * 60 * 60 * 1000),
                                JSON.stringify({
                                    capacity: `${Math.floor(Math.random() * 1000) + 100}Mbps`,
                                    users_supported: Math.floor(Math.random() * 500) + 100,
                                    uptime: (Math.random() * 10 + 99).toFixed(2) + '%',
                                    last_upgrade: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000)
                                }),
                                pointGeometry
                            ]
                        );
                    } catch (error2) {
                        console.error('Error inserting network infrastructure without coverage:', error2.message);
                        // Insert without any geometry
                        await pool.query(
                            `INSERT INTO network_infrastructure (estate_id, infrastructure_type, status, 
                         installation_date, capacity_specs) 
                         VALUES ($1, $2, $3, $4, $5)`,
                            [
                                estateId,
                                infrastructureTypes[Math.floor(Math.random() * infrastructureTypes.length)],
                                statuses[Math.floor(Math.random() * statuses.length)],
                                new Date(Date.now() - Math.floor(Math.random() * 365 * 2) * 24 * 60 * 60 * 1000),
                                JSON.stringify({
                                    capacity: `${Math.floor(Math.random() * 1000) + 100}Mbps`,
                                    users_supported: Math.floor(Math.random() * 500) + 100,
                                    uptime: (Math.random() * 10 + 99).toFixed(2) + '%',
                                    last_upgrade: new Date(Date.now() - Math.floor(Math.random() * 180) * 24 * 60 * 60 * 1000)
                                })
                            ]
                        );
                    }
                }
            }
        }
    }

    async seedServiceQualityMetrics() {
        console.log('Seeding service quality metrics...');
        const currentDate = new Date();

        for (const estateId of this.estateIds) {
            // Create metrics for the last 6 months
            for (let i = 0; i < 6; i++) {
                const period = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);

                await pool.query(
                    `INSERT INTO service_quality_metrics (estate_id, service_type, period, 
                 uptime_percentage, avg_response_time, customer_satisfaction_score, 
                 incident_count, bandwidth_usage, latency_ms) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        estateId,
                        'internet',
                        period,
                        (Math.random() * 2 + 98).toFixed(2), // 98-100%
                        Math.floor(Math.random() * 50) + 20, // 20-70ms
                        (Math.random() * 1.5 + 3.5).toFixed(2), // 3.5-5.0
                        Math.floor(Math.random() * 10),
                        Math.floor(Math.random() * 800) + 200, // 200-1000 GB
                        (Math.random() * 30 + 20).toFixed(2) // 20-50ms
                    ]
                );
            }
        }
    }

    async seedCrossPlatformRevenue() {
        console.log('Seeding cross-platform revenue...');
        const currentDate = new Date();
        const serviceCategories = ['internet', 'fintech', 'delivery', 'mailing'];

        for (const estateId of this.estateIds) {
            for (const category of serviceCategories) {
                // Create revenue data for the last 12 months
                for (let i = 0; i < 12; i++) {
                    const period = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
                    const baseRevenue = category === 'internet' ? 5000000 :
                        category === 'fintech' ? 2000000 :
                            category === 'delivery' ? 1000000 : 500000;

                    await pool.query(
                        `INSERT INTO cross_platform_revenue (estate_id, period, service_category, 
                     revenue, currency, customer_count, growth_rate) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                        [
                            estateId,
                            period,
                            category,
                            Math.floor(Math.random() * baseRevenue) + (baseRevenue / 2),
                            'NGN',
                            Math.floor(Math.random() * 200) + 50,
                            (Math.random() * 20 - 5).toFixed(2) // -5% to +15%
                        ]
                    );
                }
            }
        }
    }

    async seedMarketOpportunities() {
        console.log('Seeding market opportunities...');
        const opportunityTypes = [
            'fiber_expansion', 'new_service_launch', 'competitor_acquisition',
            'partnership_opportunity', 'untapped_market_segment'
        ];

        for (let i = 0; i < 50; i++) {
            const estateId = this.estateIds[Math.floor(Math.random() * this.estateIds.length)];
            const areaId = this.areaIds[Math.floor(Math.random() * this.areaIds.length)];

            await pool.query(
                `INSERT INTO market_opportunities (estate_id, area_id, opportunity_type, 
             potential_revenue, currency, probability, competition_level, market_size) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    estateId,
                    areaId,
                    opportunityTypes[Math.floor(Math.random() * opportunityTypes.length)],
                    Math.floor(Math.random() * 100000000) + 5000000,
                    'NGN',
                    (Math.random() * 0.7 + 0.3).toFixed(2), // 30-100%
                    Math.floor(Math.random() * 10) + 1,
                    Math.floor(Math.random() * 10000) + 1000
                ]
            );
        }
    }

    async seedCompetitiveBenchmarking() {
        console.log('Seeding competitive benchmarking...');
        const currentDate = new Date();

        // Get our services (assuming first provider is "our company")
        const ourServices = this.serviceIds.filter((_, index) => index % 4 === 0);
        const competitorServices = this.serviceIds.filter((_, index) => index % 4 !== 0);

        for (const ourServiceId of ourServices) {
            for (let i = 0; i < 3; i++) { // Compare against 3 competitors
                const competitorServiceId = competitorServices[Math.floor(Math.random() * competitorServices.length)];
                const comparisonDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);

                await pool.query(
                    `INSERT INTO competitive_benchmarking (our_service_id, competitor_service_id, 
                 comparison_date, price_difference, feature_comparison, market_positioning_score) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                    [
                        ourServiceId,
                        competitorServiceId,
                        comparisonDate,
                        (Math.random() * 10000 - 5000).toFixed(2), // -5000 to +5000 difference
                        JSON.stringify({
                            speed: ['superior', 'equal', 'inferior'][Math.floor(Math.random() * 3)],
                            reliability: ['superior', 'equal', 'inferior'][Math.floor(Math.random() * 3)],
                            customer_service: ['superior', 'equal', 'inferior'][Math.floor(Math.random() * 3)],
                            value_for_money: ['superior', 'equal', 'inferior'][Math.floor(Math.random() * 3)]
                        }),
                        Math.floor(Math.random() * 40) + 60 // 60-100 score
                    ]
                );
            }
        }
    }
}

export default new DatabaseSeeder();