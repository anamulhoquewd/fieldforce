import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface AlertConfirmationProps {
  isOpne: boolean
  setIsOpen: (isOpne: boolean) => void
  onConfirm: (data: any) => void
  title: string
  description: string
  cancelText?: string
  confirmText?: string
  className?: string
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
}

function AlertConfirmation({
  isOpne,
  setIsOpen,
  onConfirm,
  title,
  description,
  cancelText,
  confirmText,
  className,
  variant,
}: AlertConfirmationProps) {
  return (
    <AlertDialog open={isOpne} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText ?? "Cancel"}</AlertDialogCancel>
          <AlertDialogAction
            variant={variant || "default"}
            className={className}
            onClick={(data) => onConfirm(data)}
          >
            {confirmText ?? "Continue"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default AlertConfirmation
