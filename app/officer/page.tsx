"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAppState } from "@/lib/store"

export default function OfficerRootRedirect() {
  const router = useRouter()
  const { currentOfficer } = useAppState()

  React.useEffect(() => {
    if (currentOfficer) {
      router.replace("/officer/dashboard")
    } else {
      router.replace("/officer/login")
    }
  }, [currentOfficer, router])

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40">
      <div className="text-center text-sm text-muted-foreground">
        Redirecting to Officer Portal...
      </div>
    </div>
  )
}
