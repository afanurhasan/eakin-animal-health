"use client"

import * as React from "react"
import { OfficerSidebar } from "@/components/officer/officer-sidebar"
import { OfficerHeader } from "@/components/officer/officer-header"

export default function OfficerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  return (
    <div className="flex min-h-svh w-full bg-muted/20">
      {/* Officer Sidebar Navigation */}
      <OfficerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <OfficerHeader onOpenSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
