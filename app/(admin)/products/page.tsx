"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Package,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Filter,
  Layers,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  productCatalog,
  initialDepotStocks,
  type Product,
} from "@/lib/mock-data"

const commonCategories = [
  "Antibiotics",
  "Vitamins & Supplements",
  "Calcium Supplements",
  "Dewormer",
  "Liver Tonics",
  "Feed Supplement",
  "Immunity Booster",
]

const commonPackSizes = [
  "50 gm",
  "100 gm",
  "250 gm",
  "300 gm",
  "500 gm",
  "1 kg",
  "5 kg",
  "100 ml",
  "250 ml",
  "500 ml",
  "1 Litre",
  "5 Litre",
  "50 Litre",
  "5 x 4 Bolus",
]

const commonUnits = [
  "Bottle",
  "Jar",
  "Box",
  "Tube",
  "Pouch",
  "Sack",
  "Packet",
  "Drum",
]

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>(productCatalog)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = React.useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = React.useState<Product | null>(null)

  // Form State
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    category: commonCategories[0],
    packSize: "100 ml",
    unit: "Bottle",
    buyPrice: "",
    sellPrice: "",
  })

  const [formErrors, setFormErrors] = React.useState<{
    code?: string
    name?: string
    category?: string
    packSize?: string
    unit?: string
    buyPrice?: string
    sellPrice?: string
  }>({})

  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  // Categories list for filter
  const categoriesList = React.useMemo(() => {
    const set = new Set<string>()
    products.forEach((p) => set.add(p.category))
    return Array.from(set)
  }, [products])

  // Filtered Products
  const filteredProducts = React.useMemo(() => {
    return products.filter((prod) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        prod.name.toLowerCase().includes(q) ||
        prod.code.toLowerCase().includes(q) ||
        prod.category.toLowerCase().includes(q) ||
        prod.packSize.toLowerCase().includes(q)

      const matchesCategory =
        selectedCategoryFilter === "all" || prod.category === selectedCategoryFilter

      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategoryFilter])

  // Calculate total stock for a product across all depots
  const getTotalProductStock = (productId: string) => {
    let total = 0
    Object.values(initialDepotStocks).forEach((stockList) => {
      const found = stockList.find((item) => item.productId === productId)
      if (found) total += found.quantity
    })
    return total
  }

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextNum = products.length + 1
    setFormData({
      code: `EAK-${String(nextNum).padStart(3, "0")}`,
      name: "",
      category: commonCategories[0],
      packSize: "100 ml",
      unit: "Bottle",
      buyPrice: "",
      sellPrice: "",
    })
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod)
    setFormData({
      code: prod.code,
      name: prod.name,
      category: prod.category,
      packSize: prod.packSize,
      unit: prod.unit,
      buyPrice: String(prod.buyPrice ?? Math.round((prod.price || 0) * 0.8)),
      sellPrice: String(prod.sellPrice ?? prod.price ?? ""),
    })
    setFormErrors({})
  }

  // Save Product (Create or Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: {
      code?: string
      name?: string
      category?: string
      packSize?: string
      unit?: string
      buyPrice?: string
      sellPrice?: string
    } = {}

    if (!formData.code.trim()) {
      errors.code = "Please provide a valid product code."
    }
    if (!formData.name.trim()) {
      errors.name = "Please provide a product name."
    }
    if (!formData.category.trim()) {
      errors.category = "Please select or enter a category."
    }
    if (!formData.packSize.trim()) {
      errors.packSize = "Please specify a pack size."
    }
    if (!formData.unit.trim()) {
      errors.unit = "Please select or specify a unit."
    }
    if (!formData.buyPrice.trim() || isNaN(parseFloat(formData.buyPrice)) || parseFloat(formData.buyPrice) <= 0) {
      errors.buyPrice = "Please enter a valid buy price in Taka."
    }
    if (!formData.sellPrice.trim() || isNaN(parseFloat(formData.sellPrice)) || parseFloat(formData.sellPrice) <= 0) {
      errors.sellPrice = "Please enter a valid sell price in Taka."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const buyPriceNum = parseFloat(formData.buyPrice)
    const sellPriceNum = parseFloat(formData.sellPrice)

    if (editingProduct) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === editingProduct.id
            ? {
                ...item,
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                category: formData.category.trim(),
                packSize: formData.packSize.trim(),
                unit: formData.unit.trim(),
                buyPrice: buyPriceNum,
                sellPrice: sellPriceNum,
                price: sellPriceNum,
              }
            : item
        )
      )
      setEditingProduct(null)
      showToast("Product updated successfully.")
    } else {
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        category: formData.category.trim(),
        packSize: formData.packSize.trim(),
        unit: formData.unit.trim(),
        buyPrice: buyPriceNum,
        sellPrice: sellPriceNum,
        price: sellPriceNum,
      }
      setProducts((prev) => [newProduct, ...prev])
      setIsCreateOpen(false)
      showToast("New Product created successfully.")
    }
    setFormErrors({})
  }

  // Confirm Delete Product
  const handleConfirmDelete = () => {
    if (!deletingProduct) return
    setProducts((prev) => prev.filter((item) => item.id !== deletingProduct.id))
    setDeletingProduct(null)
    showToast("Product deleted successfully.")
  }

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-md border border-primary/30 bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-lg">
          <CheckCircle2 className="size-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Products
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage veterinary formulations, antibiotics, supplements, pack sizes, and pricing catalog.
          </p>
        </div>

        {/* Add Product Button */}
        <Button
          type="button"
          onClick={handleOpenCreate}
          size="sm"
          className="cursor-pointer gap-1.5 font-medium shadow-xs"
        >
          <Plus className="size-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Products Catalog ({filteredProducts.length})
            </CardTitle>

            {/* Filter & Search */}
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5 rounded border border-border/80 bg-muted/20 px-2 py-1">
                <Layers className="size-3.5 shrink-0 text-muted-foreground" />
                <select
                  aria-label="Filter by Category"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="h-7 bg-transparent text-xs text-foreground outline-none cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search product, code, category..."
                  className="h-8 pl-8 text-xs"
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
                    Product Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Product Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Pack Size
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Unit
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Buy Price (৳)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Sell Price (৳)
                  </th>
                  <th scope="col" className="w-28 px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((prod, index) => (
                    <tr key={prod.id} className="transition-colors hover:bg-muted/30">
                      {/* Serial */}
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>

                      {/* Product Code */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/products/${prod.id}`}
                          className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary hover:underline"
                        >
                          <Package className="size-3 text-primary" />
                          {prod.code}
                        </Link>
                      </td>

                      {/* Product Name */}
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link
                          href={`/products/${prod.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {prod.name}
                        </Link>
                      </td>

                      {/* Pack Size */}
                      <td className="px-4 py-3 text-muted-foreground font-medium">
                        <span className="rounded bg-muted/60 px-1.5 py-0.5 text-[11px] text-foreground font-mono">
                          {prod.packSize}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {prod.category}
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-3 text-muted-foreground">
                        {prod.unit}
                      </td>

                      {/* Buy Price */}
                      <td className="px-4 py-3 text-right font-mono font-semibold text-muted-foreground">
                        ৳ {(prod.buyPrice ?? Math.round((prod.price || 0) * 0.8)).toLocaleString()}
                      </td>

                      {/* Sell Price */}
                      <td className="px-4 py-3 text-right font-mono font-bold text-foreground">
                        ৳ {(prod.sellPrice ?? prod.price).toLocaleString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleOpenEdit(prod)}
                            aria-label={`Edit ${prod.name}`}
                            className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="size-3.5" />
                          </Button>

                          {/* Delete */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeletingProduct(prod)}
                            aria-label={`Delete ${prod.name}`}
                            className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No products found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Create / Edit Product Modal Dialog                        */}
      {/* ========================================================= */}
      {(isCreateOpen || editingProduct) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              setIsCreateOpen(false)
              setEditingProduct(null)
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 id="product-modal-title" className="text-base font-semibold text-foreground">
                {editingProduct ? "Edit Product" : "Add Product"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingProduct(null)
                }}
                aria-label="Cancel"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} noValidate className="mt-4 flex-1 overflow-y-auto space-y-3.5 pr-1">
              {/* Product Code */}
              <div className="space-y-1.5">
                <Label htmlFor="prodCode" className="text-xs font-medium text-foreground">
                  Product Code
                </Label>
                <Input
                  id="prodCode"
                  name="prodCode"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                  }}
                  placeholder="e.g. EAK-AMX-100"
                  className={`text-xs font-mono uppercase ${formErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.code && (
                  <p className="text-[11px] text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* Product Name */}
              <div className="space-y-1.5">
                <Label htmlFor="prodName" className="text-xs font-medium text-foreground">
                  Product Name
                </Label>
                <Input
                  id="prodName"
                  name="prodName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Eakmox-Vet Liquid"
                  className={`text-xs ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="prodCategory" className="text-xs font-medium text-foreground">
                  Category
                </Label>
                <div className="space-y-1.5">
                  <select
                    id="prodCategory"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                      if (formErrors.category) setFormErrors((prev) => ({ ...prev, category: undefined }))
                    }}
                    className="h-8 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground outline-none cursor-pointer"
                  >
                    {commonCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                {formErrors.category && (
                  <p className="text-[11px] text-destructive">{formErrors.category}</p>
                )}
              </div>

              {/* Pack Size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="prodPackSize" className="text-xs font-medium text-foreground">
                    Pack Size
                  </Label>
                  <span className="text-[10px] text-muted-foreground">e.g. 100 ml, 500 gm, 1 Litre</span>
                </div>
                <Input
                  id="prodPackSize"
                  name="prodPackSize"
                  value={formData.packSize}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, packSize: e.target.value }))
                    if (formErrors.packSize) setFormErrors((prev) => ({ ...prev, packSize: undefined }))
                  }}
                  placeholder="e.g. 500 ml or 1 kg"
                  className={`text-xs ${formErrors.packSize ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {/* Pack size quick chips */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {["50 gm", "100 gm", "500 gm", "100 ml", "500 ml", "1 Litre", "5 Litre", "50 Litre"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, packSize: size }))}
                      className="rounded border border-border/80 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {formErrors.packSize && (
                  <p className="text-[11px] text-destructive">{formErrors.packSize}</p>
                )}
              </div>

              {/* Unit & Pricing Grid */}
              <div className="space-y-3">
                {/* Unit */}
                <div className="space-y-1.5">
                  <Label htmlFor="prodUnit" className="text-xs font-medium text-foreground">
                    Unit
                  </Label>
                  <select
                    id="prodUnit"
                    value={formData.unit}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, unit: e.target.value }))
                      if (formErrors.unit) setFormErrors((prev) => ({ ...prev, unit: undefined }))
                    }}
                    className="h-8 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground outline-none cursor-pointer"
                  >
                    {commonUnits.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  {formErrors.unit && (
                    <p className="text-[11px] text-destructive">{formErrors.unit}</p>
                  )}
                </div>

                {/* 2-Column Pricing: Buy Price & Sell Price */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Buy Price (৳) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="prodBuyPrice" className="text-xs font-medium text-foreground">
                      Buy Price (৳)
                    </Label>
                    <Input
                      id="prodBuyPrice"
                      name="prodBuyPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.buyPrice}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, buyPrice: e.target.value }))
                        if (formErrors.buyPrice) setFormErrors((prev) => ({ ...prev, buyPrice: undefined }))
                      }}
                      placeholder="e.g. 350"
                      className={`text-xs font-mono font-semibold ${formErrors.buyPrice ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {formErrors.buyPrice && (
                      <p className="text-[11px] text-destructive">{formErrors.buyPrice}</p>
                    )}
                  </div>

                  {/* Sell Price (৳) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="prodSellPrice" className="text-xs font-medium text-foreground">
                      Sell Price (৳)
                    </Label>
                    <Input
                      id="prodSellPrice"
                      name="prodSellPrice"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.sellPrice}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, sellPrice: e.target.value }))
                        if (formErrors.sellPrice) setFormErrors((prev) => ({ ...prev, sellPrice: undefined }))
                      }}
                      placeholder="e.g. 450"
                      className={`text-xs font-mono font-semibold ${formErrors.sellPrice ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {formErrors.sellPrice && (
                      <p className="text-[11px] text-destructive">{formErrors.sellPrice}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setEditingProduct(null)
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer font-medium shadow-xs"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Modal                                 */}
      {/* ========================================================= */}
      {deletingProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-prod-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={() => setDeletingProduct(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-card p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 id="delete-prod-title" className="text-sm font-semibold text-foreground">
                  Delete Product?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to remove{" "}
                  <span className="font-semibold text-foreground">{deletingProduct.name}</span> ({deletingProduct.code})?
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingProduct(null)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                className="cursor-pointer text-xs font-medium"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
