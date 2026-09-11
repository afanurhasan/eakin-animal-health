"use client"

import * as React from "react"
import Link from "next/link"
import {
  TrendingUp,
  ArrowUpRight,
  ShoppingCart,
  Banknote,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Package,
  Boxes,
  Building2,
  UserCheck,
  RotateCcw,
  ArrowRightLeft,
  ChevronRight,
  Eye,
  X,
  FileText,
  Printer,
  Calendar,
  AlertTriangle,
  Store,
  MapPin,
  Phone,
  BarChart3,
  Percent,
  Receipt,
  Layers,
  Sparkles,
} from "lucide-react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import {
  type Order,
  type CollectionItem,
  type ProductReturnItem,
  type StockTransfer,
  type DepotStockItem,
} from "@/lib/mock-data"

export default function DashboardPage() {
  const router = useRouter()
  // Global Data State from centralized source of truth
  const {
    currentRole,
    orders,
    collections,
    productReturns,
    depots,
    depotStocks,
    customers,
    officers,
    rms,
    ams,
    catalog,
    transfers,
  } = useAppState()

  React.useEffect(() => {
    if (currentRole === "rm") {
      router.replace("/officer/rm/dashboard")
    } else if (currentRole === "am") {
      router.replace("/officer/am/dashboard")
    } else if (currentRole === "officer") {
      router.replace("/officer/dashboard")
    }
  }, [currentRole, router])

  // Timeline / Period filter state for dashboard
  const [timelineFilter, setTimelineFilter] = React.useState<"all" | "this-month" | "last-30" | "today">("all")

  // Active Tab for Recent Operations
  const [activityTab, setActivityTab] = React.useState<"orders" | "collections" | "returns" | "transfers">("orders")

  // Drilldown Modals
  const [selectedInvoice, setSelectedInvoice] = React.useState<Order | null>(null)
  const [selectedReceipt, setSelectedReceipt] = React.useState<CollectionItem | null>(null)
  const [selectedReturn, setSelectedReturn] = React.useState<ProductReturnItem | null>(null)

  // ----------------------------------------------------
  // BUSINESS KPI CALCULATIONS (Using Live Hierarchy & Data)
  // ----------------------------------------------------
  const stats = React.useMemo(() => {
    // 1. Sales Stats
    const approvedOrders = orders.filter((o) => o.status === "Approved")
    const pendingOrders = orders.filter((o) => o.status === "Pending")
    const cancelledOrders = orders.filter((o) => o.status === "Cancelled")

    const totalSales = approvedOrders.reduce((sum, o) => sum + o.grandTotal, 0)
    const pendingSales = pendingOrders.reduce((sum, o) => sum + o.grandTotal, 0)

    // 09/2026 sales (mock dates start with 01-05/09/2026 or 20-31/08/2026)
    const thisMonthOrders = approvedOrders.filter((o) => o.date.includes("/09/2026"))
    const thisMonthSales = thisMonthOrders.reduce((sum, o) => sum + o.grandTotal, 0)

    // Today's Sales (05/09/2026)
    const todayOrders = orders.filter((o) => o.date.includes("05/09/2026"))
    const todayApprovedOrders = todayOrders.filter((o) => o.status === "Approved")
    const todaySales = todayApprovedOrders.reduce((sum, o) => sum + o.grandTotal, 0) + (todayOrders.find(o => o.status === "Pending")?.grandTotal || 0)

    // 2. Collections Stats
    const totalCollected = collections.reduce((sum, c) => sum + c.amount, 0)
    const thisMonthCollections = collections.filter((c) => c.date.includes("/09/2026"))
    const thisMonthCollected = thisMonthCollections.reduce((sum, c) => sum + c.amount, 0)
    const todayCollections = collections.filter((c) => c.date.includes("05/09/2026") || c.date.includes("04/09/2026"))
    const todayCollected = todayCollections.reduce((sum, c) => sum + c.amount, 0)

    // 3. Outstanding / Due Stats (Sum across all customers)
    const totalOutstandingDue = customers.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0)

    // 4. Product Returns Stats
    const totalReturnedValue = productReturns.reduce((sum, r) => sum + r.totalReturnAmount, 0)
    const totalReturnedUnits = productReturns.reduce((sum, r) => sum + r.totalReturnedQuantity, 0)

    // 5. Stock & Inventory Stats
    let totalStockUnits = 0
    let lowStockCount = 0
    const criticalStockItems: (DepotStockItem & { depotName: string; depotId: string })[] = []

    Object.entries(depotStocks).forEach(([depId, items]) => {
      const depotObj = depots.find((d) => d.id === depId)
      const depName = depotObj ? depotObj.name : depId
      items.forEach((item) => {
        totalStockUnits += item.quantity
        if (item.quantity <= item.minThreshold) {
          lowStockCount++
          criticalStockItems.push({ ...item, depotId: depId, depotName: depName })
        }
      })
    })

    // 6. Depot-wise Sales Performance
    const depotSalesMap: Record<
      string,
      {
        depotId: string
        depotName: string
        sales: number
        ordersCount: number
        approvedCount: number
        totalStock: number
      }
    > = {}

    depots.forEach((d) => {
      const dStock = (depotStocks[d.id] || []).reduce((sum, item) => sum + item.quantity, 0)
      depotSalesMap[d.id] = {
        depotId: d.id,
        depotName: d.name,
        sales: 0,
        ordersCount: 0,
        approvedCount: 0,
        totalStock: dStock,
      }
    })

    orders.forEach((o) => {
      if (depotSalesMap[o.depotId]) {
        depotSalesMap[o.depotId].ordersCount++
        if (o.status === "Approved") {
          depotSalesMap[o.depotId].sales += o.grandTotal
          depotSalesMap[o.depotId].approvedCount++
        }
      }
    })

    const depotPerformance = Object.values(depotSalesMap).sort((a, b) => b.sales - a.sales)

    // 7. Sales Officer Performance (Top Officers)
    const officerPerformance = officers.map((off) => {
      const offOrders = orders.filter((o) => o.officerId === off.id)
      const offApproved = offOrders.filter((o) => o.status === "Approved")
      const currentSales = offApproved.reduce((sum, o) => sum + o.grandTotal, 0)
      const lifetimeSales = (off.totalSales || 0) + currentSales
      const offCollections = collections.filter((c) => {
        const cust = customers.find((cu) => cu.id === c.customerId)
        return cust?.officerId === off.id
      })
      const collectedAmount = offCollections.reduce((sum, c) => sum + c.amount, 0)

      return {
        ...off,
        activeOrdersCount: offOrders.length,
        approvedOrdersCount: offApproved.length,
        computedSales: lifetimeSales,
        recentSales: currentSales > 0 ? currentSales : (off.totalSales ? Math.round(off.totalSales * 0.3) : 240000),
        collectedAmount: collectedAmount > 0 ? collectedAmount : (off.totalSales ? Math.round(off.totalSales * 0.25) : 190000),
      }
    }).sort((a, b) => b.computedSales - a.computedSales)

    return {
      totalSales,
      thisMonthSales,
      todaySales,
      totalCollected,
      thisMonthCollected,
      todayCollected,
      totalOutstandingDue,
      totalReturnedValue,
      totalReturnedUnits,
      pendingOrdersCount: pendingOrders.length,
      pendingSales,
      approvedOrdersCount: approvedOrders.length,
      cancelledOrdersCount: cancelledOrders.length,
      totalOrdersCount: orders.length,
      totalCustomersCount: customers.length,
      totalProductsCount: catalog.length,
      totalStockUnits,
      lowStockCount,
      criticalStockItems,
      depotPerformance,
      officerPerformance,
    }
  }, [orders, collections, productReturns, depotStocks, depots, customers, officers, catalog])

  // Monthly Revenue & Collection Trend Data for Chart
  const revenueTrendData = [
    { period: "05/2026", sales: 245000, collections: 220000, returns: 4200 },
    { period: "06/2026", sales: 310000, collections: 285000, returns: 6100 },
    { period: "07/2026", sales: 380000, collections: 340000, returns: 5800 },
    { period: "08/2026", sales: 495000, collections: 440000, returns: 8400 },
    { period: "09/2026 (MTD)", sales: 432360, collections: 385000, returns: 4280 },
  ]
  const maxTrendVal = Math.max(...revenueTrendData.map((d) => Math.max(d.sales, d.collections)))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Enterprise Dashboard
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational and financial intelligence across Depots, Territories, Officers, Orders and Inventory.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeline Filter */}
          <div className="inline-flex items-center rounded-md border border-border/80 bg-card p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setTimelineFilter("all")}
              className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                timelineFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimelineFilter("this-month")}
              className={`rounded px-2.5 py-1 font-medium transition-colors cursor-pointer ${
                timelineFilter === "this-month"
                  ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 1: PRIMARY FINANCIAL & OPERATIONAL KPI CARDS */}
      {/* ==================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Sales */}
        <Card className="border-border/80 bg-card shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Total Sales (Approved)
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                <TrendingUp className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-1">
              <span className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                ৳ {stats.totalSales.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] border-t border-border/50 pt-2 text-muted-foreground">
              <span>{stats.approvedOrdersCount} Approved Invoices</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Avg ৳ {stats.approvedOrdersCount ? Math.round(stats.totalSales / stats.approvedOrdersCount).toLocaleString() : 0}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: This Month Sales */}
        <Card className="border-border/80 bg-card shadow-2xs transition-all hover:border-primary/40 hover:shadow-xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                This Month Sales
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Calendar className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-1">
              <span className="font-mono text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                ৳ {stats.thisMonthSales.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] border-t border-border/50 pt-2 text-muted-foreground">
              <span>09/2026</span>
              <span className="font-semibold text-primary">
                Today: ৳ {stats.todaySales.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Total Outstanding / Due */}
        <Card className="border-border/80 bg-card shadow-2xs transition-all hover:border-amber-500/40 hover:shadow-xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                Total Outstanding Due
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <AlertCircle className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-1">
              <span className="font-mono text-xl font-bold tracking-tight text-amber-600 dark:text-amber-400 sm:text-2xl">
                ৳ {stats.totalOutstandingDue.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] border-t border-border/50 pt-2 text-muted-foreground">
              <span>{stats.totalCustomersCount} Total Accounts</span>
              <Link href="/customers" className="text-amber-600 dark:text-amber-400 hover:underline font-medium">
                View Dues &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Total Collections */}
        <Card className="border-border/80 bg-card shadow-2xs transition-all hover:border-emerald-500/40 hover:shadow-xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                This Month Collection
              </span>
              <div className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Banknote className="size-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-1">
              <span className="font-mono text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 sm:text-2xl">
                ৳ {stats.thisMonthCollected.toLocaleString()}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] border-t border-border/50 pt-2 text-muted-foreground">
              <span>Today: ৳ {stats.todayCollected.toLocaleString()}</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400">
                Total: ৳ {stats.totalCollected.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ==================================================== */}
      {/* SECTION 2: SECONDARY OPERATIONAL METRIC BADGES */}
      {/* ==================================================== */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {/* Pending Orders */}
        <Link href="/orders" className="group">
          <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-2.5 transition-all group-hover:border-amber-500/40 group-hover:bg-amber-500/10">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider truncate">
                Pending Orders
              </p>
              <p className="font-mono text-sm font-bold text-amber-700 dark:text-amber-300">
                {stats.pendingOrdersCount} <span className="text-[10px] font-normal text-amber-600/80">orders</span>
              </p>
            </div>
          </div>
        </Link>

        {/* Approved Orders */}
        <Link href="/orders" className="group">
          <div className="flex items-center gap-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-2.5 transition-all group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider truncate">
                Approved Orders
              </p>
              <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {stats.approvedOrdersCount} <span className="text-[10px] font-normal text-emerald-600/80">orders</span>
              </p>
            </div>
          </div>
        </Link>

        {/* Cancelled Orders */}
        <div className="flex items-center gap-2.5 rounded-lg border border-rose-500/20 bg-rose-500/5 p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <XCircle className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider truncate">
              Cancelled
            </p>
            <p className="font-mono text-sm font-bold text-rose-700 dark:text-rose-300">
              {stats.cancelledOrdersCount} <span className="text-[10px] font-normal text-rose-600/80">orders</span>
            </p>
          </div>
        </div>

        {/* Total Customers */}
        <Link href="/customers" className="group">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-card p-2.5 transition-all group-hover:border-primary/40">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Customers
              </p>
              <p className="font-mono text-sm font-bold text-foreground">
                {stats.totalCustomersCount} <span className="text-[10px] font-normal text-muted-foreground">clients</span>
              </p>
            </div>
          </div>
        </Link>

        {/* Product Catalog */}
        <Link href="/products" className="group">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-card p-2.5 transition-all group-hover:border-primary/40">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Package className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Products
              </p>
              <p className="font-mono text-sm font-bold text-foreground">
                {stats.totalProductsCount} <span className="text-[10px] font-normal text-muted-foreground">skus</span>
              </p>
            </div>
          </div>
        </Link>

        {/* Total Stock Units */}
        <Link href="/stock-management" className="group">
          <div className="flex items-center gap-2.5 rounded-lg border border-border/80 bg-card p-2.5 transition-all group-hover:border-primary/40">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Boxes className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                Stock Units
              </p>
              <p className="font-mono text-sm font-bold text-foreground">
                {stats.totalStockUnits.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">units</span>
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* ==================================================== */}
      {/* SECTION 3: VISUAL CHARTS & ANALYTICS GRAPHS */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left 2 Cols: Sales & Collection Revenue Trend Chart */}
        <Card className="border-border/80 bg-card shadow-xs lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Revenue vs Collection Trend
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Monthly comparative sales performance and cash collection realization
                </CardDescription>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="size-2.5 rounded-xs bg-primary" /> Sales
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="size-2.5 rounded-xs bg-emerald-500" /> Collections
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <span className="size-2.5 rounded-xs bg-rose-400" /> Returns
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              {revenueTrendData.map((item) => {
                const salesPct = Math.round((item.sales / maxTrendVal) * 100)
                const collectPct = Math.round((item.collections / maxTrendVal) * 100)
                const returnPct = Math.max(2, Math.round((item.returns / maxTrendVal) * 100))

                return (
                  <div key={item.period} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{item.period}</span>
                      <div className="flex items-center gap-3 font-mono text-[11px]">
                        <span className="text-primary font-medium">৳ {item.sales.toLocaleString()}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">৳ {item.collections.toLocaleString()}</span>
                        <span className="text-rose-500 text-[10px]">(-৳ {item.returns.toLocaleString()})</span>
                      </div>
                    </div>
                    {/* Multi-tier comparative progress bar */}
                    <div className="flex h-3 w-full overflow-hidden rounded bg-muted/40 gap-1 p-0.5">
                      <div
                        className="h-full rounded-xs bg-primary transition-all duration-500"
                        style={{ width: `${salesPct * 0.52}%` }}
                        title={`Sales: ৳ ${item.sales.toLocaleString()}`}
                      />
                      <div
                        className="h-full rounded-xs bg-emerald-500 transition-all duration-500"
                        style={{ width: `${collectPct * 0.44}%` }}
                        title={`Collections: ৳ ${item.collections.toLocaleString()}`}
                      />
                      <div
                        className="h-full rounded-xs bg-rose-400/80 transition-all duration-500"
                        style={{ width: `${returnPct}%` }}
                        title={`Returns: ৳ ${item.returns.toLocaleString()}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Summary Footnote */}
            <div className="mt-5 rounded-md border border-border/60 bg-muted/20 p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <span className="text-muted-foreground">
                  Cash Collection Efficiency: <strong className="text-foreground font-semibold">89.1%</strong> of invoiced orders
                </span>
              </div>
              <span className="text-muted-foreground text-[11px]">
                Active Cycle: FY 2026-Q3
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Depot-wise Sales Distribution */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <span>Depot Market Share</span>
              </div>
              <Link href="/depots" className="text-xs text-primary hover:underline font-normal">
                Depots ({depots.length})
              </Link>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Sales performance & inventory held per regional depot
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {stats.depotPerformance.map((dep, idx) => {
              const maxDepSales = Math.max(1, stats.depotPerformance[0]?.sales || 1)
              const percentage = Math.round((dep.sales / (stats.totalSales || 1)) * 100)
              const barWidth = Math.max(8, Math.round((dep.sales / maxDepSales) * 100))

              return (
                <div key={dep.depotId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <span className="flex size-4 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="truncate max-w-[140px]">{dep.depotName}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-foreground">
                        ৳ {dep.sales.toLocaleString()}
                      </span>
                      <span className="ml-1 text-[10px] text-muted-foreground">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/50">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                      {dep.totalStock.toLocaleString()} units
                    </span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* ==================================================== */}
      {/* SECTION 4: SALES FORCE PERFORMANCE & LOW STOCK ALERT */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left 2 Cols: Top Performing Sales Officers */}
        <Card className="border-border/80 bg-card shadow-xs lg:col-span-2">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <UserCheck className="size-4 text-primary" />
                  MPO Performance Leaderboard
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Order volumes, sales generated and field collections per assigned MPO
                </CardDescription>
              </div>
              <Link href="/officers" className="text-xs font-medium text-primary hover:underline">
                View All MPOs ({officers.length}) &rarr;
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-3.5 py-2.5">MPO</th>
                    <th className="px-3 py-2.5">Territory / AM</th>
                    <th className="px-3 py-2.5 text-center">Orders</th>
                    <th className="px-3 py-2.5 text-right">Sales Volume</th>
                    <th className="px-3 py-2.5 text-right">Collected</th>
                    <th className="px-3.5 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {stats.officerPerformance.slice(0, 5).map((off, idx) => (
                    <tr key={off.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-3.5 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            idx === 0 ? "bg-amber-500/20 text-amber-600" : idx === 1 ? "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200" : "bg-muted text-muted-foreground"
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-foreground">{off.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{off.code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-foreground">{off.areaName}</p>
                        <p className="text-[10px] text-muted-foreground">AM: {off.amName}</p>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                          {off.totalOrders || off.activeOrdersCount}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-foreground">
                        ৳ {off.computedSales.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        ৳ {off.collectedAmount.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-2.5 text-right">
                        <Link href={`/officers/${off.id}`}>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                            title="View Officer Details"
                          >
                            <ChevronRight className="size-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Low Stock & Critical Inventory Board */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <span>Low Stock Warnings</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  SKUs near or below threshold
                </CardDescription>
              </div>
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                {stats.lowStockCount} items
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-3.5 space-y-3">
            {stats.criticalStockItems.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <CheckCircle2 className="mx-auto size-6 text-emerald-500 mb-1" />
                All depot stocks are at optimal levels.
              </div>
            ) : (
              stats.criticalStockItems.slice(0, 4).map((item) => (
                <div
                  key={`${item.depotId}-${item.productId}`}
                  className="rounded-md border border-amber-500/25 bg-amber-500/5 p-2.5 text-xs transition-colors hover:border-amber-500/40"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="font-semibold text-foreground">{item.productName}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{item.productCode} &bull; {item.packSize}</p>
                    </div>
                    <span className="rounded-xs border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300">
                      Qty: {item.quantity}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-amber-500/20 pt-1.5">
                    <span className="flex items-center gap-1">
                      <Building2 className="size-3 text-amber-600" />
                      <span>{item.depotName}</span>
                    </span>
                    <span className="text-[10px]">Min Threshold: {item.minThreshold}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* ==================================================== */}
      {/* SECTION 5: RECENT OPERATIONAL ACTIVITIES (TABS) */}
      {/* ==================================================== */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Receipt className="size-4 text-primary" />
                Recent Operational Activity Ledger
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Real-time transactions across Invoices, Collections, Returns, and Transfers
              </CardDescription>
            </div>

            {/* Sub Tabs */}
            <div className="inline-flex items-center rounded-md border border-border/80 bg-muted/30 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setActivityTab("orders")}
                className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                  activityTab === "orders"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityTab("collections")}
                className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                  activityTab === "collections"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Collections ({collections.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityTab("returns")}
                className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                  activityTab === "returns"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Returns ({productReturns.length})
              </button>
              <button
                type="button"
                onClick={() => setActivityTab("transfers")}
                className={`rounded px-3 py-1 font-medium transition-colors cursor-pointer ${
                  activityTab === "transfers"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Transfers ({transfers.length})
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* TAB 1: RECENT ORDERS */}
          {activityTab === "orders" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-2.5">Date & Invoice</th>
                    <th className="px-3 py-2.5">Customer & Shop</th>
                    <th className="px-3 py-2.5">MPO</th>
                    <th className="px-3 py-2.5">Depot</th>
                    <th className="px-3 py-2.5 text-right">Grand Total</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {orders.slice(0, 6).map((order) => (
                    <tr key={order.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <p className="font-mono font-bold text-foreground">{order.code}</p>
                        <p className="text-[10px] text-muted-foreground">{order.date}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-foreground">{order.customerName}</p>
                        <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">{order.shopName}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="text-foreground">{order.officerName}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{order.officerCode}</p>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{order.depotName}</td>
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
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setSelectedInvoice(order)}
                          className="cursor-pointer text-primary hover:bg-primary/10"
                          title="Quick View Invoice"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: RECENT COLLECTIONS */}
          {activityTab === "collections" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-2.5">Date & Receipt</th>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">Payment Method</th>
                    <th className="px-3 py-2.5">Allocated Invoice</th>
                    <th className="px-3 py-2.5 text-right">Amount Collected</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {collections.map((col) => (
                    <tr key={col.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <p className="font-mono font-bold text-foreground">{col.code}</p>
                        <p className="text-[10px] text-muted-foreground">{col.date}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-foreground">{col.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{col.shopName}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex rounded-xs bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                          {col.paymentMethod || "Bank Transfer"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-muted-foreground">
                        {col.allocations?.[0]?.orderCode || "Direct Collection"}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        ৳ {col.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setSelectedReceipt(col)}
                          className="cursor-pointer text-primary hover:bg-primary/10"
                          title="View Receipt"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: RECENT PRODUCT RETURNS */}
          {activityTab === "returns" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-2.5">Date & Return Slip</th>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">Restocked Depot</th>
                    <th className="px-3 py-2.5 text-center">Returned Qty</th>
                    <th className="px-3 py-2.5 text-right">Return Value</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {productReturns.map((ret) => (
                    <tr key={ret.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <p className="font-mono font-bold text-foreground">{ret.code}</p>
                        <p className="text-[10px] text-muted-foreground">{ret.date}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <p className="font-semibold text-foreground">{ret.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{ret.shopName}</p>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">{ret.depotName}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-amber-600">
                        {ret.totalReturnedQuantity} units
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                        ৳ {ret.totalReturnAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => setSelectedReturn(ret)}
                          className="cursor-pointer text-primary hover:bg-primary/10"
                          title="View Return Slip"
                        >
                          <Eye className="size-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: RECENT STOCK TRANSFERS */}
          {activityTab === "transfers" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 bg-muted/30 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-4 py-2.5">Date & Transfer No.</th>
                    <th className="px-3 py-2.5">Source Depot</th>
                    <th className="px-3 py-2.5">Destination Depot</th>
                    <th className="px-3 py-2.5 text-center">SKUs Count</th>
                    <th className="px-3 py-2.5 text-center">Total Quantity</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {transfers.map((tx) => (
                    <tr key={tx.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-4 py-2.5">
                        <p className="font-mono font-bold text-foreground">{tx.code}</p>
                        <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                      </td>
                      <td className="px-3 py-2.5 font-medium text-foreground">{tx.sourceDepotName}</td>
                      <td className="px-3 py-2.5 font-medium text-foreground">{tx.destinationDepotName}</td>
                      <td className="px-3 py-2.5 text-center font-mono">
                        {tx.totalProducts} items
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-primary">
                        {tx.totalQuantity} units
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ==================================================== */}
      {/* QUICK VIEW MODAL: INVOICE / ORDER DRILLDOWN */}
      {/* ==================================================== */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="size-5 text-primary" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Order Invoice: {selectedInvoice.code}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Created on {selectedInvoice.date} &bull; Status: <strong className="text-foreground">{selectedInvoice.status}</strong>
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedInvoice(null)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Customer & Officer Info */}
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Customer</p>
                <p className="font-bold text-foreground">{selectedInvoice.customerName}</p>
                <p className="text-muted-foreground">{selectedInvoice.shopName}</p>
                <p className="text-muted-foreground">{selectedInvoice.address}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">MPO & Depot</p>
                <p className="font-bold text-foreground">{selectedInvoice.officerName}</p>
                <p className="text-muted-foreground">{selectedInvoice.depotName}</p>
                <p className="text-muted-foreground">Phone: {selectedInvoice.phone}</p>
              </div>
            </div>

            {/* Order Items Table */}
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
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-3 py-2 font-medium text-foreground">{item.productName}</td>
                      <td className="px-2 py-2 text-center text-muted-foreground">{item.packSize}</td>
                      <td className="px-2 py-2 text-center font-mono font-bold">{item.quantity}</td>
                      <td className="px-2 py-2 text-right font-mono">৳ {item.unitPrice}</td>
                      <td className="px-3 py-2 text-right font-mono font-bold">৳ {item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                  {selectedInvoice.bonusItems && selectedInvoice.bonusItems.length > 0 && (
                    <tr className="bg-primary/5">
                      <td colSpan={5} className="px-3 py-1.5 text-[11px] font-medium text-primary">
                        Bonus Approved: {selectedInvoice.bonusItems.map(b => `${b.productName} (${b.quantity})`).join(", ")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 space-y-1 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">৳ {selectedInvoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span>Discount ({selectedInvoice.discountPercent}%):</span>
                <span className="font-mono">-৳ {selectedInvoice.discountAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground text-sm border-t border-border/50 pt-1">
                <span>Grand Total:</span>
                <span className="font-mono text-primary">৳ {selectedInvoice.grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedInvoice(null)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
              <Link href="/orders">
                <Button
                  size="sm"
                  className="cursor-pointer text-xs"
                >
                  Manage in Orders &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL: COLLECTION RECEIPT */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Banknote className="size-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Collection Receipt: {selectedReceipt.code}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedReceipt.date}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedReceipt(null)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <strong className="text-foreground">{selectedReceipt.customerName} ({selectedReceipt.shopName})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-semibold text-foreground">{selectedReceipt.paymentMethod || "Bank Transfer"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recorded By:</span>
                <span>{selectedReceipt.recordedBy || "Finance Officer"}</span>
              </div>
              {selectedReceipt.note && (
                <div className="flex justify-between border-t border-border/40 pt-1 text-muted-foreground italic">
                  <span>Note: {selectedReceipt.note}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold">
                <span>Amount Received:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  ৳ {selectedReceipt.amount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
              <Link href="/collections">
                <Button size="sm" className="cursor-pointer text-xs">
                  Collections Center &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* QUICK VIEW MODAL: PRODUCT RETURN SLIP */}
      {selectedReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="size-5 text-rose-500" />
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Product Return Voucher: {selectedReturn.code}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedReturn.date}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedReturn(null)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer:</span>
                <strong className="text-foreground">{selectedReturn.customerName} ({selectedReturn.shopName})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Restocked Depot:</span>
                <span className="font-semibold text-foreground">{selectedReturn.depotName}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm font-bold">
                <span>Credit Adjusted:</span>
                <span className="font-mono text-rose-600 dark:text-rose-400">
                  ৳ {selectedReturn.totalReturnAmount.toLocaleString()} ({selectedReturn.totalReturnedQuantity} units)
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReturn(null)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
              <Link href="/product-returns">
                <Button size="sm" className="cursor-pointer text-xs">
                  Manage Returns &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
