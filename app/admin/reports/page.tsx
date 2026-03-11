"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock report templates
const reportTemplates = [
  {
    id: "daily-summary",
    name: "Daily Summary Report",
    description: "Overview of daily verification activity and key metrics",
    frequency: "Daily",
    lastGenerated: "2024-01-15T06:00:00",
    format: "PDF",
  },
  {
    id: "weekly-analytics",
    name: "Weekly Analytics Report",
    description: "Detailed analytics including trends and performance insights",
    frequency: "Weekly",
    lastGenerated: "2024-01-14T00:00:00",
    format: "PDF",
  },
  {
    id: "monthly-compliance",
    name: "Monthly Compliance Report",
    description: "Compliance status, audit logs, and regulatory adherence",
    frequency: "Monthly",
    lastGenerated: "2024-01-01T00:00:00",
    format: "PDF",
  },
  {
    id: "user-activity",
    name: "User Activity Report",
    description: "User registration, login patterns, and engagement metrics",
    frequency: "On-demand",
    lastGenerated: "2024-01-10T14:30:00",
    format: "CSV",
  },
  {
    id: "verification-audit",
    name: "Verification Audit Trail",
    description: "Complete audit trail of all verification decisions",
    frequency: "On-demand",
    lastGenerated: "2024-01-12T09:15:00",
    format: "CSV",
  },
  {
    id: "system-health",
    name: "System Health Report",
    description: "Infrastructure performance, uptime, and error logs",
    frequency: "Daily",
    lastGenerated: "2024-01-15T06:00:00",
    format: "PDF",
  },
]

const recentReports = [
  { name: "Daily Summary Report", date: "2024-01-15", size: "2.4 MB", downloads: 5 },
  { name: "Weekly Analytics Report", date: "2024-01-14", size: "8.7 MB", downloads: 12 },
  { name: "User Activity Report", date: "2024-01-10", size: "1.2 MB", downloads: 3 },
  { name: "Verification Audit Trail", date: "2024-01-12", size: "4.5 MB", downloads: 7 },
]

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generate, schedule, and download operational reports
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium">Generate Report</p>
              <p className="text-xs text-muted-foreground">Create custom report</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium">Schedule Reports</p>
              <p className="text-xs text-muted-foreground">Set up automated delivery</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            </div>
            <div>
              <p className="text-sm font-medium">Download Archive</p>
              <p className="text-xs text-muted-foreground">Access past reports</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Templates</CardTitle>
          <CardDescription>Pre-configured report formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reportTemplates.map((report) => (
              <div
                key={report.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {report.format}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{report.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{report.frequency}</span>
                  <span>Last: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                </div>
                <Button size="sm" variant="outline" className="w-full gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Generate
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Reports</CardTitle>
          <CardDescription>Previously generated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {recentReports.map((report, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{report.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Generated on {new Date(report.date).toLocaleDateString()} • {report.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{report.downloads} downloads</span>
                  <Button size="sm" variant="ghost" className="gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Download
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
