"use client"

import { Building2, Eye, EyeOff, Mail, Radar } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import useSignup from "@/hooks/auth/signup"
import { useState } from "react"

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const { form, handleSubmit } = useSignup()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10 dark:bg-background">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-md bg-foreground">
          <Radar className="size-6 text-background" />
        </div>
        <span className="text-xl font-semibold tracking-tight text-foreground">
          FieldForce
        </span>
      </div>

      {/* Card */}
      <Card className="w-full max-w-sm shadow-sm ring-border/50">
        <CardHeader className="pb-2 text-center">
          <h1 className="text-xl font-bold text-foreground">
            Create your workspace
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Set up FieldForce for your team in a minute.
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              {/* Full name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Anamul Hoque"
                        className="h-10 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Work email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Work email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          className="h-10 pl-9 text-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company name */}
              <FormField
                control={form.control}
                name="organizationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Northgate Utilities"
                          className="h-10 pl-9 text-sm"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      We&apos;ll create a workspace for your team.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 8 characters"
                          className="h-10 pr-9 text-sm"
                          {...field}
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-10 w-full rounded-lg transition-colors"
              >
                {form.formState.isSubmitting
                  ? "Creating account…"
                  : "Create account"}
              </Button>
            </form>
          </Form>

          {/* Terms */}
          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account you agree to our{" "}
            <Link
              href="/terms"
              className="text-primary underline underline-offset-2 transition-colors"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-primary underline underline-offset-2 transition-colors"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      {/* Footer link */}
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/signin"
          className="font-mediumm text-muted-foreground underline underline-offset-2 transition-colors hover:text-primary"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
