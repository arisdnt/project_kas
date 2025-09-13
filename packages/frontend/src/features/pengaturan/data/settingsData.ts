import React from 'react'
import { config } from '@/core/config'
import { 
  Store, 
  DollarSign, 
  Percent, 
  Clock, 
  Printer, 
  Server, 
  Building2,
  Mail,
  Phone,
  MapPin,
  Settings,
  Database,
  Shield,
  FileImage,
  FileText,
  Archive,
  Film,
  Music
} from 'lucide-react'

export interface SettingData {
  title: string
  description: string
  value: string | number | boolean
  icon: React.ReactNode
  category: string
  badge?: boolean
  action?: 'edit' | 'copy' | 'view'
}

export function getSettingsData(): SettingData[] {
  return [
    {
      title: "Nama Toko",
      description: "Nama resmi toko yang akan muncul di struk dan laporan",
      value: config.infoToko.nama,
      icon: React.createElement(Store, { className: "h-6 w-6 text-green-600" }),
      category: "toko",
      action: "edit" as const
    },
    {
      title: "Email Toko",
      description: "Alamat email resmi untuk komunikasi bisnis",
      value: config.infoToko.emailKontak,
      icon: React.createElement(Mail, { className: "h-6 w-6 text-green-600" }),
      category: "toko",
      action: "copy" as const
    },
    {
      title: "Telepon Toko",
      description: "Nomor telepon yang dapat dihubungi pelanggan",
      value: config.infoToko.teleponKontak,
      icon: React.createElement(Phone, { className: "h-6 w-6 text-green-600" }),
      category: "toko",
      action: "copy" as const
    },
    {
      title: "Alamat Toko",
      description: "Alamat lengkap lokasi toko untuk keperluan pengiriman",
      value: config.infoToko.alamat,
      icon: React.createElement(MapPin, { className: "h-6 w-6 text-green-600" }),
      category: "toko",
      action: "edit" as const
    },
    {
      title: "Mata Uang",
      description: "Mata uang default untuk semua transaksi keuangan",
      value: config.mataUang.kode,
      icon: React.createElement(DollarSign, { className: "h-6 w-6 text-yellow-600" }),
      category: "keuangan",
      badge: true
    },
    {
      title: "Simbol Mata Uang",
      description: "Simbol yang digunakan untuk menampilkan harga",
      value: config.mataUang.simbol,
      icon: React.createElement(Settings, { className: "h-6 w-6 text-yellow-600" }),
      category: "keuangan"
    },
    {
      title: "Posisi Simbol",
      description: "Posisi simbol mata uang terhadap angka",
      value: config.mataUang.posisiSimbol,
      icon: React.createElement(Percent, { className: "h-6 w-6 text-yellow-600" }),
      category: "keuangan"
    },
    {
      title: "Pajak Default",
      description: "Persentase pajak yang diterapkan secara otomatis",
      value: `${(config.pajak.tarifDefault * 100).toFixed(2)}%`,
      icon: React.createElement(Percent, { className: "h-6 w-6 text-red-600" }),
      category: "pajak",
      badge: true
    },
    {
      title: "Zona Waktu Server",
      description: "Zona waktu yang digunakan untuk pencatatan waktu transaksi",
      value: config.zonaWaktu,
      icon: React.createElement(Clock, { className: "h-6 w-6 text-indigo-600" }),
      category: "waktu"
    },
    {
      title: "Nama Printer",
      description: "Nama perangkat printer thermal yang terdaftar di sistem",
      value: config.printer.nama,
      icon: React.createElement(Printer, { className: "h-6 w-6 text-purple-600" }),
      category: "printer"
    },
    {
      title: "Tipe Printer",
      description: "Jenis koneksi printer (network/local)",
      value: config.printer.tipe,
      icon: React.createElement(Database, { className: "h-6 w-6 text-purple-600" }),
      category: "printer",
      badge: true
    },
    {
      title: "URL API Server",
      description: "Alamat endpoint utama untuk koneksi backend",
      value: config.api.url,
      icon: React.createElement(Server, { className: "h-6 w-6 text-blue-600" }),
      category: "api",
      action: "copy" as const
    },
    {
      title: "Port API Server",
      description: "Nomor port untuk layanan API backend",
      value: config.api.port,
      icon: React.createElement(Settings, { className: "h-6 w-6 text-blue-600" }),
      category: "api"
    },
    {
      title: "JWT Secret",
      description: "Kunci rahasia untuk enkripsi token autentikasi",
      value: "••••••••••••••••",
      icon: React.createElement(Shield, { className: "h-6 w-6 text-orange-600" }),
      category: "jwt"
    },
    {
      title: "JWT Expiration",
      description: "Durasi berlaku token sebelum harus diperbarui",
      value: config.jwt.expiresIn,
      icon: React.createElement(Clock, { className: "h-6 w-6 text-orange-600" }),
      category: "jwt"
    },
    {
      title: "Tipe File Gambar",
      description: "Format gambar yang diizinkan untuk upload",
      value: `${config.fileTypes?.images.length || 0} format (${config.fileTypes?.images.map(img => img.extensions.join(', ')).join(', ') || 'N/A'})`,
      icon: React.createElement(FileImage, { className: "h-6 w-6 text-cyan-600" }),
      category: "fileTypes",
      badge: true
    },
    {
      title: "Tipe File Dokumen",
      description: "Format dokumen yang diizinkan untuk upload",
      value: `${config.fileTypes?.documents.length || 0} format (${config.fileTypes?.documents.map(doc => doc.extensions.join(', ')).join(', ') || 'N/A'})`,
      icon: React.createElement(FileText, { className: "h-6 w-6 text-blue-600" }),
      category: "fileTypes"
    },
    {
      title: "Tipe File Arsip",
      description: "Format arsip yang diizinkan untuk upload",
      value: `${config.fileTypes?.archives.length || 0} format (${config.fileTypes?.archives.map(archive => archive.extensions.join(', ')).join(', ') || 'N/A'})`,
      icon: React.createElement(Archive, { className: "h-6 w-6 text-purple-600" }),
      category: "fileTypes"
    },
    {
      title: "Tipe File Video",
      description: "Format video yang diizinkan untuk upload",
      value: `${config.fileTypes?.videos.length || 0} format`,
      icon: React.createElement(Film, { className: "h-6 w-6 text-pink-600" }),
      category: "fileTypes"
    },
    {
      title: "Tipe File Audio",
      description: "Format audio yang diizinkan untuk upload",
      value: `${config.fileTypes?.audio.length || 0} format`,
      icon: React.createElement(Music, { className: "h-6 w-6 text-green-600" }),
      category: "fileTypes"
    }
  ]
}