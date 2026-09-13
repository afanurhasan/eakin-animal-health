"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Banknote,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Calendar,
  Building2,
  Store,
  User,
  FileText,
  Printer,
  X,
  AlertCircle,
  ArrowRight,
  Receipt,
  Layers,
  Clock,
  ChevronDown,
  Check,
  TrendingUp,
  ShoppingCart,
  UserCheck,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  initialCollections,
  initialOrders,
  initialCustomers,
  type CollectionItem,
  type InvoiceAllocation,
  type Order,
  type CustomerItem,
} from "@/lib/mock-data"
import { formatDate, parseDateToTimestamp } from "@/lib/utils"

export default function CollectionsPage() {
  const [collections, setCollections] = React.useState<CollectionItem[]>(initialCollections)
  const [orders, setOrders] = React.useState<Order[]>(initialOrders)
  const [customers, setCustomers] = React.useState<CustomerItem[]>(initialCustomers)

  // Filters (Search + Customer-wise)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCustomerFilter, setSelectedCustomerFilter] = React.useState("all")

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [selectedReceipt, setSelectedReceipt] = React.useState<CollectionItem | null>(null)

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Helper to get a customer's live current outstanding due across approved orders
  const getCustomerCurrentDue = React.useCallback(
    (customerId: string) => {
      return orders
        .filter((o) => o.customerId === customerId && o.status === "Approved")
        .reduce((sum, o) => {
          const paid = o.paidAmount || 0
          const returned = o.returnedAmount || 0
          const effectiveTotal = Math.max(0, o.grandTotal - returned)
          const due = typeof o.dueAmount === "number" ? o.dueAmount : Math.max(0, effectiveTotal - paid)
          return sum + due
        }, 0)
    },
    [orders]
  )

  // Form State for Add Collection (Search-Based Customer Workflow)
  const [formCustomerId, setFormCustomerId] = React.useState("")
  const [customerSearchQuery, setCustomerSearchQuery] = React.useState("")
  const [formAmount, setFormAmount] = React.useState("")
  const [formDate, setFormDate] = React.useState("2026-09-05")
  const [formError, setFormError] = React.useState("")

  // Reset form when modal opens
  const openAddModal = (prefillCustomerId?: string) => {
    setFormCustomerId(prefillCustomerId || "")
    setCustomerSearchQuery("")
    setFormAmount("")
    setFormDate("2026-09-05")
    setFormError("")
    setIsAddModalOpen(true)
  }

  // Selected customer object
  const selectedCustomer = React.useMemo(() => {
    return customers.find((c) => c.id === formCustomerId) || null
  }, [customers, formCustomerId])

  // Matching customers by search query (for Search-Based Customer selection)
  const matchingSearchCustomers = React.useMemo(() => {
    const q = customerSearchQuery.trim().toLowerCase()
    if (!q) return []
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shopName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
    )
  }, [customers, customerSearchQuery])

  // Handle selecting a customer from search
  const handleSelectCustomer = (cust: CustomerItem) => {
    setFormCustomerId(cust.id)
    setCustomerSearchQuery("")
    setFormAmount("")
    setFormError("")
  }

  // Handle resetting/changing selected customer
  const handleResetCustomer = () => {
    setFormCustomerId("")
    setCustomerSearchQuery("")
    setFormAmount("")
    setFormError("")
  }

  // Get customer's approved unpaid/partially-paid orders (sorted by date ascending for strict chronological FIFO)
  const customerUnpaidOrders = React.useMemo(() => {
    if (!formCustomerId) return []
    return orders
      .filter((o) => o.customerId === formCustomerId && o.status === "Approved")
      .map((o) => {
        const paid = o.paidAmount || 0
        const returned = o.returnedAmount || 0
        const effectiveTotal = Math.max(0, o.grandTotal - returned)
        const due = typeof o.dueAmount === "number" ? o.dueAmount : Math.max(0, effectiveTotal - paid)
        return {
          ...o,
          effectiveTotal,
          currentDue: due,
        }
      })
      .filter((o) => o.currentDue > 0)
      .sort((a, b) => {
        const timeA = parseDateToTimestamp(a.date)
        const timeB = parseDateToTimestamp(b.date)
        return timeA - timeB
      })
  }, [orders, formCustomerId])

  // Real-time FIFO Allocation computation (chronological earliest first)
  const liveAllocations = React.useMemo(() => {
    const enteredAmount = parseFloat(formAmount) || 0
    if (enteredAmount <= 0 || customerUnpaidOrders.length === 0) return []

    let remainingToAllocate = enteredAmount
    const allocationResult: Array<{
      order: (typeof customerUnpaidOrders)[0]
      allocated: number
      previousDue: number
      newRemainingDue: number
      isFullyPaid: boolean
    }> = []

    for (const order of customerUnpaidOrders) {
      if (remainingToAllocate <= 0) break

      const prevDue = order.currentDue
      const allocated = Math.min(remainingToAllocate, prevDue)
      const newRemainingDue = Math.max(0, prevDue - allocated)
      remainingToAllocate -= allocated

      allocationResult.push({
        order,
        allocated,
        previousDue: prevDue,
        newRemainingDue,
        isFullyPaid: newRemainingDue === 0,
      })
    }

    return allocationResult
  }, [formAmount, customerUnpaidOrders])

  // Handle Record Collection Submit
  const handleRecordCollection = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!formCustomerId) {
      setFormError("Please search and select a customer to record collection.")
      return
    }

    const numAmount = parseFloat(formAmount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Please enter a valid collection amount greater than ৳0.")
      return
    }

    if (!formDate) {
      setFormError("Please select a collection date.")
      return
    }

    if (customerUnpaidOrders.length === 0) {
      setFormError("This customer has no outstanding unpaid invoices.")
      return
    }

    // Perform strict chronological FIFO allocation against customer's unpaid orders (oldest first)
    let remainingToAllocate = numAmount
    const createdAllocations: InvoiceAllocation[] = []
    const updatedAllocationsMap = new Map<string, { newPaid: number; newDue: number }>()

    for (const order of customerUnpaidOrders) {
      if (remainingToAllocate <= 0) break

      const currentDue = order.currentDue
      const allocated = Math.min(remainingToAllocate, currentDue)
      const newPaid = (order.paidAmount || 0) + allocated
      const newDue = Math.max(0, currentDue - allocated)
      remainingToAllocate -= allocated

      updatedAllocationsMap.set(order.id, {
        newPaid,
        newDue,
      })

      createdAllocations.push({
        orderId: order.id,
        orderCode: order.code,
        orderDate: order.date,
        originalGrandTotal: order.grandTotal,
        previousDue: currentDue,
        allocatedAmount: allocated,
        remainingDue: newDue,
      })
    }

    // Apply the allocations to the orders state
    const updatedOrders = orders.map((order) => {
      if (updatedAllocationsMap.has(order.id)) {
        const alloc = updatedAllocationsMap.get(order.id)!
        return {
          ...order,
          paidAmount: alloc.newPaid,
          dueAmount: alloc.newDue,
          paymentStatus: (alloc.newDue === 0 ? "Paid" : "Partially Paid") as Order["paymentStatus"],
        }
      }
      return order
    })

    // Update customer outstanding balance
    const updatedCustomers = customers.map((c) => {
      if (c.id === formCustomerId) {
        const currentBal = c.outstandingBalance || 0
        return {
          ...c,
          outstandingBalance: Math.max(0, currentBal - numAmount),
        }
      }
      return c
    })

    // Generate new collection record
    const nextColNumber = collections.length + 1
    const newCollectionCode = `COL-2026-${String(nextColNumber).padStart(3, "0")}`

    const newCollectionItem: CollectionItem = {
      id: `col-${Date.now()}`,
      code: newCollectionCode,
      customerId: selectedCustomer?.id || formCustomerId,
      customerCode: selectedCustomer?.code || "CUST",
      customerName: selectedCustomer?.name || "Customer",
      shopName: selectedCustomer?.shopName || "Shop",
      date: `${formatDate(formDate)}, ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`,
      amount: numAmount,
      allocations: createdAllocations,
    }

    setOrders(updatedOrders)
    setCustomers(updatedCustomers)
    setCollections([newCollectionItem, ...collections])
    setIsAddModalOpen(false)
    showToast(`Payment of ৳${numAmount.toLocaleString()} recorded successfully for ${selectedCustomer?.name}.`)
  }

  // Filtered collections (Customer-wise + Search)
  const filteredCollections = React.useMemo(() => {
    return collections.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.code.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.shopName.toLowerCase().includes(q) ||
        item.customerCode.toLowerCase().includes(q) ||
        item.allocations.some((a) => a.orderCode.toLowerCase().includes(q))

      const matchCustomer =
        selectedCustomerFilter === "all" ||
        item.customerId === selectedCustomerFilter

      return matchSearch && matchCustomer
    })
  }, [collections, searchQuery, selectedCustomerFilter])

  // Aggregate Metrics: Total Sales, Total Collections, Total Due (Strictly Consistent: Total Due = Total Sales - Total Collections)
  const metrics = React.useMemo(() => {
    const totalSales = orders
      .filter((o) => o.status === "Approved")
      .reduce((sum, o) => sum + o.grandTotal, 0)
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0)
    const totalDue = Math.max(0, totalSales - totalCollected)
    return {
      totalSales,
      totalCollected,
      totalDue,
      totalTransactions: collections.length,
    }
  }, [orders, collections])

  // Lookup full customer details for receipt modal
  const receiptCustomer = React.useMemo(() => {
    if (!selectedReceipt) return null
    return customers.find((c) => c.id === selectedReceipt.customerId) || null
  }, [selectedReceipt, customers])

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Collections</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => openAddModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Record Collection
          </Button>
        </div>
      </div>

      {/* Summary Metric Cards (Total Sales, Total Collections, Total Due with compact height p-3.5) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Total Sales */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Sales
              </span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                ৳{metrics.totalSales.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                From approved & delivered sales orders
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Total Collections */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Collections
              </span>
              <div className="text-xl font-bold text-emerald-700 mt-0.5">
                ৳{metrics.totalCollected.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Across {metrics.totalTransactions} recorded collections
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Banknote className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        {/* Total Outstanding Due */}
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Outstanding Due
              </span>
              <div className="text-xl font-bold text-amber-700 mt-0.5">
                ৳{metrics.totalDue.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Remaining balance across approved sales
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar (Search + Customer-wise Filter) */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search customer, shop, order..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 text-sm focus:bg-white"
              />
            </div>

            {/* Customer Filter Dropdown */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCustomerFilter}
                onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Customers</option>
                {customers.map((cust) => (
                  <option key={cust.id} value={cust.id}>
                    {cust.name} — {cust.shopName} ({cust.code})
                  </option>
                ))}
              </select>

              {(searchQuery || selectedCustomerFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCustomerFilter("all")
                  }}
                  className="text-slate-500 hover:text-slate-700 text-xs shrink-0"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Collections Table (SL, Date & Time, Customer & Shop, Amount Collected, Applied Invoices FIFO, Action) */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">SL</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Customer & Shop</th>
                <th className="py-3.5 px-4 text-right">Amount Collected</th>
                <th className="py-3.5 px-4">Applied Invoices (FIFO)</th>
                <th className="py-3.5 px-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredCollections.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Banknote className="h-8 w-8 text-slate-300" />
                      <p className="font-medium text-slate-700">No collection records found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your search criteria or record a new collection.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCollections.map((col, index) => (
                  <tr key={col.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                      {col.date}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <Link
                          href={`/customers/${col.customerId}`}
                          className="font-medium text-slate-900 hover:text-emerald-600 hover:underline transition-colors"
                        >
                          {col.customerName}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Store className="h-3 w-3 text-slate-400" />
                          <span>{col.shopName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-slate-400">{col.customerCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-base font-bold text-emerald-700 font-mono">
                        ৳{col.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {col.allocations.map((alloc) => (
                          <span
                            key={alloc.orderId}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700 border border-slate-200 font-mono"
                            title={`Allocated ৳${alloc.allocatedAmount.toLocaleString()} to ${alloc.orderCode} (Remaining Due: ৳${alloc.remainingDue.toLocaleString()})`}
                          >
                            <FileText className="h-3 w-3 text-slate-400" />
                            {alloc.orderCode}:{" "}
                            <span className="font-bold text-emerald-600">
                              ৳{alloc.allocatedAmount.toLocaleString()}
                            </span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedReceipt(col)}
                        className="h-8 border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-xs flex items-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* ADD COLLECTION MODAL (SEARCH-BASED CUSTOMER SELECTION) */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Record Customer Collection</h3>
                  <p className="text-xs text-slate-500">
                    Search customer, receive payment, and settle outstanding invoices using FIFO.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleRecordCollection} className="p-6 space-y-5">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Customer Selection (Search-Based) */}
              {!selectedCustomer ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-emerald-600" />
                      Search & Select Customer
                    </Label>
                    <span className="text-[11px] text-slate-400">
                      Search by name, shop, phone, or code
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      autoFocus
                      placeholder="Type customer name, shop name, phone, or customer code..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="pl-9 bg-white border-slate-300 text-sm focus:border-emerald-500"
                    />

                    {/* Customer Autocomplete Dropdown List */}
                    {customerSearchQuery.trim() && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                        {matchingSearchCustomers.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">
                            No customers found matching &ldquo;{customerSearchQuery}&rdquo;.
                          </div>
                        ) : (
                          matchingSearchCustomers.map((cust) => {
                            const due = getCustomerCurrentDue(cust.id)
                            return (
                              <button
                                key={cust.id}
                                type="button"
                                onClick={() => handleSelectCustomer(cust)}
                                className="w-full flex items-center justify-between p-3 text-left text-xs transition-colors hover:bg-emerald-50 border-b border-slate-100 last:border-0"
                              >
                                <div>
                                  <div className="font-bold text-slate-900 text-sm">{cust.name}</div>
                                  <div className="text-slate-600 flex items-center gap-1.5 mt-0.5">
                                    <Store className="h-3 w-3 text-slate-400" />
                                    <span>{cust.shopName}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-mono text-slate-500">{cust.code}</span>
                                  </div>
                                  <div className="text-slate-400 text-[11px] mt-0.5">
                                    {cust.phone} • {cust.areaName}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className="text-[11px] text-slate-500 uppercase font-medium block">
                                    Outstanding Due
                                  </span>
                                  <span className="font-bold text-amber-700 font-mono text-sm">
                                    ৳{due.toLocaleString()}
                                  </span>
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Customer Selected Snapshot & Unpaid Invoices */
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Customer Selected
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetCustomer}
                      className="h-7 text-xs text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/60 flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Change Customer
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-slate-500 block uppercase font-medium">Customer Details</span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                        {selectedCustomer.name}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {selectedCustomer.shopName} ({selectedCustomer.code}) • {selectedCustomer.phone}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 block uppercase font-medium">
                        Current Outstanding Due
                      </span>
                      <span className="text-xl font-extrabold text-amber-700 font-mono mt-0.5 block">
                        ৳{getCustomerCurrentDue(selectedCustomer.id).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Unpaid Invoices List */}
                  <div className="pt-2 border-t border-emerald-200/60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-700">
                        Unpaid / Partially-Paid Invoices ({customerUnpaidOrders.length})
                      </span>
                      <span className="text-xs text-slate-400">
                        Settled in chronological FIFO order
                      </span>
                    </div>

                    {customerUnpaidOrders.length === 0 ? (
                      <div className="rounded-md bg-white p-3 text-center text-xs text-slate-500 border border-slate-200">
                        No outstanding unpaid invoices found for this customer.
                      </div>
                    ) : (
                      <div className="max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-white">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="py-2 px-3">Invoice ID</th>
                              <th className="py-2 px-3">Date</th>
                              <th className="py-2 px-3 text-right">Grand Total</th>
                              <th className="py-2 px-3 text-right">Paid So Far</th>
                              <th className="py-2 px-3 text-right font-bold text-amber-700">
                                Current Due
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {customerUnpaidOrders.map((ord) => (
                              <tr key={ord.id} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono font-medium text-slate-800">
                                  {ord.code}
                                </td>
                                <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                                  {ord.date}
                                </td>
                                <td className="py-2 px-3 text-right font-mono">
                                  ৳{ord.grandTotal.toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-right font-mono text-slate-600">
                                  ৳{(ord.paidAmount || 0).toLocaleString()}
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">
                                  ৳{ord.currentDue.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Fields (Only visible when customer is selected) */}
              {selectedCustomer && (
                <>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">
                        Collection Amount (৳)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                          ৳
                        </span>
                        <Input
                          type="number"
                          step="any"
                          min="1"
                          placeholder="e.g. 50000"
                          value={formAmount}
                          onChange={(e) => setFormAmount(e.target.value)}
                          className="pl-8 font-mono font-bold text-emerald-800 border-slate-300 focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Collection Date</Label>
                      <Input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="border-slate-300 focus:border-emerald-500 text-sm"
                      />
                    </div>
                  </div>

                  {/* Live FIFO Allocation Preview */}
                  {liveAllocations.length > 0 && (
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Live FIFO Payment Allocation Preview
                        </span>
                        <span className="text-xs text-emerald-700">
                          Total Allocated:{" "}
                          <strong className="font-mono">
                            ৳
                            {liveAllocations
                              .reduce((sum, a) => sum + a.allocated, 0)
                              .toLocaleString()}
                          </strong>
                        </span>
                      </div>

                      <div className="space-y-2">
                        {liveAllocations.map((item) => (
                          <div
                            key={item.order.id}
                            className="flex items-center justify-between rounded-md bg-white p-2.5 text-xs border border-emerald-100 shadow-2xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-800">
                                {item.order.code}
                              </span>
                              <span className="text-slate-400">({item.order.date})</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-slate-500">
                                Previous Due: ৳{item.previousDue.toLocaleString()}
                              </span>
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <span className="font-bold text-emerald-700">
                                Paid: ৳{item.allocated.toLocaleString()}
                              </span>
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <span
                                className={`font-semibold ${
                                  item.isFullyPaid ? "text-emerald-600" : "text-amber-700"
                                }`}
                              >
                                {item.isFullyPaid
                                  ? "Cleared (৳0)"
                                  : `Remaining: ৳${item.newRemainingDue.toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-xs text-slate-700">
                        <span>
                          Customer New Balance:{" "}
                          <strong className="text-emerald-800 font-mono text-sm">
                            ৳
                            {Math.max(
                              0,
                              getCustomerCurrentDue(selectedCustomer.id) - (parseFloat(formAmount) || 0)
                            ).toLocaleString()}
                          </strong>
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedCustomer}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm disabled:opacity-50"
                >
                  Confirm & Record Collection
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW RECEIPT MODAL (Clean, Relevant, Official Money Receipt) */}
      {/* ========================================================================= */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Money Receipt / Collection Voucher</h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="h-8 gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-100 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print
                </Button>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Receipt Body */}
            <div className="p-6 space-y-6">
              {/* Receipt Top Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center">
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
                    <h1 className="text-base font-bold tracking-tight text-slate-900">
                      Eakin Animal Health Ltd.
                    </h1>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">{selectedReceipt.date}</div>
                </div>
              </div>

              {/* Customer Details Box */}
              <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Received From (Customer):
                </span>
                <div className="font-bold text-slate-900 text-sm">
                  {selectedReceipt.customerName}
                </div>
                <div className="text-slate-700 font-medium">{selectedReceipt.shopName}</div>
                <div className="text-slate-500 font-mono mt-0.5">
                  Customer ID: {selectedReceipt.customerCode}
                </div>
                {receiptCustomer?.phone && (
                  <div className="text-slate-500 mt-0.5">Phone: {receiptCustomer.phone}</div>
                )}
                {receiptCustomer?.address && (
                  <div className="text-slate-500 mt-0.5">{receiptCustomer.address}</div>
                )}
              </div>

              {/* Allocation Breakdown Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
                  <span>Settled Invoice Breakdown (FIFO Order)</span>
                  <span className="text-slate-400 font-normal">
                    {selectedReceipt.allocations.length} invoice(s) applied
                  </span>
                </h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs min-w-[620px]">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 whitespace-nowrap">Invoice ID</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Invoice Date</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Invoice Total</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Prior Due</th>
                        <th className="py-2.5 px-3 text-right font-bold text-emerald-800 whitespace-nowrap">
                          Amount Paid
                        </th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Remaining Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedReceipt.allocations.map((alloc) => (
                        <tr key={alloc.orderId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-800 whitespace-nowrap">
                            {alloc.orderCode}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                            {alloc.orderDate}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                            ৳{alloc.originalGrandTotal.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-500 whitespace-nowrap">
                            ৳{alloc.previousDue.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                            ৳{alloc.allocatedAmount.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                            {alloc.remainingDue === 0 ? (
                              <span className="text-emerald-600 font-bold">Cleared (৳0)</span>
                            ) : (
                              `৳${alloc.remainingDue.toLocaleString()}`
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Paid Block */}
              <div className="flex items-center justify-between rounded-lg bg-emerald-50 border border-emerald-200 p-4">
                <span className="text-sm font-bold text-emerald-900 uppercase">
                  Total Amount Received
                </span>
                <span className="text-2xl font-black text-emerald-800 font-mono">
                  ৳{selectedReceipt.amount.toLocaleString()}
                </span>
              </div>

            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50 px-6 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
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
