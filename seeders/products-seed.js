import { generateInsertData } from "../utils/index.js";

const productsData = [
  {
    name: "MDU Data",
    slug: "mdu-data",
    description: "Multi-Dwelling Unit Data Service",
    status: "active",
  },
  {
    name: "Home Internet",
    slug: "home-internet",
    description: "Standalone Home Internet",
    status: "active",
  },
  {
    name: "Business Fiber",
    slug: "business-fiber",
    description: "High-speed Business Fiber Connection",
    status: "active",
  },
  {
    name: "Wireless Broadband",
    slug: "wireless-broadband",
    description: "Fixed Wireless Broadband Service",
    status: "active",
  },
  {
    name: "Enterprise Solutions",
    slug: "enterprise-solutions",
    description: "Custom Enterprise Network Solutions",
    status: "active",
  },
  {
    name: "IoT Connectivity",
    slug: "iot-connectivity",
    description: "Internet of Things Connectivity Services",
    status: "active",
  },
  {
    name: "Cloud Services",
    slug: "cloud-services",
    description: "Cloud Infrastructure and Hosting",
    status: "active",
  },
];

async function seedProducts(client) {
  console.log(`🌱 Seeding products...`);
  
  const { placeholders, values } = generateInsertData(productsData, ["name", "slug", "description", "status"]);
  
  const result = await client.query(
    `INSERT INTO products (name, slug, description, status) VALUES ${placeholders}`,
    values
  );
  
  console.log(`✅ Seeded products: ${result.rowCount} rows`);
  return result;
}

export { seedProducts, productsData };
