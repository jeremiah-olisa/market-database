import { pool } from '../utils/index.js';

/**
 * Schema Validation Test Suite
 * Tests all database tables, constraints, and relationships
 */
class SchemaValidationTests {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            errors: []
        };
    }

    /**
     * Run all schema validation tests
     */
    async runAllTests() {
        console.log("🔍 Running Schema Validation Tests...");
        console.log("=".repeat(60));

        try {
            await this.testDatabaseConnection();
            await this.testCoreTables();
            await this.testTableConstraints();
            await this.testForeignKeyRelationships();
            await this.testEnumTypes();
            await this.testIndexes();
            await this.testSpatialData();
            await this.testTriggers();

            this.printTestSummary();
        } catch (error) {
            console.error("❌ Schema validation tests failed:", error.message);
            throw error;
        }
    }

    /**
     * Test database connection
     */
    async testDatabaseConnection() {
        console.log("\n📡 Testing Database Connection...");
        try {
            const result = await pool.query("SELECT version()");
            console.log("✅ Database connection successful");
            console.log(`   PostgreSQL Version: ${result.rows[0].version.split(' ')[1]}`);
            this.testResults.passed++;
        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Database connection failed: ${error.message}`);
            console.log("❌ Database connection failed");
        }
    }

    /**
     * Test core tables existence and structure
     */
    async testCoreTables() {
        console.log("\n🏗️  Testing Core Tables...");
        
        const expectedTables = [
            'products',
            'areas', 
            'estates',
            'estate_units',
            'price_trends'
        ];

        for (const tableName of expectedTables) {
            try {
                const result = await pool.query(`
                    SELECT 
                        table_name,
                        column_name,
                        data_type,
                        is_nullable,
                        column_default
                    FROM information_schema.columns 
                    WHERE table_name = $1
                    ORDER BY ordinal_position
                `, [tableName]);

                if (result.rows.length > 0) {
                    console.log(`✅ Table '${tableName}' exists with ${result.rows.length} columns`);
                    this.testResults.passed++;
                } else {
                    throw new Error(`Table '${tableName}' not found`);
                }
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`Table '${tableName}' test failed: ${error.message}`);
                console.log(`❌ Table '${tableName}' test failed`);
            }
        }
    }

    /**
     * Test table constraints
     */
    async testTableConstraints() {
        console.log("\n🔒 Testing Table Constraints...");
        
        const constraintTests = [
            {
                table: 'products',
                constraint: 'products_name_check',
                description: 'Product name length check'
            },
            {
                table: 'estates',
                constraint: 'estates_name_check',
                description: 'Estate name length check'
            },
            {
                table: 'estate_units',
                constraint: 'estate_units_unit_type_check',
                description: 'Unit type length check'
            }
        ];

        for (const test of constraintTests) {
            try {
                const result = await pool.query(`
                    SELECT constraint_name, constraint_type
                    FROM information_schema.table_constraints
                    WHERE table_name = $1 AND constraint_name = $2
                `, [test.table, test.constraint]);

                if (result.rows.length > 0) {
                    console.log(`✅ Constraint '${test.constraint}' exists on table '${test.table}'`);
                    this.testResults.passed++;
                } else {
                    throw new Error(`Constraint '${test.constraint}' not found`);
                }
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`Constraint test failed: ${error.message}`);
                console.log(`❌ Constraint test failed: ${test.description}`);
            }
        }
    }

    /**
     * Test foreign key relationships
     */
    async testForeignKeyRelationships() {
        console.log("\n🔗 Testing Foreign Key Relationships...");
        
        const fkTests = [
            {
                table: 'estates',
                column: 'product_id',
                references: 'products(id)'
            },
            {
                table: 'estates',
                column: 'area_id',
                references: 'areas(id)'
            },
            {
                table: 'estate_units',
                column: 'estate_id',
                references: 'estates(id)'
            },
            {
                table: 'price_trends',
                column: 'product_id',
                references: 'products(id)'
            },
            {
                table: 'price_trends',
                column: 'area_id',
                references: 'areas(id)'
            }
        ];

        for (const test of fkTests) {
            try {
                const result = await pool.query(`
                    SELECT 
                        tc.constraint_name,
                        tc.table_name,
                        kcu.column_name,
                        ccu.table_name AS foreign_table_name,
                        ccu.column_name AS foreign_column_name
                    FROM information_schema.table_constraints AS tc
                    JOIN information_schema.key_column_usage AS kcu
                        ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage AS ccu
                        ON ccu.constraint_name = tc.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                        AND tc.table_name = $1
                        AND kcu.column_name = $2
                `, [test.table, test.column]);

                if (result.rows.length > 0) {
                    const fk = result.rows[0];
                    console.log(`✅ FK: ${test.table}.${test.column} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
                    this.testResults.passed++;
                } else {
                    throw new Error(`Foreign key not found: ${test.table}.${test.column}`);
                }
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`FK test failed: ${error.message}`);
                console.log(`❌ FK test failed: ${test.table}.${test.column}`);
            }
        }
    }

    /**
     * Test enum types
     */
    async testEnumTypes() {
        console.log("\n📋 Testing Enum Types...");
        
        const enumTests = [
            'product_status',
            'estate_type',
            'occupancy_status',
            'estate_classification',
            'unit_status',
            'price_type'
        ];

        for (const enumName of enumTests) {
            try {
                const result = await pool.query(`
                    SELECT t.typname, e.enumlabel
                    FROM pg_type t
                    JOIN pg_enum e ON t.oid = e.enumtypid
                    WHERE t.typname = $1
                    ORDER BY e.enumsortorder
                `, [enumName]);

                if (result.rows.length > 0) {
                    const values = result.rows.map(row => row.enumlabel).join(', ');
                    console.log(`✅ Enum '${enumName}': [${values}]`);
                    this.testResults.passed++;
                } else {
                    throw new Error(`Enum type '${enumName}' not found`);
                }
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`Enum test failed: ${error.message}`);
                console.log(`❌ Enum test failed: ${enumName}`);
            }
        }
    }

    /**
     * Test database indexes
     */
    async testIndexes() {
        console.log("\n📊 Testing Database Indexes...");
        
        const indexTests = [
            'products_pkey',
            'areas_pkey',
            'estates_pkey',
            'estate_units_pkey',
            'price_trends_pkey'
        ];

        for (const indexName of indexTests) {
            try {
                const result = await pool.query(`
                    SELECT indexname, tablename, indexdef
                    FROM pg_indexes
                    WHERE indexname = $1
                `, [indexName]);

                if (result.rows.length > 0) {
                    const index = result.rows[0];
                    console.log(`✅ Index '${indexName}' exists on table '${index.tablename}'`);
                    this.testResults.passed++;
                } else {
                    throw new Error(`Index '${indexName}' not found`);
                }
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`Index test failed: ${error.message}`);
                console.log(`❌ Index test failed: ${indexName}`);
            }
        }
    }

    /**
     * Test spatial data support
     */
    async testSpatialData() {
        console.log("\n🗺️  Testing Spatial Data Support...");
        
        try {
            // Test PostGIS extension
            const postgisResult = await pool.query(`
                SELECT extname, extversion
                FROM pg_extension
                WHERE extname = 'postgis'
            `);

            if (postgisResult.rows.length > 0) {
                console.log(`✅ PostGIS extension enabled (v${postgisResult.rows[0].extversion})`);
                this.testResults.passed++;
            } else {
                throw new Error('PostGIS extension not found');
            }

            // Test spatial columns
            const spatialResult = await pool.query(`
                SELECT 
                    table_name,
                    column_name,
                    data_type
                FROM information_schema.columns
                WHERE data_type LIKE '%geometry%'
                ORDER BY table_name, column_name
            `);

            if (spatialResult.rows.length > 0) {
                console.log(`✅ Found ${spatialResult.rows.length} spatial columns:`);
                spatialResult.rows.forEach(row => {
                    console.log(`   - ${row.table_name}.${row.column_name}: ${row.data_type}`);
                });
                this.testResults.passed++;
            } else {
                console.log("⚠️  No spatial columns found");
            }

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Spatial data test failed: ${error.message}`);
            console.log(`❌ Spatial data test failed: ${error.message}`);
        }
    }

    /**
     * Test database triggers
     */
    async testTriggers() {
        console.log("\n⚡ Testing Database Triggers...");
        
        try {
            const result = await pool.query(`
                SELECT 
                    trigger_name,
                    event_object_table,
                    action_statement
                FROM information_schema.triggers
                WHERE trigger_name LIKE '%updated_at%'
                ORDER BY event_object_table
            `);

            if (result.rows.length > 0) {
                console.log(`✅ Found ${result.rows.length} updated_at triggers:`);
                result.rows.forEach(row => {
                    console.log(`   - ${row.trigger_name} on ${row.event_object_table}`);
                });
                this.testResults.passed++;
            } else {
                throw new Error('No updated_at triggers found');
            }

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Trigger test failed: ${error.message}`);
            console.log(`❌ Trigger test failed: ${error.message}`);
        }
    }

    /**
     * Print test summary
     */
    printTestSummary() {
        console.log("\n" + "=".repeat(60));
        console.log("📊 SCHEMA VALIDATION TEST SUMMARY");
        console.log("=".repeat(60));
        console.log(`✅ Tests Passed: ${this.testResults.passed}`);
        console.log(`❌ Tests Failed: ${this.testResults.failed}`);
        console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);

        if (this.testResults.errors.length > 0) {
            console.log("\n❌ Errors Found:");
            this.testResults.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        if (this.testResults.failed === 0) {
            console.log("\n🎉 All schema validation tests passed!");
        } else {
            console.log(`\n⚠️  ${this.testResults.failed} tests failed. Please review the errors above.`);
        }
    }
}

export default SchemaValidationTests;
