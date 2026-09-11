"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  UserCheck,
  UserRound,
  UsersRound,
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
  Warehouse,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import {
  type SalesOfficerItem,
  type AMItem,
  type RMItem,
  type AreaItem,
} from "@/lib/mock-data"

export default function SalesOfficersPage() {
  const {
    currentRole,
    currentRM,
    currentAM,
    officers,
    ams,
    rms,
    areas,
    addOfficer,
    updateOfficer,
    deleteOfficer,
  } = useAppState()

  // Filter States: Area Wise, RM Wise, AM Wise + Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAreaFilter, setSelectedAreaFilter] = React.useState("all")
  const [selectedRMFilter, setSelectedRMFilter] = React.useState("all")
  const [selectedAMFilter, setSelectedAMFilter] = React.useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingOfficer, setEditingOfficer] = React.useState<SalesOfficerItem | null>(null)
  const [deletingOfficer, setDeletingOfficer] = React.useState<SalesOfficerItem | null>(null)
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
    amId: ams[0]?.id || "am-1",
  })
  const [formError, setFormError] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  // Base Officers depending on role
  const roleBaseOfficers = React.useMemo(() => {
    if (currentRole === "rm" && currentRM) {
      return officers.filter((o) => o.rmId === currentRM.id || o.areaId === currentRM.areaId)
    }
    if (currentRole === "am" && currentAM) {
      return officers.filter((o) => o.amId === currentAM.id || o.areaId === currentAM.areaId)
    }
    return officers
  }, [officers, currentRole, currentRM, currentAM])

  // Dependent RMs for the Filter Bar (via Regional Office)
  const availableRMsForFilter = React.useMemo(() => {
    if (selectedAreaFilter === "all") return rms
    const selectedArea = areas.find((a) => a.id === selectedAreaFilter)
    if (!selectedArea) return rms
    const matched = rms.filter(
      (r) => r.regionalOfficeId === selectedArea.regionalOfficeId || r.areaId === selectedArea.id
    )
    return matched.length > 0 ? matched : rms
  }, [rms, areas, selectedAreaFilter])

  // Dependent AMs for the Filter Bar
  const availableAMsForFilter = React.useMemo(() => {
    if (currentRole === "rm" && currentRM) {
      return ams.filter((a) => a.rmId === currentRM.id || a.areaId === currentRM.areaId)
    }
    const selectedArea = areas.find((a) => a.id === selectedAreaFilter)
    return ams.filter((a) => {
      const amArea = areas.find((ar) => ar.id === a.areaId)
      const matchArea =
        selectedAreaFilter === "all" ||
        a.areaId === selectedAreaFilter ||
        (selectedArea && amArea && amArea.regionalOfficeId === selectedArea.regionalOfficeId)
      const matchRM = selectedRMFilter === "all" || a.rmId === selectedRMFilter
      return matchArea && matchRM
    })
  }, [ams, areas, currentRole, currentRM, selectedAreaFilter, selectedRMFilter])

  // Reset filter selections if parent filter changes
  React.useEffect(() => {
    if (selectedRMFilter !== "all") {
      const validRM = availableRMsForFilter.some((r) => r.id === selectedRMFilter)
      if (!validRM) setSelectedRMFilter("all")
    }
  }, [selectedAreaFilter, availableRMsForFilter, selectedRMFilter])

  React.useEffect(() => {
    if (selectedAMFilter !== "all") {
      const validAM = availableAMsForFilter.some((a) => a.id === selectedAMFilter)
      if (!validAM) setSelectedAMFilter("all")
    }
  }, [selectedAreaFilter, selectedRMFilter, availableAMsForFilter, selectedAMFilter])

  // Filtered Officers
  const filteredOfficers = React.useMemo(() => {
    return roleBaseOfficers.filter((off) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        off.name.toLowerCase().includes(q) ||
        off.code.toLowerCase().includes(q) ||
        off.phone.toLowerCase().includes(q) ||
        off.email.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (currentRole === "admin") {
        if (selectedAreaFilter !== "all" && off.areaId !== selectedAreaFilter) return false
        if (selectedRMFilter !== "all" && off.rmId !== selectedRMFilter) return false
        if (selectedAMFilter !== "all" && off.amId !== selectedAMFilter) return false
      } else if (currentRole === "rm") {
        if (selectedAMFilter !== "all" && off.amId !== selectedAMFilter) return false
      }

      return true
    })
  }, [roleBaseOfficers, searchQuery, currentRole, selectedAreaFilter, selectedRMFilter, selectedAMFilter])

  // Target AM for the form
  const targetFormAM = React.useMemo(() => {
    return ams.find((a) => a.id === formData.amId) || ams[0] || null
  }, [ams, formData.amId])

  // Automatically matched Area for the form based on targetFormAM's Area
  const targetFormArea = React.useMemo(() => {
    if (!targetFormAM) return null
    return areas.find((a) => a.id === targetFormAM.areaId) || null
  }, [areas, targetFormAM])

  // Automatically matched RM for the form based on targetFormAM's RM
  const targetFormRM = React.useMemo(() => {
    if (!targetFormAM) return null
    return (
      rms.find((r) => r.id === targetFormAM.rmId) ||
      rms.find((r) => r.regionalOfficeId === targetFormArea?.regionalOfficeId) ||
      null
    )
  }, [rms, targetFormAM, targetFormArea])

  const [formErrors, setFormErrors] = React.useState<{
    code?: string
    name?: string
    phone?: string
    pin?: string
    email?: string
    amId?: string
  }>({})

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextCodeNumber = officers.length + 1
    const defaultAM = ams[0]
    const matchedArea = areas.find((a) => a.id === defaultAM?.areaId)
    const matchedRM =
      rms.find((r) => r.id === defaultAM?.rmId) ||
      rms.find((r) => r.regionalOfficeId === matchedArea?.regionalOfficeId) ||
      rms[0]

    setFormData({
      code: `OFF-${String(nextCodeNumber).padStart(3, "0")}`,
      name: "",
      phone: "",
      pin: "123456",
      email: "",
      amId: defaultAM?.id || "am-1",
      areaId: defaultAM?.areaId || "area-1",
      rmId: matchedRM?.id || "rm-1",
    })
    setShowPinModal(false)
    setFormError("")
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (off: SalesOfficerItem) => {
    setEditingOfficer(off)
    const matchedAM = ams.find((a) => a.id === off.amId) || ams[0]
    setFormData({
      code: off.code,
      name: off.name,
      phone: off.phone,
      pin: off.pin || "123456",
      email: off.email || "",
      amId: off.amId || matchedAM?.id || "am-1",
      areaId: off.areaId,
      rmId: off.rmId,
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
      amId?: string
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
    if (!formData.amId) {
      errors.amId = "This field is required."
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

    const assignedAM = ams.find((a) => a.id === formData.amId) || ams[0]
    const assignedArea = areas.find((a) => a.id === assignedAM?.areaId)
    const assignedRM =
      rms.find((r) => r.id === assignedAM?.rmId) ||
      rms.find((r) => r.regionalOfficeId === assignedArea?.regionalOfficeId) ||
      rms[0]

    const areaId = assignedArea?.id || assignedAM?.areaId || ""
    const areaName = assignedArea?.name || assignedAM?.areaName || "Unassigned"
    const rmId = assignedRM?.id || assignedAM?.rmId || ""
    const rmName = assignedRM?.name || assignedAM?.rmName || "Unassigned"
    const amId = assignedAM?.id || ""
    const amName = assignedAM?.name || "Unassigned"

    if (editingOfficer) {
      updateOfficer(editingOfficer.id, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pin: formData.pin.trim(),
        email: formData.email.trim(),
        areaId,
        areaName,
        rmId,
        rmName,
        amId,
        amName,
      })
      setEditingOfficer(null)
      showToast("MPO updated successfully.")
    } else {
      addOfficer({
        code: formData.code.trim().toUpperCase() || `MPO-${String(officers.length + 1).padStart(3, "0")}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        pin: formData.pin.trim() || "123456",
        email: formData.email.trim(),
        areaId,
        areaName,
        rmId,
        rmName,
        amId,
        amName,
      })
      setIsCreateOpen(false)
      showToast("New MPO added successfully with 6-digit login PIN.")
    }
    setFormErrors({})
    setFormError("")
  }

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingOfficer) return
    deleteOfficer(deletingOfficer.id)
    setDeletingOfficer(null)
    showToast("MPO deleted successfully.")
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
            MPOs
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage MPOs and their assigned areas, regional managers and area managers.
          </p>
        </div>

        {/* Add MPO Button (Admin Only) */}
        {currentRole === "admin" && (
          <Button
            type="button"
            onClick={handleOpenCreate}
            size="sm"
            className="cursor-pointer gap-1.5 font-medium shadow-xs"
          >
            <Plus className="size-4" />
            <span>Add MPO</span>
          </Button>
        )}
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                MPOs ({filteredOfficers.length})
              </CardTitle>
            </div>

            {/* Hierarchical Filters + Search */}
            <div
              className={`grid grid-cols-1 gap-2.5 ${
                currentRole === "rm"
                  ? "sm:grid-cols-2"
                  : currentRole === "am"
                  ? "sm:grid-cols-1"
                  : "sm:grid-cols-2 lg:grid-cols-2"
              }`}
            >
              {/* 1. Area Wise Filter (Admin Only) */}
              {currentRole === "admin" && (
                <div className="flex items-center gap-1.5 rounded border border-border/80 bg-muted/20 px-2 py-1">
                  <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                  <select
                    aria-label="Area Wise Filter"
                    value={selectedAreaFilter}
                    onChange={(e) => setSelectedAreaFilter(e.target.value)}
                    className="h-7 w-full bg-transparent text-xs text-foreground outline-none cursor-pointer"
                  >
                    <option value="all">All Areas</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}


              {/* 4. Search Bar */}
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search officer, code, phone..."
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
                  <th scope="col" className="w-14 px-4 py-3 text-center">
                    SL
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Officer Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Officer Name
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
                    RM
                  </th>
                  <th scope="col" className="px-4 py-3">
                    AM
                  </th>
                  <th scope="col" className="w-40 px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredOfficers.length > 0 ? (
                  filteredOfficers.map((off, index) => (
                    <tr
                      key={off.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Serial */}
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                          <UserCheck className="size-3 text-primary" />
                          {off.code}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link
                          href={`/officers/${off.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {off.name}
                        </Link>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="size-3 text-muted-foreground" />
                          <span>{off.phone}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="size-3 text-muted-foreground" />
                          <span>{off.email}</span>
                        </div>
                      </td>

                      {/* Assigned Area */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground">
                          <MapPin className="size-3 text-muted-foreground" />
                          {off.areaName}
                        </span>
                      </td>

                      {/* RM */}
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {off.rmName}
                      </td>

                      {/* AM */}
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        {off.amName}
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
                                onClick={() => handleOpenEdit(off)}
                                aria-label={`Edit ${off.name}`}
                                className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil className="size-3.5" />
                              </Button>

                              {/* Delete */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setDeletingOfficer(off)}
                                aria-label={`Delete ${off.name}`}
                                className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Link href={`/officers/${off.id}`}>
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
                      colSpan={9}
                      className="px-4 py-8 text-center text-xs text-muted-foreground"
                    >
                      No MPOs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Create / Edit Officer Modal Dialog                        */}
      {/* ========================================================= */}
      {(isCreateOpen || editingOfficer) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="officer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              setIsCreateOpen(false)
              setEditingOfficer(null)
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md rounded-md border border-border bg-card p-6 shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 id="officer-modal-title" className="text-base font-semibold text-foreground">
                {editingOfficer ? "Edit MPO" : "Add MPO"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingOfficer(null)
                }}
                aria-label="Cancel"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} noValidate className="mt-4 flex-1 overflow-y-auto space-y-3.5 pr-1">
              {formError && (
                <div className="rounded border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
                  {formError}
                </div>
              )}

              {/* Officer Code */}
              <div className="space-y-1.5">
                <Label htmlFor="officerCode" className="text-xs font-medium text-foreground">
                  Officer Code
                </Label>
                <Input
                  id="officerCode"
                  name="officerCode"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                  }}
                  placeholder="e.g. OFF-001"
                  className={`text-xs font-mono uppercase ${formErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.code && (
                  <p className="text-[11px] text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* Officer Name */}
              <div className="space-y-1.5">
                <Label htmlFor="officerName" className="text-xs font-medium text-foreground">
                  Officer Name
                </Label>
                <Input
                  id="officerName"
                  name="officerName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Arafat Hossain"
                  className={`text-xs ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="officerPhone" className="text-xs font-medium text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="officerPhone"
                  name="officerPhone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }))
                  }}
                  placeholder="e.g. 01711-000111"
                  className={`text-xs font-mono ${formErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-destructive">{formErrors.phone}</p>
                )}
              </div>

              {/* Login PIN (6-Digit) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="officerPin" className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <KeyRound className="size-3.5 text-primary" />
                    <span>6-Digit Login PIN</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Default: 123456</span>
                </div>
                <div className="relative">
                  <Input
                    id="officerPin"
                    name="officerPin"
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
                    Officer will use this 6-digit PIN and Phone Number to log into the field portal.
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="officerEmail" className="text-xs font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="officerEmail"
                  name="officerEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="e.g. arafat@eakinhealth.com"
                  className={`text-xs ${formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Assigned Area Manager (AM) */}
              <div className="space-y-1.5">
                <Label htmlFor="officerAM" className="text-xs font-medium text-foreground">
                  Assigned Area Manager (AM)
                </Label>
                <select
                  id="officerAM"
                  value={formData.amId}
                  onChange={(e) => {
                    const newAmId = e.target.value
                    const matchedAM = ams.find((a) => a.id === newAmId)
                    const matchedArea = areas.find((a) => a.id === matchedAM?.areaId)
                    const matchedRM =
                      rms.find((r) => r.id === matchedAM?.rmId) ||
                      rms.find((r) => r.regionalOfficeId === matchedArea?.regionalOfficeId) ||
                      rms[0]
                    setFormData((prev) => ({
                      ...prev,
                      amId: newAmId,
                      areaId: matchedAM?.areaId || prev.areaId,
                      rmId: matchedRM?.id || prev.rmId,
                    }))
                    if (formErrors.amId) setFormErrors((prev) => ({ ...prev, amId: undefined }))
                  }}
                  className={`h-8 w-full rounded border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring ${formErrors.amId ? "border-destructive focus:ring-destructive" : "border-input"}`}
                >
                  {ams.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.code}) — Area: {a.areaName}
                    </option>
                  ))}
                </select>
                {formErrors.amId && (
                  <p className="text-[11px] text-destructive">{formErrors.amId}</p>
                )}
              </div>

              {/* Auto-connected Hierarchy Card */}
              <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3">
                <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Auto-Connected Territory & Management
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Area */}
                  <div className="flex items-center gap-2 rounded border border-input/60 bg-background/80 px-2.5 py-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Assigned Area</p>
                      <p className="font-medium text-foreground truncate">
                        {targetFormArea ? `${targetFormArea.name} (${targetFormArea.code})` : (targetFormAM?.areaName || "Unassigned")}
                      </p>
                    </div>
                  </div>

                  {/* RM */}
                  <div className="flex items-center gap-2 rounded border border-input/60 bg-background/80 px-2.5 py-1.5">
                    <UserRound className="size-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Regional Manager (RM)</p>
                      <p className="font-medium text-foreground truncate">
                        {targetFormRM ? `${targetFormRM.name} (${targetFormRM.code})` : (targetFormAM?.rmName || "Unassigned")}
                      </p>
                    </div>
                  </div>

                  {/* Depot */}
                  <div className="flex items-center gap-2 rounded border border-input/60 bg-background/80 px-2.5 py-1.5 sm:col-span-2">
                    <Warehouse className="size-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Assigned Depot</p>
                      <p className="font-medium text-foreground truncate">
                        {targetFormArea?.depotName || "Bogura Central Depot"}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10.5px] text-muted-foreground">
                  Area, RM, and Depot are automatically resolved from the selected Area Manager (AM).
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
                    setEditingOfficer(null)
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
                  {editingOfficer ? "Save Changes" : "Save Officer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Modal Dialog                          */}
      {/* ========================================================= */}
      {deletingOfficer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-officer-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setDeletingOfficer(null)}
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
                  id="delete-officer-title"
                  className="text-sm font-semibold text-foreground"
                >
                  Confirm Delete
                </h3>
                <p className="text-xs text-muted-foreground">
                  Are you sure you want to delete this MPO?
                </p>
                <div className="mt-2 rounded border border-border/80 bg-muted/40 p-2 text-xs">
                  <span className="font-mono font-semibold text-primary">
                    {deletingOfficer.code}
                  </span>{" "}
                  - <span className="font-medium text-foreground">{deletingOfficer.name}</span> (
                  {deletingOfficer.areaName})
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingOfficer(null)}
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
