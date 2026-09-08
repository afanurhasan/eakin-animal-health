"use client"

import * as React from "react"
import {
  initialOrders,
  initialCustomers,
  initialOfficers,
  initialDepots,
  initialDepotStocks,
  initialAreasWithDepot,
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
  type Depot,
  type DepotStockItem,
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
  ORDERS: "eakin_erp_orders_v1",
  CUSTOMERS: "eakin_erp_customers_v1",
  OFFICERS: "eakin_erp_officers_v1",
  DEPOT_STOCKS: "eakin_erp_depot_stocks_v1",
  COLLECTIONS: "eakin_erp_collections_v1",
  PRODUCT_RETURNS: "eakin_erp_returns_v1",
  CURRENT_OFFICER_ID: "eakin_erp_current_officer_id_v1",
}

interface AppStateContextType {
  // Entities
  orders: Order[]
  customers: CustomerItem[]
  officers: SalesOfficerItem[]
  depots: Depot[]
  depotStocks: Record<string, DepotStockItem[]>
  areas: AreaItem[]
  rms: RMItem[]
  ams: AMItem[]
  catalog: Product[]
  collections: CollectionItem[]
  productReturns: ProductReturnItem[]
  transfers: StockTransfer[]
  movements: StockMovement[]

  // Officer Auth
  currentOfficer: SalesOfficerItem | null
  setCurrentOfficer: (officer: SalesOfficerItem | null) => void
  loginOfficer: (emailOrCode: string) => SalesOfficerItem | null
  logoutOfficer: () => void

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

  // Helpers
  getOfficerAssignedDepot: (officerId: string) => Depot | null
}

const AppStateContext = React.createContext<AppStateContextType | undefined>(undefined)

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [isLoaded, setIsLoaded] = React.useState(false)

  // Core State
  const [orders, setOrders] = React.useState<Order[]>(initialOrders)
  const [customers, setCustomers] = React.useState<CustomerItem[]>(initialCustomers)
  const [officers] = React.useState<SalesOfficerItem[]>(initialOfficers)
  const [depots] = React.useState<Depot[]>(initialDepots)
  const [depotStocks, setDepotStocks] = React.useState<Record<string, DepotStockItem[]>>(initialDepotStocks)
  const [areas] = React.useState<AreaItem[]>(initialAreasWithDepot)
  const [rms] = React.useState<RMItem[]>(initialRMs)
  const [ams] = React.useState<AMItem[]>(initialAMs)
  const [catalog] = React.useState<Product[]>(productCatalog)
  const [collections, setCollections] = React.useState<CollectionItem[]>(initialCollections)
  const [productReturns, setProductReturns] = React.useState<ProductReturnItem[]>(initialProductReturns)
  const [transfers] = React.useState<StockTransfer[]>(initialTransfers)
  const [movements] = React.useState<StockMovement[]>(initialStockMovements)

  // Current Officer Session (Default to Officer 1: Arafat Hossain)
  const [currentOfficerId, setCurrentOfficerId] = React.useState<string>("off-1")

  // Hydrate from localStorage on mount
  React.useEffect(() => {
    try {
      const storedOrders = localStorage.getItem(STORAGE_KEYS.ORDERS)
      if (storedOrders) setOrders(JSON.parse(storedOrders))

      const storedCustomers = localStorage.getItem(STORAGE_KEYS.CUSTOMERS)
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers))

      const storedStocks = localStorage.getItem(STORAGE_KEYS.DEPOT_STOCKS)
      if (storedStocks) setDepotStocks(JSON.parse(storedStocks))

      const storedOfficerId = localStorage.getItem(STORAGE_KEYS.CURRENT_OFFICER_ID)
      if (storedOfficerId) setCurrentOfficerId(storedOfficerId)
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
      localStorage.setItem(STORAGE_KEYS.CURRENT_OFFICER_ID, currentOfficerId)
    } catch (e) {
      console.error(e)
    }
  }, [currentOfficerId, isLoaded])

  // Current Officer Object
  const currentOfficer = React.useMemo(() => {
    return officers.find((o) => o.id === currentOfficerId) || officers[0] || null
  }, [officers, currentOfficerId])

  // Officer Login
  const loginOfficer = React.useCallback(
    (emailOrCode: string): SalesOfficerItem | null => {
      const query = emailOrCode.trim().toLowerCase()
      const found = officers.find(
        (o) =>
          o.email.toLowerCase() === query ||
          o.code.toLowerCase() === query ||
          o.id.toLowerCase() === query
      )
      if (found) {
        setCurrentOfficerId(found.id)
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.CURRENT_OFFICER_ID, found.id)
        }
        return found
      }
      return null
    },
    [officers]
  )

  const logoutOfficer = React.useCallback(() => {
    // default to off-1
    setCurrentOfficerId("off-1")
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_OFFICER_ID)
    }
  }, [])

  const setCurrentOfficer = React.useCallback((officer: SalesOfficerItem | null) => {
    if (officer) {
      setCurrentOfficerId(officer.id)
    }
  }, [])

  // Helper: Find officer assigned depot through area hierarchy
  const getOfficerAssignedDepot = React.useCallback(
    (officerId: string): Depot | null => {
      const off = officers.find((o) => o.id === officerId)
      if (!off) return depots[0] || null
      const area = areas.find((a) => a.id === off.areaId)
      if (!area) return depots[0] || null
      const depot = depots.find((d) => d.id === area.depotId)
      return depot || depots[0] || null
    },
    [officers, areas, depots]
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

  return (
    <AppStateContext.Provider
      value={{
        orders,
        customers,
        officers,
        depots,
        depotStocks,
        areas,
        rms,
        ams,
        catalog,
        collections,
        productReturns,
        transfers,
        movements,
        currentOfficer,
        setCurrentOfficer,
        loginOfficer,
        logoutOfficer,
        createOrder,
        approveOrder,
        cancelOrder,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        getOfficerAssignedDepot,
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
