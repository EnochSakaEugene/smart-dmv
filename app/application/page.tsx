"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { FormStepper } from "@/components/form/form-stepper"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"

export default function ApplicationPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/")
      } else {
        setReady(true)
      }
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

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <span>/</span>
          <span className="font-medium text-foreground">DL/ID Application</span>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl">
              DC Driver License or Identification Card
            </h1>
            <h2 className="text-lg font-bold uppercase text-foreground">
              Application
            </h2>
            <p className="mt-2 text-xs italic text-muted-foreground">
              The information you provide will be used to register you to vote
              unless you decline in Section G.
            </p>
          </div>

          {/* Multi-Step Form */}
          <form onSubmit={(e) => { e.preventDefault() }}>
            <FormStepper />
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
