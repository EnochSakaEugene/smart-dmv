"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { AuthModal } from "@/components/landing/auth-modal"
import { ProfileDropdown } from "@/components/landing/profile-dropdown"

const DOC_STATUS_KEY = "dmv_document_status"

export function Navbar() {
  const { user, isLoading } = useAuth()
  const [authModal, setAuthModal] = useState<"login" | "register" | "reset-password" | null>(null)
  const [documentVerified, setDocumentVerified] = useState(false)

  useEffect(() => {
    const checkDocStatus = () => {
      try {
        const docStatusRaw = localStorage.getItem(DOC_STATUS_KEY)
        if (docStatusRaw) {
          const docStatus = JSON.parse(docStatusRaw)
          setDocumentVerified(!!docStatus.leaseDocument?.verified)
        } else {
          setDocumentVerified(false)
        }
      } catch {
        setDocumentVerified(false)
      }
    }

    checkDocStatus()
    // Poll for changes
    const interval = setInterval(checkDocStatus, 1000)
    return () => clearInterval(interval)
  }, [])

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/images/dc-dmv-logo.png"
              alt="DC DMV - District of Columbia Department of Motor Vehicles"
              width={160}
              height={56}
              className="h-10 w-auto sm:h-12"
              priority
            />
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
            {user && documentVerified && (
              <Link 
                href="/appointment" 
                className="inline-flex items-center gap-1.5 text-sm font-medium text-green-700 transition-colors hover:text-green-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                Appointment
              </Link>
            )}
            {user && user.role === "staff" && (
              <Link 
                href="/staff" 
                className="inline-flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                Staff Portal
              </Link>
            )}
            {user && user.role === "admin" && (
              <>
                <Link 
                  href="/staff" 
                  className="inline-flex items-center gap-1.5 rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 transition-colors hover:bg-green-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
                  Staff Portal
                </Link>
                <Link 
                  href="/admin" 
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
                  Admin Dashboard
                </Link>
              </>
            )}
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
