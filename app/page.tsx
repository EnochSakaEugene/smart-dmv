import { SectionA } from "@/components/form/section-a"
import { SectionB } from "@/components/form/section-b"
import { SectionC } from "@/components/form/section-c"
import { SectionD } from "@/components/form/section-d"
import { SectionE } from "@/components/form/section-e"
import { SectionF } from "@/components/form/section-f"
import { SectionG } from "@/components/form/section-g"
import { SectionH } from "@/components/form/section-h"

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans">
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl">
            DC Driver License or Identification Card
          </h1>
          <h2 className="text-lg font-bold uppercase text-foreground">
            Application
          </h2>
          <p className="mt-2 text-xs text-muted-foreground italic">
            The information you provide will be used to register you to vote unless you decline in Section G.
          </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-4">
          <SectionA />
          <SectionB />
          <SectionC />
          <SectionD />
          <SectionE />
          <SectionF />

          {/* Office Use Section */}
          <div className="flex flex-col gap-2 border border-foreground/30 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <p className="text-xs text-muted-foreground">
                To confidentially report waste, fraud or abuse by a DC Government Agency or official, call the DC Inspector General at 1.800.521.1639
              </p>
              <p className="text-xs text-muted-foreground whitespace-nowrap">
                Form revised February 2025
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 border-t border-foreground/20 pt-3">
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Employee Signature
                </label>
                <div className="h-10 border-b border-foreground/30" />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Date
                </label>
                <div className="h-10 border-b border-foreground/30" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Questions: Please visit our website at{" "}
              <span className="font-medium text-foreground">dmv.dc.gov</span>{" "}
              or call 311 in DC or 202.737.4404 outside the 202 area code.
            </p>
          </div>

          {/* Page break indicator */}
          <div className="flex items-center justify-center py-2">
            <div className="flex-1 border-t border-dashed border-foreground/20" />
            <span className="px-3 text-xs text-muted-foreground">Continued on Next Page</span>
            <div className="flex-1 border-t border-dashed border-foreground/20" />
          </div>

          <SectionG />
          <SectionH />
        </form>
      </main>
    </div>
  )
}
