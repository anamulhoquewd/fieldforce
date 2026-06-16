"use client"

import { Eye, EyeOff, Mail, Radar } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import useSignin from "@/hooks/auth/signin"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
const {form, handleSubmit} = useSignin()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 dark:bg-background">
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
          <h1 className="text-xl font-bold text-foreground">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to manage your field team.
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Email */}
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
                          placeholder="••••••••"
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

              {/* Forgot password */}
              <div className="-mt-1 flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-muted-foreground underline underline-offset-2 transition-colors hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="h-10 w-full rounded-lg transition-colors"
              >
                {form.formState.isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Footer link */}
      <p className="mt-6 text-sm text-muted-foreground">
        New to FieldForce?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-muted-foreground transition-colors hover:text-primary underline underline-offset-2"
        >
          Create an account
        </Link>
      </p>
    </div>
  )
}
