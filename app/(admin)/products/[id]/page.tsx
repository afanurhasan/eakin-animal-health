"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Building2,
  Tag,
  RotateCcw,
  Clock,
  Store,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  productCatalog,
  initialDepots,
  initialDepotStocks,
  initialProductReturns,
  type Product,
} from "@/lib/mock-data"

export default function SingleProductPage() {
  const params = useParams()
  const productId = (params?.id as string) || "prod-1"

  const product = React.useMemo(() => {
    return (
      productCatalog.find(
        (p) => p.id === productId || p.code.toLowerCase() === productId.toLowerCase()
      ) || productCatalog[0]
    )
  }, [productId])

  // Depot-wise stock breakdown for this specific product
  const depotStockBreakdown = React.useMemo(() => {
    return initialDepots.map((depot) => {
      const stockList = initialDepotStocks[depot.id] || []
      const foundItem = stockList.find(
        (item) => item.productId === product.id || item.productCode === product.code
      )
      return {
        depotId: depot.id,
        depotCode: depot.code,
        depotName: depot.name,
        location: depot.location,
        quantity: foundItem ? foundItem.quantity : 0,
        unit: product.unit,
        minThreshold: foundItem ? foundItem.minThreshold : 20,
      }
    })
  }, [product])

  // Total stock across all depots
  const totalStockAcrossDepots = React.useMemo(() => {
    return depotStockBreakdown.reduce((acc, curr) => acc + curr.quantity, 0)
  }, [depotStockBreakdown])

  // Product Return history for this specific product (reusing existing initialProductReturns)
  const productReturns = React.useMemo(() => {
    const list: Array<{
      returnId: string
      returnCode: string
      date: string
      customerId: string
      customerCode: string
      customerName: string
      shopName: string
      depotId: string
      depotName: string
      reason?: string
      packSize: string
      unit: string
      unitPrice: number
      deliveredQuantity: number
      returnedQuantity: number
      returnAmount: number
    }> = []

    initialProductReturns.forEach((ret) => {
      ret.items.forEach((item) => {
        if (item.productId === product.id || item.productCode === product.code) {
          list.push({
            returnId: ret.id,
            returnCode: ret.code,
            date: ret.date,
            customerId: ret.customerId,
            customerCode: ret.customerCode,
            customerName: ret.customerName,
            shopName: ret.shopName,
            depotId: ret.depotId,
            depotName: ret.depotName,
            reason: ret.reason,
            packSize: item.packSize,
            unit: item.unit,
            unitPrice: item.unitPrice,
            deliveredQuantity: item.deliveredQuantity,
            returnedQuantity: item.returnedQuantity,
            returnAmount: item.returnAmount,
          })
        }
      })
    })

    return list
  }, [product.id, product.code])

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Back Link */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Products</span>
        </Link>
      </div>

      {/* Main Product Overview Header Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left Info */}
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <Package className="size-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                    {product.name}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                    {product.code}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Tag className="size-3 text-muted-foreground" />
                    {product.category}
                  </span>
                  <span>•</span>
                  <span>Pack Size: <strong className="text-foreground">{product.packSize}</strong></span>
                  <span>•</span>
                  <span>Unit: <strong className="text-foreground">{product.unit}</strong></span>
                </div>
              </div>
            </div>

            {/* Right Metric Highlights */}
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              {/* Buy Price */}
              <div className="rounded-lg border border-border/80 bg-muted/20 px-3.5 py-2.5 text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Buy Price
                </div>
                <div className="font-mono text-lg font-bold text-foreground">
                  ৳ {(product.buyPrice ?? Math.round(product.price * 0.8)).toLocaleString()}
                </div>
              </div>

              {/* Sell Price */}
              <div className="rounded-lg border border-border/80 bg-muted/20 px-3.5 py-2.5 text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  Sell Price
                </div>
                <div className="font-mono text-lg font-bold text-primary">
                  ৳ {(product.sellPrice ?? product.price).toLocaleString()}
                </div>
              </div>

              {/* Total Stock */}
              <div className="rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-2.5 text-right">
                <div className="text-[10px] uppercase font-bold tracking-wider text-primary">
                  Total Available Stock
                </div>
                <div className="font-mono text-lg font-bold text-primary">
                  {totalStockAcrossDepots.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-muted-foreground">{product.unit}s</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Depot-wise Stock Breakdown Section */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Building2 className="size-4 text-primary" />
                <span>Depot-Wise Stock Availability</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Current inventory levels for {product.name} across all physical warehouse locations
              </CardDescription>
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
                    Depot Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Depot Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Location
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    Threshold
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Available Stock
                  </th>
                  <th scope="col" className="w-32 px-4 py-3 text-center">
                    Stock Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {depotStockBreakdown.map((item, index) => {
                  const isLow = item.quantity <= item.minThreshold && item.quantity > 0
                  const isOut = item.quantity === 0

                  return (
                    <tr key={item.depotId} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 font-mono font-medium text-primary">
                        {item.depotCode}
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link href={`/depots/${item.depotId}`} className="hover:underline">
                          {item.depotName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {item.location}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-muted-foreground">
                        {item.minThreshold} {item.unit}s
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-bold text-foreground">
                        {item.quantity.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">{item.unit}s</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                            In Stock
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

      {/* Product Return History Section */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <RotateCcw className="size-4 text-purple-600" />
                <span>Product Return History ({productReturns.length})</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Chronological history of customer returns recorded for {product.name}
              </CardDescription>
            </div>
            {productReturns.length > 0 && (
              <span className="text-xs text-muted-foreground">
                Total Returns: <strong className="font-mono text-purple-600 font-semibold">{productReturns.reduce((sum, r) => sum + r.returnedQuantity, 0)} {product.unit}s</strong>
              </span>
            )}
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
                    Date & Time
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Restocked Depot
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Customer & Shop
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Return Amount
                  </th>
                  <th scope="col" className="w-24 px-4 py-3 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {productReturns.length > 0 ? (
                  productReturns.map((ret, index) => (
                    <tr
                      key={`${ret.returnId}-${index}`}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {ret.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Building2 className="size-3.5 text-muted-foreground" />
                          <Link
                            href={`/depots/${ret.depotId}`}
                            className="hover:underline"
                          >
                            {ret.depotName}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          <Link
                            href={`/customers/${ret.customerId}`}
                            className="hover:text-primary hover:underline"
                          >
                            {ret.customerName}
                          </Link>
                          <span className="text-[11px] text-muted-foreground block">
                            {ret.shopName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                        ৳{ret.returnAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href="/product-returns"
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2 py-1 text-[11px] font-medium shadow-xs hover:bg-purple-600 hover:text-white transition-colors"
                        >
                          Slip
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-xs text-muted-foreground"
                    >
                      No return records found for {product.name}.
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
