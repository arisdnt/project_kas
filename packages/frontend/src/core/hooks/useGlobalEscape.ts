import { useEffect } from 'react'

/**
 * Global ESC key handler untuk menutup modal, drawer, dan overlay
 *
 * Strategi:
 * 1. Cari elemen dialog/modal/drawer yang terbuka
 * 2. Trigger close button atau overlay click untuk menutup
 * 3. Pastikan hanya modal/drawer teratas yang tertutup (untuk nested modals)
 */

export function useGlobalEscape() {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      // Strategi 1: Tutup modal dialog (Radix UI Dialog)
      const dialogElement = document.querySelector('[role="dialog"][data-state="open"]')
      if (dialogElement) {
        // Cari close button di dalam dialog
        const closeButton = dialogElement.querySelector('[data-radix-collection-item]:last-of-type button, button[aria-label*="lose"], button[aria-label*="Close"], .close-button')
        if (closeButton instanceof HTMLElement) {
          closeButton.click()
          return
        }

        // Jika tidak ada close button, coba trigger overlay click
        const overlay = document.querySelector('[data-radix-dialog-overlay]')
        if (overlay instanceof HTMLElement) {
          overlay.click()
          return
        }
      }

      // Strategi 2: Tutup sheet/drawer (Radix UI Sheet atau custom drawer)
      const sheetElement = document.querySelector('[role="dialog"][data-vaul-drawer], [data-vaul-overlay]')
      if (sheetElement) {
        const sheetCloseButton = sheetElement.querySelector('button[aria-label*="lose"], button[aria-label*="Close"], .close-button')
        if (sheetCloseButton instanceof HTMLElement) {
          sheetCloseButton.click()
          return
        }
      }

      // Strategi 3: Tutup dropdown/popover yang terbuka
      const popoverElement = document.querySelector('[role="menu"][data-state="open"], [role="listbox"][data-state="open"], [data-radix-popper-content-wrapper]')
      if (popoverElement) {
        const popoverClose = popoverElement.querySelector('button[aria-label*="lose"], button[aria-label*="Close"]')
        if (popoverClose instanceof HTMLElement) {
          popoverClose.click()
          return
        }

        // Trigger click outside untuk menutup popover
        document.body.click()
        return
      }

      // Strategi 4: Tutup sidebar/drawer mobile yang terbuka
      const sidebarElement = document.querySelector('[data-sidebar="sidebar"][data-state="open"], [data-mobile-sidebar="true"][data-state="open"]')
      if (sidebarElement) {
        const sidebarClose = sidebarElement.querySelector('button[aria-label*="lose"], button[aria-label*="Close"], .sidebar-close')
        if (sidebarClose instanceof HTMLElement) {
          sidebarClose.click()
          return
        }
      }

      // Strategi 5: Tutup custom modal dengan class tertentu
      const customModal = document.querySelector('.modal.open, .modal.show, .modal-open, .overlay-open')
      if (customModal) {
        const customClose = customModal.querySelector('.modal-close, .close-btn, button[data-close]')
        if (customClose instanceof HTMLElement) {
          customClose.click()
          return
        }
      }

      // Strategi 6: Cari elemen dengan z-index tertinggi yang bisa ditutup
      const allOverlays = Array.from(document.querySelectorAll('[role="dialog"], .modal, .drawer, .overlay'))
      if (allOverlays.length > 0) {
        // Sort berdasarkan z-index tertinggi
        const sortedOverlays = allOverlays.sort((a, b) => {
          const zIndexA = parseInt(window.getComputedStyle(a as Element).zIndex) || 0
          const zIndexB = parseInt(window.getComputedStyle(b as Element).zIndex) || 0
          return zIndexB - zIndexA
        })

        const topOverlay = sortedOverlays[0]
        const closeBtn = topOverlay.querySelector('button[aria-label*="lose"], button[aria-label*="Close"], .close, .close-button')
        if (closeBtn instanceof HTMLElement) {
          closeBtn.click()
          return
        }
      }

      // Strategi terakhir: Dispatch custom event untuk komponen yang ingin handle ESC
      const escapeEvent = new CustomEvent('globalEscape', {
        bubbles: true,
        cancelable: true,
        detail: { originalEvent: event }
      })
      document.dispatchEvent(escapeEvent)
    }

    // Attach listener dengan capture untuk memastikan prioritas
    document.addEventListener('keydown', handleEscapeKey, { capture: true })

    return () => {
      document.removeEventListener('keydown', handleEscapeKey, { capture: true })
    }
  }, [])
}