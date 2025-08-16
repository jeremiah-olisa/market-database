// Nigerian coordinate boundaries (roughly)
const NIGERIA_BOUNDS = {
  minLat: 4.277144,
  maxLat: 13.885645,
  minLng: 2.668432,
  maxLng: 14.680072
};

// Abuja coordinate boundaries (roughly)
const ABUJA_BOUNDS = {
  minLat: 8.9,
  maxLat: 9.2,
  minLng: 7.25,
  maxLng: 7.6
};

export function generateNigerianCoordinates(bounds = ABUJA_BOUNDS) {
  const latitude = bounds.minLat + (Math.random() * (bounds.maxLat - bounds.minLat));
  const longitude = bounds.minLng + (Math.random() * (bounds.maxLng - bounds.minLng));
  return { latitude: Number(latitude.toFixed(6)), longitude: Number(longitude.toFixed(6)) };
}

export function generatePhoneNumber() {
  const prefixes = ['0803', '0806', '0703', '0706', '0813', '0816', '0903', '0906'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return prefix + number;
}

export function generateEmail(name) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@${domain}`;
}

export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomDecimal(min, max, decimals = 2) {
  const num = Math.random() * (max - min) + min;
  return Number(num.toFixed(decimals));
}

export function generateTimestampBetween(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const timestamp = start + Math.random() * (end - start);
  return new Date(timestamp);
}

export const ABUJA_DISTRICTS = {
  'Maitama': { tier: 'platinum', avgRent: { min: 5000000, max: 15000000 } },
  'Asokoro': { tier: 'platinum', avgRent: { min: 4500000, max: 12000000 } },
  'Wuse II': { tier: 'gold', avgRent: { min: 3000000, max: 8000000 } },
  'Garki II': { tier: 'gold', avgRent: { min: 2500000, max: 7000000 } },
  'Gwarinpa': { tier: 'silver', avgRent: { min: 1500000, max: 4000000 } },
  'Wuse': { tier: 'silver', avgRent: { min: 1200000, max: 3500000 } },
  'Garki': { tier: 'silver', avgRent: { min: 1000000, max: 3000000 } },
  'Jabi': { tier: 'silver', avgRent: { min: 1000000, max: 3000000 } },
  'Utako': { tier: 'silver', avgRent: { min: 900000, max: 2500000 } },
  'Durumi': { tier: 'bronze', avgRent: { min: 500000, max: 1500000 } },
  'Kubwa': { tier: 'bronze', avgRent: { min: 400000, max: 1200000 } },
  'Lugbe': { tier: 'bronze', avgRent: { min: 300000, max: 1000000 } }
};

export const ESTATE_TYPES = {
  'bungalow': { avgSize: { min: 80, max: 200 } },
  'duplex': { avgSize: { min: 150, max: 300 } },
  'block_of_flats': { avgSize: { min: 400, max: 1000 } }
};

export const UNIT_TYPES = {
  'self_contained': { avgSize: 30, bedrooms: 1 },
  'studio': { avgSize: 40, bedrooms: 1 },
  '1_bedroom': { avgSize: 50, bedrooms: 1 },
  '2_bedroom': { avgSize: 80, bedrooms: 2 },
  '3_bedroom': { avgSize: 120, bedrooms: 3 },
  '4_bedroom': { avgSize: 180, bedrooms: 4 },
  'penthouse': { avgSize: 250, bedrooms: 5 }
};

export const INTERNET_PACKAGES = {
  'Basic': { speed: '10Mbps', price: 15000 },
  'Standard': { speed: '25Mbps', price: 25000 },
  'Premium': { speed: '50Mbps', price: 45000 },
  'Ultimate': { speed: '100Mbps', price: 80000 },
  'Business Basic': { speed: '50Mbps', price: 100000 },
  'Business Pro': { speed: '200Mbps', price: 250000 },
  'Enterprise': { speed: '500Mbps', price: 500000 }
};

export const MAJOR_ISPS = [
  { name: 'MTN Nigeria', marketShare: 0.35 },
  { name: 'Airtel Nigeria', marketShare: 0.28 },
  { name: 'Globacom', marketShare: 0.22 },
  { name: '9mobile', marketShare: 0.15 }
];

export const BUSINESS_CATEGORIES = {
  'Retail': ['Shopping Mall', 'Supermarket', 'Convenience Store', 'Boutique'],
  'Food': ['Restaurant', 'Fast Food', 'Cafe', 'Bar'],
  'Services': ['Bank', 'Insurance', 'Real Estate Agency', 'Law Firm'],
  'Healthcare': ['Hospital', 'Clinic', 'Pharmacy', 'Laboratory'],
  'Education': ['School', 'Training Center', 'Library', 'Tutorial Center'],
  'Entertainment': ['Cinema', 'Gym', 'Sports Center', 'Event Center']
};
