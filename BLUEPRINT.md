

# **Blueprint Arsitektur Sistem Point of Sales Real-Time Multi-Tenant (Revisi 6.0 \- Edisi Bahasa Indonesia dengan Object Storage Terintegrasi)**

## **I. Arsitektur Fondasional & Prinsip Inti**

### **1.1. Tinjauan Sistem**

Dokumen ini menetapkan cetak biru arsitektur untuk sistem *Point of Sales* (POS) *multi-tenant* berkinerja tinggi. Arsitektur ini dirancang sebagai *Single Page Application* (SPA) untuk memberikan pengalaman pengguna yang lancar dan serasa aplikasi *native*.1 Sistem ini memanfaatkan koneksi WebSocket yang persisten untuk sinkronisasi data secara

*real-time*. Model *multi-tenant* mendukung banyak toko yang berbeda, masing-masing dengan data terisolasi.3 Revisi ini secara fundamental mengubah arsitektur penyimpanan file, beralih dari penyimpanan berbasis sistem file lokal ke

**arsitektur *object storage*** yang dapat di-hosting sendiri. Perubahan ini secara signifikan menyederhanakan proses pencadangan (backup), migrasi, dan skalabilitas sistem di masa depan.

### **1.2. Rasional Tumpukan Teknologi**

* **Frontend (React, Vite, Tailwind CSS, Shadcn/ui):** React dipilih karena arsitektur berbasis komponennya.2  
  **Vite** diamanatkan sebagai *build tool* untuk *Hot Module Replacement* (HMR) instan. Tailwind CSS menyediakan pendekatan *utility-first* untuk styling.8  
  **Shadcn/ui** dipilih sebagai pustaka komponen karena sifatnya yang tidak opresif.  
* **Backend (Node.js, Express, Pino, Multer):** Node.js, dengan model I/O *non-blocking*\-nya, sangat cocok untuk menangani banyak koneksi WebSocket.4 Kerangka kerja Express menyediakan fondasi yang kuat untuk API.11  
  **Pino** diamanatkan sebagai pustaka *logging* berkinerja tinggi. **Multer** digunakan sebagai *middleware* untuk menangani unggahan file multipart/form-data.13  
* **Basis Data (MySQL):** MySQL adalah basis data relasional yang matang, dipilih karena integritas data yang kuat dan kepatuhan ACID.4  
* **Penyimpanan Objek (MinIO):** Untuk penyimpanan file (gambar produk, dokumen), sistem ini mengamanatkan penggunaan **MinIO**, sebuah *object storage server* yang kompatibel dengan API Amazon S3 dan dapat di-hosting sendiri.23 MinIO dipilih karena:  
  * **Portabilitas dan Kemudahan Migrasi:** Semua file disimpan dalam satu "bucket" terpusat. Untuk migrasi, Anda hanya perlu memindahkan direktori data MinIO, bukan mencari file yang tersebar di seluruh sistem file.  
  * **Kemudahan Pencadangan:** Proses backup menjadi sangat sederhana, yaitu hanya mencadangkan direktori data MinIO dan database MySQL.  
  * **Skalabilitas:** Dirancang untuk skalabilitas horizontal, jauh melampaui kemampuan sistem file lokal.  
  * **Tanpa Ketergantungan Eksternal:** Sepenuhnya dapat di-hosting sendiri, memenuhi persyaratan untuk operasi lokal/offline tanpa biaya layanan cloud.  
* **Lapisan Real-Time (Socket.IO):** Socket.IO diamanatkan karena fiturnya yang superior, termasuk koneksi ulang otomatis dan *fallback* ke *HTTP long-polling*.16

### **1.3. Mandat Pengembangan "Ketat dan Pasti"**

* **Struktur Proyek Berbasis Fitur:** Kode diorganisir berdasarkan fitur (misalnya, produk, penjualan).18  
* **Aturan 250 Baris Kode (LOC) Per File:** Setiap file (.ts, .tsx) tidak boleh melebihi 250 baris kode.7  
* **Konfigurasi Type-Safe yang Immutable:** Semua konfigurasi dikelola dalam file TypeScript (.ts) untuk validasi waktu kompilasi.21

## **II. Manajemen Konfigurasi Type-Safe**

### **2.1. Filosofi: Konfigurasi sebagai Kode**

Pendekatan ini menolak file .env atau .json karena kurangnya keamanan tipe.22 Dengan mendefinisikan konfigurasi dalam TypeScript, deteksi kesalahan digeser ke waktu kompilasi.

### **2.2. Definisi Skema Konfigurasi (src/core/config/schema.ts)**

Skema konfigurasi diperluas untuk mencakup detail koneksi ke server MinIO.

TypeScript

// berkas: src/core/config/schema.ts  
// Komentar: Berkas ini mendefinisikan "kontrak" atau bentuk dari semua  
// variabel konfigurasi yang digunakan di seluruh aplikasi.

/\*\*  
 \* @interface KonfigurasiPenyimpananObjek  
 \* @description Pengaturan untuk koneksi ke server object storage (MinIO).  
 \*/  
export interface KonfigurasiPenyimpananObjek {  
  readonly endpoint: string;       // Alamat IP atau hostname server MinIO.  
  readonly port: number;           // Port server MinIO.  
  readonly useSsl: boolean;        // Gunakan true jika MinIO dikonfigurasi dengan SSL.  
  readonly accessKey: string;      // Kunci akses untuk otentikasi.  
  readonly secretKey: string;      // Kunci rahasia untuk otentikasi.  
  readonly bucket: string;         // Nama bucket default untuk menyimpan file.  
}

/\*\*  
 \* @interface KonfigurasiAplikasi  
 \* @description Interface utama yang menggabungkan semua konfigurasi aplikasi.  
 \*/  
export interface KonfigurasiAplikasi {  
  //... (InfoToko, MataUang, Pajak, dll. tetap sama)  
  readonly penyimpananObjek: KonfigurasiPenyimpananObjek;  
  readonly api: {  
    readonly url: string;  
    readonly port: number;  
  };  
  readonly jwt: {  
    readonly secret: string;  
    readonly expiresIn: string;  
  };  
}

## **III. Sistem Desain & Fondasi Frontend**

(Tidak ada perubahan signifikan pada bagian ini. Sistem desain tetap menggunakan Tailwind CSS dan komponen dari Shadcn/ui.)

## **IV. Arsitektur Frontend: Klien Real-Time**

(Tidak ada perubahan signifikan pada bagian ini. Alur kerja unggah file dari perspektif pengguna tetap sama, dengan komponen PengunggahFile.tsx yang menampilkan progress bar. Perubahan terjadi pada cara backend menangani dan menyajikan file tersebut.)

## **V. Arsitektur Backend: Inti Multi-Tenant & Manajemen File**

### **5.1. Arsitektur Penyimpanan File dengan Object Storage (MinIO)**

Ini adalah perubahan arsitektur paling signifikan. Sistem beralih dari penyimpanan file di disk lokal server aplikasi ke *object storage* terpusat.

#### **5.1.1. Filosofi: Dekopling Penyimpanan dari Aplikasi**

Dengan menggunakan MinIO, penyimpanan file didekopling (dipisahkan) dari server aplikasi Node.js. Server aplikasi kini tidak lagi bertanggung jawab untuk menyimpan file secara fisik. Tanggung jawabnya adalah:

1. Menerima unggahan file dari klien.  
2. Melakukan validasi keamanan.  
3. Mengunggah file ke MinIO.  
4. Menyimpan *pointer* (kunci objek) ke file di database MySQL.  
5. Menyediakan akses aman ke file dengan menghasilkan URL sementara (*pre-signed URL*).

#### **5.1.2. Alur Kerja Unggahan File (Revisi)**

1. **Penerimaan File:** *Endpoint* API (misalnya, POST /api/v1/produk/:id/gambar) menerima file. Multer dikonfigurasi untuk menggunakan **memoryStorage**, bukan diskStorage. Ini berarti file yang diunggah disimpan sementara di memori server sebagai *buffer*, bukan ditulis ke disk.  
2. **Validasi Keamanan:** *Middleware* kustom berjalan setelah Multer. Ia membaca *buffer* file dari req.file.buffer dan melakukan validasi *magic number* menggunakan file-type untuk memastikan konten file sesuai dengan tipenya.24  
3. **Unggah ke MinIO:** Jika valid, *service layer* menggunakan MinIO SDK (pustaka minio) untuk mengunggah *buffer* file ke *bucket* yang telah ditentukan. Nama file unik yang aman (kunci objek) dibuat pada tahap ini.  
4. **Penyimpanan Referensi:** Kunci objek yang unik ini kemudian disimpan di database MySQL (misalnya, di kolom url\_gambar pada tabel produk).

TypeScript

// berkas: src/features/produk/produk.controller.ts  
// Komentar: Contoh controller yang menangani unggahan gambar produk.

import { minioClient } from '@/core/storage/minioClient';  
import { config } from '@/core/config';  
import crypto from 'crypto';  
import path from 'path';

//... (setelah middleware otentikasi, rbac, dan validasi file)  
export async function unggahGambarProduk(req, res) {  
  try {  
    if (\!req.file) {  
      return res.status(400).json({ pesan: 'Tidak ada file yang diunggah.' });  
    }

    // Buat nama file unik (kunci objek)  
    const namaFileUnik \= \`${crypto.randomBytes(16).toString('hex')}${path.extname(req.file.originalname)}\`;  
      
    // Metadata untuk unggahan  
    const metaData \= { 'Content-Type': req.file.mimetype };

    // Unggah buffer file dari memori ke bucket MinIO  
    await minioClient.putObject(config.penyimpananObjek.bucket, namaFileUnik, req.file.buffer, metaData);

    // Simpan namaFileUnik (kunci objek) ke database MySQL untuk produk yang relevan  
    //... logika untuk update database...

    res.status(200).json({ pesan: 'File berhasil diunggah.', namaFile: namaFileUnik });  
  } catch (error) {  
    //... penanganan kesalahan  
  }  
}

#### **5.1.3. Alur Kerja Penyajian File yang Aman (Revisi)**

Menggunakan *pre-signed URL* adalah pola yang lebih aman dan skalabel daripada menyajikan file langsung melalui server Node.js.

1. **Permintaan Akses:** Klien meminta akses ke file melalui *endpoint* terproteksi (misalnya, GET /api/v1/files/nama-file-unik).  
2. **Otentikasi & Otorisasi:** *Middleware* memverifikasi identitas dan izin pengguna.  
3. **Pembuatan Pre-signed URL:** Jika diizinkan, *service layer* memanggil minioClient.presignedGetObject(). Metode ini menghasilkan URL unik yang memberikan akses sementara (misalnya, berlaku selama 5 menit) untuk mengunduh objek tertentu langsung dari MinIO.  
4. **Redirect Klien:** Backend merespons dengan status 302 Found dan header Location yang berisi *pre-signed URL* tersebut.  
5. **Pengunduhan Langsung:** Browser klien secara otomatis mengikuti *redirect* dan mengunduh file langsung dari server MinIO.

**Keuntungan Pola Ini:** Server aplikasi Node.js tidak terbebani dengan tugas mentransfer data file yang besar. Ia hanya melakukan otorisasi cepat dan pembuatan URL, sementara beban transfer data ditangani oleh MinIO, yang dioptimalkan untuk tugas tersebut.

## **VI. Cetak Biru Basis Data: Hub Logika Bisnis**

### **6.1. Prinsip Desain Skema**

Skema tetap mematuhi Bentuk Normal Ketiga (3NF) untuk integritas data.25 Perubahan utama adalah pada interpretasi kolom yang menyimpan referensi file.

### **6.2. Definisi Tabel (CREATE TABLE Statements)**

Komentar pada tabel yang relevan diperbarui untuk mencerminkan penggunaan *object storage*.

| Entitas | Pernyataan CREATE TABLE |
| :---- | :---- |
| **Produk** | CREATE TABLE produk ( id INT UNSIGNED AUTO\_INCREMENT PRIMARY KEY, \-- ID unik untuk setiap produk nama VARCHAR(255) NOT NULL, \-- Nama produk sku VARCHAR(100) UNIQUE, \-- SKU produk, harus unik url\_gambar VARCHAR(255) NULL, \-- Kunci objek (nama file unik) di MinIO, BUKAN path sistem file id\_kategori INT UNSIGNED, \-- Kunci asing ke tabel kategori id\_brand INT UNSIGNED, \-- Kunci asing ke tabel brand id\_supplier INT UNSIGNED, \-- Kunci asing ke tabel supplier dibuat\_pada TIMESTAMP DEFAULT CURRENT\_TIMESTAMP, diperbarui\_pada TIMESTAMP DEFAULT CURRENT\_TIMESTAMP ON UPDATE CURRENT\_TIMESTAMP, FOREIGN KEY (id\_kategori) REFERENCES kategori(id) ON DELETE SET NULL, FOREIGN KEY (id\_brand) REFERENCES brand(id) ON DELETE SET NULL, FOREIGN KEY (id\_supplier) REFERENCES supplier(id) ON DELETE SET NULL); |
| **Dokumen Transaksi** | CREATE TABLE dokumen\_transaksi ( id INT UNSIGNED AUTO\_INCREMENT PRIMARY KEY, \-- ID unik untuk setiap dokumen id\_transaksi BIGINT UNSIGNED NOT NULL, \-- Kunci asing ke tabel transaksi kunci\_objek VARCHAR(255) NOT NULL, \-- Kunci objek (nama file unik) di MinIO nama\_file\_asli VARCHAR(255) NOT NULL, \-- Nama file asli untuk ditampilkan ke pengguna tipe\_file VARCHAR(100) NOT NULL, \-- Tipe MIME file diunggah\_pada TIMESTAMP DEFAULT CURRENT\_TIMESTAMP, FOREIGN KEY (id\_transaksi) REFERENCES transaksi(id) ON DELETE CASCADE); |
| **(Tabel Lainnya)** | *(Definisi tabel lain seperti toko, pengguna, transaksi, dll. tetap sama)* |

## **VII. Strategi Pencadangan dan Migrasi Perangkat**

Bagian ini secara khusus membahas kemudahan pencadangan dan migrasi yang dimungkinkan oleh arsitektur baru ini.

### **7.1. Proses Pencadangan (Backup)**

Proses pencadangan kini disederhanakan menjadi dua komponen utama:

* **Pencadangan Basis Data (MySQL):**  
  * **Metode:** Gunakan utilitas standar dan andal seperti mysqldump.  
  * **Proses:** Buat skrip yang menjalankan mysqldump untuk mengekspor seluruh database ke satu file .sql. Skrip ini kemudian dapat mengompres file tersebut (misalnya, dengan gzip) untuk menghemat ruang.  
  * **Otomatisasi:** Jadwalkan skrip ini untuk berjalan secara otomatis (misalnya, setiap malam) menggunakan cron (di Linux) atau Penjadwal Tugas (di Windows). Simpan file backup di lokasi yang aman dan terpisah.  
* **Pencadangan Penyimpanan Objek (MinIO):**  
  * **Metode:** Karena MinIO menyimpan semua objek dalam satu struktur direktori di servernya, proses pencadangannya adalah mencadangkan direktori tersebut.  
  * **Proses:** Gunakan utilitas sinkronisasi file seperti rsync untuk membuat salinan cermin (mirror) dari direktori data MinIO ke lokasi backup. rsync efisien karena hanya mentransfer perubahan, bukan menyalin semuanya setiap saat.  
  * **Konsistensi:** Dengan memisahkan data (MySQL) dan file (MinIO), proses pencadangan menjadi lebih bersih, lebih cepat, dan lebih andal dibandingkan dengan mencoba mencadangkan file yang tersebar di berbagai direktori.

### **7.2. Proses Migrasi ke Perangkat Baru**

Migrasi sistem ke server atau perangkat baru menjadi jauh lebih mudah dan tidak rentan terhadap kesalahan.

1. **Hentikan Layanan:** Hentikan sementara server aplikasi Node.js untuk mencegah data baru masuk.  
2. **Lakukan Backup Final:** Jalankan proses pencadangan untuk MySQL (mysqldump) dan MinIO (rsync) seperti yang dijelaskan di atas untuk memastikan Anda memiliki data terbaru.  
3. **Siapkan Perangkat Baru:** Instal semua dependensi yang diperlukan di server baru: Node.js, MySQL, dan MinIO.  
4. **Pulihkan (Restore) Data:**  
   * **MySQL:** Impor file .sql hasil dump ke instance MySQL baru.  
   * **MinIO:** Salin direktori data MinIO yang telah dicadangkan ke lokasi yang sesuai di server baru.  
5. **Konfigurasi Ulang:** Perbarui file konfigurasi (.ts) aplikasi dengan detail koneksi database dan MinIO yang baru (jika ada perubahan, seperti alamat IP).  
6. **Mulai Ulang & Uji:** Jalankan server MinIO, lalu jalankan server aplikasi Node.js. Lakukan pengujian menyeluruh untuk memastikan semua fungsionalitas, termasuk unggah dan unduh file, berjalan dengan benar.

## **VIII. Kesimpulan**

Revisi blueprint ini secara fundamental meningkatkan ketahanan, portabilitas, dan kemudahan pengelolaan sistem POS dengan mengadopsi arsitektur **object storage lokal menggunakan MinIO**. Pendekatan ini secara langsung menjawab tantangan terkait pencadangan dan migrasi perangkat yang sulit dilakukan dengan penyimpanan berbasis sistem file tradisional.

Dengan memisahkan logika aplikasi, data relasional (MySQL), dan penyimpanan file (MinIO), setiap komponen dapat dikelola, dicadangkan, dan dimigrasikan secara independen namun tetap terintegrasi. Ini menciptakan fondasi yang tidak hanya memenuhi persyaratan fungsional saat ini tetapi juga siap untuk skalabilitas di masa depan, sambil tetap setia pada prinsip inti untuk beroperasi secara mandiri dan tanpa biaya layanan eksternal.

#### **Karya yang dikutip**

1. How to Implement Real-Time Data Handling with React \- PixelFreeStudio Blog, diakses September 11, 2025, [https://blog.pixelfreestudio.com/how-to-implement-real-time-data-handling-with-react/](https://blog.pixelfreestudio.com/how-to-implement-real-time-data-handling-with-react/)  
2. React, diakses September 11, 2025, [https://react.dev/](https://react.dev/)  
3. Building a Scalable Multi-Tenant SaaS Product with Laravel or MERN, diakses September 11, 2025, [https://www.pearlorganisation.com/post/building-a-scalable-multi-tenant-saas-product-with-laravel-or-mern](https://www.pearlorganisation.com/post/building-a-scalable-multi-tenant-saas-product-with-laravel-or-mern)  
4. Multi-Tenant SaaS Architecture: How to Build in 2024 | Make IT Simple, diakses September 11, 2025, [https://www.makeitsimple.co.uk/blog/saas-multi-tenant-architecture](https://www.makeitsimple.co.uk/blog/saas-multi-tenant-architecture)  
5. Multi-Tenancy vs Single Tenancy: Which is Better? | OneLogin, diakses September 11, 2025, [https://www.onelogin.com/learn/multi-tenancy-vs-single-tenancy](https://www.onelogin.com/learn/multi-tenancy-vs-single-tenancy)  
6. React Architecture: The Patterns Roadmap \- MaybeWorks, diakses September 11, 2025, [https://maybe.works/blogs/react-architecture](https://maybe.works/blogs/react-architecture)  
7. Thinking in React, diakses September 11, 2025, [https://react.dev/learn/thinking-in-react](https://react.dev/learn/thinking-in-react)  
8. Tailwind CSS \- Rapidly build modern websites without ever leaving your HTML., diakses September 11, 2025, [https://tailwindcss.com/](https://tailwindcss.com/)  
9. Styling with utility classes \- Core concepts \- Tailwind CSS, diakses September 11, 2025, [https://tailwindcss.com/docs/styling-with-utility-classes](https://tailwindcss.com/docs/styling-with-utility-classes)  
10. Build a Tailwind CSS Design System from Figma Guide, diakses September 11, 2025, [https://www.augustinfotech.com/blogs/creating-a-tailwind-css-design-system-based-on-a-figma-style-guide/](https://www.augustinfotech.com/blogs/creating-a-tailwind-css-design-system-based-on-a-figma-style-guide/)  
11. Database integration \- Express.js, diakses September 11, 2025, [https://expressjs.com/en/guide/database-integration.html](https://expressjs.com/en/guide/database-integration.html)  
12. Custom Middleware for Advanced Express.js Applications | by Arunangshu Das \- Medium, diakses September 11, 2025, [https://arunangshudas.medium.com/custom-middleware-for-advanced-express-js-applications-f333680e3a64?source=rss------backend\_development-5](https://arunangshudas.medium.com/custom-middleware-for-advanced-express-js-applications-f333680e3a64?source=rss------backend_development-5)  
13. Uploading Files in Express.js Using Multer | by PiRson \- Medium, diakses September 12, 2025, [https://medium.com/@pirson/uploading-files-in-express-js-using-multer-ff8fa5900d15](https://medium.com/@pirson/uploading-files-in-express-js-using-multer-ff8fa5900d15)  
14. Handling File Uploads and file Validations in Node.js with Multer | by Mohsin Ansari, diakses September 12, 2025, [https://medium.com/@mohsinansari.dev/handling-file-uploads-and-file-validations-in-node-js-with-multer-a3716ec528a3](https://medium.com/@mohsinansari.dev/handling-file-uploads-and-file-validations-in-node-js-with-multer-a3716ec528a3)  
15. Download Multi Store Inventory Management System in PHP MySQL \- Piyush608, diakses September 11, 2025, [https://www.piyush608.in/blog/download-multi-store-inventory-management-system-in-php-mysql/](https://www.piyush608.in/blog/download-multi-store-inventory-management-system-in-php-mysql/)  
16. Introduction | Socket.IO, diakses September 11, 2025, [https://socket.io/docs/v4/](https://socket.io/docs/v4/)  
17. React WebSocket tutorial: Real-time messaging with WebSockets and Socket.IO, diakses September 11, 2025, [https://blog.logrocket.com/websocket-tutorial-socket-io/](https://blog.logrocket.com/websocket-tutorial-socket-io/)  
18. Scalable React Projects with Feature-Based Architecture \- DEV ..., diakses September 11, 2025, [https://dev.to/naserrasouli/scalable-react-projects-with-feature-based-architecture-117c](https://dev.to/naserrasouli/scalable-react-projects-with-feature-based-architecture-117c)  
19. A clean and scalable React 19 project structure based on feature-first architecture. \- GitHub, diakses September 11, 2025, [https://github.com/naserrasoulii/feature-based-react](https://github.com/naserrasoulii/feature-based-react)  
20. React Folder Structure in 5 Steps \[2025\] \- Robin Wieruch, diakses September 11, 2025, [https://www.robinwieruch.de/react-folder-structure/](https://www.robinwieruch.de/react-folder-structure/)  
21. Comprehensive Guide to TypeScript Configuration | by Ayush Kumar Tiwari | Medium, diakses September 11, 2025, [https://medium.com/@itsayu/comprehensive-guide-to-typescript-configuration-69f7acff0f92](https://medium.com/@itsayu/comprehensive-guide-to-typescript-configuration-69f7acff0f92)  
22. The Perfect Configuration Format? Try Typescript | Reflect, diakses September 11, 2025, [https://reflect.run/articles/typescript-the-perfect-file-format/](https://reflect.run/articles/typescript-the-perfect-file-format/)  
23. Best practices for handling user uploading file : r/learnprogramming \- Reddit, diakses September 12, 2025, [https://www.reddit.com/r/learnprogramming/comments/1abc8q2/best\_practices\_for\_handling\_user\_uploading\_file/](https://www.reddit.com/r/learnprogramming/comments/1abc8q2/best_practices_for_handling_user_uploading_file/)  
24. File-Type Validation in Multer is NOT SAFE \- DEV Community, diakses September 12, 2025, [https://dev.to/ayanabilothman/file-type-validation-in-multer-is-not-safe-3h8l](https://dev.to/ayanabilothman/file-type-validation-in-multer-is-not-safe-3h8l)  
25. Database normalization description \- Microsoft 365 Apps, diakses September 11, 2025, [https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/access/database-normalization-description](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/access/database-normalization-description)  
26. Database Design and Implementation- project. | by Albert Opiyo \- Medium, diakses September 11, 2025, [https://medium.com/@aopiyo28/database-design-and-implementation-project-0e7837dede0e](https://medium.com/@aopiyo28/database-design-and-implementation-project-0e7837dede0e)