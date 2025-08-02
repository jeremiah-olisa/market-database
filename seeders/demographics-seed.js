import pool from "../utils/pool.js";

// Demographics seed data for estates with realistic Nigerian demographics
const demographicsData = [
  {
    estate_id: 1,
    population: 2500,
    households: 600,
    population_density: 125.5,
    age_groups: {
      "0-17": 28,
      "18-25": 18,
      "26-35": 25,
      "36-50": 20,
      "51-65": 7,
      "65+": 2
    },
    income_levels: {
      "low": 15,
      "lower_middle": 25,
      "middle": 35,
      "upper_middle": 20,
      "high": 5
    },
    education_levels: {
      "primary": 20,
      "secondary": 45,
      "tertiary": 30,
      "postgraduate": 5
    },
    employment_sectors: {
      "government": 25,
      "private": 40,
      "business": 20,
      "unemployed": 15
    },
    geometry: "POINT(7.4916 9.0820)", // Abuja coordinates
    average_income: 450000,
    median_rent: 180000,
    vehicle_ownership_rate: 65.0,
    internet_penetration_rate: 78.5,
    data_source: "estate_survey_2024",
    data_quality_score: 4,
    last_surveyed_at: "2024-01-15"
  },
  {
    estate_id: 2,
    population: 1850,
    households: 445,
    population_density: 98.3,
    age_groups: {
      "0-17": 32,
      "18-25": 20,
      "26-35": 22,
      "36-50": 18,
      "51-65": 6,
      "65+": 2
    },
    income_levels: {
      "low": 25,
      "lower_middle": 30,
      "middle": 30,
      "upper_middle": 12,
      "high": 3
    },
    education_levels: {
      "primary": 25,
      "secondary": 50,
      "tertiary": 22,
      "postgraduate": 3
    },
    employment_sectors: {
      "government": 30,
      "private": 35,
      "business": 18,
      "unemployed": 17
    },
    geometry: "POINT(7.5200 9.1200)",
    average_income: 320000,
    median_rent: 120000,
    vehicle_ownership_rate: 45.0,
    internet_penetration_rate: 65.2,
    data_source: "estate_survey_2024",
    data_quality_score: 4,
    last_surveyed_at: "2024-01-20"
  },
  {
    estate_id: 3,
    population: 3200,
    households: 750,
    population_density: 156.8,
    age_groups: {
      "0-17": 30,
      "18-25": 22,
      "26-35": 28,
      "36-50": 15,
      "51-65": 4,
      "65+": 1
    },
    income_levels: {
      "low": 35,
      "lower_middle": 35,
      "middle": 22,
      "upper_middle": 6,
      "high": 2
    },
    education_levels: {
      "primary": 35,
      "secondary": 45,
      "tertiary": 18,
      "postgraduate": 2
    },
    employment_sectors: {
      "government": 20,
      "private": 30,
      "business": 25,
      "unemployed": 25
    },
    geometry: "POINT(7.4800 9.0500)",
    average_income: 250000,
    median_rent: 85000,
    vehicle_ownership_rate: 25.0,
    internet_penetration_rate: 52.3,
    data_source: "estate_survey_2024",
    data_quality_score: 3,
    last_surveyed_at: "2024-02-05"
  },
  {
    estate_id: 4,
    population: 4100,
    households: 980,
    population_density: 205.0,
    age_groups: {
      "0-17": 35,
      "18-25": 25,
      "26-35": 22,
      "36-50": 13,
      "51-65": 4,
      "65+": 1
    },
    income_levels: {
      "low": 45,
      "lower_middle": 30,
      "middle": 18,
      "upper_middle": 5,
      "high": 2
    },
    education_levels: {
      "primary": 40,
      "secondary": 40,
      "tertiary": 18,
      "postgraduate": 2
    },
    employment_sectors: {
      "government": 15,
      "private": 25,
      "business": 30,
      "unemployed": 30
    },
    geometry: "POINT(7.5100 9.1500)",
    average_income: 185000,
    median_rent: 65000,
    vehicle_ownership_rate: 15.0,
    internet_penetration_rate: 42.8,
    data_source: "estate_survey_2024",
    data_quality_score: 3,
    last_surveyed_at: "2024-02-10"
  },
  {
    estate_id: 5,
    population: 1200,
    households: 285,
    population_density: 60.0,
    age_groups: {
      "0-17": 25,
      "18-25": 15,
      "26-35": 30,
      "36-50": 22,
      "51-65": 6,
      "65+": 2
    },
    income_levels: {
      "low": 8,
      "lower_middle": 15,
      "middle": 30,
      "upper_middle": 35,
      "high": 12
    },
    education_levels: {
      "primary": 10,
      "secondary": 35,
      "tertiary": 45,
      "postgraduate": 10
    },
    employment_sectors: {
      "government": 35,
      "private": 50,
      "business": 12,
      "unemployed": 3
    },
    geometry: "POINT(7.4700 9.0900)",
    average_income: 680000,
    median_rent: 280000,
    vehicle_ownership_rate: 85.0,
    internet_penetration_rate: 92.1,
    data_source: "estate_survey_2024",
    data_quality_score: 5,
    last_surveyed_at: "2024-01-12"
  }
];

async function seedDemographics() {
  const client = await pool.connect();
  try {
    console.log("🌱 Seeding demographics data...");
    
    await client.query("BEGIN");
    
    // Clear existing demographics data
    await client.query("DELETE FROM demographics");
    console.log("  📝 Cleared existing demographics data");
    
    // Insert demographics data
    for (const demo of demographicsData) {
      const insertQuery = `
        INSERT INTO demographics (
          estate_id, population, households, population_density,
          age_groups, income_levels, education_levels, employment_sectors,
          geometry, average_income, median_rent, vehicle_ownership_rate,
          internet_penetration_rate, data_source, data_quality_score, 
          last_surveyed_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 
          ST_GeomFromText($9, 4326), $10, $11, $12, $13, $14, $15, $16
        )
      `;
      
      await client.query(insertQuery, [
        demo.estate_id,
        demo.population,
        demo.households,
        demo.population_density,
        JSON.stringify(demo.age_groups),
        JSON.stringify(demo.income_levels),
        JSON.stringify(demo.education_levels),
        JSON.stringify(demo.employment_sectors),
        demo.geometry,
        demo.average_income,
        demo.median_rent,
        demo.vehicle_ownership_rate,
        demo.internet_penetration_rate,
        demo.data_source,
        demo.data_quality_score,
        demo.last_surveyed_at
      ]);
    }
    
    await client.query("COMMIT");
    console.log(`  ✅ Successfully seeded ${demographicsData.length} demographics records`);
    
    // Verify the data
    const countResult = await client.query("SELECT COUNT(*) FROM demographics");
    console.log(`  📊 Total demographics records: ${countResult.rows[0].count}`);
    
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding demographics:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default seedDemographics;