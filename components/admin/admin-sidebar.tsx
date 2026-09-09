"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Building2,
  MapPin,
  UserRound,
  UsersRound,
  UserCheck,
  Boxes,
  BarChart3,
  LogOut,
  X,
  Banknote,
  RotateCcw,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppState } from "@/lib/store"
import {
  officerNavItemsConfig,
  rmNavItemsConfig,
  amNavItemsConfig,
} from "@/components/officer/officer-sidebar"

export interface NavItemConfig {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export const navItemsConfig: NavItemConfig[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Collections",
    href: "/collections",
    icon: Banknote,
  },
  {
    title: "Product Returns",
    href: "/product-returns",
    icon: RotateCcw,
  },
  {
    title: "Products",
    href: "/products",
    icon: Package,
  },
  {
    title: "Stock Management",
    href: "/stock-management",
    icon: Boxes,
  },
  {
    title: "Depots",
    href: "/depots",
    icon: Building2,
  },
  {
    title: "Areas",
    href: "/areas",
    icon: MapPin,
  },
  {
    title: "RM",
    href: "/rms",
    icon: UserRound,
  },
  {
    title: "AM",
    href: "/ams",
    icon: UsersRound,
  },
  {
    title: "Sales Officers",
    href: "/officers",
    icon: UserCheck,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
]

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { currentRole, logoutStaff } = useAppState()

  // Select items & config dynamically based on current logged in role
  const activeNavItems = React.useMemo(() => {
    if (currentRole === "rm") return rmNavItemsConfig
    if (currentRole === "am") return amNavItemsConfig
    if (currentRole === "officer") return officerNavItemsConfig
    return navItemsConfig
  }, [currentRole])

  const menuTitle = React.useMemo(() => {
    if (currentRole === "rm") return "Regional Manager Menu"
    if (currentRole === "am") return "Area Manager Menu"
    if (currentRole === "officer") return "Sales Officer Menu"
    return "Main Navigation"
  }, [currentRole])

  const brandLink = React.useMemo(() => {
    if (currentRole === "rm") return "/officer/rm/dashboard"
    if (currentRole === "am") return "/officer/am/dashboard"
    if (currentRole === "officer") return "/officer/dashboard"
    return "/dashboard"
  }, [currentRole])

  const isStaffUser = currentRole === "rm" || currentRole === "am" || currentRole === "officer"

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
            href={brandLink}
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
            {menuTitle}
          </div>
          {activeNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.href !== brandLink && pathname.startsWith(item.href + "/"))

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
          {isStaffUser ? (
            <Link
              href="/officer/login"
              onClick={() => logoutStaff()}
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4 shrink-0 transition-colors group-hover:text-destructive" />
              <span className="truncate">Sign Out</span>
            </Link>
          ) : (
            <Link
              href="/"
              className="group flex w-full items-center gap-3 rounded-md px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="size-4 shrink-0 transition-colors group-hover:text-destructive" />
              <span className="truncate">Exit to Login</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
