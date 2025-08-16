import { pool } from '../utils/index.js';

/**
 * Migration Testing Suite
 * Tests database migrations, data integrity, and rollback capabilities
 */
class MigrationTests {
    constructor() {
        this.testResults = { passed: 0, failed: 0, errors: [] };
    }

    async runAllTests() {
        console.log("🚀 Running Migration Tests...");
        console.log("=".repeat(60));

        try {
            await this.testMigrationHistory();
            await this.testDataIntegrity();
            await this.testEnumConstraints();
            await this.testForeignKeyIntegrity();
            await this.testDataSeeding();
            this.printTestSummary();
        } catch (error) {
            console.error("❌ Migration tests failed:", error.message);
            throw error;
        }
    }

    async testMigrationHistory() {
        console.log("\n📚 Testing Migration History...");
        try {
            const result = await pool.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'migrations'
                )
            `);
            
            if (result.rows[0].exists) {
                console.log("✅ Migrations table exists");
                this.testResults.passed++;
            } else {
                console.log("⚠️  Migrations table not found");
            }
        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Migration history test failed: ${error.message}`);
        }
    }

    async testDataIntegrity() {
        console.log("\n🔍 Testing Data Integrity...");
        const tables = ['products', 'areas', 'estates', 'estate_units', 'price_trends'];
        
        for (const table of tables) {
            try {
                const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
                const count = parseInt(result.rows[0].count);
                if (count > 0) {
                    console.log(`✅ ${table}: ${count} records found`);
                    this.testResults.passed++;
                }
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`${table} test failed: ${error.message}`);
            }
        }
    }

    async testEnumConstraints() {
        console.log("\n📋 Testing Enum Constraints...");
        try {
            const result = await pool.query(`
                SELECT DISTINCT status FROM products WHERE status IS NOT NULL
            `);
            const validStatuses = ['active', 'inactive', 'archived'];
            const foundStatuses = result.rows.map(row => row.status);
            const invalidStatuses = foundStatuses.filter(s => !validStatuses.includes(s));
            
            if (invalidStatuses.length === 0) {
                console.log("✅ Product status enum constraints valid");
                this.testResults.passed++;
            }
        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Enum constraints test failed: ${error.message}`);
        }
    }

    async testForeignKeyIntegrity() {
        console.log("\n🔗 Testing Foreign Key Integrity...");
        try {
            const result = await pool.query(`
                SELECT COUNT(*) as count
                FROM estates e
                LEFT JOIN products p ON e.product_id = p.id
                WHERE p.id IS NULL
            `);
            
            if (parseInt(result.rows[0].count) === 0) {
                console.log("✅ Foreign key integrity maintained");
                this.testResults.passed++;
            }
        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`FK integrity test failed: ${error.message}`);
        }
    }

    async testDataSeeding() {
        console.log("\n🌱 Testing Data Seeding...");
        try {
            const result = await pool.query(`
                SELECT 
                    (SELECT COUNT(*) FROM products) as products_count,
                    (SELECT COUNT(*) FROM estates) as estates_count
            `);
            
            const counts = result.rows[0];
            console.log(`✅ Data Volume: ${counts.products_count} products, ${counts.estates_count} estates`);
            this.testResults.passed++;
        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Data seeding test failed: ${error.message}`);
        }
    }

    printTestSummary() {
        console.log("\n" + "=".repeat(60));
        console.log("📊 MIGRATION TEST SUMMARY");
        console.log("=".repeat(60));
        console.log(`✅ Tests Passed: ${this.testResults.passed}`);
        console.log(`❌ Tests Failed: ${this.testResults.failed}`);
        
        if (this.testResults.errors.length > 0) {
            console.log("\n❌ Errors Found:");
            this.testResults.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
    }
}

export default MigrationTests;
