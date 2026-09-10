"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  UserRound,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import {
  type RMItem,
  type AreaItem,
} from "@/lib/mock-data"

export default function RegionalManagersPage() {
  const {
    rms,
    areas,
    addRM,
    updateRM,
    deleteRM,
  } = useAppState()

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAreaFilter, setSelectedAreaFilter] = React.useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingRM, setEditingRM] = React.useState<RMItem | null>(null)
  const [deletingRM, setDeletingRM] = React.useState<RMItem | null>(null)
  const [showPinModal, setShowPinModal] = React.useState(false)

  // Form input state
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    phone: "",
    pin: "123456",
    email: "",
    areaId: areas[0]?.id || "1",
  })
  const [formError, setFormError] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  // Filtered RMs
  const filteredRMs = React.useMemo(() => {
    return rms.filter((rm) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        rm.name.toLowerCase().includes(q) ||
        rm.code.toLowerCase().includes(q) ||
        rm.phone.toLowerCase().includes(q) ||
        rm.email.toLowerCase().includes(q)

      const matchesArea =
        selectedAreaFilter === "all" || rm.areaId === selectedAreaFilter

      return matchesSearch && matchesArea
    })
  }, [rms, searchQuery, selectedAreaFilter])

  const [formErrors, setFormErrors] = React.useState<{
    code?: string
    name?: string
    phone?: string
    pin?: string
    email?: string
    areaId?: string
  }>({})

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextCodeNumber = rms.length + 1
    setFormData({
      code: `RM-${String(nextCodeNumber).padStart(3, "0")}`,
      name: "",
      phone: "",
      pin: "123456",
      email: "",
      areaId: areas[0]?.id || "1",
    })
    setShowPinModal(false)
    setFormError("")
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (rm: RMItem) => {
    setEditingRM(rm)
    setFormData({
      code: rm.code,
      name: rm.name,
      phone: rm.phone,
      pin: rm.pin || "123456",
      email: rm.email || "",
      areaId: rm.areaId,
    })
    setShowPinModal(false)
    setFormError("")
    setFormErrors({})
  }

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const errors: {
      code?: string
      name?: string
      phone?: string
      pin?: string
      email?: string
      areaId?: string
    } = {}

    if (!formData.code.trim()) {
      errors.code = "This field is required."
    }
    if (!formData.name.trim()) {
      errors.name = "This field is required."
    }
    if (!formData.phone.trim()) {
      errors.phone = "This field is required."
    }
    if (!formData.pin || formData.pin.length !== 6 || !/^\d{6}$/.test(formData.pin)) {
      errors.pin = "PIN must be exactly 6 numeric digits."
    }
    if (!formData.areaId) {
      errors.areaId = "This field is required."
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      errors.email = "Please enter a valid email address."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const assignedArea = areas.find((a) => a.id === formData.areaId)
    const areaName = assignedArea ? assignedArea.name : "Unassigned"

    if (editingRM) {
      updateRM(editingRM.id, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pin: formData.pin.trim(),
        email: formData.email.trim(),
        areaId: formData.areaId,
        areaName,
      })
      setEditingRM(null)
      showToast("Regional Manager updated successfully.")
    } else {
      addRM({
        code: formData.code.trim().toUpperCase() || `RM-${String(rms.length + 1).padStart(3, "0")}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pin: formData.pin.trim() || "123456",
        email: formData.email.trim(),
        areaId: formData.areaId,
        areaName,
      })
      setIsCreateOpen(false)
      showToast("New Regional Manager added successfully with 6-digit login PIN.")
    }
    setFormErrors({})
    setFormError("")
  }

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingRM) return
    deleteRM(deletingRM.id)
    setDeletingRM(null)
    showToast("Regional Manager deleted successfully.")
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
            Regional Managers
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage regional managers and their assigned areas.
          </p>
        </div>

        {/* Add RM Button */}
        <Button
          type="button"
          onClick={handleOpenCreate}
          size="sm"
          className="cursor-pointer gap-1.5 font-medium shadow-xs"
        >
          <Plus className="size-4" />
          <span>Add RM</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Regional Managers ({filteredRMs.length})
            </CardTitle>

            {/* Filter and Search Controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {/* Area Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="size-3.5 text-muted-foreground" />
                <select
                  aria-label="Filter by Area"
                  value={selectedAreaFilter}
                  onChange={(e) => setSelectedAreaFilter(e.target.value)}
                  className="h-8 rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Areas</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
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
                  placeholder="Search RM name, code, phone..."
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
                  <th scope="col" className="w-14 px-4 py-3 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    RM Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    RM Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Phone
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Assigned Area
                  </th>
                  <th scope="col" className="w-40 px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRMs.length > 0 ? (
                  filteredRMs.map((rm, index) => (
                    <tr
                      key={rm.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Serial */}
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>

                      {/* RM Code */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                          <UserRound className="size-3 text-primary" />
                          {rm.code}
                        </span>
                      </td>

                      {/* RM Name */}
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link
                          href={`/rms/${rm.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {rm.name}
                        </Link>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="size-3 text-muted-foreground" />
                          <span>{rm.phone}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="size-3 text-muted-foreground" />
                          <span>{rm.email}</span>
                        </div>
                      </td>

                      {/* Assigned Area */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                          <MapPin className="size-3 text-muted-foreground" />
                          {rm.areaName}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Edit */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleOpenEdit(rm)}
                            aria-label={`Edit ${rm.name}`}
                            className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary"
                          >
                            <Pencil className="size-3.5" />
                          </Button>

                          {/* Delete */}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => setDeletingRM(rm)}
                            aria-label={`Delete ${rm.name}`}
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
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-xs text-muted-foreground"
                    >
                      No regional managers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Create / Edit RM Modal Dialog                             */}
      {/* ========================================================= */}
      {(isCreateOpen || editingRM) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="rm-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              setIsCreateOpen(false)
              setEditingRM(null)
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 id="rm-modal-title" className="text-base font-semibold text-foreground">
                {editingRM ? "Edit Regional Manager" : "Add Regional Manager"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingRM(null)
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

              {/* RM Code */}
              <div className="space-y-1.5">
                <Label htmlFor="rmCode" className="text-xs font-medium text-foreground">
                  RM Code
                </Label>
                <Input
                  id="rmCode"
                  name="rmCode"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                  }}
                  placeholder="e.g. RM-001"
                  className={`text-xs font-mono uppercase ${formErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.code && (
                  <p className="text-[11px] text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* RM Name */}
              <div className="space-y-1.5">
                <Label htmlFor="rmName" className="text-xs font-medium text-foreground">
                  RM Name
                </Label>
                <Input
                  id="rmName"
                  name="rmName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Md. Rahim"
                  className={`text-xs ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="rmPhone" className="text-xs font-medium text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="rmPhone"
                  name="rmPhone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }))
                  }}
                  placeholder="e.g. 01712-111222"
                  className={`text-xs font-mono ${formErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-destructive">{formErrors.phone}</p>
                )}
              </div>

              {/* Login PIN (6-Digit) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rmPin" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-primary" />
                    <span>6-Digit Login PIN</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Default: 123456</span>
                </div>
                <div className="relative">
                  <Input
                    id="rmPin"
                    name="rmPin"
                    type={showPinModal ? "text" : "password"}
                    maxLength={6}
                    value={formData.pin}
                    onChange={(e) => {
                      const numeric = e.target.value.replace(/\D/g, "").slice(0, 6)
                      setFormData((prev) => ({ ...prev, pin: numeric }))
                      if (formErrors.pin) setFormErrors((prev) => ({ ...prev, pin: undefined }))
                    }}
                    placeholder="e.g. 123456"
                    className={`text-xs font-mono tracking-wider pr-9 ${formErrors.pin ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setShowPinModal(!showPinModal)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label={showPinModal ? "Hide PIN" : "Show PIN"}
                  >
                    {showPinModal ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </Button>
                </div>
                {formErrors.pin ? (
                  <p className="text-[11px] text-destructive">{formErrors.pin}</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    Regional Manager will use this 6-digit PIN and Phone Number to log into the field portal.
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="rmEmail" className="text-xs font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="rmEmail"
                  name="rmEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="e.g. rahim@eakinhealth.com"
                  className={`text-xs ${formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Assigned Area */}
              <div className="space-y-1.5">
                <Label htmlFor="rmArea" className="text-xs font-medium text-foreground">
                  Assigned Area
                </Label>
                <select
                  id="rmArea"
                  value={formData.areaId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, areaId: e.target.value }))
                    if (formErrors.areaId) setFormErrors((prev) => ({ ...prev, areaId: undefined }))
                  }}
                  className={`h-8 w-full rounded border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring ${formErrors.areaId ? "border-destructive focus:ring-destructive" : "border-input"}`}
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.code})
                    </option>
                  ))}
                </select>
                {formErrors.areaId && (
                  <p className="text-[11px] text-destructive">{formErrors.areaId}</p>
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
                    setEditingRM(null)
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
                  {editingRM ? "Save Changes" : "Save RM"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Modal Dialog                          */}
      {/* ========================================================= */}
      {deletingRM && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-rm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setDeletingRM(null)}
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
                  id="delete-rm-title"
                  className="text-sm font-semibold text-foreground"
                >
                  Confirm Delete
                </h3>
                <p className="text-xs text-muted-foreground">
                  Are you sure you want to delete this Regional Manager?
                </p>
                <div className="mt-2 rounded border border-border/80 bg-muted/40 p-2 text-xs">
                  <span className="font-mono font-semibold text-primary">
                    {deletingRM.code}
                  </span>{" "}
                  - <span className="font-medium text-foreground">{deletingRM.name}</span> (
                  {deletingRM.areaName})
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingRM(null)}
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
