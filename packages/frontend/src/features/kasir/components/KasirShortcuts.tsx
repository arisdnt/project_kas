import { useEffect } from 'react'

// Scoped keyboard shortcuts for Kasir page only
// Handles F-keys with preventDefault and provides Alt+Shift alternatives
export function KasirShortcuts() {
  useEffect(() => {
    const isEditableTarget = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false
      const tag = el.tagName
      const editable = el.isContentEditable
      return (
        editable ||
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (tag === 'DIV' && el.getAttribute('role') === 'textbox')
      )
    }

    const focusInput = (selector: string) => {
      const el = document.querySelector(selector) as HTMLInputElement | null
      if (el) {
        el.focus()
        try { el.select?.() } catch {}
        return true
      }
      return false
    }

    const clickBySelector = (selector: string) => {
      const btn = document.querySelector(selector) as HTMLElement | null
      if (btn) {
        (btn as HTMLButtonElement).click?.()
        return true
      }
      return false
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger shortcuts while typing in inputs/textareas/contenteditable
      if (isEditableTarget(e.target)) return

      // If any modal/dialog is open, don't process global shortcuts
      const hasOpenDialog = !!document.querySelector('[role="dialog"]:not([aria-hidden="true"])')
      if (hasOpenDialog) return

      const k = e.key
      const lower = k.toLowerCase()

      // 1) Focus product search: Alt+S
      if (e.altKey && lower === 's') {
        e.preventDefault()
        e.stopPropagation()
        focusInput('[data-product-search]')
        return
      }

      // 2) Focus customer search: Alt+P
      if (e.altKey && lower === 'p') {
        e.preventDefault()
        e.stopPropagation()
        focusInput('[data-customer-search]')
        return
      }

      // 3) Clear cart: Alt+Q
      if (e.altKey && lower === 'q') {
        e.preventDefault()
        e.stopPropagation()
        clickBySelector('[data-clear-button]')
        return
      }

      // 4) Open calculator: Alt+C
      if (e.altKey && lower === 'c') {
        e.preventDefault()
        e.stopPropagation()
        clickBySelector('[data-calculator-button]')
        return
      }

      // 5) Draft list: F8
      if (k === 'F8') {
        e.preventDefault()
        e.stopPropagation()
        clickBySelector('[data-show-drafts-button]')
        return
      }

      // 6) Save draft: F9
      if (k === 'F9') {
        e.preventDefault()
        e.stopPropagation()
        clickBySelector('[data-save-draft-button]')
        return
      }

      // 7) Print: F10
      if (k === 'F10') {
        e.preventDefault()
        e.stopPropagation()
        clickBySelector('[data-print-button]')
        return
      }

      // 8) Pay: F12
      if (k === 'F12') {
        e.preventDefault()
        e.stopPropagation()
        clickBySelector('[data-payment-button]')
        return
      }
    }

    // Use capture to intercept before browser in some cases (e.g., F1 help)
    document.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true } as any)
    }
  }, [])

  return null
}
