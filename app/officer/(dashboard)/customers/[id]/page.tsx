"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Store,
  UserCheck,
  UserRound,
  UsersRound,
  MapPin,
  Phone,
  Mail,
  ShoppingCart,
  Building2,
  FileText,
  Clock,
  RotateCcw,
  Banknote,
  Receipt,
  Eye,
  X,
  Package,
  CheckCircle2,
  XCircle,
  Gift,
  Printer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialSummary } from "@/components/admin/financial-summary"
import { useAppState } from "@/lib/store"
import {
  type CustomerItem,
  type Order,
  type ProductReturnItem,
  type CollectionItem,
} from "@/lib/mock-data"

export default function OfficerCustomerDetailPage() {
  const params = useParams()
  const customerId = (params?.id as string) || "cust-1"

  const {
    currentOfficer,
    customers,
    orders,
    productReturns,
    collections,
  } = useAppState()

  // Modals
  const [selectedInvoice, setSelectedInvoice] = React.useState<Order | null>(null)
  const [selectedReturn, setSelectedReturn] = React.useState<ProductReturnItem | null>(null)
  const [selectedReceipt, setSelectedReceipt] = React.useState<CollectionItem | null>(null)

  // Find Customer
  const customer: CustomerItem | undefined = React.useMemo(() => {
    return customers.find(
      (c) => c.id === customerId || c.code.toLowerCase() === customerId.toLowerCase()
    )
  }, [customers, customerId])

  // Verify that customer belongs to current officer
  const isAssignedToOfficer = React.useMemo(() => {
    if (!customer || !currentOfficer) return false
    return customer.officerId === currentOfficer.id
  }, [customer, currentOfficer])

  // Customer Invoices / Orders
  const customerOrders: Order[] = React.useMemo(() => {
    if (!customer) return []
    return orders.filter((o) => o.customerId === customer.id)
  }, [orders, customer])

  // Customer Product Returns
  const customerReturns: ProductReturnItem[] = React.useMemo(() => {
    if (!customer) return []
    return productReturns.filter((r) => r.customerId === customer.id)
  }, [productReturns, customer])

  // Customer Collections / Payments
  const customerCollections: CollectionItem[] = React.useMemo(() => {
    if (!customer) return []
    return collections.filter((c) => c.customerId === customer.id)
  }, [collections, customer])

  // Customer Financial Performance Summary (Lifetime + This Month)
  const financialData = React.useMemo(() => {
    if (!customer) {
      return {
        lifetimeSales: 0,
        lifetimeCollected: 0,
        lifetimeOutstanding: 0,
        thisMonthSales: 0,
        thisMonthCollected: 0,
        thisMonthOutstanding: 0,
      }
    }
    const lifetimeSales = customer.totalSpent || 420000
    const lifetimeOutstanding = customer.outstandingBalance || 35000
    const lifetimeCollected = Math.max(0, lifetimeSales - lifetimeOutstanding)
    const thisMonthSales = 48500
    const thisMonthOutstanding = 12000
    const thisMonthCollected = Math.max(0, thisMonthSales - thisMonthOutstanding)

    return {
      lifetimeSales,
      lifetimeCollected,
      lifetimeOutstanding,
      thisMonthSales,
      thisMonthCollected,
      thisMonthOutstanding,
    }
  }, [customer])

  if (!customer) {
    return (
      <div className="space-y-4">
        <Link
          href="/officer/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to My Customers</span>
        </Link>
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">Customer not found.</p>
        </Card>
      </div>
    )
  }

  if (!isAssignedToOfficer) {
    return (
      <div className="space-y-4">
        <Link
          href="/officer/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to My Customers</span>
        </Link>
        <Card className="border-destructive/30 bg-destructive/5 p-8 text-center">
          <p className="text-sm font-semibold text-destructive">
            Access Restricted: This customer is not assigned to your territory.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Sales Officers can only access customers assigned to their territory.
          </p>
          <Link href="/officer/customers" className="mt-4 inline-block">
            <Button size="sm" variant="outline">
              Return to My Customers
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Back Navigation Bar */}
      <div>
        <Link
          href="/officer/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to My Customers</span>
        </Link>
      </div>

      {/* Customer Profile Overview Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardContent className="p-4 sm:p-4.5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Customer Details */}
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary sm:size-11">
                <Store className="size-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
                    {customer.shopName}
                  </h1>
                  <span className="rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                    {customer.code}
                  </span>
                </div>
                <p className="text-xs font-medium text-foreground">
                  Proprietor: <span className="font-semibold">{customer.name}</span>
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3 text-muted-foreground" />
                    <span>{customer.address}, <strong className="text-foreground">{customer.areaName}</strong></span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </span>
                  {customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="size-3 text-muted-foreground" />
                      <span>{customer.email}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Performance Summary (Lifetime & This Month 6-Card Grid) */}
      <FinancialSummary
        data={financialData}
        title={`Financial Performance Summary (${customer.shopName})`}
      />

      {/* Section 1: Assigned Sales Hierarchy */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="size-4 text-primary" />
            <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
              Assigned Field Hierarchy
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Area */}
            <div className="rounded border border-border/70 bg-muted/20 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <MapPin className="size-3 text-muted-foreground" />
                Assigned Area
              </span>
              <p className="text-xs font-semibold text-foreground">
                {customer.areaName}
              </p>
            </div>

            {/* 2. RM */}
            <div className="rounded border border-border/70 bg-muted/20 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <UserRound className="size-3 text-muted-foreground" />
                Regional Manager (RM)
              </span>
              <p className="text-xs font-semibold text-foreground">
                {customer.rmName}
              </p>
            </div>

            {/* 3. AM */}
            <div className="rounded border border-border/70 bg-muted/20 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <UsersRound className="size-3 text-muted-foreground" />
                Area Manager (AM)
              </span>
              <p className="text-xs font-semibold text-foreground">
                {customer.amName}
              </p>
            </div>

            {/* 4. Sales Officer */}
            <div className="rounded border border-primary/30 bg-primary/5 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                <UserCheck className="size-3 text-primary" />
                Assigned Sales Officer
              </span>
              <p className="text-xs font-semibold text-foreground">
                {customer.officerName}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Sales / Invoices Table */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-primary" />
              <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
                Sales / Invoices ({customerOrders.length})
              </CardTitle>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Total Invoiced: <strong className="font-mono text-foreground">৳ {customerOrders.reduce((sum, o) => sum + o.grandTotal, 0).toLocaleString()}</strong>
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-12 px-3.5 py-2.5 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Invoice ID
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Date & Time
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-center">
                    Total Items
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-right">
                    Grand Total
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-right">
                    Paid Amount
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-right">
                    Due Amount
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-center">
                    Status
                  </th>
                  <th scope="col" className="w-28 px-3.5 py-2.5 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customerOrders.length > 0 ? (
                  customerOrders.map((ord, index) => {
                    const paid = ord.paidAmount || 0
                    const returned = ord.returnedAmount || 0
                    const due = typeof ord.dueAmount === "number" ? ord.dueAmount : Math.max(0, ord.grandTotal - returned - paid)

                    return (
                      <tr key={ord.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-3.5 py-2.5 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-3.5 py-2.5 font-mono font-semibold text-primary">
                          {ord.code}
                        </td>
                        <td className="px-3.5 py-2.5 text-muted-foreground">
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <Clock className="size-3 text-muted-foreground" />
                            <span>{ord.date}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2.5 text-center font-medium text-foreground">
                          {ord.totalItems} units
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-semibold text-foreground">
                          ৳ {ord.grandTotal.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                          ৳ {paid.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                          ৳ {due.toLocaleString()}
                        </td>
                        <td className="px-3.5 py-2.5 text-center">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                              ord.status === "Approved"
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : ord.status === "Pending"
                                ? "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "border-destructive/20 bg-destructive/10 text-destructive"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setSelectedInvoice(ord)}
                            className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-primary hover:text-primary-foreground"
                          >
                            <FileText className="size-3" />
                            <span>Invoice</span>
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No invoices recorded for this customer yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Product Returns Table */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="size-4 text-purple-600" />
              <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
                Product Returns ({customerReturns.length})
              </CardTitle>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Total Return Value: <strong className="font-mono text-purple-600 font-semibold">৳{customerReturns.reduce((sum, r) => sum + r.totalReturnAmount, 0).toLocaleString()}</strong>
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-12 px-3.5 py-2.5 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Date & Time
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Restocked Depot
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-right">
                    Return Amount
                  </th>
                  <th scope="col" className="w-24 px-3.5 py-2.5 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customerReturns.length > 0 ? (
                  customerReturns.map((ret, index) => (
                    <tr key={ret.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-3.5 py-2.5 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground whitespace-nowrap">
                        {ret.date}
                      </td>
                      <td className="px-3.5 py-2.5 font-medium text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-muted-foreground" />
                          <span>{ret.depotName}</span>
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                        ৳{ret.totalReturnAmount.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedReturn(ret)}
                          className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-purple-600 hover:text-white"
                        >
                          <Eye className="size-3" />
                          <span>Slip</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No product returns recorded for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Collections Table */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="size-4 text-emerald-600" />
              <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
                Payment Collections ({customerCollections.length})
              </CardTitle>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Total Collected: <strong className="font-mono text-emerald-600 font-semibold">৳{customerCollections.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</strong>
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-12 px-3.5 py-2.5 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Date & Time
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 text-right">
                    Amount Collected
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Payment Method
                  </th>
                  <th scope="col" className="w-24 px-3.5 py-2.5 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customerCollections.length > 0 ? (
                  customerCollections.map((col, index) => (
                    <tr key={col.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-3.5 py-2.5 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground whitespace-nowrap">
                        {col.date}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ৳{col.amount.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground">
                        {col.paymentMethod || "Bank Transfer / Cash"}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedReceipt(col)}
                          className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-emerald-600 hover:text-white"
                        >
                          <Receipt className="size-3" />
                          <span>Receipt</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No collections recorded for this customer yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        >
          <div onClick={() => setSelectedInvoice(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-3xl rounded-lg border border-border bg-card shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-5 py-3">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  Order Invoice &mdash; {selectedInvoice.code}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="xs" onClick={() => window.print()} className="cursor-pointer gap-1 text-xs">
                  <Printer className="size-3.5" />
                  <span>Print</span>
                </Button>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => setSelectedInvoice(null)} className="cursor-pointer">
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-card text-card-foreground">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-40 items-center justify-center rounded-md border border-border/60 bg-white p-2 shadow-2xs dark:bg-white/95">
                    <Image src="/logo.jpeg" alt="Logo" width={150} height={40} className="h-9 w-auto object-contain" priority />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Eakin Animal Health Ltd.</h2>
                    <p className="text-[11px] text-muted-foreground">Quality Veterinary Medicines & Supplements</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-foreground">{selectedInvoice.code}</div>
                  <div className="text-[11px] text-muted-foreground">Date: {selectedInvoice.date}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 rounded border border-border p-3 text-xs">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Customer Details</div>
                  <div className="font-bold text-foreground">{selectedInvoice.shopName}</div>
                  <div>Proprietor: {selectedInvoice.customerName}</div>
                  <div className="text-muted-foreground">{selectedInvoice.phone}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Order Information</div>
                  <div>Officer: <strong>{selectedInvoice.officerName}</strong> ({selectedInvoice.officerCode})</div>
                  <div>Depot: <strong>{selectedInvoice.depotName}</strong></div>
                  <div>Status: <span className="font-semibold">{selectedInvoice.status}</span></div>
                </div>
              </div>

              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 text-[10px] uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">SL</th>
                      <th className="px-3 py-2">Product Code</th>
                      <th className="px-3 py-2">Product Name</th>
                      <th className="px-3 py-2">Pack Size</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={it.id}>
                        <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                        <td className="px-3 py-2 font-mono text-primary">{it.productCode}</td>
                        <td className="px-3 py-2 font-medium text-foreground">{it.productName}</td>
                        <td className="px-3 py-2 text-muted-foreground">{it.packSize}</td>
                        <td className="px-3 py-2 text-center font-bold">{it.quantity}</td>
                        <td className="px-3 py-2 text-right font-mono">৳ {it.unitPrice.toLocaleString()}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold">৳ {it.totalPrice.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 rounded border border-border bg-muted/20 p-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-mono">৳ {selectedInvoice.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount ({selectedInvoice.discountPercent}%):</span>
                    <span className="font-mono text-primary">- ৳ {selectedInvoice.discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1 font-bold text-foreground">
                    <span>Grand Total:</span>
                    <span className="font-mono text-primary">৳ {selectedInvoice.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-border/80 bg-muted/20 px-5 py-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedInvoice(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Return Slip Modal */}
      {selectedReturn && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setSelectedReturn(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
                <RotateCcw className="size-4" />
                <span>Product Return Slip &mdash; {selectedReturn.code}</span>
              </div>
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => setSelectedReturn(null)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded border border-border p-2.5 bg-muted/20">
                <div>Customer: <strong>{selectedReturn.shopName}</strong></div>
                <div>Date: {selectedReturn.date}</div>
                <div>Depot: {selectedReturn.depotName}</div>
                <div>Reason: {selectedReturn.reason || "Customer Return"}</div>
              </div>
              <div className="rounded border border-border overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 text-[10px] uppercase font-semibold text-muted-foreground">
                    <tr>
                      <th className="px-3 py-1.5">Product</th>
                      <th className="px-3 py-1.5 text-center">Returned Qty</th>
                      <th className="px-3 py-1.5 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedReturn.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-1.5">{it.productName} ({it.packSize})</td>
                        <td className="px-3 py-1.5 text-center font-bold">{it.returnedQuantity} {it.unit}</td>
                        <td className="px-3 py-1.5 text-right font-mono font-bold">৳ {it.returnAmount.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border">
                <span>Total Return Value:</span>
                <span className="font-mono text-purple-600">৳ {selectedReturn.totalReturnAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReturn(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Collection Receipt Modal */}
      {selectedReceipt && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setSelectedReceipt(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative z-10 w-full max-w-lg rounded-lg border border-border bg-card shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                <Receipt className="size-4" />
                <span>Payment Receipt &mdash; {selectedReceipt.code}</span>
              </div>
              <Button type="button" variant="ghost" size="icon-xs" onClick={() => setSelectedReceipt(null)}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2 rounded border border-border p-2.5 bg-muted/20">
                <div>Customer: <strong>{selectedReceipt.shopName}</strong></div>
                <div>Date: {selectedReceipt.date}</div>
                <div>Method: {selectedReceipt.paymentMethod || "Bank Transfer"}</div>
                <div>Note: {selectedReceipt.note || "Payment collected"}</div>
              </div>
              <div className="rounded border border-border p-3 bg-emerald-500/5 flex items-center justify-between">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">Amount Received:</span>
                <span className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  ৳ {selectedReceipt.amount.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReceipt(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
