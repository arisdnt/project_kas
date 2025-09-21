import { useToast } from "@/core/hooks/useToast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastWithIcon,
} from "@/core/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <ToastWithIcon
            key={id}
            variant={variant}
            title={title as string}
            description={description as string}
            action={action}
            {...props}
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}