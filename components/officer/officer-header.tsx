"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Menu,
  Moon,
  Sun,
  UserCheck,
  MapPin,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { officerNavItemsConfig } from "./officer-sidebar"
import { useAppState } from "@/lib/store"

interface OfficerHeaderProps {
  onOpenSidebar: () => void
}

export function OfficerHeader({ onOpenSidebar }: OfficerHeaderProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const { currentOfficer } = useAppState()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Determine current page title
  const currentItem = officerNavItemsConfig.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/officer/dashboard" && pathname.startsWith(item.href + "/"))
  )
  const pageTitle = currentItem ? currentItem.title : "Officer Panel"

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }

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

      {/* Right side: Officer Badge & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        {currentOfficer && (
          <div className="hidden sm:flex items-center gap-2 rounded-md border border-border/80 bg-muted/30 px-2.5 py-1 text-xs">
            <UserCheck className="size-3.5 text-primary" />
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <span>{currentOfficer.name}</span>
              <span className="font-mono text-[10px] text-muted-foreground">({currentOfficer.code})</span>
            </div>
            <div className="h-3 w-px bg-border" />
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="size-3 text-muted-foreground" />
              <span>{currentOfficer.areaName}</span>
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
