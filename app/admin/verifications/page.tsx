"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

// Mock verification data
const mockVerifications = [
  { id: "VER-2024-001", user: "John Smith", email: "john.smith@email.com", type: "Lease Document", status: "pending", submittedAt: "2024-01-15T10:30:00", aiConfidence: 0.72 },
  { id: "VER-2024-002", user: "Maria Garcia", email: "maria.g@email.com", type: "Utility Bill", status: "approved", submittedAt: "2024-01-15T09:45:00", aiConfidence: 0.98 },
  { id: "VER-2024-003", user: "James Wilson", email: "j.wilson@email.com", type: "Lease Document", status: "pending", submittedAt: "2024-01-15T09:30:00", aiConfidence: 0.65 },
  { id: "VER-2024-004", user: "Sarah Johnson", email: "sarah.j@email.com", type: "Bank Statement", status: "rejected", submittedAt: "2024-01-15T09:15:00", aiConfidence: 0.23 },
  { id: "VER-2024-005", user: "Michael Brown", email: "m.brown@email.com", type: "Lease Document", status: "approved", submittedAt: "2024-01-15T09:00:00", aiConfidence: 0.95 },
  { id: "VER-2024-006", user: "Emily Davis", email: "emily.d@email.com", type: "Utility Bill", status: "approved", submittedAt: "2024-01-15T08:45:00", aiConfidence: 0.91 },
  { id: "VER-2024-007", user: "Robert Taylor", email: "r.taylor@email.com", type: "Lease Document", status: "pending", submittedAt: "2024-01-15T08:30:00", aiConfidence: 0.78 },
  { id: "VER-2024-008", user: "Lisa Anderson", email: "lisa.a@email.com", type: "Bank Statement", status: "approved", submittedAt: "2024-01-15T08:15:00", aiConfidence: 0.89 },
]

const statusFilters = ["all", "pending", "approved", "rejected"]

export default function VerificationsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredVerifications = mockVerifications.filter((v) => {
    const matchesSearch = 
      v.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const pendingCount = mockVerifications.filter(v => v.status === "pending").length
  const approvedCount = mockVerifications.filter(v => v.status === "approved").length
  const rejectedCount = mockVerifications.filter(v => v.status === "rejected").length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Verification Management</h1>
        <p className="text-sm text-muted-foreground">
          Review and manage document verification requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected Today</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              {statusFilters.map((status) => (
                <Badge
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  className={`cursor-pointer capitalize ${
                    statusFilter === status ? "bg-primary text-primary-foreground" : ""
                  }`}
                  onClick={() => setStatusFilter(status)}
                >
                  {status}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <Input
                  placeholder="Search by name, email, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification Requests</CardTitle>
          <CardDescription>
            {filteredVerifications.length} verification{filteredVerifications.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {filteredVerifications.map((verification) => (
              <div
                key={verification.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{verification.user}</span>
                    <Badge
                      variant="secondary"
                      className={
                        verification.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : verification.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                      }
                    >
                      {verification.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{verification.email}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{verification.id}</span>
                    <span>{verification.type}</span>
                    <span>{new Date(verification.submittedAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-muted-foreground">AI Confidence</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${
                            verification.aiConfidence >= 0.8
                              ? "bg-green-500"
                              : verification.aiConfidence >= 0.6
                                ? "bg-amber-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${verification.aiConfidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium">{Math.round(verification.aiConfidence * 100)}%</span>
                    </div>
                  </div>
                  {verification.status === "pending" && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50 hover:text-green-700">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                        Reject
                      </Button>
                    </div>
                  )}
                  <Button size="sm" variant="ghost">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
