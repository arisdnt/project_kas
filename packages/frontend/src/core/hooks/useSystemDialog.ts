import * as React from "react"
import type { SystemDialogType } from "@/core/components/ui/custom-dialog"

interface DialogOptions {
  title: string
  message: string
  type?: SystemDialogType
  buttons?: Array<{
    label: string
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    onClick?: () => void
  }>
  defaultButton?: number
}

interface DialogState {
  open: boolean
  options: DialogOptions | null
}

let globalDialogState: DialogState = {
  open: false,
  options: null
}

const listeners: Array<(state: DialogState) => void> = []

function updateDialogState(newState: DialogState) {
  globalDialogState = newState
  listeners.forEach(listener => listener(newState))
}

// System dialog functions that replace Windows native dialogs
export const systemDialog = {
  showInfo: (title: string, message: string): Promise<void> => {
    return new Promise((resolve) => {
      updateDialogState({
        open: true,
        options: {
          title,
          message,
          type: 'info',
          buttons: [
            {
              label: 'OK',
              onClick: () => {
                updateDialogState({ open: false, options: null })
                resolve()
              }
            }
          ]
        }
      })
    })
  },

  showError: (title: string, message: string): Promise<void> => {
    return new Promise((resolve) => {
      updateDialogState({
        open: true,
        options: {
          title,
          message,
          type: 'error',
          buttons: [
            {
              label: 'OK',
              onClick: () => {
                updateDialogState({ open: false, options: null })
                resolve()
              }
            }
          ]
        }
      })
    })
  },

  showWarning: (title: string, message: string): Promise<void> => {
    return new Promise((resolve) => {
      updateDialogState({
        open: true,
        options: {
          title,
          message,
          type: 'warning',
          buttons: [
            {
              label: 'OK',
              onClick: () => {
                updateDialogState({ open: false, options: null })
                resolve()
              }
            }
          ]
        }
      })
    })
  },

  showSuccess: (title: string, message: string): Promise<void> => {
    return new Promise((resolve) => {
      updateDialogState({
        open: true,
        options: {
          title,
          message,
          type: 'success',
          buttons: [
            {
              label: 'OK',
              onClick: () => {
                updateDialogState({ open: false, options: null })
                resolve()
              }
            }
          ]
        }
      })
    })
  },

  showConfirm: (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      updateDialogState({
        open: true,
        options: {
          title,
          message,
          type: 'question',
          buttons: [
            {
              label: 'Batal',
              variant: 'outline',
              onClick: () => {
                updateDialogState({ open: false, options: null })
                resolve(false)
              }
            },
            {
              label: 'Ya',
              variant: 'default',
              onClick: () => {
                updateDialogState({ open: false, options: null })
                resolve(true)
              }
            }
          ],
          defaultButton: 1
        }
      })
    })
  },

  showConfirmDelete: (title: string = 'Konfirmasi Hapus', message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      updateDialogState({
        open: true,
        options: {
          title,
          message,
          type: 'warning',
          buttons: [
            {
              label: 'Batal',
              variant: 'outline',
              onClick: () => {
                updateDialogState({ open: false, options: null })
                resolve(false)
              }
            },
            {
              label: 'Hapus',
              variant: 'destructive',
              onClick: () => {
                updateDialogState({ open: false, options: null })
                resolve(true)
              }
            }
          ],
          defaultButton: 0 // Default to cancel for safety
        }
      })
    })
  },

  showCustom: (options: DialogOptions): Promise<number> => {
    return new Promise((resolve) => {
      const buttonsWithHandlers = options.buttons?.map((button, index) => ({
        ...button,
        onClick: () => {
          updateDialogState({ open: false, options: null })
          button.onClick?.()
          resolve(index)
        }
      })) || [
        {
          label: 'OK',
          onClick: () => {
            updateDialogState({ open: false, options: null })
            resolve(0)
          }
        }
      ]

      updateDialogState({
        open: true,
        options: {
          ...options,
          buttons: buttonsWithHandlers
        }
      })
    })
  }
}

export function useSystemDialog() {
  const [state, setState] = React.useState<DialogState>(globalDialogState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  const closeDialog = () => {
    updateDialogState({ open: false, options: null })
  }

  return {
    ...state,
    closeDialog,
    systemDialog
  }
}