"use client"

import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Controller } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import useAcceptInvitation from "@/hooks/auth/acceptInvitation"

export function AcceptRequestForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [showPassword, setShowPassword] = useState(false)
  const { form, handleSubmit } = useAcceptInvitation(token)

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid invitation link</CardTitle>
          <CardDescription>
            This link is missing or expired. Ask your manager to send a new
            invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/auth/signin">Sign in instead</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Join your team</CardTitle>
          <CardDescription>
            Set up your account to accept the invitation and start using
            FieldForce.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="name">Full name</FieldLabel>
                    <Input
                      {...field}
                      id="name"
                      placeholder="Anamul Hoque"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        {...field}
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        className="pr-9"
                        aria-invalid={fieldState.invalid}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Field>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Joining team…
                    </>
                  ) : (
                    "Accept invitation"
                  )}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link href="/auth/signin">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
