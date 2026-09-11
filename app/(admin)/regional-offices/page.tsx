"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Building,
  Building2,
  MapPin,
  UserRound,
  Eye,
  X,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import { type RegionalOffice } from "@/lib/mock-data"

export default function RegionalOfficesPage() {
  const {
    regionalOffices,
    depots,
    areas,
    rms,
    addRegionalOffice,
    updateRegionalOffice,
    deleteRegionalOffice,
  } = useAppState()

  const [searchQuery, setSearchQuery] = React.useState("")

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingOffice, setEditingOffice] = React.useState<RegionalOffice | null>(null)
  const [viewingOffice, setViewingOffice] = React.useState<RegionalOffice | null>(null)
  const [deletingOffice, setDeletingOffice] = React.useState<RegionalOffice | null>(null)

  // Form input state
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    location: "",
    depotId: depots[0]?.id || "dep-1",
  })
  const [formError, setFormError] = React.useState("")
  const [formErrors, setFormErrors] = React.useState<{
    code?: string
    name?: string
    location?: string
    depotId?: string
  }>({})
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  // Filtered Regional Offices
  const filteredOffices = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return regionalOffices
    return regionalOffices.filter(
      (ro) =>
        ro.code.toLowerCase().includes(q) ||
        ro.name.toLowerCase().includes(q) ||
        (ro.location && ro.location.toLowerCase().includes(q)) ||
        (ro.depotName && ro.depotName.toLowerCase().includes(q))
    )
  }, [regionalOffices, searchQuery])

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextNum = regionalOffices.length + 1
    setFormData({
      code: `RO-${String(nextNum).padStart(3, "0")}`,
      name: "",
      location: "",
      depotId: depots[0]?.id || "dep-1",
    })
    setFormError("")
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (office: RegionalOffice) => {
    setEditingOffice(office)
    setFormData({
      code: office.code,
      name: office.name,
      location: office.location || "",
      depotId: office.depotId || depots[0]?.id || "dep-1",
    })
    setFormError("")
    setFormErrors({})
  }

  // Handle Save (Create / Edit)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { code?: string; name?: string; location?: string; depotId?: string } = {}
    if (!formData.code.trim()) {
      errors.code = "This field is required."
    }
    if (!formData.name.trim()) {
      errors.name = "This field is required."
    }
    if (!formData.depotId) {
      errors.depotId = "A primary/default depot is required."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const matchedDepot = depots.find((d) => d.id === formData.depotId)
    const depotName = matchedDepot?.name || ""

    if (editingOffice) {
      updateRegionalOffice(editingOffice.id, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        location: formData.location.trim(),
        depotId: formData.depotId,
        depotName,
      })
      setEditingOffice(null)
      showToast("Regional Office updated successfully.")
    } else {
      addRegionalOffice({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        location: formData.location.trim(),
        depotId: formData.depotId,
        depotName,
      })
      setIsCreateOpen(false)
      showToast("New Regional Office created successfully.")
    }

    setFormData({
      code: "",
      name: "",
      location: "",
      depotId: depots[0]?.id || "dep-1",
    })
    setFormError("")
    setFormErrors({})
  }

  // Handle Delete
  const handleDeleteConfirm = () => {
    if (!deletingOffice) return
    deleteRegionalOffice(deletingOffice.id)
    setDeletingOffice(null)
    showToast("Regional Office deleted successfully.")
  }

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-md border border-primary/20 bg-card px-4 py-2.5 text-xs font-medium text-foreground shadow-lg transition-all"
        >
          <CheckCircle2 className="size-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Regional Office Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage regional office organizational hierarchy and associated primary depots.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          size="sm"
          className="cursor-pointer gap-1.5 self-start sm:self-auto"
        >
          <Plus className="size-3.5" />
          <span>Add Regional Office</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-[11px] font-medium text-muted-foreground">
              Total Regional Offices
            </CardTitle>
            <Building className="size-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-bold text-foreground">
              {regionalOffices.length}
            </div>
            <p className="text-[10px] text-muted-foreground">Operating hubs</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-[11px] font-medium text-muted-foreground">
              Connected Areas
            </CardTitle>
            <MapPin className="size-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-bold text-foreground">
              {areas.length}
            </div>
            <p className="text-[10px] text-muted-foreground">Across all regions</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-[11px] font-medium text-muted-foreground">
              Regional Managers
            </CardTitle>
            <UserRound className="size-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-bold text-foreground">
              {regionalOffices.filter((ro) => rms.some((r) => r.regionalOfficeId === ro.id)).length}
            </div>
            <p className="text-[10px] text-muted-foreground">Assigned to offices</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
            <CardTitle className="text-[11px] font-medium text-muted-foreground">
              Connected Depots
            </CardTitle>
            <Building2 className="size-3.5 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-lg font-bold text-foreground">
              {depots.length}
            </div>
            <p className="text-[10px] text-muted-foreground">Fulfillment centers</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="p-4 pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Regional Offices ({filteredOffices.length})
            </CardTitle>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search regional offices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs"
                aria-label="Search regional offices"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-y border-border/80 bg-muted/40 text-[11px] font-semibold text-muted-foreground uppercase">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Code</th>
                  <th scope="col" className="px-4 py-2.5">Regional Office</th>
                  <th scope="col" className="px-4 py-2.5">Primary Depot</th>
                  <th scope="col" className="px-4 py-2.5">Areas</th>
                  <th scope="col" className="px-4 py-2.5">Assigned RM</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOffices.length > 0 ? (
                  filteredOffices.map((office) => {
                    const officeAreas = areas.filter(
                      (a) => a.regionalOfficeId === office.id
                    )
                    const assignedRM = rms.find(
                      (r) => r.regionalOfficeId === office.id
                    )

                    return (
                      <tr
                        key={office.id}
                        className="transition-colors hover:bg-muted/30"
                      >
                        {/* Code */}
                        <td className="px-4 py-3 font-mono font-medium text-primary">
                          {office.code}
                        </td>

                        {/* Name & Location */}
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">
                            {office.name}
                          </div>
                          {office.location && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                              <MapPin className="size-3" />
                              <span>{office.location}</span>
                            </div>
                          )}
                        </td>

                        {/* Primary Depot */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-medium text-foreground">
                            <Building2 className="size-3 text-primary" />
                            <span>{office.depotName || "Bogura Depot"}</span>
                          </span>
                        </td>

                        {/* Areas Count */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                            {officeAreas.length} Areas
                          </span>
                        </td>

                        {/* Assigned RM (1 Office = 1 RM) */}
                        <td className="px-4 py-3">
                          {assignedRM ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
                              <UserRound className="size-3.5 text-primary" />
                              <span>{assignedRM.name}</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">Unassigned</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setViewingOffice(office)}
                              aria-label={`View details of ${office.name}`}
                              className="cursor-pointer text-muted-foreground hover:text-foreground"
                            >
                              <Eye className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(office)}
                              aria-label={`Edit ${office.name}`}
                              className="cursor-pointer text-muted-foreground hover:text-foreground"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setDeletingOffice(office)}
                              aria-label={`Delete ${office.name}`}
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
                      No regional offices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Create / Edit Regional Office Modal Dialog                */}
      {/* ========================================================= */}
      {(isCreateOpen || editingOffice) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ro-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              setIsCreateOpen(false)
              setEditingOffice(null)
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3
                id="ro-modal-title"
                className="text-base font-semibold text-foreground"
              >
                {editingOffice ? "Edit Regional Office" : "Add Regional Office"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingOffice(null)
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

              {/* Office Code */}
              <div className="space-y-1.5">
                <Label htmlFor="roCode" className="text-xs font-medium text-foreground">
                  Regional Office Code
                </Label>
                <Input
                  id="roCode"
                  name="roCode"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                  }}
                  placeholder="e.g. RO-BOG-01"
                  className={`text-xs font-mono uppercase ${formErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {formErrors.code && (
                  <p className="text-[11px] text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* Office Name */}
              <div className="space-y-1.5">
                <Label htmlFor="roName" className="text-xs font-medium text-foreground">
                  Regional Office Name
                </Label>
                <Input
                  id="roName"
                  name="roName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Bogura Regional Office"
                  className={`text-xs ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Primary / Default Depot Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="primaryDepot" className="text-xs font-medium text-foreground">
                  Primary / Default Depot
                </Label>
                <select
                  id="primaryDepot"
                  name="primaryDepot"
                  value={formData.depotId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, depotId: e.target.value }))
                    if (formErrors.depotId) setFormErrors((prev) => ({ ...prev, depotId: undefined }))
                  }}
                  className={`flex h-8 w-full rounded-md border bg-card px-2.5 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary ${
                    formErrors.depotId ? "border-destructive focus-visible:ring-destructive" : "border-border"
                  }`}
                >
                  {depots.map((depot) => (
                    <option key={depot.id} value={depot.id}>
                      {depot.name} ({depot.code})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground">
                  Each Regional Office is associated with one primary depot at creation.
                </p>
                {formErrors.depotId && (
                  <p className="text-[11px] text-destructive">{formErrors.depotId}</p>
                )}
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <Label htmlFor="roLocation" className="text-xs font-medium text-foreground">
                  Location
                </Label>
                <Input
                  id="roLocation"
                  name="roLocation"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                    if (formErrors.location) setFormErrors((prev) => ({ ...prev, location: undefined }))
                  }}
                  placeholder="e.g. Sherpur Road, Bogura"
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
                    setEditingOffice(null)
                  }}
                  className="cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="cursor-pointer text-xs">
                  {editingOffice ? "Update Regional Office" : "Create Regional Office"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* View Regional Office Modal Dialog                         */}
      {/* ========================================================= */}
      {viewingOffice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-ro-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setViewingOffice(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Building className="size-4" />
                </div>
                <div>
                  <h3 id="view-ro-title" className="text-sm font-bold text-foreground">
                    {viewingOffice.name}
                  </h3>
                  <span className="font-mono text-[11px] text-primary">{viewingOffice.code}</span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setViewingOffice(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-border/60 bg-muted/20 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Primary Depot
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  {viewingOffice.depotName || "Bogura Depot"}
                </span>
              </div>
              <div className="rounded border border-border/60 bg-muted/20 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Location
                </span>
                <span className="font-semibold text-foreground mt-0.5 block">
                  {viewingOffice.location || "N/A"}
                </span>
              </div>
            </div>

            {/* Areas Under this Regional Office */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground block">
                Areas Under this Regional Office (
                {areas.filter((a) => a.regionalOfficeId === viewingOffice.id).length}
                )
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                {areas
                  .filter((a) => a.regionalOfficeId === viewingOffice.id)
                  .map((area) => (
                    <span
                      key={area.id}
                      className="inline-flex items-center gap-1 rounded-sm border border-border bg-muted/30 px-2 py-0.5 text-xs text-foreground"
                    >
                      <MapPin className="size-3 text-primary" />
                      <span>{area.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">({area.code})</span>
                    </span>
                  ))}
              </div>
            </div>

            {/* RM Under this Regional Office (1-to-1) */}
            {(() => {
              const assignedRM = rms.find((r) => r.regionalOfficeId === viewingOffice.id)
              return (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-foreground block">
                    Assigned Regional Manager
                  </span>
                  {assignedRM ? (
                    <div className="flex items-center justify-between rounded border border-border/60 bg-muted/20 p-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <UserRound className="size-4 text-primary" />
                        <div>
                          <span className="font-semibold text-foreground">{assignedRM.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground ml-1.5">({assignedRM.code})</span>
                          <div className="text-[11px] text-muted-foreground">{assignedRM.phone}</div>
                        </div>
                      </div>
                      <div className="text-right text-[11px] text-muted-foreground">
                        <div>Connected Depots:</div>
                        <span className="font-semibold text-foreground">
                          {assignedRM.depotNames?.join(", ") || assignedRM.depotIds?.join(", ")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded border border-dashed border-border/80 p-3 text-center text-xs text-muted-foreground">
                      No Regional Manager assigned to this office.
                    </div>
                  )}
                </div>
              )
            })()}

            <div className="flex justify-end pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingOffice(null)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Dialog                                */}
      {/* ========================================================= */}
      {deletingOffice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-ro-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setDeletingOffice(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Dialog Container */}
          <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-card p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-4" />
              </div>
              <div className="space-y-1">
                <h3 id="delete-ro-title" className="text-sm font-semibold text-foreground">
                  Delete Regional Office
                </h3>
                <p className="text-xs text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <strong className="text-foreground">{deletingOffice.name}</strong> (
                  <span className="font-mono">{deletingOffice.code}</span>)? This action cannot be
                  undone.
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingOffice(null)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                className="cursor-pointer text-xs"
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
