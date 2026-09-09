"use client"

import * as React from "react"
import Image from "next/image"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  Lock,
  Loader2,
  Moon,
  Sun,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Phone,
  UserCheck,
  Shield,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAppState } from "@/lib/store"

export default function OfficerLoginPage() {
  const router = useRouter()
  const { loginStaff } = useAppState()

  // Default autofilled credentials (Officer 1: Arafat Hossain)
  const [phone, setPhone] = React.useState("01711000111")
  const [pin, setPin] = React.useState("123456")
  const [showPin, setShowPin] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [notice, setNotice] = React.useState<{
    type: "info" | "success" | "error"
    message: string
  } | null>(null)

  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Only allow numeric input for PIN (max 6 digits)
  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = e.target.value.replace(/\D/g, "").slice(0, 6)
    setPin(numeric)
  }

  // Quick switch demo credentials
  const fillCredentials = (quickPhone: string, roleName: string) => {
    setPhone(quickPhone)
    setPin("123456")
    setNotice({
      type: "info",
      message: `Loaded ${roleName} credentials. Click "Sign In" to continue.`,
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setNotice(null)

    if (pin.length !== 6) {
      setIsLoading(false)
      setNotice({
        type: "error",
        message: "PIN must be exactly 6 numeric digits.",
      })
      return
    }

    setTimeout(() => {
      const res = loginStaff(phone, pin)
      if (res.success && res.role && res.user) {
        const roleLabel =
          res.role === "rm"
            ? "Regional Manager (RM) Dashboard"
            : res.role === "am"
            ? "Area Manager (AM) Dashboard"
            : "Officer Panel"

        setNotice({
          type: "success",
          message: `Welcome, ${res.user.name}! Redirecting to ${roleLabel}...`,
        })

        setTimeout(() => {
          if (res.role === "rm") {
            router.push("/officer/rm/dashboard")
          } else if (res.role === "am") {
            router.push("/officer/am/dashboard")
          } else {
            router.push("/officer/dashboard")
          }
        }, 500)
      } else {
        setIsLoading(false)
        setNotice({
          type: "error",
          message: res.error || "Invalid login credentials. Please check your Phone Number and 6-digit PIN.",
        })
      }
    }, 450)
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-between bg-muted/40 px-4 py-6 md:px-6">
      {/* Background Subtle Accent Pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60 dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] dark:opacity-30" />

      {/* Top Header / Actions Bar */}
      <header className="relative z-10 flex w-full max-w-5xl items-center justify-end gap-2">
        {mounted && (
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="cursor-pointer text-muted-foreground hover:text-foreground"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-3.5" />
            ) : (
              <Moon className="size-3.5" />
            )}
          </Button>
        )}
      </header>

      {/* Main Login Container */}
      <main className="relative z-10 my-auto flex w-full max-w-[420px] flex-col items-center">
        {/* Card Component */}
        <Card className="w-full border-border/80 bg-card shadow-sm">
          {/* Card Header & Brand Logo Area */}
          <CardHeader className="space-y-3 pb-3 text-center">
            <div className="mx-auto flex w-full max-w-[190px] items-center justify-center rounded-md border border-border/60 bg-white p-2.5 shadow-xs dark:bg-white/95">
              <Image
                src="/logo.jpeg"
                alt="Eakin Animal Health Logo"
                width={180}
                height={70}
                className="h-14 w-auto object-contain"
                priority
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Field Operations Portal</h2>
              <p className="text-xs text-muted-foreground">Officer &bull; AM &bull; RM Staff Login</p>
            </div>
          </CardHeader>

          {/* Form Content */}
          <CardContent className="pt-1">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notice Banner if active */}
              {notice && (
                <div
                  role="status"
                  className={cn(
                    "flex items-start gap-2 border p-2.5 text-xs rounded",
                    notice.type === "error"
                      ? "border-destructive/30 bg-destructive/10 text-destructive dark:border-destructive/40"
                      : notice.type === "success"
                      ? "border-primary/20 bg-primary/10 text-foreground"
                      : "border-primary/20 bg-primary/5 text-foreground"
                  )}
                >
                  {notice.type === "error" ? (
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  ) : notice.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  ) : (
                    <Info className="mt-0.5 size-4 shrink-0 text-primary" />
                  )}
                  <div className="flex-1 leading-snug">{notice.message}</div>
                </div>
              )}

              {/* Phone Number Field */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-foreground">
                  Phone Number
                </Label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="pl-8 font-mono text-xs"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* 6-digit PIN Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pin" className="text-xs font-medium text-foreground">
                    6-digit PIN
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Numeric only</span>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="pin"
                    name="pin"
                    type={showPin ? "text" : "password"}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    autoComplete="current-password"
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="••••••"
                    className="pr-8 pl-8 font-mono tracking-widest text-xs"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    aria-label={showPin ? "Hide PIN" : "Show PIN"}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden cursor-pointer"
                  >
                    {showPin ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Demo Switchers */}
              <div className="rounded-md border border-border/70 bg-muted/20 p-2 text-[11px] space-y-1.5">
                <div className="flex items-center gap-1 font-semibold text-muted-foreground">
                  <Shield className="size-3 text-primary" />
                  <span>Quick Demo Accounts (PIN: 123456):</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => fillCredentials("01711000111", "Sales Officer")}
                    className={cn(
                      "cursor-pointer rounded border px-1.5 py-1 text-center font-medium transition-colors",
                      phone.replace(/\D/g, "") === "01711000111"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Officer
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("01722100200", "Area Manager (AM)")}
                    className={cn(
                      "cursor-pointer rounded border px-1.5 py-1 text-center font-medium transition-colors",
                      phone.replace(/\D/g, "") === "01722100200"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials("01712111222", "Regional Manager (RM)")}
                    className={cn(
                      "cursor-pointer rounded border px-1.5 py-1 text-center font-medium transition-colors",
                      phone.replace(/\D/g, "") === "01712111222"
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border bg-background/80 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    RM
                  </button>
                </div>
              </div>

              {/* Submit / Login Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="mt-2 w-full cursor-pointer font-medium shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-4 border-t border-border/60 pt-3 text-center">
              <a
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <span>Admin? Sign In to Admin Panel</span>
                <ArrowRight className="size-3" />
              </a>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Empty bottom spacer for symmetrical vertical centering */}
      <div className="h-6" />
    </div>
  )
}
