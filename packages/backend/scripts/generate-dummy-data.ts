/**
 * Script untuk Generate 500 Data Dummy Produk
 * Sesuai dengan Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 4.0)
 */

import mysql from 'mysql2/promise';
import { faker } from '@faker-js/faker';

// Konfigurasi database
const dbConfig = {
  host: 'localhost',
  user: 'arkan',
  password: 'Arkan123!@#',
  database: 'kasir',
  charset: 'utf8mb4'
};

// Interface untuk data dummy
interface DummyKategori {
  nama: string;
}

interface DummyBrand {
  nama: string;
}

interface DummySupplier {
  nama: string;
  alamat: string;
  telepon: string;
  email: string;
}

interface DummyProduk {
  nama: string;
  deskripsi: string;
  sku: string;
  id_kategori: number;
  id_brand: number;
  id_supplier: number;
}

interface DummyInventaris {
  id_toko: number;
  id_produk: number;
  jumlah: number;
  harga: number;
  harga_beli: number;
}

// Data kategori produk
const kategoriData: DummyKategori[] = [
  { nama: 'Makanan & Minuman' },
  { nama: 'Elektronik' },
  { nama: 'Pakaian' },
  { nama: 'Kesehatan & Kecantikan' },
  { nama: 'Rumah Tangga' },
  { nama: 'Olahraga' },
  { nama: 'Buku & Alat Tulis' },
  { nama: 'Mainan & Hobi' },
  { nama: 'Otomotif' },
  { nama: 'Pertanian' }
];

// Data brand
const brandData: DummyBrand[] = [
  { nama: 'Samsung' },
  { nama: 'Nike' },
  { nama: 'Unilever' },
  { nama: 'Nestle' },
  { nama: 'Sony' },
  { nama: 'Adidas' },
  { nama: 'Loreal' },
  { nama: 'Philips' },
  { nama: 'Canon' },
  { nama: 'Honda' }
];

// Data supplier
const supplierData: DummySupplier[] = [
  {
    nama: 'PT Sumber Rejeki',
    alamat: 'Jl. Sudirman No. 123, Jakarta',
    telepon: '021-12345678',
    email: 'info@sumberrejeki.com'
  },
  {
    nama: 'CV Maju Bersama',
    alamat: 'Jl. Gatot Subroto No. 456, Bandung',
    telepon: '022-87654321',
    email: 'contact@majubersama.co.id'
  },
  {
    nama: 'UD Berkah Jaya',
    alamat: 'Jl. Ahmad Yani No. 789, Surabaya',
    telepon: '031-11223344',
    email: 'admin@berkahjaya.net'
  },
  {
    nama: 'PT Global Trading',
    alamat: 'Jl. Thamrin No. 321, Jakarta',
    telepon: '021-99887766',
    email: 'sales@globaltrading.com'
  },
  {
    nama: 'CV Sentosa Makmur',
    alamat: 'Jl. Diponegoro No. 654, Yogyakarta',
    telepon: '0274-55443322',
    email: 'info@sentosamakmur.id'
  }
];

class DummyDataGenerator {
  private connection: mysql.Connection | null = null;

  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection(dbConfig);
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log('✅ Database connection closed');
    }
  }

  async clearExistingData(): Promise<void> {
    if (!this.connection) throw new Error('No database connection');

    try {
      console.log('🧹 Clearing existing data...');
      
      // Disable foreign key checks
      await this.connection.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      // Clear tables in correct order
      await this.connection.execute('DELETE FROM inventaris');
      await this.connection.execute('DELETE FROM produk');
      await this.connection.execute('DELETE FROM supplier');
      await this.connection.execute('DELETE FROM brand');
      await this.connection.execute('DELETE FROM kategori');
      
      // Reset auto increment
      await this.connection.execute('ALTER TABLE kategori AUTO_INCREMENT = 1');
      await this.connection.execute('ALTER TABLE brand AUTO_INCREMENT = 1');
      await this.connection.execute('ALTER TABLE supplier AUTO_INCREMENT = 1');
      await this.connection.execute('ALTER TABLE produk AUTO_INCREMENT = 1');
      
      // Re-enable foreign key checks
      await this.connection.execute('SET FOREIGN_KEY_CHECKS = 1');
      
      console.log('✅ Existing data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }

  async insertKategori(): Promise<number[]> {
    if (!this.connection) throw new Error('No database connection');

    console.log('📦 Inserting kategori data...');
    const insertedIds: number[] = [];

    for (const kategori of kategoriData) {
      const [result] = await this.connection.execute<mysql.ResultSetHeader>(
        'INSERT INTO kategori (nama) VALUES (?)',
        [kategori.nama]
      );
      insertedIds.push(result.insertId);
    }

    console.log(`✅ Inserted ${insertedIds.length} kategori`);
    return insertedIds;
  }

  async insertBrand(): Promise<number[]> {
    if (!this.connection) throw new Error('No database connection');

    console.log('🏷️ Inserting brand data...');
    const insertedIds: number[] = [];

    for (const brand of brandData) {
      const [result] = await this.connection.execute<mysql.ResultSetHeader>(
        'INSERT INTO brand (nama) VALUES (?)',
        [brand.nama]
      );
      insertedIds.push(result.insertId);
    }

    console.log(`✅ Inserted ${insertedIds.length} brand`);
    return insertedIds;
  }

  async insertSupplier(): Promise<number[]> {
    if (!this.connection) throw new Error('No database connection');

    console.log('🏢 Inserting supplier data...');
    const insertedIds: number[] = [];

    for (const supplier of supplierData) {
      const [result] = await this.connection.execute<mysql.ResultSetHeader>(
        'INSERT INTO supplier (nama, alamat, telepon, email) VALUES (?, ?, ?, ?)',
        [supplier.nama, supplier.alamat, supplier.telepon, supplier.email]
      );
      insertedIds.push(result.insertId);
    }

    console.log(`✅ Inserted ${insertedIds.length} supplier`);
    return insertedIds;
  }

  generateSKU(): string {
    const prefix = faker.string.alpha({ length: 3, casing: 'upper' });
    const number = faker.string.numeric(6);
    return `${prefix}-${number}`;
  }

  async insertProduk(kategoriIds: number[], brandIds: number[], supplierIds: number[]): Promise<number[]> {
    if (!this.connection) throw new Error('No database connection');

    console.log('🛍️ Inserting 500 produk data...');
    const insertedIds: number[] = [];
    const usedSKUs = new Set<string>();

    for (let i = 0; i < 500; i++) {
      // Generate unique SKU
      let sku: string;
      do {
        sku = this.generateSKU();
      } while (usedSKUs.has(sku));
      usedSKUs.add(sku);

      const produk: DummyProduk = {
        nama: faker.commerce.productName(),
        deskripsi: faker.commerce.productDescription(),
        sku: sku,
        id_kategori: faker.helpers.arrayElement(kategoriIds),
        id_brand: faker.helpers.arrayElement(brandIds),
        id_supplier: faker.helpers.arrayElement(supplierIds)
      };

      const [result] = await this.connection.execute<mysql.ResultSetHeader>(
        'INSERT INTO produk (nama, deskripsi, sku, id_kategori, id_brand, id_supplier) VALUES (?, ?, ?, ?, ?, ?)',
        [produk.nama, produk.deskripsi, produk.sku, produk.id_kategori, produk.id_brand, produk.id_supplier]
      );
      insertedIds.push(result.insertId);

      // Progress indicator
      if ((i + 1) % 50 === 0) {
        console.log(`   Progress: ${i + 1}/500 produk inserted`);
      }
    }

    console.log(`✅ Inserted ${insertedIds.length} produk`);
    return insertedIds;
  }

  async insertInventaris(produkIds: number[]): Promise<void> {
    if (!this.connection) throw new Error('No database connection');

    console.log('📊 Inserting inventaris data...');
    const storeId = 1; // Default store ID

    for (let i = 0; i < produkIds.length; i++) {
      const produkId = produkIds[i];
      const hargaBeli = faker.number.int({ min: 5000, max: 500000 });
      const margin = faker.number.float({ min: 1.2, max: 3.0 });
      const hargaJual = Math.round(hargaBeli * margin);

      const inventaris: DummyInventaris = {
        id_toko: storeId,
        id_produk: produkId,
        jumlah: faker.number.int({ min: 0, max: 1000 }),
        harga: hargaJual,
        harga_beli: hargaBeli
      };

      await this.connection.execute(
        'INSERT INTO inventaris (id_toko, id_produk, jumlah, harga, harga_beli) VALUES (?, ?, ?, ?, ?)',
        [inventaris.id_toko, inventaris.id_produk, inventaris.jumlah, inventaris.harga, inventaris.harga_beli]
      );

      // Progress indicator
      if ((i + 1) % 50 === 0) {
        console.log(`   Progress: ${i + 1}/${produkIds.length} inventaris inserted`);
      }
    }

    console.log(`✅ Inserted ${produkIds.length} inventaris records`);
  }

  async generateAllData(): Promise<void> {
    try {
      await this.connect();
      
      // Clear existing data
      await this.clearExistingData();
      
      // Insert master data
      const kategoriIds = await this.insertKategori();
      const brandIds = await this.insertBrand();
      const supplierIds = await this.insertSupplier();
      
      // Insert produk data
      const produkIds = await this.insertProduk(kategoriIds, brandIds, supplierIds);
      
      // Insert inventaris data
      await this.insertInventaris(produkIds);
      
      console.log('\n🎉 Data generation completed successfully!');
      console.log(`📊 Summary:`);
      console.log(`   - Kategori: ${kategoriIds.length}`);
      console.log(`   - Brand: ${brandIds.length}`);
      console.log(`   - Supplier: ${supplierIds.length}`);
      console.log(`   - Produk: ${produkIds.length}`);
      console.log(`   - Inventaris: ${produkIds.length}`);
      
    } catch (error) {
      console.error('❌ Error generating data:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Main execution
async function main() {
  const generator = new DummyDataGenerator();
  
  try {
    await generator.generateAllData();
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { DummyDataGenerator };