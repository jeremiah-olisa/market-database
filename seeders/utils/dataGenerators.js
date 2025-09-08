export const NIGERIAN_DATA = {
    states: ['Lagos', 'Abuja', 'Rivers', 'Kano', 'Oyo', 'Delta', 'Enugu', 'Kaduna', 'Ogun', 'Anambra'],
    
    lagosAreas: ['Lekki', 'Victoria Island', 'Ikoyi', 'Ikeja', 'Surulere', 'Yaba', 'Apapa', 'Gbagada', 'Maryland', 'Ajah'],
    abujaAreas: ['Maitama', 'Asokoro', 'Wuse', 'Garki', 'Jabi', 'Gwarinpa', 'Kubwa', 'Lugbe', 'Utako', 'Central Area'],
    riversAreas: ['Port Harcourt City', 'GRA Phase 1-5', 'Rumuokoro', 'Trans-Amadi', 'Woji', 'Rumuola', 'Rumuomasi', 'Elekahia'],
    kanoAreas: ['Nassarawa GRA', 'Bompai', 'Tarauni', 'Gyadi-Gyadi', 'Sharada', 'Kano Municipal', 'Fagge'],
    
    lagosEstates: [
        'Lekki Phase 1', 'Victoria Garden City', 'Banana Island', 'Parkview Estate', 'Ikoyi Gardens',
        'Chevron Estate', 'Osborne Estate', 'Orange Island', 'Eko Atlantic City', 'Ajah Lakeside'
    ],
    abujaEstates: [
        'Maitama Extension', 'Asokoro Residences', 'Wuse 2 Estate', 'Gwarinpa Estate', 'Jabi Lake Gardens',
        'Lugbe Gardens', 'Kubwa Residences', 'Katampe Extension', 'Guzape District', 'Dakibiyu Estate'
    ],
    
    internetProviders: [
        'MTN Nigeria', 'Airtel Nigeria', 'Glo Mobile', '9mobile', 'Spectranet',
        'Smile Communications', 'Tizeti', 'ipNX', 'Cobranet', 'Swift Networks'
    ],
    
    businessTypes: {
        restaurant: ['Chicken Republic', 'Tantalizers', 'Sweet Sensation', 'Mr Bigg\'s', 'KFC Nigeria', 'Domino\'s Pizza'],
        supermarket: ['Spar Nigeria', 'Shoprite', 'Nextime Supermarket', 'Ebeano Supermarket', 'Paceway Supermarket'],
        bank: ['GTBank', 'First Bank', 'UBA', 'Access Bank', 'Zenith Bank', 'Fidelity Bank'],
        pharmacy: ['HealthPlus', 'MedPlus', 'Mopheth Pharmacy', 'Alpha Pharmacy', 'Mega Life Pharmacy'],
        salon: ['Xpressions Salon', 'Tresses Salon', 'L\'iza Beauty', 'Nuban Salon', 'Beauty Fair'],
        retail: ['Computer Village', 'Ikeja City Mall', 'The Palms Shopping Mall', 'Jabi Lake Mall']
    },
    
    customerNames: [
        'Chinedu Okoro', 'Aisha Mohammed', 'Emeka Nwosu', 'Fatima Bello', 'Oluwaseun Adeyemi',
        'Ngozi Eze', 'Kunle Adebayo', 'Zainab Ibrahim', 'Chukwudi Okafor', 'Halima Yusuf',
        'Tunde Olawale', 'Amaka Chukwu', 'Musa Abubakar', 'Grace Ojo', 'Ibrahim Sani'
    ],
    
    generatePhoneNumber: () => {
        const prefixes = ['080', '081', '070', '090', '091'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        return prefix + Math.random().toString().substring(2, 10);
    },
    
    generateEmail: (name) => {
        const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'naijamail.com'];
        const cleanName = name.toLowerCase().replace(/\s+/g, '.');
        return `${cleanName}@${domains[Math.floor(Math.random() * domains.length)]}`;
    },
    
    generateIncomeBracket: () => {
        const brackets = [
            'Low (<₦100k)', 'Lower Middle (₦100k-₦300k)', 'Middle (₦300k-₦700k)',
            'Upper Middle (₦700k-₦1.5m)', 'High (>₦1.5m)'
        ];
        return brackets[Math.floor(Math.random() * brackets.length)];
    },
    
    generateAgeBracket: () => {
        const brackets = ['18-25', '26-35', '36-45', '46-55', '56+'];
        return brackets[Math.floor(Math.random() * brackets.length)];
    },
    
    getRandomBusiness: (type) => {
        const businesses = NIGERIAN_DATA.businessTypes[type];
        return businesses ? businesses[Math.floor(Math.random() * businesses.length)] : 'Local Business';
    }
};