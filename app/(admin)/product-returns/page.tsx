"use client"

import * as React from "react"
import Link from "next/link"
import {
  RotateCcw,
  Search,
  Plus,
  Eye,
  CheckCircle2,
  Building2,
  Store,
  Package,
  Printer,
  X,
  AlertCircle,
  Boxes,
  Trash2,
  User,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import {
  initialProductReturns,
  initialOrders,
  initialCustomers,
  initialDepots,
  initialDepotStocks,
  initialAreasWithDepot,
  initialRMs,
  type ProductReturnItem,
  type ReturnProductRow,
  type Order,
  type CustomerItem,
  type Depot,
  type DepotStockItem,
} from "@/lib/mock-data"
import { formatDateTime } from "@/lib/utils"

export interface CustomerDeliveredProduct {
  productId: string
  productCode: string
  productName: string
  packSize: string
  unit: string
  unitPrice: number
  totalDelivered: number
  previouslyReturned: number
  currentlyReturnable: number
}

export interface SummaryReturnItem extends ReturnProductRow {
  currentlyReturnable: number
}

export default function ProductReturnsPage() {
  const [returns, setReturns] = React.useState<ProductReturnItem[]>(initialProductReturns)
  const [orders, setOrders] = React.useState<Order[]>(initialOrders)
  const [customers, setCustomers] = React.useState<CustomerItem[]>(initialCustomers)
  const [depots] = React.useState<Depot[]>(initialDepots)
  const [depotStocks, setDepotStocks] = React.useState<Record<string, DepotStockItem[]>>(initialDepotStocks)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [depotFilter, setDepotFilter] = React.useState("all")
  const [selectedCustomerFilter, setSelectedCustomerFilter] = React.useState("all")

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [selectedSlip, setSelectedSlip] = React.useState<ProductReturnItem | null>(null)

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Helper: Auto-detect Depot from Customer Hierarchy (Customer -> Officer -> AM -> RM -> Area -> Depot)
  const getCustomerDepot = React.useCallback(
    (cust: CustomerItem | null) => {
      if (!cust) {
        return {
          depotId: depots[0]?.id || "dep-1",
          depotName: depots[0]?.name || "Dhaka Central Depot",
        }
      }

      // 1. Look up via customer's area in initialAreasWithDepot
      const area = initialAreasWithDepot.find((a) => a.id === cust.areaId)
      if (area && area.depotId) {
        const matchingDepot = depots.find((d) => d.id === area.depotId)
        return {
          depotId: area.depotId,
          depotName: area.depotName || matchingDepot?.name || "Dhaka Central Depot",
        }
      }

      // 2. Look up via RM's area
      const rm = initialRMs.find((r) => r.id === cust.rmId)
      if (rm) {
        const rmArea = initialAreasWithDepot.find((a) => a.id === rm.areaId)
        if (rmArea && rmArea.depotId) {
          const matchingDepot = depots.find((d) => d.id === rmArea.depotId)
          return {
            depotId: rmArea.depotId,
            depotName: rmArea.depotName || matchingDepot?.name || "Dhaka Central Depot",
          }
        }
      }

      // 3. Fallback
      return {
        depotId: depots[0]?.id || "dep-1",
        depotName: depots[0]?.name || "Dhaka Central Depot",
      }
    },
    [depots]
  )

  // Form State for Multi-Product Return Modal
  const [formCustomerId, setFormCustomerId] = React.useState("")
  const [customerSearchQuery, setCustomerSearchQuery] = React.useState("")
  const [productSearchQuery, setProductSearchQuery] = React.useState("")
  const [addedProductIds, setAddedProductIds] = React.useState<string[]>([])
  const [returnQuantities, setReturnQuantities] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState("")

  // Open modal
  const openAddModal = (prefillCustId?: string) => {
    setFormCustomerId(prefillCustId || "")
    setCustomerSearchQuery("")
    setProductSearchQuery("")
    setAddedProductIds([])
    setReturnQuantities({})
    setFormError("")
    setIsAddModalOpen(true)
  }

  // Selected customer object
  const selectedCustomer = React.useMemo(() => {
    return customers.find((c) => c.id === formCustomerId) || null
  }, [customers, formCustomerId])

  // Customer's auto-detected depot
  const customerAutoDepot = React.useMemo(() => {
    return getCustomerDepot(selectedCustomer)
  }, [selectedCustomer, getCustomerDepot])

  // Matching customers by search query
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
    setProductSearchQuery("")
    setAddedProductIds([])
    setReturnQuantities({})
    setFormError("")
  }

  // Clear / Change selected customer
  const handleResetCustomer = () => {
    setFormCustomerId("")
    setCustomerSearchQuery("")
    setProductSearchQuery("")
    setAddedProductIds([])
    setReturnQuantities({})
    setFormError("")
  }

  // Compute products previously delivered to the selected customer, total delivered, previously returned, and currently returnable
  const customerDeliveredProducts = React.useMemo<CustomerDeliveredProduct[]>(() => {
    if (!formCustomerId) return []

    const productMap: Record<string, CustomerDeliveredProduct> = {}

    // 1. Gather all delivered products across all approved orders of this customer
    orders
      .filter((o) => o.customerId === formCustomerId && o.status === "Approved")
      .forEach((order) => {
        order.items.forEach((item) => {
          if (!productMap[item.productId]) {
            productMap[item.productId] = {
              productId: item.productId,
              productCode: item.productCode,
              productName: item.productName,
              packSize: item.packSize,
              unit: "Units",
              unitPrice: item.unitPrice,
              totalDelivered: 0,
              previouslyReturned: 0,
              currentlyReturnable: 0,
            }
          }
          productMap[item.productId].totalDelivered += item.quantity
        })
      })

    // 2. Gather all previously returned quantities across all return records for this customer
    returns
      .filter((r) => r.customerId === formCustomerId)
      .forEach((ret) => {
        ret.items.forEach((item) => {
          if (productMap[item.productId]) {
            productMap[item.productId].previouslyReturned += item.returnedQuantity
          }
        })
      })

    // 3. Compute currently returnable quantity: Total Delivered - Previously Returned
    return Object.values(productMap).map((p) => ({
      ...p,
      currentlyReturnable: Math.max(0, p.totalDelivered - p.previouslyReturned),
    }))
  }, [orders, returns, formCustomerId])

  // Filter products for search autocomplete (only returnable products matching query)
  const matchingSearchProducts = React.useMemo(() => {
    const q = productSearchQuery.trim().toLowerCase()
    if (!q) return []
    return customerDeliveredProducts.filter((p) => {
      const matches =
        p.productName.toLowerCase().includes(q) ||
        p.productCode.toLowerCase().includes(q)
      return matches && p.currentlyReturnable > 0
    })
  }, [customerDeliveredProducts, productSearchQuery])

  // Add product to return table from search dropdown
  const handleAddProduct = (prod: CustomerDeliveredProduct) => {
    if (!addedProductIds.includes(prod.productId)) {
      setAddedProductIds((prev) => [...prev, prod.productId])
      setReturnQuantities((prev) => ({
        ...prev,
        [prod.productId]: prev[prod.productId] || "1",
      }))
    }
    setProductSearchQuery("")
    setFormError("")
  }

  // Remove product from return table
  const handleRemoveProduct = (productId: string) => {
    setAddedProductIds((prev) => prev.filter((id) => id !== productId))
    setReturnQuantities((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
    setFormError("")
  }

  // Set quantity for a product in table
  const handleSetProductQuantity = (productId: string, val: string, maxReturnable: number) => {
    if (val === "") {
      setReturnQuantities((prev) => ({ ...prev, [productId]: "" }))
      return
    }
    const num = parseInt(val, 10)
    if (isNaN(num)) return
    const clamped = Math.min(maxReturnable, Math.max(0, num))
    setReturnQuantities((prev) => ({ ...prev, [productId]: String(clamped) }))
    setFormError("")
  }

  // Active return items being processed
  const activeReturnItems = React.useMemo<SummaryReturnItem[]>(() => {
    return addedProductIds
      .map((id) => customerDeliveredProducts.find((p) => p.productId === id))
      .filter((p): p is CustomerDeliveredProduct => !!p && p.currentlyReturnable > 0)
      .map((p) => {
        const rawQty = returnQuantities[p.productId]
        const qty = parseInt(rawQty || "0", 10)
        const safeQty = Math.min(p.currentlyReturnable, Math.max(0, isNaN(qty) ? 0 : qty))
        return {
          productId: p.productId,
          productCode: p.productCode,
          productName: p.productName,
          packSize: p.packSize,
          unit: p.unit,
          unitPrice: p.unitPrice,
          deliveredQuantity: p.totalDelivered,
          returnedQuantity: safeQty,
          returnAmount: safeQty * p.unitPrice,
          currentlyReturnable: p.currentlyReturnable,
        }
      })
      .filter((item) => item.returnedQuantity > 0)
  }, [addedProductIds, customerDeliveredProducts, returnQuantities])

  const totalSummaryUnits = React.useMemo(() => {
    return activeReturnItems.reduce((sum, item) => sum + item.returnedQuantity, 0)
  }, [activeReturnItems])

  const totalSummaryRefundAmount = React.useMemo(() => {
    return activeReturnItems.reduce((sum, item) => sum + item.returnAmount, 0)
  }, [activeReturnItems])

  // Process Return Submit Handler
  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")

    if (!formCustomerId || !selectedCustomer) {
      setFormError("Please search and select a customer.")
      return
    }

    if (activeReturnItems.length === 0) {
      setFormError("Please select at least one product and enter a return quantity greater than 0.")
      return
    }

    const autoSubmissionDate = formatDateTime(new Date())
    const targetDepot = customerAutoDepot

    // 1. Create Return Record
    const newReturnItem: ProductReturnItem = {
      id: `ret-${Date.now()}`,
      code: `RET-${Date.now()}`,
      customerId: selectedCustomer.id,
      customerCode: selectedCustomer.code,
      customerName: selectedCustomer.name,
      shopName: selectedCustomer.shopName,
      depotId: targetDepot.depotId,
      depotName: targetDepot.depotName,
      date: autoSubmissionDate,
      recordedBy: "Admin (Warehouse)",
      totalReturnedQuantity: totalSummaryUnits,
      totalReturnAmount: totalSummaryRefundAmount,
      items: activeReturnItems.map((item) => ({
        productId: item.productId,
        productCode: item.productCode,
        productName: item.productName,
        packSize: item.packSize,
        unit: item.unit,
        unitPrice: item.unitPrice,
        deliveredQuantity: item.deliveredQuantity,
        returnedQuantity: item.returnedQuantity,
        returnAmount: item.returnAmount,
      })),
    }

    // 2. Automatically Restock returned items to the customer's associated Depot
    setDepotStocks((prevStocks) => {
      const currentDepotStock = prevStocks[targetDepot.depotId] || []
      const updatedDepotStock = [...currentDepotStock]

      activeReturnItems.forEach((retItem) => {
        const existingStockIdx = updatedDepotStock.findIndex(
          (s) => s.productId === retItem.productId
        )
        if (existingStockIdx >= 0) {
          updatedDepotStock[existingStockIdx] = {
            ...updatedDepotStock[existingStockIdx],
            quantity: updatedDepotStock[existingStockIdx].quantity + retItem.returnedQuantity,
          }
        }
      })

      return {
        ...prevStocks,
        [targetDepot.depotId]: updatedDepotStock,
      }
    })

    // 3. Automatically adjust customer's financial balance/outstanding
    const updatedCustomers = customers.map((c) => {
      if (c.id === formCustomerId) {
        const curBal = c.outstandingBalance || 0
        return {
          ...c,
          outstandingBalance: Math.max(0, curBal - totalSummaryRefundAmount),
        }
      }
      return c
    })

    // 4. Adjust customer's invoice dues proportionally/FIFO so invoice records stay synchronized
    let remainingCreditToApply = totalSummaryRefundAmount
    const updatedOrders = orders.map((o) => {
      if (o.customerId === formCustomerId && o.status === "Approved" && remainingCreditToApply > 0) {
        const curDue = typeof o.dueAmount === "number" ? o.dueAmount : o.grandTotal
        if (curDue > 0) {
          const deduction = Math.min(remainingCreditToApply, curDue)
          remainingCreditToApply -= deduction
          const newReturned = (o.returnedAmount || 0) + deduction
          const newDue = Math.max(0, curDue - deduction)
          return {
            ...o,
            returnedAmount: newReturned,
            dueAmount: newDue,
            paymentStatus: newDue === 0 ? ("Paid" as const) : o.paymentStatus,
          }
        }
      }
      return o
    })

    setOrders(updatedOrders)
    setCustomers(updatedCustomers)
    setReturns([newReturnItem, ...returns])
    setIsAddModalOpen(false)
    showToast(
      `Product Return processed! ৳${totalSummaryRefundAmount.toLocaleString()} credited to ${selectedCustomer.name} and ${totalSummaryUnits} units restocked to ${targetDepot.depotName}.`
    )
  }

  // Filtered Returns
  const filteredReturns = React.useMemo(() => {
    return returns.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        item.customerName.toLowerCase().includes(q) ||
        item.shopName.toLowerCase().includes(q) ||
        item.customerCode.toLowerCase().includes(q) ||
        item.items.some((i) => i.productName.toLowerCase().includes(q))

      const matchDepot = depotFilter === "all" || item.depotId === depotFilter
      const matchCust = selectedCustomerFilter === "all" || item.customerId === selectedCustomerFilter

      return matchSearch && matchDepot && matchCust
    })
  }, [returns, searchQuery, depotFilter, selectedCustomerFilter])

  // Aggregate Metrics
  const metrics = React.useMemo(() => {
    const totalReturnValue = returns.reduce((sum, r) => sum + r.totalReturnAmount, 0)
    const totalUnitsReturned = returns.reduce((sum, r) => sum + r.totalReturnedQuantity, 0)
    return {
      totalReturnValue,
      totalUnitsReturned,
      totalTransactions: returns.length,
    }
  }, [returns])

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
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Product Returns</h1>
              <p className="text-sm text-slate-500">
                Customer & product-based returns with automatic depot restocking and balance adjustment.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => openAddModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Process Return
          </Button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Return Value
              </span>
              <div className="text-xl font-bold text-amber-700 mt-0.5">
                ৳{metrics.totalReturnValue.toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Across {metrics.totalTransactions} return transactions
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <RotateCcw className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Restocked Units
              </span>
              <div className="text-xl font-bold text-slate-900 mt-0.5">
                {metrics.totalUnitsReturned.toLocaleString()} Units
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Restored back into active depot inventory
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Boxes className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-slate-200 shadow-xs">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search customer, shop, product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 text-sm focus:bg-white"
              />
            </div>

            {/* Depot Filter */}
            <div>
              <select
                value={depotFilter}
                onChange={(e) => setDepotFilter(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Restocked Depots</option>
                {depots.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Filter */}
            <div>
              <select
                value={selectedCustomerFilter}
                onChange={(e) => setSelectedCustomerFilter(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Customers</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shopName})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Filters */}
            <div className="flex items-center justify-end">
              {(searchQuery || depotFilter !== "all" || selectedCustomerFilter !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("")
                    setDepotFilter("all")
                    setSelectedCustomerFilter("all")
                  }}
                  className="text-slate-500 hover:text-slate-700 text-xs"
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card className="border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">SL</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Restocked Depot</th>
                <th className="py-3.5 px-4">Customer & Shop</th>
                <th className="py-3.5 px-4 text-right">Return Amount</th>
                <th className="py-3.5 px-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RotateCcw className="h-8 w-8 text-slate-300" />
                      <p className="font-medium text-slate-700">No product return records found</p>
                      <p className="text-xs text-slate-400">
                        Try adjusting your filters or process a new customer product return.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret, index) => (
                  <tr key={ret.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-mono text-xs">
                      {index + 1}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                      {ret.date}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-700">
                        <Building2 className="h-3 w-3 text-slate-400" />
                        {ret.depotName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <Link
                          href={`/customers/${ret.customerId}`}
                          className="font-medium text-slate-900 hover:text-emerald-600 hover:underline transition-colors"
                        >
                          {ret.customerName}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Store className="h-3 w-3 text-slate-400" />
                          <span>{ret.shopName}</span>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-slate-400">{ret.customerCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span className="text-base font-bold text-amber-700 font-mono">
                        ৳{ret.totalReturnAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSlip(ret)}
                        className="h-8 border-slate-200 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-xs flex items-center gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Slip
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
      {/* MULTI-PRODUCT RETURN MODAL */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <RotateCcw className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Process Product Return</h3>
                  <p className="text-xs text-slate-500">
                    Select customer, choose multiple products, specify return quantities together, and restock to depot.
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

            <form onSubmit={handleProcessReturn} className="p-6 space-y-5">
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
                          matchingSearchCustomers.map((cust) => (
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
                                  ৳{(cust.outstandingBalance || 0).toLocaleString()}
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
                      className="h-7 text-xs text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/60 flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Change Customer
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-500 block uppercase font-medium">Customer Details</span>
                      <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                        {selectedCustomer.name}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {selectedCustomer.shopName} ({selectedCustomer.code})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block uppercase font-medium">
                        Assigned Officer & Area
                      </span>
                      <span className="font-semibold text-slate-800 text-sm mt-0.5 block">
                        {selectedCustomer.officerName || "Assigned Officer"}
                      </span>
                      <span className="text-slate-500 text-[11px]">{selectedCustomer.areaName}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block uppercase font-medium">
                        Auto-Restocked Depot
                      </span>
                      <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5 mt-0.5">
                        <Building2 className="h-4 w-4 text-emerald-600" />
                        {customerAutoDepot.depotName}
                      </span>
                      <span className="text-slate-400 text-[11px]">From business hierarchy</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block uppercase font-medium">
                        Current Outstanding Balance
                      </span>
                      <span className="font-bold text-amber-700 text-sm font-mono mt-0.5 block">
                        ৳{(selectedCustomer.outstandingBalance || 0).toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-[11px]">Will be adjusted on return</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Product Search & Dynamic Return Table */}
              {selectedCustomer && (
                <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                  {/* Search Input for Products */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-amber-600" />
                      Search Product to Return
                    </Label>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Type delivered product name or SKU code to search and add to table..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="pl-9 bg-white border-slate-300 text-sm focus:border-amber-500"
                      />

                      {/* Matching Products Autocomplete Dropdown */}
                      {productSearchQuery.trim() && (
                        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                          {matchingSearchProducts.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-500">
                              No delivered returnable products found matching &ldquo;{productSearchQuery}&rdquo;.
                            </div>
                          ) : (
                            matchingSearchProducts.map((prod) => {
                              const isAlreadyAdded = addedProductIds.includes(prod.productId)
                              return (
                                <button
                                  key={prod.productId}
                                  type="button"
                                  onClick={() => handleAddProduct(prod)}
                                  className="w-full flex items-center justify-between p-3 text-left text-xs transition-colors hover:bg-amber-50/70 border-b border-slate-100 last:border-0 cursor-pointer"
                                >
                                  <div>
                                    <div className="font-bold text-slate-900 text-sm">{prod.productName}</div>
                                    <div className="text-slate-500 font-mono text-[11px] mt-0.5">
                                      {prod.productCode} • {prod.packSize}
                                    </div>
                                  </div>
                                  <div className="text-right flex items-center gap-3">
                                    <div>
                                      <span className="text-[11px] text-slate-400 block">Unit Price</span>
                                      <span className="font-bold text-slate-800 font-mono text-sm">
                                        ৳{prod.unitPrice.toLocaleString()}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 font-mono">
                                        {prod.currentlyReturnable} Returnable
                                      </span>
                                      {isAlreadyAdded && (
                                        <span className="block text-[10px] text-amber-700 font-medium mt-0.5">
                                          Added in table
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
                  {addedProductIds.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-xs text-slate-500">
                      <Package className="h-7 w-7 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">No products added to return table yet</p>
                      <p className="text-slate-400 mt-1">
                        Type product name or code in the search box above, then click to add it to the table.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xs">
                      <div className="overflow-x-auto max-h-72">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                              <th className="py-2.5 px-3">Product Name & Code</th>
                              <th className="py-2.5 px-3">Pack Size</th>
                              <th className="py-2.5 px-3 text-right">Price (৳)</th>
                              <th className="py-2.5 px-3 text-center">Returnable Limit</th>
                              <th className="py-2.5 px-3 text-center w-32">Return Qty</th>
                              <th className="py-2.5 px-3 text-right font-bold text-amber-800">
                                Line Value (৳)
                              </th>
                              <th className="py-2.5 px-3 text-center w-12">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {addedProductIds.map((prodId) => {
                              const prod = customerDeliveredProducts.find((p) => p.productId === prodId)
                              if (!prod) return null
                              const qtyVal = returnQuantities[prod.productId] ?? "1"
                              const numQty = parseInt(qtyVal || "0", 10)
                              const lineTotal = numQty * prod.unitPrice

                              return (
                                <tr key={prod.productId} className="hover:bg-slate-50/80 transition-colors">
                                  {/* Product Details */}
                                  <td className="py-2.5 px-3">
                                    <div className="font-semibold text-slate-900">{prod.productName}</div>
                                    <div className="font-mono text-slate-400 text-[11px]">
                                      {prod.productCode}
                                    </div>
                                  </td>

                                  {/* Pack Size */}
                                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                                    {prod.packSize}
                                  </td>

                                  {/* Selling Price */}
                                  <td className="py-2.5 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                                    ৳{prod.unitPrice.toLocaleString()}
                                  </td>

                                  {/* Returnable Limit */}
                                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 font-mono">
                                      {prod.currentlyReturnable} Units
                                    </span>
                                  </td>

                                  {/* Return Quantity Input (No Max button) */}
                                  <td className="py-2.5 px-3">
                                    <div className="flex items-center justify-center">
                                      <Input
                                        type="number"
                                        min="1"
                                        max={prod.currentlyReturnable}
                                        value={qtyVal}
                                        onChange={(e) =>
                                          handleSetProductQuantity(
                                            prod.productId,
                                            e.target.value,
                                            prod.currentlyReturnable
                                          )
                                        }
                                        className="h-8 w-24 text-center font-mono font-bold text-xs border-amber-400 bg-amber-50 text-amber-900 focus:bg-white focus:border-amber-600"
                                      />
                                    </div>
                                  </td>

                                  {/* Line Value */}
                                  <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                                    {numQty > 0 ? (
                                      <span className="text-amber-800 font-bold">
                                        ৳{lineTotal.toLocaleString()}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300">৳0</span>
                                    )}
                                  </td>

                                  {/* Action / Remove */}
                                  <td className="py-2.5 px-3 text-center">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveProduct(prod.productId)}
                                      className="h-7 w-7 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                      title="Remove from return list"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Live Financial & Restock Impact Preview */}
              {selectedCustomer && activeReturnItems.length > 0 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-4 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <RotateCcw className="h-4 w-4 text-amber-600" />
                      Live Return Impact & Restocking Preview ({activeReturnItems.length} Products Selected)
                    </span>
                    <span className="text-xs text-amber-800">
                      Total Units:{" "}
                      <strong className="font-mono font-bold">
                        {totalSummaryUnits} Units
                      </strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="rounded-md bg-white p-2.5 border border-amber-100">
                      <span className="text-slate-500 block">Restock Destination</span>
                      <span className="font-bold text-emerald-800 mt-0.5 block">
                        {customerAutoDepot.depotName} (+{totalSummaryUnits} items)
                      </span>
                    </div>

                    <div className="rounded-md bg-white p-2.5 border border-amber-100">
                      <span className="text-slate-500 block">Total Return Credit Value</span>
                      <span className="font-bold text-amber-700 font-mono text-sm mt-0.5 block">
                        - ৳{totalSummaryRefundAmount.toLocaleString()}
                      </span>
                    </div>

                    <div className="rounded-md bg-white p-2.5 border border-amber-100">
                      <span className="text-slate-500 block">Adjusted Customer Outstanding</span>
                      <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
                        ৳
                        {Math.max(
                          0,
                          (selectedCustomer.outstandingBalance || 0) - totalSummaryRefundAmount
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-slate-300 text-slate-700 hover:bg-slate-100 text-sm cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedCustomer || activeReturnItems.length === 0}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  Confirm & Process Return {activeReturnItems.length > 0 && `(৳${totalSummaryRefundAmount.toLocaleString()})`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW RETURN SLIP MODAL */}
      {/* ========================================================================= */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Product Return Voucher</h3>
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
                  onClick={() => setSelectedSlip(null)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Slip Body */}
            <div className="p-6 space-y-6">
              {/* Top Branding */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <div className="text-xl font-black tracking-tight text-emerald-800">
                    EAKIN ANIMAL HEALTH
                  </div>
                  <p className="text-xs text-slate-500">
                    Veterinary Pharmaceuticals & Animal Nutrition
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Goods Return Voucher (GRV)</p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">{selectedSlip.date}</div>
                </div>
              </div>

              {/* Customer & Return Dispatch Details Grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Returned By Customer:
                  </span>
                  <div className="font-bold text-slate-900 text-sm">
                    {selectedSlip.customerName}
                  </div>
                  <div className="text-slate-600 font-medium">{selectedSlip.shopName}</div>
                  <div className="text-slate-500 font-mono mt-0.5">
                    Customer ID: {selectedSlip.customerCode}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Restock Dispatch Details:
                  </span>
                  <div className="text-slate-700">
                    <span className="text-slate-500">Restocked To:</span>{" "}
                    <strong>{selectedSlip.depotName}</strong>
                  </div>
                  <div className="text-slate-700 mt-0.5">
                    <span className="text-slate-500">Recorded By:</span> {selectedSlip.recordedBy}
                  </div>
                </div>
              </div>

              {/* Returned Items Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Itemized Returned Products
                </h4>
                <div className="overflow-hidden rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3">Pack Size</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-center">Returned Qty</th>
                        <th className="py-2.5 px-3 text-right font-bold text-amber-800">
                          Total Value
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSlip.items.map((item) => (
                        <tr key={item.productId} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-medium text-slate-900">
                            {item.productName}
                            <span className="block font-mono text-[11px] text-slate-400">
                              {item.productCode}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{item.packSize}</td>
                          <td className="py-2.5 px-3 text-right font-mono">
                            ৳{item.unitPrice.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-amber-700">
                            {item.returnedQuantity}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-800">
                            ৳{item.returnAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Block */}
              <div className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-200 p-4">
                <div>
                  <span className="text-xs font-semibold text-amber-800 uppercase block">
                    Total Units Restocked
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {selectedSlip.totalReturnedQuantity} Units
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-amber-800 uppercase block">
                    Total Return Credit Value
                  </span>
                  <span className="text-2xl font-black text-amber-800 font-mono">
                    ৳{selectedSlip.totalReturnAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50 px-6 py-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSlip(null)}
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
