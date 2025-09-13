#!/usr/bin/env node

// Test script untuk memverifikasi koneksi MinIO dan Database
const {
    initializeMinIOBuckets,
    testMinIOConnection,
    testDatabaseConnection,
    BUCKETS
} = require('./minio_config');

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'arkan',
    password: 'Arkan123!@#',
    database: 'kasir',
    charset: 'utf8mb4'
};

// Test database structure and UUID implementation
async function testDatabaseStructure() {
    console.log('\n🔍 Testing Database Structure...');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Test 1: Check if all tables exist
        const [tables] = await connection.execute('SHOW TABLES');
        const tableNames = tables.map(row => Object.values(row)[0]);
        
        const expectedTables = [
            'tenants', 'users', 'toko', 'kategori', 'brand', 'supplier',
            'peran', 'izin', 'pengguna', 'pelanggan', 'produk', 'transaksi',
            'inventaris', 'izin_peran', 'item_transaksi', 'dokumen_transaksi',
            'user_sessions', 'audit_log', 'konfigurasi_sistem'
        ];
        
        console.log(`✅ Found ${tableNames.length} tables`);
        
        const missingTables = expectedTables.filter(table => !tableNames.includes(table));
        if (missingTables.length > 0) {
            console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
        } else {
            console.log('✅ All expected tables exist');
        }
        
        // Test 2: Verify UUID primary keys
        console.log('\n🔍 Verifying UUID Primary Keys...');
        for (const table of ['tenants', 'users', 'produk', 'transaksi']) {
            const [columns] = await connection.execute(`DESCRIBE ${table}`);
            const idColumn = columns.find(col => col.Field === 'id');
            
            if (idColumn && idColumn.Type === 'char(36)' && idColumn.Key === 'PRI') {
                console.log(`✅ ${table}: UUID primary key configured correctly`);
            } else {
                console.log(`❌ ${table}: UUID primary key not configured properly`);
            }
        }
        
        // Test 3: Verify foreign key relationships
        console.log('\n🔍 Verifying Foreign Key Relationships...');
        const [fkConstraints] = await connection.execute(`
            SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = 'kasir' 
            AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY TABLE_NAME
        `);
        
        console.log(`✅ Found ${fkConstraints.length} foreign key relationships`);
        
        // Test 4: Verify default data
        console.log('\n🔍 Verifying Default Data...');
        const [tenants] = await connection.execute('SELECT COUNT(*) as count FROM tenants');
        const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
        const [permissions] = await connection.execute('SELECT COUNT(*) as count FROM izin');
        
        console.log(`✅ Tenants: ${tenants[0].count}`);
        console.log(`✅ Users: ${users[0].count}`);
        console.log(`✅ Permissions: ${permissions[0].count}`);
        
        // Test 5: Test UUID generation
        console.log('\n🔍 Testing UUID Generation...');
        const [result] = await connection.execute('SELECT UUID() as test_uuid');
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (uuidPattern.test(result[0].test_uuid)) {
            console.log(`✅ UUID generation working: ${result[0].test_uuid}`);
        } else {
            console.log(`❌ UUID generation failed: ${result[0].test_uuid}`);
        }
        
        await connection.end();
        return true;
        
    } catch (error) {
        console.error('❌ Database structure test failed:', error.message);
        return false;
    }
}

// Test multi-tenant functionality
async function testMultiTenantFunctionality() {
    console.log('\n🏢 Testing Multi-Tenant Functionality...');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        
        // Get tenant data with related records
        const [tenantData] = await connection.execute(`
            SELECT 
                t.id as tenant_id,
                t.nama as tenant_name,
                COUNT(DISTINCT u.id) as user_count,
                COUNT(DISTINCT s.id) as store_count,
                COUNT(DISTINCT p.id) as product_count
            FROM tenants t
            LEFT JOIN users u ON t.id = u.tenant_id
            LEFT JOIN toko s ON t.id = s.tenant_id  
            LEFT JOIN produk p ON t.id = p.tenant_id
            GROUP BY t.id, t.nama
        `);
        
        console.log('📊 Tenant Summary:');
        tenantData.forEach(tenant => {
            console.log(`  🏢 ${tenant.tenant_name}:`);
            console.log(`     👥 Users: ${tenant.user_count}`);
            console.log(`     🏪 Stores: ${tenant.store_count}`);
            console.log(`     📦 Products: ${tenant.product_count}`);
        });
        
        await connection.end();
        return true;
        
    } catch (error) {
        console.error('❌ Multi-tenant test failed:', error.message);
        return false;
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Starting System Integration Tests...');
    console.log('=' .repeat(50));
    
    const results = {
        database: false,
        minio: false,
        structure: false,
        multiTenant: false,
        buckets: false
    };
    
    try {
        // Test 1: Database Connection
        console.log('\n1️⃣  Testing Database Connection...');
        results.database = await testDatabaseConnection();
        
        // Test 2: MinIO Connection
        console.log('\n2️⃣  Testing MinIO Connection...');
        results.minio = await testMinIOConnection();
        
        // Test 3: Database Structure
        results.structure = await testDatabaseStructure();
        
        // Test 4: Multi-Tenant Functionality
        results.multiTenant = await testMultiTenantFunctionality();
        
        // Test 5: Initialize MinIO Buckets
        if (results.minio) {
            console.log('\n5️⃣  Initializing MinIO Buckets...');
            await initializeMinIOBuckets();
            results.buckets = true;
        }
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
    }
    
    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log('📋 TEST RESULTS SUMMARY:');
    console.log('=' .repeat(50));
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        const testName = test.charAt(0).toUpperCase() + test.slice(1);
        console.log(`${status} - ${testName}`);
    });
    
    const allPassed = Object.values(results).every(result => result === true);
    
    if (allPassed) {
        console.log('\n🎉 ALL TESTS PASSED! System is ready for use.');
        console.log('\n📝 Next Steps:');
        console.log('   1. Start the development server with: ./dev-server.sh');
        console.log('   2. Access admin panel with: username=admin, password=admin123');
        console.log('   3. MinIO console available at: http://localhost:9001');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the errors above.');
    }
    
    process.exit(allPassed ? 0 : 1);
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
}

module.exports = {
    testDatabaseStructure,
    testMultiTenantFunctionality,
    runAllTests
};