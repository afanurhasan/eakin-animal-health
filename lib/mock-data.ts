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
  category: string
  unit: string
  packSize: string
  buyPrice: number
  sellPrice: number
  price: number // alias/backward compatibility for sellPrice
}

export interface DepotStockItem {
  productId: string
  productCode: string
  productName: string
  category: string
  packSize: string
  quantity: number
  unit: string
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
  unit: string
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
  unit: string
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
  category: string
  packSize: string
  unit: string
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

export interface AreaItem {
  id: string
  code: string
  name: string
  depotId: string
  depotName?: string
}

export interface RMItem {
  id: string
  code: string
  name: string
  phone: string
  email: string
  areaId: string
  areaName: string
}

export interface AMItem {
  id: string
  code: string
  name: string
  phone: string
  email: string
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
  areaId: string
  areaName: string
  rmId: string
  rmName: string
  amId: string
  amName: string
  totalOrders?: number
  totalSales?: number
}

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
    code: "DEP-DHA-01",
    name: "Dhaka Central Depot",
    location: "Tejgaon Industrial Area, Dhaka",
  },
  {
    id: "dep-2",
    code: "DEP-CTG-01",
    name: "Chittagong Regional Depot",
    location: "Agrabad Commercial Area, Chittagong",
  },
  {
    id: "dep-3",
    code: "DEP-BOG-01",
    name: "Bogura Depot",
    location: "Sherpur Road, Bogura",
  },
  {
    id: "dep-4",
    code: "DEP-RAJ-01",
    name: "Rajshahi Depot",
    location: "Biman Chattar, Rajshahi",
  },
]

// Sample Animal Health Veterinary Products Catalog
export const productCatalog: Product[] = [
  {
    id: "prod-1",
    code: "EAK-AMX-100",
    name: "Eakmox-Vet 100ml",
    category: "Antibiotics",
    unit: "Bottle",
    packSize: "100 ml",
    buyPrice: 360,
    sellPrice: 450,
    price: 450,
  },
  {
    id: "prod-2",
    code: "EAK-VIT-AD3",
    name: "Eakvit-AD3E Liquid",
    category: "Vitamins & Supplements",
    unit: "Bottle",
    packSize: "500 ml",
    buyPrice: 540,
    sellPrice: 680,
    price: 680,
  },
  {
    id: "prod-3",
    code: "EAK-CAL-500",
    name: "Cal-Eakin Gel Forte",
    category: "Calcium Supplements",
    unit: "Tube",
    packSize: "300 gm",
    buyPrice: 250,
    sellPrice: 320,
    price: 320,
  },
  {
    id: "prod-4",
    code: "EAK-ENR-200",
    name: "Enrocyn-Vet 20%",
    category: "Antibiotics",
    unit: "Bottle",
    packSize: "100 ml",
    buyPrice: 410,
    sellPrice: 520,
    price: 520,
  },
  {
    id: "prod-5",
    code: "EAK-LV-1000",
    name: "Liv-Health Tonic",
    category: "Liver Tonics",
    unit: "Jar",
    packSize: "1 Litre",
    buyPrice: 680,
    sellPrice: 850,
    price: 850,
  },
  {
    id: "prod-6",
    code: "EAK-ANT-50",
    name: "Anthel-Plus Bolus",
    category: "Dewormer",
    unit: "Box",
    packSize: "5 x 4 Bolus",
    buyPrice: 300,
    sellPrice: 380,
    price: 380,
  },
  {
    id: "prod-7",
    code: "EAK-MIN-MIX",
    name: "Eakmin Mineral Mixture",
    category: "Feed Supplement",
    unit: "Sack",
    packSize: "5 kg",
    buyPrice: 880,
    sellPrice: 1100,
    price: 1100,
  },
  {
    id: "prod-8",
    code: "EAK-PRO-IMM",
    name: "Immuno-Boost Powder",
    category: "Immunity Booster",
    unit: "Pouch",
    packSize: "250 gm",
    buyPrice: 330,
    sellPrice: 420,
    price: 420,
  },
]

// Initial Stock per Depot
export const initialDepotStocks: Record<string, DepotStockItem[]> = {
  "dep-1": [
    {
      productId: "prod-1",
      productCode: "EAK-AMX-100",
      productName: "Eakmox-Vet 100ml",
      category: "Antibiotics",
      packSize: "100 ml",
      quantity: 500,
      unit: "Bottle",
      minThreshold: 50,
    },
    {
      productId: "prod-2",
      productCode: "EAK-VIT-AD3",
      productName: "Eakvit-AD3E Liquid",
      category: "Vitamins & Supplements",
      packSize: "500 ml",
      quantity: 300,
      unit: "Bottle",
      minThreshold: 30,
    },
    {
      productId: "prod-3",
      productCode: "EAK-CAL-500",
      productName: "Cal-Eakin Gel Forte",
      category: "Calcium Supplements",
      packSize: "300 gm",
      quantity: 800,
      unit: "Tube",
      minThreshold: 40,
    },
    {
      productId: "prod-4",
      productCode: "EAK-ENR-200",
      productName: "Enrocyn-Vet 20%",
      category: "Antibiotics",
      packSize: "100 ml",
      quantity: 200,
      unit: "Bottle",
      minThreshold: 25,
    },
    {
      productId: "prod-5",
      productCode: "EAK-LV-1000",
      productName: "Liv-Health Tonic",
      category: "Liver Tonics",
      packSize: "1 Litre",
      quantity: 150,
      unit: "Jar",
      minThreshold: 20,
    },
    {
      productId: "prod-6",
      productCode: "EAK-ANT-50",
      productName: "Anthel-Plus Bolus",
      category: "Dewormer",
      packSize: "5 x 4 Bolus",
      quantity: 600,
      unit: "Box",
      minThreshold: 50,
    },
  ],
  "dep-2": [
    {
      productId: "prod-1",
      productCode: "EAK-AMX-100",
      productName: "Eakmox-Vet 100ml",
      category: "Antibiotics",
      packSize: "100 ml",
      quantity: 160,
      unit: "Bottle",
      minThreshold: 40,
    },
    {
      productId: "prod-2",
      productCode: "EAK-VIT-AD3",
      productName: "Eakvit-AD3E Liquid",
      category: "Vitamins & Supplements",
      packSize: "500 ml",
      quantity: 95,
      unit: "Bottle",
      minThreshold: 25,
    },
    {
      productId: "prod-3",
      productCode: "EAK-CAL-500",
      productName: "Cal-Eakin Gel Forte",
      category: "Calcium Supplements",
      packSize: "300 gm",
      quantity: 110,
      unit: "Tube",
      minThreshold: 30,
    },
    {
      productId: "prod-7",
      productCode: "EAK-MIN-MIX",
      productName: "Eakmin Mineral Mixture",
      category: "Feed Supplement",
      packSize: "5 kg",
      quantity: 75,
      unit: "Sack",
      minThreshold: 15,
    },
    {
      productId: "prod-8",
      productCode: "EAK-PRO-IMM",
      productName: "Immuno-Boost Powder",
      category: "Immunity Booster",
      packSize: "250 gm",
      quantity: 130,
      unit: "Pouch",
      minThreshold: 30,
    },
  ],
  "dep-3": [
    {
      productId: "prod-1",
      productCode: "EAK-AMX-100",
      productName: "Eakmox-Vet 100ml",
      category: "Antibiotics",
      packSize: "100 ml",
      quantity: 100,
      unit: "Bottle",
      minThreshold: 20,
    },
    {
      productId: "prod-2",
      productCode: "EAK-VIT-AD3",
      productName: "Eakvit-AD3E Liquid",
      category: "Vitamins & Supplements",
      packSize: "500 ml",
      quantity: 50,
      unit: "Bottle",
      minThreshold: 15,
    },
    {
      productId: "prod-3",
      productCode: "EAK-CAL-500",
      productName: "Cal-Eakin Gel Forte",
      category: "Calcium Supplements",
      packSize: "300 gm",
      quantity: 200,
      unit: "Tube",
      minThreshold: 30,
    },
  ],
  "dep-4": [
    {
      productId: "prod-4",
      productCode: "EAK-ENR-200",
      productName: "Enrocyn-Vet 20%",
      category: "Antibiotics",
      packSize: "100 ml",
      quantity: 80,
      unit: "Bottle",
      minThreshold: 20,
    },
    {
      productId: "prod-5",
      productCode: "EAK-LV-1000",
      productName: "Liv-Health Tonic",
      category: "Liver Tonics",
      packSize: "1 Litre",
      quantity: 60,
      unit: "Jar",
      minThreshold: 15,
    },
    {
      productId: "prod-6",
      productCode: "EAK-ANT-50",
      productName: "Anthel-Plus Bolus",
      category: "Dewormer",
      packSize: "5 x 4 Bolus",
      quantity: 150,
      unit: "Box",
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
    sourceDepotName: "Dhaka Central Depot",
    destinationDepotId: "dep-3",
    destinationDepotName: "Bogura Depot",
    items: [
      {
        productId: "prod-1",
        productCode: "EAK-AMX-100",
        productName: "Eakmox-Vet 100ml",
        category: "Antibiotics",
        packSize: "100 ml",
        unit: "Bottle",
        quantity: 100,
      },
      {
        productId: "prod-2",
        productCode: "EAK-VIT-AD3",
        productName: "Eakvit-AD3E Liquid",
        category: "Vitamins & Supplements",
        packSize: "500 ml",
        unit: "Bottle",
        quantity: 50,
      },
      {
        productId: "prod-3",
        productCode: "EAK-CAL-500",
        productName: "Cal-Eakin Gel Forte",
        category: "Calcium Supplements",
        packSize: "300 gm",
        unit: "Tube",
        quantity: 200,
      },
      {
        productId: "prod-4",
        productCode: "EAK-ENR-200",
        productName: "Enrocyn-Vet 20%",
        category: "Antibiotics",
        packSize: "100 ml",
        unit: "Bottle",
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
    sourceDepotName: "Chittagong Regional Depot",
    destinationDepotId: "dep-1",
    destinationDepotName: "Dhaka Central Depot",
    items: [
      {
        productId: "prod-7",
        productCode: "EAK-MIN-MIX",
        productName: "Eakmin Mineral Mixture",
        category: "Feed Supplement",
        packSize: "5 kg",
        unit: "Sack",
        quantity: 40,
      },
      {
        productId: "prod-8",
        productCode: "EAK-PRO-IMM",
        productName: "Immuno-Boost Powder",
        category: "Immunity Booster",
        packSize: "250 gm",
        unit: "Pouch",
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
    sourceDepotId: "dep-4",
    sourceDepotName: "Rajshahi Depot",
    destinationDepotId: "dep-1",
    destinationDepotName: "Dhaka Central Depot",
    items: [
      {
        productId: "prod-5",
        productCode: "EAK-LV-1000",
        productName: "Liv-Health Tonic",
        category: "Liver Tonics",
        packSize: "1 Litre",
        unit: "Jar",
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
    sourceDepotName: "Dhaka Central Depot",
    destinationDepotId: "dep-2",
    destinationDepotName: "Chittagong Regional Depot",
    items: [
      {
        productId: "prod-3",
        productCode: "EAK-CAL-500",
        productName: "Cal-Eakin Gel Forte",
        category: "Calcium Supplements",
        packSize: "300 gm",
        unit: "Tube",
        quantity: 150,
      },
      {
        productId: "prod-6",
        productCode: "EAK-ANT-50",
        productName: "Anthel-Plus Bolus",
        category: "Dewormer",
        packSize: "5 x 4 Bolus",
        unit: "Box",
        quantity: 80,
      },
    ],
    totalQuantity: 230,
    totalProducts: 2,
    date: "31/08/2026, 04:20 PM",
    status: "Completed",
  },
]

// Initial Areas with Depot associations
export const initialAreasWithDepot: AreaItem[] = [
  { id: "1", code: "DHA-01", name: "Dhaka North", depotId: "dep-1", depotName: "Dhaka Central Depot" },
  { id: "2", code: "DHA-02", name: "Dhaka South", depotId: "dep-1", depotName: "Dhaka Central Depot" },
  { id: "3", code: "CTG-01", name: "Chittagong Central", depotId: "dep-2", depotName: "Chittagong Regional Depot" },
  { id: "4", code: "BOG-01", name: "Bogura Town", depotId: "dep-3", depotName: "Bogura Depot" },
  { id: "5", code: "RAJ-01", name: "Rajshahi Sadar", depotId: "dep-4", depotName: "Rajshahi Depot" },
  { id: "6", code: "MYM-01", name: "Mymensingh", depotId: "dep-1", depotName: "Dhaka Central Depot" },
  { id: "7", code: "SYL-01", name: "Sylhet", depotId: "dep-2", depotName: "Chittagong Regional Depot" },
  { id: "8", code: "KHL-01", name: "Khulna", depotId: "dep-1", depotName: "Dhaka Central Depot" },
]

// Initial Regional Managers (RM)
export const initialRMs: RMItem[] = [
  {
    id: "rm-1",
    code: "RM-001",
    name: "Md. Rahim",
    phone: "01712-111222",
    email: "rahim@eakinhealth.com",
    areaId: "1",
    areaName: "Dhaka North",
  },
  {
    id: "rm-2",
    code: "RM-002",
    name: "Mustafizur Rahman",
    phone: "01819-333444",
    email: "mustafiz@eakinhealth.com",
    areaId: "4",
    areaName: "Bogura Town",
  },
  {
    id: "rm-3",
    code: "RM-003",
    name: "Anwar Parvez",
    phone: "01911-555666",
    email: "anwar@eakinhealth.com",
    areaId: "3",
    areaName: "Chittagong Central",
  },
  {
    id: "rm-4",
    code: "RM-004",
    name: "Kamrul Ahsan",
    phone: "01713-777888",
    email: "kamrul@eakinhealth.com",
    areaId: "5",
    areaName: "Rajshahi Sadar",
  },
  {
    id: "rm-5",
    code: "RM-005",
    name: "Shahidul Islam",
    phone: "01612-999000",
    email: "shahidul@eakinhealth.com",
    areaId: "2",
    areaName: "Dhaka South",
  },
]

// Initial Area Managers (AM)
export const initialAMs: AMItem[] = [
  {
    id: "am-1",
    code: "AM-001",
    name: "Md. Karim",
    phone: "01722-100200",
    email: "karim@eakinhealth.com",
    areaId: "1",
    areaName: "Dhaka North",
    rmId: "rm-1",
    rmName: "Md. Rahim",
  },
  {
    id: "am-2",
    code: "AM-002",
    name: "Sajid Hasan",
    phone: "01733-200300",
    email: "sajid@eakinhealth.com",
    areaId: "1",
    areaName: "Dhaka North",
    rmId: "rm-1",
    rmName: "Md. Rahim",
  },
  {
    id: "am-3",
    code: "AM-003",
    name: "Faruk Hossain",
    phone: "01822-300400",
    email: "faruk@eakinhealth.com",
    areaId: "4",
    areaName: "Bogura Town",
    rmId: "rm-2",
    rmName: "Mustafizur Rahman",
  },
  {
    id: "am-4",
    code: "AM-004",
    name: "Tariqul Islam",
    phone: "01922-400500",
    email: "tariqul@eakinhealth.com",
    areaId: "3",
    areaName: "Chittagong Central",
    rmId: "rm-3",
    rmName: "Anwar Parvez",
  },
  {
    id: "am-5",
    code: "AM-005",
    name: "Nazmul Huda",
    phone: "01744-500600",
    email: "nazmul@eakinhealth.com",
    areaId: "5",
    areaName: "Rajshahi Sadar",
    rmId: "rm-4",
    rmName: "Kamrul Ahsan",
  },
]

// Initial Sales Officers
export const initialOfficers: SalesOfficerItem[] = [
  {
    id: "off-1",
    code: "OFF-001",
    name: "Arafat Hossain",
    phone: "01755-112233",
    email: "arafat@eakinhealth.com",
    areaId: "1",
    areaName: "Dhaka North",
    rmId: "rm-1",
    rmName: "Md. Rahim",
    amId: "am-1",
    amName: "Md. Karim",
    totalOrders: 42,
    totalSales: 285000,
  },
  {
    id: "off-2",
    code: "OFF-002",
    name: "Tanvir Ahmed",
    phone: "01766-223344",
    email: "tanvir@eakinhealth.com",
    areaId: "1",
    areaName: "Dhaka North",
    rmId: "rm-1",
    rmName: "Md. Rahim",
    amId: "am-1",
    amName: "Md. Karim",
    totalOrders: 38,
    totalSales: 240000,
  },
  {
    id: "off-3",
    code: "OFF-003",
    name: "Mahmudul Hasan",
    phone: "01777-334455",
    email: "mahmudul@eakinhealth.com",
    areaId: "1",
    areaName: "Dhaka North",
    rmId: "rm-1",
    rmName: "Md. Rahim",
    amId: "am-2",
    amName: "Sajid Hasan",
    totalOrders: 29,
    totalSales: 195000,
  },
  {
    id: "off-4",
    code: "OFF-004",
    name: "Zakir Hossain",
    phone: "01833-445566",
    email: "zakir@eakinhealth.com",
    areaId: "4",
    areaName: "Bogura Town",
    rmId: "rm-2",
    rmName: "Mustafizur Rahman",
    amId: "am-3",
    amName: "Faruk Hossain",
    totalOrders: 51,
    totalSales: 340000,
  },
  {
    id: "off-5",
    code: "OFF-005",
    name: "Shafiqul Alam",
    phone: "01933-556677",
    email: "shafiqul@eakinhealth.com",
    areaId: "3",
    areaName: "Chittagong Central",
    rmId: "rm-3",
    rmName: "Anwar Parvez",
    amId: "am-4",
    amName: "Tariqul Islam",
    totalOrders: 34,
    totalSales: 215000,
  },
  {
    id: "off-6",
    code: "OFF-006",
    name: "Biplob Kumar",
    phone: "01788-667788",
    email: "biplob@eakinhealth.com",
    areaId: "5",
    areaName: "Rajshahi Sadar",
    rmId: "rm-4",
    rmName: "Kamrul Ahsan",
    amId: "am-5",
    amName: "Nazmul Huda",
    totalOrders: 22,
    totalSales: 160000,
  },
]

// Initial Customers
export const initialCustomers: CustomerItem[] = [
  {
    id: "cust-1",
    code: "CUST-001",
    name: "Haji Mohammad Ali",
    shopName: "Ali Veterinary & Feed Store",
    phone: "01711-223300",
    email: "ali.vet@example.com",
    address: "Holding #45, Station Road, Gazipur Chowrasta",
    areaId: "1",
    areaName: "Dhaka North",
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
    address: "Shop #12, Market Complex, Savar Bazar",
    areaId: "1",
    areaName: "Dhaka North",
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
  {
    id: "cust-3",
    code: "CUST-003",
    name: "Abdur Rashid",
    shopName: "Rashid Dairy & Poultry Medicine",
    phone: "01733-445522",
    email: "rashid.dairy@example.com",
    address: "Bypass Road, Tongi Industrial Area",
    areaId: "1",
    areaName: "Dhaka North",
    rmId: "rm-1",
    rmName: "Md. Rahim",
    amId: "am-1",
    amName: "Md. Karim",
    officerId: "off-1",
    officerName: "Arafat Hossain",
    creditLimit: 200000,
    outstandingBalance: 48000,
    totalOrders: 24,
    totalSpent: 560000,
  },
  {
    id: "cust-4",
    code: "CUST-004",
    name: "Dr. Golam Sarwar",
    shopName: "Sarwar Vet Pharmacy",
    phone: "01744-556633",
    email: "sarwar.vet@example.com",
    address: "Main Road, Ashulia Center",
    areaId: "1",
    areaName: "Dhaka North",
    rmId: "rm-1",
    rmName: "Md. Rahim",
    amId: "am-1",
    amName: "Md. Karim",
    officerId: "off-2",
    officerName: "Tanvir Ahmed",
    creditLimit: 120000,
    outstandingBalance: 22000,
    totalOrders: 15,
    totalSpent: 310000,
  },
  {
    id: "cust-5",
    code: "CUST-005",
    name: "Mizanur Rahman",
    shopName: "Mizan Animal Care Complex",
    phone: "01755-667744",
    email: "mizan.vet@example.com",
    address: "Plot #8, College Road, Joydebpur",
    areaId: "1",
    areaName: "Dhaka North",
    rmId: "rm-1",
    rmName: "Md. Rahim",
    amId: "am-1",
    amName: "Md. Karim",
    officerId: "off-2",
    officerName: "Tanvir Ahmed",
    creditLimit: 180000,
    outstandingBalance: 65000,
    totalOrders: 20,
    totalSpent: 490000,
  },
  {
    id: "cust-6",
    code: "CUST-006",
    name: "Shahid Ullah",
    shopName: "Northern Agro & Vet Supplies",
    phone: "01866-778855",
    email: "northern.agro@example.com",
    address: "Sherpur Main Road, Bogura Town",
    areaId: "4",
    areaName: "Bogura Town",
    rmId: "rm-2",
    rmName: "Mustafizur Rahman",
    amId: "am-3",
    amName: "Faruk Hossain",
    officerId: "off-4",
    officerName: "Zakir Hossain",
    creditLimit: 250000,
    outstandingBalance: 80000,
    totalOrders: 28,
    totalSpent: 720000,
  },
  {
    id: "cust-7",
    code: "CUST-007",
    name: "Mahbubur Rahman",
    shopName: "Agrabad Vet & Pet Care",
    phone: "01977-889966",
    email: "agrabad.pet@example.com",
    address: "Commercial Area, Agrabad, Chittagong",
    areaId: "3",
    areaName: "Chittagong Central",
    rmId: "rm-3",
    rmName: "Anwar Parvez",
    amId: "am-4",
    amName: "Tariqul Islam",
    officerId: "off-5",
    officerName: "Shafiqul Alam",
    creditLimit: 160000,
    outstandingBalance: 15000,
    totalOrders: 14,
    totalSpent: 340000,
  },
  {
    id: "cust-8",
    code: "CUST-008",
    name: "Enamul Haque",
    shopName: "Padma Dairy & Vet Medicine",
    phone: "01788-990077",
    email: "padma.dairy@example.com",
    address: "Station Bazar, Rajshahi Sadar",
    areaId: "5",
    areaName: "Rajshahi Sadar",
    rmId: "rm-4",
    rmName: "Kamrul Ahsan",
    amId: "am-5",
    amName: "Nazmul Huda",
    officerId: "off-6",
    officerName: "Biplob Kumar",
    creditLimit: 140000,
    outstandingBalance: 29000,
    totalOrders: 11,
    totalSpent: 260000,
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
  "rm-3": {
    lifetimeSales: 6100000,
    lifetimeCollected: 5520000,
    lifetimeOutstanding: 580000,
    thisMonthSales: 940000,
    thisMonthCollected: 830000,
    thisMonthOutstanding: 110000,
  },
  "rm-4": {
    lifetimeSales: 3850000,
    lifetimeCollected: 3420000,
    lifetimeOutstanding: 430000,
    thisMonthSales: 620000,
    thisMonthCollected: 535000,
    thisMonthOutstanding: 85000,
  },
  "rm-5": {
    lifetimeSales: 4300000,
    lifetimeCollected: 3840000,
    lifetimeOutstanding: 460000,
    thisMonthSales: 690000,
    thisMonthCollected: 595000,
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
  "am-3": {
    lifetimeSales: 2950000,
    lifetimeCollected: 2640000,
    lifetimeOutstanding: 310000,
    thisMonthSales: 460000,
    thisMonthCollected: 400000,
    thisMonthOutstanding: 60000,
  },
  "am-4": {
    lifetimeSales: 3100000,
    lifetimeCollected: 2790000,
    lifetimeOutstanding: 310000,
    thisMonthSales: 490000,
    thisMonthCollected: 430000,
    thisMonthOutstanding: 60000,
  },
  "am-5": {
    lifetimeSales: 2150000,
    lifetimeCollected: 1920000,
    lifetimeOutstanding: 230000,
    thisMonthSales: 340000,
    thisMonthCollected: 295000,
    thisMonthOutstanding: 45000,
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
  "off-3": {
    lifetimeSales: 980000,
    lifetimeCollected: 875000,
    lifetimeOutstanding: 105000,
    thisMonthSales: 195000,
    thisMonthCollected: 165000,
    thisMonthOutstanding: 30000,
  },
  "off-4": {
    lifetimeSales: 1450000,
    lifetimeCollected: 1300000,
    lifetimeOutstanding: 150000,
    thisMonthSales: 340000,
    thisMonthCollected: 290000,
    thisMonthOutstanding: 50000,
  },
  "off-5": {
    lifetimeSales: 1050000,
    lifetimeCollected: 940000,
    lifetimeOutstanding: 110000,
    thisMonthSales: 215000,
    thisMonthCollected: 180000,
    thisMonthOutstanding: 35000,
  },
  "off-6": {
    lifetimeSales: 860000,
    lifetimeCollected: 765000,
    lifetimeOutstanding: 95000,
    thisMonthSales: 160000,
    thisMonthCollected: 135000,
    thisMonthOutstanding: 25000,
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
    address: "Holding #45, Station Road, Gazipur Chowrasta",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Dhaka Central Depot",
    items: [
      {
        id: "item-1-1",
        productId: "prod-1",
        productCode: "EAK-AMX-100",
        productName: "Eakmox-Vet 100ml",
        packSize: "100 ml",
        quantity: 50,
        unitPrice: 450,
        totalPrice: 22500,
      },
      {
        id: "item-1-2",
        productId: "prod-2",
        productCode: "EAK-VIT-AD3",
        productName: "Eakvit-AD3E Liquid",
        packSize: "500 ml",
        quantity: 30,
        unitPrice: 680,
        totalPrice: 20400,
      },
      {
        id: "item-1-3",
        productId: "prod-3",
        productCode: "EAK-CAL-500",
        productName: "Cal-Eakin Gel Forte",
        packSize: "300 gm",
        quantity: 40,
        unitPrice: 320,
        totalPrice: 12800,
      },
    ],
    totalItems: 120,
    subtotal: 55700,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 0,
    discountPercent: 2.5,
    discountAmount: 1392.5,
    grandTotal: 54307.5,
    paidAmount: 0,
    dueAmount: 54307.5,
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
    address: "Shop #12, Market Complex, Savar Bazar",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Dhaka Central Depot",
    items: [
      {
        id: "item-2-1",
        productId: "prod-4",
        productCode: "EAK-ENR-200",
        productName: "Enrocyn-Vet 20%",
        packSize: "100 ml",
        quantity: 60,
        unitPrice: 520,
        totalPrice: 31200,
      },
      {
        id: "item-2-2",
        productId: "prod-5",
        productCode: "EAK-LV-1000",
        productName: "Liv-Health Tonic",
        packSize: "1 Litre",
        quantity: 40,
        unitPrice: 850,
        totalPrice: 34000,
      },
    ],
    totalItems: 100,
    subtotal: 65200,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 2.5,
    discountPercent: 5.0,
    discountAmount: 3260,
    grandTotal: 61940,
    paidAmount: 20000,
    returnedAmount: 2600,
    dueAmount: 39340,
    paymentStatus: "Partially Paid",
    status: "Approved",
    approvedAt: "04/09/2026, 02:40 PM",
    bonusItems: [
      {
        id: "bon-2-1",
        productId: "prod-2",
        productCode: "EAK-VIT-AD3",
        productName: "Eakvit-AD3E Liquid",
        packSize: "500 ml",
        quantity: 5,
        unit: "Bottle",
      },
    ],
  },
  {
    id: "ord-003",
    code: "INV-2026-003",
    date: "04/09/2026, 03:20 PM",
    customerId: "cust-3",
    customerCode: "CUST-003",
    customerName: "Abdur Rashid",
    shopName: "Rashid Dairy & Poultry Medicine",
    phone: "01733-445522",
    address: "Bypass Road, Tongi Industrial Area",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Dhaka Central Depot",
    items: [
      {
        id: "item-3-1",
        productId: "prod-6",
        productCode: "EAK-ANT-50",
        productName: "Anthel-Plus Bolus",
        packSize: "5 x 4 Bolus",
        quantity: 50,
        unitPrice: 380,
        totalPrice: 19000,
      },
    ],
    totalItems: 50,
    subtotal: 19000,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 0,
    discountPercent: 2.5,
    discountAmount: 475,
    grandTotal: 18525,
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
    customerId: "cust-6",
    customerCode: "CUST-006",
    customerName: "Shahid Ullah",
    shopName: "Northern Agro & Vet Supplies",
    phone: "01866-778855",
    address: "Sherpur Main Road, Bogura Town",
    officerId: "off-4",
    officerCode: "OFF-004",
    officerName: "Zakir Hossain",
    depotId: "dep-3",
    depotName: "Bogura Depot",
    items: [
      {
        id: "item-4-1",
        productId: "prod-1",
        productCode: "EAK-AMX-100",
        productName: "Eakmox-Vet 100ml",
        packSize: "100 ml",
        quantity: 80,
        unitPrice: 450,
        totalPrice: 36000,
      },
      {
        id: "item-4-2",
        productId: "prod-3",
        productCode: "EAK-CAL-500",
        productName: "Cal-Eakin Gel Forte",
        packSize: "300 gm",
        quantity: 100,
        unitPrice: 320,
        totalPrice: 32000,
      },
      {
        id: "item-4-3",
        productId: "prod-7",
        productCode: "EAK-MIN-MIX",
        productName: "Eakmin Mineral Mixture",
        packSize: "5 kg",
        quantity: 25,
        unitPrice: 1100,
        totalPrice: 27500,
      },
    ],
    totalItems: 205,
    subtotal: 95500,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 0,
    discountPercent: 2.5,
    discountAmount: 2387.5,
    grandTotal: 93112.5,
    paidAmount: 0,
    dueAmount: 93112.5,
    returnedAmount: 0,
    paymentStatus: "Unpaid",
    status: "Pending",
  },
  {
    id: "ord-005",
    code: "INV-2026-005",
    date: "02/09/2026, 01:45 PM",
    customerId: "cust-7",
    customerCode: "CUST-007",
    customerName: "Mahbubur Rahman",
    shopName: "Agrabad Vet & Pet Care",
    phone: "01977-889966",
    address: "Commercial Area, Agrabad, Chittagong",
    officerId: "off-5",
    officerCode: "OFF-005",
    officerName: "Shafiqul Alam",
    depotId: "dep-2",
    depotName: "Chittagong Regional Depot",
    items: [
      {
        id: "item-5-1",
        productId: "prod-7",
        productCode: "EAK-MIN-MIX",
        productName: "Eakmin Mineral Mixture",
        packSize: "5 kg",
        quantity: 30,
        unitPrice: 1100,
        totalPrice: 33000,
      },
      {
        id: "item-5-2",
        productId: "prod-8",
        productCode: "EAK-PRO-IMM",
        productName: "Immuno-Boost Powder",
        packSize: "250 gm",
        quantity: 50,
        unitPrice: 420,
        totalPrice: 21000,
      },
    ],
    totalItems: 80,
    subtotal: 54000,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 1.5,
    discountPercent: 4.0,
    discountAmount: 2160,
    grandTotal: 51840,
    paidAmount: 25000,
    returnedAmount: 1680,
    dueAmount: 25160,
    paymentStatus: "Partially Paid",
    status: "Approved",
    approvedAt: "02/09/2026, 04:30 PM",
    bonusItems: [
      {
        id: "bon-5-1",
        productId: "prod-8",
        productCode: "EAK-PRO-IMM",
        productName: "Immuno-Boost Powder",
        packSize: "250 gm",
        quantity: 3,
        unit: "Pouch",
      },
    ],
  },
  {
    id: "ord-006",
    code: "INV-2026-006",
    date: "01/09/2026, 04:00 PM",
    customerId: "cust-4",
    customerCode: "CUST-004",
    customerName: "Dr. Golam Sarwar",
    shopName: "Sarwar Vet Pharmacy",
    phone: "01744-556633",
    address: "Main Road, Ashulia Center",
    officerId: "off-2",
    officerCode: "OFF-002",
    officerName: "Tanvir Ahmed",
    depotId: "dep-1",
    depotName: "Dhaka Central Depot",
    items: [
      {
        id: "item-6-1",
        productId: "prod-2",
        productCode: "EAK-VIT-AD3",
        productName: "Eakvit-AD3E Liquid",
        packSize: "500 ml",
        quantity: 45,
        unitPrice: 680,
        totalPrice: 30600,
      },
      {
        id: "item-6-2",
        productId: "prod-4",
        productCode: "EAK-ENR-200",
        productName: "Enrocyn-Vet 20%",
        packSize: "100 ml",
        quantity: 35,
        unitPrice: 520,
        totalPrice: 18200,
      },
    ],
    totalItems: 80,
    subtotal: 48800,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 1.0,
    discountPercent: 3.5,
    discountAmount: 1708,
    grandTotal: 47092,
    paidAmount: 47092,
    returnedAmount: 0,
    dueAmount: 0,
    paymentStatus: "Paid",
    status: "Approved",
    approvedAt: "02/09/2026, 10:15 AM",
    bonusItems: [
      {
        id: "bon-6-1",
        productId: "prod-1",
        productCode: "EAK-AMX-100",
        productName: "Eakmox-Vet 100ml",
        packSize: "100 ml",
        quantity: 4,
        unit: "Bottle",
      },
    ],
  },
  {
    id: "ord-007",
    code: "INV-2026-007",
    date: "01/09/2026, 02:15 PM",
    customerId: "cust-8",
    customerCode: "CUST-008",
    customerName: "Enamul Haque",
    shopName: "Padma Dairy & Vet Medicine",
    phone: "01788-990077",
    address: "Station Bazar, Rajshahi Sadar",
    officerId: "off-6",
    officerCode: "OFF-006",
    officerName: "Biplob Kumar",
    depotId: "dep-4",
    depotName: "Rajshahi Depot",
    items: [
      {
        id: "item-7-1",
        productId: "prod-4",
        productCode: "EAK-ENR-200",
        productName: "Enrocyn-Vet 20%",
        packSize: "100 ml",
        quantity: 40,
        unitPrice: 520,
        totalPrice: 20800,
      },
      {
        id: "item-7-2",
        productId: "prod-5",
        productCode: "EAK-LV-1000",
        productName: "Liv-Health Tonic",
        packSize: "1 Litre",
        quantity: 25,
        unitPrice: 850,
        totalPrice: 21250,
      },
    ],
    totalItems: 65,
    subtotal: 42050,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 0,
    discountPercent: 2.5,
    discountAmount: 1051.25,
    grandTotal: 40998.75,
    paidAmount: 0,
    dueAmount: 40998.75,
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
    address: "Holding #45, Station Road, Gazipur Chowrasta",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Dhaka Central Depot",
    items: [
      {
        id: "item-8-1",
        productId: "prod-5",
        productCode: "EAK-LV-1000",
        productName: "Liv-Health Tonic",
        packSize: "1 Litre",
        quantity: 80,
        unitPrice: 850,
        totalPrice: 68000,
      },
      {
        id: "item-8-2",
        productId: "prod-3",
        productCode: "EAK-CAL-500",
        productName: "Cal-Eakin Gel Forte",
        packSize: "300 gm",
        quantity: 50,
        unitPrice: 320,
        totalPrice: 16000,
      },
    ],
    totalItems: 130,
    subtotal: 84000,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 2.26,
    discountPercent: 4.76,
    discountAmount: 4000,
    grandTotal: 80000,
    paidAmount: 0,
    dueAmount: 80000,
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
    address: "Holding #45, Station Road, Gazipur Chowrasta",
    officerId: "off-1",
    officerCode: "OFF-001",
    officerName: "Arafat Hossain",
    depotId: "dep-1",
    depotName: "Dhaka Central Depot",
    items: [
      {
        id: "item-9-1",
        productId: "prod-7",
        productCode: "EAK-MIN-MIX",
        productName: "Eakmin Mineral Mixture",
        packSize: "5 kg",
        quantity: 25,
        unitPrice: 1100,
        totalPrice: 27500,
      },
      {
        id: "item-9-2",
        productId: "prod-8",
        productCode: "EAK-PRO-IMM",
        productName: "Immuno-Boost Powder",
        packSize: "250 gm",
        quantity: 10,
        unitPrice: 420,
        totalPrice: 4200,
      },
    ],
    totalItems: 35,
    subtotal: 31700,
    officerDiscountPercent: 2.5,
    adminDiscountPercent: 2.86,
    discountPercent: 5.36,
    discountAmount: 1700,
    grandTotal: 30000,
    paidAmount: 0,
    dueAmount: 30000,
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
    amount: 20000,
    paymentMethod: "Bank Transfer",
    recordedBy: "Admin (Finance)",
    note: "Payment received via Sonali Bank AC #0921",
    allocations: [
      {
        orderId: "ord-002",
        orderCode: "INV-2026-002",
        orderDate: "04/09/2026, 11:15 AM",
        originalGrandTotal: 61940,
        previousDue: 59340,
        allocatedAmount: 20000,
        remainingDue: 39340,
      },
    ],
  },
  {
    id: "col-002",
    code: "COL-2026-002",
    customerId: "cust-7",
    customerCode: "CUST-007",
    customerName: "Mahbubur Rahman",
    shopName: "Agrabad Vet & Pet Care",
    date: "03/09/2026, 11:30 AM",
    amount: 25000,
    paymentMethod: "Cash",
    recordedBy: "Admin (Finance)",
    note: "Cash collected by Depot Accounts Officer",
    allocations: [
      {
        orderId: "ord-005",
        orderCode: "INV-2026-005",
        orderDate: "02/09/2026, 01:45 PM",
        originalGrandTotal: 51840,
        previousDue: 50160,
        allocatedAmount: 25000,
        remainingDue: 25160,
      },
    ],
  },
  {
    id: "col-003",
    code: "COL-2026-003",
    customerId: "cust-4",
    customerCode: "CUST-004",
    customerName: "Dr. Golam Sarwar",
    shopName: "Sarwar Vet Pharmacy",
    date: "02/09/2026, 02:45 PM",
    amount: 47092,
    paymentMethod: "Cheque",
    recordedBy: "Admin (Finance)",
    note: "Islami Bank Cheque #CHQ-88291 Cleared",
    allocations: [
      {
        orderId: "ord-006",
        orderCode: "INV-2026-006",
        orderDate: "01/09/2026, 04:00 PM",
        originalGrandTotal: 47092,
        previousDue: 47092,
        allocatedAmount: 47092,
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
    depotName: "Dhaka Central Depot",
    date: "04/09/2026, 05:00 PM",
    reason: "Damaged outer seal on arrival",
    recordedBy: "Admin (Warehouse)",
    totalReturnedQuantity: 5,
    totalReturnAmount: 2600,
    items: [
      {
        productId: "prod-4",
        productCode: "EAK-ENR-200",
        productName: "Enrocyn-Vet 20%",
        packSize: "100 ml",
        unit: "Bottle",
        unitPrice: 520,
        deliveredQuantity: 60,
        returnedQuantity: 5,
        returnAmount: 2600,
      },
    ],
  },
  {
    id: "ret-002",
    code: "RET-2026-002",
    customerId: "cust-7",
    customerCode: "CUST-007",
    customerName: "Mahbubur Rahman",
    shopName: "Agrabad Vet & Pet Care",
    orderId: "ord-005",
    orderCode: "INV-2026-005",
    orderDate: "02/09/2026, 01:45 PM",
    depotId: "dep-2",
    depotName: "Chittagong Regional Depot",
    date: "03/09/2026, 02:20 PM",
    reason: "Near expiry exchange request",
    recordedBy: "Admin (Warehouse)",
    totalReturnedQuantity: 4,
    totalReturnAmount: 1680,
    items: [
      {
        productId: "prod-8",
        productCode: "EAK-PRO-IMM",
        productName: "Immuno-Boost Powder",
        packSize: "250 gm",
        unit: "Pouch",
        unitPrice: 420,
        deliveredQuantity: 50,
        returnedQuantity: 4,
        returnAmount: 1680,
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
    depotName: "Dhaka Central Depot",
    productId: "prod-2",
    productCode: "EAK-VIT-AD3",
    productName: "Eakvit-AD3E Liquid",
    packSize: "500 ml",
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
    depotId: "dep-3",
    depotName: "Bogura Depot",
    productId: "prod-1",
    productCode: "EAK-AMX-100",
    productName: "Eakmox-Vet 100ml",
    packSize: "100 ml",
    quantity: 20,
    customerId: "cust-6",
    customerCode: "CUST-006",
    customerName: "Shahid Ullah",
    reference: "Pharmacy stock adjustment",
  },
  {
    id: "mov-003",
    date: "03/09/2026, 02:20 PM",
    movementType: "Return",
    depotId: "dep-2",
    depotName: "Chittagong Regional Depot",
    productId: "prod-8",
    productCode: "EAK-PRO-IMM",
    productName: "Immuno-Boost Powder",
    packSize: "250 gm",
    quantity: 8,
    customerId: "cust-7",
    customerCode: "CUST-007",
    customerName: "Mahbubur Rahman",
    reference: "Overstock exchange",
  },
  {
    id: "mov-004",
    date: "02/09/2026, 11:45 AM",
    movementType: "Return",
    depotId: "dep-1",
    depotName: "Dhaka Central Depot",
    productId: "prod-3",
    productCode: "EAK-CAL-500",
    productName: "Cal-Eakin Gel Forte",
    packSize: "300 gm",
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
    depotId: "dep-4",
    depotName: "Rajshahi Depot",
    productId: "prod-4",
    productCode: "EAK-ENR-200",
    productName: "Enrocyn-Vet 20%",
    packSize: "100 ml",
    quantity: 12,
    customerId: "cust-8",
    customerCode: "CUST-008",
    customerName: "Enamul Haque",
    reference: "Batch return exchange",
  },
  {
    id: "mov-006",
    date: "31/08/2026, 01:00 PM",
    movementType: "Return",
    depotId: "dep-1",
    depotName: "Dhaka Central Depot",
    productId: "prod-6",
    productCode: "EAK-ANT-50",
    productName: "Anthel-Plus Bolus",
    packSize: "5 x 4 Bolus",
    quantity: 25,
    customerId: "cust-3",
    customerCode: "CUST-003",
    customerName: "Abdur Rashid",
    reference: "Prescription adjustment return",
  },
]
