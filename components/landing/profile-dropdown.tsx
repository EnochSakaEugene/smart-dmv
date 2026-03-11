"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const DOC_STATUS_KEY = "dmv_document_status"

export function ProfileDropdown() {
  const { user, logout } = useAuth()
  const [documentVerified, setDocumentVerified] = useState(false)

  useEffect(() => {
    const checkDocStatus = () => {
      try {
        const docStatusRaw = localStorage.getItem(DOC_STATUS_KEY)
        if (docStatusRaw) {
          const docStatus = JSON.parse(docStatusRaw)
          setDocumentVerified(!!docStatus.leaseDocument?.verified)
        }
      } catch {
        setDocumentVerified(false)
      }
    }

    checkDocStatus()
    const interval = setInterval(checkDocStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const createdDate = new Date(user.createdAt)
  const expiryDate = new Date(createdDate.getTime() + 90 * 24 * 60 * 60 * 1000)
  const now = new Date()
  const daysLeft = Math.max(0, Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-border bg-background px-1.5 py-1 transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open profile menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {initials}
          </div>
          <span className="hidden pr-2 text-sm font-medium text-foreground sm:block">
            {user.name.split(" ")[0]}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1 text-muted-foreground"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 border-border bg-background p-0">
        {/* Profile info */}
        <div className="flex items-center gap-3 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {initials}
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-foreground">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            <span className="truncate text-xs text-muted-foreground">{user.phone}</span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Account expiry notice */}
        <div className="px-4 py-3">
          <div className={`flex items-center gap-2 rounded border px-3 py-2 text-xs ${
            daysLeft <= 14
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-primary/20 bg-primary/5 text-primary"
          }`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>
              Account expires in <strong>{daysLeft} days</strong>
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Appointment Link (if document verified) */}
        {documentVerified && (
          <div className="px-2 pt-2">
            <Link href="/appointment">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 text-green-700 hover:bg-green-50 hover:text-green-800"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Schedule Appointment
              </Button>
            </Link>
          </div>
        )}

        {/* Logout */}
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="w-full justify-start gap-2 text-foreground hover:bg-muted hover:text-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
