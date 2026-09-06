"use client"

import * as React from "react"
import Link from "next/link"
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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FinancialSummary } from "@/components/admin/financial-summary"
import {
  initialCustomers,
  initialOrders,
  initialProductReturns,
  initialCollections,
  type CustomerItem,
  type Order,
  type ProductReturnItem,
  type CollectionItem,
} from "@/lib/mock-data"

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = (params?.id as string) || "cust-1"

  // Modals
  const [selectedInvoice, setSelectedInvoice] = React.useState<Order | null>(null)
  const [selectedReturn, setSelectedReturn] = React.useState<ProductReturnItem | null>(null)
  const [selectedReceipt, setSelectedReceipt] = React.useState<CollectionItem | null>(null)

  // Find Customer
  const customer: CustomerItem = React.useMemo(() => {
    return (
      initialCustomers.find(
        (c) => c.id === customerId || c.code.toLowerCase() === customerId.toLowerCase()
      ) || initialCustomers[0]
    )
  }, [customerId])

  // Customer Invoices / Orders
  const customerOrders: Order[] = React.useMemo(() => {
    return initialOrders.filter((o) => o.customerId === customer.id)
  }, [customer.id])

  // Customer Product Returns
  const customerReturns: ProductReturnItem[] = React.useMemo(() => {
    return initialProductReturns.filter((r) => r.customerId === customer.id)
  }, [customer.id])

  // Customer Collections / Payments
  const customerCollections: CollectionItem[] = React.useMemo(() => {
    return initialCollections.filter((c) => c.customerId === customer.id)
  }, [customer.id])

  // Customer Financial Performance Summary (Lifetime + This Month)
  const financialData = React.useMemo(() => {
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
  }, [customer.totalSpent, customer.outstandingBalance])

  return (
    <div className="space-y-4">
      {/* Back Navigation Bar */}
      <div>
        <Link
          href="/customers"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Customers</span>
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
                <Link
                  href={`/rms/${customer.rmId}`}
                  className="transition-colors hover:text-primary hover:underline"
                >
                  {customer.rmName}
                </Link>
              </p>
            </div>

            {/* 3. AM */}
            <div className="rounded border border-border/70 bg-muted/20 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                <UsersRound className="size-3 text-muted-foreground" />
                Area Manager (AM)
              </span>
              <p className="text-xs font-semibold text-foreground">
                <Link
                  href={`/ams/${customer.amId}`}
                  className="transition-colors hover:text-primary hover:underline"
                >
                  {customer.amName}
                </Link>
              </p>
            </div>

            {/* 4. Sales Officer */}
            <div className="rounded border border-primary/30 bg-primary/5 px-3 py-2 space-y-0.5">
              <span className="flex items-center gap-1 text-[11px] font-medium text-primary">
                <UserCheck className="size-3 text-primary" />
                Assigned Sales Officer
              </span>
              <p className="text-xs font-semibold text-foreground">
                <Link
                  href={`/officers/${customer.officerId}`}
                  className="text-primary transition-colors hover:underline"
                >
                  {customer.officerName}
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Section 2: Sales / Invoices Table                         */}
      {/* ========================================================= */}
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
                      <tr
                        key={ord.id}
                        className="transition-colors hover:bg-muted/30"
                      >
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
                            <span>View Invoice</span>
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

      {/* ========================================================= */}
      {/* Section 3: Product Returns Table                          */}
      {/* ========================================================= */}
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
                    <tr
                      key={ret.id}
                      className="transition-colors hover:bg-muted/30"
                    >
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

      {/* ========================================================= */}
      {/* Section 4: Collections Table                              */}
      {/* ========================================================= */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="size-4 text-emerald-600" />
              <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
                Collections ({customerCollections.length})
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
                    Applied Invoices (FIFO)
                  </th>
                  <th scope="col" className="w-24 px-3.5 py-2.5 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {customerCollections.length > 0 ? (
                  customerCollections.map((col, index) => (
                    <tr
                      key={col.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-3.5 py-2.5 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-3.5 py-2.5 text-muted-foreground whitespace-nowrap">
                        {col.date}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        ৳{col.amount.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {col.allocations?.map((alloc) => (
                            <span
                              key={alloc.orderId}
                              className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-foreground border border-border/80 font-mono"
                            >
                              <FileText className="size-3 text-muted-foreground" />
                              {alloc.orderCode}:{" "}
                              <span className="font-bold text-emerald-600">
                                ৳{alloc.allocatedAmount.toLocaleString()}
                              </span>
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedReceipt(col)}
                          className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-emerald-600 hover:text-white"
                        >
                          <Eye className="size-3" />
                          <span>Receipt</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No collections recorded for this customer.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 1. INVOICE DETAILS MODAL                                  */}
      {/* ========================================================= */}
      {selectedInvoice && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setSelectedInvoice(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-lg rounded-md border border-border bg-card p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                <h3 className="text-base font-semibold text-foreground">
                  Invoice Details &mdash; {selectedInvoice.code}
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedInvoice(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-3 space-y-3 text-xs overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-2 rounded border border-border/70 bg-muted/20 p-2.5">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Customer / Shop</span>
                  <span className="font-semibold text-foreground">{customer.shopName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Proprietor</span>
                  <span className="font-medium text-foreground">{customer.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Date & Time</span>
                  <span className="text-muted-foreground font-mono">{selectedInvoice.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Order Status</span>
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                      selectedInvoice.status === "Approved"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : selectedInvoice.status === "Pending"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-foreground">
                  Order Items Breakdown ({selectedInvoice.items?.length} Products)
                </span>
                <div className="rounded border border-border/60 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-2.5 py-1.5">Product</th>
                        <th className="px-2.5 py-1.5">Pack</th>
                        <th className="px-2.5 py-1.5 text-center">Qty</th>
                        <th className="px-2.5 py-1.5 text-right">Price</th>
                        <th className="px-2.5 py-1.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedInvoice.items?.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="px-2.5 py-2 font-medium text-foreground">{item.productName}</td>
                          <td className="px-2.5 py-2 text-muted-foreground font-mono text-[11px]">{item.packSize}</td>
                          <td className="px-2.5 py-2 text-center font-mono font-semibold">{item.quantity}</td>
                          <td className="px-2.5 py-2 text-right font-mono text-muted-foreground">৳{item.unitPrice}</td>
                          <td className="px-2.5 py-2 text-right font-mono font-semibold text-foreground">
                            ৳{item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals */}
              <div className="rounded border border-border/60 bg-muted/10 p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono">৳ {selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                {selectedInvoice.discountAmount > 0 && (
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Discount ({selectedInvoice.discountPercent}%):</span>
                    <span className="font-mono">- ৳ {selectedInvoice.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground border-t border-border/60 pt-1.5">
                  <span>Grand Total:</span>
                  <span className="font-mono text-primary text-sm">৳ {selectedInvoice.grandTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold pt-0.5">
                  <span>Paid Amount:</span>
                  <span className="font-mono">৳ {(selectedInvoice.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>Remaining Due:</span>
                  <span className="font-mono">
                    ৳ {(selectedInvoice.dueAmount ?? Math.max(0, selectedInvoice.grandTotal - (selectedInvoice.paidAmount || 0))).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PRODUCT RETURN SLIP MODAL                              */}
      {/* ========================================================= */}
      {selectedReturn && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setSelectedReturn(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-lg rounded-md border border-border bg-card p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="size-4 text-purple-600" />
                <h3 className="text-base font-semibold text-foreground">
                  Product Return Slip &mdash; {selectedReturn.code}
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedReturn(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-3 space-y-3 text-xs overflow-y-auto flex-1 pr-1">
              <div className="grid grid-cols-2 gap-2 rounded border border-border/70 bg-muted/20 p-2.5">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Returning Customer</span>
                  <span className="font-semibold text-foreground">{selectedReturn.shopName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Receiving Depot</span>
                  <span className="font-semibold text-foreground">{selectedReturn.depotName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Return Date & Time</span>
                  <span className="text-muted-foreground font-mono">{selectedReturn.date}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Recorded By</span>
                  <span className="text-muted-foreground">{selectedReturn.recordedBy}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-foreground">
                  Returned Products ({selectedReturn.items.length})
                </span>
                <div className="rounded border border-border/60 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-2.5 py-1.5">Product</th>
                        <th className="px-2.5 py-1.5">Pack</th>
                        <th className="px-2.5 py-1.5 text-center">Returned Qty</th>
                        <th className="px-2.5 py-1.5 text-right">Unit Price</th>
                        <th className="px-2.5 py-1.5 text-right">Return Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedReturn.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="px-2.5 py-2 font-medium text-foreground">{item.productName}</td>
                          <td className="px-2.5 py-2 text-muted-foreground font-mono text-[11px]">{item.packSize}</td>
                          <td className="px-2.5 py-2 text-center font-mono font-bold text-purple-600">
                            {item.returnedQuantity} {item.unit}s
                          </td>
                          <td className="px-2.5 py-2 text-right font-mono text-muted-foreground">৳{item.unitPrice}</td>
                          <td className="px-2.5 py-2 text-right font-mono font-bold text-foreground">
                            ৳{item.returnAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded border border-purple-500/20 bg-purple-500/5 p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-muted-foreground">Total Returned Quantity:</span>
                  <p className="font-mono font-bold text-foreground text-sm">{selectedReturn.totalReturnedQuantity} Units</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-muted-foreground">Total Return Credit:</span>
                  <p className="font-mono font-bold text-purple-600 text-base">৳ {selectedReturn.totalReturnAmount.toLocaleString()}</p>
                </div>
              </div>

              {selectedReturn.reason && (
                <div className="text-[11px] text-muted-foreground">
                  <strong>Notes / Reason:</strong> {selectedReturn.reason}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedReturn(null)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MONEY RECEIPT MODAL                                    */}
      {/* ========================================================= */}
      {selectedReceipt && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setSelectedReceipt(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-lg rounded-md border border-border bg-card p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-emerald-600" />
                <h3 className="text-base font-semibold text-foreground">
                  Money Receipt
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedReceipt(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="mt-3 space-y-3 text-xs overflow-y-auto flex-1 pr-1">
              {/* Header Box */}
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Amount Collected</span>
                  <div className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    ৳ {selectedReceipt.amount.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Collection Date</span>
                  <div className="font-mono font-semibold text-foreground">{selectedReceipt.date}</div>
                </div>
              </div>

              {/* Customer Box */}
              <div className="grid grid-cols-2 gap-2 rounded border border-border/70 bg-muted/20 p-2.5">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Customer / Shop</span>
                  <span className="font-semibold text-foreground">{selectedReceipt.shopName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Proprietor</span>
                  <span className="font-medium text-foreground">{selectedReceipt.customerName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Receipt No.</span>
                  <span className="font-mono font-semibold text-primary">{selectedReceipt.code}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase font-semibold">Recorded By</span>
                  <span className="text-muted-foreground">{selectedReceipt.recordedBy || "Admin (Finance)"}</span>
                </div>
              </div>

              {/* Invoices Settlement Breakdown */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-foreground">
                  Invoices Settled by this Collection ({selectedReceipt.allocations?.length || 0})
                </span>
                <div className="rounded border border-border/60 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold uppercase text-muted-foreground">
                      <tr>
                        <th className="px-2.5 py-1.5">Invoice ID</th>
                        <th className="px-2.5 py-1.5 text-right">Previous Due</th>
                        <th className="px-2.5 py-1.5 text-right">Allocated</th>
                        <th className="px-2.5 py-1.5 text-right">Remaining Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedReceipt.allocations?.map((al, idx) => (
                        <tr key={idx} className="hover:bg-muted/20">
                          <td className="px-2.5 py-2 font-mono font-semibold text-primary">{al.orderCode}</td>
                          <td className="px-2.5 py-2 text-right font-mono text-muted-foreground">৳{al.previousDue.toLocaleString()}</td>
                          <td className="px-2.5 py-2 text-right font-mono font-bold text-emerald-600">৳{al.allocatedAmount.toLocaleString()}</td>
                          <td className="px-2.5 py-2 text-right font-mono font-bold text-foreground">৳{al.remainingDue.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedReceipt.note && (
                <div className="text-[11px] text-muted-foreground">
                  <strong>Notes:</strong> {selectedReceipt.note}
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-end border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
                className="cursor-pointer text-xs"
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
