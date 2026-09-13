"use client"

import * as React from "react"
import Image from "next/image"
import {
  Search,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Eye,
  Check,
  X,
  Plus,
  Minus,
  Trash2,
  Printer,
  Gift,
  Building2,
  UserCheck,
  User,
  Store,
  Calendar,
  Phone,
  MapPin,
  AlertTriangle,
  AlertCircle,
  Package,
  RefreshCw,
  Receipt,
  Percent,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import {
  type Order,
  type OrderItem,
  type CustomerItem,
  type OrderStatus,
  type BonusOrderItem,
  type SalesOfficerItem,
  type Depot,
  type Product,
} from "@/lib/mock-data"
import { formatDateTime } from "@/lib/utils"

interface BonusInputRow {
  rowId: string
  productId: string
  quantity: string
}

export default function OrdersPage() {
  const {
    currentRole,
    currentRM,
    currentAM,
    currentOfficer,
    areas,
    orders,
    officers,
    depots,
    customers,
    catalog,
    approveOrder,
    cancelOrder,
    createOrder,
    getOfficerAssignedDepot,
    getOfficerAvailableDepots,
  } = useAppState()

  // Restricted Staff (RM, AM, Officer) belong to their single assigned fulfillment depot
  const isRestrictedStaff = currentRole === "rm" || currentRole === "am" || currentRole === "officer"

  const assignedDepot = React.useMemo(() => {
    if (currentRole === "rm") {
      const area = areas.find((a) => a.id === currentRM?.areaId)
      return depots.find((d) => d.id === area?.depotId) || depots[0] || null
    }
    if (currentRole === "am") {
      const area = areas.find((a) => a.id === currentAM?.areaId)
      return depots.find((d) => d.id === area?.depotId) || depots[0] || null
    }
    if (currentRole === "officer") {
      return getOfficerAssignedDepot(currentOfficer?.id || "") || depots[0] || null
    }
    return null
  }, [currentRole, currentRM, currentAM, currentOfficer, areas, depots, getOfficerAssignedDepot])

  // Visible officers in dropdown for RM / AM / Officer
  const visibleOfficers = React.useMemo(() => {
    if (currentRole === "rm" && currentRM) {
      const filtered = officers.filter((o) => o.rmId === currentRM.id || o.areaId === currentRM.areaId)
      return filtered.length > 0 ? filtered : officers
    }
    if (currentRole === "am" && currentAM) {
      const filtered = officers.filter((o) => o.amId === currentAM.id || o.areaId === currentAM.areaId)
      return filtered.length > 0 ? filtered : officers
    }
    if (currentRole === "officer" && currentOfficer) {
      return [currentOfficer]
    }
    return officers
  }, [officers, currentRole, currentRM, currentAM, currentOfficer])

  // Filters State
  const [statusFilter, setStatusFilter] = React.useState<"all" | OrderStatus>("all")
  const [officerFilter, setOfficerFilter] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  // Modal States
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = React.useState<Order | null>(null)
  const [approvingOrder, setApprovingOrder] = React.useState<Order | null>(null)
  const [cancellingOrder, setCancellingOrder] = React.useState<Order | null>(null)

  // Approval Form State
  const [approvalAdminDiscountPercent, setApprovalAdminDiscountPercent] = React.useState<string>("0")
  const [bonusRows, setBonusRows] = React.useState<BonusInputRow[]>([])
  const [approvalError, setApprovalError] = React.useState<string>("")

  // Toast State
  const [toastMessage, setToastMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null)

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type })
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Base orders for role (RM/AM filtered to their depot)
  const roleBaseOrders = React.useMemo(() => {
    if (isRestrictedStaff && assignedDepot) {
      return orders.filter((o) => o.depotId === assignedDepot.id)
    }
    return orders
  }, [orders, isRestrictedStaff, assignedDepot])

  // Filtered Orders Calculation
  const filteredOrders = React.useMemo(() => {
    return roleBaseOrders.filter((order) => {
      // 1. Status Filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false
      }

      // 2. Sales Officer Filter
      if (officerFilter !== "all" && order.officerId !== officerFilter) {
        return false
      }

      // 3. Search Filter (Order Code, Customer Name, Customer Code, Officer Name, Shop Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchesCode = order.code.toLowerCase().includes(q)
        const matchesCustomer = order.customerName.toLowerCase().includes(q)
        const matchesCustomerCode = order.customerCode.toLowerCase().includes(q)
        const matchesShop = order.shopName.toLowerCase().includes(q)
        const matchesOfficer = order.officerName.toLowerCase().includes(q)
        if (!matchesCode && !matchesCustomer && !matchesCustomerCode && !matchesShop && !matchesOfficer) {
          return false
        }
      }

      return true
    })
  }, [roleBaseOrders, statusFilter, officerFilter, searchQuery])

  // Status Counts
  const statusCounts = React.useMemo(() => {
    const counts = { all: roleBaseOrders.length, Pending: 0, Approved: 0, Cancelled: 0 }
    roleBaseOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1
    })
    return counts
  }, [roleBaseOrders])

  // Open Approval Modal
  const handleOpenApproveModal = (order: Order) => {
    setApprovingOrder(order)
    // Preload admin additional discount (default 0% or previous admin discount)
    setApprovalAdminDiscountPercent(String(order.adminDiscountPercent ?? 0))
    // Preload existing bonus items if any or default to empty
    if (order.bonusItems && order.bonusItems.length > 0) {
      setBonusRows(
        order.bonusItems.map((b) => ({
          rowId: `bonus-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: b.productId,
          quantity: String(b.quantity),
        }))
      )
    } else {
      setBonusRows([])
    }
    setApprovalError("")
  }

  // Add Bonus Product Row
  const handleAddBonusRow = () => {
    const defaultProduct = catalog[0]?.id || ""
    setBonusRows((prev) => [
      ...prev,
      {
        rowId: `bonus-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: defaultProduct,
        quantity: "5",
      },
    ])
  }

  // Remove Bonus Product Row
  const handleRemoveBonusRow = (rowId: string) => {
    setBonusRows((prev) => prev.filter((r) => r.rowId !== rowId))
  }

  // Update Bonus Row
  const handleUpdateBonusRow = (rowId: string, field: "productId" | "quantity", value: string) => {
    setBonusRows((prev) =>
      prev.map((r) => (r.rowId === rowId ? { ...r, [field]: value } : r))
    )
  }

  // Calculated values in Approval Modal
  const approvalCalculations = React.useMemo(() => {
    if (!approvingOrder) {
      return {
        subtotal: 0,
        officerDiscountPercent: 2.5,
        officerDiscountAmount: 0,
        adminDiscountPercent: 0,
        adminDiscountAmount: 0,
        totalDiscountPercent: 2.5,
        totalDiscountAmount: 0,
        grandTotal: 0,
      }
    }
    const subtotal = approvingOrder.subtotal
    const officerDiscountPercent = approvingOrder.officerDiscountPercent ?? 2.5
    const officerDiscountAmount = Math.round((subtotal * officerDiscountPercent) / 100 * 100) / 100

    const adminDiscountPercent = Math.max(0, parseFloat(approvalAdminDiscountPercent) || 0)
    const adminDiscountAmount = Math.round((subtotal * adminDiscountPercent) / 100 * 100) / 100

    const totalDiscountPercent = Math.round((officerDiscountPercent + adminDiscountPercent) * 100) / 100
    const totalDiscountAmount = Math.round((subtotal * totalDiscountPercent) / 100 * 100) / 100
    const grandTotal = Math.max(0, subtotal - totalDiscountAmount)

    return {
      subtotal,
      officerDiscountPercent,
      officerDiscountAmount,
      adminDiscountPercent,
      adminDiscountAmount,
      totalDiscountPercent,
      totalDiscountAmount,
      grandTotal,
    }
  }, [approvingOrder, approvalAdminDiscountPercent])

  // Confirm Order Approval
  const handleConfirmApproval = (e: React.FormEvent) => {
    e.preventDefault()
    if (!approvingOrder) return

    const adminDiscountPercent = parseFloat(approvalAdminDiscountPercent)
    if (isNaN(adminDiscountPercent) || adminDiscountPercent < 0 || adminDiscountPercent > 100) {
      setApprovalError("Please enter a valid additional admin discount percentage (0% to 100%).")
      return
    }

    // Build bonus items array
    const bonusItems: BonusOrderItem[] = []
    for (const row of bonusRows) {
      const qty = parseInt(row.quantity, 10)
      if (isNaN(qty) || qty <= 0) {
        setApprovalError("Bonus quantities must be greater than 0.")
        return
      }
      const prod = catalog.find((p) => p.id === row.productId)
      if (prod) {
        bonusItems.push({
          id: `bon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          productId: prod.id,
          productCode: prod.code,
          productName: prod.name,
          packSize: prod.packSize,
          quantity: qty,
        })
      }
    }

    const {
      officerDiscountPercent,
      totalDiscountPercent,
      totalDiscountAmount,
      grandTotal,
    } = approvalCalculations

    const approvedAt = formatDateTime(new Date())

    // Update orders state via central store
    approveOrder(
      approvingOrder.id,
      adminDiscountPercent,
      bonusItems.length > 0 ? bonusItems : undefined
    )

    // Update active invoice if it's currently open
    if (selectedInvoiceOrder && selectedInvoiceOrder.id === approvingOrder.id) {
      setSelectedInvoiceOrder({
        ...selectedInvoiceOrder,
        status: "Approved",
        officerDiscountPercent,
        adminDiscountPercent,
        discountPercent: totalDiscountPercent,
        discountAmount: totalDiscountAmount,
        grandTotal,
        bonusItems: bonusItems.length > 0 ? bonusItems : undefined,
        approvedAt,
      })
    }

    showToast(`Order ${approvingOrder.code} approved successfully (${totalDiscountPercent}% total discount).`, "success")
    setApprovingOrder(null)
  }

  // Confirm Order Cancellation
  const handleConfirmCancel = () => {
    if (!cancellingOrder) return

    const cancelledAt = formatDateTime(new Date())

    cancelOrder(cancellingOrder.id)

    if (selectedInvoiceOrder && selectedInvoiceOrder.id === cancellingOrder.id) {
      setSelectedInvoiceOrder({
        ...selectedInvoiceOrder,
        status: "Cancelled",
        cancelledAt,
      })
    }

    showToast(`Order ${cancellingOrder.code} has been cancelled.`, "error")
    setCancellingOrder(null)
  }

  // ==========================================
  // CREATE ORDER ON BEHALF OF MPO STATES & LOGIC
  // ==========================================
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
  const [selectedOfficerId, setSelectedOfficerId] = React.useState<string>("")
  const [officerSearchQuery, setOfficerSearchQuery] = React.useState<string>("")
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<string>("")
  const [customerSearchQuery, setCustomerSearchQuery] = React.useState<string>("")
  const [selectedDepotId, setSelectedDepotId] = React.useState<string>("")
  const [productSearchQuery, setProductSearchQuery] = React.useState<string>("")
  const [addedProductIds, setAddedProductIds] = React.useState<string[]>([])
  const [productQuantities, setProductQuantities] = React.useState<Record<string, string>>({})
  const [createOrderError, setCreateOrderError] = React.useState<string>("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Selected Officer
  const selectedOfficer = React.useMemo(() => {
    return officers.find((o) => o.id === selectedOfficerId) || null
  }, [officers, selectedOfficerId])

  // Matching Officers for Autocomplete Search
  const matchingSearchOfficers = React.useMemo(() => {
    const q = officerSearchQuery.trim().toLowerCase()
    if (!q) return []
    return officers.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        (o.areaName && o.areaName.toLowerCase().includes(q))
    )
  }, [officers, officerSearchQuery])

  // Customers assigned to selected MPO
  const officerCustomers = React.useMemo(() => {
    if (!selectedOfficerId) return []
    return customers.filter((c) => c.officerId === selectedOfficerId)
  }, [customers, selectedOfficerId])

  // Selected Customer
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

  // Available Depots for Selected MPO
  const officerAvailableDepots = React.useMemo(() => {
    if (!selectedOfficerId) return depots
    return getOfficerAvailableDepots(selectedOfficerId)
  }, [selectedOfficerId, getOfficerAvailableDepots, depots])

  // Sync selected depot when officer or available depots change
  React.useEffect(() => {
    if (officerAvailableDepots.length > 0) {
      if (!selectedDepotId || !officerAvailableDepots.some((d) => d.id === selectedDepotId)) {
        setSelectedDepotId(officerAvailableDepots[0].id)
      }
    }
  }, [officerAvailableDepots, selectedDepotId])

  // Active Fulfillment Depot
  const activeFulfillmentDepot = React.useMemo(() => {
    return (
      officerAvailableDepots.find((d) => d.id === selectedDepotId) ||
      officerAvailableDepots[0] ||
      depots[0] ||
      null
    )
  }, [officerAvailableDepots, selectedDepotId, depots])

  // Matching Products for Autocomplete Search
  const matchingSearchProducts = React.useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase()
    if (!q) return []
    return catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
    )
  }, [catalog, productSearchQuery])

  // Calculation for Created Order
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
          id: `item-behalf-${idx + 1}`,
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

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setSelectedOfficerId("")
    setOfficerSearchQuery("")
    setSelectedCustomerId("")
    setCustomerSearchQuery("")
    setProductSearchQuery("")
    setAddedProductIds([])
    setProductQuantities({})
    setCreateOrderError("")
    setIsCreateModalOpen(true)
  }

  // Select Officer
  const handleSelectOfficer = (officer: SalesOfficerItem) => {
    setSelectedOfficerId(officer.id)
    setOfficerSearchQuery("")
    setSelectedCustomerId("")
    setCustomerSearchQuery("")
    const defaultDepot = getOfficerAssignedDepot(officer.id) || depots[0]
    if (defaultDepot) {
      setSelectedDepotId(defaultDepot.id)
    }
    setCreateOrderError("")
  }

  // Reset Officer
  const handleResetOfficer = () => {
    setSelectedOfficerId("")
    setOfficerSearchQuery("")
    setSelectedCustomerId("")
    setCustomerSearchQuery("")
    setCreateOrderError("")
  }

  // Select Customer
  const handleSelectCustomer = (cust: CustomerItem) => {
    setSelectedCustomerId(cust.id)
    setCustomerSearchQuery("")
    setCreateOrderError("")
  }

  // Reset Customer
  const handleResetCustomer = () => {
    setSelectedCustomerId("")
    setCustomerSearchQuery("")
    setCreateOrderError("")
  }

  // Add Product to list
  const handleAddProduct = (prod: Product) => {
    if (!addedProductIds.includes(prod.id)) {
      setAddedProductIds((prev) => [...prev, prod.id])
      setProductQuantities((prev) => ({
        ...prev,
        [prod.id]: prev[prod.id] || "10",
      }))
    } else {
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

  // Remove Product
  const handleRemoveProduct = (productId: string) => {
    setAddedProductIds((prev) => prev.filter((id) => id !== productId))
    setProductQuantities((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setCreateOrderError("")
  }

  // Set quantity
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

  // Step quantity
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

  // Submit Order on Behalf of MPO (Created as Pending)
  const handleSubmitOnBehalfOrder = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedOfficer) {
      setCreateOrderError("Please search and select the MPO first.")
      return
    }

    if (!selectedCustomer) {
      setCreateOrderError("Please search and select an assigned customer for this MPO.")
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

    if (!activeFulfillmentDepot) {
      setCreateOrderError("Please select a valid fulfillment depot for this order.")
      return
    }

    setIsSubmitting(true)

    const created = createOrder({
      customerId: selectedCustomer.id,
      customerCode: selectedCustomer.code,
      customerName: selectedCustomer.name,
      shopName: selectedCustomer.shopName,
      phone: selectedCustomer.phone,
      address: selectedCustomer.address,
      officerId: selectedOfficer.id,
      officerCode: selectedOfficer.code,
      officerName: selectedOfficer.name,
      depotId: activeFulfillmentDepot.id,
      depotName: activeFulfillmentDepot.name,
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
    showToast(`Order ${created.code} created on behalf of ${selectedOfficer.name}! (Status: Pending)`, "success")
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

      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Orders
          </h2>
          <p className="text-xs text-muted-foreground">
            Review customer orders submitted by MPOs, apply approval discounts, and assign bonus quantities.
          </p>
        </div>

        {/* Create Order on Behalf of MPO Button (Admin only) */}
        {currentRole === "admin" && (
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="cursor-pointer bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-xs flex items-center gap-2 self-start sm:self-auto text-xs sm:text-sm h-9 px-3.5"
          >
            <Plus className="size-4" />
            <span>Create Order on Behalf of MPO</span>
          </Button>
        )}
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
                  <span>Pending</span>
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
                Showing {filteredOrders.length} of {roleBaseOrders.length} orders
              </div>
            </div>

            {/* Coordinated Filters + Search Bar */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {/* 1. MPO Filter */}
              <div className="flex items-center gap-1.5 rounded border border-border/80 bg-muted/20 px-2 py-1">
                <UserCheck className="size-3.5 shrink-0 text-muted-foreground" />
                <select
                  aria-label="Filter by MPO"
                  value={officerFilter}
                  onChange={(e) => setOfficerFilter(e.target.value)}
                  className="h-7 w-full bg-transparent text-xs text-foreground outline-none cursor-pointer"
                >
                  <option value="all">All MPOs</option>
                  {visibleOfficers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} ({off.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Search Bar */}
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoice ID, customer, shop, officer..."
                  className="h-9 pl-8 text-xs"
                />
              </div>
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
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Customer & Shop
                  </th>
                  <th scope="col" className="px-4 py-3">
                    MPO
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Total Amount
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Status
                  </th>
                  <th scope="col" className="w-48 px-4 py-3 text-right">
                    Actions
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

                        {/* Sales Officer */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="font-medium text-foreground">{order.officerName}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{order.officerCode}</div>
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
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Only Admin can Approve or Cancel pending orders */}
                            {isPending && currentRole === "admin" ? (
                              <>
                                <Button
                                  type="button"
                                  size="xs"
                                  onClick={() => handleOpenApproveModal(order)}
                                  className="cursor-pointer gap-1 bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-medium shadow-2xs"
                                >
                                  <Check className="size-3" />
                                  <span>Approve</span>
                                </Button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => setCancellingOrder(order)}
                                  className="cursor-pointer gap-1 text-destructive hover:bg-destructive/10 hover:text-destructive text-[11px] font-medium"
                                >
                                  <X className="size-3" />
                                  <span>Cancel</span>
                                </Button>
                              </>
                            ) : (
                              /* View Invoice for All other roles & Non-Pending states */
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                onClick={() => setSelectedInvoiceOrder(order)}
                                className="cursor-pointer gap-1 text-[11px] font-medium"
                              >
                                <Receipt className="size-3 text-muted-foreground" />
                                <span>View Invoice</span>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-xs text-muted-foreground">
                      No orders found matching your selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 1. ORDER DETAIL / INVOICE MODAL VIEW                      */}
      {/* ========================================================= */}
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

            {/* Invoice Printable Sheet Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-card text-card-foreground print:p-0">
              {/* Brand Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-5 gap-4">
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
                      <Clock className="size-3" /> Pending Review
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
                {selectedInvoiceOrder.cancelledAt && (
                  <div className="text-[11px] text-destructive">
                    Cancelled On: <span className="font-medium">{selectedInvoiceOrder.cancelledAt}</span>
                  </div>
                )}
              </div>

              {/* Customer & Order Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border border-border/80 bg-card p-4 text-xs">
                {/* Customer Information */}
                <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Bill To / Customer Information
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

                {/* Sales Officer & Depot Details */}
                <div className="space-y-1.5 sm:pl-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Fulfillment & Representative
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">MPO: </span>
                    <span className="font-semibold text-foreground">{selectedInvoiceOrder.officerName}</span>
                    <span className="ml-1 font-mono text-[10px] text-muted-foreground">({selectedInvoiceOrder.officerCode})</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Fulfillment Depot: </span>
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
                        <th scope="col" className="w-10 px-3 py-2 text-center">
                          SL
                        </th>
                        <th scope="col" className="px-3 py-2">
                          Product Code
                        </th>
                        <th scope="col" className="px-3 py-2">
                          Product Name
                        </th>
                        <th scope="col" className="px-3 py-2">
                          Pack Size
                        </th>
                        <th scope="col" className="px-3 py-2 text-center">
                          Quantity
                        </th>
                        <th scope="col" className="px-3 py-2 text-right">
                          Unit Price (৳)
                        </th>
                        <th scope="col" className="px-3 py-2 text-right">
                          Total (৳)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {selectedInvoiceOrder.items.map((item, idx) => (
                        <tr key={item.id} className="transition-colors hover:bg-muted/20">
                          <td className="px-3 py-2 text-center font-medium text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="px-3 py-2 font-mono text-[11px] font-medium text-primary">
                            {item.productCode}
                          </td>
                          <td className="px-3 py-2 font-semibold text-foreground">
                            {item.productName}
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">
                            {item.packSize}
                          </td>
                          <td className="px-3 py-2 text-center font-mono font-bold text-foreground">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                            ৳ {item.unitPrice.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                            ৳ {item.totalPrice.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bonus Products Section (if any assigned) */}
              {selectedInvoiceOrder.bonusItems && selectedInvoiceOrder.bonusItems.length > 0 && (
                <div className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Gift className="size-3.5" />
                    <span>Bonus Products Assigned</span>
                  </div>
                  <div className="overflow-x-auto rounded border border-primary/20 bg-card">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-primary/10 bg-primary/10 text-[10px] font-semibold text-primary uppercase">
                        <tr>
                          <th scope="col" className="w-10 px-3 py-2 text-center">SL</th>
                          <th scope="col" className="px-3 py-2">Product Code</th>
                          <th scope="col" className="px-3 py-2">Bonus Product Name</th>
                          <th scope="col" className="px-3 py-2">Pack Size</th>
                          <th scope="col" className="px-3 py-2 text-right">Bonus Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {selectedInvoiceOrder.bonusItems.map((bonus, bIdx) => (
                          <tr key={bonus.id}>
                            <td className="px-3 py-1.5 text-center text-muted-foreground font-mono">{bIdx + 1}</td>
                            <td className="px-3 py-1.5 font-mono text-primary font-medium">{bonus.productCode}</td>
                            <td className="px-3 py-1.5 font-semibold text-foreground">{bonus.productName}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{bonus.packSize}</td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold text-primary">
                              +{bonus.quantity}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Financial Calculation Box */}
              <div className="flex justify-end pt-2">
                <div className="w-full max-w-xs space-y-2 rounded-md border border-border bg-muted/20 p-3.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold text-foreground">
                      ৳ {selectedInvoiceOrder.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Officer Discount */}
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Officer Discount ({selectedInvoiceOrder.officerDiscountPercent ?? 2.5}%):</span>
                    <span className="font-mono font-semibold text-primary">
                      - ৳ {((selectedInvoiceOrder.subtotal * (selectedInvoiceOrder.officerDiscountPercent ?? 2.5)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Admin Additional Discount if any */}
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

            {/* Modal Bottom Bar */}
            <div className="flex items-center justify-between border-t border-border/80 bg-muted/20 px-5 py-3">
              <div>
                {selectedInvoiceOrder.status === "Pending" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const o = selectedInvoiceOrder
                      setSelectedInvoiceOrder(null)
                      handleOpenApproveModal(o)
                    }}
                    className="cursor-pointer gap-1.5 bg-primary text-primary-foreground font-medium"
                  >
                    <Check className="size-4" />
                    <span>Proceed to Approve</span>
                  </Button>
                )}
              </div>
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

      {/* ========================================================= */}
      {/* 2. ADMIN ORDER APPROVAL MODAL (FULL INVOICE + CONTROLS)   */}
      {/* ========================================================= */}
      {approvingOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="approve-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={() => setApprovingOrder(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-3xl rounded-lg border border-border bg-card shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header / Toolbar */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-5 py-3">
              <div className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                <div>
                  <h3 id="approve-modal-title" className="text-sm font-semibold text-foreground">
                    Approve Order &mdash; {approvingOrder.code}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Review the complete invoice, apply discount & bonus items, then confirm approval.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setApprovingOrder(null)}
                aria-label="Cancel"
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Scrollable Body: Invoice View + Approval Controls */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 bg-card text-card-foreground">
              {/* --- SECTION 1: FULL INVOICE VIEW --- */}
              <div className="space-y-5 rounded-lg border border-border/80 bg-muted/5 p-4 sm:p-5">
                {/* Brand Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center">
                      <Image
                        src="/logo.jpeg"
                        alt="Eakin Animal Health Logo"
                        width={150}
                        height={40}
                        className="h-9 w-auto object-contain"
                        priority
                      />
                    </div>
                    <div>
                      <h1 className="text-sm font-bold tracking-tight text-foreground">
                        Eakin Animal Health Ltd.
                      </h1>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <div className="inline-block rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-700 dark:text-amber-400">
                      PENDING REVIEW
                    </div>
                    <div className="mt-1 font-mono text-xs font-bold text-foreground">
                      {approvingOrder.code}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Date: {approvingOrder.date}
                    </div>
                  </div>
                </div>

                {/* Customer & Fulfillment Metadata Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border border-border/80 bg-card p-3.5 text-xs">
                  {/* Customer Information */}
                  <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Bill To / Customer Information
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      {approvingOrder.shopName}
                    </div>
                    <div className="font-medium text-foreground">
                      Proprietor: {approvingOrder.customerName}
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                      <Store className="size-3 text-muted-foreground" />
                      <span>Customer Code: {approvingOrder.customerCode}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-[11px]">
                      <Phone className="size-3 text-muted-foreground" />
                      <span>{approvingOrder.phone}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-muted-foreground text-[11px]">
                      <MapPin className="size-3 text-muted-foreground mt-0.5 shrink-0" />
                      <span>{approvingOrder.address}</span>
                    </div>
                  </div>

                  {/* Sales Officer & Depot Details */}
                  <div className="space-y-1.5 sm:pl-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Fulfillment & Representative
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">MPO: </span>
                      <span className="font-semibold text-foreground">{approvingOrder.officerName}</span>
                      <span className="ml-1 font-mono text-[10px] text-muted-foreground">({approvingOrder.officerCode})</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Fulfillment Depot: </span>
                      <span className="font-semibold text-foreground">{approvingOrder.depotName}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Order Items: </span>
                      <span className="font-medium text-foreground">{approvingOrder.items.length} Products ({approvingOrder.totalItems} Units)</span>
                    </div>
                  </div>
                </div>

                {/* Purchased Products Table */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-foreground">Purchased Products</div>
                  <div className="overflow-x-auto rounded border border-border bg-card">
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
                        {approvingOrder.items.map((item, idx) => (
                          <tr key={item.id} className="transition-colors hover:bg-muted/20">
                            <td className="px-3 py-2 text-center font-medium text-muted-foreground font-mono">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-2 font-mono text-[11px] font-medium text-primary">
                              {item.productCode}
                            </td>
                            <td className="px-3 py-2 font-semibold text-foreground">
                              {item.productName}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">
                              {item.packSize}
                            </td>
                            <td className="px-3 py-2 text-center font-mono font-bold text-foreground">
                              {item.quantity}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-muted-foreground">
                              ৳ {item.unitPrice.toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                              ৳ {item.totalPrice.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: APPROVAL ADJUSTMENTS (DISCOUNT & BONUS) --- */}
              <form id="approve-order-form" onSubmit={handleConfirmApproval} noValidate className="space-y-4">
                {approvalError && (
                  <div className="rounded border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                    {approvalError}
                  </div>
                )}

                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider">
                      Approval Adjustments & Pricing
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Officer discount is received from submission; add extra admin discount as needed.
                    </div>
                  </div>

                  {/* 1. Discount Setting Grid: Officer Discount + Admin Additional Discount */}
                  <div className="rounded-md border border-border p-3.5 space-y-3 bg-card shadow-2xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Left: Officer Submitted Discount (Fixed) */}
                      <div className="rounded-md border border-border/80 bg-muted/20 p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <UserCheck className="size-3.5 text-primary" />
                            <span>MPO Discount</span>
                          </span>
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            From MPO
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Submitted by {approvingOrder.officerName}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono text-base font-bold text-foreground">
                            {approvalCalculations.officerDiscountPercent}%
                          </span>
                          <span className="font-mono text-xs font-semibold text-muted-foreground">
                            - ৳ {approvalCalculations.officerDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Right: Additional Admin Discount (Input) */}
                      <div className="rounded-md border border-primary/40 bg-primary/5 p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="approvalAdminDiscountInput" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                            <Percent className="size-3.5 text-primary" />
                            <span>Additional Admin Discount</span>
                          </Label>
                          <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            Admin Control
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="relative w-28">
                            <Input
                              id="approvalAdminDiscountInput"
                              type="number"
                              step="0.5"
                              min="0"
                              max="100"
                              value={approvalAdminDiscountPercent}
                              onChange={(e) => {
                                setApprovalAdminDiscountPercent(e.target.value)
                                setApprovalError("")
                              }}
                              className="h-8 text-xs font-mono font-bold pr-7 bg-card"
                            />
                            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                              %
                            </span>
                          </div>

                          {/* Quick percentage chips */}
                          <div className="flex items-center gap-1">
                            {["0", "1", "2.5", "5"].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setApprovalAdminDiscountPercent(pct)}
                                className={`rounded border px-1.5 py-0.5 text-[10px] font-medium cursor-pointer transition-colors ${
                                  approvalAdminDiscountPercent === pct
                                    ? "border-primary bg-primary text-primary-foreground font-bold"
                                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                                }`}
                              >
                                +{pct}%
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="text-[11px] text-muted-foreground">
                          Additional deduction: <strong className="font-mono text-foreground">- ৳ {approvalCalculations.adminDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Total Applied Discount Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded bg-muted/40 px-3 py-2 text-xs gap-1">
                      <span className="font-medium text-muted-foreground">
                        Total Applied Discount:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">
                          {approvalCalculations.officerDiscountPercent}% (Officer) + {approvalCalculations.adminDiscountPercent}% (Admin) = {approvalCalculations.totalDiscountPercent}%
                        </span>
                        <span className="font-mono font-bold text-primary">
                          (- ৳ {approvalCalculations.totalDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Bonus Products Setting */}
                  <div className="rounded-md border border-border p-3.5 space-y-3 bg-card shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Gift className="size-3.5 text-primary" />
                        <span>Bonus Products & Quantities</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={handleAddBonusRow}
                        className="cursor-pointer gap-1 text-[11px] font-medium"
                      >
                        <Plus className="size-3" />
                        <span>Add Bonus Product</span>
                      </Button>
                    </div>

                    {bonusRows.length === 0 ? (
                      <div className="rounded border border-dashed border-border/80 p-3 text-center text-xs text-muted-foreground">
                        No bonus items added. Click &quot;Add Bonus Product&quot; to award complimentary promo units.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {bonusRows.map((row, idx) => {
                          const selectedProduct = catalog.find((p) => p.id === row.productId)

                          return (
                            <div
                              key={row.rowId}
                              className="flex items-center gap-2 rounded border border-border/80 bg-muted/20 p-2 text-xs"
                            >
                              <span className="w-5 text-center font-mono text-muted-foreground font-semibold">
                                {idx + 1}.
                              </span>

                              {/* Product select */}
                              <div className="flex-1">
                                <select
                                  aria-label="Select Bonus Product"
                                  value={row.productId}
                                  onChange={(e) => handleUpdateBonusRow(row.rowId, "productId", e.target.value)}
                                  className="h-8 w-full rounded border border-border bg-card px-2 text-xs font-medium text-foreground outline-none cursor-pointer"
                                >
                                  {catalog.map((p) => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({p.packSize}) &mdash; {p.code}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Bonus Quantity */}
                              <div className="w-24">
                                <Input
                                  type="number"
                                  min="1"
                                  value={row.quantity}
                                  onChange={(e) => handleUpdateBonusRow(row.rowId, "quantity", e.target.value)}
                                  placeholder="Qty"
                                  className="h-8 text-xs font-mono font-bold"
                                />
                              </div>

                              {/* Pack Size Display */}
                              <span className="w-16 text-[11px] text-muted-foreground font-mono truncate">
                                {selectedProduct?.packSize || ""}
                              </span>

                              {/* Remove button */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleRemoveBonusRow(row.rowId)}
                                className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* 3. Real-Time Financial Summary Box */}
                  <div className="flex justify-end">
                    <div className="w-full sm:max-w-xs space-y-2 rounded-md border border-border bg-card p-3.5 text-xs shadow-2xs">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Order Subtotal:</span>
                        <span className="font-mono font-semibold text-foreground">
                          ৳ {approvalCalculations.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Officer Discount ({approvalCalculations.officerDiscountPercent}%):</span>
                        <span className="font-mono font-semibold text-primary">
                          - ৳ {approvalCalculations.officerDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      {approvalCalculations.adminDiscountPercent > 0 && (
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span>Admin Addl. Discount ({approvalCalculations.adminDiscountPercent}%):</span>
                          <span className="font-mono font-semibold text-primary">
                            - ৳ {approvalCalculations.adminDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between font-semibold text-primary border-t border-border/60 pt-1">
                        <span>Total Discount ({approvalCalculations.totalDiscountPercent}%):</span>
                        <span className="font-mono">
                          - ৳ {approvalCalculations.totalDiscountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="border-t border-border pt-2 flex items-center justify-between font-bold text-sm text-foreground">
                        <span>Grand Total:</span>
                        <span className="font-mono text-base text-primary">
                          ৳ {approvalCalculations.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Bottom Bar */}
            <div className="flex items-center justify-between border-t border-border/80 bg-muted/20 px-5 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApprovingOrder(null)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="approve-order-form"
                size="sm"
                className="cursor-pointer gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs text-xs"
              >
                <Check className="size-4" />
                <span>Confirm & Approve Order</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CANCEL ORDER CONFIRMATION MODAL                        */}
      {/* ========================================================= */}
      {cancellingOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-order-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setCancellingOrder(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 id="cancel-order-title" className="text-sm font-semibold text-foreground">
                  Cancel Order {cancellingOrder.code}?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to cancel this order for{" "}
                  <span className="font-semibold text-foreground">{cancellingOrder.customerName}</span>?
                  This action will mark the order as Cancelled.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCancellingOrder(null)}
                className="cursor-pointer text-xs"
              >
                Go Back
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmCancel}
                className="cursor-pointer text-xs font-medium"
              >
                Confirm Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. CREATE ORDER ON BEHALF OF MPO MODAL                    */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-behalf-order-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
        >
          <div
            onClick={() => setIsCreateModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-3xl rounded-xl border border-border bg-card shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingCart className="size-5" />
                </div>
                <div>
                  <h3 id="create-behalf-order-title" className="text-sm font-bold text-foreground">
                    Create Order on Behalf of MPO
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Search MPO, select customer, search & add multiple products to submit a pending order.
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

            {/* Modal Body Form */}
            <form onSubmit={handleSubmitOnBehalfOrder} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Error notice */}
              {createOrderError && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{createOrderError}</span>
                </div>
              )}

              {/* Step 1: MPO (Sales Officer) Selection */}
              {!selectedOfficer ? (
                <div className="space-y-2 rounded-lg border border-border bg-muted/10 p-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="size-3.5 text-primary" />
                      Step 1: Search & Select MPO *
                    </Label>
                    <span className="text-[11px] text-muted-foreground">
                      {officers.length} active MPOs in system
                    </span>
                  </div>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      autoFocus
                      placeholder="Type MPO name, officer code (e.g. OFF-001), phone, or area..."
                      value={officerSearchQuery}
                      onChange={(e) => setOfficerSearchQuery(e.target.value)}
                      className="pl-9 text-xs"
                    />

                    {/* MPO Autocomplete Dropdown List */}
                    {officerSearchQuery.trim() && (
                      <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
                        {matchingSearchOfficers.length === 0 ? (
                          <div className="p-4 text-center text-xs text-muted-foreground">
                            No MPO found matching &ldquo;{officerSearchQuery}&rdquo;.
                          </div>
                        ) : (
                          matchingSearchOfficers.map((off) => (
                            <button
                              key={off.id}
                              type="button"
                              onClick={() => handleSelectOfficer(off)}
                              className="w-full flex items-center justify-between p-3 text-left text-xs transition-colors hover:bg-muted/50 border-b border-border/50 last:border-0 cursor-pointer"
                            >
                              <div>
                                <div className="font-bold text-foreground text-xs">{off.name}</div>
                                <div className="text-muted-foreground flex items-center gap-1.5 mt-0.5 text-[11px]">
                                  <span className="font-mono text-primary font-semibold">{off.code}</span>
                                  <span>&bull;</span>
                                  <span>{off.areaName || "Assigned Area"}</span>
                                </div>
                                <div className="text-muted-foreground text-[10px] mt-0.5">
                                  {off.phone} &bull; {off.email}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-[10px] text-muted-foreground uppercase font-medium block">
                                  Lifetime Orders
                                </span>
                                <span className="font-bold text-foreground font-mono text-xs">
                                  {off.totalOrders} Orders
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
                /* Selected MPO Snapshot Banner */
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-primary/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        <CheckCircle2 className="size-3.5 text-primary" />
                        MPO Selected
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetOfficer}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/10 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="size-3" />
                      <span>Change MPO</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-muted-foreground block uppercase font-medium text-[10px]">
                        MPO Officer
                      </span>
                      <span className="font-bold text-foreground text-xs mt-0.5 block">
                        {selectedOfficer.name}
                      </span>
                      <span className="text-muted-foreground text-[11px] font-mono">
                        Code: <strong className="text-primary">{selectedOfficer.code}</strong>
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block uppercase font-medium text-[10px]">
                        Assigned Area & Contact
                      </span>
                      <span className="text-foreground text-xs font-medium mt-0.5 block">
                        {selectedOfficer.areaName || "Main Territory"}
                      </span>
                      <span className="text-muted-foreground text-[11px] font-mono">
                        {selectedOfficer.phone}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block uppercase font-medium text-[10px]">
                        Assigned RM / Depot
                      </span>
                      <span className="font-semibold text-foreground text-xs mt-0.5 block">
                        {selectedOfficer.rmName || "Regional Manager"}
                      </span>
                      <span className="text-muted-foreground text-[11px]">
                        Depot: {activeFulfillmentDepot?.name || "Primary Depot"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Customer Selection (Search Autocomplete & Snapshot Banner) */}
              {selectedOfficer && (
                !selectedCustomer ? (
                  <div className="space-y-2 rounded-lg border border-border bg-muted/10 p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <User className="size-3.5 text-primary" />
                        Step 2: Search & Select Customer *
                      </Label>
                      <span className="text-[11px] text-muted-foreground">
                        {officerCustomers.length} assigned customers for {selectedOfficer.name}
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
                          Contact & Region
                        </span>
                        <span className="text-foreground text-xs font-mono mt-0.5 block">
                          {selectedCustomer.phone}
                        </span>
                        <span className="text-muted-foreground text-[11px] block truncate">
                          Area: <strong className="text-foreground">{selectedCustomer.areaName || selectedOfficer?.areaName}</strong>
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
                )
              )}

              {/* Step 3: Fulfillment Depot Selection */}
              {selectedOfficer && (
                <div className="rounded-lg border border-border bg-card p-4 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <div>
                      <Label htmlFor="behalf-order-depot-select" className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="size-3.5 text-primary" />
                        Fulfillment Depot *
                      </Label>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Select which depot fulfills this order. Live product availability below is based on this depot&apos;s stock.
                      </p>
                    </div>
                    {officerAvailableDepots.length > 1 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-semibold text-primary w-fit">
                        {officerAvailableDepots.length} RM Depots Available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground w-fit">
                        Primary RM Depot
                      </span>
                    )}
                  </div>

                  <div className="pt-1">
                    <select
                      id="behalf-order-depot-select"
                      value={selectedDepotId}
                      onChange={(e) => setSelectedDepotId(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary font-medium"
                    >
                      {officerAvailableDepots.map((depot) => (
                        <option key={depot.id} value={depot.id}>
                          {depot.name} ({depot.code}) - {depot.location}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Step 4: Product Search & Dynamic Order Line Items */}
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
                        placeholder="Type product name or SKU code to search and add..."
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
                                        className="size-7 rounded-sm cursor-pointer"
                                      >
                                        <Minus className="size-3" />
                                      </Button>
                                      <Input
                                        type="number"
                                        min="1"
                                        value={qtyVal}
                                        onChange={(e) => handleSetProductQuantity(prod.id, e.target.value)}
                                        className="h-7 w-16 text-center text-xs font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="icon-xs"
                                        onClick={() => handleStepQuantity(prod.id, 1)}
                                        className="size-7 rounded-sm cursor-pointer"
                                      >
                                        <Plus className="size-3" />
                                      </Button>
                                    </div>
                                  </td>

                                  {/* Line Total */}
                                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-foreground">
                                    ৳ {lineTotal.toLocaleString()}
                                  </td>

                                  {/* Remove Action */}
                                  <td className="px-2 py-2.5 text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => handleRemoveProduct(prod.id)}
                                      className="size-7 text-muted-foreground hover:text-destructive cursor-pointer"
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

              {/* Step 5: Order Financial Calculation Summary */}
              {selectedCustomer && addedProductIds.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
                  <div className="rounded-md bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-800 dark:text-amber-400">
                    <p className="font-semibold flex items-center gap-1.5">
                      <Clock className="size-3.5 text-amber-600" />
                      Status upon creation: Pending
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      This order will be listed immediately under Pending orders for standard Admin review & approval.
                    </p>
                  </div>

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
                      <span>Standard MPO Discount (2.5%):</span>
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
                  disabled={isSubmitting || !selectedOfficer || !selectedCustomer || calculatedNewOrder.items.length === 0}
                  className="cursor-pointer bg-primary text-primary-foreground font-medium hover:bg-primary/90 shadow-xs"
                >
                  <span>Submit Order on Behalf of MPO</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
