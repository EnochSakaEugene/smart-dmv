"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const VERIFICATION_QUEUE_KEY = "dmv_verification_queue"

interface VerificationRequest {
  id: string
  userId: string
  userName: string
  userEmail: string
  documentType: string
  fileName: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  aiConfidence: number
  isStaffReview: boolean
}

export default function ExceptionReportsPage() {
  const [queue, setQueue] = useState<VerificationRequest[]>([])

  useEffect(() => {
    loadQueue()
    const interval = setInterval(loadQueue, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadQueue = () => {
    try {
      const queueRaw = localStorage.getItem(VERIFICATION_QUEUE_KEY)
      if (queueRaw) {
        setQueue(JSON.parse(queueRaw))
      }
    } catch {
      // ignore
    }
  }

  // Exception reports: low confidence or staff review requested
  const exceptions = queue
    .filter((v) => v.status === "pending" && (v.aiConfidence < 0.6 || v.isStaffReview))
    .sort((a, b) => a.aiConfidence - b.aiConfidence)

  const criticalExceptions = exceptions.filter((v) => v.aiConfidence < 0.4 || v.isStaffReview)
  const warningExceptions = exceptions.filter((v) => v.aiConfidence >= 0.4 && v.aiConfidence < 0.6 && !v.isStaffReview)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Exception Reports</h1>
        <p className="text-sm text-muted-foreground">
          Documents flagged as problematic or suspicious requiring immediate attention
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{exceptions.length}</p>
              <p className="text-sm text-muted-foreground">Total Exceptions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{criticalExceptions.length}</p>
              <p className="text-sm text-muted-foreground">Critical</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{warningExceptions.length}</p>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Exceptions */}
      {criticalExceptions.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div>
                <CardTitle className="text-lg text-red-800">Critical Exceptions</CardTitle>
                <CardDescription className="text-red-600">
                  Documents with very low confidence or staff review requested
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {criticalExceptions.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{item.documentType}</p>
                        {item.isStaffReview && (
                          <Badge variant="destructive" className="text-[10px]">Staff Review</Badge>
                        )}
                        <Badge variant="destructive" className="text-[10px]">Critical</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.userName}</p>
                      <p className="text-xs text-red-600">
                        {item.isStaffReview
                          ? "Resident requested staff review after AI rejection"
                          : `AI confidence: ${Math.round(item.aiConfidence * 100)}% - Possible fraudulent document`}
                      </p>
                    </div>
                  </div>
                  <Link href="/staff/review">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">Review Immediately</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning Exceptions */}
      {warningExceptions.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div>
                <CardTitle className="text-lg text-orange-800">Warnings</CardTitle>
                <CardDescription className="text-orange-600">
                  Documents with low confidence requiring review
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {warningExceptions.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.documentType}</p>
                      <p className="text-xs text-muted-foreground">{item.userName}</p>
                      <p className="text-xs text-orange-600">
                        AI confidence: {Math.round(item.aiConfidence * 100)}% - Document quality issues
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-700">{Math.round(item.aiConfidence * 100)}%</Badge>
                    <Link href="/staff/review">
                      <Button size="sm" variant="outline">Review</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {exceptions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-green-500/50"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p className="mt-4 text-sm font-medium text-muted-foreground">No exceptions found</p>
            <p className="mt-1 text-xs text-muted-foreground">All documents are within acceptable confidence levels</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
