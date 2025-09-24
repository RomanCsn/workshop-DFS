'use client'

import * as React from "react"
import { useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Role = "OWNER" | "CUSTOMER"

const roleHelp: Record<Role, string> = {
  OWNER: "You have horses or a stud.",
  CUSTOMER: "You book services.",
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [role, setRole] = React.useState<Role | "">("")
  const [submitted, setSubmitted] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const router = useRouter()

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitted(true)
    setError(null)
    setSuccess(null)

    if (!role) {
      setError("Please select a role before continuing.")
      return
    }

    const formElement = e.currentTarget
    const data = new FormData(formElement)
    const firstName = (data.get("firstName") || "").toString().trim()
    const lastName = (data.get("lastName") || "").toString().trim()
    const email = (data.get("email") || "").toString().trim().toLowerCase()
    const phone = (data.get("phone") || "").toString().trim()
    const password = (data.get("password") || "").toString()

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (!firstName || !lastName) {
      setError("First name and last name are required.")
      return
    }

    async function signUp() {
      try {
        setIsSubmitting(true)

        const response = await authClient.signUp.email({
          email,
          password,
          firstName,
          lastName,
          phone,
          role,
        })

        if (response.error) {
          setError(response.error.message ?? "Something went wrong. Please try again.")
          return
        }

        setSuccess("Account created! Redirecting you to the dashboard...")
        formElement.reset()
        setRole("")
        setSubmitted(false)
        setTimeout(() => {
          router.push("/dashboard")
        }, 800)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to create account. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    }

    void signUp()
  }

  const help = role
    ? roleHelp[role as Role]
    : "Choose the role that best describes you."

  return (
    <div className={cn("mx-auto w-full max-w-md", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
          <CardDescription>All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Jane"
                autoComplete="given-name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                autoComplete="family-name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(v) => {
                  setRole(v as Role)
                }}
                disabled={isSubmitting}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">{help}</p>
              {submitted && !role ? (
                <p className="text-sm text-destructive" role="alert">
                  Please select a role.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="+33 6 12 34 56 78"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">
                Use at least 8 characters to keep your account safe.
              </p>
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}

            {success ? (
              <p className="text-sm text-emerald-600" role="status">
                {success}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm">
              Already have an account?{" "}
              <a href="/login" className="underline underline-offset-4">
                Log in
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
