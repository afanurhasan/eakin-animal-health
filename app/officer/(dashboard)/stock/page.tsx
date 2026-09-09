"use client"

import * as React from "react"
import {
  Boxes,
  Building2,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  MapPin,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import { type DepotStockItem } from "@/lib/mock-data"

export default function OfficerStockPage() {
  const {
    currentOfficer,
    depotStocks,
    getOfficerAssignedDepot,
  } = useAppState()

  // Filters State
  const [searchStockQuery, setSearchStockQuery] = React.useState<string>("")

  // Assigned Depot for the logged-in officer
  const assignedDepot = React.useMemo(() => {
    if (!currentOfficer) return null
    return getOfficerAssignedDepot(currentOfficer.id)
  }, [currentOfficer, getOfficerAssignedDepot])

  // Stock items of the assigned depot
  const stockList: DepotStockItem[] = React.useMemo(() => {
    if (!assignedDepot) return []
    return depotStocks[assignedDepot.id] || []
  }, [depotStocks, assignedDepot])

  // Filtered Stock Items
  const filteredStock = React.useMemo(() => {
    return stockList.filter((item) => {
      // Search Query
      if (searchStockQuery.trim()) {
        const q = searchStockQuery.toLowerCase().trim()
        const matchName = item.productName.toLowerCase().includes(q)
        const matchCode = item.productCode.toLowerCase().includes(q)
        if (!matchName && !matchCode) {
          return false
        }
      }

      return true
    })
  }, [stockList, searchStockQuery])

  // Stock Metrics
  const metrics = React.useMemo(() => {
    let totalUnits = 0
    let inStockCount = 0
    let lowStockCount = 0
    let outOfStockCount = 0

    stockList.forEach((item) => {
      totalUnits += item.quantity
      if (item.quantity === 0) {
        outOfStockCount++
      } else if (item.quantity <= item.minThreshold) {
        lowStockCount++
      } else {
        inStockCount++
      }
    })

    return {
      totalUnits,
      inStockCount,
      lowStockCount,
      outOfStockCount,
    }
  }, [stockList])

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
      {/* Top Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Depot Stock
            </h2>
            <span className="rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
              {assignedDepot?.code || "DEPOT"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Current stock inventory available at <strong className="text-foreground">{assignedDepot?.name || "Assigned Depot"}</strong> for fulfilling orders in <strong className="text-foreground">{currentOfficer.areaName}</strong>.
          </p>
        </div>
      </div>

      {/* Depot Information Banner */}
      {assignedDepot && (
        <Card className="border-primary/20 bg-primary/5 shadow-xs">
          <CardContent className="p-3.5 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
                  <Building2 className="size-4.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground">
                      {assignedDepot.name}
                    </h3>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      ({assignedDepot.code})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <MapPin className="size-3 text-muted-foreground shrink-0" />
                    <span>{assignedDepot.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Officer Hierarchy:</span>
                <span className="rounded border border-border/80 bg-background px-2 py-0.5 font-medium text-foreground">
                  {currentOfficer.areaName} &rarr; {currentOfficer.name}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {/* 1. Total Stock Units */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Units in Stock</span>
              <Boxes className="size-4 text-primary" />
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-foreground">
              {metrics.totalUnits.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        {/* 2. In Stock SKUs */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Adequate Stock SKUs</span>
              <CheckCircle2 className="size-4 text-emerald-600" />
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics.inStockCount}
            </div>
          </CardContent>
        </Card>

        {/* 3. Low Stock SKUs */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Low Stock Warnings</span>
              <AlertTriangle className="size-4 text-amber-600" />
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-amber-600 dark:text-amber-400">
              {metrics.lowStockCount}
            </div>
          </CardContent>
        </Card>

        {/* 4. Total Catalog SKUs */}
        <Card className="border-border/80 bg-card shadow-xs">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Products in Depot</span>
              <Package className="size-4 text-muted-foreground" />
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-foreground">
              {stockList.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Stock Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchStockQuery}
                  onChange={(e) => setSearchStockQuery(e.target.value)}
                  placeholder="Search product name or code..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>

            <div className="text-xs text-muted-foreground font-medium">
              Showing {filteredStock.length} of {stockList.length} products
            </div>
          </div>
        </CardHeader>

        {/* Stock Items Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-12 px-4 py-3 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Product Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Product Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pack Size
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Available Stock
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Stock Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredStock.length > 0 ? (
                  filteredStock.map((item, index) => {
                    const isOutOfStock = item.quantity === 0
                    const isLowStock = item.quantity > 0 && item.quantity <= item.minThreshold

                    return (
                      <tr key={item.productId} className="transition-colors hover:bg-muted/30">
                        {/* SL */}
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>

                        {/* Product Code */}
                        <td className="px-4 py-3 font-mono font-semibold text-primary">
                          {item.productCode}
                        </td>

                        {/* Product Name */}
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {item.productName}
                        </td>

                        {/* Pack Size */}
                        <td className="px-4 py-3 text-muted-foreground font-medium">
                          {item.packSize}
                        </td>

                        {/* Available Stock */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {item.quantity.toLocaleString()}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                              <XCircle className="size-3" />
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="size-3" />
                              Low Stock (&le;{item.minThreshold})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-3" />
                              In Stock
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-xs text-muted-foreground">
                      No stock records found matching your filters.
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
