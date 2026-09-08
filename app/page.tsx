"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Loader2,
  Moon,
  Sun,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setNotice(null)

    setTimeout(() => {
      if (
        email.trim().toLowerCase() === "admin@gmail.com" &&
        password === "admin1234"
      ) {
        setNotice({
          type: "success",
          message: "Login successful! Redirecting to dashboard...",
        })
        router.push("/dashboard")
      } else {
        setIsLoading(false)
        setNotice({
          type: "error",
          message: "Invalid credentials. Use admin@gmail.com and admin1234.",
        })
      }
    }, 600)
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
      <main className="relative z-10 my-auto flex w-full max-w-[390px] flex-col items-center">
        {/* Card Component */}
        <Card className="w-full border-border/80 bg-card shadow-sm">
          {/* Card Header & Brand Logo Area */}
          <CardHeader className="space-y-4 pb-4 text-center">
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
          </CardHeader>

          {/* Form Content */}
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Notice Banner if active */}
              {notice && (
                <div
                  role="status"
                  className={cn(
                    "flex items-start gap-2 border p-2.5 text-xs",
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

              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@gmail.com"
                    className="pl-8"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium text-foreground">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pr-8 pl-8"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-hidden"
                  >
                    {showPassword ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
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
                    <span>Verifying...</span>
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
              <Link
                href="/officer/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <span>Sales Officer? Sign In to Officer Portal</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Empty bottom spacer for symmetrical vertical centering */}
      <div className="h-6" />
    </div>
  )
}
