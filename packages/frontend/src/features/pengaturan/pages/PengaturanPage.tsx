import { useState } from 'react'
import { SettingsHeader } from '../components/SettingsHeader'
import { SettingsStats } from '../components/SettingsStats'
import { SettingsGrid } from '../components/SettingsGrid'
import { PrinterConfigCard } from '../components/PrinterConfigCard'
import { RawConfigCard } from '../components/RawConfigCard'
import { getSettingsData } from '../data/settingsData'

function handleCopyToClipboard(value: string): void {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value)
      .then(() => {
        console.log('Berhasil menyalin ke clipboard:', value)
      })
      .catch((err) => {
        console.error('Gagal menyalin ke clipboard:', err)
        fallbackCopyToClipboard(value)
      })
  } else {
    fallbackCopyToClipboard(value)
  }
}

function fallbackCopyToClipboard(text: string): void {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  
  try {
    const successful = document.execCommand('copy')
    if (successful) {
      console.log('Berhasil menyalin ke clipboard (fallback):', text)
    } else {
      console.error('Gagal menyalin ke clipboard (fallback)')
    }
  } catch (err) {
    console.error('Error saat menyalin ke clipboard (fallback):', err)
  } finally {
    document.body.removeChild(textArea)
  }
}

export function PengaturanPage() {
  const settingsData = getSettingsData()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <SettingsHeader settingsCount={settingsData.length} />

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <SettingsStats />

        {/* Settings Grid */}
        <SettingsGrid onCopyToClipboard={handleCopyToClipboard} />

        {/* Printer Configuration Details */}
        <div className="mt-8">
          <PrinterConfigCard />
        </div>

        {/* Raw Configuration */}
        <div className="mt-8">
          <RawConfigCard />
        </div>
      </div>
    </div>
  )
}

export default PengaturanPage
