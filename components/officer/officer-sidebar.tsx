"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Boxes,
  LogOut,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppState } from "@/lib/store"

export interface OfficerNavItemConfig {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const officerNavItemsConfig: OfficerNavItemConfig[] = [
  {
    title: "Dashboard",
    href: "/officer/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Customers",
    href: "/officer/customers",
    icon: Users,
  },
  {
    title: "My Orders",
    href: "/officer/orders",
    icon: ShoppingCart,
  },
  {
    title: "Stock",
    href: "/officer/stock",
    icon: Boxes,
  },
]

interface OfficerSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function OfficerSidebar({ isOpen, onClose }: OfficerSidebarProps) {
  const pathname = usePathname()
  const { currentOfficer, logoutOfficer } = useAppState()

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex h-svh w-64 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:z-40 lg:h-svh lg:translate-x-0",
          isOpen ? "translate-x-0 shadow-xl lg:shadow-none" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
          <Link
            href="/officer/dashboard"
            onClick={onClose}
            className="flex items-center transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-36 items-center justify-center rounded-md border border-sidebar-border/60 bg-white px-2 py-1 shadow-2xs dark:bg-white/95">
              <Image
                src="/logo.jpeg"
                alt="Eakin Animal Health Logo"
                width={130}
                height={35}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Close button on mobile */}
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={onClose}
            aria-label="Close sidebar"
            className="text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Sales Officer Menu
          </div>
          {officerNavItemsConfig.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== "/officer/dashboard" && pathname.startsWith(item.href + "/"))

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0 transition-colors",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-sidebar-foreground"
                  )}
                />
                <span className="truncate">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sidebar Footer / Sign Out Link */}
        <div className="shrink-0 border-t border-sidebar-border p-3">
          <Link
            href="/officer/login"
            onClick={() => logoutOfficer()}
            className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="size-4 shrink-0 transition-colors group-hover:text-destructive" />
            <span className="truncate">Sign Out</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
