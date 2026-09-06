"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  UserRound,
  UsersRound,
  UserCheck,
  MapPin,
  Phone,
  Mail,
  Building2,
  ArrowRight,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialSummary } from "@/components/admin/financial-summary"
import {
  initialRMs,
  initialAMs,
  initialOfficers,
  initialOfficerCustomers,
  getRMFinancialData,
  type RMItem,
} from "@/lib/mock-data"

export default function RegionalManagerDetailPage() {
  const params = useParams()
  const rmId = (params?.id as string) || "rm-1"

  // Find RM
  const rm: RMItem = React.useMemo(() => {
    return (
      initialRMs.find(
        (r) => r.id === rmId || r.code.toLowerCase() === rmId.toLowerCase()
      ) || initialRMs[0]
    )
  }, [rmId])

  // RM Financial Performance Data
  const financialData = React.useMemo(() => {
    return getRMFinancialData(rm.id)
  }, [rm.id])

  // AMs under this RM
  const amsUnderRM = React.useMemo(() => {
    return initialAMs.filter((am) => am.rmId === rm.id)
  }, [rm.id])

  // Officers under this RM
  const officersUnderRM = React.useMemo(() => {
    return initialOfficers.filter((off) => off.rmId === rm.id)
  }, [rm.id])

  // Customers under this RM's officers
  const totalCustomers = React.useMemo(() => {
    const officerIds = new Set(officersUnderRM.map((o) => o.id))
    return initialOfficerCustomers.filter((c) => officerIds.has(c.officerId)).length
  }, [officersUnderRM])

  return (
    <div className="space-y-3.5">
      {/* Back Navigation Bar */}
      <div>
        <Link
          href="/rms"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Regional Managers</span>
        </Link>
      </div>

      {/* RM Profile Overview Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardContent className="p-4 sm:p-4.5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* RM Details */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary sm:size-11">
                <UserRound className="size-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {rm.name}
                  </h1>
                  <span className="rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                    {rm.code}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" />
                    <span>Assigned Area: <strong className="text-foreground">{rm.areaName}</strong></span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{rm.phone}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="size-3 text-muted-foreground" />
                    <span>{rm.email}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-3.5 grid grid-cols-2 gap-2.5 border-t border-border/60 pt-3 sm:grid-cols-3">
            <div className="rounded border border-border/60 bg-muted/30 px-3 py-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                Area Managers (AM)
              </span>
              <p className="mt-0.5 text-base font-bold text-foreground">
                {amsUnderRM.length} <span className="text-xs font-normal text-muted-foreground">Managers</span>
              </p>
            </div>
            <div className="rounded border border-border/60 bg-muted/30 px-3 py-2">
              <span className="text-[11px] font-medium text-muted-foreground">
                Sales Officers
              </span>
              <p className="mt-0.5 text-base font-bold text-primary">
                {officersUnderRM.length} <span className="text-xs font-normal text-muted-foreground">Officers</span>
              </p>
            </div>
            <div className="col-span-2 rounded border border-border/60 bg-muted/30 px-3 py-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Assigned Customers
              </span>
              <p className="mt-0.5 text-base font-bold text-foreground">
                {totalCustomers} <span className="text-xs font-normal text-muted-foreground">Shops</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Performance Summary (6-Card Section) */}
      <FinancialSummary
        data={financialData}
        title={`Financial Performance Summary (${rm.name})`}
      />

      {/* Section 1: Area Managers Under this RM */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <UsersRound className="size-4 text-primary" />
            <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
              Area Managers under {rm.name} ({amsUnderRM.length})
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-14 px-3.5 py-2.5 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    AM Code
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    AM Name
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Assigned Area
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Phone
                  </th>
                  <th scope="col" className="w-24 px-3.5 py-2.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {amsUnderRM.length > 0 ? (
                  amsUnderRM.map((am, index) => (
                    <tr
                      key={am.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-3.5 py-2.5 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono font-semibold text-primary">
                        {am.code}
                      </td>
                      <td className="px-3.5 py-2.5 font-semibold text-foreground">
                        <Link
                          href={`/ams/${am.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {am.name}
                        </Link>
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground" />
                          {am.areaName}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {am.phone}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Link href={`/ams/${am.id}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-primary hover:text-primary-foreground"
                          >
                            <span>Details</span>
                            <ArrowRight className="size-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-xs text-muted-foreground"
                    >
                      No Area Managers assigned under this Regional Manager.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Sales Officers Under this RM */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-primary" />
            <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
              Sales Officers in this Region ({officersUnderRM.length})
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-14 px-3.5 py-2.5 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Officer Code
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Officer Name
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Assigned AM
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Assigned Area
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Phone
                  </th>
                  <th scope="col" className="w-24 px-3.5 py-2.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {officersUnderRM.length > 0 ? (
                  officersUnderRM.map((off, index) => (
                    <tr
                      key={off.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-3.5 py-2.5 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono font-semibold text-primary">
                        {off.code}
                      </td>
                      <td className="px-3.5 py-2.5 font-semibold text-foreground">
                        <Link
                          href={`/officers/${off.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {off.name}
                        </Link>
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground">
                        {off.amName}
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground" />
                          {off.areaName}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-muted-foreground">
                        {off.phone}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Link href={`/officers/${off.id}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-primary hover:text-primary-foreground"
                          >
                            <span>Details</span>
                            <ArrowRight className="size-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-xs text-muted-foreground"
                    >
                      No Sales Officers assigned in this region.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
