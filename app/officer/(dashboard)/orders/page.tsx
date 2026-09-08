"use client"

import * as React from "react"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import {
  Search,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Plus,
  Trash2,
  Printer,
  Gift,
  Building2,
  UserCheck,
  User,
  Store,
  Phone,
  MapPin,
  Receipt,
  FileText,
  X,
  AlertCircle,
  Package,
  RefreshCw,
  Minus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import {
  type Order,
  type OrderItem,
  type OrderStatus,
  type CustomerItem,
  type Product,
} from "@/lib/mock-data"

export default function OfficerOrdersPage() {
  const searchParams = useSearchParams()
  const autoOpenCreate = searchParams?.get("create") === "true" || searchParams?.get("action") === "new"

  const {
    currentOfficer,
    customers,
    orders,
    catalog,
    depotStocks,
    getOfficerAssignedDepot,
    createOrder,
  } = useAppState()

  // Filter States
  const [statusFilter, setStatusFilter] = React.useState<"all" | OrderStatus>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  // Modal States
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = React.useState<Order | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)

  // Order Creation Form State (Search-First workflow like Admin Product Returns)
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>("")
  const [customerSearchQuery, setCustomerSearchQuery] = React.useState<string>("")
  const [productSearchQuery, setProductSearchQuery] = React.useState<string>("")
  const [addedProductIds, setAddedProductIds] = React.useState<string[]>([])
  const [productQuantities, setProductQuantities] = React.useState<Record<string, string>>({})
  const [createOrderError, setCreateOrderError] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Toast
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3500)
  }

  // Officer's Assigned Customers
  const officerCustomers = React.useMemo(() => {
    if (!currentOfficer) return []
    return customers.filter((c) => c.officerId === currentOfficer.id)
  }, [customers, currentOfficer])

  // Officer's Orders
  const officerOrders = React.useMemo(() => {
    if (!currentOfficer) return []
    return orders.filter((o) => o.officerId === currentOfficer.id)
  }, [orders, currentOfficer])

  // Assigned Fulfillment Depot
  const assignedDepot = React.useMemo(() => {
    if (!currentOfficer) return null
    return getOfficerAssignedDepot(currentOfficer.id)
  }, [currentOfficer, getOfficerAssignedDepot])

  // Stock inventory map for the assigned fulfillment depot
  const depotStockMap = React.useMemo(() => {
    const map: Record<string, number> = {}
    if (assignedDepot && depotStocks[assignedDepot.id]) {
      depotStocks[assignedDepot.id].forEach((item) => {
        map[item.productId] = item.quantity
      })
    }
    return map
  }, [assignedDepot, depotStocks])

  // Selected customer object
  const selectedCustomer = React.useMemo(() => {
    return officerCustomers.find((c) => c.id === selectedCustomerId) || null
  }, [officerCustomers, selectedCustomerId])

  // Matching Customers for Autocomplete Search
  const matchingSearchCustomers = React.useMemo(() => {
    const q = customerSearchQuery.trim().toLowerCase()
    if (!q) return []
    return officerCustomers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.shopName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
    )
  }, [officerCustomers, customerSearchQuery])

  // Matching Products for Autocomplete Search
  const matchingSearchProducts = React.useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase()
    if (!q) return []
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
  }, [catalog, productSearchQuery])

  // Filtered Orders for the list
  const filteredOrders = React.useMemo(() => {
    return officerOrders.filter((order) => {
      // 1. Status Filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false
      }

      // 2. Search Filter (Invoice code, Customer name, Shop name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesCode = order.code.toLowerCase().includes(q)
        const matchesCustomer = order.customerName.toLowerCase().includes(q)
        const matchesCustomerCode = order.customerCode.toLowerCase().includes(q)
        const matchesShop = order.shopName.toLowerCase().includes(q)
        if (!matchesCode && !matchesCustomer && !matchesCustomerCode && !matchesShop) {
          return false
        }
      }

      return true
    })
  }, [officerOrders, statusFilter, searchQuery])

  // Status Counts
  const statusCounts = React.useMemo(() => {
    const counts = { all: officerOrders.length, Pending: 0, Approved: 0, Cancelled: 0 }
    officerOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1
    })
    return counts
  }, [officerOrders])

  // Auto open create modal if requested in URL
  React.useEffect(() => {
    if (autoOpenCreate && officerCustomers.length > 0) {
      handleOpenCreateModal()
    }
  }, [autoOpenCreate, officerCustomers.length])

  // Open Order Creation Modal
  const handleOpenCreateModal = (prefillCustId?: string) => {
    setSelectedCustomerId(prefillCustId || "")
    setCustomerSearchQuery("")
    setProductSearchQuery("")
    setAddedProductIds([])
    setProductQuantities({})
    setCreateOrderError("")
    setIsCreateModalOpen(true)
  }

  // Select a customer from search results
  const handleSelectCustomer = (cust: CustomerItem) => {
    setSelectedCustomerId(cust.id)
    setCustomerSearchQuery("")
    setCreateOrderError("")
  }

  // Reset / Change selected customer
  const handleResetCustomer = () => {
    setSelectedCustomerId("")
    setCustomerSearchQuery("")
    setCreateOrderError("")
  }

  // Add Product to Order Table from search autocomplete
  const handleAddProduct = (prod: Product) => {
    if (!addedProductIds.includes(prod.id)) {
      setAddedProductIds((prev) => [...prev, prod.id])
      setProductQuantities((prev) => ({
        ...prev,
        [prod.id]: prev[prod.id] || "10",
      }))
    } else {
      // If already added, increase quantity by 10
      setProductQuantities((prev) => {
        const current = parseInt(prev[prod.id] || "0", 10)
        return {
          ...prev,
          [prod.id]: String(current + 10),
        }
      })
    }
    setProductSearchQuery("")
    setCreateOrderError("")
  }

  // Remove Product from Order Table
  const handleRemoveProduct = (productId: string) => {
    setAddedProductIds((prev) => prev.filter((id) => id !== productId))
    setProductQuantities((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setCreateOrderError("")
  }

  // Change Quantity of a Product
  const handleSetProductQuantity = (productId: string, val: string) => {
    if (val === "") {
      setProductQuantities((prev) => ({ ...prev, [productId]: "" }))
      return
    }
    const num = parseInt(val, 10)
    if (isNaN(num)) return
    const safeNum = Math.max(0, num)
    setProductQuantities((prev) => ({ ...prev, [productId]: String(safeNum) }))
    setCreateOrderError("")
  }

  // Step quantity by delta (+1 / -1)
  const handleStepQuantity = (productId: string, delta: number) => {
    setProductQuantities((prev) => {
      const current = parseInt(prev[productId] || "0", 10)
      const next = Math.max(1, current + delta)
      return {
        ...prev,
        [productId]: String(next),
      }
    })
    setCreateOrderError("")
  }

  // Order Calculation for Creation Modal
  const calculatedNewOrder = React.useMemo(() => {
    const items: OrderItem[] = []
    let totalItems = 0
    let subtotal = 0

    addedProductIds.forEach((prodId, idx) => {
      const prod = catalog.find((p) => p.id === prodId)
      const qtyStr = productQuantities[prodId]
      const qty = parseInt(qtyStr || "0", 10)
      if (prod && qty > 0) {
        const unitPrice = prod.sellPrice || prod.price || 0
        const totalPrice = unitPrice * qty
        items.push({
          id: `item-new-${idx + 1}`,
          productId: prod.id,
          productCode: prod.code,
          productName: prod.name,
          packSize: prod.packSize,
          quantity: qty,
          unitPrice,
          totalPrice,
        })
        totalItems += qty
        subtotal += totalPrice
      }
    })

    const officerDiscountPercent = 2.5
    const discountAmount = Math.round(((subtotal * officerDiscountPercent) / 100) * 100) / 100
    const grandTotal = Math.max(0, subtotal - discountAmount)

    return {
      items,
      totalItems,
      subtotal,
      officerDiscountPercent,
      discountPercent: officerDiscountPercent,
      discountAmount,
      grandTotal,
    }
  }, [catalog, addedProductIds, productQuantities])

  // Submit New Order
  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentOfficer) return

    if (!selectedCustomer) {
      setCreateOrderError("Please search and select an assigned customer first.")
      return
    }

    if (addedProductIds.length === 0) {
      setCreateOrderError("Please search and add at least one product to the order.")
      return
    }

    if (calculatedNewOrder.items.length === 0) {
      setCreateOrderError("Please specify product quantities greater than 0.")
      return
    }

    setIsSubmitting(true)

    const depotToUse = assignedDepot || {
      id: "dep-1",
      name: "Dhaka Central Depot",
      code: "DEP-DHA-01",
      location: "Tejgaon Industrial Area, Dhaka",
    }

    const created = createOrder({
      customerId: selectedCustomer.id,
      customerCode: selectedCustomer.code,
      customerName: selectedCustomer.name,
      shopName: selectedCustomer.shopName,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address,
      officerId: currentOfficer.id,
      officerCode: currentOfficer.code,
      officerName: currentOfficer.name,
      depotId: depotToUse.id,
      depotName: depotToUse.name,
      items: calculatedNewOrder.items,
      totalItems: calculatedNewOrder.totalItems,
      subtotal: calculatedNewOrder.subtotal,
      officerDiscountPercent: 2.5,
      adminDiscountPercent: 0,
      discountPercent: 2.5,
      discountAmount: calculatedNewOrder.discountAmount,
      grandTotal: calculatedNewOrder.grandTotal,
    })

    setIsSubmitting(false)
    setIsCreateModalOpen(false)
    showToast(`Order ${created.code} submitted successfully! Sent to Admin for review & approval.`, "success")
  }

  if (!currentOfficer) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No active officer session.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-6 z-50 flex items-center gap-2 rounded-md border px-4 py-2.5 text-xs font-medium shadow-lg transition-all ${
            toastMessage.type === "success"
              ? "border-primary/30 bg-card text-foreground"
              : "border-destructive/30 bg-card text-destructive"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="size-4 text-primary" />
          ) : (
            <XCircle className="size-4 text-destructive" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Header & Order Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            My Orders
          </h2>
          <p className="text-xs text-muted-foreground">
            Take customer orders, review submitted invoices, and track admin approvals in real-time.
          </p>
        </div>

        <div>
          <Button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="cursor-pointer gap-1.5 bg-primary text-primary-foreground font-medium shadow-xs hover:bg-primary/90"
          >
            <Plus className="size-4" />
            <span>Take New Order</span>
          </Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3.5">
            {/* Status Tabs Header */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border/70 bg-muted/30 p-1">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "all"
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>All Orders</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] font-bold">
                    {statusCounts.all}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("Pending")}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "Pending"
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Clock className="size-3 text-amber-500" />
                  <span>Pending Review</span>
                  <span className="rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 text-[10px] font-bold">
                    {statusCounts.Pending}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("Approved")}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "Approved"
                      ? "bg-primary/10 text-primary shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CheckCircle2 className="size-3 text-primary" />
                  <span>Approved</span>
                  <span className="rounded-full bg-primary/20 text-primary px-1.5 py-0.2 text-[10px] font-bold">
                    {statusCounts.Approved}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatusFilter("Cancelled")}
                  className={`flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === "Cancelled"
                      ? "bg-destructive/10 text-destructive shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <XCircle className="size-3 text-destructive" />
                  <span>Cancelled</span>
                  <span className="rounded-full bg-destructive/20 text-destructive px-1.5 py-0.2 text-[10px] font-bold">
                    {statusCounts.Cancelled}
                  </span>
                </button>
              </div>

              <div className="text-xs text-muted-foreground font-medium">
                Showing {filteredOrders.length} of {officerOrders.length} orders
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:max-w-md">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice ID, customer name, shop..."
                className="h-9 pl-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        {/* Orders Table */}
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
                    Date & Time
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Customer & Shop
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Total Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Status
                  </th>
                  <th scope="col" className="w-32 px-4 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => {
                    const isPending = order.status === "Pending"
                    const isApproved = order.status === "Approved"
                    const isCancelled = order.status === "Cancelled"

                    return (
                      <tr key={order.id} className="transition-colors hover:bg-muted/30">
                        {/* SL */}
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>

                        {/* Invoice ID */}
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

                        {/* Date */}
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-[11px]">
                          {order.date}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">{order.customerName}</div>
                          <div className="text-[11px] text-muted-foreground">{order.shopName}</div>
                        </td>

                        {/* Order Total */}
                        <td className="px-4 py-3 text-right">
                          <div className="font-mono font-bold text-foreground">
                            ৳ {order.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                          {order.discountPercent > 0 && (
                            <div className="text-[10px] text-primary font-medium">
                              ({order.discountPercent}% disc applied)
                            </div>
                          )}
                        </td>

                        {/* Status */}
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

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setSelectedInvoiceOrder(order)}
                            className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-primary hover:text-primary-foreground"
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
                    <td colSpan={7} className="px-4 py-10 text-center text-xs text-muted-foreground">
                      No orders found. Click &quot;Take New Order&quot; to create a new customer order.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 1. SEARCH-BASED ORDER CREATION MODAL (LIKE PRODUCT RETURN) */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-order-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={() => setIsCreateModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingCart className="size-5" />
                </div>
                <div>
                  <h3 id="create-order-title" className="text-sm font-bold text-foreground">
                    Take New Customer Order
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Search customer, search & add multiple products, and submit directly for Admin approval.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsCreateModalOpen(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmitOrder} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Error notice */}
              {createOrderError && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{createOrderError}</span>
                </div>
              )}

              {/* Step 1: Customer Selection (Search Autocomplete & Snapshot Banner) */}
              {!selectedCustomer ? (
                <div className="space-y-2 rounded-lg border border-border bg-muted/10 p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <User className="size-3.5 text-primary" />
                      Search & Select Customer *
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      {officerCustomers.length} assigned customers in your area
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoFocus
                      placeholder="Type customer name, shop name, phone, or customer code..."
                      value={customerSearchQuery}
                      onChange={(e) => setCustomerSearchQuery(e.target.value)}
                      className="pl-9 text-xs"
                    />

                    {/* Customer Autocomplete Dropdown List */}
                    {customerSearchQuery.trim() && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
                        {matchingSearchCustomers.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">
                            No assigned customers found matching &ldquo;{customerSearchQuery}&rdquo;.
                          </div>
                        ) : (
                          matchingSearchCustomers.map((cust) => (
                            <button
                              key={cust.id}
                              type="button"
                              onClick={() => handleSelectCustomer(cust)}
                              className="w-full flex items-center justify-between p-3 text-left text-xs transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0 cursor-pointer"
                            >
                              <div>
                                <div className="font-bold text-foreground text-xs">{cust.name}</div>
                                <div className="text-muted-foreground flex items-center gap-1.5 mt-0.5 text-[11px]">
                                  <Store className="size-3 text-muted-foreground" />
                                  <span className="font-semibold text-foreground">{cust.shopName}</span>
                                  <span>&bull;</span>
                                  <span className="font-mono text-primary font-medium">{cust.code}</span>
                                </div>
                                <div className="text-muted-foreground text-[10px] mt-0.5">
                                  {cust.phone} &bull; {cust.address}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-muted-foreground uppercase font-medium block">
                                  Outstanding
                                </span>
                                <span className="font-bold text-amber-700 dark:text-amber-400 font-mono text-xs">
                                  ৳ {(cust.outstandingBalance || 0).toLocaleString()}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Customer Selected Snapshot Banner */
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <CheckCircle2 className="size-3.5 text-primary" />
                        Customer Selected
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetCustomer}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="size-3" />
                      <span>Change Customer</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-muted-foreground block uppercase font-medium text-[10px]">
                        Customer & Shop
                      </span>
                      <span className="font-bold text-foreground text-xs mt-0.5 block">
                        {selectedCustomer.shopName}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Proprietor: <strong className="text-foreground">{selectedCustomer.name}</strong> (
                        <span className="font-mono text-primary">{selectedCustomer.code}</span>)
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block uppercase font-medium text-[10px]">
                        Contact & Fulfillment
                      </span>
                      <span className="text-foreground text-xs font-mono mt-0.5 block">
                        {selectedCustomer.phone}
                      </span>
                      <span className="text-muted-foreground text-[11px] block truncate">
                        Depot: <strong className="text-foreground">{assignedDepot?.name || "Dhaka Central Depot"}</strong>
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block uppercase font-medium text-[10px]">
                        Current Outstanding Balance
                      </span>
                      <span className="font-bold text-amber-700 dark:text-amber-400 text-sm font-mono mt-0.5 block">
                        ৳ {(selectedCustomer.outstandingBalance || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Product Search & Dynamic Order Line Items */}
              {selectedCustomer && (
                <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                  {/* Search Input for Products */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="size-3.5 text-primary" />
                      Search Product to Add *
                    </Label>

                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Type product name, SKU code, or category to search and add..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="pl-9 text-xs"
                      />

                      {/* Matching Products Autocomplete Dropdown */}
                      {productSearchQuery.trim() && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
                          {matchingSearchProducts.length === 0 ? (
                            <div className="p-4 text-center text-xs text-muted-foreground">
                              No products found matching &ldquo;{productSearchQuery}&rdquo;.
                            </div>
                          ) : (
                            matchingSearchProducts.map((prod) => {
                              const isAlreadyAdded = addedProductIds.includes(prod.id)
                              const availableQty = depotStockMap[prod.id] ?? 500

                              return (
                                <button
                                  key={prod.id}
                                  type="button"
                                  onClick={() => handleAddProduct(prod)}
                                  className="w-full flex items-center justify-between p-3 text-left text-xs transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0 cursor-pointer"
                                >
                                  <div>
                                    <div className="font-bold text-foreground text-xs flex items-center gap-2">
                                      <span>{prod.name}</span>
                                      <span className="rounded bg-muted px-1.5 py-0.2 text-[9px] font-medium text-muted-foreground">
                                        {prod.category}
                                      </span>
                                    </div>
                                    <div className="text-muted-foreground font-mono text-[11px] mt-0.5">
                                      <span className="text-primary font-semibold">{prod.code}</span> &bull; {prod.packSize}
                                    </div>
                                  </div>
                                  <div className="text-right flex items-center gap-3">
                                    <div>
                                      <span className="text-[10px] text-muted-foreground block">Unit Price</span>
                                      <span className="font-bold text-foreground font-mono text-xs">
                                        ৳ {(prod.sellPrice || prod.price || 0).toLocaleString()}
                                      </span>
                                    </div>
                                    <div>
                                      {isAlreadyAdded ? (
                                        <span className="inline-flex items-center rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary font-mono">
                                          +10 Added
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-foreground">
                                          <Plus className="size-3" />
                                          Add
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </button>
                              )
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Added Products Table */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">
                        Order Line Items ({addedProductIds.length} products)
                      </span>
                    </div>

                    {addedProductIds.length > 0 ? (
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-left text-xs">
                          <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase">
                            <tr>
                              <th scope="col" className="w-10 px-3 py-2 text-center">SL</th>
                              <th scope="col" className="px-3 py-2">Product</th>
                              <th scope="col" className="px-3 py-2 text-right">Unit Price (৳)</th>
                              <th scope="col" className="w-36 px-3 py-2 text-center">Quantity</th>
                              <th scope="col" className="px-3 py-2 text-right">Line Total (৳)</th>
                              <th scope="col" className="w-12 px-2 py-2 text-center">Remove</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {addedProductIds.map((prodId, idx) => {
                              const prod = catalog.find((p) => p.id === prodId)
                              if (!prod) return null

                              const qtyVal = productQuantities[prodId] || "10"
                              const qtyNum = parseInt(qtyVal, 10) || 0
                              const unitPrice = prod.sellPrice || prod.price || 0
                              const lineTotal = unitPrice * qtyNum

                              return (
                                <tr key={prod.id} className="transition-colors hover:bg-muted/20">
                                  {/* SL */}
                                  <td className="px-3 py-2.5 text-center font-mono text-muted-foreground">
                                    {idx + 1}
                                  </td>

                                  {/* Product Name & Code */}
                                  <td className="px-3 py-2.5">
                                    <div className="font-semibold text-foreground">{prod.name}</div>
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                      <span className="text-primary font-medium">{prod.code}</span>
                                      <span>&bull;</span>
                                      <span>{prod.packSize}</span>
                                    </div>
                                  </td>

                                  {/* Unit Price */}
                                  <td className="px-3 py-2.5 text-right font-mono text-muted-foreground">
                                    ৳ {unitPrice.toLocaleString()}
                                  </td>

                                  {/* Quantity Controls */}
                                  <td className="px-3 py-2.5">
                                    <div className="flex items-center justify-center gap-1">
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-xs"
                                        onClick={() => handleStepQuantity(prod.id, -1)}
                                        className="h-7 w-7 cursor-pointer"
                                      >
                                        <Minus className="size-3" />
                                      </Button>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={qtyVal}
                                        onChange={(e) => handleSetProductQuantity(prod.id, e.target.value)}
                                        className="h-7 w-16 text-center text-xs font-mono font-bold"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-xs"
                                        onClick={() => handleStepQuantity(prod.id, 1)}
                                        className="h-7 w-7 cursor-pointer"
                                      >
                                        <Plus className="size-3" />
                                      </Button>
                                    </div>
                                  </td>

                                  {/* Line Total */}
                                  <td className="px-3 py-2.5 text-right font-mono font-bold text-foreground">
                                    ৳ {lineTotal.toLocaleString()}
                                  </td>

                                  {/* Remove Action */}
                                  <td className="px-2 py-2.5 text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => handleRemoveProduct(prod.id)}
                                      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                                    >
                                      <Trash2 className="size-3.5" />
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                        <Package className="mx-auto size-7 text-muted-foreground/50 mb-1.5" />
                        <p className="font-medium text-foreground">No products added yet.</p>
                        <p className="text-[11px]">Use the product search bar above to search and add products to this order.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Order Financial Calculation Summary */}
              {selectedCustomer && addedProductIds.length > 0 && (
                <div className="flex justify-end pt-1">
                  <div className="w-full sm:max-w-xs space-y-2 rounded-lg border border-border bg-muted/20 p-3.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Total Products:</span>
                      <span className="font-mono font-semibold text-foreground">
                        {addedProductIds.length} SKUs ({calculatedNewOrder.totalItems} units)
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Order Subtotal:</span>
                      <span className="font-mono font-semibold text-foreground">
                        ৳ {calculatedNewOrder.subtotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Standard Officer Discount (2.5%):</span>
                      <span className="font-mono font-semibold text-primary">
                        - ৳ {calculatedNewOrder.discountAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="border-t border-border pt-2 flex items-center justify-between font-bold text-sm text-foreground">
                      <span>Grand Total:</span>
                      <span className="font-mono text-base text-primary">
                        ৳ {calculatedNewOrder.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !selectedCustomer || calculatedNewOrder.items.length === 0}
                  className="cursor-pointer bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-xs"
                >
                  <span>Submit Order to Admin</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ORDER INVOICE VIEW MODAL                               */}
      {/* ========================================================= */}
      {selectedInvoiceOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="invoice-view-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={() => setSelectedInvoiceOrder(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-3xl rounded-lg border border-border bg-card shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-5 py-3">
              <div className="flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                <h3 id="invoice-view-title" className="text-sm font-semibold text-foreground">
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

            {/* Invoice Sheet */}
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
                    <p className="text-[11px] text-muted-foreground">
                      Quality Veterinary Medicines & Nutritional Supplements
                    </p>
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
                    Customer Details
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

              {/* Order Items */}
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

              {/* Bonus Items (if admin added bonus on approval) */}
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
                            <td className="px-3 py-1.5 text-right font-mono font-bold text-primary">+{bonus.quantity} {bonus.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Financial Summary */}
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
            </div>

            {/* Bottom Bar */}
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
