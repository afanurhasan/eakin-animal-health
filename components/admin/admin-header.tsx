"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import {
  Menu,
  Moon,
  Sun,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { navItemsConfig } from "./admin-sidebar"

interface AdminHeaderProps {
  onOpenSidebar: () => void
}

export function AdminHeader({ onOpenSidebar }: AdminHeaderProps) {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Determine current page title
  const currentItem = navItemsConfig.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))
  )
  const pageTitle = currentItem ? currentItem.title : "Eakin ERP"

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
          className="text-muted-foreground hover:text-foreground lg:hidden"
        >
          <Menu className="size-4" />
        </Button>

        <div className="flex flex-col">
          <h1 className="text-base font-semibold tracking-tight text-foreground md:text-lg">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Theme Toggle */}
      <div className="flex items-center gap-2">
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
