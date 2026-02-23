"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { DocumentUploader } from "@/components/document/document-uploader"
import { ProgressSidebar } from "@/components/document/progress-sidebar"

const APP_STATUS_KEY = "dmv_application_status"

export default function DocumentUploadPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/")
        return
      }

      // Check if the application form was submitted
      try {
        const statusRaw = localStorage.getItem(APP_STATUS_KEY)
        if (statusRaw) {
          const status = JSON.parse(statusRaw)
          if (status.formSubmitted) {
            setFormSubmitted(true)
          }
        }
      } catch {
        // ignore
      }

      setReady(true)
    }
  }, [user, isLoading, router])

  if (isLoading || !ready) {
    return (
      <div className="flex min-h-screen flex-col bg-background font-sans">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // If form not submitted, redirect to application
  if (!formSubmitted) {
    return (
      <div className="flex min-h-screen flex-col bg-background font-sans">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="mx-4 flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">Application Required</h3>
            <p className="text-sm text-muted-foreground">
              You need to submit your application form before uploading documents.
            </p>
            <Link
              href="/application"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to Application Form
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/application" className="transition-colors hover:text-primary">Application</Link>
          <span>/</span>
          <span className="font-medium text-foreground">Document Upload</span>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl">
              Document Upload & Verification
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your required documents for identity and residency verification.
            </p>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Left sidebar - Progress */}
            <div className="w-full shrink-0 lg:w-64">
              <ProgressSidebar />
            </div>

            {/* Main content - Upload area */}
            <div className="flex-1">
              <DocumentUploader />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
