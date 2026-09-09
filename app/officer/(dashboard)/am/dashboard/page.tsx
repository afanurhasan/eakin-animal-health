"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  Printer,
  X,
  FileText,
  UserCheck,
  UsersRound,
  Building2,
  MapPin,
  Store,
  Phone,
  Gift,
  ArrowRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialSummary } from "@/components/admin/financial-summary"
import { useAppState } from "@/lib/store"
import { type Order } from "@/lib/mock-data"

export default function AMDashboardPage() {
  const {
    currentAM,
    officers,
    customers,
    orders,
  } = useAppState()

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = React.useState<Order | null>(null)

  const am = currentAM

  // Officers under this AM
  const amOfficers = React.useMemo(() => {
    if (!am) return []
    return officers.filter(
      (o) => o.amId === am.id || o.amName === am.name || o.areaId === am.areaId
    )
  }, [officers, am])

  // Customers in this AM's area
  const amCustomers = React.useMemo(() => {
    if (!am) return []
    return customers.filter(
      (c) =>
        c.amId === am.id ||
        c.amName === am.name ||
        c.areaName === am.areaName ||
        amOfficers.some((o) => o.id === c.officerId)
    )
  }, [customers, am, amOfficers])

  // Orders in this AM's area (fall back to all orders if mock data is localized)
  const amOrders = React.useMemo(() => {
    if (!am) return []
    const filtered = orders.filter(
      (o) =>
        amOfficers.some((off) => off.id === o.officerId || off.code === o.officerCode) ||
        amCustomers.some((cust) => cust.id === o.customerId)
    )
    return filtered.length > 0 ? filtered : orders
  }, [orders, am, amOfficers, amCustomers])

  // Orders Breakdown & Sales Metrics
  const orderStats = React.useMemo(() => {
    const totalCount = amOrders.length
    const pendingOrders = amOrders.filter((o) => o.status === "Pending")
    const approvedOrders = amOrders.filter((o) => o.status === "Approved")
    const cancelledOrders = amOrders.filter((o) => o.status === "Cancelled")

    const approvedSales = approvedOrders.reduce((sum, o) => sum + o.grandTotal, 0)
    const pendingSales = pendingOrders.reduce((sum, o) => sum + o.grandTotal, 0)
    const totalSales = approvedSales

    return {
      totalCount,
      pendingCount: pendingOrders.length,
      approvedCount: approvedOrders.length,
      cancelledCount: cancelledOrders.length,
      approvedSales,
      pendingSales,
      totalSales,
    }
  }, [amOrders])

  // Financial Metrics for Area Dashboard
  const financialData = React.useMemo(() => {
    const lifetimeSales = Math.max(orderStats.approvedSales * 1.3, 750000)
    const lifetimeCollected = Math.round(lifetimeSales * 0.88)
    const lifetimeOutstanding = lifetimeSales - lifetimeCollected

    const thisMonthSales = orderStats.approvedSales > 0 ? orderStats.approvedSales : 285000
    const thisMonthCollected = Math.round(thisMonthSales * 0.84)
    const thisMonthOutstanding = thisMonthSales - thisMonthCollected

    return {
      lifetimeSales,
      lifetimeCollected,
      lifetimeOutstanding,
      thisMonthSales,
      thisMonthCollected,
      thisMonthOutstanding,
    }
  }, [orderStats])

  if (!am) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No Area Manager session found.</p>
          <Link href="/officer/login" className="mt-2 inline-block text-xs font-medium text-primary underline">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Welcome back, {am.name}
            </h2>
            <span className="rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
              {am.code} &bull; Area Manager
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Supervising Area: <strong className="text-foreground">{am.areaName}</strong> &bull; Regional Manager: <strong className="text-foreground">{am.rmName}</strong> &bull; Reporting Officers: <strong className="text-foreground">{amOfficers.length}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/officers">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer gap-1.5 font-medium shadow-xs"
            >
              <UserCheck className="size-4 text-primary" />
              <span>Sales Officers</span>
            </Button>
          </Link>
          <Link href="/orders">
            <Button
              type="button"
              size="sm"
              className="cursor-pointer gap-1.5 bg-primary text-primary-foreground font-medium shadow-xs hover:bg-primary/90"
            >
              <ShoppingCart className="size-4" />
              <span>Area Orders</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Core Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* 1. Supervised Officers */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Reporting Sales Officers
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <UserCheck className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-foreground">
                {amOfficers.length}
              </span>
              <Link
                href="/officers"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                View all &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 2. Area Customers */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Area Customers
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Users className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-foreground">
                {amCustomers.length}
              </span>
              <Link
                href="/customers"
                className="text-[11px] font-medium text-primary hover:underline"
              >
                View all &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* 3. Total Area Orders */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Area Orders
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ShoppingCart className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-foreground">
                {orderStats.totalCount}
              </span>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="rounded-full bg-amber-500/10 px-1.5 py-0.5 font-semibold text-amber-600 dark:text-amber-400">
                  {orderStats.pendingCount} Pending
                </span>
                <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  {orderStats.approvedCount} Appr.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Area Sales Volume */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Area Sales Volume
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-mono text-xl font-bold text-foreground">
                ৳ {orderStats.approvedSales.toLocaleString()}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                ({orderStats.approvedCount} orders)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Hierarchy Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <UsersRound className="size-4 text-primary" />
            <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
              Area Jurisdiction & Chain of Command
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Assigned Area */}
            <div className="rounded border border-border/70 bg-muted/20 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <MapPin className="size-3 text-muted-foreground" />
                Assigned Territory Area
              </span>
              <p className="text-xs font-semibold text-foreground">
                {am.areaName}
              </p>
            </div>

            {/* 2. Regional Manager (RM) */}
            <div className="rounded border border-border/70 bg-muted/20 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <UsersRound className="size-3 text-muted-foreground" />
                Supervising RM
              </span>
              <p className="text-xs font-semibold text-foreground">
                {am.rmName}
              </p>
            </div>

            {/* 3. Reporting Officers */}
            <div className="rounded border border-border/70 bg-muted/20 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <UserCheck className="size-3 text-muted-foreground" />
                Supervised Sales Officers
              </span>
              <p className="text-xs font-semibold text-foreground">
                {amOfficers.length} Officers Reporting
              </p>
            </div>

            {/* 4. Contact */}
            <div className="rounded border border-primary/30 bg-primary/5 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                <Phone className="size-3 text-primary" />
                AM Official Contact
              </span>
              <p className="text-xs font-semibold text-foreground font-mono">
                {am.phone}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Performance Summary */}
      <FinancialSummary
        data={financialData}
        title={`Area Financial Summary &mdash; ${am.name} (${am.areaName})`}
      />

      {/* Recent Area Orders Table */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-primary" />
              <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
                Recent Area Orders ({amOrders.length})
              </CardTitle>
            </div>
            <Link
              href="/orders"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all orders &rarr;
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-12 px-4 py-3 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Invoice ID
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Customer & Shop
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Sales Officer
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Total Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Status
                  </th>
                  <th scope="col" className="w-28 px-4 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {amOrders.length > 0 ? (
                  amOrders.slice(0, 5).map((order, index) => {
                    const isPending = order.status === "Pending"
                    const isApproved = order.status === "Approved"
                    const isCancelled = order.status === "Cancelled"

                    return (
                      <tr key={order.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                          >
                            <FileText className="size-3 text-primary" />
                            {order.code}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-[11px]">
                          {order.date}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{order.customerName}</div>
                          <div className="text-[11px] text-muted-foreground">{order.shopName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{order.officerName}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{order.officerCode}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-mono font-bold text-foreground">
                            ৳ {order.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {order.discountPercent > 0 && (
                            <div className="text-[10px] text-primary font-medium">
                              ({order.discountPercent}% disc)
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                              <Clock className="size-3" />
                              Pending
                            </span>
                          )}
                          {isApproved && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                              <CheckCircle2 className="size-3" />
                              Approved
                            </span>
                          )}
                          {isCancelled && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2.5 py-0.5 text-[10px] font-semibold text-destructive">
                              <XCircle className="size-3" />
                              Cancelled
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="cursor-pointer gap-1 text-[11px] font-medium"
                          >
                            <Receipt className="size-3 text-muted-foreground" />
                            <span>Invoice</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No orders found in this area.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      {selectedInvoiceOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invoice-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={() => setSelectedInvoiceOrder(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-3xl rounded-lg border border-border bg-card shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header / Toolbar */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-5 py-3">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <h3 id="invoice-modal-title" className="text-sm font-semibold text-foreground">
                  Order Invoice &mdash; {selectedInvoiceOrder.code}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => window.print()}
                  className="cursor-pointer gap-1 text-xs"
                >
                  <Printer className="size-3.5" />
                  <span>Print</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            {/* Printable Sheet */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-card text-card-foreground">
              {/* Brand Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-44 items-center justify-center rounded-md border border-border/60 bg-white p-2 shadow-2xs dark:bg-white/95">
                    <Image
                      src="/logo.jpeg"
                      alt="Eakin Animal Health Logo"
                      width={160}
                      height={45}
                      className="h-10 w-auto object-contain"
                      priority
                    />
                  </div>
                  <div>
                    <h1 className="text-base font-bold tracking-tight text-foreground">
                      Eakin Animal Health Ltd.
                    </h1>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="inline-block rounded border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-mono font-bold text-primary">
                    INVOICE
                  </div>
                  <div className="mt-1 font-mono text-xs font-bold text-foreground">
                    {selectedInvoiceOrder.code}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Date: {selectedInvoiceOrder.date}
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-muted-foreground">Order Status:</span>
                  {selectedInvoiceOrder.status === "Pending" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 font-semibold text-[11px]">
                      <Clock className="size-3" /> Pending Admin Review
                    </span>
                  )}
                  {selectedInvoiceOrder.status === "Approved" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary px-2.5 py-0.5 font-semibold text-[11px]">
                      <CheckCircle2 className="size-3" /> Approved & Dispatched
                    </span>
                  )}
                  {selectedInvoiceOrder.status === "Cancelled" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/20 text-destructive px-2.5 py-0.5 font-semibold text-[11px]">
                      <XCircle className="size-3" /> Cancelled
                    </span>
                  )}
                </div>

                {selectedInvoiceOrder.approvedAt && (
                  <div className="text-[11px] text-muted-foreground">
                    Approved On: <span className="font-medium text-foreground">{selectedInvoiceOrder.approvedAt}</span>
                  </div>
                )}
              </div>

              {/* Customer Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border border-border/80 bg-card p-4 text-xs">
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Customer Information
                  </div>
                  <div className="text-sm font-bold text-foreground">
                    {selectedInvoiceOrder.shopName}
                  </div>
                  <div className="font-medium text-foreground">
                    Proprietor: {selectedInvoiceOrder.customerName}
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                    <Store className="size-3 text-muted-foreground" />
                    <span>Customer Code: {selectedInvoiceOrder.customerCode}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{selectedInvoiceOrder.phone}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-muted-foreground text-[11px]">
                    <MapPin className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                    <span>{selectedInvoiceOrder.address}</span>
                  </div>
                </div>

                <div className="space-y-1.5 sm:pl-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Representative & Fulfillment
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Sales Officer: </span>
                    <span className="font-semibold text-foreground">{selectedInvoiceOrder.officerName}</span>
                    <span className="ml-1 font-mono text-[10px] text-muted-foreground">({selectedInvoiceOrder.officerCode})</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Assigned Depot: </span>
                    <span className="font-semibold text-foreground">{selectedInvoiceOrder.depotName}</span>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground">Purchased Products</div>
                <div className="overflow-x-auto rounded border border-border">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase">
                      <tr>
                        <th scope="col" className="w-10 px-3 py-2 text-center">SL</th>
                        <th scope="col" className="px-3 py-2">Product Code</th>
                        <th scope="col" className="px-3 py-2">Product Name</th>
                        <th scope="col" className="px-3 py-2">Pack Size</th>
                        <th scope="col" className="px-3 py-2 text-center">Quantity</th>
                        <th scope="col" className="px-3 py-2 text-right">Unit Price (৳)</th>
                        <th scope="col" className="px-3 py-2 text-right">Total (৳)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedInvoiceOrder.items.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 text-center font-medium text-muted-foreground">{idx + 1}</td>
                          <td className="px-3 py-2 font-mono text-[11px] font-medium text-primary">{item.productCode}</td>
                          <td className="px-3 py-2 font-semibold text-foreground">{item.productName}</td>
                          <td className="px-3 py-2 text-muted-foreground">{item.packSize}</td>
                          <td className="px-3 py-2 text-center font-mono font-bold text-foreground">{item.quantity}</td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground">৳ {item.unitPrice.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-foreground">৳ {item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bonus Items if any */}
              {selectedInvoiceOrder.bonusItems && selectedInvoiceOrder.bonusItems.length > 0 && (
                <div className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Gift className="size-3.5" />
                    <span>Bonus Products Assigned (Admin Approved)</span>
                  </div>
                  <div className="overflow-x-auto rounded border border-primary/20 bg-card">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-primary/10 bg-primary/10 text-[10px] font-semibold text-primary uppercase">
                        <tr>
                          <th scope="col" className="w-10 px-3 py-2 text-center">SL</th>
                          <th scope="col" className="px-3 py-2">Product Code</th>
                          <th scope="col" className="px-3 py-2">Bonus Product</th>
                          <th scope="col" className="px-3 py-2">Pack Size</th>
                          <th scope="col" className="px-3 py-2 text-right">Bonus Qty</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {selectedInvoiceOrder.bonusItems.map((bonus, bIdx) => (
                          <tr key={bonus.id}>
                            <td className="px-3 py-1.5 text-center text-muted-foreground font-mono">{bIdx + 1}</td>
                            <td className="px-3 py-1.5 font-mono text-primary font-medium">{bonus.productCode}</td>
                            <td className="px-3 py-1.5 font-semibold text-foreground">{bonus.productName}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{bonus.packSize}</td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold text-primary">+{bonus.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Financial Box */}
              <div className="flex justify-end pt-2">
                <div className="w-full max-w-xs space-y-2 rounded-md border border-border bg-muted/20 p-3.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold text-foreground">
                      ৳ {selectedInvoiceOrder.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Officer Discount ({selectedInvoiceOrder.officerDiscountPercent ?? 2.5}%):</span>
                    <span className="font-mono font-semibold text-primary">
                      - ৳ {((selectedInvoiceOrder.subtotal * (selectedInvoiceOrder.officerDiscountPercent ?? 2.5)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {selectedInvoiceOrder.adminDiscountPercent !== undefined && selectedInvoiceOrder.adminDiscountPercent > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Admin Addl. Discount ({selectedInvoiceOrder.adminDiscountPercent}%):</span>
                      <span className="font-mono font-semibold text-primary">
                        - ৳ {((selectedInvoiceOrder.subtotal * selectedInvoiceOrder.adminDiscountPercent) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="border-t border-border pt-2 flex items-center justify-between font-bold text-sm text-foreground">
                    <span>Grand Total:</span>
                    <span className="font-mono text-base text-primary">
                      ৳ {selectedInvoiceOrder.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="border-t border-border pt-4 text-center text-[10px] text-muted-foreground">
                Thank you for choosing Eakin Animal Health Ltd. | System Generated Invoice
              </div>
            </div>

            {/* Modal Bottom */}
            <div className="flex items-center justify-end border-t border-border/80 bg-muted/20 px-5 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoiceOrder(null)}
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
