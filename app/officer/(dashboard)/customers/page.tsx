"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  Eye,
  Store,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Building2,
  Users,
  ShoppingCart,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import { type CustomerItem } from "@/lib/mock-data"

export default function OfficerCustomersPage() {
  const { currentOfficer, customers } = useAppState()
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter customers strictly to logged-in officer
  const officerCustomers = React.useMemo(() => {
    if (!currentOfficer) return []
    return customers.filter((c) => c.officerId === currentOfficer.id)
  }, [customers, currentOfficer])

  // Search filter
  const filteredCustomers = React.useMemo(() => {
    return officerCustomers.filter((cust) => {
      const q = searchQuery.toLowerCase().trim()
      if (!q) return true
      return (
        cust.name.toLowerCase().includes(q) ||
        cust.shopName.toLowerCase().includes(q) ||
        cust.code.toLowerCase().includes(q) ||
        cust.phone.toLowerCase().includes(q) ||
        (cust.email && cust.email.toLowerCase().includes(q)) ||
        cust.address.toLowerCase().includes(q)
      )
    })
  }, [officerCustomers, searchQuery])

  // Aggregate metrics
  const totalSpent = React.useMemo(() => {
    return officerCustomers.reduce((sum, c) => sum + (c.totalSpent || 0), 0)
  }, [officerCustomers])

  const totalOutstanding = React.useMemo(() => {
    return officerCustomers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0)
  }, [officerCustomers])

  if (!currentOfficer) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No active officer session.</p>
          <Link href="/officer/login" className="mt-2 inline-block text-xs font-medium text-primary underline">
            Go to Officer Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              My Customers
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {officerCustomers.length} Assigned
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Customer directory assigned to <strong className="text-foreground">{currentOfficer.name}</strong> ({currentOfficer.code}) in <strong className="text-foreground">{currentOfficer.areaName}</strong>.
          </p>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Assigned Customer Accounts</span>
              <Users className="size-4 text-primary" />
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-foreground">
              {officerCustomers.length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Customer Purchases</span>
              <ShoppingCart className="size-4 text-emerald-600" />
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-foreground">
              ৳ {totalSpent.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Outstanding Balance</span>
              <CreditCard className="size-4 text-amber-600" />
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-amber-600 dark:text-amber-400">
              ৳ {totalOutstanding.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customer name, shop, code, phone, address..."
                className="h-9 pl-8 text-xs"
              />
            </div>

            <div className="text-xs text-muted-foreground font-medium">
              Showing {filteredCustomers.length} of {officerCustomers.length} customers
            </div>
          </div>
        </CardHeader>

        {/* Customer Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-12 px-4 py-3 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Customer Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Shop & Proprietor
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Phone & Email
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Address
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Outstanding
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Orders
                  </th>
                  <th scope="col" className="w-28 px-4 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust, index) => (
                    <tr key={cust.id} className="transition-colors hover:bg-muted/30">
                      {/* SL */}
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>

                      {/* Customer Code */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/officer/customers/${cust.id}`}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Store className="size-3 text-primary" />
                          {cust.code}
                        </Link>
                      </td>

                      {/* Shop Name & Proprietor */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{cust.shopName}</div>
                        <div className="text-[11px] text-muted-foreground">Proprietor: {cust.name}</div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1 font-mono text-xs text-foreground">
                          <Phone className="size-3 text-muted-foreground shrink-0" />
                          <span>{cust.phone}</span>
                        </div>
                        {cust.email && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Mail className="size-3 text-muted-foreground shrink-0" />
                            <span>{cust.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Address */}
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{cust.address}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">{cust.areaName}</div>
                      </td>

                      {/* Outstanding Balance */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          ৳ {(cust.outstandingBalance || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Total Orders */}
                      <td className="px-4 py-3 text-center">
                        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                          {cust.totalOrders || 0}
                        </span>
                      </td>

                      {/* Actions (View Only) */}
                      <td className="px-4 py-3 text-right">
                        <Link href={`/officer/customers/${cust.id}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-primary hover:text-primary-foreground"
                          >
                            <Eye className="size-3" />
                            <span>View</span>
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-xs text-muted-foreground">
                      No customers found matching your search.
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
