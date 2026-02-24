"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { SectionA } from "./section-a"
import { SectionB, type SectionBDefaults } from "./section-b"
import { SectionC } from "./section-c"
import { SectionD } from "./section-d"
import { SectionE } from "./section-e"
import { SectionF } from "./section-f"
import { SectionG } from "./section-g"
import { SectionH } from "./section-h"

const DRAFT_KEY = "dmv_form_draft"
const APP_STATUS_KEY = "dmv_application_status"

const STEPS = [
  {
    label: "Personal Info",
    shortLabel: "Info",
    description: "Application type & personal details",
  },
  {
    label: "History",
    shortLabel: "History",
    description: "Driving & medical history",
  },
  {
    label: "Preferences",
    shortLabel: "Prefs",
    description: "Preferences & medical practitioner",
  },
  {
    label: "Registration",
    shortLabel: "Register",
    description: "Voter registration & certification",
  },
]

function StepIndicator({
  steps,
  currentStep,
}: {
  steps: typeof STEPS
  currentStep: number
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div key={step.label} className="flex flex-1 items-center gap-2">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-background text-primary"
                      : "border-muted-foreground/30 bg-background text-muted-foreground/50"
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex flex-col items-center text-center">
                <span
                  className={`text-[11px] font-medium leading-tight ${
                    isCurrent
                      ? "text-foreground"
                      : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                  }`}
                >
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.shortLabel}</span>
                </span>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  index < currentStep ? "bg-primary" : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function FormStepper() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [draftSaved, setDraftSaved] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const formRef = useRef<HTMLDivElement>(null)

  // Build default values from user registration data
  const sectionBDefaults: SectionBDefaults | undefined = user
    ? {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        address: user.address,
        city: user.city,
        zip: user.zip,
      }
    : undefined

  // Check for existing draft on mount
  useEffect(() => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY)
      if (draft) {
        setHasDraft(true)
      }
    } catch {
      // ignore
    }
  }, [])

  // Save draft - captures all form data
  const saveDraft = useCallback(() => {
    try {
      const formEl = formRef.current?.closest("form")
      if (!formEl) return

      const formData = new FormData(formEl)
      const data: Record<string, string> = {}
      formData.forEach((value, key) => {
        data[key] = value.toString()
      })

      const draft = {
        step: currentStep,
        data,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
      setDraftSaved(true)
      setHasDraft(true)
      setTimeout(() => setDraftSaved(false), 2500)
    } catch {
      // ignore
    }
  }, [currentStep])

  // Restore draft
  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return

      const draft = JSON.parse(raw)
      setCurrentStep(draft.step || 0)

      // Restore form values after render
      setTimeout(() => {
        const formEl = formRef.current?.closest("form")
        if (!formEl || !draft.data) return

        Object.entries(draft.data).forEach(([name, value]) => {
          const elements = formEl.querySelectorAll(`[name="${name}"]`)
          elements.forEach((el) => {
            const element = el as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
            if (element.type === "radio" || element.type === "checkbox") {
              (element as HTMLInputElement).checked = element.value === value
            } else {
              element.value = value as string
            }
          })
        })
      }, 100)

      setHasDraft(false)
    } catch {
      // ignore
    }
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
  }, [])

  const handleSubmit = useCallback(() => {
    // Validate that we're on the last step
    if (currentStep !== STEPS.length - 1) return

    // All steps are always in the DOM (hidden via CSS), so FormData captures everything
    const formEl = formRef.current?.closest("form")
    if (!formEl) return

    const formData = new FormData(formEl)
    const data: Record<string, string> = {}
    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    // Also check checkboxes explicitly (unchecked ones aren't in FormData)
    const checkboxes = formEl.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
    checkboxes.forEach((cb) => {
      if (cb.name && cb.checked) {
        data[cb.name] = "on"
      }
    })

    // Check essential fields
    const hasNeedSelected = data["need_driver_license"] === "on" || data["need_id_card"] === "on" || data["need_motorcycle"] === "on"
    if (!hasNeedSelected) {
      setValidationError("Please select at least one option in Section A (What do you need?). Go back to Step 1 to complete it.")
      return
    }

    const requiredTextFields = ["first_name", "last_name", "email"]
    const missingFields = requiredTextFields.filter((field) => !data[field] || data[field].trim() === "")
    if (missingFields.length > 0) {
      setValidationError("Please fill in all required personal information fields (First Name, Last Name, Email). Go back to Step 1 to complete them.")
      return
    }

    setValidationError(null)

    // Mark application as submitted
    const status = {
      formSubmitted: true,
      submittedAt: new Date().toISOString(),
      userId: user?.id,
      documentsUploaded: false,
    }
    localStorage.setItem(APP_STATUS_KEY, JSON.stringify(status))

    // Clear draft since the form is submitted
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)

    // Show success modal
    setShowSuccess(true)
  }, [currentStep, user])

  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div ref={formRef} className="flex flex-col gap-6">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50">
          <div className="mx-4 flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">Application Submitted Successfully</h3>
            <p className="text-center text-sm leading-relaxed text-muted-foreground">
              Your DC Driver License / ID Card application has been submitted. Please continue to the document upload page to complete your verification process.
            </p>
            <Button
              type="button"
              onClick={() => router.push("/document-upload")}
              className="mt-2 w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Continue to Document Upload
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Button>
          </div>
        </div>
      )}

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-destructive"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
          <span className="text-sm text-destructive">{validationError}</span>
          <button type="button" onClick={() => setValidationError(null)} className="ml-auto text-destructive hover:text-destructive/80">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}

      {/* Draft restore banner */}
      {hasDraft && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            <span className="text-sm text-foreground">You have a saved draft. Would you like to continue where you left off?</span>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="outline" onClick={clearDraft} className="text-xs">
              Discard
            </Button>
            <Button size="sm" onClick={restoreDraft} className="bg-primary text-primary-foreground text-xs hover:bg-primary/90">
              Restore
            </Button>
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].description}
        </p>
      </div>

      {/* Step content - all steps rendered but only active one visible, preserving form state */}
      <div className={`flex flex-col gap-4 ${currentStep !== 0 ? "hidden" : ""}`}>
        <SectionA />
        <SectionB defaults={sectionBDefaults} />
      </div>
      <div className={`flex flex-col gap-4 ${currentStep !== 1 ? "hidden" : ""}`}>
        <SectionC />
        <SectionD />
      </div>
      <div className={`flex flex-col gap-4 ${currentStep !== 2 ? "hidden" : ""}`}>
        <SectionE />
        <SectionF />
      </div>
      <div className={`flex flex-col gap-4 ${currentStep !== 3 ? "hidden" : ""}`}>
        <SectionG />
        <SectionH />

        {/* Office Use Section */}
        <div className="flex flex-col gap-2 border border-foreground/30 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-xs text-muted-foreground">
              To confidentially report waste, fraud or abuse by a DC Government Agency or official, call the DC Inspector General at 1.800.521.1639
            </p>
            <p className="whitespace-nowrap text-xs text-muted-foreground">
              Form revised February 2025
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 border-t border-foreground/20 pt-3 sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Employee Signature</label>
              <div className="h-10 border-b border-foreground/30" />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Date</label>
              <div className="h-10 border-b border-foreground/30" />
            </div>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Questions: Please visit our website at{" "}
            <span className="font-medium text-foreground">dmv.dc.gov</span>{" "}
            or call 311 in DC or 202.737.4404 outside the 202 area code.
          </p>
        </div>
      </div>

      {/* Navigation with Save Draft */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 0}
          className="gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          Previous
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={saveDraft}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
            {draftSaved ? "Saved!" : "Save Draft"}
          </Button>
        </div>

        {currentStep < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            Next
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit} className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            Submit Application
          </Button>
        )}
      </div>
    </div>
  )
}
