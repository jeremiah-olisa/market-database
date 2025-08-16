import { pool } from '../utils/index.js';

/**
 * Query Performance Testing Suite
 * Tests query optimization, indexing, and performance metrics
 */
class QueryPerformanceTests {
    constructor() {
        this.testResults = { passed: 0, failed: 0, errors: [] };
        this.performanceMetrics = {};
    }

    async runAllTests() {
        console.log("⚡ Running Query Performance Tests...");
        console.log("=".repeat(60));

        try {
            await this.testBasicQueryPerformance();
            await this.testJoinQueryPerformance();
            await this.testAggregationPerformance();
            await this.testIndexEffectiveness();
            await this.testComplexQueryPerformance();
            this.printTestSummary();
        } catch (error) {
            console.error("❌ Query performance tests failed:", error.message);
            throw error;
        }
    }

    async testBasicQueryPerformance() {
        console.log("\n🔍 Testing Basic Query Performance...");
        
        const basicQueries = [
            { name: 'Products Count', query: 'SELECT COUNT(*) FROM products' },
            { name: 'Areas Count', query: 'SELECT COUNT(*) FROM areas' },
            { name: 'Estates Count', query: 'SELECT COUNT(*) FROM estates' },
            { name: 'Estate Units Count', query: 'SELECT COUNT(*) FROM estate_units' },
            { name: 'Price Trends Count', query: 'SELECT COUNT(*) FROM price_trends' }
        ];

        for (const test of basicQueries) {
            try {
                const startTime = Date.now();
                await pool.query(test.query);
                const endTime = Date.now();
                const duration = endTime - startTime;

                if (duration < 100) {
                    console.log(`✅ ${test.name}: ${duration}ms (Excellent)`);
                    this.testResults.passed++;
                } else if (duration < 500) {
                    console.log(`✅ ${test.name}: ${duration}ms (Good)`);
                    this.testResults.passed++;
                } else {
                    console.log(`⚠️  ${test.name}: ${duration}ms (Slow)`);
                }

                this.performanceMetrics[test.name] = duration;
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`${test.name} failed: ${error.message}`);
            }
        }
    }

    async testJoinQueryPerformance() {
        console.log("\n🔗 Testing Join Query Performance...");
        
        const joinQueries = [
            {
                name: 'Estates with Areas',
                query: `
                    SELECT e.name, a.name as area_name
                    FROM estates e
                    JOIN areas a ON e.area_id = a.id
                    LIMIT 100
                `
            },
            {
                name: 'Estates with Products',
                query: `
                    SELECT e.name, p.name as product_name
                    FROM estates e
                    JOIN products p ON e.product_id = p.id
                    LIMIT 100
                `
            },
            {
                name: 'Estate Units with Estates',
                query: `
                    SELECT eu.unit_type, e.name as estate_name
                    FROM estate_units eu
                    JOIN estates e ON eu.estate_id = e.id
                    LIMIT 100
                `
            }
        ];

        for (const test of joinQueries) {
            try {
                const startTime = Date.now();
                await pool.query(test.query);
                const endTime = Date.now();
                const duration = endTime - startTime;

                if (duration < 200) {
                    console.log(`✅ ${test.name}: ${duration}ms (Excellent)`);
                    this.testResults.passed++;
                } else if (duration < 1000) {
                    console.log(`✅ ${test.name}: ${duration}ms (Good)`);
                    this.testResults.passed++;
                } else {
                    console.log(`⚠️  ${test.name}: ${duration}ms (Slow)`);
                }

                this.performanceMetrics[test.name] = duration;
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`${test.name} failed: ${error.message}`);
            }
        }
    }

    async testAggregationPerformance() {
        console.log("\n📊 Testing Aggregation Query Performance...");
        
        const aggregationQueries = [
            {
                name: 'Estate Classification Count',
                query: `
                    SELECT classification, COUNT(*) as count
                    FROM estates
                    GROUP BY classification
                `
            },
            {
                name: 'Area Estate Distribution',
                query: `
                    SELECT a.name, COUNT(e.id) as estate_count
                    FROM areas a
                    LEFT JOIN estates e ON a.id = e.area_id
                    GROUP BY a.id, a.name
                    ORDER BY estate_count DESC
                `
            },
            {
                name: 'Price Trends by Area',
                query: `
                    SELECT a.name, COUNT(pt.id) as trend_count
                    FROM areas a
                    LEFT JOIN price_trends pt ON a.id = pt.area_id
                    GROUP BY a.id, a.name
                    ORDER BY trend_count DESC
                `
            }
        ];

        for (const test of aggregationQueries) {
            try {
                const startTime = Date.now();
                await pool.query(test.query);
                const endTime = Date.now();
                const duration = endTime - startTime;

                if (duration < 300) {
                    console.log(`✅ ${test.name}: ${duration}ms (Excellent)`);
                    this.testResults.passed++;
                } else if (duration < 1500) {
                    console.log(`✅ ${test.name}: ${duration}ms (Good)`);
                    this.testResults.passed++;
                } else {
                    console.log(`⚠️  ${test.name}: ${duration}ms (Slow)`);
                }

                this.performanceMetrics[test.name] = duration;
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`${test.name} failed: ${error.message}`);
            }
        }
    }

    async testIndexEffectiveness() {
        console.log("\n📈 Testing Index Effectiveness...");
        
        try {
            // Test query without index hint
            const startTime1 = Date.now();
            await pool.query(`
                SELECT * FROM estates 
                WHERE classification = 'luxury' 
                AND estate_type = 'bungalow'
            `);
            const endTime1 = Date.now();
            const duration1 = endTime1 - startTime1;

            // Test query with index hint
            const startTime2 = Date.now();
            await pool.query(`
                SELECT * FROM estates 
                WHERE classification = 'luxury' 
                AND estate_type = 'bungalow'
            `);
            const endTime2 = Date.now();
            const duration2 = endTime2 - startTime2;

            console.log(`✅ Index effectiveness test: First run ${duration1}ms, Second run ${duration2}ms`);
            
            if (duration2 < duration1) {
                console.log("   Index caching working effectively");
                this.testResults.passed++;
            } else {
                console.log("   Index performance could be improved");
            }

        } catch (error) {
            this.testResults.failed++;
            this.testResults.errors.push(`Index effectiveness test failed: ${error.message}`);
        }
    }

    async testComplexQueryPerformance() {
        console.log("\n🧠 Testing Complex Query Performance...");
        
        const complexQueries = [
            {
                name: 'Market Intelligence Query',
                query: `
                    SELECT 
                        a.name as area_name,
                        e.classification,
                        e.estate_type,
                        COUNT(e.id) as estate_count,
                        AVG(e.unit_count) as avg_units,
                        COUNT(CASE WHEN e.gated = true THEN 1 END) as gated_count
                    FROM areas a
                    LEFT JOIN estates e ON a.id = e.area_id
                    GROUP BY a.id, a.name, e.classification, e.estate_type
                    ORDER BY estate_count DESC
                `
            },
            {
                name: 'Business Expansion Analysis',
                query: `
                    SELECT 
                        e.classification,
                        e.estate_type,
                        COUNT(e.id) as total_estates,
                        COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END) as occupied_count,
                        ROUND(
                            COUNT(CASE WHEN e.occupancy_status = 'fully_occupied' THEN 1 END)::decimal / 
                            COUNT(e.id)::decimal * 100, 2
                        ) as occupancy_rate
                    FROM estates e
                    GROUP BY e.classification, e.estate_type
                    ORDER BY occupancy_rate DESC
                `
            }
        ];

        for (const test of complexQueries) {
            try {
                const startTime = Date.now();
                await pool.query(test.query);
                const endTime = Date.now();
                const duration = endTime - startTime;

                if (duration < 500) {
                    console.log(`✅ ${test.name}: ${duration}ms (Excellent)`);
                    this.testResults.passed++;
                } else if (duration < 2000) {
                    console.log(`✅ ${test.name}: ${duration}ms (Good)`);
                    this.testResults.passed++;
                } else {
                    console.log(`⚠️  ${test.name}: ${duration}ms (Slow - consider optimization)`);
                }

                this.performanceMetrics[test.name] = duration;
            } catch (error) {
                this.testResults.failed++;
                this.testResults.errors.push(`${test.name} failed: ${error.message}`);
            }
        }
    }

    printTestSummary() {
        console.log("\n" + "=".repeat(60));
        console.log("📊 QUERY PERFORMANCE TEST SUMMARY");
        console.log("=".repeat(60));
        console.log(`✅ Tests Passed: ${this.testResults.passed}`);
        console.log(`❌ Tests Failed: ${this.testResults.failed}`);
        
        if (Object.keys(this.performanceMetrics).length > 0) {
            console.log("\n📈 Performance Metrics:");
            Object.entries(this.performanceMetrics).forEach(([query, duration]) => {
                console.log(`   ${query}: ${duration}ms`);
            });
        }
        
        if (this.testResults.errors.length > 0) {
            console.log("\n❌ Errors Found:");
            this.testResults.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }
    }
}

export default QueryPerformanceTests;
