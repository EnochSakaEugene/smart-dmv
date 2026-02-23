"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"

const DOC_STATUS_KEY = "dmv_document_status"

type UploadStatus = "idle" | "uploading" | "verifying" | "approved" | "error"

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
        setTimeout(() => {
          setLeaseDoc((prev) => ({
            ...prev,
            status: "approved",
          }))

          // Update status to verified
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
