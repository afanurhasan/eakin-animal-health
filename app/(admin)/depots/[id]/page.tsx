"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  MapPin,
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  History,
  Tag,
  Plus,
  Trash2,
  Eye,
  ArrowRight,
  Package,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  initialDepots,
  initialDepotStocks,
  initialTransfers,
  productCatalog,
  type Depot,
  type DepotStockItem,
  type StockTransfer,
  type TransferProductItem,
} from "@/lib/mock-data"
import { formatDateTime } from "@/lib/utils"

interface TransferRowState {
  rowId: string
  productId: string
  quantity: string
}

export default function SingleDepotPage() {
  const params = useParams()
  const depotId = (params?.id as string) || "dep-1"

  // All Depots
  const [depots] = React.useState<Depot[]>(initialDepots)

  // Current Depot
  const depot = React.useMemo(() => {
    return (
      depots.find((d) => d.id === depotId || d.code.toLowerCase() === depotId.toLowerCase()) ||
      depots[0] || {
        id: depotId,
        code: "DEP-DHA-01",
        name: "Dhaka Central Depot",
        location: "Tejgaon Industrial Area, Dhaka",
      }
    )
  }, [depotId, depots])

  // All Depot stocks state (allows inter-depot stock updates)
  const [depotStocks, setDepotStocks] =
    React.useState<Record<string, DepotStockItem[]>>(initialDepotStocks)

  // Stock transfer history state
  const [transfers, setTransfers] = React.useState<StockTransfer[]>(initialTransfers)

  // Current Depot's stock items
  const currentDepotStockItems = React.useMemo(() => {
    return depotStocks[depot.id] || []
  }, [depotStocks, depot.id])

  // Filter state for inventory table
  const [searchProductQuery, setSearchProductQuery] = React.useState("")

  // Transfer Modal state
  const [transferMode, setTransferMode] = React.useState<"out" | "in" | null>(null)
  const [partnerDepotId, setPartnerDepotId] = React.useState<string>("")
  const [transferRows, setTransferRows] = React.useState<TransferRowState[]>([])
  const [modalError, setModalError] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Details Modal state
  const [selectedTransferDetails, setSelectedTransferDetails] =
    React.useState<StockTransfer | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Stock Metrics for current depot
  const totalQuantity = React.useMemo(() => {
    return currentDepotStockItems.reduce((sum, item) => sum + item.quantity, 0)
  }, [currentDepotStockItems])

  const lowStockCount = React.useMemo(() => {
    return currentDepotStockItems.filter((item) => item.quantity <= item.minThreshold).length
  }, [currentDepotStockItems])

  // Filtered Stock Items for current depot table
  const filteredStockItems = React.useMemo(() => {
    const q = searchProductQuery.toLowerCase().trim()
    if (!q) return currentDepotStockItems
    return currentDepotStockItems.filter(
      (item) =>
        item.productName.toLowerCase().includes(q) ||
        item.productCode.toLowerCase().includes(q) ||
        item.packSize.toLowerCase().includes(q)
    )
  }, [currentDepotStockItems, searchProductQuery])

  // Incoming transfers to this depot (Transfer In)
  const transfersIn = React.useMemo(() => {
    return transfers.filter((t) => t.destinationDepotId === depot.id)
  }, [transfers, depot.id])

  // Outgoing transfers from this depot (Transfer Out)
  const transfersOut = React.useMemo(() => {
    return transfers.filter((t) => t.sourceDepotId === depot.id)
  }, [transfers, depot.id])

  // Helper: Get available stock of a product at a specific depot
  const getAvailableStock = React.useCallback(
    (targetDepotId: string, productId: string): number => {
      const stockList = depotStocks[targetDepotId] || []
      const found = stockList.find((item) => item.productId === productId)
      return found ? found.quantity : 0
    },
    [depotStocks]
  )

  // Open Transfer Modal
  const handleOpenTransferModal = (mode: "out" | "in") => {
    const otherDepots = depots.filter((d) => d.id !== depot.id)
    const defaultPartner = otherDepots[0]?.id || ""
    setPartnerDepotId(defaultPartner)
    setTransferMode(mode)
    setModalError("")

    const sourceDepotId = mode === "out" ? depot.id : defaultPartner
    const sourceStocks = depotStocks[sourceDepotId] || []
    const initialProduct = sourceStocks[0]?.productId || productCatalog[0]?.id || ""

    setTransferRows([
      {
        rowId: `row-${Date.now()}-1`,
        productId: initialProduct,
        quantity: "10",
      },
    ])
  }

  // Add Product Row in Transfer Modal
  const handleAddProductRow = () => {
    if (!transferMode) return
    const sourceDepotId = transferMode === "out" ? depot.id : partnerDepotId
    const sourceStocks = depotStocks[sourceDepotId] || []

    // Pick first product not already in rows, or fallback to first available
    const chosenProductIds = new Set(transferRows.map((r) => r.productId))
    const nextAvailableInStock = sourceStocks.find((s) => !chosenProductIds.has(s.productId))
    const fallbackCatalog = productCatalog.find((p) => !chosenProductIds.has(p.id))

    const newProductId =
      nextAvailableInStock?.productId ||
      fallbackCatalog?.id ||
      productCatalog[0]?.id ||
      ""

    setTransferRows((prev) => [
      ...prev,
      {
        rowId: `row-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        productId: newProductId,
        quantity: "10",
      },
    ])
    setModalError("")
  }

  // Remove Product Row
  const handleRemoveProductRow = (rowId: string) => {
    if (transferRows.length <= 1) {
      setModalError("Transfer must contain at least one product.")
      return
    }
    setTransferRows((prev) => prev.filter((r) => r.rowId !== rowId))
    setModalError("")
  }

  // Update Product Row Field
  const handleRowChange = (
    rowId: string,
    field: "productId" | "quantity",
    value: string
  ) => {
    setTransferRows((prev) =>
      prev.map((r) => (r.rowId === rowId ? { ...r, [field]: value } : r))
    )
    setModalError("")
  }

  // Confirm Transfer
  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!transferMode || !partnerDepotId) {
      setModalError("Please select a valid partner depot.")
      return
    }

    const sourceDepot =
      transferMode === "out"
        ? depot
        : depots.find((d) => d.id === partnerDepotId)

    const destinationDepot =
      transferMode === "out"
        ? depots.find((d) => d.id === partnerDepotId)
        : depot

    if (!sourceDepot || !destinationDepot) {
      setModalError("Invalid Source or Destination Depot.")
      return
    }

    if (sourceDepot.id === destinationDepot.id) {
      setModalError("Source and Destination depots cannot be the same.")
      return
    }

    if (transferRows.length === 0) {
      setModalError("Please add at least one product to transfer.")
      return
    }

    // Check for duplicate products in rows
    const seenProductIds = new Set<string>()
    for (const row of transferRows) {
      if (!row.productId) {
        setModalError("Please select a product for all rows.")
        return
      }
      if (seenProductIds.has(row.productId)) {
        const prod = productCatalog.find((p) => p.id === row.productId)
        setModalError(
          `Duplicate product selected: "${prod?.name || row.productId}". Please consolidate quantities into one row.`
        )
        return
      }
      seenProductIds.add(row.productId)
    }

    // Validate quantities against source depot available stock
    const validatedItems: TransferProductItem[] = []
    for (const row of transferRows) {
      const qty = parseInt(row.quantity, 10)
      if (isNaN(qty) || qty <= 0) {
        setModalError("All transfer quantities must be positive integers.")
        return
      }

      const available = getAvailableStock(sourceDepot.id, row.productId)
      const prodInfo = productCatalog.find((p) => p.id === row.productId)

      if (!prodInfo) {
        setModalError("One of the selected products is invalid.")
        return
      }

      if (qty > available) {
        setModalError(
          `Cannot transfer ${qty} units of "${prodInfo.name}". Only ${available} units available in ${sourceDepot.name}.`
        )
        return
      }

      validatedItems.push({
        productId: prodInfo.id,
        productCode: prodInfo.code,
        productName: prodInfo.name,
        packSize: prodInfo.packSize,
        quantity: qty,
      })
    }

    // Apply Stock Changes: Decrease from Source, Increase at Destination
    setDepotStocks((prev) => {
      const updated = { ...prev }

      // 1. Source Depot: Deduct quantities
      const sourceStockList = [...(updated[sourceDepot.id] || [])]
      validatedItems.forEach((item) => {
        const idx = sourceStockList.findIndex((s) => s.productId === item.productId)
        if (idx >= 0) {
          sourceStockList[idx] = {
            ...sourceStockList[idx],
            quantity: Math.max(0, sourceStockList[idx].quantity - item.quantity),
          }
        }
      })
      updated[sourceDepot.id] = sourceStockList

      // 2. Destination Depot: Increase quantities
      const destStockList = [...(updated[destinationDepot.id] || [])]
      validatedItems.forEach((item) => {
        const idx = destStockList.findIndex((s) => s.productId === item.productId)
        if (idx >= 0) {
          destStockList[idx] = {
            ...destStockList[idx],
            quantity: destStockList[idx].quantity + item.quantity,
          }
        } else {
          destStockList.push({
            productId: item.productId,
            productCode: item.productCode,
            productName: item.productName,
            packSize: item.packSize,
            quantity: item.quantity,
            minThreshold: 20,
          })
        }
      })
      updated[destinationDepot.id] = destStockList

      return updated
    })

    // Create New Transfer Record
    const nextCodeNumber = transfers.length + 1
    const newTransferRecord: StockTransfer = {
      id: `tx-${Date.now()}`,
      code: `TRF-${String(nextCodeNumber).padStart(6, "0")}`,
      sourceDepotId: sourceDepot.id,
      sourceDepotName: sourceDepot.name,
      destinationDepotId: destinationDepot.id,
      destinationDepotName: destinationDepot.name,
      items: validatedItems,
      totalQuantity: validatedItems.reduce((sum, i) => sum + i.quantity, 0),
      totalProducts: validatedItems.length,
      date: formatDateTime(new Date()),
      status: "Completed",
    }

    setTransfers((prev) => [newTransferRecord, ...prev])
    setTransferMode(null)
    setTransferRows([])
    setModalError("")

    showToast(
      `Transfer recorded: ${validatedItems.length} products (${newTransferRecord.totalQuantity} units) transferred from ${sourceDepot.name} to ${destinationDepot.name}.`
    )
  }

  // Active Source and Destination in Modal
  const activeSourceDepot = React.useMemo(() => {
    if (!transferMode) return null
    return transferMode === "out" ? depot : depots.find((d) => d.id === partnerDepotId)
  }, [transferMode, partnerDepotId, depot, depots])

  const activeDestinationDepot = React.useMemo(() => {
    if (!transferMode) return null
    return transferMode === "out" ? depots.find((d) => d.id === partnerDepotId) : depot
  }, [transferMode, partnerDepotId, depot, depots])

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-md border border-primary/30 bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-lg">
          <CheckCircle2 className="size-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Navigation Bar */}
      <div>
        <Link
          href="/depots"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          <span>Back to Depots</span>
        </Link>
      </div>

      {/* Depot Overview Banner & Actions */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Depot Details */}
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                      {depot.name}
                    </h1>
                    <span className="rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-xs font-semibold text-primary">
                      {depot.code}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-muted-foreground" />
                      {depot.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transfer In / Transfer Out Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Transfer In Button */}
              <Button
                type="button"
                onClick={() => handleOpenTransferModal("in")}
                className="cursor-pointer gap-1.5 bg-primary font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                <ArrowDownLeft className="size-4" />
                <span>Transfer In</span>
              </Button>

              {/* Transfer Out Button */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenTransferModal("out")}
                className="cursor-pointer gap-1.5 border-border font-medium hover:bg-muted"
              >
                <ArrowUpRight className="size-4" />
                <span>Transfer Out</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/60 pt-4 sm:grid-cols-3">
            <div className="rounded border border-border/60 bg-muted/30 p-3">
              <span className="text-[11px] font-medium text-muted-foreground">
                Total Products
              </span>
              <p className="mt-0.5 text-lg font-bold text-foreground">
                {currentDepotStockItems.length} <span className="text-xs font-normal text-muted-foreground">SKUs</span>
              </p>
            </div>
            <div className="rounded border border-border/60 bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground">
                Total Stock Quantity
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-foreground">
                {totalQuantity.toLocaleString()}
              </p>
            </div>
            <div className="col-span-2 rounded border border-border/60 bg-muted/30 p-3 sm:col-span-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                Low Stock
              </span>
              <p className="mt-0.5 text-lg font-bold text-destructive">
                {lowStockCount}{" "}
                <span className="text-xs font-normal text-muted-foreground">Items</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stock Inventory Table */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold text-foreground">
                Depot Inventory ({filteredStockItems.length})
              </CardTitle>
            </div>

            {/* Search Products in Depot */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchProductQuery}
                onChange={(e) => setSearchProductQuery(e.target.value)}
                placeholder="Search products in depot..."
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-14 px-4 py-3 text-center">
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
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredStockItems.length > 0 ? (
                  filteredStockItems.map((item, index) => {
                    return (
                      <tr
                        key={item.productId}
                        className="transition-colors hover:bg-muted/30"
                      >
                        {/* Serial */}
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>

                        {/* Product Code */}
                        <td className="px-4 py-3">
                          <span className="font-mono font-medium text-primary">
                            {item.productCode}
                          </span>
                        </td>

                        {/* Product Name */}
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {item.productName}
                        </td>

                        {/* Pack Size */}
                        <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">
                          {item.packSize}
                        </td>

                        {/* Quantity */}
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm font-bold text-foreground">
                            {item.quantity.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-xs text-muted-foreground"
                    >
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Transfer In Table */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded bg-primary/10 text-primary">
                <ArrowDownLeft className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Transfer In ({transfersIn.length})
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  Incoming transfers received from other depots
                </p>
              </div>
            </div>
            <span className="rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
              Stock In
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-14 px-4 py-3 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    From (Source Depot)
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Products
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Total Units
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transfersIn.length > 0 ? (
                  transfersIn.map((tx, index) => (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Serial */}
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>

                      {/* From Depot */}
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-muted-foreground" />
                          <span>{tx.sourceDepotName}</span>
                        </div>
                      </td>

                      {/* Products Count */}
                      <td className="px-4 py-3 text-center font-mono">
                        <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                          <Package className="size-3 text-muted-foreground" />
                          {tx.totalProducts} Products
                        </span>
                      </td>

                      {/* Total Quantity */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-primary">
                        +{tx.totalQuantity}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {tx.date}
                      </td>

                      {/* Action: View Products */}
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedTransferDetails(tx)}
                          className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye className="size-3" />
                          <span>View Products</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-xs text-muted-foreground"
                    >
                      No incoming transfer records found for this depot.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Stock Transfer Out Table */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ArrowUpRight className="size-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  Transfer Out ({transfersOut.length})
                </CardTitle>
                <p className="text-[11px] text-muted-foreground">
                  Outgoing transfers dispatched to other depots
                </p>
              </div>
            </div>
            <span className="rounded-sm border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
              Stock Out
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="w-14 px-4 py-3 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    To (Destination Depot)
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Products
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Total Units
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transfersOut.length > 0 ? (
                  transfersOut.map((tx, index) => (
                    <tr
                      key={tx.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Serial */}
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>

                      {/* To Depot */}
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="size-3.5 text-muted-foreground" />
                          <span>{tx.destinationDepotName}</span>
                        </div>
                      </td>

                      {/* Products Count */}
                      <td className="px-4 py-3 text-center font-mono">
                        <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                          <Package className="size-3 text-muted-foreground" />
                          {tx.totalProducts} Products
                        </span>
                      </td>

                      {/* Total Quantity */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                        -{tx.totalQuantity}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {tx.date}
                      </td>

                      {/* Action: View Products */}
                      <td className="px-4 py-3 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setSelectedTransferDetails(tx)}
                          className="cursor-pointer gap-1 text-[11px] font-medium hover:bg-primary hover:text-primary-foreground"
                        >
                          <Eye className="size-3" />
                          <span>View Products</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-xs text-muted-foreground"
                    >
                      No outgoing transfer records found for this depot.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Depot-to-Depot Multi-Product Transfer Modal Dialog         */}
      {/* ========================================================= */}
      {transferMode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setTransferMode(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-3xl rounded-md border border-border bg-card p-6 shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex size-8 items-center justify-center rounded ${
                    transferMode === "out"
                      ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {transferMode === "out" ? (
                    <ArrowUpRight className="size-5" />
                  ) : (
                    <ArrowDownLeft className="size-5" />
                  )}
                </div>
                <div>
                  <h3 id="transfer-modal-title" className="text-base font-semibold text-foreground">
                    {transferMode === "out" ? "Transfer Out (Depot to Depot)" : "Transfer In (Depot to Depot)"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Transfer multiple products from one depot to another
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setTransferMode(null)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Error banner */}
            {modalError && (
              <div className="mt-3 rounded border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-1.5">
                <AlertCircle className="size-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleConfirmTransfer} className="mt-4 flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Source Depot & Destination Depot Selector Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Source Depot */}
                <div className="rounded border border-border/70 bg-muted/20 p-3 space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Source Depot (From)
                  </Label>
                  {transferMode === "out" ? (
                    <div className="rounded border border-border/50 bg-background px-3 py-2 text-xs font-medium text-foreground">
                      <span className="font-semibold">{depot.name}</span>{" "}
                      <span className="text-[11px] font-mono text-muted-foreground">({depot.code})</span>
                    </div>
                  ) : (
                    <select
                      value={partnerDepotId}
                      onChange={(e) => {
                        setPartnerDepotId(e.target.value)
                        setModalError("")
                      }}
                      className="h-9 w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                      {depots
                        .filter((d) => d.id !== depot.id)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                {/* Destination Depot */}
                <div className="rounded border border-border/70 bg-muted/20 p-3 space-y-1.5">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Destination Depot (To)
                  </Label>
                  {transferMode === "in" ? (
                    <div className="rounded border border-border/50 bg-background px-3 py-2 text-xs font-medium text-foreground">
                      <span className="font-semibold">{depot.name}</span>{" "}
                      <span className="text-[11px] font-mono text-muted-foreground">({depot.code})</span>
                    </div>
                  ) : (
                    <select
                      value={partnerDepotId}
                      onChange={(e) => {
                        setPartnerDepotId(e.target.value)
                        setModalError("")
                      }}
                      className="h-9 w-full rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    >
                      {depots
                        .filter((d) => d.id !== depot.id)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Multi-Product List Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">
                    Products to Transfer ({transferRows.length})
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={handleAddProductRow}
                    className="cursor-pointer gap-1 text-xs font-medium border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Product</span>
                  </Button>
                </div>

                <div className="overflow-hidden rounded border border-border/80">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase">
                      <tr>
                        <th scope="col" className="px-3 py-2.5">
                          Product
                        </th>
                        <th scope="col" className="w-28 px-3 py-2.5 text-center">
                          Available
                        </th>
                        <th scope="col" className="w-36 px-3 py-2.5">
                          Quantity
                        </th>
                        <th scope="col" className="w-12 px-2 py-2.5 text-center">
                          Remove
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 bg-background">
                      {transferRows.map((row) => {
                        const sourceDepotId = activeSourceDepot?.id || depot.id
                        const available = getAvailableStock(sourceDepotId, row.productId)
                        const currentProduct = productCatalog.find((p) => p.id === row.productId)
                        const parsedQty = parseInt(row.quantity, 10)
                        const isOverStock = !isNaN(parsedQty) && parsedQty > available

                        return (
                          <tr key={row.rowId} className="hover:bg-muted/20">
                            {/* Product Select */}
                            <td className="px-3 py-2">
                              <select
                                value={row.productId}
                                onChange={(e) =>
                                  handleRowChange(row.rowId, "productId", e.target.value)
                                }
                                className="h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                              >
                                {productCatalog.map((prod) => {
                                  const itemAvail = getAvailableStock(sourceDepotId, prod.id)
                                  return (
                                    <option key={prod.id} value={prod.id}>
                                      {prod.name} ({prod.code} - {prod.packSize}) — [{itemAvail} available]
                                    </option>
                                  )
                                })}
                              </select>
                            </td>

                            {/* Available Stock */}
                            <td className="px-3 py-2 text-center">
                              <span
                                className={`font-mono text-xs font-semibold ${
                                  available > 0
                                    ? "text-foreground"
                                    : "text-destructive"
                                }`}
                              >
                                {available}
                              </span>
                            </td>

                            {/* Transfer Quantity */}
                            <td className="px-3 py-2">
                              <div className="space-y-0.5">
                                <Input
                                  type="number"
                                  min="1"
                                  max={available > 0 ? available : 1}
                                  value={row.quantity}
                                  onChange={(e) =>
                                    handleRowChange(row.rowId, "quantity", e.target.value)
                                  }
                                  placeholder="Qty"
                                  className={`h-8 text-xs font-mono ${
                                    isOverStock
                                      ? "border-destructive focus-visible:ring-destructive"
                                      : ""
                                  }`}
                                />
                                {isOverStock && (
                                  <span className="block text-[10px] text-destructive">
                                    Exceeds stock ({available})
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Remove Row Button */}
                            <td className="px-2 py-2 text-center">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleRemoveProductRow(row.rowId)}
                                aria-label="Remove product"
                                className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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

                {/* Transfer summary footer */}
                <div className="flex items-center justify-between rounded bg-muted/40 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">
                    Total Products:{" "}
                    <strong className="text-foreground">{transferRows.length}</strong>
                  </span>
                  <span className="text-muted-foreground">
                    Total Units to Transfer:{" "}
                    <strong className="font-mono text-primary">
                      {transferRows.reduce((sum, r) => {
                        const q = parseInt(r.quantity, 10)
                        return sum + (isNaN(q) ? 0 : q)
                      }, 0)}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTransferMode(null)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer bg-primary font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Confirm Transfer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Transfer Details View Modal (Itemized Breakdown)          */}
      {/* ========================================================= */}
      {selectedTransferDetails && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="transfer-details-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setSelectedTransferDetails(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-2xl rounded-md border border-border bg-card p-6 shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 id="transfer-details-title" className="text-base font-semibold text-foreground">
                    Transfer Details
                  </h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {selectedTransferDetails.status}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Date: {selectedTransferDetails.date}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setSelectedTransferDetails(null)}
                aria-label="Close"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Transfer Route Banner */}
            <div className="mt-4 flex items-center justify-between rounded border border-border/70 bg-muted/30 p-3 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground">Source Depot</span>
                <p className="font-semibold text-foreground">{selectedTransferDetails.sourceDepotName}</p>
              </div>
              <ArrowRight className="size-4 text-primary" />
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground">Destination Depot</span>
                <p className="font-semibold text-foreground">{selectedTransferDetails.destinationDepotName}</p>
              </div>
            </div>

            {/* Products Table */}
            <div className="mt-4 flex-1 overflow-y-auto">
              <div className="rounded border border-border/80 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold text-muted-foreground uppercase">
                    <tr>
                      <th scope="col" className="w-12 px-3 py-2.5 text-center">
                        SL
                      </th>
                      <th scope="col" className="px-3 py-2.5">
                        Product Code
                      </th>
                      <th scope="col" className="px-3 py-2.5">
                        Product Name
                      </th>
                      <th scope="col" className="px-3 py-2.5">
                        Pack Size
                      </th>
                      <th scope="col" className="px-3 py-2.5 text-right">
                        Quantity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {selectedTransferDetails.items.map((item, index) => (
                      <tr key={item.productId} className="hover:bg-muted/20">
                        <td className="px-3 py-2 text-center text-muted-foreground">
                          {index + 1}
                        </td>
                        <td className="px-3 py-2 font-mono font-medium text-primary">
                          {item.productCode}
                        </td>
                        <td className="px-3 py-2 font-semibold text-foreground">
                          {item.productName}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground font-mono">
                          {item.packSize}
                        </td>
                        <td className="px-3 py-2 text-right font-mono font-bold text-foreground">
                          {item.quantity.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Summary & Close */}
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <div className="flex items-center gap-4 text-xs">
                <span>
                  Total Products:{" "}
                  <strong className="text-foreground">{selectedTransferDetails.totalProducts}</strong>
                </span>
                <span>
                  Total Quantity:{" "}
                  <strong className="font-mono text-primary">
                    {selectedTransferDetails.totalQuantity.toLocaleString()}
                  </strong>
                </span>
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
