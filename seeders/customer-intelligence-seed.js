import pool from "../utils/pool.js";

export async function seedCustomerIntelligence(client) {
  console.log("👥 Seeding customer intelligence data...");
  
  // First, seed customer profiles
  const customerProfilesData = [
    {
      estate_id: 1,
      demographics: {
        age_group: '26-35',
        income_level: 'high',
        education_level: 'tertiary',
        household_size: 3,
        employment_status: 'employed'
      },
      lifestyle_indicators: {
        internet_usage: 'heavy',
        streaming_services: ['Netflix', 'YouTube', 'Spotify'],
        online_shopping: 'frequent',
        social_media_usage: 'high',
        gaming: 'moderate'
      },
      satisfaction_score: 4.5,
      tenure_months: 24,
      metadata: {
        preferred_contact_method: 'email',
        language_preference: 'English',
        payment_method: 'card'
      }
    },
    {
      estate_id: 2,
      demographics: {
        age_group: '36-50',
        income_level: 'middle',
        education_level: 'secondary',
        household_size: 4,
        employment_status: 'employed'
      },
      lifestyle_indicators: {
        internet_usage: 'moderate',
        streaming_services: ['YouTube', 'DStv'],
        online_shopping: 'occasional',
        social_media_usage: 'moderate',
        gaming: 'low'
      },
      satisfaction_score: 4.2,
      tenure_months: 18,
      metadata: {
        preferred_contact_method: 'phone',
        language_preference: 'English',
        payment_method: 'bank_transfer'
      }
    },
    {
      estate_id: 3,
      demographics: {
        age_group: '18-25',
        income_level: 'low',
        education_level: 'tertiary',
        household_size: 2,
        employment_status: 'student'
      },
      lifestyle_indicators: {
        internet_usage: 'very_heavy',
        streaming_services: ['Netflix', 'YouTube', 'TikTok', 'Instagram'],
        online_shopping: 'frequent',
        social_media_usage: 'very_high',
        gaming: 'high'
      },
      satisfaction_score: 3.8,
      tenure_months: 6,
      metadata: {
        preferred_contact_method: 'social_media',
        language_preference: 'English',
        payment_method: 'mobile_money'
      }
    }
  ];

  for (const data of customerProfilesData) {
    await client.query(`
      INSERT INTO customer_profiles (
        estate_id, demographics, lifestyle_indicators, 
        satisfaction_score, tenure_months, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      data.estate_id, JSON.stringify(data.demographics),
      JSON.stringify(data.lifestyle_indicators), data.satisfaction_score,
      data.tenure_months, JSON.stringify(data.metadata)
    ]);
  }

  // Then, seed usage patterns
  const usagePatternsData = [
    {
      customer_id: 1,
      service_type: 'internet',
      usage_metrics: {
        data_consumption_gb: 150,
        peak_hours: ['18:00', '22:00'],
        average_session_duration: 45,
        devices_connected: 5
      },
      period: '2024-01',
      service_quality_rating: 4.5
    },
    {
      customer_id: 1,
      service_type: 'cable_tv',
      usage_metrics: {
        channels_watched: 25,
        favorite_genres: ['News', 'Sports', 'Movies'],
        recording_usage: 'high',
        on_demand_usage: 'moderate'
      },
      period: '2024-01',
      service_quality_rating: 4.3
    },
    {
      customer_id: 2,
      service_type: 'internet',
      usage_metrics: {
        data_consumption_gb: 80,
        peak_hours: ['19:00', '21:00'],
        average_session_duration: 30,
        devices_connected: 3
      },
      period: '2024-01',
      service_quality_rating: 4.2
    },
    {
      customer_id: 3,
      service_type: 'internet',
      usage_metrics: {
        data_consumption_gb: 200,
        peak_hours: ['16:00', '02:00'],
        average_session_duration: 120,
        devices_connected: 2
      },
      period: '2024-01',
      service_quality_rating: 3.8
    }
  ];

  for (const data of usagePatternsData) {
    await client.query(`
      INSERT INTO usage_patterns (
        customer_id, service_type, usage_metrics, period, service_quality_rating
      ) VALUES ($1, $2, $3, $4, $5)
    `, [
      data.customer_id, data.service_type, JSON.stringify(data.usage_metrics),
      data.period, data.service_quality_rating
    ]);
  }

  // Finally, seed customer feedback
  const customerFeedbackData = [
    {
      customer_id: 1,
      service_type: 'internet',
      rating: 4.5,
      feedback_text: 'Excellent internet speed and reliability. Very satisfied with the service.',
      feedback_type: 'positive',
      metadata: {
        response_time: 'immediate',
        issue_resolved: true,
        follow_up_required: false
      }
    },
    {
      customer_id: 2,
      service_type: 'internet',
      rating: 4.2,
      feedback_text: 'Good service overall, occasional slow speeds during peak hours.',
      feedback_type: 'neutral',
      metadata: {
        response_time: 'within_24h',
        issue_resolved: true,
        follow_up_required: false
      }
    },
    {
      customer_id: 3,
      service_type: 'internet',
      rating: 3.8,
      feedback_text: 'Service is okay but could be faster. Support team is helpful.',
      feedback_type: 'neutral',
      metadata: {
        response_time: 'within_48h',
        issue_resolved: true,
        follow_up_required: true
      }
    }
  ];

  for (const data of customerFeedbackData) {
    await client.query(`
      INSERT INTO customer_feedback (
        customer_id, service_type, rating, feedback_text, 
        feedback_type, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      data.customer_id, data.service_type, data.rating, data.feedback_text,
      data.feedback_type, JSON.stringify(data.metadata)
    ]);
  }

  console.log(`✅ Seeded ${customerProfilesData.length} customer profiles, ${usagePatternsData.length} usage patterns, and ${customerFeedbackData.length} feedback records`);
}
