"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const STAFF_ACTIVITY_KEY = "dmv_staff_activity"

interface StaffActivity {
  id: string
  staffId: string
  staffName: string
  action: "approved" | "rejected" | "note_added"
  verificationId: string
  documentType: string
  userName?: string
  timestamp: string
  notes?: string
}

export default function ActivityPage() {
  const { user } = useAuth()
  const [activities, setActivities] = useState<StaffActivity[]>([])
  const [filter, setFilter] = useState<"all" | "approved" | "rejected">("all")

  useEffect(() => {
    loadActivities()
  }, [])

  const loadActivities = () => {
    try {
      const activitiesRaw = localStorage.getItem(STAFF_ACTIVITY_KEY)
      if (activitiesRaw) {
        setActivities(JSON.parse(activitiesRaw))
      }
    } catch {
      // ignore
    }
  }

  const myActivities = activities
    .filter((a) => a.staffId === user?.id)
    .filter((a) => filter === "all" || a.action === filter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const todayCount = myActivities.filter((a) => 
    new Date(a.timestamp).toDateString() === new Date().toDateString()
  ).length

  const approvedCount = activities.filter((a) => a.staffId === user?.id && a.action === "approved").length
  const rejectedCount = activities.filter((a) => a.staffId === user?.id && a.action === "rejected").length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">My Activity</h1>
        <p className="text-sm text-muted-foreground">
          Track your review history and performance
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{myActivities.length}</p>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{todayCount}</p>
              <p className="text-sm text-muted-foreground">Today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{approvedCount}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
            <div>
              <p className="text-2xl font-bold">{rejectedCount}</p>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
              className={filter === "approved" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Approved
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("rejected")}
              className={filter === "rejected" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              Rejected
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Review History</CardTitle>
          <CardDescription>
            {myActivities.length} activit{myActivities.length !== 1 ? "ies" : "y"} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {myActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <p className="mt-4 text-sm font-medium text-muted-foreground">No activity yet</p>
              <p className="mt-1 text-xs text-muted-foreground">Start reviewing documents to see your activity here</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {myActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-center gap-4 rounded-lg border p-4 ${
                    activity.action === "approved" ? "border-green-200 bg-green-50" :
                    activity.action === "rejected" ? "border-red-200 bg-red-50" :
                    "border-border"
                  }`}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    activity.action === "approved" ? "bg-green-100" :
                    activity.action === "rejected" ? "bg-red-100" :
                    "bg-blue-100"
                  }`}>
                    {activity.action === "approved" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : activity.action === "rejected" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium capitalize">{activity.action}</p>
                      <Badge variant="secondary" className="text-[10px]">{activity.documentType}</Badge>
                    </div>
                    {activity.userName && (
                      <p className="text-xs text-muted-foreground">Resident: {activity.userName}</p>
                    )}
                    {activity.notes && (
                      <p className="text-xs text-muted-foreground mt-1">Note: {activity.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
