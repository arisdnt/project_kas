// MinIO Configuration for Kasir System
const { Client } = require('minio');
const mysql = require('mysql2/promise');

// MinIO Client Configuration - Updated credentials
const minioClient = new Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadminsecretkeychange'
});

// Database Configuration
const dbConfig = {
    host: 'localhost',
    user: 'arkan',
    password: 'Arkan123!@#',
    database: 'kasir',
    charset: 'utf8mb4'
};

// MinIO Bucket Configuration
const BUCKETS = {
    DOCUMENTS: 'kasir-documents',
    IMAGES: 'kasir-images',
    RECEIPTS: 'kasir-receipts',
    AVATARS: 'kasir-avatars',
    PRODUCTS: 'kasir-products'
};

// Initialize MinIO Buckets
async function initializeMinIOBuckets() {
    try {
        for (const [key, bucketName] of Object.entries(BUCKETS)) {
            const exists = await minioClient.bucketExists(bucketName);
            if (!exists) {
                await minioClient.makeBucket(bucketName, 'us-east-1');
                console.log(`✅ Bucket '${bucketName}' created successfully`);
                
                // Set bucket policy for public read access for certain buckets
                if (['kasir-images', 'kasir-products'].includes(bucketName)) {
                    const policy = {
                        Version: '2012-10-17',
                        Statement: [{
                            Effect: 'Allow',
                            Principal: { AWS: ['*'] },
                            Action: ['s3:GetObject'],
                            Resource: [`arn:aws:s3:::${bucketName}/*`]
                        }]
                    };
                    await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
                    console.log(`✅ Public read policy set for '${bucketName}'`);
                }
            } else {
                console.log(`ℹ️  Bucket '${bucketName}' already exists`);
            }
        }
    } catch (error) {
        console.error('❌ Error initializing MinIO buckets:', error.message);
        throw error;
    }
}

// Upload file to MinIO and save metadata to database
async function uploadFileWithMetadata({
    file,
    bucketName,
    fileName,
    transaksiId = null,
    userId = null,
    tipeFile = 'document',
    isPublic = false
}) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Upload to MinIO
        const objectName = `${Date.now()}_${fileName}`;
        await minioClient.putObject(bucketName, objectName, file.buffer, file.size, {
            'Content-Type': file.mimetype,
            'X-Uploaded-By': userId || 'system',
            'X-Upload-Date': new Date().toISOString()
        });
        
        // Generate access URL
        const urlExpiry = isPublic ? null : 24 * 60 * 60; // 24 hours for private files
        const accessUrl = isPublic 
            ? `http://localhost:9000/${bucketName}/${objectName}`
            : await minioClient.presignedGetObject(bucketName, objectName, urlExpiry);
        
        // Save metadata to database
        let documentId = null;
        if (transaksiId) {
            const [result] = await connection.execute(`
                INSERT INTO dokumen_transaksi (
                    id, transaksi_id, nama_file, tipe_dokumen, 
                    mime_type, ukuran_file, path_minio, url_akses, is_public
                ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                transaksiId, fileName, tipeFile, file.mimetype, 
                file.size, `${bucketName}/${objectName}`, accessUrl, isPublic
            ]);
            
            // Get the inserted document ID
            const [rows] = await connection.execute(
                'SELECT id FROM dokumen_transaksi WHERE transaksi_id = ? ORDER BY dibuat_pada DESC LIMIT 1',
                [transaksiId]
            );
            documentId = rows[0]?.id;
        }
        
        return {
            success: true,
            documentId,
            fileName: objectName,
            bucketName,
            accessUrl,
            size: file.size,
            mimeType: file.mimetype
        };
        
    } catch (error) {
        console.error('❌ Error uploading file:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Get file from MinIO
async function getFile(bucketName, objectName) {
    try {
        const stream = await minioClient.getObject(bucketName, objectName);
        return stream;
    } catch (error) {
        console.error('❌ Error getting file:', error);
        throw error;
    }
}

// Delete file from MinIO and database
async function deleteFileWithMetadata(documentId) {
    const connection = await mysql.createConnection(dbConfig);
    
    try {
        // Get file metadata from database
        const [rows] = await connection.execute(
            'SELECT path_minio FROM dokumen_transaksi WHERE id = ?',
            [documentId]
        );
        
        if (rows.length === 0) {
            throw new Error('Document not found');
        }
        
        const pathMinio = rows[0].path_minio;
        const [bucketName, objectName] = pathMinio.split('/', 2);
        
        // Delete from MinIO
        await minioClient.removeObject(bucketName, objectName);
        
        // Delete from database
        await connection.execute(
            'DELETE FROM dokumen_transaksi WHERE id = ?',
            [documentId]
        );
        
        return { success: true, message: 'File deleted successfully' };
        
    } catch (error) {
        console.error('❌ Error deleting file:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

// Test MinIO connection with multiple credential attempts
async function testMinIOConnection() {
    const credentialSets = [
        { accessKey: 'minioadmin', secretKey: 'minioadminsecretkeychange' },
        { accessKey: 'minio', secretKey: 'minio123' },
        { accessKey: 'admin', secretKey: 'password' }
    ];
    
    for (const credentials of credentialSets) {
        try {
            const testClient = new Client({
                endPoint: 'localhost',
                port: 9000,
                useSSL: false,
                ...credentials
            });
            
            const buckets = await testClient.listBuckets();
            console.log(`✅ MinIO connection successful with ${credentials.accessKey}`);
            console.log('📦 Available buckets:', buckets.map(b => b.name));
            
            // Update global client with working credentials
            minioClient.accessKey = credentials.accessKey;
            minioClient.secretKey = credentials.secretKey;
            
            return true;
        } catch (error) {
            console.log(`❌ Failed with ${credentials.accessKey}: ${error.message}`);
        }
    }
    
    console.error('❌ All MinIO credential attempts failed');
    return false;
}

// Test database connection
async function testDatabaseConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute('SELECT 1');
        await connection.end();
        console.log('✅ Database connection successful');
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
}

module.exports = {
    minioClient,
    BUCKETS,
    initializeMinIOBuckets,
    uploadFileWithMetadata,
    getFile,
    deleteFileWithMetadata,
    testMinIOConnection,
    testDatabaseConnection
};