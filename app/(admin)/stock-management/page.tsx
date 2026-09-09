"use client"

import * as React from "react"
import Link from "next/link"
import {
  Boxes,
  Building2,
  Plus,
  ArrowRightLeft,
  History,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  X,
  Package,
  Layers,
  Trash2,
  Eye,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Store,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import {
  initialDepots,
  initialDepotStocks,
  initialTransfers,
  initialStockMovements,
  initialCustomers,
  productCatalog,
  type Depot,
  type DepotStockItem,
  type StockTransfer,
  type TransferProductItem,
  type StockMovement,
  type Product,
  type CustomerItem,
} from "@/lib/mock-data"
import { formatDateTime } from "@/lib/utils"

interface AddStockRow {
  rowId: string
  productId: string
  quantity: string
}

interface TransferRow {
  rowId: string
  productId: string
  quantity: string
}

export default function StockManagementPage() {
  const { currentRole, currentRM, currentAM, currentOfficer, areas, getOfficerAssignedDepot } = useAppState()
  const [depots] = React.useState<Depot[]>(initialDepots)
  const [catalog] = React.useState<Product[]>(productCatalog)
  const [depotStocks, setDepotStocks] = React.useState<Record<string, DepotStockItem[]>>(initialDepotStocks)
  const [transfers, setTransfers] = React.useState<StockTransfer[]>(initialTransfers)
  const [movements, setMovements] = React.useState<StockMovement[]>(initialStockMovements)

  // Active Tab: "depot-stock" | "transfers" | "movement-history"
  const [activeTab, setActiveTab] = React.useState<"depot-stock" | "transfers" | "movement-history">("depot-stock")

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

  // Filters State for Depot Stock Tab
  const [selectedDepotFilter, setSelectedDepotFilter] = React.useState<string>("all")
  const [searchStockQuery, setSearchStockQuery] = React.useState<string>("")

  // Modals
  const [isAddStockOpen, setIsAddStockOpen] = React.useState(false)
  const [isTransferOpen, setIsTransferOpen] = React.useState(false)
  const [isReturnOpen, setIsReturnOpen] = React.useState(false)
  const [selectedDrilldownItem, setSelectedDrilldownItem] = React.useState<{
    depotId: string
    depotName: string
    productId: string
    productName: string
    productCode: string
    packSize: string
    quantity: number
  } | null>(null)
  const [selectedTransferDetails, setSelectedTransferDetails] = React.useState<StockTransfer | null>(null)

  // Form States
  // 1. Add Stock Form State
  const [addStockDepotId, setAddStockDepotId] = React.useState<string>(depots[0]?.id || "dep-1")
  const [addStockRows, setAddStockRows] = React.useState<AddStockRow[]>([])
  const [addStockError, setAddStockError] = React.useState<string>("")

  // 2. Transfer Form State (Multi-Product Depot-to-Depot)
  const [sourceDepotId, setSourceDepotId] = React.useState<string>(depots[0]?.id || "dep-1")
  const [destinationDepotId, setDestinationDepotId] = React.useState<string>(depots[1]?.id || "dep-2")
  const [transferRows, setTransferRows] = React.useState<TransferRow[]>([])
  const [transferError, setTransferError] = React.useState<string>("")

  // 3. Return Form State
  const [returnDepotId, setReturnDepotId] = React.useState<string>(depots[0]?.id || "dep-1")
  const [returnCustomerId, setReturnCustomerId] = React.useState<string>(initialCustomers[0]?.id || "cust-1")
  const [returnProductId, setReturnProductId] = React.useState<string>(catalog[0]?.id || "")
  const [returnQuantity, setReturnQuantity] = React.useState<string>("10")
  const [returnReason, setReturnReason] = React.useState<string>("Customer Pharmacy Return")
  const [returnError, setReturnError] = React.useState<string>("")

  // Toast
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Flattened stock items across all depots for table & filtering
  const allDepotStockList = React.useMemo(() => {
    const list: Array<{
      depotId: string
      depotName: string
      depotCode: string
      productId: string
      productCode: string
      productName: string
      packSize: string
      quantity: number
      minThreshold: number
    }> = []

    depots.forEach((depot) => {
      const stockList = depotStocks[depot.id] || []
      stockList.forEach((item) => {
        list.push({
          depotId: depot.id,
          depotName: depot.name,
          depotCode: depot.code,
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          packSize: item.packSize,
          quantity: item.quantity,
          minThreshold: item.minThreshold,
        })
      })
    })

    return list
  }, [depots, depotStocks])

  // Filtered Depot Stock Items (RM & AM are locked to their assigned depot)
  const filteredDepotStock = React.useMemo(() => {
    return allDepotStockList.filter((item) => {
      if (isRestrictedStaff && assignedDepot) {
        if (item.depotId !== assignedDepot.id) {
          return false
        }
      } else if (selectedDepotFilter !== "all" && item.depotId !== selectedDepotFilter) {
        return false
      }
      if (searchStockQuery.trim()) {
        const q = searchStockQuery.toLowerCase().trim()
        const matchName = item.productName.toLowerCase().includes(q)
        const matchCode = item.productCode.toLowerCase().includes(q)
        const matchDepot = item.depotName.toLowerCase().includes(q)
        const matchPack = item.packSize.toLowerCase().includes(q)
        if (!matchName && !matchCode && !matchDepot && !matchPack) {
          return false
        }
      }
      return true
    })
  }, [allDepotStockList, isRestrictedStaff, assignedDepot, selectedDepotFilter, searchStockQuery])

  // Metrics (Reflect assigned depot items for RM/AM)
  const totalStockQuantity = React.useMemo(() => {
    if (isRestrictedStaff && assignedDepot) {
      return allDepotStockList
        .filter((item) => item.depotId === assignedDepot.id)
        .reduce((acc, curr) => acc + curr.quantity, 0)
    }
    return allDepotStockList.reduce((acc, curr) => acc + curr.quantity, 0)
  }, [allDepotStockList, isRestrictedStaff, assignedDepot])

  const filteredTransfers = React.useMemo(() => {
    if (isRestrictedStaff && assignedDepot) {
      return transfers.filter(
        (t) => t.sourceDepotId === assignedDepot.id || t.destinationDepotId === assignedDepot.id
      )
    }
    return transfers
  }, [transfers, isRestrictedStaff, assignedDepot])

  const filteredMovements = React.useMemo(() => {
    if (isRestrictedStaff && assignedDepot) {
      return movements.filter((m) => m.depotId === assignedDepot.id)
    }
    return movements
  }, [movements, isRestrictedStaff, assignedDepot])

  const totalTransfersCompleted = React.useMemo(() => filteredTransfers.length, [filteredTransfers])

  // Helper: Get product available stock at a depot
  const getProductStockAtDepot = React.useCallback(
    (depotId: string, productId: string): number => {
      const list = depotStocks[depotId] || []
      const found = list.find((i) => i.productId === productId)
      return found ? found.quantity : 0
    },
    [depotStocks]
  )

  // =========================================================
  // ADD STOCK HANDLERS
  // =========================================================
  const handleOpenAddStock = (preselectedDepotId?: string, preselectedProductId?: string) => {
    const depotToUse = preselectedDepotId || depots[0]?.id || "dep-1"
    setAddStockDepotId(depotToUse)
    const initialProd = preselectedProductId || catalog[0]?.id || ""
    setAddStockRows([
      {
        rowId: `add-${Date.now()}-1`,
        productId: initialProd,
        quantity: "50",
      },
    ])
    setAddStockError("")
    setIsAddStockOpen(true)
  }

  const handleAddStockAddRow = () => {
    const chosenProductIds = new Set(addStockRows.map((r) => r.productId))
    const nextProd = catalog.find((p) => !chosenProductIds.has(p.id))?.id || catalog[0]?.id || ""
    setAddStockRows((prev) => [
      ...prev,
      {
        rowId: `add-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: nextProd,
        quantity: "50",
      },
    ])
  }

  const handleRemoveAddStockRow = (rowId: string) => {
    if (addStockRows.length <= 1) {
      setAddStockError("At least one product is required.")
      return
    }
    setAddStockRows((prev) => prev.filter((r) => r.rowId !== rowId))
    setAddStockError("")
  }

  const handleSaveAddStock = (e: React.FormEvent) => {
    e.preventDefault()
    if (!addStockDepotId) {
      setAddStockError("Please select a target depot.")
      return
    }

    // Validate quantities
    for (const row of addStockRows) {
      const qty = parseInt(row.quantity, 10)
      if (isNaN(qty) || qty <= 0) {
        setAddStockError("All stock quantities must be positive whole numbers.")
        return
      }
    }

    const targetDepot = depots.find((d) => d.id === addStockDepotId)
    const dateStr = formatDateTime(new Date())

    // Update state
    setDepotStocks((prev) => {
      const updated = { ...prev }
      const currentList = [...(updated[addStockDepotId] || [])]

      addStockRows.forEach((row) => {
        const prod = catalog.find((p) => p.id === row.productId)
        if (!prod) return
        const qty = parseInt(row.quantity, 10)
        const idx = currentList.findIndex((i) => i.productId === prod.id)

        if (idx >= 0) {
          const newQty = currentList[idx].quantity + qty
          currentList[idx] = { ...currentList[idx], quantity: newQty }
          // Log movement
          setMovements((mPrev) => [
            {
              id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              date: dateStr,
              movementType: "Stock Added",
              depotId: targetDepot?.id || addStockDepotId,
              depotName: targetDepot?.name || "Depot",
              productId: prod.id,
              productCode: prod.code,
              productName: prod.name,
              packSize: prod.packSize,
              quantity: qty,
              balance: newQty,
              reference: `Manual Stock Entry`,
            },
            ...mPrev,
          ])
        } else {
          currentList.push({
            productId: prod.id,
            productCode: prod.code,
            productName: prod.name,
            packSize: prod.packSize,
            quantity: qty,
            minThreshold: 20,
          })
          setMovements((mPrev) => [
            {
              id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              date: dateStr,
              movementType: "Stock Added",
              depotId: targetDepot?.id || addStockDepotId,
              depotName: targetDepot?.name || "Depot",
              productId: prod.id,
              productCode: prod.code,
              productName: prod.name,
              packSize: prod.packSize,
              quantity: qty,
              balance: qty,
              reference: `Initial Stock Added`,
            },
            ...mPrev,
          ])
        }
      })

      updated[addStockDepotId] = currentList
      return updated
    })

    showToast(`Stock added successfully to ${targetDepot?.name}.`)
    setIsAddStockOpen(false)
  }

  // =========================================================
  // MULTI-PRODUCT DEPOT-TO-DEPOT TRANSFER HANDLERS
  // =========================================================
  const handleOpenTransferModal = () => {
    const defaultSource = depots[0]?.id || "dep-1"
    const defaultDest = depots[1]?.id || "dep-2"
    setSourceDepotId(defaultSource)
    setDestinationDepotId(defaultDest)

    const sourceStocks = depotStocks[defaultSource] || []
    const initialProduct = sourceStocks[0]?.productId || catalog[0]?.id || ""

    setTransferRows([
      {
        rowId: `trf-${Date.now()}-1`,
        productId: initialProduct,
        quantity: "10",
      },
    ])
    setTransferError("")
    setIsTransferOpen(true)
  }

  const handleAddTransferRow = () => {
    const sourceStocks = depotStocks[sourceDepotId] || []
    const chosenProductIds = new Set(transferRows.map((r) => r.productId))
    const availableItem = sourceStocks.find((s) => !chosenProductIds.has(s.productId))
    const fallback = catalog.find((c) => !chosenProductIds.has(c.id))

    const newProdId = availableItem?.productId || fallback?.id || catalog[0]?.id || ""

    setTransferRows((prev) => [
      ...prev,
      {
        rowId: `trf-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: newProdId,
        quantity: "10",
      },
    ])
    setTransferError("")
  }

  const handleRemoveTransferRow = (rowId: string) => {
    if (transferRows.length <= 1) {
      setTransferError("Transfer must contain at least one product.")
      return
    }
    setTransferRows((prev) => prev.filter((r) => r.rowId !== rowId))
    setTransferError("")
  }

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault()

    if (!sourceDepotId || !destinationDepotId) {
      setTransferError("Please select both Source and Destination depots.")
      return
    }

    if (sourceDepotId === destinationDepotId) {
      setTransferError("Source Depot and Destination Depot must be different.")
      return
    }

    // Check duplicate products in rows
    const seenProducts = new Set<string>()
    for (const row of transferRows) {
      if (seenProducts.has(row.productId)) {
        setTransferError("Each product should only appear once in a single transfer transaction.")
        return
      }
      seenProducts.add(row.productId)
    }

    // Validate quantities against available source stock
    const sourceStockList = depotStocks[sourceDepotId] || []
    const transferItems: TransferProductItem[] = []

    for (const row of transferRows) {
      const qty = parseInt(row.quantity, 10)
      if (isNaN(qty) || qty <= 0) {
        setTransferError("All transfer quantities must be positive whole numbers.")
        return
      }

      const availableInSource = sourceStockList.find((i) => i.productId === row.productId)?.quantity || 0
      const prod = catalog.find((p) => p.id === row.productId)

      if (qty > availableInSource) {
        setTransferError(
          `Insufficient stock for "${prod?.name || 'Product'}". Available: ${availableInSource}, Requested: ${qty}`
        )
        return
      }

      if (prod) {
        transferItems.push({
          productId: prod.id,
          productCode: prod.code,
          productName: prod.name,
          packSize: prod.packSize,
          quantity: qty,
        })
      }
    }

    const sourceDepot = depots.find((d) => d.id === sourceDepotId)
    const destinationDepot = depots.find((d) => d.id === destinationDepotId)

    const dateStr = formatDateTime(new Date())
    const transferCode = `TRF-${String(transfers.length + 1).padStart(6, "0")}`

    const newTransfer: StockTransfer = {
      id: `tx-${Date.now()}`,
      code: transferCode,
      sourceDepotId,
      sourceDepotName: sourceDepot?.name || "Source Depot",
      destinationDepotId,
      destinationDepotName: destinationDepot?.name || "Destination Depot",
      items: transferItems,
      totalQuantity: transferItems.reduce((sum, item) => sum + item.quantity, 0),
      totalProducts: transferItems.length,
      date: dateStr,
      status: "Completed",
    }

    // Execute transfer: Decrement Source Depot, Increment Destination Depot
    setDepotStocks((prev) => {
      const updated = { ...prev }

      // 1. Decrement Source
      const newSourceList = [...(updated[sourceDepotId] || [])].map((item) => {
        const transferItem = transferItems.find((t) => t.productId === item.productId)
        if (transferItem) {
          const newQty = Math.max(0, item.quantity - transferItem.quantity)
          // Log movement for Source (Transfer Out)
          setMovements((mPrev) => [
            {
              id: `mov-${Date.now()}-out-${item.productId}`,
              date: dateStr,
              movementType: "Transfer Out",
              depotId: sourceDepotId,
              depotName: sourceDepot?.name || "Source Depot",
              productId: item.productId,
              productCode: item.productCode,
              productName: item.productName,
              packSize: item.packSize,
              quantity: transferItem.quantity,
              balance: newQty,
              reference: `${transferCode} (To ${destinationDepot?.name})`,
            },
            ...mPrev,
          ])
          return { ...item, quantity: newQty }
        }
        return item
      })
      updated[sourceDepotId] = newSourceList

      // 2. Increment Destination
      const newDestList = [...(updated[destinationDepotId] || [])]
      transferItems.forEach((transferItem) => {
        const idx = newDestList.findIndex((i) => i.productId === transferItem.productId)
        if (idx >= 0) {
          const newQty = newDestList[idx].quantity + transferItem.quantity
          newDestList[idx] = { ...newDestList[idx], quantity: newQty }
          // Log movement for Destination (Transfer In)
          setMovements((mPrev) => [
            {
              id: `mov-${Date.now()}-in-${transferItem.productId}`,
              date: dateStr,
              movementType: "Transfer In",
              depotId: destinationDepotId,
              depotName: destinationDepot?.name || "Destination Depot",
              productId: transferItem.productId,
              productCode: transferItem.productCode,
              productName: transferItem.productName,
              packSize: transferItem.packSize,
              quantity: transferItem.quantity,
              balance: newQty,
              reference: `${transferCode} (From ${sourceDepot?.name})`,
            },
            ...mPrev,
          ])
        } else {
          newDestList.push({
            productId: transferItem.productId,
            productCode: transferItem.productCode,
            productName: transferItem.productName,
            packSize: transferItem.packSize,
            quantity: transferItem.quantity,
            minThreshold: 20,
          })
          setMovements((mPrev) => [
            {
              id: `mov-${Date.now()}-in-${transferItem.productId}`,
              date: dateStr,
              movementType: "Transfer In",
              depotId: destinationDepotId,
              depotName: destinationDepot?.name || "Destination Depot",
              productId: transferItem.productId,
              productCode: transferItem.productCode,
              productName: transferItem.productName,
              packSize: transferItem.packSize,
              quantity: transferItem.quantity,
              balance: transferItem.quantity,
              reference: `${transferCode} (From ${sourceDepot?.name})`,
            },
            ...mPrev,
          ])
        }
      })
      updated[destinationDepotId] = newDestList

      return updated
    })

    setTransfers((prev) => [newTransfer, ...prev])
    showToast(`Transfer ${transferCode} completed successfully: ${transferItems.length} products transferred.`)
    setIsTransferOpen(false)
  }

  // =========================================================
  // PRODUCT RETURN HANDLERS
  // =========================================================
  const handleSaveReturn = (e: React.FormEvent) => {
    e.preventDefault()
    const qty = parseInt(returnQuantity, 10)
    if (isNaN(qty) || qty <= 0) {
      setReturnError("Please enter a valid return quantity.")
      return
    }

    const targetDepot = depots.find((d) => d.id === returnDepotId)
    const targetProd = catalog.find((p) => p.id === returnProductId)
    const targetCust = initialCustomers.find((c) => c.id === returnCustomerId) || initialCustomers[0]
    if (!targetProd) return

    const dateStr = formatDateTime(new Date())

    setDepotStocks((prev) => {
      const updated = { ...prev }
      const list = [...(updated[returnDepotId] || [])]
      const idx = list.findIndex((i) => i.productId === targetProd.id)

      if (idx >= 0) {
        const newQty = list[idx].quantity + qty
        list[idx] = { ...list[idx], quantity: newQty }
        setMovements((mPrev) => [
          {
            id: `mov-ret-${Date.now()}`,
            date: dateStr,
            movementType: "Return",
            depotId: returnDepotId,
            depotName: targetDepot?.name || "Depot",
            productId: targetProd.id,
            productCode: targetProd.code,
            productName: targetProd.name,
            packSize: targetProd.packSize,
            quantity: qty,
            balance: newQty,
            customerId: targetCust?.id,
            customerCode: targetCust?.code,
            customerName: targetCust?.name,
            reference: returnReason || "Customer Return",
          },
          ...mPrev,
        ])
      } else {
        list.push({
          productId: targetProd.id,
          productCode: targetProd.code,
          productName: targetProd.name,
          packSize: targetProd.packSize,
          quantity: qty,
          minThreshold: 20,
        })
        setMovements((mPrev) => [
          {
            id: `mov-ret-${Date.now()}`,
            date: dateStr,
            movementType: "Return",
            depotId: returnDepotId,
            depotName: targetDepot?.name || "Depot",
            productId: targetProd.id,
            productCode: targetProd.code,
            productName: targetProd.name,
            packSize: targetProd.packSize,
            quantity: qty,
            balance: qty,
            customerId: targetCust?.id,
            customerCode: targetCust?.code,
            customerName: targetCust?.name,
            reference: returnReason || "Customer Return",
          },
          ...mPrev,
        ])
      }

      updated[returnDepotId] = list
      return updated
    })

    showToast(`Return recorded: +${qty} ${targetProd.name} added to ${targetDepot?.name}.`)
    setIsReturnOpen(false)
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-md border border-primary/30 bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-lg">
          <CheckCircle2 className="size-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Stock Management
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage multi-depot inventory levels, record stock additions, process multi-product inter-depot transfers, and handle returns.
          </p>
        </div>

        {/* Action Buttons (Admin Only) */}
        {currentRole === "admin" && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Add Stock */}
            <Button
              type="button"
              onClick={() => handleOpenAddStock()}
              size="sm"
              className="cursor-pointer gap-1.5 font-medium shadow-xs"
            >
              <Plus className="size-4" />
              <span>Add Stock</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("depot-stock")}
          className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "depot-stock"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          Depot-Wise Stock
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transfers")}
          className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "transfers"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          Depot Transfers ({filteredTransfers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("movement-history")}
          className={`cursor-pointer rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "movement-history"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          }`}
        >
          Return Log
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: DEPOT-WISE STOCK OVERVIEW                          */}
      {/* ========================================================= */}
      {activeTab === "depot-stock" && (
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="border-b border-border/70 p-4">
            <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">
                  {isRestrictedStaff && assignedDepot
                    ? `${assignedDepot.name} Inventory (${filteredDepotStock.length} items)`
                    : `Depot Inventory (${filteredDepotStock.length} items)`}
                </CardTitle>
                <div className="text-xs text-muted-foreground">
                  Total Stock Qty: <strong className="text-foreground font-mono">{totalStockQuantity.toLocaleString()}</strong>
                </div>
              </div>

              {/* Filters */}
              <div className={`grid grid-cols-1 gap-2.5 ${isRestrictedStaff ? "sm:grid-cols-1" : "sm:grid-cols-2"}`}>
                {/* 1. Depot Filter - Visible ONLY for Admin */}
                {!isRestrictedStaff && (
                  <div className="flex items-center gap-1.5 rounded border border-border/80 bg-muted/20 px-2 py-1">
                    <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                    <select
                      aria-label="Filter by Depot"
                      value={selectedDepotFilter}
                      onChange={(e) => setSelectedDepotFilter(e.target.value)}
                      className="h-7 w-full bg-transparent text-xs text-foreground outline-none cursor-pointer"
                    >
                      <option value="all">All Depots</option>
                      {depots.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 2. Search Bar */}
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="search"
                    value={searchStockQuery}
                    onChange={(e) => setSearchStockQuery(e.target.value)}
                    placeholder={isRestrictedStaff ? "Search product, code, pack size..." : "Search product, code, depot, pack size..."}
                    className="h-9 pl-8 text-xs"
                  />
                </div>
              </div>
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
                      Depot
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredDepotStock.length > 0 ? (
                    filteredDepotStock.map((item, index) => {
                      return (
                        <tr key={`${item.depotId}-${item.productId}`} className="transition-colors hover:bg-muted/30">
                          <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                            {index + 1}
                          </td>

                          {/* Depot */}
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <Link href={`/depots/${item.depotId}`} className="hover:underline">
                              {item.depotName}
                            </Link>
                          </td>

                          {/* Code */}
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-primary">
                              <Package className="size-3" />
                              {item.productCode}
                            </span>
                          </td>

                          {/* Product */}
                          <td className="px-4 py-3 font-semibold text-foreground">
                            <Link href={`/products/${item.productId}`} className="hover:text-primary hover:underline">
                              {item.productName}
                            </Link>
                          </td>

                          {/* Pack Size */}
                          <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                            {item.packSize}
                          </td>

                          {/* Available Qty */}
                          <td className="px-4 py-3 text-right font-mono font-bold text-sm text-foreground">
                            {item.quantity.toLocaleString()}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-xs text-muted-foreground">
                        No inventory records match your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 2: DEPOT-TO-DEPOT TRANSFERS                           */}
      {/* ========================================================= */}
      {activeTab === "transfers" && (
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="border-b border-border/70 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ArrowRightLeft className="size-4 text-primary" />
                  <span>Depot-to-Depot Transfers History ({filteredTransfers.length})</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Direct inter-depot movements supporting multi-product transfer transactions
                </CardDescription>
              </div>
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
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Source Depot
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Destination Depot
                    </th>
                    <th scope="col" className="px-4 py-3 text-center">
                      Products Count
                    </th>
                    <th scope="col" className="px-4 py-3 text-right">
                      Total Quantity
                    </th>
                    <th scope="col" className="w-24 px-4 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTransfers.map((tx, idx) => (
                    <tr key={tx.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                        {tx.date}
                      </td>

                      <td className="px-4 py-3 font-medium text-foreground">
                        {tx.sourceDepotName}
                      </td>

                      <td className="px-4 py-3 font-medium text-foreground">
                        {tx.destinationDepotName}
                      </td>

                      <td className="px-4 py-3 text-center font-mono font-medium text-foreground">
                        {tx.totalProducts} items
                      </td>

                      <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                        {tx.totalQuantity.toLocaleString()}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedTransferDetails(tx)}
                          className="cursor-pointer gap-1 text-[11px]"
                        >
                          <Eye className="size-3 text-muted-foreground" />
                          <span>View</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: RETURN LOG                                         */}
      {/* ========================================================= */}
      {activeTab === "movement-history" && (
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="border-b border-border/70 p-4">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <History className="size-4 text-primary" />
              <span>Return Log ({filteredMovements.length} records)</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Complete chronological ledger of customer returns and depot product history
            </CardDescription>
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
                      Date & Time
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Depot
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Pack Size
                    </th>
                    <th scope="col" className="px-4 py-3 text-center">
                      Quantity
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredMovements.map((mov, idx) => {
                    const isPositive =
                      mov.movementType === "Stock Added" ||
                      mov.movementType === "Transfer In" ||
                      mov.movementType === "Return" ||
                      !mov.movementType

                    return (
                      <tr key={mov.id || idx} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                          {mov.date}
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {mov.depotName}
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">
                          <Link href={`/products/${mov.productId}`} className="hover:text-primary hover:underline">
                            {mov.productName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                          {mov.packSize}
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-bold">
                          <span className={isPositive ? "text-primary" : "text-amber-600 dark:text-amber-400"}>
                            {isPositive ? `+${mov.quantity}` : `-${mov.quantity}`}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {mov.customerId ? (
                            <Link
                              href={`/customers/${mov.customerId}`}
                              className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-primary hover:underline"
                            >
                              <Store className="size-3.5 text-primary shrink-0" />
                              <span>{mov.customerCode || mov.customerId}</span>
                              {mov.customerName && (
                                <span className="font-sans font-normal text-[11px] text-muted-foreground">
                                  ({mov.customerName})
                                </span>
                              )}
                            </Link>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              {mov.reference || "—"}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================= */}
      {/* 1. ADD STOCK MODAL                                        */}
      {/* ========================================================= */}
      {isAddStockOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-stock-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setIsAddStockOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 id="add-stock-modal-title" className="text-base font-semibold text-foreground flex items-center gap-2">
                <Plus className="size-4 text-primary" />
                <span>Add Stock to Depot</span>
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsAddStockOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveAddStock} noValidate className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
              {addStockError && (
                <div className="rounded border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  {addStockError}
                </div>
              )}

              {/* Target Depot */}
              <div className="space-y-1.5">
                <Label htmlFor="targetDepotSelect" className="text-xs font-medium text-foreground">
                  Select Target Depot
                </Label>
                <select
                  id="targetDepotSelect"
                  value={addStockDepotId}
                  onChange={(e) => setAddStockDepotId(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs font-medium text-foreground outline-none cursor-pointer"
                >
                  {depots.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Rows */}
              <div className="space-y-2.5 rounded-md border border-border p-3 bg-muted/10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Products & Quantities</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleAddStockAddRow}
                    className="cursor-pointer gap-1 text-[11px]"
                  >
                    <Plus className="size-3" />
                    <span>Add Another Product</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {addStockRows.map((row, idx) => (
                    <div key={row.rowId} className="flex items-center gap-2 text-xs">
                      <span className="w-4 font-mono text-muted-foreground">{idx + 1}.</span>

                      <div className="flex-1">
                        <select
                          aria-label="Select Product"
                          value={row.productId}
                          onChange={(e) => {
                            const val = e.target.value
                            setAddStockRows((prev) =>
                              prev.map((r) => (r.rowId === row.rowId ? { ...r, productId: val } : r))
                            )
                          }}
                          className="h-8 w-full rounded border border-border bg-card px-2 text-xs text-foreground outline-none cursor-pointer"
                        >
                          {catalog.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.packSize})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <Input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => {
                            const val = e.target.value
                            setAddStockRows((prev) =>
                              prev.map((r) => (r.rowId === row.rowId ? { ...r, quantity: val } : r))
                            )
                          }}
                          placeholder="Quantity"
                          className="h-8 text-xs font-mono font-bold"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveAddStockRow(row.rowId)}
                        className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddStockOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer gap-1 font-medium shadow-xs"
                >
                  <Plus className="size-4" />
                  <span>Confirm Add Stock</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MULTI-PRODUCT DEPOT-TO-DEPOT TRANSFER MODAL            */}
      {/* ========================================================= */}
      {isTransferOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setIsTransferOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-md border border-border bg-card p-6 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 id="transfer-modal-title" className="text-base font-semibold text-foreground flex items-center gap-2">
                  <ArrowRightLeft className="size-4 text-primary" />
                  <span>Depot-to-Depot Stock Transfer</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Move inventory directly between depots in a single transaction with multiple products.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsTransferOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleExecuteTransfer} noValidate className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
              {transferError && (
                <div className="rounded border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                  {transferError}
                </div>
              )}

              {/* Source & Destination Depots */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 rounded-md border border-border bg-muted/20 p-3">
                {/* Source Depot */}
                <div className="space-y-1.5">
                  <Label htmlFor="sourceDepot" className="text-xs font-semibold text-foreground">
                    Source Depot (From)
                  </Label>
                  <select
                    id="sourceDepot"
                    value={sourceDepotId}
                    onChange={(e) => {
                      setSourceDepotId(e.target.value)
                      setTransferError("")
                    }}
                    className="h-8 w-full rounded border border-border bg-card px-2.5 text-xs font-medium text-foreground outline-none cursor-pointer"
                  >
                    {depots.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Destination Depot */}
                <div className="space-y-1.5">
                  <Label htmlFor="destDepot" className="text-xs font-semibold text-foreground">
                    Destination Depot (To)
                  </Label>
                  <select
                    id="destDepot"
                    value={destinationDepotId}
                    onChange={(e) => {
                      setDestinationDepotId(e.target.value)
                      setTransferError("")
                    }}
                    className="h-8 w-full rounded border border-border bg-card px-2.5 text-xs font-medium text-foreground outline-none cursor-pointer"
                  >
                    {depots.map((d) => (
                      <option key={d.id} value={d.id} disabled={d.id === sourceDepotId}>
                        {d.name} {d.id === sourceDepotId ? "(Source)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Multi-Product Rows */}
              <div className="space-y-3 rounded-md border border-border p-3.5 bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">Products in Transfer</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleAddTransferRow}
                    className="cursor-pointer gap-1 text-[11px]"
                  >
                    <Plus className="size-3" />
                    <span>Add Product</span>
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {transferRows.map((row, idx) => {
                    const sourceStock = getProductStockAtDepot(sourceDepotId, row.productId)
                    const prod = catalog.find((p) => p.id === row.productId)

                    return (
                      <div
                        key={row.rowId}
                        className="flex flex-col gap-2 rounded border border-border/80 bg-muted/20 p-2.5 text-xs sm:flex-row sm:items-center"
                      >
                        <span className="w-5 font-mono text-muted-foreground font-semibold">
                          {idx + 1}.
                        </span>

                        {/* Product Select */}
                        <div className="flex-1">
                          <select
                            aria-label="Select Product to Transfer"
                            value={row.productId}
                            onChange={(e) => {
                              const val = e.target.value
                              setTransferRows((prev) =>
                                prev.map((r) => (r.rowId === row.rowId ? { ...r, productId: val } : r))
                              )
                            }}
                            className="h-8 w-full rounded border border-border bg-card px-2 text-xs font-medium text-foreground outline-none cursor-pointer"
                          >
                            {catalog.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.packSize})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Available Stock Indicator */}
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground sm:w-28 sm:justify-center">
                          <span>Available:</span>
                          <strong className="font-mono text-foreground">{sourceStock}</strong>
                        </div>

                        {/* Transfer Quantity */}
                        <div className="w-full sm:w-28">
                          <Input
                            type="number"
                            min="1"
                            max={sourceStock}
                            value={row.quantity}
                            onChange={(e) => {
                              const val = e.target.value
                              setTransferRows((prev) =>
                                prev.map((r) => (r.rowId === row.rowId ? { ...r, quantity: val } : r))
                              )
                            }}
                            placeholder="Transfer Qty"
                            className="h-8 text-xs font-mono font-bold"
                          />
                        </div>

                        {/* Remove */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleRemoveTransferRow(row.rowId)}
                          className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsTransferOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer gap-1.5 font-medium shadow-xs"
                >
                  <ArrowRightLeft className="size-4" />
                  <span>Complete Transfer</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PRODUCT RETURN MODAL                                   */}
      {/* ========================================================= */}
      {isReturnOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="return-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setIsReturnOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 id="return-modal-title" className="text-base font-semibold text-foreground flex items-center gap-2">
                <RotateCcw className="size-4 text-purple-600" />
                <span>Record Product Return</span>
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setIsReturnOpen(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleSaveReturn} noValidate className="mt-4 space-y-3.5">
              {returnError && (
                <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                  {returnError}
                </div>
              )}

              {/* Depot */}
              <div className="space-y-1.5">
                <Label htmlFor="returnDepotSelect" className="text-xs font-medium text-foreground">
                  Receiving Depot
                </Label>
                <select
                  id="returnDepotSelect"
                  value={returnDepotId}
                  onChange={(e) => setReturnDepotId(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-card px-2.5 text-xs text-foreground outline-none cursor-pointer"
                >
                  {depots.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer */}
              <div className="space-y-1.5">
                <Label htmlFor="returnCustomerSelect" className="text-xs font-medium text-foreground">
                  Returning Customer
                </Label>
                <select
                  id="returnCustomerSelect"
                  value={returnCustomerId}
                  onChange={(e) => setReturnCustomerId(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-card px-2.5 text-xs text-foreground outline-none cursor-pointer"
                >
                  {initialCustomers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code}) &mdash; {c.shopName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product */}
              <div className="space-y-1.5">
                <Label htmlFor="returnProductSelect" className="text-xs font-medium text-foreground">
                  Product
                </Label>
                <select
                  id="returnProductSelect"
                  value={returnProductId}
                  onChange={(e) => setReturnProductId(e.target.value)}
                  className="h-8 w-full rounded border border-border bg-card px-2.5 text-xs text-foreground outline-none cursor-pointer"
                >
                  {catalog.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.packSize})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label htmlFor="returnQty" className="text-xs font-medium text-foreground">
                  Return Quantity
                </Label>
                <Input
                  id="returnQty"
                  type="number"
                  min="1"
                  value={returnQuantity}
                  onChange={(e) => setReturnQuantity(e.target.value)}
                  className="text-xs font-mono font-bold"
                />
              </div>

              {/* Reason */}
              <div className="space-y-1.5">
                <Label htmlFor="returnNote" className="text-xs font-medium text-foreground">
                  Return Notes
                </Label>
                <Input
                  id="returnNote"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="e.g. Customer return / Damaged packaging exchange"
                  className="text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsReturnOpen(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer font-medium shadow-xs"
                >
                  Record Return
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. STOCK DRILLDOWN / MOVEMENT HISTORY MODAL               */}
      {/* ========================================================= */}
      {selectedDrilldownItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="drilldown-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setSelectedDrilldownItem(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-2xl rounded-md border border-border bg-card p-6 shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 id="drilldown-title" className="text-base font-semibold text-foreground">
                  {selectedDrilldownItem.productName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Stock details & movement history at <strong className="text-foreground">{selectedDrilldownItem.depotName}</strong>
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedDrilldownItem(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="mt-4 grid grid-cols-3 gap-3 rounded-md border border-border bg-muted/20 p-3 text-center text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase">Product Code</span>
                <div className="font-mono font-bold text-primary">{selectedDrilldownItem.productCode}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase">Pack Size</span>
                <div className="font-medium text-foreground">{selectedDrilldownItem.packSize}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase">Current Stock</span>
                <div className="font-mono font-bold text-foreground">
                  {selectedDrilldownItem.quantity}
                </div>
              </div>
            </div>

            {/* Movements for this item */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2">
              <div className="text-xs font-semibold text-foreground">Recent Movements at this Depot</div>
              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th scope="col" className="px-3 py-2">Date</th>
                      <th scope="col" className="px-3 py-2">Movement Type</th>
                      <th scope="col" className="px-3 py-2 text-center">Quantity</th>
                      <th scope="col" className="px-3 py-2 text-right">Balance</th>
                      <th scope="col" className="px-3 py-2">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {movements
                      .filter(
                        (m) =>
                          m.depotId === selectedDrilldownItem.depotId &&
                          (m.productId === selectedDrilldownItem.productId ||
                            m.productCode === selectedDrilldownItem.productCode)
                      )
                      .map((mov) => {
                        const isPositive =
                          mov.movementType === "Stock Added" ||
                          mov.movementType === "Transfer In" ||
                          mov.movementType === "Return"

                        return (
                          <tr key={mov.id}>
                            <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{mov.date}</td>
                            <td className="px-3 py-2 font-medium">{mov.movementType}</td>
                            <td className="px-3 py-2 text-center font-mono font-bold">
                              <span className={isPositive ? "text-primary" : "text-amber-600 dark:text-amber-400"}>
                                {isPositive ? `+${mov.quantity}` : `-${mov.quantity}`}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold">{mov.balance}</td>
                            <td className="px-3 py-2 text-muted-foreground text-[11px]">{mov.reference || "—"}</td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex justify-end border-t border-border pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedDrilldownItem(null)}
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. TRANSFER DETAILS MODAL                                 */}
      {/* ========================================================= */}
      {selectedTransferDetails && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-details-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setSelectedTransferDetails(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 id="transfer-details-title" className="text-base font-semibold text-foreground">
                  Transfer Details
                </h3>
                <p className="text-xs text-muted-foreground">{selectedTransferDetails.date}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedTransferDetails(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Source & Destination */}
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-md border border-border bg-muted/20 p-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Source Depot (Out)</span>
                <div className="font-semibold text-foreground">{selectedTransferDetails.sourceDepotName}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Destination Depot (In)</span>
                <div className="font-semibold text-foreground">{selectedTransferDetails.destinationDepotName}</div>
              </div>
            </div>

            {/* Products in Transfer */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-2">
              <div className="text-xs font-semibold text-foreground">Transferred Products ({selectedTransferDetails.items.length})</div>
              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 text-[10px] font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th scope="col" className="px-3 py-2">Product</th>
                      <th scope="col" className="px-3 py-2">Pack Size</th>
                      <th scope="col" className="px-3 py-2 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedTransferDetails.items.map((item) => (
                      <tr key={item.productId}>
                        <td className="px-3 py-2 font-semibold text-foreground">{item.productName}</td>
                        <td className="px-3 py-2 text-muted-foreground font-mono">{item.packSize}</td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="text-xs text-muted-foreground">
                Total Quantity Transferred: <strong className="font-mono text-foreground">{selectedTransferDetails.totalQuantity}</strong>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedTransferDetails(null)}
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
