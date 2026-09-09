"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Menu,
  Moon,
  Sun,
  UserCheck,
  UsersRound,
  Shield,
  MapPin,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { navItemsConfig } from "./admin-sidebar"
import {
  officerNavItemsConfig,
  rmNavItemsConfig,
  amNavItemsConfig,
} from "@/components/officer/officer-sidebar"
import { useAppState } from "@/lib/store"

interface AdminHeaderProps {
  onOpenSidebar: () => void
}

export function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { currentRole, currentOfficer, currentAM, currentRM } = useAppState()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Active Nav Config based on current role
  const activeNavConfig = React.useMemo(() => {
    if (currentRole === "rm") return rmNavItemsConfig
    if (currentRole === "am") return amNavItemsConfig
    if (currentRole === "officer") return officerNavItemsConfig
    return navItemsConfig
  }, [currentRole])

  // Determine current page title
  const pageTitle = React.useMemo(() => {
    if (pathname === "/officer/rm/dashboard") return "Regional Manager Dashboard"
    if (pathname === "/officer/am/dashboard") return "Area Manager Dashboard"
    if (pathname === "/officer/dashboard") return "Sales Officer Dashboard"
    if (pathname === "/dashboard") {
      if (currentRole === "rm") return "Regional Manager Dashboard"
      if (currentRole === "am") return "Area Manager Dashboard"
      if (currentRole === "officer") return "Sales Officer Dashboard"
      return "Executive Overview Dashboard"
    }

    const currentItem = activeNavConfig.find(
      (item) =>
        pathname === item.href ||
        (item.href !== "/dashboard" &&
          item.href !== "/officer/dashboard" &&
          item.href !== "/officer/rm/dashboard" &&
          item.href !== "/officer/am/dashboard" &&
          pathname.startsWith(item.href + "/"))
    )
    if (currentItem) return currentItem.title

    if (pathname.includes("/ams")) return "Area Managers (AM)"
    if (pathname.includes("/officers")) return "Sales Officers"
    if (pathname.includes("/customers")) return "Customers"
    if (pathname.includes("/orders")) return "Orders"
    if (pathname.includes("/stock-management") || pathname.includes("/stock")) return "Stock Management"

    return "Eakin ERP"
  }, [pathname, activeNavConfig, currentRole])

  // Current active user info for badge (when accessed by staff)
  const currentUser = React.useMemo(() => {
    if (currentRole === "rm" && currentRM) {
      return {
        name: currentRM.name,
        code: currentRM.code,
        territory: currentRM.areaName,
        roleBadge: "RM",
        icon: Shield,
      }
    }
    if (currentRole === "am" && currentAM) {
      return {
        name: currentAM.name,
        code: currentAM.code,
        territory: currentAM.areaName,
        roleBadge: "AM",
        icon: UsersRound,
      }
    }
    if (currentRole === "officer" && currentOfficer) {
      return {
        name: currentOfficer.name,
        code: currentOfficer.code,
        territory: currentOfficer.areaName,
        roleBadge: "Officer",
        icon: UserCheck,
      }
    }
    return null
  }, [currentRole, currentOfficer, currentAM, currentRM])

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

  const UserIcon = currentUser?.icon || UserCheck

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xs md:px-6">
      {/* Left side: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={onOpenSidebar}
          aria-label="Toggle navigation menu"
          className="text-muted-foreground hover:text-foreground lg:hidden cursor-pointer"
        >
          <Menu className="size-4" />
        </Button>

        <div className="flex flex-col">
          <h1 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Role/User Badge & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {currentUser && (
          <div className="hidden sm:flex items-center gap-2 rounded-md border border-border/80 bg-muted/30 px-2.5 py-1 text-xs">
            <UserIcon className="size-3.5 text-primary" />
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span>{currentUser.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">({currentUser.code})</span>
            </div>
            <span className="rounded bg-primary/10 px-1.5 py-0.2 font-mono text-[10px] font-semibold text-primary">
              {currentUser.roleBadge}
            </span>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="size-3 text-muted-foreground" />
              <span>{currentUser.territory}</span>
            </div>
          </div>
        )}

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
      </div>
    </header>
  )
}
