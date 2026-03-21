"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

const BOOKINGS_KEY = "dmv_all_bookings";

const DMV_LOCATIONS = [
  {
    id: "benning-ridge",
    name: "Benning Ridge Service Center",
    address: "4525 Benning Road, SE",
    city: "Washington, DC 20019",
    type: "Service Center",
    hours: "Mon-Fri: 8:15 AM - 4:00 PM",
    services: ["License Services", "Vehicle Registration", "ID Cards"],
  },
  {
    id: "georgetown",
    name: "Georgetown Service Center",
    address: "3270 M Street, NW, Canal Level – Suite C200",
    city: "Washington, DC 20007",
    type: "Service Center",
    hours: "Mon-Fri: 8:15 AM - 4:00 PM",
    services: ["License Services", "Vehicle Registration", "ID Cards"],
  },
  {
    id: "rhode-island",
    name: "Rhode Island Service Center",
    address: "2350 Washington Place, NE, Suite 112N",
    city: "Washington, DC 20018",
    type: "Service Center",
    hours: "Mon-Fri: 8:15 AM - 4:00 PM",
    services: ["License Services", "Vehicle Registration", "ID Cards"],
  },
  {
    id: "southwest",
    name: "Southwest Service Center",
    address: "95 M Street, SW",
    city: "Washington, DC 20024",
    type: "Service Center",
    hours: "Mon-Fri: 8:15 AM - 4:00 PM",
    services: ["License Services", "Vehicle Registration", "ID Cards"],
  },
  {
    id: "inspection-station",
    name: "Inspection Station",
    address: "1001 Half Street, SW",
    city: "Washington, DC 20024",
    type: "Inspection",
    hours: "Mon-Fri: 6:00 AM - 7:00 PM, Sat: 7:00 AM - 2:00 PM",
    services: ["Vehicle Inspection"],
  },
  {
    id: "adjudication",
    name: "Adjudication Services",
    address: "955 L'Enfant Plaza, SW, Promenade Level – Suite P100",
    city: "Washington, DC 20024",
    type: "Adjudication",
    hours: "Mon-Fri: 8:30 AM - 4:00 PM",
    services: ["Ticket Adjudication", "Hearings"],
  },
];

const generateTimeSlots = (locationType: string, date: Date) => {
  const slots: { time: string; available: boolean }[] = [];
  const dayOfWeek = date.getDay();

  if (locationType === "Inspection") {
    if (dayOfWeek === 6) {
      ["7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM"].forEach(
        (time) => {
          slots.push({ time, available: Math.random() > 0.3 });
        }
      );
    } else {
      [
        "6:00 AM",
        "7:00 AM",
        "8:00 AM",
        "9:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "1:00 PM",
        "2:00 PM",
        "3:00 PM",
        "4:00 PM",
        "5:00 PM",
        "6:00 PM",
      ].forEach((time) => {
        slots.push({ time, available: Math.random() > 0.25 });
      });
    }
  } else {
    [
      "8:30 AM",
      "9:00 AM",
      "9:30 AM",
      "10:00 AM",
      "10:30 AM",
      "11:00 AM",
      "11:30 AM",
      "1:00 PM",
      "1:30 PM",
      "2:00 PM",
      "2:30 PM",
      "3:00 PM",
      "3:30 PM",
    ].forEach((time) => {
      slots.push({ time, available: Math.random() > 0.3 });
    });
  }

  return slots;
};

interface Appointment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  time: string;
  locationId: string;
  locationName: string;
  locationAddress: string;
  bookedAt: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  staffId?: string;
  staffName?: string;
  completedAt?: string;
  documentFileName?: string;
}

export default function AppointmentPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [documentVerified, setDocumentVerified] = useState(false);
  const [documentFileName, setDocumentFileName] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentBooked, setAppointmentBooked] = useState(false);
  const [existingAppointment, setExistingAppointment] = useState<Appointment | null>(null);

  const getAppointmentKey = useMemo(() => {
    return user ? `dmv_appointment_${user.id}` : "dmv_appointment";
  }, [user]);

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }, []);

  const availableLocations = useMemo(() => {
    if (!selectedDate) return [];
    const dayOfWeek = selectedDate.getDay();

    return DMV_LOCATIONS.filter((loc) => {
      if (loc.type === "Inspection" && dayOfWeek === 6) return true;
      if (dayOfWeek === 0 || dayOfWeek === 6) return false;
      return true;
    });
  }, [selectedDate]);

  const timeSlots = useMemo(() => {
    if (!selectedDate || !selectedLocation) return [];
    const location = DMV_LOCATIONS.find((l) => l.id === selectedLocation);
    if (!location) return [];
    return generateTimeSlots(location.type, selectedDate);
  }, [selectedDate, selectedLocation]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/");
      return;
    }

    const initializePage = async () => {
      try {
        const res = await fetch("/api/appointment/eligibility", {
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();

        if (res.ok) {
          setDocumentVerified(!!data.eligible);
          setDocumentFileName(data?.verification?.fileName || "");
        } else {
          setDocumentVerified(false);
          setDocumentFileName("");
        }

        const appointmentRaw = localStorage.getItem(getAppointmentKey);
        if (appointmentRaw) {
          const appointment = JSON.parse(appointmentRaw) as Appointment;
          if (appointment.status !== "cancelled") {
            setExistingAppointment(appointment);
            setAppointmentBooked(true);
          }
        }
      } catch (error) {
        console.error("Failed to initialize appointment page:", error);
        setDocumentVerified(false);
        setDocumentFileName("");
      } finally {
        setReady(true);
      }
    };

    initializePage();
  }, [user, isLoading, router, getAppointmentKey]);

  const handleBookAppointment = () => {
    if (!selectedDate || !selectedTime || !selectedLocation || !user) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const locationData = DMV_LOCATIONS.find((l) => l.id === selectedLocation);

      const appointment: Appointment = {
        id: `APT-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        date: selectedDate.toISOString(),
        time: selectedTime,
        locationId: selectedLocation,
        locationName: locationData?.name || "",
        locationAddress: `${locationData?.address}, ${locationData?.city}` || "",
        bookedAt: new Date().toISOString(),
        status: "scheduled",
        documentFileName,
      };

      localStorage.setItem(getAppointmentKey, JSON.stringify(appointment));

      try {
        const bookingsRaw = localStorage.getItem(BOOKINGS_KEY);
        const bookings: Appointment[] = bookingsRaw ? JSON.parse(bookingsRaw) : [];
        bookings.push(appointment);
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      } catch {
        // ignore
      }

      setExistingAppointment(appointment);
      setAppointmentBooked(true);
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCancelAppointment = () => {
    if (!existingAppointment) return;

    const updated = { ...existingAppointment, status: "cancelled" as const };
    localStorage.setItem(getAppointmentKey, JSON.stringify(updated));

    try {
      const bookingsRaw = localStorage.getItem(BOOKINGS_KEY);
      const bookings: Appointment[] = bookingsRaw ? JSON.parse(bookingsRaw) : [];
      const index = bookings.findIndex((b) => b.id === existingAppointment.id);
      if (index !== -1) {
        bookings[index] = updated;
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
      }
    } catch {
      // ignore
    }

    setAppointmentBooked(false);
    setExistingAppointment(null);
    setSelectedDate(undefined);
    setSelectedLocation(null);
    setSelectedTime(null);
  };

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
    );
  }

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
              You need approved documents before scheduling an appointment.
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
    );
  }

  if (appointmentBooked && existingAppointment) {
    const appointmentDate = new Date(existingAppointment.date);

    return (
      <div className="flex min-h-screen flex-col bg-background font-sans">
        <Navbar />

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
              <p className="mt-1 text-xs text-green-600">Confirmation #: {existingAppointment.id}</p>

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
                      <p className="text-sm font-medium text-foreground">{existingAppointment.locationName}</p>
                      <p className="text-xs text-muted-foreground">{existingAppointment.locationAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 text-left">
                <div className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-blue-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <div>
                    <p className="text-xs font-semibold text-blue-800">What to bring</p>
                    <ul className="mt-1 list-inside list-disc text-xs text-blue-700">
                      <li>Valid identification (passport, state ID)</li>
                      <li>Proof of residency (your uploaded document)</li>
                      <li>Payment for applicable fees</li>
                      <li>Confirmation number: {existingAppointment.id}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  onClick={() => {
                    setAppointmentBooked(false);
                    setExistingAppointment(null);
                    setSelectedDate(undefined);
                    setSelectedLocation(null);
                    setSelectedTime(null);
                  }}
                  variant="outline"
                >
                  Reschedule
                </Button>
                <Button onClick={handleCancelAppointment} variant="destructive">
                  Cancel Appointment
                </Button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />

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
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl">
              Schedule Your Appointment
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Select a date to see available DC DMV locations and times. You can book up to 1 month in advance.
            </p>
          </div>

          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-green-800">Document Verification Complete</p>
                <p className="text-xs text-green-700">Your documents have been verified. You can now schedule your appointment.</p>
              </div>
            </div>
          </div>

          <div className="mb-6 rounded-lg border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Select Date</h3>
            </div>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  setSelectedDate(date);
                  setSelectedLocation(null);
                  setSelectedTime(null);
                }}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dayOfWeek = date.getDay();
                  return date < today || date > maxDate || dayOfWeek === 0;
                }}
                className="rounded-md border"
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Note: Most locations are closed on weekends. Inspection Station is open on Saturdays.
            </p>
          </div>

          {selectedDate && (
            <div className="mb-6 rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Select Location</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              {availableLocations.length === 0 ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm text-amber-700">
                    No locations available on this date. Please select a different date.
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableLocations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => {
                        setSelectedLocation(location.id);
                        setSelectedTime(null);
                      }}
                      className={`rounded-lg border p-4 text-left transition-all ${
                        selectedLocation === location.id
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{location.name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{location.address}</p>
                          <p className="text-xs text-muted-foreground">{location.city}</p>
                        </div>
                        {selectedLocation === location.id && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground"><polyline points="20 6 9 17 4 12" /></svg>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {location.type}
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] text-muted-foreground">{location.hours}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {selectedDate && selectedLocation && (
            <div className="mb-6 rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">Select Time</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {DMV_LOCATIONS.find((l) => l.id === selectedLocation)?.name}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                    className={`rounded-md border px-3 py-2.5 text-xs font-medium transition-colors ${
                      selectedTime === slot.time
                        ? "border-primary bg-primary text-primary-foreground"
                        : slot.available
                          ? "border-border bg-background text-foreground hover:border-primary hover:bg-primary/5"
                          : "cursor-not-allowed border-muted bg-muted text-muted-foreground/50"
                    }`}
                  >
                    {slot.time}
                    {!slot.available && <span className="block text-[9px]">Booked</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedDate && selectedLocation && selectedTime && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-6">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Appointment Summary</h3>
              <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Date</p>
                    <p className="text-sm font-medium text-foreground">
                      {selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Time</p>
                    <p className="text-sm font-medium text-foreground">{selectedTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md border border-border bg-background p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                  <div>
                    <p className="text-[10px] uppercase text-muted-foreground">Location</p>
                    <p className="text-sm font-medium text-foreground">
                      {DMV_LOCATIONS.find((l) => l.id === selectedLocation)?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleBookAppointment} disabled={isSubmitting} size="lg" className="gap-2 px-8">
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      Booking...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><polyline points="9 16 11 18 15 14" /></svg>
                      Confirm Appointment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}