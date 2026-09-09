"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAppState } from "@/lib/store"

export default function OfficerRootRedirect() {
  const router = useRouter()
  const { currentRole } = useAppState()

  React.useEffect(() => {
    if (currentRole === "rm") {
      router.replace("/officer/rm/dashboard")
    } else if (currentRole === "am") {
      router.replace("/officer/am/dashboard")
    } else {
      router.replace("/officer/dashboard")
    }
  }, [currentRole, router])

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/40">
      <div className="text-center text-sm text-muted-foreground">
        Redirecting to Portal Dashboard...
      </div>
    </div>
  )
}
