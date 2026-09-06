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
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  initialOfficers,
  initialAMs,
  initialRMs,
  initialAreasWithDepot,
  type SalesOfficerItem,
  type AMItem,
  type RMItem,
  type AreaItem,
} from "@/lib/mock-data"

export default function SalesOfficersPage() {
  const [officers, setOfficers] = React.useState<SalesOfficerItem[]>(initialOfficers)
  const [ams] = React.useState<AMItem[]>(initialAMs)
  const [rms] = React.useState<RMItem[]>(initialRMs)
  const [areas] = React.useState<AreaItem[]>(initialAreasWithDepot)

  // Filter States: Area Wise, RM Wise, AM Wise + Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAreaFilter, setSelectedAreaFilter] = React.useState("all")
  const [selectedRMFilter, setSelectedRMFilter] = React.useState("all")
  const [selectedAMFilter, setSelectedAMFilter] = React.useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingOfficer, setEditingOfficer] = React.useState<SalesOfficerItem | null>(null)
  const [deletingOfficer, setDeletingOfficer] = React.useState<SalesOfficerItem | null>(null)

  // Form input state
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    phone: "",
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

  // Dependent RMs for the Filter Bar
  const availableRMsForFilter = React.useMemo(() => {
    if (selectedAreaFilter === "all") return rms
    return rms.filter((r) => r.areaId === selectedAreaFilter)
  }, [rms, selectedAreaFilter])

  // Dependent AMs for the Filter Bar
  const availableAMsForFilter = React.useMemo(() => {
    return ams.filter((a) => {
      const matchArea = selectedAreaFilter === "all" || a.areaId === selectedAreaFilter
      const matchRM = selectedRMFilter === "all" || a.rmId === selectedRMFilter
      return matchArea && matchRM
    })
  }, [ams, selectedAreaFilter, selectedRMFilter])

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
    return officers.filter((off) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        off.name.toLowerCase().includes(q) ||
        off.code.toLowerCase().includes(q) ||
        off.phone.toLowerCase().includes(q) ||
        off.email.toLowerCase().includes(q)

      const matchesArea =
        selectedAreaFilter === "all" || off.areaId === selectedAreaFilter

      const matchesRM =
        selectedRMFilter === "all" || off.rmId === selectedRMFilter

      const matchesAM =
        selectedAMFilter === "all" || off.amId === selectedAMFilter

      return matchesSearch && matchesArea && matchesRM && matchesAM
    })
  }, [officers, searchQuery, selectedAreaFilter, selectedRMFilter, selectedAMFilter])

  // Dependent RMs for the Form based on formData.areaId
  const availableRMsForForm = React.useMemo(() => {
    const matched = rms.filter((r) => r.areaId === formData.areaId)
    return matched.length > 0 ? matched : rms
  }, [rms, formData.areaId])

  // Dependent AMs for the Form based on formData.areaId and formData.rmId
  const availableAMsForForm = React.useMemo(() => {
    const matched = ams.filter(
      (a) => a.areaId === formData.areaId && a.rmId === formData.rmId
    )
    if (matched.length > 0) return matched
    const areaMatched = ams.filter((a) => a.areaId === formData.areaId)
    return areaMatched.length > 0 ? areaMatched : ams
  }, [ams, formData.areaId, formData.rmId])

  // Handle Area Change in Form (cascades to RM and AM)
  const handleFormAreaChange = (newAreaId: string) => {
    const matchedRMs = rms.filter((r) => r.areaId === newAreaId)
    const newRMId = matchedRMs[0]?.id || rms[0]?.id || "rm-1"

    const matchedAMs = ams.filter((a) => a.areaId === newAreaId && a.rmId === newRMId)
    const newAMId = matchedAMs[0]?.id || ams[0]?.id || "am-1"

    setFormData((prev) => ({
      ...prev,
      areaId: newAreaId,
      rmId: newRMId,
      amId: newAMId,
    }))
  }

  // Handle RM Change in Form (cascades to AM)
  const handleFormRMChange = (newRMId: string) => {
    const matchedAMs = ams.filter(
      (a) => a.areaId === formData.areaId && a.rmId === newRMId
    )
    const newAMId = matchedAMs[0]?.id || ams[0]?.id || "am-1"

    setFormData((prev) => ({
      ...prev,
      rmId: newRMId,
      amId: newAMId,
    }))
  }

  const [formErrors, setFormErrors] = React.useState<{
    code?: string
    name?: string
    phone?: string
    email?: string
    areaId?: string
    rmId?: string
    amId?: string
  }>({})

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextCodeNumber = officers.length + 1
    const defaultArea = areas[0]?.id || "1"
    const matchedRMs = rms.filter((r) => r.areaId === defaultArea)
    const defaultRM = matchedRMs[0]?.id || rms[0]?.id || "rm-1"
    const matchedAMs = ams.filter((a) => a.areaId === defaultArea && a.rmId === defaultRM)
    const defaultAM = matchedAMs[0]?.id || ams[0]?.id || "am-1"

    setFormData({
      code: `OFF-${String(nextCodeNumber).padStart(3, "0")}`,
      name: "",
      phone: "",
      email: "",
      areaId: defaultArea,
      rmId: defaultRM,
      amId: defaultAM,
    })
    setFormError("")
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (off: SalesOfficerItem) => {
    setEditingOfficer(off)
    setFormData({
      code: off.code,
      name: off.name,
      phone: off.phone,
      email: off.email || "",
      areaId: off.areaId,
      rmId: off.rmId,
      amId: off.amId,
    })
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
      email?: string
      areaId?: string
      rmId?: string
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
    if (!formData.areaId) {
      errors.areaId = "This field is required."
    }
    if (!formData.rmId) {
      errors.rmId = "This field is required."
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

    const assignedArea = areas.find((a) => a.id === formData.areaId)
    const assignedRM = rms.find((r) => r.id === formData.rmId)
    const assignedAM = ams.find((a) => a.id === formData.amId)

    const areaName = assignedArea ? assignedArea.name : "Unassigned"
    const rmName = assignedRM ? assignedRM.name : "Unassigned"
    const amName = assignedAM ? assignedAM.name : "Unassigned"

    if (editingOfficer) {
      setOfficers((prev) =>
        prev.map((item) =>
          item.id === editingOfficer.id
            ? {
                ...item,
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim(),
                areaId: formData.areaId,
                areaName,
                rmId: formData.rmId,
                rmName,
                amId: formData.amId,
                amName,
              }
            : item
        )
      )
      setEditingOfficer(null)
      showToast("Sales Officer updated successfully.")
    } else {
      const newOfficer: SalesOfficerItem = {
        id: `off-${Date.now()}`,
        code: formData.code.trim().toUpperCase() || `OFF-${String(officers.length + 1).padStart(3, "0")}`,
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        areaId: formData.areaId,
        areaName,
        rmId: formData.rmId,
        rmName,
        amId: formData.amId,
        amName,
        totalOrders: 0,
        totalSales: 0,
      }
      setOfficers((prev) => [newOfficer, ...prev])
      setIsCreateOpen(false)
      showToast("New Sales Officer added successfully.")
    }
    setFormErrors({})
    setFormError("")
  }

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingOfficer) return
    setOfficers((prev) => prev.filter((item) => item.id !== deletingOfficer.id))
    setDeletingOfficer(null)
    showToast("Sales Officer deleted successfully.")
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
            Sales Officers
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage sales officers and their assigned areas, regional managers and area managers.
          </p>
        </div>

        {/* Add Officer Button */}
        <Button
          type="button"
          onClick={handleOpenCreate}
          size="sm"
          className="cursor-pointer gap-1.5 font-medium shadow-xs"
        >
          <Plus className="size-4" />
          <span>Add Officer</span>
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Sales Officers ({filteredOfficers.length})
              </CardTitle>
            </div>

            {/* Hierarchical 3-Way Filters + Search */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
              {/* 1. Area Wise Filter */}
              <div className="flex items-center gap-1.5 rounded border border-border/80 bg-muted/20 px-2 py-1">
                <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                <select
                  aria-label="Area Wise Filter"
                  value={selectedAreaFilter}
                  onChange={(e) => setSelectedAreaFilter(e.target.value)}
                  className="h-7 w-full bg-transparent text-xs text-foreground outline-none"
                >
                  <option value="all">All Areas</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. RM Wise Filter */}
              <div className="flex items-center gap-1.5 rounded border border-border/80 bg-muted/20 px-2 py-1">
                <UserRound className="size-3.5 shrink-0 text-muted-foreground" />
                <select
                  aria-label="RM Wise Filter"
                  value={selectedRMFilter}
                  onChange={(e) => setSelectedRMFilter(e.target.value)}
                  className="h-7 w-full bg-transparent text-xs text-foreground outline-none"
                >
                  <option value="all">All RMs</option>
                  {availableRMsForFilter.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. AM Wise Filter */}
              <div className="flex items-center gap-1.5 rounded border border-border/80 bg-muted/20 px-2 py-1">
                <UsersRound className="size-3.5 shrink-0 text-muted-foreground" />
                <select
                  aria-label="AM Wise Filter"
                  value={selectedAMFilter}
                  onChange={(e) => setSelectedAMFilter(e.target.value)}
                  className="h-7 w-full bg-transparent text-xs text-foreground outline-none"
                >
                  <option value="all">All AMs</option>
                  {availableAMsForFilter.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.code})
                    </option>
                  ))}
                </select>
              </div>

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
                      No sales officers found.
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
                {editingOfficer ? "Edit Sales Officer" : "Add Sales Officer"}
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
                  placeholder="e.g. +880 1755-112233"
                  className={`text-xs font-mono ${formErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-destructive">{formErrors.phone}</p>
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

              {/* 1. Assigned Area (Cascades to RM and AM) */}
              <div className="space-y-1.5">
                <Label htmlFor="officerArea" className="text-xs font-medium text-foreground">
                  1. Assigned Area
                </Label>
                <select
                  id="officerArea"
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

              {/* 2. Assigned RM (Dependent on Area) */}
              <div className="space-y-1.5">
                <Label htmlFor="officerRM" className="text-xs font-medium text-foreground">
                  2. Assigned Regional Manager (RM)
                </Label>
                <select
                  id="officerRM"
                  value={formData.rmId}
                  onChange={(e) => {
                    handleFormRMChange(e.target.value)
                    if (formErrors.rmId) setFormErrors((prev) => ({ ...prev, rmId: undefined }))
                  }}
                  className={`h-8 w-full rounded border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring ${formErrors.rmId ? "border-destructive focus:ring-destructive" : "border-input"}`}
                >
                  {availableRMsForForm.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code}) — {r.areaName}
                    </option>
                  ))}
                </select>
                {formErrors.rmId && (
                  <p className="text-[11px] text-destructive">{formErrors.rmId}</p>
                )}
              </div>

              {/* 3. Assigned AM (Dependent on Area and RM) */}
              <div className="space-y-1.5">
                <Label htmlFor="officerAM" className="text-xs font-medium text-foreground">
                  3. Assigned Area Manager (AM)
                </Label>
                <select
                  id="officerAM"
                  value={formData.amId}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, amId: e.target.value }))
                    if (formErrors.amId) setFormErrors((prev) => ({ ...prev, amId: undefined }))
                  }}
                  className={`h-8 w-full rounded border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring ${formErrors.amId ? "border-destructive focus:ring-destructive" : "border-input"}`}
                >
                  {availableAMsForForm.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.code}) — RM: {a.rmName}
                    </option>
                  ))}
                </select>
                {formErrors.amId && (
                  <p className="text-[11px] text-destructive">{formErrors.amId}</p>
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
                  Are you sure you want to delete this Sales Officer?
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
