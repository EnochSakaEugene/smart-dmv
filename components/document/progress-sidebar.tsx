"use client"

import { useEffect, useState } from "react"

const DOC_STATUS_KEY = "dmv_document_status"

interface StepItem {
  label: string
  description: string
  status: "completed" | "in-progress" | "pending"
}

export function ProgressSidebar() {
  const [steps, setSteps] = useState<StepItem[]>([
    {
      label: "Application Form",
      description: "Personal information submitted",
      status: "completed",
    },
    {
      label: "Document Upload",
      description: "Upload required documents",
      status: "in-progress",
    },
    {
      label: "Document Verification",
      description: "AI-powered verification",
      status: "pending",
    },
    {
      label: "Appointment Scheduling",
      description: "Book your DMV visit",
      status: "pending",
    },
  ])

  useEffect(() => {
    try {
      const docStatusRaw = localStorage.getItem(DOC_STATUS_KEY)
      if (docStatusRaw) {
        const docStatus = JSON.parse(docStatusRaw)
        if (docStatus.leaseDocument?.verified) {
          setSteps((prev) =>
            prev.map((step) => {
              if (step.label === "Document Upload") {
                return { ...step, status: "completed" as const }
              }
              if (step.label === "Document Verification") {
                return { ...step, status: "completed" as const }
              }
              if (step.label === "Appointment Scheduling") {
                return { ...step, status: "in-progress" as const }
              }
              return step
            })
          )
        } else if (docStatus.leaseDocument?.uploaded) {
          setSteps((prev) =>
            prev.map((step) => {
              if (step.label === "Document Verification") {
                return { ...step, status: "in-progress" as const, description: "Verifying documents..." }
              }
              return step
            })
          )
        }
      }
    } catch {
      // ignore
    }
  }, [])

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
        Application Progress
      </h3>
      <div className="flex flex-col gap-0">
        {steps.map((step, index) => (
          <div key={step.label} className="flex gap-3">
            {/* Line + Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  step.status === "completed"
                    ? "border-green-600 bg-green-600 text-card"
                    : step.status === "in-progress"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 bg-background text-muted-foreground/40"
                }`}
              >
                {step.status === "completed" ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : step.status === "in-progress" ? (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                ) : (
                  <span className="text-xs font-semibold">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-8 ${
                    step.status === "completed" ? "bg-green-600" : "bg-muted-foreground/20"
                  }`}
                />
              )}
            </div>

            {/* Label */}
            <div className="flex flex-col gap-0.5 pb-6">
              <span
                className={`text-sm font-semibold leading-tight ${
                  step.status === "completed"
                    ? "text-green-700"
                    : step.status === "in-progress"
                      ? "text-foreground"
                      : "text-muted-foreground/60"
                }`}
              >
                {step.label}
              </span>
              <span
                className={`text-xs leading-snug ${
                  step.status === "completed"
                    ? "text-green-600"
                    : step.status === "in-progress"
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                }`}
              >
                {step.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
