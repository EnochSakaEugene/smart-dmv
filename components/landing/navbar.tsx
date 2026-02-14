"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/landing/auth-modal"
import { ProfileDropdown } from "@/components/landing/profile-dropdown"

export function Navbar() {
  const { user, isLoading } = useAuth()
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null)

  return (
    <>
      {/* DC Gov top bar */}
      <div className="bg-accent text-accent-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 sm:px-6">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium tracking-wide opacity-80">DC.gov</span>
            <span className="hidden text-xs opacity-60 sm:inline">An official website of the District of Columbia government</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <a href="#" className="opacity-70 transition-opacity hover:opacity-100">311 Online</a>
            <a href="#" className="opacity-70 transition-opacity hover:opacity-100">Agency Directory</a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-primary">
              <span className="text-lg font-bold text-primary-foreground">DC</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight text-foreground sm:text-lg">Smart-DMV</span>
              <span className="hidden text-[11px] leading-tight text-muted-foreground sm:block">
                Department of Motor Vehicles
              </span>
            </div>
          </Link>

          {/* Navigation links */}
          <nav className="hidden items-center gap-6 lg:flex">
            <Link href="/" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
              Home
            </Link>
            <a href="#services" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Services
            </a>
            <a href="#about" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              About
            </a>
            <a href="#contact" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Contact
            </a>
          </nav>

          {/* Auth buttons / Profile */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-9 w-20 animate-pulse rounded bg-muted" />
            ) : user ? (
              <ProfileDropdown />
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAuthModal("login")}
                  className="border-primary/30 text-foreground hover:bg-primary/5 hover:text-primary"
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  onClick={() => setAuthModal("register")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Register
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        mode={authModal}
        onClose={() => setAuthModal(null)}
        onSwitch={(mode) => setAuthModal(mode)}
      />
    </>
  )
}
