"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  UsersRound,
  UserRound,
  Building,
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
  type AMItem,
  type RMItem,
  type AreaItem,
} from "@/lib/mock-data"

export default function AreaManagersPage() {
  const {
    currentRole,
    currentRM,
    ams,
    rms,
    areas,
    addAM,
    updateAM,
    deleteAM,
  } = useAppState()

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAreaFilter, setSelectedAreaFilter] = React.useState("all")
  const [selectedRMFilter, setSelectedRMFilter] = React.useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingAM, setEditingAM] = React.useState<AMItem | null>(null)
  const [deletingAM, setDeletingAM] = React.useState<AMItem | null>(null)
  const [showPinModal, setShowPinModal] = React.useState(false)

  // Form input state
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    phone: "",
    pin: "123456",
    email: "",
    areaId: areas[0]?.id || "1",
    rmId: rms[0]?.id || "rm-1",
  })
  const [formError, setFormError] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  // Base AMs depending on role (RM sees only their assigned AMs)
  const roleBaseAMs = React.useMemo(() => {
    if (currentRole === "rm" && currentRM) {
      return ams.filter((a) => a.rmId === currentRM.id || a.areaId === currentRM.areaId)
    }
    return ams
  }, [ams, currentRole, currentRM])

  // Dependent RMs for the selected Area in the Filter bar (via Regional Office)
  const availableRMsForFilter = React.useMemo(() => {
    if (selectedAreaFilter === "all") return rms
    const area = areas.find((a) => a.id === selectedAreaFilter)
    if (!area) return rms
    const matched = rms.filter((r) => r.regionalOfficeId === area.regionalOfficeId)
    return matched.length > 0 ? matched : rms
  }, [rms, areas, selectedAreaFilter])

  // Reset or adjust RM filter if area filter changes
  React.useEffect(() => {
    if (selectedAreaFilter !== "all" && selectedRMFilter !== "all") {
      const isStillValid = availableRMsForFilter.some((r) => r.id === selectedRMFilter)
      if (!isStillValid) {
        setSelectedRMFilter("all")
      }
    }
  }, [selectedAreaFilter, availableRMsForFilter, selectedRMFilter])

  // Filtered AMs
  const filteredAMs = React.useMemo(() => {
    return roleBaseAMs.filter((am) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        am.name.toLowerCase().includes(q) ||
        am.code.toLowerCase().includes(q) ||
        am.phone.toLowerCase().includes(q) ||
        am.email.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (currentRole === "admin") {
        if (selectedAreaFilter !== "all" && am.areaId !== selectedAreaFilter) return false
        if (selectedRMFilter !== "all" && am.rmId !== selectedRMFilter) return false
      }

      return true
    })
  }, [roleBaseAMs, searchQuery, currentRole, selectedAreaFilter, selectedRMFilter])

  // Target Area for the form
  const targetFormArea = React.useMemo(() => {
    return areas.find((a) => a.id === formData.areaId) || areas[0]
  }, [areas, formData.areaId])

  // Automatically matched RM for the form based on targetFormArea's Regional Office
  const autoAssignedRM = React.useMemo(() => {
    if (!targetFormArea) return rms[0] || null
    return rms.find((r) => r.regionalOfficeId === targetFormArea.regionalOfficeId) || rms[0] || null
  }, [rms, targetFormArea])

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
    const nextCodeNumber = ams.length + 1
    const defaultArea = areas[0]?.id || "area-1"
    const targetArea = areas.find((a) => a.id === defaultArea)
    const matchedRM = rms.find((r) => r.regionalOfficeId === targetArea?.regionalOfficeId) || rms[0]

    setFormData({
      code: `AM-${String(nextCodeNumber).padStart(3, "0")}`,
      name: "",
      phone: "",
      pin: "123456",
      email: "",
      areaId: defaultArea,
      rmId: matchedRM?.id || "rm-1",
    })
    setShowPinModal(false)
    setFormError("")
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (am: AMItem) => {
    setEditingAM(am)
    const targetArea = areas.find((a) => a.id === am.areaId)
    const matchedRM = rms.find((r) => r.regionalOfficeId === targetArea?.regionalOfficeId) || rms.find((r) => r.id === am.rmId) || rms[0]

    setFormData({
      code: am.code,
      name: am.name,
      phone: am.phone,
      pin: am.pin || "123456",
      email: am.email || "",
      areaId: am.areaId,
      rmId: matchedRM?.id || am.rmId,
    })
    setShowPinModal(false)
    setFormError("")
    setFormErrors({})
  }

  // Handle Area Change in Form (updates RM automatically according to Regional Office)
  const handleFormAreaChange = (newAreaId: string) => {
    const targetArea = areas.find((a) => a.id === newAreaId)
    const matchedRM = rms.find((r) => r.regionalOfficeId === targetArea?.regionalOfficeId) || rms[0]
    setFormData((prev) => ({
      ...prev,
      areaId: newAreaId,
      rmId: matchedRM?.id || "rm-1",
    }))
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
    const assignedRM = rms.find((r) => r.regionalOfficeId === assignedArea?.regionalOfficeId) || rms.find((r) => r.id === formData.rmId) || rms[0]

    const areaName = assignedArea ? assignedArea.name : "Unassigned"
    const rmId = assignedRM ? assignedRM.id : ""
    const rmName = assignedRM ? assignedRM.name : "Unassigned"

    if (editingAM) {
      updateAM(editingAM.id, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pin: formData.pin.trim(),
        email: formData.email.trim(),
        areaId: formData.areaId,
        areaName,
        rmId: formData.rmId,
        rmName,
      })
      setEditingAM(null)
      showToast("Area Manager updated successfully.")
    } else {
      addAM({
        code: formData.code.trim().toUpperCase() || `AM-${String(ams.length + 1).padStart(3, "0")}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pin: formData.pin.trim() || "123456",
        email: formData.email.trim(),
        areaId: formData.areaId,
        areaName,
        rmId: formData.rmId,
        rmName,
      })
      setIsCreateOpen(false)
      showToast("New Area Manager added successfully with 6-digit login PIN.")
    }
    setFormErrors({})
    setFormError("")
  }

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingAM) return
    deleteAM(deletingAM.id)
    setDeletingAM(null)
    showToast("Area Manager deleted successfully.")
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
            Area Managers
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage area managers and their assigned areas and regional managers.
          </p>
        </div>

        {/* Add AM Button (Admin Only) */}
        {currentRole === "admin" && (
          <Button
            type="button"
            onClick={handleOpenCreate}
            size="sm"
            className="cursor-pointer gap-1.5 font-medium shadow-xs"
          >
            <Plus className="size-4" />
            <span>Add AM</span>
          </Button>
        )}
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Area Managers ({filteredAMs.length})
            </CardTitle>

            {/* Filter and Search Controls */}
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">

              {/* 2. RM Filter (Admin Only) */}
              {currentRole === "admin" && (
                <div className="flex items-center gap-1.5">
                  <UserRound className="size-3.5 text-muted-foreground" />
                  <select
                    aria-label="Filter by RM"
                    value={selectedRMFilter}
                    onChange={(e) => setSelectedRMFilter(e.target.value)}
                    className="h-8 rounded border border-input bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring cursor-pointer"
                  >
                    <option value="all">All Regional Managers</option>
                    {availableRMsForFilter.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search AM name, code, phone..."
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
                    AM Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    AM Name
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
                  <th scope="col" className="px-4 py-3">
                    Regional Manager (RM)
                  </th>
                  <th scope="col" className="w-40 px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAMs.length > 0 ? (
                  filteredAMs.map((am, index) => (
                    <tr
                      key={am.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Serial */}
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>

                      {/* AM Code */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                          <UsersRound className="size-3 text-primary" />
                          {am.code}
                        </span>
                      </td>

                      {/* AM Name */}
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link
                          href={`/ams/${am.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {am.name}
                        </Link>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="size-3 text-muted-foreground" />
                          <span>{am.phone}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="size-3 text-muted-foreground" />
                          <span>{am.email}</span>
                        </div>
                      </td>

                      {/* Assigned Area */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                          <MapPin className="size-3 text-muted-foreground" />
                          {am.areaName}
                        </span>
                      </td>

                      {/* Regional Manager */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1 text-[11px]">
                          <UserRound className="size-3 text-muted-foreground" />
                          <span className="font-medium text-foreground">{am.rmName}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {currentRole === "admin" ? (
                            <>
                              {/* Edit */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => handleOpenEdit(am)}
                                aria-label={`Edit ${am.name}`}
                                className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil className="size-3.5" />
                              </Button>

                              {/* Delete */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setDeletingAM(am)}
                                aria-label={`Delete ${am.name}`}
                                className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Link href={`/ams/${am.id}`}>
                              <Button
                                type="button"
                                variant="outline"
                                size="xs"
                                className="cursor-pointer gap-1 text-[11px] font-medium"
                              >
                                <Eye className="size-3 text-muted-foreground" />
                                <span>View</span>
                              </Button>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-xs text-muted-foreground"
                    >
                      No area managers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Create / Edit AM Modal Dialog                             */}
      {/* ========================================================= */}
      {(isCreateOpen || editingAM) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="am-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              setIsCreateOpen(false)
              setEditingAM(null)
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 id="am-modal-title" className="text-base font-semibold text-foreground">
                {editingAM ? "Edit Area Manager" : "Add Area Manager"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingAM(null)
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

              {/* AM Code */}
              <div className="space-y-1.5">
                <Label htmlFor="amCode" className="text-xs font-medium text-foreground">
                  AM Code
                </Label>
                <Input
                  id="amCode"
                  name="amCode"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                  }}
                  placeholder="e.g. AM-001"
                  className={`text-xs font-mono uppercase ${formErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.code && (
                  <p className="text-[11px] text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* AM Name */}
              <div className="space-y-1.5">
                <Label htmlFor="amName" className="text-xs font-medium text-foreground">
                  AM Name
                </Label>
                <Input
                  id="amName"
                  name="amName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Md. Karim"
                  className={`text-xs ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="amPhone" className="text-xs font-medium text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="amPhone"
                  name="amPhone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }))
                  }}
                  placeholder="e.g. 01722-100200"
                  className={`text-xs font-mono ${formErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-destructive">{formErrors.phone}</p>
                )}
              </div>

              {/* Login PIN (6-Digit) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="amPin" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-primary" />
                    <span>6-Digit Login PIN</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Default: 123456</span>
                </div>
                <div className="relative">
                  <Input
                    id="amPin"
                    name="amPin"
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
                    Area Manager will use this 6-digit PIN and Phone Number to log into the field portal.
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="amEmail" className="text-xs font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="amEmail"
                  name="amEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="e.g. karim@eakinhealth.com"
                  className={`text-xs ${formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Assigned Area (triggers dependent RM update) */}
              <div className="space-y-1.5">
                <Label htmlFor="amArea" className="text-xs font-medium text-foreground">
                  Assigned Area
                </Label>
                <select
                  id="amArea"
                  value={formData.areaId}
                  onChange={(e) => {
                    handleFormAreaChange(e.target.value)
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

              {/* Auto-connected Regional Manager (RM) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-foreground">
                  Connected Regional Manager (RM)
                </Label>
                <div className="flex items-center justify-between rounded border border-input bg-muted/30 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2">
                    <UserRound className="size-3.5 text-primary shrink-0" />
                    <span className="font-semibold text-foreground">
                      {autoAssignedRM ? autoAssignedRM.name : "No RM Assigned"}
                    </span>
                    {autoAssignedRM && (
                      <span className="font-mono text-[11px] text-primary">
                        ({autoAssignedRM.code})
                      </span>
                    )}
                  </div>
                  {targetFormArea?.regionalOfficeName && (
                    <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      <Building className="size-3 text-primary" />
                      <span>{targetFormArea.regionalOfficeName}</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Automatically linked from the selected area&apos;s Regional Office.
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
                    setEditingAM(null)
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
                  {editingAM ? "Save Changes" : "Save AM"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Modal Dialog                          */}
      {/* ========================================================= */}
      {deletingAM && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-am-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setDeletingAM(null)}
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
                  id="delete-am-title"
                  className="text-sm font-semibold text-foreground"
                >
                  Confirm Delete
                </h3>
                <p className="text-xs text-muted-foreground">
                  Are you sure you want to delete this Area Manager?
                </p>
                <div className="mt-2 rounded border border-border/80 bg-muted/40 p-2 text-xs">
                  <span className="font-mono font-semibold text-primary">
                    {deletingAM.code}
                  </span>{" "}
                  - <span className="font-medium text-foreground">{deletingAM.name}</span> (
                  {deletingAM.areaName})
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingAM(null)}
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
