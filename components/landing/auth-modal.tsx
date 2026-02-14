"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface AuthModalProps {
  mode: "login" | "register" | null
  onClose: () => void
  onSwitch: (mode: "login" | "register") => void
}

export function AuthModal({ mode, onClose, onSwitch }: AuthModalProps) {
  const { login, register } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")

  // Register form state
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPhone, setRegPhone] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regConfirm, setRegConfirm] = useState("")

  const resetForms = () => {
    setLoginEmail("")
    setLoginPassword("")
    setRegName("")
    setRegEmail("")
    setRegPhone("")
    setRegPassword("")
    setRegConfirm("")
    setError("")
  }

  const handleClose = () => {
    resetForms()
    onClose()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const success = await login(loginEmail, loginPassword)
    setLoading(false)
    if (success) {
      handleClose()
    } else {
      setError("Invalid email or password. Please try again.")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (regPassword !== regConfirm) {
      setError("Passwords do not match.")
      return
    }
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setLoading(true)
    const success = await register(regName, regEmail, regPhone, regPassword)
    setLoading(false)
    if (success) {
      handleClose()
    } else {
      setError("An account with this email already exists.")
    }
  }

  return (
    <Dialog open={mode !== null} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md border-border bg-background">
        {mode === "login" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Log In to Smart-DMV
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your credentials to access your account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="flex flex-col gap-4 pt-2">
              {error && (
                <div className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-email" className="text-foreground">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="login-password" className="text-foreground">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Logging in..." : "Log In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <button
                  type="button"
                  onClick={() => { resetForms(); onSwitch("register") }}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Register
                </button>
              </p>
            </form>
          </>
        ) : mode === "register" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">
                Create an Account
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Register to start your document verification process.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRegister} className="flex flex-col gap-4 pt-2">
              {error && (
                <div className="rounded border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-name" className="text-foreground">Full Name</Label>
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-email" className="text-foreground">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="(202) 555-0123"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-password" className="text-foreground">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="reg-confirm" className="text-foreground">Confirm Password</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  placeholder="Confirm password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { resetForms(); onSwitch("login") }}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Log In
                </button>
              </p>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
