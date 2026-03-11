"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

const DOC_STATUS_KEY = "dmv_document_status"
const APP_STATUS_KEY = "dmv_application_status"
const APPOINTMENT_KEY = "dmv_appointment"

interface TimeSlot {
  time: string
  available: boolean
}

const TIME_SLOTS: TimeSlot[] = [
  { time: "9:00 AM", available: true },
  { time: "9:30 AM", available: true },
  { time: "10:00 AM", available: false },
  { time: "10:30 AM", available: true },
  { time: "11:00 AM", available: true },
  { time: "11:30 AM", available: false },
  { time: "1:00 PM", available: true },
  { time: "1:30 PM", available: true },
  { time: "2:00 PM", available: true },
  { time: "2:30 PM", available: false },
  { time: "3:00 PM", available: true },
  { time: "3:30 PM", available: true },
  { time: "4:00 PM", available: true },
  { time: "4:30 PM", available: false },
]

const DMV_LOCATIONS = [
  { id: "georgetown", name: "Georgetown DMV", address: "3222 M St NW, Washington, DC 20007" },
  { id: "penn-branch", name: "Penn Branch DMV", address: "3220 Pennsylvania Ave SE, Washington, DC 20020" },
  { id: "rhode-island", name: "Rhode Island DMV", address: "1023 Brentwood Rd NE, Washington, DC 20018" },
]

export default function AppointmentPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [documentVerified, setDocumentVerified] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [appointmentBooked, setAppointmentBooked] = useState(false)
  const [existingAppointment, setExistingAppointment] = useState<{
    date: string
    time: string
    location: string
  } | null>(null)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/")
        return
      }

      // Check if document is verified
      try {
        const docStatusRaw = localStorage.getItem(DOC_STATUS_KEY)
        if (docStatusRaw) {
          const docStatus = JSON.parse(docStatusRaw)
          if (docStatus.leaseDocument?.verified) {
            setDocumentVerified(true)
          }
        }

        // Check for existing appointment
        const appointmentRaw = localStorage.getItem(APPOINTMENT_KEY)
        if (appointmentRaw) {
          const appointment = JSON.parse(appointmentRaw)
          setExistingAppointment(appointment)
          setAppointmentBooked(true)
        }
      } catch {
        // ignore
      }

      setReady(true)
    }
  }, [user, isLoading, router])

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime || !selectedLocation) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const locationData = DMV_LOCATIONS.find(l => l.id === selectedLocation)
      const appointment = {
        date: selectedDate.toISOString(),
        time: selectedTime,
        location: locationData?.name || "",
        locationAddress: locationData?.address || "",
        bookedAt: new Date().toISOString(),
      }

      localStorage.setItem(APPOINTMENT_KEY, JSON.stringify(appointment))

      // Update application status
      try {
        const statusRaw = localStorage.getItem(APP_STATUS_KEY)
        const status = statusRaw ? JSON.parse(statusRaw) : {}
        status.appointmentScheduled = true
        localStorage.setItem(APP_STATUS_KEY, JSON.stringify(status))
      } catch {
        // ignore
      }

      setExistingAppointment({
        date: appointment.date,
        time: appointment.time,
        location: appointment.location,
      })
      setAppointmentBooked(true)
      setIsSubmitting(false)
    }, 1500)
  }

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

  // If document not verified, show message
  if (!documentVerified) {
    return (
      <div className="flex min-h-screen flex-col bg-background font-sans">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="mx-4 flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <h3 className="text-lg font-bold text-foreground">Document Verification Required</h3>
            <p className="text-sm text-muted-foreground">
              You need to complete document verification before scheduling an appointment.
            </p>
            <Link
              href="/document-upload"
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Go to Document Upload
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // If appointment already booked
  if (appointmentBooked && existingAppointment) {
    const appointmentDate = new Date(existingAppointment.date)
    return (
      <div className="flex min-h-screen flex-col bg-background font-sans">
        <Navbar />

        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted">
          <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6">
            <Link href="/" className="transition-colors hover:text-primary">Home</Link>
            <span>/</span>
            <Link href="/document-upload" className="transition-colors hover:text-primary">Document Upload</Link>
            <span>/</span>
            <span className="font-medium text-foreground">Appointment</span>
          </div>
        </div>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
            <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <h2 className="text-xl font-bold text-green-800">Appointment Confirmed!</h2>
              <p className="mt-2 text-sm text-green-700">Your DMV appointment has been successfully scheduled.</p>

              <div className="mt-6 rounded-lg border border-green-200 bg-white p-6 text-left">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Appointment Details</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-primary"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-sm font-medium text-foreground">
                        {appointmentDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-primary"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    <div>
                      <p className="text-xs text-muted-foreground">Time</p>
                      <p className="text-sm font-medium text-foreground">{existingAppointment.time}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-primary"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm font-medium text-foreground">{existingAppointment.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-md bg-blue-50 border border-blue-200 p-4 text-left">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-blue-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <div>
                    <p className="text-xs font-semibold text-blue-800">What to bring</p>
                    <ul className="mt-1 text-xs text-blue-700 list-disc list-inside">
                      <li>Valid identification (passport, state ID)</li>
                      <li>Proof of residency (same document you uploaded)</li>
                      <li>Payment for applicable fees</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => {
                  localStorage.removeItem(APPOINTMENT_KEY)
                  setAppointmentBooked(false)
                  setExistingAppointment(null)
                }}
                variant="outline"
                className="mt-6"
              >
                Reschedule Appointment
              </Button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    )
  }

  // Appointment booking form
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3 text-xs text-muted-foreground sm:px-6">
          <Link href="/" className="transition-colors hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/document-upload" className="transition-colors hover:text-primary">Document Upload</Link>
          <span>/</span>
          <span className="font-medium text-foreground">Appointment</span>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl">
              Schedule Your Appointment
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a date, time, and location for your DMV visit.
            </p>
          </div>

          {/* Success Banner */}
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Document Upload Successful</p>
                <p className="text-xs text-green-700">Your documents have been verified. You can now schedule your appointment.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Calendar Section */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Select Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  const dayOfWeek = date.getDay()
                  return date < today || dayOfWeek === 0 || dayOfWeek === 6
                }}
                className="rounded-md border"
              />
            </div>

            {/* Time & Location Section */}
            <div className="flex flex-col gap-6">
              {/* Time Slots */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Select Time</h3>
                {selectedDate ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {TIME_SLOTS.map((slot) => (
                      <button
                        key={slot.time}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available}
                        className={`rounded-md border px-3 py-2 text-xs font-medium transition-colors ${
                          selectedTime === slot.time
                            ? "border-primary bg-primary text-primary-foreground"
                            : slot.available
                              ? "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5"
                              : "border-muted bg-muted text-muted-foreground cursor-not-allowed line-through"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Please select a date first</p>
                )}
              </div>

              {/* Location */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Select Location</h3>
                <div className="flex flex-col gap-2">
                  {DMV_LOCATIONS.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => setSelectedLocation(location.id)}
                      className={`rounded-md border p-4 text-left transition-colors ${
                        selectedLocation === location.id
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">{location.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{location.address}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || !selectedLocation || isSubmitting}
              className="gap-2 px-8"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Booking...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><polyline points="9 16 11 18 15 14" /></svg>
                  Book Appointment
                </>
              )}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
