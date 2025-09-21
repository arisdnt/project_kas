import { useSystemDialog } from "@/core/hooks/useSystemDialog"
import { SystemDialog } from "@/core/components/ui/custom-dialog"

export function SystemDialogProvider() {
  const { open, options, closeDialog } = useSystemDialog()

  if (!options) return null

  return (
    <SystemDialog
      open={open}
      onOpenChange={closeDialog}
      type={options.type || 'info'}
      title={options.title}
      message={options.message}
      buttons={options.buttons}
      defaultButton={options.defaultButton}
    />
  )
}