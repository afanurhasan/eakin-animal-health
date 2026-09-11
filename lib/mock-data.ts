export const PACK_SIZES = [
  "50gm",
  "100gm",
  "500gm",
  "100ml",
  "500ml",
  "1LT.",
  "3LT.",
  "5LT.",
] as const

export type PackSize = (typeof PACK_SIZES)[number] | string

export interface Depot {
  id: string
  code: string
  name: string
  location: string
  totalItems?: number
}

export interface Product {
  id: string
  code: string
  name: string
  packSize: string
  buyPrice: number
  sellPrice: number
  price: number // alias/backward compatibility for sellPrice
}

export interface DepotStockItem {
  productId: string
  productCode: string
  productName: string
  packSize: string
  quantity: number
  minThreshold: number
}

export interface OrderItem {
  id: string
  productId: string
  productCode: string
  productName: string
  packSize: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface BonusOrderItem {
  id: string
  productId: string
  productCode: string
  productName: string
  packSize: string
  quantity: number
}

export type OrderStatus = "Pending" | "Approved" | "Cancelled"

export interface Order {
  id: string
  code: string
  date: string
  customerId: string
  customerCode: string
  customerName: string
  shopName: string
  phone: string
  address: string
  officerId: string
  officerCode: string
  officerName: string
  depotId: string
  depotName: string
  items: OrderItem[]
  totalItems: number
  subtotal: number
  officerDiscountPercent?: number
  adminDiscountPercent?: number
  discountPercent: number
  discountAmount: number
  grandTotal: number
  paidAmount?: number
  dueAmount?: number
  returnedAmount?: number
  paymentStatus?: "Unpaid" | "Partially Paid" | "Paid"
  status: OrderStatus
  bonusItems?: BonusOrderItem[]
  approvedAt?: string
  cancelledAt?: string
}

export interface InvoiceAllocation {
  orderId: string
  orderCode: string
  orderDate: string
  originalGrandTotal: number
  allocatedAmount: number
  remainingDue: number
  previousDue: number
}

export interface CollectionItem {
  id: string
  code: string // e.g., "COL-2026-001"
  customerId: string
  customerCode: string
  customerName: string
  shopName: string
  date: string
  amount: number
  paymentMethod?: string
  allocations: InvoiceAllocation[]
  recordedBy?: string
  note?: string
}

export interface ReturnProductRow {
  productId: string
  productCode: string
  productName: string
  packSize: string
  unitPrice: number
  deliveredQuantity: number
  returnedQuantity: number
  returnAmount: number
}

export interface ProductReturnItem {
  id: string
  code: string // e.g., "RET-2026-001"
  customerId: string
  customerCode: string
  customerName: string
  shopName: string
  orderId?: string
  orderCode?: string
  orderDate?: string
  depotId: string
  depotName: string
  items: ReturnProductRow[]
  totalReturnedQuantity: number
  totalReturnAmount: number
  date: string
  reason?: string
  recordedBy: string
}

export interface StockMovement {
  id: string
  date: string
  movementType?: "Stock Added" | "Transfer Out" | "Transfer In" | "Return"
  depotId: string
  depotName: string
  productId: string
  productCode: string
  productName: string
  packSize: string
  quantity: number
  balance?: number
  customerId?: string
  customerCode?: string
  customerName?: string
  reference?: string
}

export interface TransferProductItem {
  productId: string
  productCode: string
  productName: string
  packSize: string
  quantity: number
}

export interface StockTransfer {
  id: string
  code: string // e.g. "TRF-000001"
  sourceDepotId: string
  sourceDepotName: string
  destinationDepotId: string
  destinationDepotName: string
  items: TransferProductItem[]
  totalQuantity: number
  totalProducts: number
  date: string
  status: "Completed"
}

export interface RegionalOffice {
  id: string
  code: string
  name: string
  location?: string
  depotId: string
  depotName?: string
}

export interface AreaItem {
  id: string
  code: string
  name: string
  regionalOfficeId: string
  regionalOfficeName?: string
  depotId?: string
  depotName?: string
}

export interface RMItem {
  id: string
  code: string
  name: string
  phone: string
  email: string
  pin?: string
  regionalOfficeId: string
  regionalOfficeName: string
  depotIds: string[]
  depotNames?: string[]
  areaId?: string
  areaName?: string
}

export interface AMItem {
  id: string
  code: string
  name: string
  phone: string
  email: string
  pin?: string
  areaId: string
  areaName: string
  rmId: string
  rmName: string
}

export interface SalesOfficerItem {
  id: string
  code: string
  name: string
  phone: string
  email: string
  pin?: string
  areaId: string
  areaName: string
  rmId: string
  rmName: string
  amId: string
  amName: string
  totalOrders?: number
  totalSales?: number
}

// Business Terminology Alias: Sales Officer is MPO
export type MPOItem = SalesOfficerItem

export interface CustomerItem {
  id: string
  code: string
  name: string
  shopName: string
  phone: string
  email?: string
  address: string
  areaId: string
  areaName: string
  rmId: string
  rmName: string
  amId: string
  amName: string
  officerId: string
  officerName: string
  creditLimit?: number
  outstandingBalance?: number
  totalOrders?: number
  totalSpent?: number
}

// Backward compatibility alias
export type OfficerCustomerItem = CustomerItem

// Initial Depots
export const initialDepots: Depot[] = [
  {
    id: "dep-1",
    code: "DEP-BOG-01",
    name: "Bogura Depot",
    location: "Sherpur Road, Bogura",
  },
  {
    id: "dep-2",
    code: "DEP-RAN-01",
    name: "Rangpur Depot",
    location: "Station Road, Rangpur",
  },
]

// Initial Regional Offices
export const initialRegionalOffices: RegionalOffice[] = [
  {
    id: "ro-1",
    code: "RO-BOG-01",
    name: "Bogura Regional Office",
    location: "Sherpur Road, Bogura",
    depotId: "dep-1",
    depotName: "Bogura Depot",
  },
  {
    id: "ro-2",
    code: "RO-RAN-01",
    name: "Rangpur Regional Office",
    location: "Station Road, Rangpur",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
  },
]

// Animal Health Veterinary Products Catalog (Mapped from Client Spec)
export const productCatalog: Product[] = [
  {
    id: "prod-1",
    code: "EAK-EFL-100",
    name: "Eflor 20",
    packSize: "100ml",
    buyPrice: 620,
    sellPrice: 780,
    price: 780,
  },
  {
    id: "prod-2",
    code: "EAK-EFL-500",
    name: "Eflor 20",
    packSize: "500ml",
    buyPrice: 2300,
    sellPrice: 2880,
    price: 2880,
  },
  {
    id: "prod-3",
    code: "EAK-MAX-100",
    name: "Maxtil plus",
    packSize: "100ml",
    buyPrice: 540,
    sellPrice: 680,
    price: 680,
  },
  {
    id: "prod-4",
    code: "EAK-MAX-500",
    name: "Maxtil plus",
    packSize: "500ml",
    buyPrice: 2240,
    sellPrice: 2800,
    price: 2800,
  },
  {
    id: "prod-5",
    code: "EAK-SNE-500",
    name: "S neo pro",
    packSize: "500gm",
    buyPrice: 1135,
    sellPrice: 1420,
    price: 1420,
  },
  {
    id: "prod-6",
    code: "EAK-EST-100",
    name: "EST 30",
    packSize: "100gm",
    buyPrice: 310,
    sellPrice: 390,
    price: 390,
  },
  {
    id: "prod-7",
    code: "EAK-EBA-050",
    name: "Ebac plu",
    packSize: "50gm",
    buyPrice: 95,
    sellPrice: 120,
    price: 120,
  },
  {
    id: "prod-8",
    code: "EAK-ALV-1LT",
    name: "Anti LV",
    packSize: "1LT.",
    buyPrice: 800,
    sellPrice: 1010,
    price: 1010,
  },
  {
    id: "prod-9",
    code: "EAK-XEV-1LT",
    name: "Xinc E vet",
    packSize: "1LT.",
    buyPrice: 175,
    sellPrice: 220,
    price: 220,
  },
  {
    id: "prod-10",
    code: "EAK-XEV-3LT",
    name: "Xinc E vet",
    packSize: "3LT.",
    buyPrice: 440,
    sellPrice: 550,
    price: 550,
  },
  {
    id: "prod-11",
    code: "EAK-XBZ-1LT",
    name: "Xinc BZ",
    packSize: "1LT.",
    buyPrice: 260,
    sellPrice: 330,
    price: 330,
  },
  {
    id: "prod-12",
    code: "EAK-URI-100",
    name: "Urinill",
    packSize: "100ml",
    buyPrice: 215,
    sellPrice: 270,
    price: 270,
  },
  {
    id: "prod-13",
    code: "EAK-URI-500",
    name: "Urinill",
    packSize: "500ml",
    buyPrice: 920,
    sellPrice: 1150,
    price: 1150,
  },
  {
    id: "prod-14",
    code: "EAK-CAL-5LT",
    name: "Callwell P",
    packSize: "5LT.",
    buyPrice: 1160,
    sellPrice: 1450,
    price: 1450,
  },
  {
    id: "prod-15",
    code: "EAK-HEA-1LT",
    name: "Heatcon",
    packSize: "1LT.",
    buyPrice: 650,
    sellPrice: 810,
    price: 810,
  },
  {
    id: "prod-16",
    code: "EAK-CYT-100",
    name: "Cytoliv",
    packSize: "100ml",
    buyPrice: 120,
    sellPrice: 150,
    price: 150,
  },
  {
    id: "prod-17",
    code: "EAK-CYT-1LT",
    name: "Cytoliv",
    packSize: "1LT.",
    buyPrice: 1020,
    sellPrice: 1280,
    price: 1280,
  },
  {
    id: "prod-18",
    code: "EAK-IMG-100",
    name: "Imugin",
    packSize: "100gm",
    buyPrice: 400,
    sellPrice: 510,
    price: 510,
  },
  {
    id: "prod-19",
    code: "EAK-IMG-G100",
    name: "Imu G",
    packSize: "100gm",
    buyPrice: 520,
    sellPrice: 650,
    price: 650,
  },
]

// Initial Stock per Depot
export const initialDepotStocks: Record<string, DepotStockItem[]> = {
  "dep-1": [
    {
      productId: "prod-1",
      productCode: "EAK-EFL-100",
      productName: "Eflor 20",
      packSize: "100ml",
      quantity: 500,
      minThreshold: 50,
    },
    {
      productId: "prod-2",
      productCode: "EAK-EFL-500",
      productName: "Eflor 20",
      packSize: "500ml",
      quantity: 300,
      minThreshold: 30,
    },
    {
      productId: "prod-3",
      productCode: "EAK-MAX-100",
      productName: "Maxtil plus",
      packSize: "100ml",
      quantity: 800,
      minThreshold: 40,
    },
    {
      productId: "prod-4",
      productCode: "EAK-MAX-500",
      productName: "Maxtil plus",
      packSize: "500ml",
      quantity: 200,
      minThreshold: 25,
    },
    {
      productId: "prod-5",
      productCode: "EAK-SNE-500",
      productName: "S neo pro",
      packSize: "500gm",
      quantity: 150,
      minThreshold: 20,
    },
    {
      productId: "prod-8",
      productCode: "EAK-ALV-1LT",
      productName: "Anti LV",
      packSize: "1LT.",
      quantity: 600,
      minThreshold: 50,
    },
  ],
  "dep-2": [
    {
      productId: "prod-1",
      productCode: "EAK-EFL-100",
      productName: "Eflor 20",
      packSize: "100ml",
      quantity: 160,
      minThreshold: 40,
    },
    {
      productId: "prod-2",
      productCode: "EAK-EFL-500",
      productName: "Eflor 20",
      packSize: "500ml",
      quantity: 95,
      minThreshold: 25,
    },
    {
      productId: "prod-3",
      productCode: "EAK-MAX-100",
      productName: "Maxtil plus",
      packSize: "100ml",
      quantity: 110,
      minThreshold: 30,
    },
    {
      productId: "prod-14",
      productCode: "EAK-CAL-5LT",
      productName: "Callwell P",
      packSize: "5LT.",
      quantity: 75,
      minThreshold: 15,
    },
    {
      productId: "prod-18",
      productCode: "EAK-IMG-100",
      productName: "Imugin",
      packSize: "100gm",
      quantity: 130,
      minThreshold: 30,
    },
  ],
}

// Initial Stock Transfers History (Depot-to-Depot Multi-Product Transfers)
export const initialTransfers: StockTransfer[] = [
  {
    id: "tx-101",
    code: "TRF-000001",
    sourceDepotId: "dep-1",
    sourceDepotName: "Bogura Depot",
    destinationDepotId: "dep-2",
    destinationDepotName: "Rangpur Depot",
    items: [
      {
        productId: "prod-1",
        productCode: "EAK-EFL-100",
        productName: "Eflor 20",
        packSize: "100ml",
        quantity: 100,
      },
      {
        productId: "prod-2",
        productCode: "EAK-EFL-500",
        productName: "Eflor 20",
        packSize: "500ml",
        quantity: 50,
      },
      {
        productId: "prod-3",
        productCode: "EAK-MAX-100",
        productName: "Maxtil plus",
        packSize: "100ml",
        quantity: 200,
      },
      {
        productId: "prod-4",
        productCode: "EAK-MAX-500",
        productName: "Maxtil plus",
        packSize: "500ml",
        quantity: 30,
      },
    ],
    totalQuantity: 380,
    totalProducts: 4,
    date: "03/09/2026, 10:30 AM",
    status: "Completed",
  },
  {
    id: "tx-102",
    code: "TRF-000002",
    sourceDepotId: "dep-2",
    sourceDepotName: "Rangpur Depot",
    destinationDepotId: "dep-1",
    destinationDepotName: "Bogura Depot",
    items: [
      {
        productId: "prod-14",
        productCode: "EAK-CAL-5LT",
        productName: "Callwell P",
        packSize: "5LT.",
        quantity: 40,
      },
      {
        productId: "prod-18",
        productCode: "EAK-IMG-100",
        productName: "Imugin",
        packSize: "100GM",
        quantity: 60,
      },
    ],
    totalQuantity: 100,
    totalProducts: 2,
    date: "02/09/2026, 03:15 PM",
    status: "Completed",
  },
  {
    id: "tx-103",
    code: "TRF-000003",
    sourceDepotId: "dep-2",
    sourceDepotName: "Rangpur Depot",
    destinationDepotId: "dep-1",
    destinationDepotName: "Bogura Depot",
    items: [
      {
        productId: "prod-8",
        productCode: "EAK-ALV-1LT",
        productName: "Anti LV",
        packSize: "1LT.",
        quantity: 20,
      },
    ],
    totalQuantity: 20,
    totalProducts: 1,
    date: "01/09/2026, 11:45 AM",
    status: "Completed",
  },
  {
    id: "tx-104",
    code: "TRF-000004",
    sourceDepotId: "dep-1",
    sourceDepotName: "Bogura Depot",
    destinationDepotId: "dep-2",
    destinationDepotName: "Rangpur Depot",
    items: [
      {
        productId: "prod-3",
        productCode: "EAK-MAX-100",
        productName: "Maxtil plus",
        packSize: "100ml",
        quantity: 150,
      },
      {
        productId: "prod-7",
        productCode: "EAK-EBA-050",
        productName: "Ebac plu",
        packSize: "50gm",
        quantity: 80,
      },
    ],
    totalQuantity: 230,
    totalProducts: 2,
    date: "31/08/2026, 04:20 PM",
    status: "Completed",
  },
]

// Initial Areas with Regional Office associations (2 per Regional Office, Total 4 Areas)
export const initialAreasWithDepot: AreaItem[] = [
  // Bogura Regional Office (2 areas)
  { id: "area-1", code: "AREA-BOG-01", name: "Bogura", regionalOfficeId: "ro-1", regionalOfficeName: "Bogura Regional Office", depotId: "dep-1", depotName: "Bogura Depot" },
  { id: "area-2", code: "AREA-BOG-02", name: "Dhunot", regionalOfficeId: "ro-1", regionalOfficeName: "Bogura Regional Office", depotId: "dep-1", depotName: "Bogura Depot" },
  // Rangpur Regional Office (2 areas)
  { id: "area-3", code: "AREA-RAN-01", name: "Rangpur", regionalOfficeId: "ro-2", regionalOfficeName: "Rangpur Regional Office", depotId: "dep-2", depotName: "Rangpur Depot" },
  { id: "area-4", code: "AREA-RAN-02", name: "Gobindaganj", regionalOfficeId: "ro-2", regionalOfficeName: "Rangpur Regional Office", depotId: "dep-2", depotName: "Rangpur Depot" },
]

// Initial Regional Managers (RM) (Exactly 2 RMs)
export const initialRMs: RMItem[] = [
  {
    id: "rm-1",
    code: "RM-001",
    name: "Md. Rahim",
    phone: "01712-111222",
    email: "rahim@eakinhealth.com",
    pin: "123456",
    regionalOfficeId: "ro-1",
    regionalOfficeName: "Bogura Regional Office",
    depotIds: ["dep-1"],
    depotNames: ["Bogura Depot"],
    areaId: "area-1",
    areaName: "Bogura",
  },
  {
    id: "rm-2",
    code: "RM-002",
    name: "Mustafizur Rahman",
    phone: "01819-333444",
    email: "mustafiz@eakinhealth.com",
    pin: "123456",
    regionalOfficeId: "ro-2",
    regionalOfficeName: "Rangpur Regional Office",
    depotIds: ["dep-2", "dep-1"],
    depotNames: ["Rangpur Depot", "Bogura Depot"],
    areaId: "area-3",
    areaName: "Rangpur",
  },
]

// Initial Area Managers (AM) (Exactly 2 AMs)
export const initialAMs: AMItem[] = [
  {
    id: "am-1",
    code: "AM-001",
    name: "Md. Karim",
    phone: "01722-100200",
    email: "karim@eakinhealth.com",
    pin: "123456",
    areaId: "area-1",
    areaName: "Bogura",
    rmId: "rm-1",
    rmName: "Md. Rahim",
  },
  {
    id: "am-2",
    code: "AM-002",
    name: "Tariqul Islam",
    phone: "01922-400500",
    email: "tariqul@eakinhealth.com",
    pin: "123456",
    areaId: "area-3",
    areaName: "Rangpur",
    rmId: "rm-2",
    rmName: "Mustafizur Rahman",
  },
]

// Initial MPOs (formerly Sales Officers) (Exactly 2 MPOs)
export const initialOfficers: SalesOfficerItem[] = [
  {
    id: "off-1",
    code: "MPO-001",
    name: "Arafat Hossain",
    phone: "01711-000111",
    email: "arafat@eakinhealth.com",
    pin: "123456",
    areaId: "area-1",
    areaName: "Bogura",
    rmId: "rm-1",
    rmName: "Md. Rahim",
    amId: "am-1",
    amName: "Md. Karim",
    totalOrders: 42,
    totalSales: 285000,
  },
  {
    id: "off-2",
    code: "MPO-002",
    name: "Zakir Hossain",
    phone: "01833-445566",
    email: "zakir@eakinhealth.com",
    pin: "123456",
    areaId: "area-3",
    areaName: "Rangpur",
    rmId: "rm-2",
    rmName: "Mustafizur Rahman",
    amId: "am-2",
    amName: "Tariqul Islam",
    totalOrders: 51,
    totalSales: 340000,
  },
]

// Initial Customers (2 per Region/Area, Total 4 Customers)
export const initialCustomers: CustomerItem[] = [
  // Bogura Region (2 customers under MPO Arafat Hossain)
  {
    id: "cust-1",
    code: "CUST-001",
    name: "Haji Mohammad Ali",
    shopName: "Ali Veterinary & Feed Store",
    phone: "01711-223300",
    email: "ali.vet@example.com",
    address: "Holding #45, Station Road, Bogura",
    areaId: "area-1",
    areaName: "Bogura",
    rmId: "rm-1",
    rmName: "Md. Rahim",
    amId: "am-1",
    amName: "Md. Karim",
    officerId: "off-1",
    officerName: "Arafat Hossain",
    creditLimit: 150000,
    outstandingBalance: 35000,
    totalOrders: 18,
    totalSpent: 420000,
  },
  {
    id: "cust-2",
    code: "CUST-002",
    name: "Kabir Hossain",
    shopName: "Bismillah Animal Health Care",
    phone: "01722-334411",
    email: "bismillah.vet@example.com",
    address: "Shop #12, Market Complex, Dhunot",
    areaId: "area-2",
    areaName: "Dhunot",
    rmId: "rm-1",
    rmName: "Md. Rahim",
    amId: "am-1",
    amName: "Md. Karim",
    officerId: "off-1",
    officerName: "Arafat Hossain",
    creditLimit: 100000,
    outstandingBalance: 12500,
    totalOrders: 12,
    totalSpent: 280000,
  },
  // Rangpur Region (2 customers under MPO Zakir Hossain)
  {
    id: "cust-3",
    code: "CUST-003",
    name: "Shahid Ullah",
    shopName: "Northern Agro & Vet Supplies",
    phone: "01866-778855",
    email: "northern.agro@example.com",
    address: "Station Road, Rangpur Sadar",
    areaId: "area-3",
    areaName: "Rangpur",
    rmId: "rm-2",
    rmName: "Mustafizur Rahman",
    amId: "am-2",
    amName: "Tariqul Islam",
    officerId: "off-2",
    officerName: "Zakir Hossain",
    creditLimit: 250000,
    outstandingBalance: 45000,
    totalOrders: 20,
    totalSpent: 450000,
  },
  {
    id: "cust-4",
    code: "CUST-004",
    name: "Dr. Mokhlesur Rahman",
    shopName: "Janani Animal Care & Pharmacy",
    phone: "01799-889900",
    email: "janani.vet@example.com",
    address: "Hospital Gate, Gobindaganj",
    areaId: "area-4",
    areaName: "Gobindaganj",
    rmId: "rm-2",
    rmName: "Mustafizur Rahman",
    amId: "am-2",
    amName: "Tariqul Islam",
    officerId: "off-2",
    officerName: "Zakir Hossain",
    creditLimit: 120000,
    outstandingBalance: 20000,
    totalOrders: 14,
    totalSpent: 290000,
  },
]

// Backward compatibility alias
export const initialOfficerCustomers: CustomerItem[] = initialCustomers

export interface EntityFinancialMetrics {
  lifetimeSales: number
  lifetimeCollected: number
  lifetimeOutstanding: number
  thisMonthSales: number
  thisMonthCollected: number
  thisMonthOutstanding: number
}

// Financial Performance Metrics for RMs
export const rmFinancialMetrics: Record<string, EntityFinancialMetrics> = {
  "rm-1": {
    lifetimeSales: 5450000,
    lifetimeCollected: 4890000,
    lifetimeOutstanding: 560000,
    thisMonthSales: 820000,
    thisMonthCollected: 710000,
    thisMonthOutstanding: 110000,
  },
  "rm-2": {
    lifetimeSales: 4920000,
    lifetimeCollected: 4410000,
    lifetimeOutstanding: 510000,
    thisMonthSales: 760000,
    thisMonthCollected: 665000,
    thisMonthOutstanding: 95000,
  },
}

// Financial Performance Metrics for AMs
export const amFinancialMetrics: Record<string, EntityFinancialMetrics> = {
  "am-1": {
    lifetimeSales: 2750000,
    lifetimeCollected: 2470000,
    lifetimeOutstanding: 280000,
    thisMonthSales: 425000,
    thisMonthCollected: 370000,
    thisMonthOutstanding: 55000,
  },
  "am-2": {
    lifetimeSales: 2400000,
    lifetimeCollected: 2150000,
    lifetimeOutstanding: 250000,
    thisMonthSales: 380000,
    thisMonthCollected: 330000,
    thisMonthOutstanding: 50000,
  },
}

// Financial Performance Metrics for Sales Officers
export const officerFinancialMetrics: Record<string, EntityFinancialMetrics> = {
  "off-1": {
    lifetimeSales: 1285000,
    lifetimeCollected: 1150000,
    lifetimeOutstanding: 135000,
    thisMonthSales: 285000,
    thisMonthCollected: 240000,
    thisMonthOutstanding: 45000,
  },
  "off-2": {
    lifetimeSales: 1120000,
    lifetimeCollected: 1005000,
    lifetimeOutstanding: 115000,
    thisMonthSales: 240000,
    thisMonthCollected: 205000,
    thisMonthOutstanding: 35000,
  },
}

export function getRMFinancialData(rmId: string): EntityFinancialMetrics {
  return (
    rmFinancialMetrics[rmId] || {
      lifetimeSales: 4800000,
      lifetimeCollected: 4300000,
      lifetimeOutstanding: 500000,
      thisMonthSales: 750000,
      thisMonthCollected: 650000,
      thisMonthOutstanding: 100000,
    }
  )
}

export function getAMFinancialData(amId: string): EntityFinancialMetrics {
  return (
    amFinancialMetrics[amId] || {
      lifetimeSales: 2500000,
      lifetimeCollected: 2240000,
      lifetimeOutstanding: 260000,
      thisMonthSales: 400000,
      thisMonthCollected: 350000,
      thisMonthOutstanding: 50000,
    }
  )
}

export function getOfficerFinancialData(
  officerId: string,
  totalSales?: number
): EntityFinancialMetrics {
  if (officerFinancialMetrics[officerId]) {
    return officerFinancialMetrics[officerId]
  }
  const base = totalSales || 245000
  const thisMonthCollected = Math.round(base * 0.82)
  const thisMonthOutstanding = base - thisMonthCollected
  const lifetimeSales = base * 4.5
  const lifetimeCollected = Math.round(lifetimeSales * 0.89)
  const lifetimeOutstanding = lifetimeSales - lifetimeCollected
  return {
    lifetimeSales,
    lifetimeCollected,
    lifetimeOutstanding,
    thisMonthSales: base,
    thisMonthCollected,
    thisMonthOutstanding,
  }
}

// Initial Orders Mock Data
export const initialOrders: Order[] = [
  {
    id: "ord-001",
    code: "INV-2026-001",
    date: "05/09/2026, 09:30 AM",
    customerId: "cust-1",
    customerCode: "CUST-001",
    customerName: "Haji Mohammad Ali",
    shopName: "Ali Veterinary & Feed Store",
    phone: "01711-223300",
    address: "Holding #45, Station Road, Bogura",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Bogura Depot",
    items: [
      {
        id: "item-1-1",
        productId: "prod-1",
        productCode: "EAK-EFL-100",
        productName: "Eflor 20",
        packSize: "100ml",
        quantity: 50,
        unitPrice: 780,
        totalPrice: 39000,
      },
      {
        id: "item-1-2",
        productId: "prod-2",
        productCode: "EAK-EFL-500",
        productName: "Eflor 20",
        packSize: "500ml",
        quantity: 30,
        unitPrice: 2880,
        totalPrice: 86400,
      },
      {
        id: "item-1-3",
        productId: "prod-3",
        productCode: "EAK-MAX-100",
        productName: "Maxtil plus",
        packSize: "100ml",
        quantity: 40,
        unitPrice: 680,
        totalPrice: 27200,
      },
    ],
    totalItems: 120,
    subtotal: 152600,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 0,
    discountPercent: 2.5,
    discountAmount: 3815,
    grandTotal: 148785,
    paidAmount: 0,
    dueAmount: 148785,
    returnedAmount: 0,
    paymentStatus: "Unpaid",
    status: "Pending",
  },
  {
    id: "ord-002",
    code: "INV-2026-002",
    date: "04/09/2026, 11:15 AM",
    customerId: "cust-2",
    customerCode: "CUST-002",
    customerName: "Kabir Hossain",
    shopName: "Bismillah Animal Health Care",
    phone: "01722-334411",
    address: "Shop #12, Market Complex, Dhunot",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Bogura Depot",
    items: [
      {
        id: "item-2-1",
        productId: "prod-4",
        productCode: "EAK-MAX-500",
        productName: "Maxtil plus",
        packSize: "500ml",
        quantity: 60,
        unitPrice: 2800,
        totalPrice: 168000,
      },
      {
        id: "item-2-2",
        productId: "prod-8",
        productCode: "EAK-ALV-1LT",
        productName: "Anti LV",
        packSize: "1LT.",
        quantity: 40,
        unitPrice: 1010,
        totalPrice: 40400,
      },
    ],
    totalItems: 100,
    subtotal: 208400,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 2.5,
    discountPercent: 5.0,
    discountAmount: 10420,
    grandTotal: 197980,
    paidAmount: 50000,
    returnedAmount: 14000,
    dueAmount: 133980,
    paymentStatus: "Partially Paid",
    status: "Approved",
    approvedAt: "04/09/2026, 02:40 PM",
    bonusItems: [
      {
        id: "bon-2-1",
        productId: "prod-2",
        productCode: "EAK-EFL-500",
        productName: "Eflor 20",
        packSize: "500ml",
        quantity: 5,
      },
    ],
  },
  {
    id: "ord-003",
    code: "INV-2026-003",
    date: "04/09/2026, 03:20 PM",
    customerId: "cust-3",
    customerCode: "CUST-003",
    customerName: "Shahid Ullah",
    shopName: "Northern Agro & Vet Supplies",
    phone: "01866-778855",
    address: "Station Road, Rangpur Sadar",
    officerId: "off-2",
    officerCode: "OFF-002",
    officerName: "Zakir Hossain",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
    items: [
      {
        id: "item-3-1",
        productId: "prod-7",
        productCode: "EAK-EBA-050",
        productName: "Ebac plu",
        packSize: "50gm",
        quantity: 50,
        unitPrice: 120,
        totalPrice: 6000,
      },
    ],
    totalItems: 50,
    subtotal: 6000,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 0,
    discountPercent: 2.5,
    discountAmount: 150,
    grandTotal: 5850,
    paidAmount: 0,
    dueAmount: 0,
    returnedAmount: 0,
    paymentStatus: "Unpaid",
    status: "Cancelled",
    cancelledAt: "04/09/2026, 04:10 PM",
  },
  {
    id: "ord-004",
    code: "INV-2026-004",
    date: "03/09/2026, 10:00 AM",
    customerId: "cust-3",
    customerCode: "CUST-003",
    customerName: "Shahid Ullah",
    shopName: "Northern Agro & Vet Supplies",
    phone: "01866-778855",
    address: "Station Road, Rangpur Sadar",
    officerId: "off-2",
    officerCode: "OFF-002",
    officerName: "Zakir Hossain",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
    items: [
      {
        id: "item-4-1",
        productId: "prod-1",
        productCode: "EAK-EFL-100",
        productName: "Eflor 20",
        packSize: "100ml",
        quantity: 80,
        unitPrice: 780,
        totalPrice: 62400,
      },
      {
        id: "item-4-2",
        productId: "prod-5",
        productCode: "EAK-SNE-500",
        productName: "S neo pro",
        packSize: "500gm",
        quantity: 100,
        unitPrice: 1420,
        totalPrice: 142000,
      },
      {
        id: "item-4-3",
        productId: "prod-14",
        productCode: "EAK-CAL-5LT",
        productName: "Callwell P",
        packSize: "5LT.",
        quantity: 25,
        unitPrice: 1450,
        totalPrice: 36250,
      },
    ],
    totalItems: 205,
    subtotal: 240650,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 0,
    discountPercent: 2.5,
    discountAmount: 6016.25,
    grandTotal: 234633.75,
    paidAmount: 0,
    dueAmount: 234633.75,
    returnedAmount: 0,
    paymentStatus: "Unpaid",
    status: "Pending",
  },
  {
    id: "ord-005",
    code: "INV-2026-005",
    date: "02/09/2026, 01:45 PM",
    customerId: "cust-4",
    customerCode: "CUST-004",
    customerName: "Dr. Mokhlesur Rahman",
    shopName: "Janani Animal Care & Pharmacy",
    phone: "01799-889900",
    address: "Hospital Gate, Gobindaganj",
    officerId: "off-2",
    officerCode: "OFF-002",
    officerName: "Zakir Hossain",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
    items: [
      {
        id: "item-5-1",
        productId: "prod-14",
        productCode: "EAK-CAL-5LT",
        productName: "Callwell P",
        packSize: "5LT.",
        quantity: 30,
        unitPrice: 1450,
        totalPrice: 43500,
      },
      {
        id: "item-5-2",
        productId: "prod-18",
        productCode: "EAK-IMG-100",
        productName: "Imugin",
        packSize: "100GM",
        quantity: 50,
        unitPrice: 510,
        totalPrice: 25500,
      },
    ],
    totalItems: 80,
    subtotal: 69000,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 1.5,
    discountPercent: 4.0,
    discountAmount: 2760,
    grandTotal: 66240,
    paidAmount: 30000,
    returnedAmount: 2040,
    dueAmount: 34200,
    paymentStatus: "Partially Paid",
    status: "Approved",
    approvedAt: "02/09/2026, 04:30 PM",
    bonusItems: [
      {
        id: "bon-5-1",
        productId: "prod-18",
        productCode: "EAK-IMG-100",
        productName: "Imugin",
        packSize: "100GM",
        quantity: 3,
      },
    ],
  },
  {
    id: "ord-006",
    code: "INV-2026-006",
    date: "01/09/2026, 04:00 PM",
    customerId: "cust-1",
    customerCode: "CUST-001",
    customerName: "Haji Mohammad Ali",
    shopName: "Ali Veterinary & Feed Store",
    phone: "01711-223300",
    address: "Holding #45, Station Road, Bogura",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Bogura Depot",
    items: [
      {
        id: "item-6-1",
        productId: "prod-3",
        productCode: "EAK-MAX-100",
        productName: "Maxtil plus",
        packSize: "100ml",
        quantity: 45,
        unitPrice: 680,
        totalPrice: 30600,
      },
      {
        id: "item-6-2",
        productId: "prod-4",
        productCode: "EAK-MAX-500",
        productName: "Maxtil plus",
        packSize: "500ml",
        quantity: 35,
        unitPrice: 2800,
        totalPrice: 98000,
      },
    ],
    totalItems: 80,
    subtotal: 128600,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 1.0,
    discountPercent: 3.5,
    discountAmount: 4501,
    grandTotal: 124099,
    paidAmount: 124099,
    returnedAmount: 0,
    dueAmount: 0,
    paymentStatus: "Paid",
    status: "Approved",
    approvedAt: "02/09/2026, 10:15 AM",
    bonusItems: [
      {
        id: "bon-6-1",
        productId: "prod-1",
        productCode: "EAK-EFL-100",
        productName: "Eflor 20",
        packSize: "100ml",
        quantity: 4,
      },
    ],
  },
  {
    id: "ord-007",
    code: "INV-2026-007",
    date: "01/09/2026, 02:15 PM",
    customerId: "cust-4",
    customerCode: "CUST-004",
    customerName: "Dr. Mokhlesur Rahman",
    shopName: "Janani Animal Care & Pharmacy",
    phone: "01799-889900",
    address: "Hospital Gate, Gobindaganj",
    officerId: "off-2",
    officerCode: "OFF-002",
    officerName: "Zakir Hossain",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
    items: [
      {
        id: "item-7-1",
        productId: "prod-4",
        productCode: "EAK-MAX-500",
        productName: "Maxtil plus",
        packSize: "500ml",
        quantity: 40,
        unitPrice: 2800,
        totalPrice: 112000,
      },
      {
        id: "item-7-2",
        productId: "prod-8",
        productCode: "EAK-ALV-1LT",
        productName: "Anti LV",
        packSize: "1LT.",
        quantity: 25,
        unitPrice: 1010,
        totalPrice: 25250,
      },
    ],
    totalItems: 65,
    subtotal: 137250,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 0,
    discountPercent: 2.5,
    discountAmount: 3431.25,
    grandTotal: 133818.75,
    paidAmount: 0,
    dueAmount: 133818.75,
    returnedAmount: 0,
    paymentStatus: "Unpaid",
    status: "Pending",
  },
  {
    id: "ord-008",
    code: "INV-2026-008",
    date: "28/08/2026, 11:00 AM",
    customerId: "cust-1",
    customerCode: "CUST-001",
    customerName: "Haji Mohammad Ali",
    shopName: "Ali Veterinary & Feed Store",
    phone: "01711-223300",
    address: "Holding #45, Station Road, Bogura",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Bogura Depot",
    items: [
      {
        id: "item-8-1",
        productId: "prod-8",
        productCode: "EAK-ALV-1LT",
        productName: "Anti LV",
        packSize: "1LT.",
        quantity: 80,
        unitPrice: 1010,
        totalPrice: 80800,
      },
      {
        id: "item-8-2",
        productId: "prod-5",
        productCode: "EAK-SNE-500",
        productName: "S neo pro",
        packSize: "500gm",
        quantity: 50,
        unitPrice: 1420,
        totalPrice: 71000,
      },
    ],
    totalItems: 130,
    subtotal: 151800,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 2.26,
    discountPercent: 4.76,
    discountAmount: 7225.68,
    grandTotal: 144574.32,
    paidAmount: 0,
    dueAmount: 144574.32,
    returnedAmount: 0,
    paymentStatus: "Unpaid",
    status: "Approved",
    approvedAt: "28/08/2026, 03:00 PM",
  },
  {
    id: "ord-009",
    code: "INV-2026-009",
    date: "20/08/2026, 02:30 PM",
    customerId: "cust-1",
    customerCode: "CUST-001",
    customerName: "Haji Mohammad Ali",
    shopName: "Ali Veterinary & Feed Store",
    phone: "01711-223300",
    address: "Holding #45, Station Road, Bogura",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Bogura Depot",
    items: [
      {
        id: "item-9-1",
        productId: "prod-14",
        productCode: "EAK-CAL-5LT",
        productName: "Callwell P",
        packSize: "5LT.",
        quantity: 25,
        unitPrice: 1450,
        totalPrice: 36250,
      },
      {
        id: "item-9-2",
        productId: "prod-18",
        productCode: "EAK-IMG-100",
        productName: "Imugin",
        packSize: "100gm",
        quantity: 10,
        unitPrice: 510,
        totalPrice: 5100,
      },
    ],
    totalItems: 35,
    subtotal: 41350,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 2.86,
    discountPercent: 5.36,
    discountAmount: 2216.36,
    grandTotal: 39133.64,
    paidAmount: 0,
    dueAmount: 39133.64,
    returnedAmount: 0,
    paymentStatus: "Unpaid",
    status: "Approved",
    approvedAt: "20/08/2026, 05:15 PM",
  },
]

// Initial Collections Mock Data (Payment Receipts)
export const initialCollections: CollectionItem[] = [
  {
    id: "col-001",
    code: "COL-2026-001",
    customerId: "cust-2",
    customerCode: "CUST-002",
    customerName: "Kabir Hossain",
    shopName: "Bismillah Animal Health Care",
    date: "04/09/2026, 04:15 PM",
    amount: 50000,
    paymentMethod: "Bank Transfer",
    recordedBy: "Admin (Finance)",
    note: "Payment received via Sonali Bank AC #0921",
    allocations: [
      {
        orderId: "ord-002",
        orderCode: "INV-2026-002",
        orderDate: "04/09/2026, 11:15 AM",
        originalGrandTotal: 197980,
        previousDue: 183980,
        allocatedAmount: 50000,
        remainingDue: 133980,
      },
    ],
  },
  {
    id: "col-002",
    code: "COL-2026-002",
    customerId: "cust-4",
    customerCode: "CUST-004",
    customerName: "Dr. Mokhlesur Rahman",
    shopName: "Janani Animal Care & Pharmacy",
    date: "03/09/2026, 11:30 AM",
    amount: 30000,
    paymentMethod: "Cash",
    recordedBy: "Admin (Finance)",
    note: "Cash collected by Depot Accounts Officer",
    allocations: [
      {
        orderId: "ord-005",
        orderCode: "INV-2026-005",
        orderDate: "02/09/2026, 01:45 PM",
        originalGrandTotal: 66240,
        previousDue: 64200,
        allocatedAmount: 30000,
        remainingDue: 34200,
      },
    ],
  },
  {
    id: "col-003",
    code: "COL-2026-003",
    customerId: "cust-1",
    customerCode: "CUST-001",
    customerName: "Haji Mohammad Ali",
    shopName: "Ali Veterinary & Feed Store",
    date: "02/09/2026, 02:45 PM",
    amount: 124099,
    paymentMethod: "Cheque",
    recordedBy: "Admin (Finance)",
    note: "Islami Bank Cheque #CHQ-88291 Cleared",
    allocations: [
      {
        orderId: "ord-006",
        orderCode: "INV-2026-006",
        orderDate: "01/09/2026, 04:00 PM",
        originalGrandTotal: 124099,
        previousDue: 124099,
        allocatedAmount: 124099,
        remainingDue: 0,
      },
    ],
  },
]

// Initial Product Returns Mock Data
export const initialProductReturns: ProductReturnItem[] = [
  {
    id: "ret-001",
    code: "RET-2026-001",
    customerId: "cust-2",
    customerCode: "CUST-002",
    customerName: "Kabir Hossain",
    shopName: "Bismillah Animal Health Care",
    orderId: "ord-002",
    orderCode: "INV-2026-002",
    orderDate: "04/09/2026, 11:15 AM",
    depotId: "dep-1",
    depotName: "Bogura Depot",
    date: "04/09/2026, 05:00 PM",
    reason: "Damaged outer seal on arrival",
    recordedBy: "Admin (Warehouse)",
    totalReturnedQuantity: 5,
    totalReturnAmount: 14000,
    items: [
      {
        productId: "prod-4",
        productCode: "EAK-MAX-500",
        productName: "Maxtil plus",
        packSize: "500ml",
        unitPrice: 2800,
        deliveredQuantity: 60,
        returnedQuantity: 5,
        returnAmount: 14000,
      },
    ],
  },
  {
    id: "ret-002",
    code: "RET-2026-002",
    customerId: "cust-4",
    customerCode: "CUST-004",
    customerName: "Dr. Mokhlesur Rahman",
    shopName: "Janani Animal Care & Pharmacy",
    orderId: "ord-005",
    orderCode: "INV-2026-005",
    orderDate: "02/09/2026, 01:45 PM",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
    date: "03/09/2026, 02:20 PM",
    reason: "Near expiry exchange request",
    recordedBy: "Admin (Warehouse)",
    totalReturnedQuantity: 4,
    totalReturnAmount: 2040,
    items: [
      {
        productId: "prod-18",
        productCode: "EAK-IMG-100",
        productName: "Imugin",
        packSize: "100GM",
        unitPrice: 510,
        deliveredQuantity: 50,
        returnedQuantity: 4,
        returnAmount: 2040,
      },
    ],
  },
]

// Initial Stock Movements Data (Customer Returns & Product Logs)
export const initialStockMovements: StockMovement[] = [
  {
    id: "mov-001",
    date: "05/09/2026, 10:15 AM",
    movementType: "Return",
    depotId: "dep-1",
    depotName: "Bogura Depot",
    productId: "prod-2",
    productCode: "EAK-EFL-500",
    productName: "Eflor 20",
    packSize: "500ml",
    quantity: 10,
    customerId: "cust-1",
    customerCode: "CUST-001",
    customerName: "Haji Mohammad Ali",
    reference: "Damaged packaging return",
  },
  {
    id: "mov-002",
    date: "04/09/2026, 04:30 PM",
    movementType: "Return",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
    productId: "prod-1",
    productCode: "EAK-EFL-100",
    productName: "Eflor 20",
    packSize: "100ml",
    quantity: 20,
    customerId: "cust-3",
    customerCode: "CUST-003",
    customerName: "Shahid Ullah",
    reference: "Pharmacy stock adjustment",
  },
  {
    id: "mov-003",
    date: "03/09/2026, 02:20 PM",
    movementType: "Return",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
    productId: "prod-18",
    productCode: "EAK-IMG-100",
    productName: "Imugin",
    packSize: "100GM",
    quantity: 8,
    customerId: "cust-4",
    customerCode: "CUST-004",
    customerName: "Dr. Mokhlesur Rahman",
    reference: "Overstock exchange",
  },
  {
    id: "mov-004",
    date: "02/09/2026, 11:45 AM",
    movementType: "Return",
    depotId: "dep-1",
    depotName: "Bogura Depot",
    productId: "prod-3",
    productCode: "EAK-MAX-100",
    productName: "Maxtil plus",
    packSize: "100ml",
    quantity: 15,
    customerId: "cust-2",
    customerCode: "CUST-002",
    customerName: "Kabir Hossain",
    reference: "Customer Return (CUST-002)",
  },
  {
    id: "mov-005",
    date: "01/09/2026, 03:10 PM",
    movementType: "Return",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
    productId: "prod-4",
    productCode: "EAK-MAX-500",
    productName: "Maxtil plus",
    packSize: "500ml",
    quantity: 12,
    customerId: "cust-4",
    customerCode: "CUST-004",
    customerName: "Dr. Mokhlesur Rahman",
    reference: "Batch return exchange",
  },
  {
    id: "mov-006",
    date: "31/08/2026, 01:00 PM",
    movementType: "Return",
    depotId: "dep-2",
    depotName: "Rangpur Depot",
    productId: "prod-7",
    productCode: "EAK-EBA-050",
    productName: "Ebac plu",
    packSize: "50gm",
    quantity: 25,
    customerId: "cust-3",
    customerCode: "CUST-003",
    customerName: "Shahid Ullah",
    reference: "Prescription adjustment return",
  },
]
