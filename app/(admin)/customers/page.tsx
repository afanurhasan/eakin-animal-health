"use client"

import * as React from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  MapPin,
  Store,
  UserCheck,
  UserRound,
  UsersRound,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  CreditCard,
  Eye,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppState } from "@/lib/store"
import {
  type CustomerItem,
  type SalesOfficerItem,
  type AMItem,
  type RMItem,
  type AreaItem,
} from "@/lib/mock-data"

export default function CustomersPage() {
  const {
    currentRole,
    currentRM,
    currentAM,
    currentOfficer,
    customers,
    officers,
    ams,
    rms,
    areas,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  } = useAppState()

  // Filter States: Area, RM, AM, Officer, Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedAreaFilter, setSelectedAreaFilter] = React.useState("all")
  const [selectedRMFilter, setSelectedRMFilter] = React.useState("all")
  const [selectedAMFilter, setSelectedAMFilter] = React.useState("all")
  const [selectedOfficerFilter, setSelectedOfficerFilter] = React.useState("all")

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingCustomer, setEditingCustomer] = React.useState<CustomerItem | null>(null)
  const [deletingCustomer, setDeletingCustomer] = React.useState<CustomerItem | null>(null)


  // Form input state
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    shopName: "",
    phone: "",
    email: "",
    address: "",
    areaId: areas[0]?.id || "1",
    rmId: rms[0]?.id || "rm-1",
    amId: ams[0]?.id || "am-1",
    officerId: officers[0]?.id || "off-1",
  })
  const [formError, setFormError] = React.useState("")
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  // Base Customers depending on role
  const roleBaseCustomers = React.useMemo(() => {
    if (currentRole === "rm" && currentRM) {
      return customers.filter((c) => c.rmId === currentRM.id || c.areaId === currentRM.areaId)
    }
    if (currentRole === "am" && currentAM) {
      return customers.filter((c) => c.amId === currentAM.id || c.areaId === currentAM.areaId)
    }
    if (currentRole === "officer" && currentOfficer) {
      return customers.filter((c) => c.officerId === currentOfficer.id)
    }
    return customers
  }, [customers, currentRole, currentRM, currentAM, currentOfficer])

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

  // Dependent AMs for the Filter Bar (For RM, only their own AMs)
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

  // Dependent Officers for the Filter Bar (Scoped per role)
  const availableOfficersForFilter = React.useMemo(() => {
    if (currentRole === "rm" && currentRM) {
      return officers.filter((o) => {
        const belongsToRM = o.rmId === currentRM.id || o.areaId === currentRM.areaId
        const matchAM = selectedAMFilter === "all" || o.amId === selectedAMFilter
        return belongsToRM && matchAM
      })
    }
    if (currentRole === "am" && currentAM) {
      return officers.filter((o) => o.amId === currentAM.id || o.areaId === currentAM.areaId)
    }
    return officers.filter((o) => {
      const matchArea = selectedAreaFilter === "all" || o.areaId === selectedAreaFilter
      const matchRM = selectedRMFilter === "all" || o.rmId === selectedRMFilter
      const matchAM = selectedAMFilter === "all" || o.amId === selectedAMFilter
      return matchArea && matchRM && matchAM
    })
  }, [officers, currentRole, currentRM, currentAM, selectedAreaFilter, selectedRMFilter, selectedAMFilter])

  // Currently selected officer in modal
  const selectedOfficerItem = React.useMemo(() => {
    if (!formData.officerId) return null
    return officers.find((o) => o.id === formData.officerId) || null
  }, [officers, formData.officerId])

  // Reset cascade filters when parent filter changes
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

  React.useEffect(() => {
    if (selectedOfficerFilter !== "all") {
      const validOfficer = availableOfficersForFilter.some((o) => o.id === selectedOfficerFilter)
      if (!validOfficer) setSelectedOfficerFilter("all")
    }
  }, [selectedAreaFilter, selectedRMFilter, selectedAMFilter, availableOfficersForFilter, selectedOfficerFilter])

  // Filtered Customers List
  const filteredCustomers = React.useMemo(() => {
    return roleBaseCustomers.filter((cust) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        cust.name.toLowerCase().includes(q) ||
        cust.shopName.toLowerCase().includes(q) ||
        cust.code.toLowerCase().includes(q) ||
        cust.phone.toLowerCase().includes(q) ||
        (cust.email && cust.email.toLowerCase().includes(q)) ||
        cust.address.toLowerCase().includes(q)

      if (!matchesSearch) return false

      if (currentRole === "admin") {
        if (selectedAreaFilter !== "all" && cust.areaId !== selectedAreaFilter) return false
        if (selectedRMFilter !== "all" && cust.rmId !== selectedRMFilter) return false
        if (selectedAMFilter !== "all" && cust.amId !== selectedAMFilter) return false
        if (selectedOfficerFilter !== "all" && cust.officerId !== selectedOfficerFilter) return false
      } else if (currentRole === "rm") {
        if (selectedAMFilter !== "all" && cust.amId !== selectedAMFilter) return false
        if (selectedOfficerFilter !== "all" && cust.officerId !== selectedOfficerFilter) return false
      } else if (currentRole === "am") {
        if (selectedOfficerFilter !== "all" && cust.officerId !== selectedOfficerFilter) return false
      }

      return true
    })
  }, [roleBaseCustomers, searchQuery, currentRole, selectedAreaFilter, selectedRMFilter, selectedAMFilter, selectedOfficerFilter])

  const [formErrors, setFormErrors] = React.useState<{
    code?: string
    name?: string
    shopName?: string
    phone?: string
    email?: string
    address?: string
    officerId?: string
  }>({})

  // Open Create Modal
  const handleOpenCreate = () => {
    const nextCodeNumber = customers.length + 1

    const defaultOfficer = officers[0]

    setFormData({
      code: `CUST-${String(nextCodeNumber).padStart(3, "0")}`,
      name: "",
      shopName: "",
      phone: "",
      email: "",
      address: "",
      officerId: defaultOfficer?.id || "off-1",
      amId: defaultOfficer?.amId || "am-1",
      rmId: defaultOfficer?.rmId || "rm-1",
      areaId: defaultOfficer?.areaId || "area-1",
    })
    setFormError("")
    setFormErrors({})
    setIsCreateOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (cust: CustomerItem) => {
    setEditingCustomer(cust)
    const matchingOfficer = officers.find((o) => o.id === cust.officerId) || officers[0]
    setFormData({
      code: cust.code,
      name: cust.name,
      shopName: cust.shopName,
      phone: cust.phone,
      email: cust.email || "",
      address: cust.address,
      areaId: cust.areaId || matchingOfficer?.areaId || "",
      rmId: cust.rmId || matchingOfficer?.rmId || "",
      amId: cust.amId || matchingOfficer?.amId || "",
      officerId: cust.officerId || matchingOfficer?.id || "",
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
      shopName?: string
      phone?: string
      email?: string
      address?: string
      officerId?: string
    } = {}

    if (!formData.code.trim()) {
      errors.code = "This field is required."
    }
    if (!formData.name.trim()) {
      errors.name = "This field is required."
    }
    if (!formData.shopName.trim()) {
      errors.shopName = "This field is required."
    }
    if (!formData.phone.trim()) {
      errors.phone = "This field is required."
    }
    if (!formData.address.trim()) {
      errors.address = "This field is required."
    }
    if (!formData.officerId) {
      errors.officerId = "Please search and select an assigned MPO."
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

    const assignedOfficer = officers.find((o) => o.id === formData.officerId)
    if (!assignedOfficer) {
      setFormErrors({ officerId: "Please select a valid MPO." })
      return
    }

    const assignedArea = areas.find((a) => a.id === assignedOfficer.areaId)
    const assignedRM = rms.find((r) => r.id === assignedOfficer.rmId)
    const assignedAM = ams.find((a) => a.id === assignedOfficer.amId)

    const areaName = assignedArea ? assignedArea.name : assignedOfficer.areaName
    const rmName = assignedRM ? assignedRM.name : assignedOfficer.rmName
    const amName = assignedAM ? assignedAM.name : assignedOfficer.amName
    const officerName = assignedOfficer.name

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        shopName: formData.shopName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        areaId: assignedOfficer.areaId,
        areaName,
        rmId: assignedOfficer.rmId,
        rmName,
        amId: assignedOfficer.amId,
        amName,
        officerId: assignedOfficer.id,
        officerName,
      })
      setEditingCustomer(null)
      showToast("Customer details updated successfully.")
    } else {
      addCustomer({
        code: formData.code.trim().toUpperCase() || `CUST-${String(customers.length + 1).padStart(3, "0")}`,
        name: formData.name.trim(),
        shopName: formData.shopName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        address: formData.address.trim(),
        areaId: assignedOfficer.areaId,
        areaName,
        rmId: assignedOfficer.rmId,
        rmName,
        amId: assignedOfficer.amId,
        amName,
        officerId: assignedOfficer.id,
        officerName,
        creditLimit: 0,
        outstandingBalance: 0,
        totalOrders: 0,
        totalSpent: 0,
      })
      setIsCreateOpen(false)
      showToast("New Customer added successfully.")
    }
    setFormErrors({})
    setFormError("")
  }

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deletingCustomer) return
    deleteCustomer(deletingCustomer.id)
    setDeletingCustomer(null)
    showToast("Customer deleted successfully.")
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
            Customers
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage veterinary pharmacy & farm customers, assigned officers, and credit terms.
          </p>
        </div>

        {/* Add Customer Button (Admin Only) */}
        {currentRole === "admin" && (
          <Button
            type="button"
            onClick={handleOpenCreate}
            size="sm"
            className="cursor-pointer gap-1.5 font-medium shadow-xs"
          >
            <Plus className="size-4" />
            <span>Add Customer</span>
          </Button>
        )}
      </div>

      {/* Main Table Card */}
      <Card className="border-border/80 bg-card shadow-xs">
        <CardHeader className="border-b border-border/70 p-4">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">
                Customers ({filteredCustomers.length})
              </CardTitle>
            </div>

            {/* Hierarchical Coordinated Filters + Search */}
            <div
              className={`grid grid-cols-1 gap-2.5 ${
                currentRole === "rm"
                  ? "sm:grid-cols-3"
                  : currentRole === "am"
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3"
              }`}
            >
              {/* 1. Area Wise Filter (Admin Only) */}
              {currentRole === "admin" && (
                <div className="flex items-center gap-1.5 rounded border border-border/80 bg-muted/20 px-2 py-1">
                  <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                  <select
                    aria-label="Filter by Area"
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

            

              {/* 4. MPO Filter (Admin, RM, AM) */}
              <div className="flex items-center gap-1.5 rounded border border-border/80 bg-muted/20 px-2 py-1">
                <UserCheck className="size-3.5 shrink-0 text-muted-foreground" />
                <select
                  aria-label="Filter by MPO"
                  value={selectedOfficerFilter}
                  onChange={(e) => setSelectedOfficerFilter(e.target.value)}
                  className="h-7 w-full bg-transparent text-xs text-foreground outline-none cursor-pointer"
                >
                  <option value="all">All MPOs</option>
                  {availableOfficersForFilter.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Search Bar */}
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customer, shop, phone..."
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
                    Customer Code
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Customer Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Shop / Pharmacy Name
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Phone
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Assigned Officer
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    Outstanding
                  </th>
                  <th scope="col" className="w-40 px-4 py-3 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust, index) => (
                    <tr
                      key={cust.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Serial */}
                      <td className="px-4 py-3 text-center font-medium text-muted-foreground">
                        {index + 1}
                      </td>

                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                          <Store className="size-3 text-primary" />
                          {cust.code}
                        </span>
                      </td>

                      {/* Customer Name */}
                      <td className="px-4 py-3 font-semibold text-foreground">
                        <Link
                          href={`/customers/${cust.id}`}
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {cust.name}
                        </Link>
                      </td>

                      {/* Shop Name */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <span className="font-medium text-foreground">{cust.shopName}</span>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span>{cust.phone}</span>
                        </div>
                      </td>

                    

                      {/* Assigned Officer */}
                      <td className="px-4 py-3 text-muted-foreground text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">{cust.officerName}</span>
                        </div>
                      </td>

                      {/* Outstanding Balance */}
                      <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-foreground">
                        ৳ {(cust.outstandingBalance || 0).toLocaleString()}
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
                                onClick={() => handleOpenEdit(cust)}
                                aria-label={`Edit ${cust.name}`}
                                className="cursor-pointer text-muted-foreground hover:bg-primary/10 hover:text-primary"
                              >
                                <Pencil className="size-3.5" />
                              </Button>

                              {/* Delete */}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => setDeletingCustomer(cust)}
                                aria-label={`Delete ${cust.name}`}
                                className="cursor-pointer text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Link href={`/customers/${cust.id}`}>
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
                      No customers found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* Create / Edit Customer Modal Dialog                       */}
      {/* ========================================================= */}
      {(isCreateOpen || editingCustomer) && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => {
              setIsCreateOpen(false)
              setEditingCustomer(null)
            }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 id="customer-modal-title" className="text-base font-semibold text-foreground">
                {editingCustomer ? "Edit Customer" : "Add Customer"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => {
                  setIsCreateOpen(false)
                  setEditingCustomer(null)
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

              {/* Customer Code */}
              <div className="space-y-1.5">
                <Label htmlFor="custCode" className="text-xs font-medium text-foreground">
                  Customer Code
                </Label>
                <Input
                  id="custCode"
                  name="custCode"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                    if (formErrors.code) setFormErrors((prev) => ({ ...prev, code: undefined }))
                  }}
                  placeholder="e.g. CUST-001"
                  className={`text-xs font-mono uppercase ${formErrors.code ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.code && (
                  <p className="text-[11px] text-destructive">{formErrors.code}</p>
                )}
              </div>

              {/* Proprietor / Customer Name */}
              <div className="space-y-1.5">
                <Label htmlFor="custName" className="text-xs font-medium text-foreground">
                  Proprietor / Customer Name
                </Label>
                <Input
                  id="custName"
                  name="custName"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }))
                  }}
                  placeholder="e.g. Haji Mohammad Ali"
                  className={`text-xs ${formErrors.name ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  autoFocus
                />
                {formErrors.name && (
                  <p className="text-[11px] text-destructive">{formErrors.name}</p>
                )}
              </div>

              {/* Shop / Pharmacy Name */}
              <div className="space-y-1.5">
                <Label htmlFor="shopName" className="text-xs font-medium text-foreground">
                  Shop / Pharmacy Name
                </Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, shopName: e.target.value }))
                    if (formErrors.shopName) setFormErrors((prev) => ({ ...prev, shopName: undefined }))
                  }}
                  placeholder="e.g. Ali Veterinary & Feed Store"
                  className={`text-xs ${formErrors.shopName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.shopName && (
                  <p className="text-[11px] text-destructive">{formErrors.shopName}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="custPhone" className="text-xs font-medium text-foreground">
                  Phone Number
                </Label>
                <Input
                  id="custPhone"
                  name="custPhone"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }))
                  }}
                  placeholder="e.g. +880 1711-223300"
                  className={`text-xs font-mono ${formErrors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.phone && (
                  <p className="text-[11px] text-destructive">{formErrors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="custEmail" className="text-xs font-medium text-foreground">
                  Email Address
                </Label>
                <Input
                  id="custEmail"
                  name="custEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }))
                  }}
                  placeholder="e.g. ali.vet@example.com"
                  className={`text-xs ${formErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.email && (
                  <p className="text-[11px] text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <Label htmlFor="custAddress" className="text-xs font-medium text-foreground">
                  Address / Location
                </Label>
                <Input
                  id="custAddress"
                  name="custAddress"
                  value={formData.address}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                    if (formErrors.address) setFormErrors((prev) => ({ ...prev, address: undefined }))
                  }}
                  placeholder="e.g. Holding #45, Station Road, Gazipur"
                  className={`text-xs ${formErrors.address ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {formErrors.address && (
                  <p className="text-[11px] text-destructive">{formErrors.address}</p>
                )}
              </div>

              {/* Assigned MPO (Medical Promotion Officer) */}
              <div className="space-y-1.5">
                <Label htmlFor="custOfficer" className="text-xs font-medium text-foreground">
                  Assigned MPO (Medical Promotion Officer)
                </Label>
                <select
                  id="custOfficer"
                  value={formData.officerId}
                  onChange={(e) => {
                    const newOfficerId = e.target.value
                    const off = officers.find((o) => o.id === newOfficerId)
                    setFormData((prev) => ({
                      ...prev,
                      officerId: newOfficerId,
                      amId: off?.amId || prev.amId,
                      rmId: off?.rmId || prev.rmId,
                      areaId: off?.areaId || prev.areaId,
                    }))
                    if (formErrors.officerId) setFormErrors((prev) => ({ ...prev, officerId: undefined }))
                  }}
                  className={`h-8 w-full rounded border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring ${formErrors.officerId ? "border-destructive focus:ring-destructive" : "border-input"}`}
                >
                  {officers.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.code}) — Area: {o.areaName}
                    </option>
                  ))}
                </select>
                {formErrors.officerId && (
                  <p className="text-[11px] text-destructive">{formErrors.officerId}</p>
                )}
              </div>

              {/* Auto-connected Territory & Management Card */}
              <div className="space-y-2 rounded-lg border border-border/80 bg-muted/20 p-3">
                <span className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Auto-Connected Territory & Management
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Area */}
                  <div className="flex items-center gap-2 rounded border border-input/60 bg-background/80 px-2.5 py-1.5">
                    <MapPin className="size-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Assigned Area</p>
                      <p className="font-medium text-foreground truncate">
                        {selectedOfficerItem?.areaName || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  {/* AM */}
                  <div className="flex items-center gap-2 rounded border border-input/60 bg-background/80 px-2.5 py-1.5">
                    <UserRound className="size-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Area Manager (AM)</p>
                      <p className="font-medium text-foreground truncate">
                        {selectedOfficerItem?.amName || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  {/* RM */}
                  <div className="flex items-center gap-2 rounded border border-input/60 bg-background/80 px-2.5 py-1.5">
                    <UserCheck className="size-3.5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight">Regional Manager (RM)</p>
                      <p className="font-medium text-foreground truncate">
                        {selectedOfficerItem?.rmName || "Unassigned"}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10.5px] text-muted-foreground">
                  Area Manager (AM), Regional Manager (RM), and Area are automatically connected from the selected MPO.
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
                    setEditingCustomer(null)
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
                  {editingCustomer ? "Save Changes" : "Save Customer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Delete Confirmation Modal Dialog                          */}
      {/* ========================================================= */}
      {deletingCustomer && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-customer-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            onClick={() => setDeletingCustomer(null)}
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
                  id="delete-customer-title"
                  className="text-sm font-semibold text-foreground"
                >
                  Confirm Delete
                </h3>
                <p className="text-xs text-muted-foreground">
                  Are you sure you want to delete this customer?
                </p>
                <div className="mt-2 rounded border border-border/80 bg-muted/40 p-2 text-xs">
                  <span className="font-mono font-semibold text-primary">
                    {deletingCustomer.code}
                  </span>{" "}
                  - <span className="font-medium text-foreground">{deletingCustomer.shopName}</span> (
                  {deletingCustomer.name})
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 flex items-center justify-end gap-2 border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingCustomer(null)}
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
