import { Toaster } from 'sonner'

function Notifications() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            'flex w-full items-start gap-3 rounded-xl border p-4 text-sm font-medium shadow-lg',
          success: 'border-success/30 bg-success-soft text-success',
          error: 'border-danger/30 bg-danger-soft text-danger',
        },
      }}
    />
  )
}

export default Notifications
