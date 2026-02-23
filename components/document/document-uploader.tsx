"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"

const DOC_STATUS_KEY = "dmv_document_status"
const SUPPORT_REQUESTS_KEY = "dmv_support_requests"

type UploadStatus = "idle" | "uploading" | "verifying" | "approved" | "rejected" | "support-requested" | "error"

interface DocumentState {
  file: File | null
  fileName: string
  status: UploadStatus
  progress: number
}

export function DocumentUploader() {
  const [leaseDoc, setLeaseDoc] = useState<DocumentState>(() => {
    // Check if already uploaded
    try {
      const raw = localStorage.getItem(DOC_STATUS_KEY)
      if (raw) {
        const status = JSON.parse(raw)
        if (status.leaseDocument?.verified) {
          return {
            file: null,
            fileName: status.leaseDocument.fileName || "Document",
            status: "approved" as UploadStatus,
            progress: 100,
          }
        }
        if (status.leaseDocument?.supportRequested) {
          return {
            file: null,
            fileName: status.leaseDocument.fileName || "Document",
            status: "support-requested" as UploadStatus,
            progress: 100,
          }
        }
        if (status.leaseDocument?.rejected) {
          return {
            file: null,
            fileName: status.leaseDocument.fileName || "Document",
            status: "rejected" as UploadStatus,
            progress: 100,
          }
        }
        if (status.leaseDocument?.uploaded) {
          return {
            file: null,
            fileName: status.leaseDocument.fileName || "Document",
            status: "verifying" as UploadStatus,
            progress: 100,
          }
        }
      }
    } catch {
      // ignore
    }
    return {
      file: null,
      fileName: "",
      status: "idle" as UploadStatus,
      progress: 0,
    }
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFile = useCallback((file: File) => {
    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ]

    if (!allowedTypes.includes(file.type)) {
      setLeaseDoc((prev) => ({
        ...prev,
        status: "error",
        fileName: file.name,
      }))
      return
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      setLeaseDoc((prev) => ({
        ...prev,
        status: "error",
        fileName: file.name,
      }))
      return
    }

    setLeaseDoc({
      file,
      fileName: file.name,
      status: "uploading",
      progress: 0,
    })

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)

        setLeaseDoc((prev) => ({
          ...prev,
          status: "verifying",
          progress: 100,
        }))

        // Save uploaded status
        const docStatus = {
          leaseDocument: {
            uploaded: true,
            verified: false,
            fileName: file.name,
            uploadedAt: new Date().toISOString(),
          },
        }
        localStorage.setItem(DOC_STATUS_KEY, JSON.stringify(docStatus))

        // Simulate AI verification (3-5 seconds)
        // ~30% chance of rejection to demonstrate the flow
        const willReject = Math.random() < 0.3
        setTimeout(() => {
          if (willReject) {
            setLeaseDoc((prev) => ({
              ...prev,
              status: "rejected",
            }))

            const rejectedDocStatus = {
              leaseDocument: {
                uploaded: true,
                verified: false,
                rejected: true,
                fileName: file.name,
                uploadedAt: new Date().toISOString(),
                rejectedAt: new Date().toISOString(),
                rejectionReason: "Document could not be verified. The document may be unclear, expired, or not a valid lease document.",
              },
            }
            localStorage.setItem(DOC_STATUS_KEY, JSON.stringify(rejectedDocStatus))
          } else {
            setLeaseDoc((prev) => ({
              ...prev,
              status: "approved",
            }))

            const updatedDocStatus = {
              leaseDocument: {
                uploaded: true,
                verified: true,
                fileName: file.name,
                uploadedAt: new Date().toISOString(),
                verifiedAt: new Date().toISOString(),
              },
            }
            localStorage.setItem(DOC_STATUS_KEY, JSON.stringify(updatedDocStatus))
          }
        }, 3000 + Math.random() * 2000)
      } else {
        setLeaseDoc((prev) => ({
          ...prev,
          progress: Math.min(progress, 99),
        }))
      }
    }, 200)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0])
      }
    },
    [handleFile]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleReset = () => {
    setLeaseDoc({
      file: null,
      fileName: "",
      status: "idle",
      progress: 0,
    })
    localStorage.removeItem(DOC_STATUS_KEY)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRequestSupport = useCallback(() => {
    // Save support request so the staff dashboard can pick it up later
    try {
      const existingRaw = localStorage.getItem(SUPPORT_REQUESTS_KEY)
      const existing = existingRaw ? JSON.parse(existingRaw) : []

      const newRequest = {
        id: `req_${Date.now()}`,
        type: "document_verification",
        documentType: "Lease Documents",
        fileName: leaseDoc.fileName,
        requestedAt: new Date().toISOString(),
        status: "pending",
        userNote: "Document could not be automatically verified. Requesting manual staff review.",
      }

      existing.push(newRequest)
      localStorage.setItem(SUPPORT_REQUESTS_KEY, JSON.stringify(existing))

      // Update doc status to reflect support requested
      const docStatusRaw = localStorage.getItem(DOC_STATUS_KEY)
      if (docStatusRaw) {
        const docStatus = JSON.parse(docStatusRaw)
        docStatus.leaseDocument = {
          ...docStatus.leaseDocument,
          supportRequested: true,
          supportRequestId: newRequest.id,
        }
        localStorage.setItem(DOC_STATUS_KEY, JSON.stringify(docStatus))
      }

      setLeaseDoc((prev) => ({
        ...prev,
        status: "support-requested",
      }))
    } catch {
      // ignore
    }
  }, [leaseDoc.fileName])

  return (
    <div className="flex flex-col gap-6">
      {/* Lease Document Upload */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Lease Documents</h3>
              <p className="text-xs text-muted-foreground">Proof of residency - lease agreement or utility bill</p>
            </div>
          </div>
          {leaseDoc.status === "approved" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Approved
            </span>
          )}
          {leaseDoc.status === "verifying" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-amber-700 border-t-transparent" />
              Verifying
            </span>
          )}
          {leaseDoc.status === "rejected" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              Rejected
            </span>
          )}
          {leaseDoc.status === "support-requested" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Staff Review
            </span>
          )}
        </div>

        <div className="p-5">
          {leaseDoc.status === "idle" || leaseDoc.status === "error" ? (
            <>
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
                  dragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop your file here or click to browse
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supports PDF, PNG, JPG (max 10MB)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFile(e.target.files[0])
                    }
                  }}
                />
              </div>
              {leaseDoc.status === "error" && (
                <p className="mt-2 text-xs text-destructive">
                  Invalid file type or file too large. Please upload a PDF, PNG, or JPG file under 10MB.
                </p>
              )}
            </>
          ) : leaseDoc.status === "uploading" ? (
            /* Uploading state */
            <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{leaseDoc.fileName}</p>
                  <p className="text-xs text-muted-foreground">Uploading...</p>
                </div>
                <span className="text-sm font-semibold text-primary">{Math.round(leaseDoc.progress)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${leaseDoc.progress}%` }}
                />
              </div>
            </div>
          ) : leaseDoc.status === "verifying" ? (
            /* Verifying state */
            <div className="flex flex-col gap-4 rounded-lg border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                  <div className="h-5 w-5 animate-spin rounded-full border-3 border-amber-600 border-t-transparent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{leaseDoc.fileName}</p>
                  <p className="text-xs text-amber-700">AI Agent is verifying your document...</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-amber-100/60 px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <p className="text-xs text-amber-700">Please wait while we verify your document. This usually takes a few seconds.</p>
              </div>
            </div>
          ) : leaseDoc.status === "approved" ? (
            /* Approved state */
            <div className="flex flex-col gap-4 rounded-lg border border-green-200 bg-green-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{leaseDoc.fileName}</p>
                  <p className="text-xs text-green-700">Document verified and approved</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-green-100/60 px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                <p className="text-xs text-green-700">Your lease document has been verified by our AI agent and approved.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="self-start gap-1.5 text-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                Upload a different document
              </Button>
            </div>
          ) : leaseDoc.status === "rejected" ? (
            /* Rejected state */
            <div className="flex flex-col gap-4 rounded-lg border border-red-200 bg-red-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{leaseDoc.fileName}</p>
                  <p className="text-xs text-red-700">Document verification failed</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-red-100/60 px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <p className="text-xs text-red-700">The document could not be verified automatically. It may be unclear, expired, or not a valid lease document.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="gap-1.5 text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                  Try a different document
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleRequestSupport}
                  className="gap-1.5 bg-primary text-xs text-primary-foreground hover:bg-primary/90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                  Request Staff Support
                </Button>
              </div>
            </div>
          ) : leaseDoc.status === "support-requested" ? (
            /* Support requested state */
            <div className="flex flex-col gap-4 rounded-lg border border-blue-200 bg-blue-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{leaseDoc.fileName}</p>
                  <p className="text-xs text-blue-700">Staff support requested</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-blue-100/60 px-3 py-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-blue-600"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                <p className="text-xs text-blue-700">Your request has been sent to a DMV staff member for manual review. You will be notified once the review is complete.</p>
              </div>
              <div className="rounded-md bg-blue-100/40 px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-800">What happens next?</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-blue-700">A staff member will review your document within 1-2 business days. You can check the status of your request on this page.</p>
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="self-start gap-1.5 text-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
                Upload a different document instead
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Info box */}
      <div className="rounded-lg border border-border bg-muted/30 p-5">
        <h4 className="text-sm font-bold text-foreground">Accepted Documents</h4>
        <ul className="mt-2 flex flex-col gap-1.5">
          {[
            "Current signed lease agreement",
            "Utility bill (within last 60 days)",
            "Bank statement showing DC address",
            "Government-issued document with DC address",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-primary"><polyline points="20 6 9 17 4 12" /></svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
