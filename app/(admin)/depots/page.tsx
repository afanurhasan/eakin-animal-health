"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building2,
  MapPin,
  ArrowRight,
  Boxes,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { initialDepots, initialDepotStocks, type Depot } from "@/lib/mock-data"

export default function DepotsPage() {
  const [depots, setDepots] = React.useState<Depot[]>(initialDepots)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingDepot, setEditingDepot] = React.useState<Depot | null>(null)
  const [deletingDepot, setDeletingDepot] = React.useState<Depot | null>(null)

  // Form input state
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    location: "",
  })
  const [formError, setFormError] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Filtered depots
  const filteredDepots = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return depots
    return depots.filter(
      (d) =>
        d.code.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q)
    )
  }, [depots, searchQuery])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  const [formErrors, setFormErrors] = React.useState<{
    code?: string
    name?: string
    location?: string
  }>({})

  // Open Create Modal
  const handleOpenCreate = () => {
    setFormData({
      code: "",
      name: "",
      location: "",
    })
    setFormError("")
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (depot: Depot) => {
    setEditingDepot(depot)
    setFormData({
      code: depot.code,
      name: depot.name,
      location: depot.location,
    })
    setFormError("")
    setFormErrors({})
  }

  // Handle Save (Create / Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { code?: string; name?: string; location?: string } = {}
    if (!formData.code.trim()) {
      errors.code = "This field is required."
    }
    if (!formData.name.trim()) {
      errors.name = "This field is required."
    }
    if (!formData.location.trim()) {
      errors.location = "This field is required."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    if (editingDepot) {
      setDepots((prev) =>
        prev.map((item) =>
          item.id === editingDepot.id
            ? {
                ...item,
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                location: formData.location.trim(),
              }
            : item
        )
      )
      setEditingDepot(null)
      showToast("Depot updated successfully.")
    } else {
      const newDepot: Depot = {
        id: `dep-${Date.now()}`,
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        location: formData.location.trim(),
      }
      setDepots((prev) => [newDepot, ...prev])
      setIsCreateOpen(false)
      showToast("New depot created successfully.")
    }
    setFormData({ code: "", name: "", location: "" })
    setFormError("")
    setFormErrors({})
  }

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingDepot) return
    setDepots((prev) => prev.filter((item) => item.id !== deletingDepot.id))
    setDeletingDepot(null)
    showToast("Depot deleted successfully.")
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
            Depots
          </h2>
          <p className="text-xs text-muted-foreground">
            Total Depots: <span className="font-semibold text-foreground">{depots.length}</span>
          </p>
        </div>

        {/* Add Depot Button */}
        <Button
          type="button"
          onClick={handleOpenCreate}
          size="sm"
          className="cursor-pointer gap-1.5 font-medium shadow-xs"
        >
          <Plus className="size-4" />
          <span>Add Depot</span>
        </Button>
      </div>

      {/* Main Depots Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Depots ({filteredDepots.length})
            </CardTitle>

            {/* Quick Search */}
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search depots..."
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
                  <th scope="col" className="w-16 px-4 py-3 text-center">
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
                    Total Stock Units
                  </th>
                  <th scope="col" className="w-44 px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredDepots.length > 0 ? (
                  filteredDepots.map((depot, index) => {
                    const stockItems = initialDepotStocks[depot.id] || []
                    const totalUnits = stockItems.reduce((sum, item) => sum + item.quantity, 0)

                    return (
                      <tr
                        key={depot.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        {/* Serial Number */}
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>

                        {/* Depot Code */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                            <Building2 className="size-3 text-primary" />
                            {depot.code}
                          </span>
                        </td>

                        {/* Depot Name */}
                        <td className="px-4 py-3 font-semibold text-foreground">
                          <Link
                            href={`/depots/${depot.id}`}
                            className="transition-colors hover:text-primary hover:underline"
                          >
                            {depot.name}
                          </Link>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
                            <span className="truncate max-w-[200px]">{depot.location}</span>
                          </div>
                        </td>

                        {/* Total Stock Units */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
                            <Boxes className="size-3 text-muted-foreground" />
                            {totalUnits}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(depot)}
                              aria-label={`Edit ${depot.name}`}
                              className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="size-3.5" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setDeletingDepot(depot)}
                              aria-label={`Delete ${depot.name}`}
                              className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-xs text-muted-foreground"
                    >
                      No depots found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Create / Edit Depot Modal Dialog                          */}
      {/* ========================================================= */}
      {(isCreateOpen || editingDepot) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="depot-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              setIsCreateOpen(false)
              setEditingDepot(null)
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3
                id="depot-modal-title"
                className="text-base font-semibold text-foreground"
              >
                {editingDepot ? "Edit Depot" : "Add Depot"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingDepot(null)
                }}
                aria-label="Cancel"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} noValidate className="mt-4 space-y-3.5">
              {formError && (
                <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                  {formError}
                </div>
              )}

              {/* Depot Code */}
              <div className="space-y-1.5">
                <Label htmlFor="depotCode" className="text-xs font-medium text-foreground">
                  Depot Code
                </Label>
                <Input
                  id="depotCode"
                  name="depotCode"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                  }}
                  placeholder="e.g. DEP-DHA-01"
                  className={`text-xs font-mono uppercase ${formErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {formErrors.code && (
                  <p className="text-[11px] text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* Depot Name */}
              <div className="space-y-1.5">
                <Label htmlFor="depotName" className="text-xs font-medium text-foreground">
                  Depot Name
                </Label>
                <Input
                  id="depotName"
                  name="depotName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Dhaka Central Depot"
                  className={`text-xs ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-medium text-foreground">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                    if (formErrors.location) setFormErrors((prev) => ({ ...prev, location: undefined }))
                  }}
                  placeholder="e.g. Tejgaon Industrial Area, Dhaka"
                  className={`text-xs ${formErrors.location ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.location && (
                  <p className="text-[11px] text-destructive">{formErrors.location}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setEditingDepot(null)
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer font-medium"
                >
                  {editingDepot ? "Save Changes" : "Save Depot"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Modal Dialog                          */}
      {/* ========================================================= */}
      {deletingDepot && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-depot-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setDeletingDepot(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <h3
                  id="delete-depot-title"
                  className="text-sm font-semibold text-foreground"
                >
                  Confirm Delete
                </h3>
                <p className="text-xs text-muted-foreground">
                  Are you sure you want to delete this depot? This action cannot be undone.
                </p>
                <div className="mt-2 rounded border border-border/80 bg-muted/40 p-2 text-xs">
                  <span className="font-mono font-semibold text-primary">
                    {deletingDepot.code}
                  </span>{" "}
                  - <span className="font-medium text-foreground">{deletingDepot.name}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingDepot(null)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                className="cursor-pointer font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
