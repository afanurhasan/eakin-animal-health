"use client"

import * as React from "react"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Building,
  Building2,
  UsersRound,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import { type AreaItem } from "@/lib/mock-data"

export default function AreasPage() {
  const {
    areas,
    regionalOffices,
    depots,
    ams,
    addArea,
    updateArea,
    deleteArea,
  } = useAppState()

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedROFilter, setSelectedROFilter] = React.useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingArea, setEditingArea] = React.useState<AreaItem | null>(null)
  const [deletingArea, setDeletingArea] = React.useState<AreaItem | null>(null)

  // Form input states
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    regionalOfficeId: regionalOffices[0]?.id || "ro-1",
  })
  const [formError, setFormError] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Filtered areas
  const filteredAreas = React.useMemo(() => {
    return areas.filter((a) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.regionalOfficeName && a.regionalOfficeName.toLowerCase().includes(q))

      const matchesRO =
        selectedROFilter === "all" || a.regionalOfficeId === selectedROFilter

      return matchesSearch && matchesRO
    })
  }, [areas, searchQuery, selectedROFilter])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  const [formErrors, setFormErrors] = React.useState<{
    code?: string
    name?: string
    regionalOfficeId?: string
  }>({})

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextNum = areas.length + 1
    setFormData({
      code: `AREA-${String(nextNum).padStart(3, "0")}`,
      name: "",
      regionalOfficeId: regionalOffices[0]?.id || "ro-1",
    })
    setFormError("")
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (area: AreaItem) => {
    setEditingArea(area)
    setFormData({
      code: area.code,
      name: area.name,
      regionalOfficeId: area.regionalOfficeId || regionalOffices[0]?.id || "ro-1",
    })
    setFormError("")
    setFormErrors({})
  }

  // Handle Save (Create or Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { code?: string; name?: string; regionalOfficeId?: string } = {}
    if (!formData.code.trim()) {
      errors.code = "This field is required."
    }
    if (!formData.name.trim()) {
      errors.name = "This field is required."
    }
    if (!formData.regionalOfficeId) {
      errors.regionalOfficeId = "Regional Office selection is required."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const assignedRO = regionalOffices.find((ro) => ro.id === formData.regionalOfficeId)
    const roName = assignedRO?.name || ""
    const depotId = assignedRO?.depotId || depots[0]?.id || "dep-1"
    const depotName = assignedRO?.depotName || depots[0]?.name || ""

    if (editingArea) {
      // Update existing
      updateArea(editingArea.id, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        regionalOfficeId: formData.regionalOfficeId,
        regionalOfficeName: roName,
        depotId,
        depotName,
      })
      setEditingArea(null)
      showToast("Area updated successfully.")
    } else {
      // Create new
      addArea({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        regionalOfficeId: formData.regionalOfficeId,
        regionalOfficeName: roName,
        depotId,
        depotName,
      })
      setIsCreateOpen(false)
      showToast("New area created successfully.")
    }
    setFormData({ code: "", name: "", regionalOfficeId: regionalOffices[0]?.id || "ro-1" })
    setFormError("")
    setFormErrors({})
  }

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingArea) return
    deleteArea(deletingArea.id)
    setDeletingArea(null)
    showToast("Area deleted successfully.")
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
            Areas
          </h2>
          <p className="text-xs text-muted-foreground">
            Total Areas: <span className="font-semibold text-foreground">{areas.length}</span> across Regional Offices
          </p>
        </div>

        {/* Add Area Button */}
        <Button
          type="button"
          onClick={handleOpenCreate}
          size="sm"
          className="cursor-pointer gap-1.5 font-medium shadow-xs"
        >
          <Plus className="size-4" />
          <span>Add Area</span>
        </Button>
      </div>

      {/* Main Table Card with Search & Regional Office Filter */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Areas ({filteredAreas.length})
            </CardTitle>

            {/* Filter Controls: Regional Office Select & Search Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Regional Office Filter Dropdown */}
              <div className="flex items-center gap-1.5">
                <Filter className="size-3.5 text-muted-foreground" />
                <select
                  value={selectedROFilter}
                  onChange={(e) => setSelectedROFilter(e.target.value)}
                  className="h-8 rounded-none border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Regional Offices</option>
                  {regionalOffices.map((ro) => (
                    <option key={ro.id} value={ro.id}>
                      {ro.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search areas..."
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
                  <th scope="col" className="w-16 px-4 py-3 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Area Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Area Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Regional Office
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Primary Depot
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Assigned AM
                  </th>
                  <th scope="col" className="w-32 px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAreas.length > 0 ? (
                  filteredAreas.map((area, index) => {
                    const ro = regionalOffices.find((r) => r.id === area.regionalOfficeId)
                    const roDisplayName = ro ? ro.name : area.regionalOfficeName || "—"
                    const depotDisplayName = ro?.depotName || area.depotName || "Bogura Depot"
                    const assignedAM = ams.find((a) => a.areaId === area.id)

                    return (
                      <tr
                        key={area.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        {/* Serial Number */}
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>

                        {/* Area Code */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                            <MapPin className="size-3 text-primary" />
                            {area.code}
                          </span>
                        </td>

                        {/* Area Name */}
                        <td className="px-4 py-3 font-medium text-foreground">
                          {area.name}
                        </td>

                        {/* Regional Office */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <Building className="size-3.5 text-primary" />
                            <span>{roDisplayName}</span>
                          </span>
                        </td>

                        {/* Associated Depot */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Building2 className="size-3.5 text-muted-foreground/80" />
                            <span>{depotDisplayName}</span>
                          </span>
                        </td>

                        {/* Assigned AM */}
                        <td className="px-4 py-3">
                          {assignedAM ? (
                            <span className="inline-flex items-center gap-1 text-xs text-foreground">
                              <UsersRound className="size-3 text-muted-foreground" />
                              <span className="font-medium">{assignedAM.name}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Unassigned</span>
                          )}
                        </td>

                        {/* Actions: Edit / Delete */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Edit Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(area)}
                              aria-label={`Edit ${area.name}`}
                              className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="size-3.5" />
                            </Button>

                            {/* Delete Button */}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setDeletingArea(area)}
                              aria-label={`Delete ${area.name}`}
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
                      colSpan={7}
                      className="px-4 py-8 text-center text-xs text-muted-foreground"
                    >
                      No areas found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Create / Edit Area Modal Dialog                           */}
      {/* ========================================================= */}
      {(isCreateOpen || editingArea) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="area-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              setIsCreateOpen(false)
              setEditingArea(null)
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3
                id="area-modal-title"
                className="text-base font-semibold text-foreground"
              >
                {editingArea ? "Edit Area" : "Add Area"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingArea(null)
                }}
                aria-label="Cancel"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} noValidate className="mt-4 space-y-4">
              {formError && (
                <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                  {formError}
                </div>
              )}

              {/* Area Code */}
              <div className="space-y-1.5">
                <Label htmlFor="areaCode" className="text-xs font-medium text-foreground">
                  Area Code
                </Label>
                <Input
                  id="areaCode"
                  name="areaCode"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                  }}
                  placeholder="e.g. AREA-BOG-01"
                  className={`text-xs font-mono uppercase ${formErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {formErrors.code && (
                  <p className="text-[11px] text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* Area Name */}
              <div className="space-y-1.5">
                <Label htmlFor="areaName" className="text-xs font-medium text-foreground">
                  Area Name
                </Label>
                <Input
                  id="areaName"
                  name="areaName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Bogura"
                  className={`text-xs ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Regional Office Association (Each Area belongs to exactly ONE Regional Office) */}
              <div className="space-y-1.5">
                <Label htmlFor="roSelect" className="text-xs font-medium text-foreground">
                  Regional Office
                </Label>
                <select
                  id="roSelect"
                  value={formData.regionalOfficeId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, regionalOfficeId: e.target.value }))
                    if (formErrors.regionalOfficeId) setFormErrors((prev) => ({ ...prev, regionalOfficeId: undefined }))
                  }}
                  className={`h-8 w-full rounded border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring ${formErrors.regionalOfficeId ? "border-destructive focus:ring-destructive" : "border-input"}`}
                >
                  {regionalOffices.map((ro) => (
                    <option key={ro.id} value={ro.id}>
                      {ro.name} ({ro.code}) &bull; Primary Depot: {ro.depotName || "Bogura Depot"}
                    </option>
                  ))}
                </select>
                {formErrors.regionalOfficeId && (
                  <p className="text-[11px] text-destructive">{formErrors.regionalOfficeId}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setEditingArea(null)
                  }}
                  className="cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer font-medium text-xs"
                >
                  {editingArea ? "Save Changes" : "Save Area"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Modal Dialog                          */}
      {/* ========================================================= */}
      {deletingArea && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setDeletingArea(null)}
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
                  id="delete-dialog-title"
                  className="text-sm font-semibold text-foreground"
                >
                  Confirm Delete
                </h3>
                <p className="text-xs text-muted-foreground">
                  Are you sure you want to delete this area? This action cannot be undone.
                </p>
                <div className="mt-2 rounded border border-border/80 bg-muted/40 p-2 text-xs">
                  <span className="font-mono font-semibold text-primary">
                    {deletingArea.code}
                  </span>{" "}
                  - <span className="font-medium text-foreground">{deletingArea.name}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingArea(null)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                className="cursor-pointer font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
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
