"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"

const VERIFICATION_QUEUE_KEY = "dmv_verification_queue"
const STAFF_ACTIVITY_KEY = "dmv_staff_activity"
const DOC_STATUS_KEY = "dmv_document_status"

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
  reviewedBy?: string
  reviewedAt?: string
  notes?: string
}

// Simulated OCR extracted text for demo
const simulatedOCRText = `RESIDENTIAL LEASE AGREEMENT

Landlord: John Smith Properties LLC
Address: 1234 Pennsylvania Avenue NW
         Washington, DC 20001

Tenant: [Resident Name]
Lease Start: January 1, 2024
Lease End: December 31, 2024
Monthly Rent: $1,850.00

This lease agreement confirms that the above-named 
tenant resides at the specified address in 
Washington, DC.

Signed: _______________
Date: _______________`

export default function StaffReviewPage() {
  const { user } = useAuth()
  const [queue, setQueue] = useState<VerificationRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "staff-review" | "low-confidence">("all")
  
  // Review modal
  const [selectedDoc, setSelectedDoc] = useState<VerificationRequest | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")
  const [isReviewing, setIsReviewing] = useState(false)

  useEffect(() => {
    loadQueue()
    const interval = setInterval(loadQueue, 2000)
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

  const saveQueue = (updatedQueue: VerificationRequest[]) => {
    localStorage.setItem(VERIFICATION_QUEUE_KEY, JSON.stringify(updatedQueue))
    setQueue(updatedQueue)
  }

  const logActivity = (action: "approved" | "rejected" | "note_added", verification: VerificationRequest, notes?: string) => {
    try {
      const activitiesRaw = localStorage.getItem(STAFF_ACTIVITY_KEY)
      const activities = activitiesRaw ? JSON.parse(activitiesRaw) : []
      
      activities.push({
        id: `ACT-${Date.now()}`,
        staffId: user?.id,
        staffName: user?.name,
        action,
        verificationId: verification.id,
        documentType: verification.documentType,
        userName: verification.userName,
        timestamp: new Date().toISOString(),
        notes,
      })
      
      localStorage.setItem(STAFF_ACTIVITY_KEY, JSON.stringify(activities))
    } catch {
      // ignore
    }
  }

  const updateResidentDocStatus = (approved: boolean) => {
    try {
      const docStatusRaw = localStorage.getItem(DOC_STATUS_KEY)
      if (docStatusRaw) {
        const docStatus = JSON.parse(docStatusRaw)
        if (approved) {
          docStatus.leaseDocument = {
            ...docStatus.leaseDocument,
            verified: true,
            verifying: false,
            supportRequested: false,
            rejected: false,
            verifiedAt: new Date().toISOString(),
            verifiedBy: user?.name,
          }
        } else {
          docStatus.leaseDocument = {
            ...docStatus.leaseDocument,
            verified: false,
            verifying: false,
            supportRequested: false,
            rejected: true,
            rejectedAt: new Date().toISOString(),
            rejectedBy: user?.name,
            rejectionReason: reviewNotes || "Document could not be verified by staff review.",
          }
        }
        localStorage.setItem(DOC_STATUS_KEY, JSON.stringify(docStatus))
      }
    } catch {
      // ignore
    }
  }

  const handleApprove = () => {
    if (!selectedDoc) return
    setIsReviewing(true)

    setTimeout(() => {
      const updatedQueue = queue.map((v) => {
        if (v.id === selectedDoc.id) {
          return {
            ...v,
            status: "approved" as const,
            reviewedBy: user?.name,
            reviewedAt: new Date().toISOString(),
            notes: reviewNotes,
          }
        }
        return v
      })

      saveQueue(updatedQueue)
      logActivity("approved", selectedDoc, reviewNotes)
      updateResidentDocStatus(true)
      
      setIsReviewing(false)
      setSelectedDoc(null)
      setReviewNotes("")
    }, 1000)
  }

  const handleReject = () => {
    if (!selectedDoc) return
    setIsReviewing(true)

    setTimeout(() => {
      const updatedQueue = queue.map((v) => {
        if (v.id === selectedDoc.id) {
          return {
            ...v,
            status: "rejected" as const,
            reviewedBy: user?.name,
            reviewedAt: new Date().toISOString(),
            notes: reviewNotes,
          }
        }
        return v
      })

      saveQueue(updatedQueue)
      logActivity("rejected", selectedDoc, reviewNotes)
      updateResidentDocStatus(false)
      
      setIsReviewing(false)
      setSelectedDoc(null)
      setReviewNotes("")
    }, 1000)
  }

  const pendingDocs = queue
    .filter((v) => v.status === "pending")
    .filter((v) => {
      if (filter === "staff-review") return v.isStaffReview
      if (filter === "low-confidence") return v.aiConfidence < 0.7
      return true
    })
    .filter((v) => 
      v.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.documentType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())

  const staffReviewCount = queue.filter((v) => v.status === "pending" && v.isStaffReview).length
  const lowConfidenceCount = queue.filter((v) => v.status === "pending" && v.aiConfidence < 0.7).length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Document Review</h1>
        <p className="text-sm text-muted-foreground">
          Review and verify documents flagged by AI or requested for staff review
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={filter === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setFilter("all")}
              >
                All Pending ({queue.filter((v) => v.status === "pending").length})
              </Badge>
              <Badge
                variant={filter === "staff-review" ? "default" : "outline"}
                className={`cursor-pointer ${filter === "staff-review" ? "bg-red-600" : ""}`}
                onClick={() => setFilter("staff-review")}
              >
                Staff Review ({staffReviewCount})
              </Badge>
              <Badge
                variant={filter === "low-confidence" ? "default" : "outline"}
                className={`cursor-pointer ${filter === "low-confidence" ? "bg-orange-600" : ""}`}
                onClick={() => setFilter("low-confidence")}
              >
                Low Confidence ({lowConfidenceCount})
              </Badge>
            </div>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pending Reviews</CardTitle>
          <CardDescription>
            {pendingDocs.length} document{pendingDocs.length !== 1 ? "s" : ""} awaiting review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
              <p className="mt-4 text-sm font-medium text-muted-foreground">No pending documents</p>
              <p className="mt-1 text-xs text-muted-foreground">All documents have been reviewed</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingDocs.map((doc) => (
                <div
                  key={doc.id}
                  className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between ${
                    doc.isStaffReview ? "border-red-200 bg-red-50" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      doc.isStaffReview ? "bg-red-100" : doc.aiConfidence < 0.7 ? "bg-orange-100" : "bg-amber-100"
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={
                        doc.isStaffReview ? "text-red-600" : doc.aiConfidence < 0.7 ? "text-orange-600" : "text-amber-600"
                      }><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{doc.documentType}</p>
                        {doc.isStaffReview && (
                          <Badge variant="destructive" className="text-[10px]">Staff Review Required</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {doc.userName} &bull; {doc.fileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted {new Date(doc.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">AI Confidence</p>
                      <Badge variant="secondary" className={`${
                        doc.aiConfidence >= 0.8 ? "bg-green-100 text-green-700" :
                        doc.aiConfidence >= 0.6 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {Math.round(doc.aiConfidence * 100)}%
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDoc(doc)
                        setReviewNotes("")
                      }}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              Review the document and extracted OCR text, then approve or reject.
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="grid gap-6 py-4 lg:grid-cols-2">
              {/* Document Preview */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label className="text-sm font-semibold">Document Information</Label>
                  <div className="mt-2 rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{selectedDoc.fileName}</p>
                        <p className="text-xs text-muted-foreground">{selectedDoc.documentType}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted By</p>
                        <p className="font-medium">{selectedDoc.userName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedDoc.userEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted At</p>
                        <p className="font-medium">{new Date(selectedDoc.submittedAt).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">AI Confidence</p>
                        <Badge variant="secondary" className={`${
                          selectedDoc.aiConfidence >= 0.8 ? "bg-green-100 text-green-700" :
                          selectedDoc.aiConfidence >= 0.6 ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {Math.round(selectedDoc.aiConfidence * 100)}%
                        </Badge>
                      </div>
                    </div>
                    {selectedDoc.isStaffReview && (
                      <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-3">
                        <p className="text-xs font-semibold text-red-800">Staff Review Requested</p>
                        <p className="text-xs text-red-600 mt-1">
                          This document was flagged for manual review by the resident after AI verification failed.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Preview Placeholder */}
                <div>
                  <Label className="text-sm font-semibold">Document Preview</Label>
                  <div className="mt-2 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted-foreground/50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <p className="mt-2 text-xs text-muted-foreground">Document preview</p>
                      <p className="text-[10px] text-muted-foreground">{selectedDoc.fileName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* OCR Text & Review */}
              <div className="flex flex-col gap-4">
                <div>
                  <Label className="text-sm font-semibold">Extracted OCR Text</Label>
                  <div className="mt-2 h-56 overflow-y-auto rounded-lg border border-border bg-muted/30 p-4">
                    <pre className="whitespace-pre-wrap text-xs font-mono text-foreground">{simulatedOCRText}</pre>
                  </div>
                </div>

                <div>
                  <Label htmlFor="review-notes" className="text-sm font-semibold">Review Notes</Label>
                  <Textarea
                    id="review-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your review decision (optional for approval, recommended for rejection)..."
                    className="mt-2 h-32"
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={() => setSelectedDoc(null)} disabled={isReviewing}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isReviewing}
              className="gap-2"
            >
              {isReviewing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              )}
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isReviewing}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {isReviewing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              )}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
