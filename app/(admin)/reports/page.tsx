"use client"

import * as React from "react"
import Link from "next/link"
import {
  BarChart3,
  TrendingUp,
  Banknote,
  AlertCircle,
  RotateCcw,
  Boxes,
  ShoppingCart,
  Filter,
  RefreshCw,
  Download,
  Printer,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  FileText,
  Calendar,
  Building2,
  MapPin,
  UserRound,
  UsersRound,
  UserCheck,
  Users,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowUpDown,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  initialOrders,
  initialCollections,
  initialProductReturns,
  initialDepots,
  initialDepotStocks,
  initialAreasWithDepot,
  initialRMs,
  initialAMs,
  initialOfficers,
  initialCustomers,
  productCatalog,
  type Order,
  type CollectionItem,
  type ProductReturnItem,
  type Depot,
  type AreaItem,
  type RMItem,
  type AMItem,
  type SalesOfficerItem,
  type CustomerItem,
  type Product,
  type OrderStatus,
  type DepotStockItem,
} from "@/lib/mock-data"
import { isDateInRange } from "@/lib/utils"

type ReportType =
  | "sales"
  | "collections"
  | "outstanding"
  | "returns"

type DatePreset =
  | "all"
  | "today"
  | "yesterday"
  | "this-week"
  | "this-month"
  | "last-month"
  | "custom"

export default function ReportsPage() {
  // Master Datasets from single source of truth
  const [orders] = React.useState<Order[]>(initialOrders)
  const [collections] = React.useState<CollectionItem[]>(initialCollections)
  const [returns] = React.useState<ProductReturnItem[]>(initialProductReturns)
  const [depots] = React.useState<Depot[]>(initialDepots)
  const [areas] = React.useState<AreaItem[]>(initialAreasWithDepot)
  const [rms] = React.useState<RMItem[]>(initialRMs)
  const [ams] = React.useState<AMItem[]>(initialAMs)
  const [officers] = React.useState<SalesOfficerItem[]>(initialOfficers)
  const [customers] = React.useState<CustomerItem[]>(initialCustomers)
  const [catalog] = React.useState<Product[]>(productCatalog)
  const [depotStocks] = React.useState<Record<string, DepotStockItem[]>>(initialDepotStocks)

  // Active Report Tab
  const [activeReport, setActiveReport] = React.useState<ReportType>("sales")

  // Filter States
  const [datePreset, setDatePreset] = React.useState<DatePreset>("all")
  const [customStartDate, setCustomStartDate] = React.useState<string>("")
  const [customEndDate, setCustomEndDate] = React.useState<string>("")

  const [depotFilter, setDepotFilter] = React.useState<string>("all")
  const [areaFilter, setAreaFilter] = React.useState<string>("all")
  const [rmFilter, setRmFilter] = React.useState<string>("all")
  const [amFilter, setAmFilter] = React.useState<string>("all")
  const [officerFilter, setOfficerFilter] = React.useState<string>("all")
  const [customerFilter, setCustomerFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [productFilter, setProductFilter] = React.useState<string>("all")

  // Table Search, Sorting and Pagination
  const [tableSearch, setTableSearch] = React.useState<string>("")
  const [sortField, setSortField] = React.useState<string>("date")
  const [sortAsc, setSortAsc] = React.useState<boolean>(false)
  const [currentPage, setCurrentPage] = React.useState<number>(1)
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10)

  // Filters Panel Collapse state
  const [isFilterCollapsed, setIsFilterCollapsed] = React.useState<boolean>(false)

  // Detail Modals
  const [modalInvoice, setModalInvoice] = React.useState<Order | null>(null)
  const [modalReceipt, setModalReceipt] = React.useState<CollectionItem | null>(null)
  const [modalReturn, setModalReturn] = React.useState<ProductReturnItem | null>(null)

  // ====================================================
  // DYNAMIC FILTER HIERARCHY SCOPING
  // ====================================================
  // 1. Filtered Areas based on selected Depot
  const availableAreas = React.useMemo(() => {
    if (depotFilter === "all") return areas
    return areas.filter((a) => a.depotId === depotFilter)
  }, [areas, depotFilter])

  // 2. Filtered RMs based on Depot/Area
  const availableRMs = React.useMemo(() => {
    let list = rms
    if (areaFilter !== "all") {
      list = list.filter((r) => r.areaId === areaFilter || (r.regionalOfficeId && availableAreas.some(a => a.id === areaFilter && a.regionalOfficeId === r.regionalOfficeId)))
    } else if (depotFilter !== "all") {
      const allowedAreaIds = availableAreas.map((a) => a.id)
      list = list.filter((r) => (r.depotIds && r.depotIds.includes(depotFilter)) || (r.areaId && allowedAreaIds.includes(r.areaId)))
    }
    return list
  }, [rms, areaFilter, depotFilter, availableAreas])

  // 3. Filtered AMs based on RM/Area/Depot
  const availableAMs = React.useMemo(() => {
    let list = ams
    if (rmFilter !== "all") {
      list = list.filter((a) => a.rmId === rmFilter)
    } else if (areaFilter !== "all") {
      list = list.filter((a) => a.areaId === areaFilter)
    } else if (depotFilter !== "all") {
      const allowedAreaIds = availableAreas.map((a) => a.id)
      list = list.filter((a) => allowedAreaIds.includes(a.areaId))
    }
    return list
  }, [ams, rmFilter, areaFilter, depotFilter, availableAreas])

  // 4. Filtered Sales Officers based on AM/RM/Area
  const availableOfficers = React.useMemo(() => {
    let list = officers
    if (amFilter !== "all") {
      list = list.filter((o) => o.amId === amFilter)
    } else if (rmFilter !== "all") {
      list = list.filter((o) => o.rmId === rmFilter)
    } else if (areaFilter !== "all") {
      list = list.filter((o) => o.areaId === areaFilter)
    } else if (depotFilter !== "all") {
      const allowedAreaIds = availableAreas.map((a) => a.id)
      list = list.filter((o) => allowedAreaIds.includes(o.areaId))
    }
    return list
  }, [officers, amFilter, rmFilter, areaFilter, depotFilter, availableAreas])

  // 5. Filtered Customers based on Officer/Area
  const availableCustomers = React.useMemo(() => {
    let list = customers
    if (officerFilter !== "all") {
      list = list.filter((c) => c.officerId === officerFilter)
    } else if (amFilter !== "all") {
      list = list.filter((c) => c.amId === amFilter)
    } else if (rmFilter !== "all") {
      list = list.filter((c) => c.rmId === rmFilter)
    } else if (areaFilter !== "all") {
      list = list.filter((c) => c.areaId === areaFilter)
    }
    return list
  }, [customers, officerFilter, amFilter, rmFilter, areaFilter])

  // Auto-reset lower filters if parent changes and child is no longer valid
  React.useEffect(() => {
    if (areaFilter !== "all" && !availableAreas.some((a) => a.id === areaFilter)) {
      setAreaFilter("all")
    }
  }, [availableAreas, areaFilter])

  React.useEffect(() => {
    if (rmFilter !== "all" && !availableRMs.some((r) => r.id === rmFilter)) {
      setRmFilter("all")
    }
  }, [availableRMs, rmFilter])

  React.useEffect(() => {
    if (amFilter !== "all" && !availableAMs.some((a) => a.id === amFilter)) {
      setAmFilter("all")
    }
  }, [availableAMs, amFilter])

  React.useEffect(() => {
    if (officerFilter !== "all" && !availableOfficers.some((o) => o.id === officerFilter)) {
      setOfficerFilter("all")
    }
  }, [availableOfficers, officerFilter])

  React.useEffect(() => {
    if (customerFilter !== "all" && !availableCustomers.some((c) => c.id === customerFilter)) {
      setCustomerFilter("all")
    }
  }, [availableCustomers, customerFilter])

  // Reset all filters function
  const handleResetFilters = () => {
    setDatePreset("all")
    setCustomStartDate("")
    setCustomEndDate("")
    setDepotFilter("all")
    setAreaFilter("all")
    setRmFilter("all")
    setAmFilter("all")
    setOfficerFilter("all")
    setCustomerFilter("all")
    setStatusFilter("all")
    setProductFilter("all")
    setTableSearch("")
    setCurrentPage(1)
  }

  // Active filters count
  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (datePreset !== "all") count++
    if (depotFilter !== "all") count++
    if (areaFilter !== "all") count++
    if (rmFilter !== "all") count++
    if (amFilter !== "all") count++
    if (officerFilter !== "all") count++
    if (customerFilter !== "all") count++
    if (statusFilter !== "all") count++
    if (productFilter !== "all") count++
    return count
  }, [
    datePreset,
    depotFilter,
    areaFilter,
    rmFilter,
    amFilter,
    officerFilter,
    customerFilter,
    statusFilter,
    productFilter,
  ])

  // Helper to match Date Preset
  const matchesDate = React.useCallback(
    (dateStr: string) => {
      if (datePreset === "all") return true
      if (datePreset === "today") return dateStr.includes("05/09/2026")
      if (datePreset === "yesterday") return dateStr.includes("04/09/2026")
      if (datePreset === "this-week") return dateStr.includes("/09/2026")
      if (datePreset === "this-month") return dateStr.includes("/09/2026")
      if (datePreset === "last-month") return dateStr.includes("/08/2026")
      if (datePreset === "custom") {
        return isDateInRange(dateStr, customStartDate, customEndDate)
      }
      return true
    },
    [datePreset, customStartDate, customEndDate]
  )

  // ====================================================
  // FILTERED DATASETS FOR EACH REPORT TYPE
  // ====================================================

  // 1. Filtered Sales / Orders
  const filteredOrders = React.useMemo(() => {
    return orders.filter((o) => {
      // Date filter
      if (!matchesDate(o.date)) return false

      // Hierarchy filters
      if (depotFilter !== "all" && o.depotId !== depotFilter) return false

      const cust = customers.find((c) => c.id === o.customerId)
      if (areaFilter !== "all" && cust?.areaId !== areaFilter) return false
      if (rmFilter !== "all" && cust?.rmId !== rmFilter) return false
      if (amFilter !== "all" && cust?.amId !== amFilter) return false
      if (officerFilter !== "all" && o.officerId !== officerFilter) return false
      if (customerFilter !== "all" && o.customerId !== customerFilter) return false

      // Status filter
      if (statusFilter !== "all" && o.status !== statusFilter) return false

      // Product filter
      if (productFilter !== "all") {
        const hasProduct = o.items.some((it) => it.productId === productFilter)
        if (!hasProduct) return false
      }

      // Search filter
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim()
        const match =
          o.code.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.officerName.toLowerCase().includes(q) ||
          o.depotName.toLowerCase().includes(q) ||
          o.shopName.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [
    orders,
    customers,
    matchesDate,
    depotFilter,
    areaFilter,
    rmFilter,
    amFilter,
    officerFilter,
    customerFilter,
    statusFilter,
    productFilter,
    tableSearch,
  ])

  // 2. Filtered Collections
  const filteredCollections = React.useMemo(() => {
    return collections.filter((col) => {
      if (!matchesDate(col.date)) return false

      const cust = customers.find((c) => c.id === col.customerId)
      if (!cust) return true

      if (depotFilter !== "all") {
        const areaObj = areas.find((a) => a.id === cust.areaId)
        if (areaObj?.depotId !== depotFilter) return false
      }
      if (areaFilter !== "all" && cust.areaId !== areaFilter) return false
      if (rmFilter !== "all" && cust.rmId !== rmFilter) return false
      if (amFilter !== "all" && cust.amId !== amFilter) return false
      if (officerFilter !== "all" && cust.officerId !== officerFilter) return false
      if (customerFilter !== "all" && col.customerId !== customerFilter) return false

      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim()
        const match =
          col.code.toLowerCase().includes(q) ||
          col.customerName.toLowerCase().includes(q) ||
          col.shopName.toLowerCase().includes(q) ||
          (col.paymentMethod && col.paymentMethod.toLowerCase().includes(q))
        if (!match) return false
      }

      return true
    })
  }, [
    collections,
    customers,
    areas,
    matchesDate,
    depotFilter,
    areaFilter,
    rmFilter,
    amFilter,
    officerFilter,
    customerFilter,
    tableSearch,
  ])

  // 3. Filtered Customers / Outstanding Due
  const filteredDueCustomers = React.useMemo(() => {
    return customers.filter((cust) => {
      if (depotFilter !== "all") {
        const areaObj = areas.find((a) => a.id === cust.areaId)
        if (areaObj?.depotId !== depotFilter) return false
      }
      if (areaFilter !== "all" && cust.areaId !== areaFilter) return false
      if (rmFilter !== "all" && cust.rmId !== rmFilter) return false
      if (amFilter !== "all" && cust.amId !== amFilter) return false
      if (officerFilter !== "all" && cust.officerId !== officerFilter) return false
      if (customerFilter !== "all" && cust.id !== customerFilter) return false

      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim()
        const match =
          cust.name.toLowerCase().includes(q) ||
          cust.code.toLowerCase().includes(q) ||
          cust.shopName.toLowerCase().includes(q) ||
          cust.officerName.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [
    customers,
    areas,
    depotFilter,
    areaFilter,
    rmFilter,
    amFilter,
    officerFilter,
    customerFilter,
    tableSearch,
  ])

  // 4. Filtered Returns
  const filteredReturns = React.useMemo(() => {
    return returns.filter((ret) => {
      if (!matchesDate(ret.date)) return false
      if (depotFilter !== "all" && ret.depotId !== depotFilter) return false

      const cust = customers.find((c) => c.id === ret.customerId)
      if (areaFilter !== "all" && cust?.areaId !== areaFilter) return false
      if (rmFilter !== "all" && cust?.rmId !== rmFilter) return false
      if (amFilter !== "all" && cust?.amId !== amFilter) return false
      if (officerFilter !== "all" && cust?.officerId !== officerFilter) return false
      if (customerFilter !== "all" && ret.customerId !== customerFilter) return false

      if (productFilter !== "all") {
        const hasProd = ret.items.some((it) => it.productId === productFilter)
        if (!hasProd) return false
      }

      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase().trim()
        const match =
          ret.code.toLowerCase().includes(q) ||
          ret.customerName.toLowerCase().includes(q) ||
          ret.depotName.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [
    returns,
    customers,
    matchesDate,
    depotFilter,
    areaFilter,
    rmFilter,
    amFilter,
    officerFilter,
    customerFilter,
    productFilter,
    tableSearch,
  ])

  // 5. Filtered Stock Items
  const filteredStockRows = React.useMemo(() => {
    const list: {
      depotId: string
      depotName: string
      item: DepotStockItem
      product: Product | undefined
    }[] = []

    Object.entries(depotStocks).forEach(([depId, stockList]) => {
      if (depotFilter !== "all" && depId !== depotFilter) return
      const depotObj = depots.find((d) => d.id === depId)
      const depName = depotObj ? depotObj.name : depId

      stockList.forEach((st) => {
        if (productFilter !== "all" && st.productId !== productFilter) return

        const prodObj = catalog.find((p) => p.id === st.productId)

        if (tableSearch.trim()) {
          const q = tableSearch.toLowerCase().trim()
          const match =
            st.productName.toLowerCase().includes(q) ||
            st.productCode.toLowerCase().includes(q) ||
            st.packSize.toLowerCase().includes(q) ||
            depName.toLowerCase().includes(q)
          if (!match) return
        }

        list.push({
          depotId: depId,
          depotName: depName,
          item: st,
          product: prodObj,
        })
      })
    })

    return list
  }, [depotStocks, depotFilter, productFilter, depots, catalog, tableSearch])

  // ====================================================
  // SUMMARY METRICS COMPUTATION FOR EACH REPORT
  // ====================================================
  const reportMetrics = React.useMemo(() => {
    // 1. Sales Metrics
    const approvedOrders = filteredOrders.filter((o) => o.status === "Approved")
    const totalSalesAmount = approvedOrders.reduce((sum, o) => sum + o.grandTotal, 0)
    const totalDiscountAmount = filteredOrders.reduce((sum, o) => sum + (o.discountAmount || 0), 0)
    const totalOrdersCount = filteredOrders.length

    // 2. Collection Metrics
    const totalCollectedAmount = filteredCollections.reduce((sum, c) => sum + c.amount, 0)
    const totalCollectionsCount = filteredCollections.length

    // 3. Outstanding Due Metrics
    const totalOutstandingDue = filteredDueCustomers.reduce(
      (sum, c) => sum + (c.outstandingBalance || 0),
      0
    )
    const customersWithDueCount = filteredDueCustomers.filter(
      (c) => (c.outstandingBalance || 0) > 0
    ).length

    // 4. Returns Metrics
    const totalReturnValue = filteredReturns.reduce((sum, r) => sum + r.totalReturnAmount, 0)
    const totalReturnedUnits = filteredReturns.reduce(
      (sum, r) => sum + r.totalReturnedQuantity,
      0
    )

    // 5. Stock Metrics
    const totalStockUnits = filteredStockRows.reduce((sum, r) => sum + r.item.quantity, 0)
    const totalBuyValuation = filteredStockRows.reduce((sum, r) => {
      const buyP = r.product?.buyPrice || 0
      return sum + r.item.quantity * buyP
    }, 0)
    const totalSellValuation = filteredStockRows.reduce((sum, r) => {
      const sellP = r.product?.sellPrice || r.product?.price || 0
      return sum + r.item.quantity * sellP
    }, 0)
    const lowStockAlerts = filteredStockRows.filter(
      (r) => r.item.quantity <= r.item.minThreshold
    ).length

    return {
      totalSalesAmount,
      totalDiscountAmount,
      totalOrdersCount,
      approvedOrdersCount: approvedOrders.length,
      totalCollectedAmount,
      totalCollectionsCount,
      totalOutstandingDue,
      customersWithDueCount,
      totalReturnValue,
      totalReturnedUnits,
      totalStockUnits,
      totalBuyValuation,
      totalSellValuation,
      lowStockAlerts,
    }
  }, [
    filteredOrders,
    filteredCollections,
    filteredDueCustomers,
    filteredReturns,
    filteredStockRows,
  ])

  // ====================================================
  // CSV EXPORT GENERATOR
  // ====================================================
  const handleExportCSV = () => {
    let csvContent = ""
    let fileName = `eakin-${activeReport}-report-${new Date().toISOString().slice(0, 10)}.csv`

    if (activeReport === "sales") {
      const headers = [
        "Invoice Code",
        "Date",
        "Customer Name",
        "Customer Code",
        "Shop Name",
        "MPO",
        "Depot",
        "Items Count",
        "Subtotal (BDT)",
        "Discount (BDT)",
        "Grand Total (BDT)",
        "Status",
      ]
      const rows = filteredOrders.map((o) => [
        `"${o.code}"`,
        `"${o.date}"`,
        `"${o.customerName}"`,
        `"${o.customerCode}"`,
        `"${o.shopName}"`,
        `"${o.officerName}"`,
        `"${o.depotName}"`,
        o.totalItems,
        o.subtotal,
        o.discountAmount,
        o.grandTotal,
        `"${o.status}"`,
      ])
      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    } else if (activeReport === "collections") {
      const headers = [
        "Date",
        "Customer Name",
        "Customer Code",
        "Shop Name",
        "Amount (BDT)",
        "Allocated Order",
        "Recorded By",
      ]
      const rows = filteredCollections.map((c) => [
        `"${c.date}"`,
        `"${c.customerName}"`,
        `"${c.customerCode}"`,
        `"${c.shopName}"`,
        c.amount,
        `"${c.allocations?.[0]?.orderCode || "Direct"}"`,
        `"${c.recordedBy || "Finance"}"`,
      ])
      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    } else if (activeReport === "outstanding") {
      const headers = [
        "Customer Code",
        "Customer Name",
        "Shop Name",
        "Phone",
        "Area",
        "MPO",
        "Outstanding Due (BDT)",
        "Total Orders",
        "Total Spent (BDT)",
      ]
      const rows = filteredDueCustomers.map((c) => [
        `"${c.code}"`,
        `"${c.name}"`,
        `"${c.shopName}"`,
        `"${c.phone}"`,
        `"${c.areaName}"`,
        `"${c.officerName}"`,
        c.outstandingBalance || 0,
        c.totalOrders || 0,
        c.totalSpent || 0,
      ])
      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    } else if (activeReport === "returns") {
      const headers = [
        "Date",
        "Customer Name",
        "Restocked Depot",
        "Total Units Returned",
        "Return Value (BDT)",
        "Recorded By",
      ]
      const rows = filteredReturns.map((r) => [
        `"${r.date}"`,
        `"${r.customerName}"`,
        `"${r.depotName}"`,
        r.totalReturnedQuantity,
        r.totalReturnAmount,
        `"${r.recordedBy}"`,
      ])
      csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print Handler
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Enterprise Reports & Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-dimensional reporting across sales, collections, customer dues, returns, order pipeline and depot stocks.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 1: HIERARCHICAL FILTER CONTROL PANEL */}
      {/* ==================================================== */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-3.5 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-primary" />
              <CardTitle className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Hierarchy & Operational Filters
              </CardTitle>
              {activeFiltersCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-0.2 text-[10px] font-bold text-primary-foreground">
                  {activeFiltersCount} Active
                </span>
              )}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsFilterCollapsed(!isFilterCollapsed)}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              {isFilterCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            </Button>
          </div>
        </CardHeader>

        {!isFilterCollapsed && (
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {/* 1. Date Range Filter */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Date Range
                </Label>
                <select
                  value={datePreset}
                  onChange={(e) => setDatePreset(e.target.value as DatePreset)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today (05/09/2026)</option>
                  <option value="yesterday">Yesterday (04/09/2026)</option>
                  <option value="this-week">This Week</option>
                  <option value="this-month">This Month (09/2026)</option>
                  <option value="last-month">Last Month (08/2026)</option>
                  <option value="custom">Custom Date Range</option>
                </select>
              </div>

              {/* 2. Depot Filter */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Depot
                </Label>
                <select
                  value={depotFilter}
                  onChange={(e) => setDepotFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">All Depots ({depots.length})</option>
                  {depots.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Area Filter (Scoped to Depot) */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Area / Territory
                </Label>
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">All Areas ({availableAreas.length})</option>
                  {availableAreas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 4. RM Filter */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Regional Manager (RM)
                </Label>
                <select
                  value={rmFilter}
                  onChange={(e) => setRmFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">All RMs ({availableRMs.length})</option>
                  {availableRMs.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. AM Filter */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Area Manager (AM)
                </Label>
                <select
                  value={amFilter}
                  onChange={(e) => setAmFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">All AMs ({availableAMs.length})</option>
                  {availableAMs.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 6. MPO Filter */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  MPO
                </Label>
                <select
                  value={officerFilter}
                  onChange={(e) => setOfficerFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">All MPOs ({availableOfficers.length})</option>
                  {availableOfficers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 7. Customer Filter */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Customer / Shop
                </Label>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">All Customers ({availableCustomers.length})</option>
                  {availableCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.shopName}
                    </option>
                  ))}
                </select>
              </div>

              {/* 8. Order Status Filter (For Sales/Orders reports) */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Order Status
                </Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending Approval</option>
                  <option value="Approved">Approved</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* 9. Product SKU Filter */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground">
                  Product / SKU
                </Label>
                <select
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none cursor-pointer"
                >
                  <option value="all">All Catalog Products ({catalog.length})</option>
                  {catalog.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 10. Filter Action Buttons */}
              <div className="flex items-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8.5 w-full text-xs font-semibold cursor-pointer"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Custom Date Picker Inputs when 'custom' selected */}
            {datePreset === "custom" && (
              <div className="flex flex-wrap items-center gap-3 rounded-md border border-border/70 bg-muted/20 p-2.5 text-xs">
                <span className="font-semibold text-foreground">Select Custom Date Range:</span>
                <div className="flex items-center gap-2">
                  <Label className="text-[11px] text-muted-foreground">From:</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="h-7 w-36 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-[11px] text-muted-foreground">To:</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="h-7 w-36 text-xs"
                  />
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* ==================================================== */}
      {/* SECTION 2: REPORT TYPE TABS SELECTOR */}
      {/* ==================================================== */}
      <div className="flex overflow-x-auto border-b border-border/80 gap-1 pb-1">
        <button
          type="button"
          onClick={() => {
            setActiveReport("sales")
            setCurrentPage(1)
          }}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeReport === "sales"
              ? "border-primary text-primary bg-primary/5 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <TrendingUp className="size-4" />
          <span>1. Sales Report</span>
          <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">
            {filteredOrders.filter((o) => o.status === "Approved").length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveReport("collections")
            setCurrentPage(1)
          }}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeReport === "collections"
              ? "border-primary text-primary bg-primary/5 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <Banknote className="size-4" />
          <span>2. Collection Report</span>
          <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">
            {filteredCollections.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveReport("outstanding")
            setCurrentPage(1)
          }}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeReport === "outstanding"
              ? "border-primary text-primary bg-primary/5 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <AlertCircle className="size-4" />
          <span>3. Outstanding / Due Report</span>
          <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">
            {filteredDueCustomers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveReport("returns")
            setCurrentPage(1)
          }}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-b-2 ${
            activeReport === "returns"
              ? "border-primary text-primary bg-primary/5 font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
          }`}
        >
          <RotateCcw className="size-4" />
          <span>4. Product Return Report</span>
          <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px]">
            {filteredReturns.length}
          </span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* SECTION 3: REPORT KPI SUMMARY STRIP */}
      {/* ==================================================== */}
      {activeReport === "sales" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Approved Sales
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">
              ৳ {reportMetrics.totalSalesAmount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Approved Invoices
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {reportMetrics.approvedOrdersCount} orders
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Invoiced Value
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-primary">
              ৳ {reportMetrics.approvedOrdersCount ? Math.round(reportMetrics.totalSalesAmount / reportMetrics.approvedOrdersCount).toLocaleString() : 0}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Discounts Given
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
              ৳ {reportMetrics.totalDiscountAmount.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {activeReport === "collections" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Total Realized Collection
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
              ৳ {reportMetrics.totalCollectedAmount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Collection Receipts
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">
              {reportMetrics.totalCollectionsCount} transactions
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Avg Collection per Slip
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-primary">
              ৳ {reportMetrics.totalCollectionsCount ? Math.round(reportMetrics.totalCollectedAmount / reportMetrics.totalCollectionsCount).toLocaleString() : 0}
            </p>
          </div>
        </div>
      )}

      {activeReport === "outstanding" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Total Outstanding Due Balance
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
              ৳ {reportMetrics.totalOutstandingDue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Accounts with Active Due
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">
              {reportMetrics.customersWithDueCount} of {filteredDueCustomers.length} customers
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Average Due per Account
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">
              ৳ {reportMetrics.customersWithDueCount ? Math.round(reportMetrics.totalOutstandingDue / reportMetrics.customersWithDueCount).toLocaleString() : 0}
            </p>
          </div>
        </div>
      )}

      {activeReport === "returns" && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-rose-500/25 bg-rose-500/5 p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider">
              Total Product Return Value
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-rose-600 dark:text-rose-400">
              ৳ {reportMetrics.totalReturnValue.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <p className="text-[11px] font-medium text-muted-foreground">
              Total Restocked Quantity
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-purple-600">
              {reportMetrics.totalReturnedUnits}
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-card p-3 shadow-2xs">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Total Return Incidents
            </span>
            <p className="mt-1 font-mono text-lg font-bold text-foreground">
              {filteredReturns.length} return slips
            </p>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 4: SEARCH, TABLE & PAGINATED RESULTS */}
      {/* ==================================================== */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-3.5 border-b border-border/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            {/* Search within Report */}
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={`Search ${activeReport} records...`}
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-8 pl-8 text-xs"
              />
              {tableSearch && (
                <button
                  type="button"
                  onClick={() => setTableSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Rows Per Page */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Show rows:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="rounded border border-input bg-background px-2 py-1 text-xs text-foreground focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* ============================================== */}
          {/* REPORT TABLE 1: SALES REPORT */}
          {/* ============================================== */}
          {activeReport === "sales" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-3.5 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Invoice No.</th>
                    <th className="px-3 py-2.5">Customer & Shop</th>
                    <th className="px-3 py-2.5">MPO</th>
                    <th className="px-3 py-2.5">Depot</th>
                    <th className="px-3 py-2.5 text-center">Items</th>
                    <th className="px-3 py-2.5 text-right">Subtotal</th>
                    <th className="px-3 py-2.5 text-right">Discount</th>
                    <th className="px-3 py-2.5 text-right">Grand Total</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-3.5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-10 text-center text-xs text-muted-foreground">
                        <AlertCircle className="mx-auto size-7 text-muted-foreground mb-2 opacity-50" />
                        No sales records matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders
                      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                      .map((order) => (
                        <tr key={order.id} className="transition-colors hover:bg-muted/20">
                          <td className="px-3.5 py-2.5 text-muted-foreground whitespace-nowrap">
                            {order.date}
                          </td>
                          <td className="px-3 py-2.5 font-mono font-bold text-foreground">
                            {order.code}
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-foreground">{order.customerName}</p>
                            <p className="text-[10px] text-muted-foreground truncate max-w-[160px]">{order.shopName}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-foreground">{order.officerName}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{order.officerCode}</p>
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">{order.depotName}</td>
                          <td className="px-3 py-2.5 text-center font-mono">{order.totalItems}</td>
                          <td className="px-3 py-2.5 text-right font-mono">৳ {order.subtotal.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right font-mono text-amber-600 dark:text-amber-400">
                            -৳ {order.discountAmount.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-foreground">
                            ৳ {order.grandTotal.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                order.status === "Approved"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                  : order.status === "Pending"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setModalInvoice(order)}
                              className="cursor-pointer text-primary hover:bg-primary/10"
                              title="View Invoice"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================== */}
          {/* REPORT TABLE 2: COLLECTION REPORT */}
          {/* ============================================== */}
          {activeReport === "collections" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-3.5 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">Assigned Officer</th>
                    <th className="px-3 py-2.5">Allocated Invoice</th>
                    <th className="px-3 py-2.5 text-right">Amount Collected</th>
                    <th className="px-3.5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredCollections.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                        <AlertCircle className="mx-auto size-7 text-muted-foreground mb-2 opacity-50" />
                        No collection records found for selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredCollections
                      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                      .map((col) => {
                        const cust = customers.find((c) => c.id === col.customerId)
                        return (
                          <tr key={col.id} className="transition-colors hover:bg-muted/20">
                            <td className="px-3.5 py-2.5 text-muted-foreground whitespace-nowrap">{col.date}</td>
                            <td className="px-3 py-2.5">
                              <p className="font-semibold text-foreground">{col.customerName}</p>
                              <p className="text-[10px] text-muted-foreground">{col.shopName}</p>
                            </td>
                            <td className="px-3 py-2.5 text-foreground">{cust?.officerName || "Finance"}</td>
                            <td className="px-3 py-2.5 font-mono text-muted-foreground">
                              {col.allocations?.[0]?.orderCode || "Direct Payment"}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ৳ {col.amount.toLocaleString()}
                            </td>
                            <td className="px-3.5 py-2.5 text-right">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setModalReceipt(col)}
                                className="cursor-pointer text-primary hover:bg-primary/10"
                                title="View Receipt"
                              >
                                <Eye className="size-3.5" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================== */}
          {/* REPORT TABLE 3: OUTSTANDING DUE REPORT */}
          {/* ============================================== */}
          {activeReport === "outstanding" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-3.5 py-2.5">Customer Code</th>
                    <th className="px-3 py-2.5">Customer & Shop</th>
                    <th className="px-3 py-2.5">Phone</th>
                    <th className="px-3 py-2.5">Territory / Area</th>
                    <th className="px-3 py-2.5">MPO</th>
                    <th className="px-3 py-2.5 text-right">Outstanding Due</th>
                    <th className="px-3 py-2.5 text-right">Lifetime Sales</th>
                    <th className="px-3.5 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredDueCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-xs text-muted-foreground">
                        <AlertCircle className="mx-auto size-7 text-muted-foreground mb-2 opacity-50" />
                        No customer dues match current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredDueCustomers
                      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                      .map((cust) => {
                        const due = cust.outstandingBalance || 0

                        return (
                          <tr key={cust.id} className="transition-colors hover:bg-muted/20">
                            <td className="px-3.5 py-2.5 font-mono font-bold text-foreground">{cust.code}</td>
                            <td className="px-3 py-2.5">
                              <p className="font-semibold text-foreground">{cust.name}</p>
                              <p className="text-[10px] text-muted-foreground">{cust.shopName}</p>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-muted-foreground">{cust.phone}</td>
                            <td className="px-3 py-2.5">{cust.areaName}</td>
                            <td className="px-3 py-2.5">{cust.officerName}</td>
                            <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-600 dark:text-amber-400">
                              ৳ {due.toLocaleString()}
                            </td>
                            <td className="px-3 py-2.5 text-right font-mono text-foreground">
                              ৳ {(cust.totalSpent || 0).toLocaleString()}
                            </td>
                            <td className="px-3.5 py-2.5 text-center">
                              {due === 0 ? (
                                <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                  Clear
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-600">
                                  Due Active
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================== */}
          {/* REPORT TABLE 4: PRODUCT RETURN REPORT */}
          {/* ============================================== */}
          {activeReport === "returns" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-3.5 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Customer & Shop</th>
                    <th className="px-3 py-2.5">Restocked Depot</th>
                    <th className="px-3 py-2.5">Returned Products</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Return Value</th>
                    <th className="px-3.5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredReturns.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-muted-foreground">
                        <AlertCircle className="mx-auto size-7 text-muted-foreground mb-2 opacity-50" />
                        No product return logs match current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReturns
                      .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
                      .map((ret) => (
                        <tr key={ret.id} className="transition-colors hover:bg-muted/20">
                          <td className="px-3.5 py-2.5 text-muted-foreground whitespace-nowrap">{ret.date}</td>
                          <td className="px-3 py-2.5">
                            <p className="font-semibold text-foreground">{ret.customerName}</p>
                            <p className="text-[10px] text-muted-foreground">{ret.shopName}</p>
                          </td>
                          <td className="px-3 py-2.5 text-muted-foreground">{ret.depotName}</td>
                          <td className="px-3 py-2.5">
                            {ret.items.map((it, idx) => (
                                <span key={idx} className="block text-foreground font-medium">
                                  {it.productName} ({it.returnedQuantity})
                                </span>
                              ))}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono font-bold text-amber-600">
                            {ret.totalReturnedQuantity}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                            ৳ {ret.totalReturnAmount.toLocaleString()}
                          </td>
                          <td className="px-3.5 py-2.5 text-right">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setModalReturn(ret)}
                              className="cursor-pointer text-primary hover:bg-primary/10"
                              title="View Return Voucher"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================== */}
          {/* PAGINATION FOOTER */}
          {/* ============================================== */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-3 border-t border-border/60 text-xs text-muted-foreground">
            <div>
              Showing {(() => {
                const total =
                  activeReport === "sales"
                    ? filteredOrders.length
                    : activeReport === "collections"
                    ? filteredCollections.length
                    : activeReport === "outstanding"
                    ? filteredDueCustomers.length
                    : filteredReturns.length
                const start = total === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
                const end = Math.min(currentPage * rowsPerPage, total)
                return `${start} to ${end} of ${total} entries`
              })()}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <span className="px-2 font-medium text-foreground">
                Page {currentPage} of{" "}
                {Math.max(
                  1,
                  Math.ceil(
                    (activeReport === "sales"
                      ? filteredOrders.length
                      : activeReport === "collections"
                      ? filteredCollections.length
                      : activeReport === "outstanding"
                      ? filteredDueCustomers.length
                      : filteredReturns.length) / rowsPerPage
                  )
                )}
              </span>
              <Button
                variant="outline"
                size="icon-xs"
                disabled={
                  currentPage >=
                  Math.ceil(
                    (activeReport === "sales"
                      ? filteredOrders.length
                      : activeReport === "collections"
                      ? filteredCollections.length
                      : activeReport === "outstanding"
                      ? filteredDueCustomers.length
                      : filteredReturns.length) / rowsPerPage
                  )
                }
                onClick={() =>
                  setCurrentPage((p) =>
                    Math.min(
                      Math.ceil(
                        (activeReport === "sales"
                          ? filteredOrders.length
                          : activeReport === "collections"
                          ? filteredCollections.length
                          : activeReport === "outstanding"
                          ? filteredDueCustomers.length
                          : filteredReturns.length) / rowsPerPage
                      ),
                      p + 1
                    )
                  )
                }
                className="cursor-pointer"
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ==================================================== */}
      {/* QUICK DRILLDOWN MODAL: ORDER INVOICE */}
      {/* ==================================================== */}
      {modalInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Invoice: {modalInvoice.code}
                  </h3>
                  <p className="text-xs text-muted-foreground">{modalInvoice.date} &bull; Status: <strong>{modalInvoice.status}</strong></p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setModalInvoice(null)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Customer</p>
                <p className="font-bold text-foreground">{modalInvoice.customerName}</p>
                <p className="text-muted-foreground">{modalInvoice.shopName}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">MPO & Depot</p>
                <p className="font-bold text-foreground">{modalInvoice.officerName}</p>
                <p className="text-muted-foreground">{modalInvoice.depotName}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-md border border-border/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-[11px] font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Product</th>
                    <th className="px-2 py-2 text-center">Pack</th>
                    <th className="px-2 py-2 text-center">Qty</th>
                    <th className="px-2 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {modalInvoice.items.map((it) => (
                    <tr key={it.id}>
                      <td className="px-3 py-2 font-medium text-foreground">{it.productName}</td>
                      <td className="px-2 py-2 text-center text-muted-foreground">{it.packSize}</td>
                      <td className="px-2 py-2 text-center font-mono font-bold">{it.quantity}</td>
                      <td className="px-2 py-2 text-right font-mono">৳ {it.unitPrice}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">৳ {it.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">৳ {modalInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount:</span>
                <span className="font-mono">-৳ {modalInvoice.discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground text-sm border-t border-border/50 pt-1">
                <span>Grand Total:</span>
                <span className="font-mono text-primary">৳ {modalInvoice.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalInvoice(null)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK DRILLDOWN MODAL: RECEIPT */}
      {modalReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="size-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Collection Receipt
                  </h3>
                  <p className="text-xs text-muted-foreground">{modalReceipt.date}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setModalReceipt(null)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <strong className="text-foreground">{modalReceipt.customerName} ({modalReceipt.shopName})</strong>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold">
                <span>Amount:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  ৳ {modalReceipt.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalReceipt(null)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK DRILLDOWN MODAL: RETURN VOUCHER */}
      {modalReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="size-5 text-rose-500" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Return Voucher
                  </h3>
                  <p className="text-xs text-muted-foreground">{modalReturn.date}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setModalReturn(null)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <strong className="text-foreground">{modalReturn.customerName} ({modalReturn.shopName})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restocked Depot:</span>
                <span className="font-semibold text-foreground">{modalReturn.depotName}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold">
                <span>Total Value:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  ৳ {modalReturn.totalReturnAmount.toLocaleString()} ({modalReturn.totalReturnedQuantity} units)
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalReturn(null)}
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
