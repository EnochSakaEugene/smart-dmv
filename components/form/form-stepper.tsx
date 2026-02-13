"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SectionA } from "./section-a"
import { SectionB } from "./section-b"
import { SectionC } from "./section-c"
import { SectionD } from "./section-d"
import { SectionE } from "./section-e"
import { SectionF } from "./section-f"
import { SectionG } from "./section-g"
import { SectionH } from "./section-h"

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
            {/* Step circle + label */}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
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

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 rounded-full transition-colors ${
                  index < currentStep
                    ? "bg-primary"
                    : "bg-muted-foreground/20"
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
  const [currentStep, setCurrentStep] = useState(0)

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
    <div className="flex flex-col gap-6">
      {/* Step indicator */}
      <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].description}
        </p>
      </div>

      {/* Step content */}
      <div className="flex flex-col gap-4">
        {currentStep === 0 && (
          <>
            <SectionA />
            <SectionB />
          </>
        )}

        {currentStep === 1 && (
          <>
            <SectionC />
            <SectionD />
          </>
        )}

        {currentStep === 2 && (
          <>
            <SectionE />
            <SectionF />
          </>
        )}

        {currentStep === 3 && (
          <>
            <SectionG />
            <SectionH />

            {/* Office Use Section */}
            <div className="flex flex-col gap-2 border border-foreground/30 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  To confidentially report waste, fraud or abuse by a DC
                  Government Agency or official, call the DC Inspector General at
                  1.800.521.1639
                </p>
                <p className="whitespace-nowrap text-xs text-muted-foreground">
                  Form revised February 2025
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 border-t border-foreground/20 pt-3 sm:grid-cols-2">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Employee Signature
                  </label>
                  <div className="h-10 border-b border-foreground/30" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Date
                  </label>
                  <div className="h-10 border-b border-foreground/30" />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Questions: Please visit our website at{" "}
                <span className="font-medium text-foreground">dmv.dc.gov</span>{" "}
                or call 311 in DC or 202.737.4404 outside the 202 area code.
              </p>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 0}
          className="gap-1.5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Previous
        </Button>

        <span className="text-xs text-muted-foreground">
          {currentStep + 1} / {STEPS.length}
        </span>

        {currentStep < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext} className="gap-1.5">
            Next
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Button>
        ) : (
          <Button type="submit" className="gap-1.5">
            Submit Application
          </Button>
        )}
      </div>
    </div>
  )
}
