import { toast } from "@/core/hooks/useToast"
import { systemDialog } from "@/core/hooks/useSystemDialog"

/**
 * Custom notification utilities that replace Windows native dialogs
 */
export const notifications = {
  /**
   * Show success toast notification
   */
  success: (title: string, description?: string) => {
    return toast({
      variant: "success",
      title,
      description,
    })
  },

  /**
   * Show error toast notification
   */
  error: (title: string, description?: string) => {
    return toast({
      variant: "destructive",
      title,
      description,
    })
  },

  /**
   * Show warning toast notification
   */
  warning: (title: string, description?: string) => {
    return toast({
      variant: "warning",
      title,
      description,
    })
  },

  /**
   * Show info toast notification
   */
  info: (title: string, description?: string) => {
    return toast({
      variant: "info",
      title,
      description,
    })
  },

  /**
   * Show custom dialog instead of alert()
   */
  alert: async (message: string, title: string = "Informasi") => {
    return await systemDialog.showInfo(title, message)
  },

  /**
   * Show custom confirmation dialog instead of confirm()
   */
  confirm: async (message: string, title: string = "Konfirmasi") => {
    return await systemDialog.showConfirm(title, message)
  },

  /**
   * Show delete confirmation dialog
   */
  confirmDelete: async (message: string = "Apakah Anda yakin ingin menghapus item ini?", title: string = "Konfirmasi Hapus") => {
    return await systemDialog.showConfirmDelete(title, message)
  },

  /**
   * Show error dialog for critical errors
   */
  errorDialog: async (message: string, title: string = "Error") => {
    return await systemDialog.showError(title, message)
  },

  /**
   * Show warning dialog
   */
  warningDialog: async (message: string, title: string = "Peringatan") => {
    return await systemDialog.showWarning(title, message)
  },

  /**
   * Show success dialog for important confirmations
   */
  successDialog: async (message: string, title: string = "Berhasil") => {
    return await systemDialog.showSuccess(title, message)
  }
}

/**
 * Replace native window methods with custom notifications
 */
export function setupCustomNotifications() {
  // Override native alert
  if (typeof window !== 'undefined') {
    const originalAlert = window.alert
    window.alert = (message: string | undefined) => {
      if (message) {
        notifications.alert(message)
      }
    }

    const originalConfirm = window.confirm
    window.confirm = (message: string | undefined): boolean => {
      if (message) {
        // For synchronous confirm, we need to show a warning that this is not supported
        console.warn('window.confirm is not supported with custom dialogs. Use notifications.confirm() instead.')
        notifications.warning('Konfirmasi Diperlukan', message)
        return false
      }
      return false
    }

    // Listen for messages from Electron preload
    window.addEventListener('message', (event) => {
      if (event.data.type === 'CUSTOM_NOTIFICATION') {
        const { variant, title, message } = event.data.payload
        toast({
          variant,
          title,
          description: message,
        })
      } else if (event.data.type === 'CUSTOM_DIALOG') {
        const { type, title, message } = event.data.payload
        if (type === 'confirm') {
          systemDialog.showConfirm(title, message).then((confirmed) => {
            window.postMessage({
              type: 'CUSTOM_DIALOG_RESPONSE',
              payload: { confirmed }
            }, '*')
          })
        }
      }
    })
  }
}

// Auto-setup when module is imported
setupCustomNotifications()