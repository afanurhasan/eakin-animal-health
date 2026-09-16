"use client"

import * as React from "react"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  MapPinned,
  Building,
  Building2,
  UserCheck,
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
import { type TerritoryItem } from "@/lib/mock-data"

export default function TerritoriesPage() {
  const {
    territories,
    areas,
    regionalOffices,
    depots,
    officers,
    addTerritory,
    updateTerritory,
    deleteTerritory,
  } = useAppState()

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAreaFilter, setSelectedAreaFilter] = React.useState("all")
  const [selectedROFilter, setSelectedROFilter] = React.useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingTerritory, setEditingTerritory] = React.useState<TerritoryItem | null>(null)
  const [deletingTerritory, setDeletingTerritory] = React.useState<TerritoryItem | null>(null)

  // Form input states
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    areaId: areas[0]?.id || "area-1",
  })
  const [formError, setFormError] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  const [formErrors, setFormErrors] = React.useState<{
    code?: string
    name?: string
    areaId?: string
  }>({})

  // Dependent parent area info for the form
  const formSelectedArea = React.useMemo(() => {
    return areas.find((a) => a.id === formData.areaId) || areas[0] || null
  }, [areas, formData.areaId])

  // Dependent regional office & depot info for the form
  const formRegionalOffice = React.useMemo(() => {
    if (!formSelectedArea) return null
    return (
      regionalOffices.find((ro) => ro.id === formSelectedArea.regionalOfficeId) || null
    )
  }, [regionalOffices, formSelectedArea])

  const formDepot = React.useMemo(() => {
    if (!formSelectedArea) return null
    return (
      depots.find((d) => d.id === formSelectedArea.depotId) ||
      (formRegionalOffice ? depots.find((d) => d.id === formRegionalOffice.depotId) : null) ||
      depots[0] ||
      null
    )
  }, [depots, formSelectedArea, formRegionalOffice])

  // Filtered territories
  const filteredTerritories = React.useMemo(() => {
    return territories.filter((t) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        t.code.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        (t.areaName && t.areaName.toLowerCase().includes(q)) ||
        (t.regionalOfficeName && t.regionalOfficeName.toLowerCase().includes(q))

      const matchesArea = selectedAreaFilter === "all" || t.areaId === selectedAreaFilter

      const territoryArea = areas.find((a) => a.id === t.areaId)
      const roId = t.regionalOfficeId || territoryArea?.regionalOfficeId
      const matchesRO = selectedROFilter === "all" || roId === selectedROFilter

      return matchesSearch && matchesArea && matchesRO
    })
  }, [territories, areas, searchQuery, selectedAreaFilter, selectedROFilter])

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextNum = territories.length + 1
    const defaultArea = areas[0]
    setFormData({
      code: `TER-${String(nextNum).padStart(3, "0")}`,
      name: "",
      areaId: defaultArea?.id || "area-1",
    })
    setFormError("")
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (ter: TerritoryItem) => {
    setEditingTerritory(ter)
    setFormData({
      code: ter.code,
      name: ter.name,
      areaId: ter.areaId || areas[0]?.id || "area-1",
    })
    setFormError("")
    setFormErrors({})
  }

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: { code?: string; name?: string; areaId?: string } = {}
    if (!formData.code.trim()) {
      errors.code = "This field is required."
    }
    if (!formData.name.trim()) {
      errors.name = "This field is required."
    }
    if (!formData.areaId) {
      errors.areaId = "Please select a parent Area."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const parentArea = areas.find((a) => a.id === formData.areaId)
    const ro = parentArea
      ? regionalOffices.find((r) => r.id === parentArea.regionalOfficeId)
      : null
    const depot = parentArea
      ? depots.find((d) => d.id === parentArea.depotId) || (ro ? depots.find((d) => d.id === ro.depotId) : null)
      : null

    const territoryPayload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      areaId: formData.areaId,
      areaName: parentArea ? parentArea.name : "Unassigned Area",
      regionalOfficeId: ro ? ro.id : parentArea?.regionalOfficeId || "",
      regionalOfficeName: ro ? ro.name : parentArea?.regionalOfficeName || "",
      depotId: depot ? depot.id : parentArea?.depotId || "",
      depotName: depot ? depot.name : parentArea?.depotName || "",
    }

    if (editingTerritory) {
      updateTerritory(editingTerritory.id, territoryPayload)
      setEditingTerritory(null)
      showToast("Territory updated successfully.")
    } else {
      addTerritory(territoryPayload)
      setIsCreateOpen(false)
      showToast("New territory added successfully.")
    }

    setFormErrors({})
    setFormError("")
  }

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingTerritory) return
    deleteTerritory(deletingTerritory.id)
    setDeletingTerritory(null)
    showToast("Territory deleted successfully.")
  }

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-medium text-emerald-600 shadow-md backdrop-blur-xs">
          <CheckCircle2 className="size-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Territories
          </h2>
          <p className="text-xs text-muted-foreground">
            Total Territories: <span className="font-semibold text-foreground">{territories.length}</span> across Areas
          </p>
        </div>

        {/* Add Territory Button */}
        <Button
          type="button"
          onClick={handleOpenCreate}
          size="sm"
          className="cursor-pointer gap-1.5 font-medium shadow-xs"
        >
          <Plus className="size-4" />
          <span>Add Territory</span>
        </Button>
      </div>

      {/* Main Table Card with Search & Filters */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Territories ({filteredTerritories.length})
            </CardTitle>

            {/* Filter Controls: Area Select, Regional Office Select & Search Bar */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Area Filter Dropdown */}
              <div className="flex items-center gap-1.5">
                <Filter className="size-3.5 text-muted-foreground" />
                <select
                  value={selectedAreaFilter}
                  onChange={(e) => setSelectedAreaFilter(e.target.value)}
                  className="h-8 rounded-none border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Areas</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Regional Office Filter Dropdown */}
              <div className="flex items-center gap-1.5">
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
                  placeholder="Search territories..."
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
                    Territory Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Territory Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Parent Area
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Regional Office
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Depot
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Assigned MPOs
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredTerritories.length > 0 ? (
                  filteredTerritories.map((ter, index) => {
                    const parentArea = areas.find((a) => a.id === ter.areaId)
                    const areaName = parentArea ? parentArea.name : ter.areaName || "Unassigned"
                    const ro = regionalOffices.find(
                      (r) => r.id === (ter.regionalOfficeId || parentArea?.regionalOfficeId)
                    )
                    const roName = ro ? ro.name : ter.regionalOfficeName || parentArea?.regionalOfficeName || "-"
                    const depot = depots.find(
                      (d) => d.id === (ter.depotId || parentArea?.depotId || ro?.depotId)
                    )
                    const depotName = depot ? depot.name : ter.depotName || parentArea?.depotName || "-"

                    const assignedMPOs = officers.filter(
                      (o) => o.territoryId === ter.id || (!o.territoryId && o.areaId === ter.areaId && o.code === "MPO-001" && ter.code === "TER-BOG-01")
                    )

                    return (
                      <tr key={ter.id} className="hover:bg-muted/30 transition-colors">
                        {/* Serial Number */}
                        <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                          {index + 1}
                        </td>

                        {/* Code */}
                        <td className="px-4 py-3 font-mono font-medium text-primary">
                          {ter.code}
                        </td>

                        {/* Name */}
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {ter.name}
                        </td>

                        {/* Parent Area */}
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <MapPin className="size-3.5 text-emerald-600" />
                            <span>{areaName}</span>
                          </span>
                        </td>

                        {/* Regional Office */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <Building className="size-3.5 text-muted-foreground/80" />
                            <span>{roName}</span>
                          </span>
                        </td>

                        {/* Depot */}
                        <td className="px-4 py-3 text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5 text-xs">
                            <Building2 className="size-3.5 text-muted-foreground/80" />
                            <span>{depotName}</span>
                          </span>
                        </td>

                        {/* Assigned MPOs */}
                        <td className="px-4 py-3">
                          {assignedMPOs.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {assignedMPOs.map((mpo) => (
                                <span
                                  key={mpo.id}
                                  className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                                >
                                  <UserCheck className="size-3" />
                                  {mpo.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">No MPO assigned</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleOpenEdit(ter)}
                              aria-label={`Edit ${ter.name}`}
                              className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="size-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => setDeletingTerritory(ter)}
                              aria-label={`Delete ${ter.name}`}
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
                    <td colSpan={8} className="px-4 py-8 text-center text-xs text-muted-foreground">
                      No territories found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Create / Edit Territory Modal Dialog                      */}
      {/* ========================================================= */}
      {(isCreateOpen || editingTerritory) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="territory-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              setIsCreateOpen(false)
              setEditingTerritory(null)
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 id="territory-modal-title" className="text-base font-semibold text-foreground">
                {editingTerritory ? "Edit Territory" : "Add Territory"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingTerritory(null)
                }}
                aria-label="Cancel"
                className="text-muted-foreground hover:text-foreground cursor-pointer"
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

              {/* Territory Code */}
              <div className="space-y-1.5">
                <Label htmlFor="territoryCode" className="text-xs font-medium text-foreground">
                  Territory Code
                </Label>
                <Input
                  id="territoryCode"
                  name="territoryCode"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                  }}
                  placeholder="e.g. TER-BOG-01"
                  className={`text-xs font-mono uppercase ${formErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.code && (
                  <p className="text-[11px] text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* Territory Name */}
              <div className="space-y-1.5">
                <Label htmlFor="territoryName" className="text-xs font-medium text-foreground">
                  Territory Name
                </Label>
                <Input
                  id="territoryName"
                  name="territoryName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Bogura Sadar, Dhunot, Gabtoli..."
                  className={`text-xs ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Parent Area Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="parentArea" className="text-xs font-medium text-foreground">
                  Belongs Under Area
                </Label>
                <select
                  id="parentArea"
                  value={formData.areaId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, areaId: e.target.value }))
                    if (formErrors.areaId) setFormErrors((prev) => ({ ...prev, areaId: undefined }))
                  }}
                  className={`h-8 w-full rounded border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring ${formErrors.areaId ? "border-destructive focus:ring-destructive" : "border-input"}`}
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.code}) &mdash; {a.regionalOfficeName}
                    </option>
                  ))}
                </select>
                {formErrors.areaId && (
                  <p className="text-[11px] text-destructive">{formErrors.areaId}</p>
                )}
              </div>

              {/* Auto-Connected Hierarchy Preview Card */}
              <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3">
                <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Auto-Connected Area Hierarchy
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 rounded border border-input/60 bg-background/80 px-2.5 py-1.5">
                    <Building className="size-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Regional Office</p>
                      <p className="font-medium text-foreground truncate">
                        {formRegionalOffice ? formRegionalOffice.name : (formSelectedArea?.regionalOfficeName || "Bogura Regional Office")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded border border-input/60 bg-background/80 px-2.5 py-1.5">
                    <Building2 className="size-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Assigned Depot</p>
                      <p className="font-medium text-foreground truncate">
                        {formDepot ? formDepot.name : (formSelectedArea?.depotName || "Bogura Depot")}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Regional Office and Depot are inherited automatically from the selected parent Area.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsCreateOpen(false)
                    setEditingTerritory(null)
                  }}
                  className="cursor-pointer text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
                >
                  {editingTerritory ? "Save Changes" : "Save Territory"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Modal Dialog                          */}
      {/* ========================================================= */}
      {deletingTerritory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setDeletingTerritory(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-sm rounded-md border border-border bg-card p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="size-4" />
              </div>
              <div className="space-y-1">
                <h3 id="delete-modal-title" className="text-sm font-semibold text-foreground">
                  Delete Territory
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-foreground">{deletingTerritory.name}</strong> ({deletingTerritory.code})?
                  Any MPO currently assigned to this territory will need to be re-assigned.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingTerritory(null)}
                className="cursor-pointer text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleConfirmDelete}
                className="cursor-pointer text-xs font-semibold"
              >
                Delete Territory
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
