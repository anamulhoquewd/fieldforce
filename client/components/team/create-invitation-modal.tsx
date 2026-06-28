import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { IInvitation } from "@/interfaces"
import useCreateInvitation from "@/hooks/dashboard/team/useCreateInvitation"
import { Controller } from "react-hook-form"
import { Field, FieldError, FieldLabel } from "../ui/field"
import { Input } from "../ui/input"
import { Separator } from "../ui/separator"

interface CreateInvitationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvited: (invitation: IInvitation) => void
}

export function CreateInvitationModal({
  open,
  onOpenChange,
  onInvited,
}: CreateInvitationModalProps) {
  const { form, handleSubmit } = useCreateInvitation(onInvited)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>
            They&apos;ll receive a link to join your organization on FieldForce.
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <form id="invitation-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel
                  className="cursor-pointer"
                  htmlFor="invitation-email"
                >
                  Email address
                </FieldLabel>
                <Input
                  {...field}
                  id="invitation-email"
                  aria-invalid={fieldState.invalid}
                  placeholder="invitation@fieldforce.com"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={form.formState.isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            form="invitation-form"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" /> Sending...
              </>
            ) : (
              "Send invite"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
