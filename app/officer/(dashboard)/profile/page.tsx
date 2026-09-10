"use client"

import * as React from "react"
import {
  UserCheck,
  UsersRound,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Building2,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAppState } from "@/lib/store"

export default function StaffProfilePage() {
  const { currentRole, currentOfficer, currentAM, currentRM, verifyAndChangePin } = useAppState()

  // Identify active profile
  const user = React.useMemo(() => {
    if (currentRole === "rm" && currentRM) {
      return {
        id: currentRM.id,
        name: currentRM.name,
        code: currentRM.code,
        phone: currentRM.phone,
        email: currentRM.email,
        pin: currentRM.pin || "123456",
        areaName: currentRM.areaName,
        roleTitle: "Regional Manager (RM)",
        roleBadge: "RM",
        icon: Shield,
        parentSupervisor: "Head of Sales / Admin",
      }
    }
    if (currentRole === "am" && currentAM) {
      return {
        id: currentAM.id,
        name: currentAM.name,
        code: currentAM.code,
        phone: currentAM.phone,
        email: currentAM.email,
        pin: currentAM.pin || "123456",
        areaName: currentAM.areaName,
        roleTitle: "Area Manager (AM)",
        roleBadge: "AM",
        icon: UsersRound,
        parentSupervisor: currentAM.rmName ? `RM: ${currentAM.rmName}` : "Regional Manager",
      }
    }
    if (currentOfficer) {
      return {
        id: currentOfficer.id,
        name: currentOfficer.name,
        code: currentOfficer.code,
        phone: currentOfficer.phone,
        email: currentOfficer.email,
        pin: currentOfficer.pin || "123456",
        areaName: currentOfficer.areaName,
        roleTitle: "Sales Officer",
        roleBadge: "Officer",
        icon: UserCheck,
        parentSupervisor: currentOfficer.amName
          ? `AM: ${currentOfficer.amName} | RM: ${currentOfficer.rmName}`
          : "Area Manager",
      }
    }
    return null
  }, [currentRole, currentOfficer, currentAM, currentRM])

  // Form states
  const [currentPin, setCurrentPin] = React.useState("")
  const [newPin, setNewPin] = React.useState("")
  const [confirmPin, setConfirmPin] = React.useState("")

  // Visibility toggles
  const [showCurrentPin, setShowCurrentPin] = React.useState(false)
  const [showNewPin, setShowNewPin] = React.useState(false)
  const [showConfirmPin, setShowConfirmPin] = React.useState(false)

  // Status feedback
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [statusMessage, setStatusMessage] = React.useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const [formErrors, setFormErrors] = React.useState<{
    currentPin?: string
    newPin?: string
    confirmPin?: string
  }>({})

  if (!user) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="size-10 text-muted-foreground" />
        <h2 className="mt-3 text-base font-semibold text-foreground">No Active Staff Profile Found</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Please log in with an active Officer, AM, or RM account.
        </p>
      </div>
    )
  }

  const UserIcon = user.icon

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault()
    setStatusMessage(null)
    const errors: {
      currentPin?: string
      newPin?: string
      confirmPin?: string
    } = {}

    if (!currentPin) {
      errors.currentPin = "Current PIN is required."
    } else if (currentPin.length !== 6 || !/^\d{6}$/.test(currentPin)) {
      errors.currentPin = "PIN must be 6 numeric digits."
    }

    if (!newPin) {
      errors.newPin = "New PIN is required."
    } else if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      errors.newPin = "New PIN must be exactly 6 numeric digits."
    }

    if (!confirmPin) {
      errors.confirmPin = "Please confirm your new PIN."
    } else if (confirmPin !== newPin) {
      errors.confirmPin = "New PIN and Confirm PIN do not match."
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setIsSubmitting(true)
    setFormErrors({})

    setTimeout(() => {
      const res = verifyAndChangePin(currentRole, user.id, currentPin, newPin)
      setIsSubmitting(false)

      if (res.success) {
        setStatusMessage({
          type: "success",
          text: res.message || "Your 6-digit PIN has been updated successfully! Use this new PIN for your next login.",
        })
        setCurrentPin("")
        setNewPin("")
        setConfirmPin("")
      } else {
        setStatusMessage({
          type: "error",
          text: res.message || "Failed to update PIN. Please verify your current PIN.",
        })
      }
    }, 350)
  }

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          My Profile & Security Settings
        </h2>
        <p className="text-xs text-muted-foreground">
          View your staff credentials, assigned territory, and update your 6-digit login PIN.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column: Profile Card Overview */}
        <div className="space-y-6 md:col-span-5 lg:col-span-4">
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3 text-center">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-xs">
                <UserIcon className="size-8" />
              </div>
              <div className="mt-2 space-y-1">
                <CardTitle className="text-base font-bold text-foreground">{user.name}</CardTitle>
                <div className="flex items-center justify-center gap-2">
                  <span className="rounded-sm border border-primary/20 bg-primary/5 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    {user.code}
                  </span>
                  <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    {user.roleBadge}
                  </span>
                </div>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                {user.roleTitle}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3 pt-2 text-xs">
              <div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-2.5">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-muted-foreground" />
                    <span>Phone Number:</span>
                  </span>
                  <strong className="font-mono font-medium text-foreground">{user.phone}</strong>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5 text-muted-foreground" />
                    <span>Email:</span>
                  </span>
                  <span className="truncate max-w-[170px] text-foreground font-medium">{user.email || "N/A"}</span>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-muted-foreground" />
                    <span>Assigned Area:</span>
                  </span>
                  <strong className="text-foreground">{user.areaName}</strong>
                </div>

                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    <span>Hierarchy:</span>
                  </span>
                  <span className="text-foreground text-right font-medium max-w-[160px] truncate">{user.parentSupervisor}</span>
                </div>
              </div>

              {/* Login Credential Summary Badge */}
              <div className="flex items-center gap-2 rounded border border-primary/20 bg-primary/5 p-2.5 text-xs">
                <KeyRound className="size-4 text-primary shrink-0" />
                <div className="leading-snug text-muted-foreground">
                  Your login method is <strong className="text-foreground font-semibold">Phone + 6-digit PIN</strong>.
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Best Practices Card */}
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <Shield className="size-4 text-primary" />
                <span>Security Guidelines</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              <p className="flex items-start gap-1.5">
                <span className="mt-0.5 size-1.5 rounded-full bg-primary shrink-0" />
                <span>Never share your 6-digit PIN with customers or unverified individuals.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="mt-0.5 size-1.5 rounded-full bg-primary shrink-0" />
                <span>Avoid simple sequences like <code className="font-mono bg-muted px-1 py-0.5 rounded text-foreground">123456</code> or repeated numbers.</span>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="mt-0.5 size-1.5 rounded-full bg-primary shrink-0" />
                <span>If you suspect your PIN is compromised, update it immediately.</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Change 6-Digit PIN Form */}
        <div className="space-y-6 md:col-span-7 lg:col-span-8">
          <Card className="border-border/80 bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                  <KeyRound className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Change 6-Digit Login PIN
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Update your personal 6-digit numeric PIN for secure access to the field operations portal.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5">
              {/* Status Alert Banner */}
              {statusMessage && (
                <div
                  className={`mb-5 flex items-start gap-2.5 rounded border p-3 text-xs ${
                    statusMessage.type === "success"
                      ? "border-primary/30 bg-primary/10 text-foreground dark:border-primary/40"
                      : "border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40"
                  }`}
                >
                  {statusMessage.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 size-4 text-primary shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 size-4 text-destructive shrink-0" />
                  )}
                  <div className="flex-1 font-medium leading-relaxed">{statusMessage.text}</div>
                </div>
              )}

              <form onSubmit={handleUpdatePin} className="space-y-4 max-w-md">
                {/* Current PIN Field */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="currentPin" className="text-xs font-medium text-foreground">
                      Current 6-Digit PIN <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[10px] text-muted-foreground">
                      Initial default is 123456
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="currentPin"
                      type={showCurrentPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={6}
                      value={currentPin}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/\D/g, "").slice(0, 6)
                        setCurrentPin(numeric)
                        if (formErrors.currentPin) setFormErrors((prev) => ({ ...prev, currentPin: undefined }))
                      }}
                      placeholder="Enter current 6-digit PIN"
                      className={`font-mono text-xs tracking-wider pr-9 ${
                        formErrors.currentPin ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setShowCurrentPin(!showCurrentPin)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label={showCurrentPin ? "Hide current PIN" : "Show current PIN"}
                    >
                      {showCurrentPin ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </Button>
                  </div>
                  {formErrors.currentPin && (
                    <p className="text-[11px] text-destructive">{formErrors.currentPin}</p>
                  )}
                </div>

                {/* New PIN Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPin" className="text-xs font-medium text-foreground">
                    New 6-Digit PIN <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPin"
                      type={showNewPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/\D/g, "").slice(0, 6)
                        setNewPin(numeric)
                        if (formErrors.newPin) setFormErrors((prev) => ({ ...prev, newPin: undefined }))
                      }}
                      placeholder="e.g. 654321"
                      className={`font-mono text-xs tracking-wider pr-9 ${
                        formErrors.newPin ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setShowNewPin(!showNewPin)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label={showNewPin ? "Hide new PIN" : "Show new PIN"}
                    >
                      {showNewPin ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </Button>
                  </div>
                  {formErrors.newPin && (
                    <p className="text-[11px] text-destructive">{formErrors.newPin}</p>
                  )}
                </div>

                {/* Confirm New PIN Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPin" className="text-xs font-medium text-foreground">
                    Confirm New 6-Digit PIN <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPin"
                      type={showConfirmPin ? "text" : "password"}
                      inputMode="numeric"
                      maxLength={6}
                      value={confirmPin}
                      onChange={(e) => {
                        const numeric = e.target.value.replace(/\D/g, "").slice(0, 6)
                        setConfirmPin(numeric)
                        if (formErrors.confirmPin) setFormErrors((prev) => ({ ...prev, confirmPin: undefined }))
                      }}
                      placeholder="Re-enter new 6-digit PIN"
                      className={`font-mono text-xs tracking-wider pr-9 ${
                        formErrors.confirmPin ? "border-destructive focus-visible:ring-destructive" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => setShowConfirmPin(!showConfirmPin)}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label={showConfirmPin ? "Hide confirm PIN" : "Show confirm PIN"}
                    >
                      {showConfirmPin ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </Button>
                  </div>
                  {formErrors.confirmPin && (
                    <p className="text-[11px] text-destructive">{formErrors.confirmPin}</p>
                  )}
                </div>

                {/* PIN Requirements Indicator */}
                <div className="rounded-md border border-border/60 bg-muted/20 p-3 space-y-1 text-[11px] text-muted-foreground">
                  <div className="font-semibold text-foreground flex items-center gap-1">
                    <Info className="size-3 text-primary" />
                    <span>PIN Requirements:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    <li className={newPin.length === 6 ? "text-primary font-medium" : ""}>
                      Must contain exactly 6 numeric digits ({newPin.length}/6 digits entered)
                    </li>
                    <li className={confirmPin && confirmPin === newPin ? "text-primary font-medium" : ""}>
                      Confirm PIN must match New PIN
                    </li>
                  </ul>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto cursor-pointer gap-2 font-semibold"
                  >
                    <KeyRound className="size-4" />
                    <span>{isSubmitting ? "Updating PIN..." : "Update 6-Digit PIN"}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
