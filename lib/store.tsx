"use client"

import * as React from "react"
import {
  initialOrders,
  initialCustomers,
  initialOfficers,
  initialDepots,
  initialDepotStocks,
  initialAreasWithDepot,
  initialRegionalOffices,
  initialRMs,
  initialAMs,
  productCatalog,
  initialCollections,
  initialProductReturns,
  initialTransfers,
  initialStockMovements,
  type Order,
  type CustomerItem,
  type SalesOfficerItem,
  type MPOItem,
  type Depot,
  type DepotStockItem,
  type RegionalOffice,
  type AreaItem,
  type RMItem,
  type AMItem,
  type Product,
  type CollectionItem,
  type ProductReturnItem,
  type StockTransfer,
  type StockMovement,
} from "@/lib/mock-data"
import { formatDateTime } from "@/lib/utils"

const STORAGE_KEYS = {
  ORDERS: "eakin_erp_orders_v2",
  CUSTOMERS: "eakin_erp_customers_v2",
  OFFICERS: "eakin_erp_officers_v2",
  AMS: "eakin_erp_ams_v2",
  RMS: "eakin_erp_rms_v2",
  REGIONAL_OFFICES: "eakin_erp_regional_offices_v2",
  AREAS: "eakin_erp_areas_v2",
  DEPOT_STOCKS: "eakin_erp_depot_stocks_v2",
  COLLECTIONS: "eakin_erp_collections_v2",
  PRODUCT_RETURNS: "eakin_erp_returns_v2",
  CURRENT_OFFICER_ID: "eakin_erp_current_officer_id_v2",
  CURRENT_AM_ID: "eakin_erp_current_am_id_v2",
  CURRENT_RM_ID: "eakin_erp_current_rm_id_v2",
  CURRENT_ROLE: "eakin_erp_current_role_v2",
}

export type StaffRole = "admin" | "officer" | "am" | "rm"

export interface StaffLoginResult {
  success: boolean
  role?: StaffRole
  user?: SalesOfficerItem | AMItem | RMItem
  error?: string
}

interface AppStateContextType {
  // Entities
  orders: Order[]
  customers: CustomerItem[]
  officers: SalesOfficerItem[]
  depots: Depot[]
  depotStocks: Record<string, DepotStockItem[]>
  regionalOffices: RegionalOffice[]
  areas: AreaItem[]
  rms: RMItem[]
  ams: AMItem[]
  catalog: Product[]
  collections: CollectionItem[]
  productReturns: ProductReturnItem[]
  transfers: StockTransfer[]
  movements: StockMovement[]

  // Auth / Role State
  currentRole: StaffRole
  setCurrentRole: (role: StaffRole) => void
  currentOfficer: SalesOfficerItem | null
  setCurrentOfficer: (officer: SalesOfficerItem | null) => void
  currentAM: AMItem | null
  setCurrentAM: (am: AMItem | null) => void
  currentRM: RMItem | null
  setCurrentRM: (rm: RMItem | null) => void

  loginStaff: (phoneOrCode: string, pin: string) => StaffLoginResult
  loginOfficer: (emailOrCode: string) => SalesOfficerItem | null
  logoutOfficer: () => void
  logoutStaff: () => void
  verifyAndChangePin: (
    role: StaffRole,
    id: string,
    currentPin: string,
    newPin: string
  ) => { success: boolean; message: string }

  // Regional Office Mutations (Admin)
  addRegionalOffice: (ro: Omit<RegionalOffice, "id">) => RegionalOffice
  updateRegionalOffice: (id: string, updates: Partial<RegionalOffice>) => void
  deleteRegionalOffice: (id: string) => void

  // Area Mutations (Admin)
  addArea: (area: Omit<AreaItem, "id">) => AreaItem
  updateArea: (id: string, updates: Partial<AreaItem>) => void
  deleteArea: (id: string) => void

  // Staff Mutations (Admin)
  addOfficer: (off: Omit<SalesOfficerItem, "id">) => SalesOfficerItem
  updateOfficer: (id: string, updates: Partial<SalesOfficerItem>) => void
  deleteOfficer: (id: string) => void
  addAM: (am: Omit<AMItem, "id">) => AMItem
  updateAM: (id: string, updates: Partial<AMItem>) => void
  deleteAM: (id: string) => void
  addRM: (rm: Omit<RMItem, "id">) => RMItem
  updateRM: (id: string, updates: Partial<RMItem>) => void
  deleteRM: (id: string) => void
  assignRMToRegionalOffice: (roId: string, rmId: string | null) => void

  // Order Mutations
  createOrder: (orderData: Omit<Order, "id" | "code" | "date" | "status">) => Order
  approveOrder: (
    orderId: string,
    adminDiscountPercent: number,
    bonusItems?: Order["bonusItems"]
  ) => void
  cancelOrder: (orderId: string) => void

  // Customer Mutations (Admin)
  addCustomer: (cust: Omit<CustomerItem, "id">) => CustomerItem
  updateCustomer: (id: string, updates: Partial<CustomerItem>) => void
  deleteCustomer: (id: string) => void

  addCollection: (col: Omit<CollectionItem, "id" | "code" | "date">) => CollectionItem
  addProductReturn: (ret: Omit<ProductReturnItem, "id" | "code" | "date">) => ProductReturnItem
  addStockTransfer: (transfer: Omit<StockTransfer, "id" | "code" | "date" | "status">) => StockTransfer
  addStockMovement: (movement: Omit<StockMovement, "id" | "date">) => StockMovement

  // Helpers
  getOfficerAssignedDepot: (officerId: string) => Depot | null
  getOfficerAvailableDepots: (officerId: string) => Depot[]
}

const AppStateContext = React.createContext<AppStateContextType | undefined>(undefined)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Core State (Strict 2 depots, 2 regional offices, 2 RMs, 2 AMs, 2 MPOs, 4 customers, 4 areas)
  const [orders, setOrders] = React.useState<Order[]>(initialOrders)
  const [customers, setCustomers] = React.useState<CustomerItem[]>(initialCustomers)
  const [officers, setOfficers] = React.useState<SalesOfficerItem[]>(initialOfficers)
  const [depots] = React.useState<Depot[]>(initialDepots)
  const [depotStocks, setDepotStocks] = React.useState<Record<string, DepotStockItem[]>>(initialDepotStocks)
  const [regionalOffices, setRegionalOffices] = React.useState<RegionalOffice[]>(initialRegionalOffices)
  const [areas, setAreas] = React.useState<AreaItem[]>(initialAreasWithDepot)
  const [rms, setRms] = React.useState<RMItem[]>(initialRMs)
  const [ams, setAms] = React.useState<AMItem[]>(initialAMs)
  const [catalog] = React.useState<Product[]>(productCatalog)
  const [collections, setCollections] = React.useState<CollectionItem[]>(initialCollections)
  const [productReturns, setProductReturns] = React.useState<ProductReturnItem[]>(initialProductReturns)
  const [transfers, setTransfers] = React.useState<StockTransfer[]>(initialTransfers)
  const [movements, setMovements] = React.useState<StockMovement[]>(initialStockMovements)

  // Role and Session State
  const [currentRole, setCurrentRole] = React.useState<StaffRole>("officer")
  const [currentOfficerId, setCurrentOfficerId] = React.useState<string>("off-1")
  const [currentAMId, setCurrentAMId] = React.useState<string>("am-1")
  const [currentRMId, setCurrentRMId] = React.useState<string>("rm-1")

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    try {
      // Clean up legacy keys
      const legacyKeys = [
        "eakin_erp_orders", "eakin_erp_orders_v2",
        "eakin_erp_customers", "eakin_erp_customers_v2",
        "eakin_erp_officers", "eakin_erp_officers_v2",
        "eakin_erp_ams", "eakin_erp_ams_v2",
        "eakin_erp_rms", "eakin_erp_rms_v2",
        "eakin_erp_regional_offices", "eakin_erp_regional_offices_v2",
        "eakin_erp_areas", "eakin_erp_areas_v2",
        "eakin_erp_depot_stocks", "eakin_erp_depot_stocks_v2",
        "eakin_erp_collections", "eakin_erp_collections_v2",
        "eakin_erp_returns", "eakin_erp_returns_v2",
      ]
      legacyKeys.forEach((k) => {
        try { localStorage.removeItem(k) } catch (_) {}
      })

      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS)
      if (storedOrders) {
        try {
          const parsedOrders: Order[] = JSON.parse(storedOrders)
          setOrders(parsedOrders)
        } catch (_) {}
      }

      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
      if (storedCustomers) {
        try {
          let parsedCustomers: CustomerItem[] = JSON.parse(storedCustomers)
          // Ensure strictly up to initialCustomers without excess items
          const validIds = new Set(initialCustomers.map((c) => c.id))
          if (parsedCustomers.some((c) => !validIds.has(c.id)) || parsedCustomers.length !== initialCustomers.length) {
            parsedCustomers = initialCustomers
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(initialCustomers))
          }
          setCustomers(parsedCustomers)
        } catch (_) {}
      }

      const storedOfficers = localStorage.getItem(STORAGE_KEYS.OFFICERS)
      if (storedOfficers) {
        try {
          let parsedOfficers: SalesOfficerItem[] = JSON.parse(storedOfficers)
          const validIds = new Set(initialOfficers.map((o) => o.id))
          if (parsedOfficers.some((o) => !validIds.has(o.id)) || parsedOfficers.length !== initialOfficers.length) {
            parsedOfficers = initialOfficers
            localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(initialOfficers))
          }
          setOfficers(parsedOfficers.map((o) => ({ ...o, pin: o.pin || "123456" })))
        } catch (_) {}
      }

      const storedAMs = localStorage.getItem(STORAGE_KEYS.AMS)
      if (storedAMs) {
        try {
          let parsedAMs: AMItem[] = JSON.parse(storedAMs)
          const validIds = new Set(initialAMs.map((a) => a.id))
          if (parsedAMs.some((a) => !validIds.has(a.id)) || parsedAMs.length !== initialAMs.length) {
            parsedAMs = initialAMs
            localStorage.setItem(STORAGE_KEYS.AMS, JSON.stringify(initialAMs))
          }
          setAms(parsedAMs.map((a) => ({ ...a, pin: a.pin || "123456" })))
        } catch (_) {}
      }

      const storedRMs = localStorage.getItem(STORAGE_KEYS.RMS)
      if (storedRMs) {
        try {
          let parsedRMs: RMItem[] = JSON.parse(storedRMs)
          const validIds = new Set(initialRMs.map((r) => r.id))
          if (parsedRMs.some((r) => !validIds.has(r.id)) || parsedRMs.length !== initialRMs.length) {
            parsedRMs = initialRMs
            localStorage.setItem(STORAGE_KEYS.RMS, JSON.stringify(initialRMs))
          }
          setRms(parsedRMs)
        } catch (_) {}
      }

      const storedROs = localStorage.getItem(STORAGE_KEYS.REGIONAL_OFFICES)
      if (storedROs) {
        try {
          let parsedROs: RegionalOffice[] = JSON.parse(storedROs)
          const validIds = new Set(initialRegionalOffices.map((r) => r.id))
          if (parsedROs.some((r) => !validIds.has(r.id)) || parsedROs.length !== initialRegionalOffices.length) {
            parsedROs = initialRegionalOffices
            localStorage.setItem(STORAGE_KEYS.REGIONAL_OFFICES, JSON.stringify(initialRegionalOffices))
          }
          setRegionalOffices(parsedROs)
        } catch (_) {}
      }

      const storedAreas = localStorage.getItem(STORAGE_KEYS.AREAS)
      if (storedAreas) {
        try {
          let parsedAreas: AreaItem[] = JSON.parse(storedAreas)
          const validIds = new Set(initialAreasWithDepot.map((a) => a.id))
          if (parsedAreas.some((a) => !validIds.has(a.id)) || parsedAreas.length !== initialAreasWithDepot.length) {
            parsedAreas = initialAreasWithDepot
            localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(initialAreasWithDepot))
          }
          setAreas(parsedAreas)
        } catch (_) {}
      }

      const storedStocks = localStorage.getItem(STORAGE_KEYS.DEPOT_STOCKS)
      if (storedStocks) setDepotStocks(JSON.parse(storedStocks))

      const storedOfficerId = localStorage.getItem(STORAGE_KEYS.CURRENT_OFFICER_ID)
      if (storedOfficerId && ["off-1", "off-2"].includes(storedOfficerId)) {
        setCurrentOfficerId(storedOfficerId)
      } else {
        setCurrentOfficerId("off-1")
      }

      const storedAMId = localStorage.getItem(STORAGE_KEYS.CURRENT_AM_ID)
      if (storedAMId && ["am-1", "am-2"].includes(storedAMId)) {
        setCurrentAMId(storedAMId)
      } else {
        setCurrentAMId("am-1")
      }

      const storedRMId = localStorage.getItem(STORAGE_KEYS.CURRENT_RM_ID)
      if (storedRMId && ["rm-1", "rm-2"].includes(storedRMId)) {
        setCurrentRMId(storedRMId)
      } else {
        setCurrentRMId("rm-1")
      }

      const storedRole = localStorage.getItem(STORAGE_KEYS.CURRENT_ROLE) as StaffRole | null
      if (storedRole && ["admin", "officer", "am", "rm"].includes(storedRole)) {
        setCurrentRole(storedRole)
      }
    } catch (e) {
      console.error("Error reading localStorage", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Sync state to localStorage
  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders))
    } catch (e) {
      console.error(e)
    }
  }, [orders, isLoaded])

  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers))
    } catch (e) {
      console.error(e)
    }
  }, [customers, isLoaded])

  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEYS.OFFICERS, JSON.stringify(officers))
    } catch (e) {
      console.error(e)
    }
  }, [officers, isLoaded])

  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEYS.AMS, JSON.stringify(ams))
    } catch (e) {
      console.error(e)
    }
  }, [ams, isLoaded])

  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEYS.RMS, JSON.stringify(rms))
    } catch (e) {
      console.error(e)
    }
  }, [rms, isLoaded])

  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEYS.REGIONAL_OFFICES, JSON.stringify(regionalOffices))
    } catch (e) {
      console.error(e)
    }
  }, [regionalOffices, isLoaded])

  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEYS.AREAS, JSON.stringify(areas))
    } catch (e) {
      console.error(e)
    }
  }, [areas, isLoaded])

  React.useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_OFFICER_ID, currentOfficerId)
      localStorage.setItem(STORAGE_KEYS.CURRENT_AM_ID, currentAMId)
      localStorage.setItem(STORAGE_KEYS.CURRENT_RM_ID, currentRMId)
      localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, currentRole)
    } catch (e) {
      console.error(e)
    }
  }, [currentOfficerId, currentAMId, currentRMId, currentRole, isLoaded])

  // Current Staff Objects
  const currentOfficer = React.useMemo(() => {
    return officers.find((o) => o.id === currentOfficerId) || officers[0] || null
  }, [officers, currentOfficerId])

  const currentAM = React.useMemo(() => {
    return ams.find((a) => a.id === currentAMId) || ams[0] || null
  }, [ams, currentAMId])

  const currentRM = React.useMemo(() => {
    return rms.find((r) => r.id === currentRMId) || rms[0] || null
  }, [rms, currentRMId])

  // Unified Staff Login (Phone & 6-digit PIN)
  const loginStaff = React.useCallback(
    (phoneOrCode: string, pin: string): StaffLoginResult => {
      const raw = phoneOrCode.trim().toLowerCase()
      const digits = phoneOrCode.replace(/\D/g, "")
      const cleanPin = pin.trim()

      if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
        return {
          success: false,
          error: "PIN must be exactly 6 numeric digits.",
        }
      }

      // Helper for phone matching
      const matchPhone = (userPhone: string) => {
        const uDigits = userPhone.replace(/\D/g, "")
        if (digits.length >= 10 && uDigits.length >= 10) {
          return uDigits.endsWith(digits.slice(-10)) || digits.endsWith(uDigits.slice(-10))
        }
        return digits.length > 0 && uDigits === digits
      }

      // 1. Check Officers
      const matchedOfficer = officers.find((o) => {
        return (
          matchPhone(o.phone) ||
          o.code.toLowerCase() === raw ||
          o.email.toLowerCase() === raw ||
          (digits === "01711000111" && o.id === "off-1")
        )
      })

      if (matchedOfficer) {
        const validPin = matchedOfficer.pin || "123456"
        if (cleanPin !== validPin) {
          return {
            success: false,
            error: "Incorrect 6-digit PIN. Please enter your valid PIN.",
          }
        }

        setCurrentRole("officer")
        setCurrentOfficerId(matchedOfficer.id)
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, "officer")
          localStorage.setItem(STORAGE_KEYS.CURRENT_OFFICER_ID, matchedOfficer.id)
        }
        return {
          success: true,
          role: "officer",
          user: matchedOfficer,
        }
      }

      // 2. Check Area Managers (AM)
      const matchedAM = ams.find((a) => {
        return (
          matchPhone(a.phone) ||
          a.code.toLowerCase() === raw ||
          a.email.toLowerCase() === raw ||
          (digits === "01722100200" && a.id === "am-1")
        )
      })

      if (matchedAM) {
        const validPin = matchedAM.pin || "123456"
        if (cleanPin !== validPin) {
          return {
            success: false,
            error: "Incorrect 6-digit PIN. Please enter your valid PIN.",
          }
        }

        setCurrentRole("am")
        setCurrentAMId(matchedAM.id)
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, "am")
          localStorage.setItem(STORAGE_KEYS.CURRENT_AM_ID, matchedAM.id)
        }
        return {
          success: true,
          role: "am",
          user: matchedAM,
        }
      }

      // 3. Check Regional Managers (RM)
      const matchedRM = rms.find((r) => {
        return (
          matchPhone(r.phone) ||
          r.code.toLowerCase() === raw ||
          r.email.toLowerCase() === raw ||
          (digits === "01712111222" && r.id === "rm-1")
        )
      })

      if (matchedRM) {
        const validPin = matchedRM.pin || "123456"
        if (cleanPin !== validPin) {
          return {
            success: false,
            error: "Incorrect 6-digit PIN. Please enter your valid PIN.",
          }
        }

        setCurrentRole("rm")
        setCurrentRMId(matchedRM.id)
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, "rm")
          localStorage.setItem(STORAGE_KEYS.CURRENT_RM_ID, matchedRM.id)
        }
        return {
          success: true,
          role: "rm",
          user: matchedRM,
        }
      }

      return {
        success: false,
        error: "No active Officer, AM, or RM account found matching this Phone Number.",
      }
    },
    [officers, ams, rms]
  )

  // Legacy officer login
  const loginOfficer = React.useCallback(
    (emailOrCode: string): SalesOfficerItem | null => {
      const query = emailOrCode.trim().toLowerCase()
      const digits = emailOrCode.replace(/\D/g, "")
      const found = officers.find(
        (o) =>
          o.email.toLowerCase() === query ||
          o.code.toLowerCase() === query ||
          o.id.toLowerCase() === query ||
          (digits.length >= 10 && o.phone.replace(/\D/g, "") === digits)
      )
      if (found) {
        setCurrentRole("officer")
        setCurrentOfficerId(found.id)
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.CURRENT_ROLE, "officer")
          localStorage.setItem(STORAGE_KEYS.CURRENT_OFFICER_ID, found.id)
        }
        return found
      }
      return null
    },
    [officers]
  )

  const logoutOfficer = React.useCallback(() => {
    setCurrentRole("officer")
    setCurrentOfficerId("off-1")
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_OFFICER_ID)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE)
    }
  }, [])

  const logoutStaff = React.useCallback(() => {
    setCurrentRole("officer")
    setCurrentOfficerId("off-1")
    setCurrentAMId("am-1")
    setCurrentRMId("rm-1")
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_OFFICER_ID)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_AM_ID)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_RM_ID)
      localStorage.removeItem(STORAGE_KEYS.CURRENT_ROLE)
    }
  }, [])

  const setCurrentOfficer = React.useCallback((officer: SalesOfficerItem | null) => {
    if (officer) {
      setCurrentOfficerId(officer.id)
    }
  }, [])

  const setCurrentAM = React.useCallback((am: AMItem | null) => {
    if (am) {
      setCurrentAMId(am.id)
    }
  }, [])

  const setCurrentRM = React.useCallback((rm: RMItem | null) => {
    if (rm) {
      setCurrentRMId(rm.id)
    }
  }, [])

  // Verify and change PIN for currently logged in staff
  const verifyAndChangePin = React.useCallback(
    (
      role: StaffRole,
      id: string,
      currentPin: string,
      newPin: string
    ): { success: boolean; message: string } => {
      const cleanCurrent = currentPin.trim()
      const cleanNew = newPin.trim()

      if (!cleanNew || cleanNew.length !== 6 || !/^\d{6}$/.test(cleanNew)) {
        return {
          success: false,
          message: "New PIN must be exactly 6 numeric digits.",
        }
      }

      if (role === "officer") {
        const off = officers.find((o) => o.id === id)
        if (!off) return { success: false, message: "Officer account not found." }
        const expectedPin = off.pin || "123456"
        if (cleanCurrent !== expectedPin) {
          return { success: false, message: "Current PIN is incorrect. Please enter your existing 6-digit PIN." }
        }
        setOfficers((prev) =>
          prev.map((o) => (o.id === id ? { ...o, pin: cleanNew } : o))
        )
        return { success: true, message: "PIN changed successfully! Use this new PIN for future logins." }
      }

      if (role === "am") {
        const am = ams.find((a) => a.id === id)
        if (!am) return { success: false, message: "AM account not found." }
        const expectedPin = am.pin || "123456"
        if (cleanCurrent !== expectedPin) {
          return { success: false, message: "Current PIN is incorrect. Please enter your existing 6-digit PIN." }
        }
        setAms((prev) =>
          prev.map((a) => (a.id === id ? { ...a, pin: cleanNew } : a))
        )
        return { success: true, message: "PIN changed successfully! Use this new PIN for future logins." }
      }

      if (role === "rm") {
        const rm = rms.find((r) => r.id === id)
        if (!rm) return { success: false, message: "RM account not found." }
        const expectedPin = rm.pin || "123456"
        if (cleanCurrent !== expectedPin) {
          return { success: false, message: "Current PIN is incorrect. Please enter your existing 6-digit PIN." }
        }
        setRms((prev) =>
          prev.map((r) => (r.id === id ? { ...r, pin: cleanNew } : r))
        )
        return { success: true, message: "PIN changed successfully! Use this new PIN for future logins." }
      }

      return { success: false, message: "Invalid role specified." }
    },
    [officers, ams, rms]
  )

  // Staff CRUD Mutations
  const addOfficer = React.useCallback(
    (offData: Omit<SalesOfficerItem, "id">): SalesOfficerItem => {
      const newOff: SalesOfficerItem = {
        ...offData,
        id: `off-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pin: offData.pin || "123456",
        totalOrders: 0,
        totalSales: 0,
      }
      setOfficers((prev) => [newOff, ...prev])
      return newOff
    },
    []
  )

  const updateOfficer = React.useCallback(
    (id: string, updates: Partial<SalesOfficerItem>) => {
      setOfficers((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)))
    },
    []
  )

  const deleteOfficer = React.useCallback((id: string) => {
    setOfficers((prev) => prev.filter((o) => o.id !== id))
  }, [])

  const addAM = React.useCallback(
    (amData: Omit<AMItem, "id">): AMItem => {
      const newAM: AMItem = {
        ...amData,
        id: `am-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pin: amData.pin || "123456",
      }
      setAms((prev) => [newAM, ...prev])
      return newAM
    },
    []
  )

  const updateAM = React.useCallback((id: string, updates: Partial<AMItem>) => {
    setAms((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }, [])

  const deleteAM = React.useCallback((id: string) => {
    setAms((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // Regional Office Mutations (Admin)
  const addRegionalOffice = React.useCallback(
    (roData: Omit<RegionalOffice, "id">): RegionalOffice => {
      const newRO: RegionalOffice = {
        ...roData,
        id: `ro-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      }
      setRegionalOffices((prev) => [newRO, ...prev])
      return newRO
    },
    []
  )

  const updateRegionalOffice = React.useCallback(
    (id: string, updates: Partial<RegionalOffice>) => {
      setRegionalOffices((prev) => prev.map((ro) => (ro.id === id ? { ...ro, ...updates } : ro)))
    },
    []
  )

  const deleteRegionalOffice = React.useCallback((id: string) => {
    setRegionalOffices((prev) => prev.filter((ro) => ro.id !== id))
  }, [])

  // Area Mutations (Admin)
  const addArea = React.useCallback(
    (areaData: Omit<AreaItem, "id">): AreaItem => {
      const newArea: AreaItem = {
        ...areaData,
        id: `area-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      }
      setAreas((prev) => [newArea, ...prev])
      return newArea
    },
    []
  )

  const updateArea = React.useCallback((id: string, updates: Partial<AreaItem>) => {
    setAreas((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)))
  }, [])

  const deleteArea = React.useCallback((id: string) => {
    setAreas((prev) => prev.filter((a) => a.id !== id))
  }, [])

  const addRM = React.useCallback(
    (rmData: Omit<RMItem, "id">): RMItem => {
      const newRM: RMItem = {
        ...rmData,
        id: `rm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        pin: rmData.pin || "123456",
      }
      setRms((prev) => {
        const targetROId = newRM.regionalOfficeId
        const updated = prev.map((r) => {
          if (targetROId && r.regionalOfficeId === targetROId) {
            return { ...r, regionalOfficeId: "", regionalOfficeName: "" }
          }
          return r
        })
        return [newRM, ...updated]
      })
      return newRM
    },
    []
  )

  const updateRM = React.useCallback((id: string, updates: Partial<RMItem>) => {
    setRms((prev) => {
      const targetROId = updates.regionalOfficeId
      return prev.map((r) => {
        if (r.id === id) {
          return { ...r, ...updates }
        }
        if (targetROId && r.regionalOfficeId === targetROId) {
          return { ...r, regionalOfficeId: "", regionalOfficeName: "" }
        }
        return r
      })
    })
  }, [])

  const deleteRM = React.useCallback((id: string) => {
    setRms((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const assignRMToRegionalOffice = React.useCallback(
    (roId: string, rmId: string | null) => {
      setRms((prev) => {
        const targetRO = regionalOffices.find((o) => o.id === roId)
        const roName = targetRO ? targetRO.name : ""
        return prev.map((r) => {
          if (rmId && r.id === rmId) {
            return { ...r, regionalOfficeId: roId, regionalOfficeName: roName }
          }
          if (r.regionalOfficeId === roId) {
            return { ...r, regionalOfficeId: "", regionalOfficeName: "" }
          }
          return r
        })
      })
    },
    [regionalOffices]
  )

  // Helper: Retrieve Depots available for an MPO based on RM connected depots
  const getOfficerAvailableDepots = React.useCallback(
    (officerId: string): Depot[] => {
      const off = officers.find((o) => o.id === officerId)
      if (!off) return depots

      // Priority 1: Match directly via RM on officer
      let rm = rms.find((r) => r.id === off.rmId)

      // Priority 2: Match via AM -> RM
      if (!rm && off.amId) {
        const am = ams.find((a) => a.id === off.amId)
        if (am && am.rmId) {
          rm = rms.find((r) => r.id === am.rmId)
        }
      }

      // Priority 3: Match via Area -> Regional Office -> RM
      if (!rm && off.areaId) {
        const area = areas.find((a) => a.id === off.areaId)
        if (area && area.regionalOfficeId) {
          rm = rms.find((r) => r.regionalOfficeId === area.regionalOfficeId)
        }
      }

      if (rm && Array.isArray(rm.depotIds) && rm.depotIds.length > 0) {
        const connected = depots.filter((d) => rm!.depotIds.includes(d.id))
        if (connected.length > 0) return connected
      }

      return depots.length > 0 ? [depots[0]] : []
    },
    [officers, rms, ams, areas, depots]
  )

  // Helper: Find officer default assigned depot through available depots
  const getOfficerAssignedDepot = React.useCallback(
    (officerId: string): Depot | null => {
      const available = getOfficerAvailableDepots(officerId)
      return available[0] || depots[0] || null
    },
    [getOfficerAvailableDepots, depots]
  )

  // Order Mutations
  const createOrder = React.useCallback(
    (orderData: Omit<Order, "id" | "code" | "date" | "status">): Order => {
      // Find highest invoice number
      let nextNum = orders.length + 1
      const generatedCode = `INV-2026-${String(nextNum).padStart(3, "0")}`

      const newOrder: Order = {
        ...orderData,
        id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        code: generatedCode,
        date: formatDateTime(new Date()),
        status: "Pending",
        paidAmount: 0,
        dueAmount: orderData.grandTotal,
        returnedAmount: 0,
        paymentStatus: "Unpaid",
      }

      setOrders((prev) => [newOrder, ...prev])
      return newOrder
    },
    [orders]
  )

  const approveOrder = React.useCallback(
    (orderId: string, adminDiscountPercent: number, bonusItems?: Order["bonusItems"]) => {
      const approvedAt = formatDateTime(new Date())

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id !== orderId) return o

          const officerDisc = o.officerDiscountPercent ?? 2.5
          const totalDiscountPercent = Math.round((officerDisc + adminDiscountPercent) * 100) / 100
          const discountAmount = Math.round(((o.subtotal * totalDiscountPercent) / 100) * 100) / 100
          const grandTotal = Math.max(0, o.subtotal - discountAmount)

          return {
            ...o,
            status: "Approved",
            adminDiscountPercent,
            discountPercent: totalDiscountPercent,
            discountAmount,
            grandTotal,
            dueAmount: grandTotal,
            bonusItems: bonusItems && bonusItems.length > 0 ? bonusItems : o.bonusItems,
            approvedAt,
          }
        })
      )
    },
    []
  )

  const cancelOrder = React.useCallback((orderId: string) => {
    const cancelledAt = formatDateTime(new Date())
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled", cancelledAt } : o))
    )
  }, [])

  // Customer Mutations (for Admin actions)
  const addCustomer = React.useCallback(
    (custData: Omit<CustomerItem, "id">): CustomerItem => {
      const newCust: CustomerItem = {
        ...custData,
        id: `cust-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        totalOrders: 0,
        totalSpent: 0,
        outstandingBalance: 0,
      }
      setCustomers((prev) => [newCust, ...prev])
      return newCust
    },
    []
  )

  const updateCustomer = React.useCallback((id: string, updates: Partial<CustomerItem>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }, [])

  const deleteCustomer = React.useCallback((id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const addCollection = React.useCallback(
    (col: Omit<CollectionItem, "id" | "code" | "date">): CollectionItem => {
      const newCol: CollectionItem = {
        ...col,
        id: `col-${Date.now()}`,
        code: `COL-${String(collections.length + 1).padStart(3, "0")}`,
        date: new Date().toISOString().split("T")[0],
      }
      setCollections((prev) => [newCol, ...prev])
      return newCol
    },
    [collections.length]
  )

  const addProductReturn = React.useCallback(
    (ret: Omit<ProductReturnItem, "id" | "code" | "date">): ProductReturnItem => {
      const newRet: ProductReturnItem = {
        ...ret,
        id: `ret-${Date.now()}`,
        code: `RET-${String(productReturns.length + 1).padStart(3, "0")}`,
        date: new Date().toISOString().split("T")[0],
      }
      setProductReturns((prev) => [newRet, ...prev])
      return newRet
    },
    [productReturns.length]
  )

  const addStockTransfer = React.useCallback(
    (transfer: Omit<StockTransfer, "id" | "code" | "date" | "status">): StockTransfer => {
      const newTransfer: StockTransfer = {
        ...transfer,
        id: `tr-${Date.now()}`,
        code: `TR-${String(transfers.length + 1).padStart(3, "0")}`,
        date: new Date().toISOString().split("T")[0],
        status: "Completed",
      }
      setTransfers((prev) => [newTransfer, ...prev])
      return newTransfer
    },
    [transfers.length]
  )

  const addStockMovement = React.useCallback(
    (movement: Omit<StockMovement, "id" | "date">): StockMovement => {
      const newMovement: StockMovement = {
        ...movement,
        id: `sm-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
      }
      setMovements((prev) => [newMovement, ...prev])
      return newMovement
    },
    []
  )

  return (
    <AppStateContext.Provider
      value={{
        orders,
        customers,
        officers,
        depots,
        depotStocks,
        regionalOffices,
        areas,
        rms,
        ams,
        catalog,
        collections,
        productReturns,
        transfers,
        movements,
        currentRole,
        setCurrentRole,
        currentOfficer,
        setCurrentOfficer,
        currentAM,
        setCurrentAM,
        currentRM,
        setCurrentRM,
        loginStaff,
        loginOfficer,
        logoutOfficer,
        logoutStaff,
        verifyAndChangePin,
        addRegionalOffice,
        updateRegionalOffice,
        deleteRegionalOffice,
        addArea,
        updateArea,
        deleteArea,
        addOfficer,
        updateOfficer,
        deleteOfficer,
        addAM,
        updateAM,
        deleteAM,
        addRM,
        updateRM,
        deleteRM,
        assignRMToRegionalOffice,
        createOrder,
        approveOrder,
        cancelOrder,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addCollection,
        addProductReturn,
        addStockTransfer,
        addStockMovement,
        getOfficerAssignedDepot,
        getOfficerAvailableDepots,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const context = React.useContext(AppStateContext)
  if (!context) {
    throw new Error("useAppState must be used within an AppStateProvider")
  }
  return context
}
