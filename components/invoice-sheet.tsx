"use client"

import * as React from "react"
import Image from "next/image"
import {
  Store,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Gift,
} from "lucide-react"
import { type Order } from "@/lib/mock-data"
import { useAppState } from "@/lib/store"
import { formatDate, numberToWords } from "@/lib/utils"

interface InvoiceSheetProps {
  order: Order
}

export function InvoiceSheet({ order }: InvoiceSheetProps) {
  const { officers } = useAppState()

  // Match officer for territory and phone details
  const matchedOfficer = React.useMemo(() => {
    return (
      officers.find(
        (o) =>
          o.id === order.officerId ||
          o.code === order.officerCode ||
          o.name.toLowerCase() === order.officerName.toLowerCase()
      ) || null
    )
  }, [order, officers])

  return (
    <div className="space-y-6 text-foreground">
      {/* 1. Brand Header: Centered Logo & Title, Right-aligned Invoice Code & Date (without time) */}
      <div className="relative border-b border-border pb-5 pt-1">
        {/* Centered Logo & Company Title */}
        <div className="flex flex-col items-center justify-center text-center">
          <Image
            src="/logo.jpeg"
            alt="Eakin Animal Health Logo"
            width={160}
            height={45}
            className="h-11 w-auto object-contain mb-1"
            priority
          />
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Eakin Animal Health
          </h1>
        </div>

        {/* Invoice Code and Clean Date (No Time) */}
        <div className="mt-3 sm:mt-0 sm:absolute sm:right-0 sm:top-1 text-center sm:text-right print:absolute print:right-0 print:top-1 print:text-right">
          <div className="inline-block rounded border border-primary/20 bg-primary/5 px-2.5 py-1 text-xs font-mono font-bold text-primary">
            INVOICE
          </div>
          <div className="mt-1 font-mono text-xs font-bold text-foreground">
            {order.code}
          </div>
          <div className="text-[11px] text-black font-medium">
            Date: {formatDate(order.date)}
          </div>
        </div>
      </div>

      {/* 2. Order Status Banner (Hidden entirely in print) */}
      <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3 text-xs print:hidden">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-black">Order Status:</span>
          {order.status === "Pending" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 font-semibold text-[11px]">
              <Clock className="size-3" /> Pending Review
            </span>
          )}
          {order.status === "Approved" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 text-primary px-2.5 py-0.5 font-semibold text-[11px]">
              <CheckCircle2 className="size-3" /> Approved & Dispatched
            </span>
          )}
          {order.status === "Cancelled" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/20 text-destructive px-2.5 py-0.5 font-semibold text-[11px]">
              <XCircle className="size-3" /> Cancelled
            </span>
          )}
        </div>

        {order.approvedAt && (
          <div className="text-[11px] text-black">
            Approved On: <span className="font-medium text-black">{order.approvedAt}</span>
          </div>
        )}
        {order.cancelledAt && (
          <div className="text-[11px] text-destructive">
            Cancelled On: <span className="font-medium">{order.cancelledAt}</span>
          </div>
        )}
      </div>

      {/* 3. Customer & Fulfillment Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border border-border/80 bg-card p-4 text-xs">
        {/* Customer Information */}
        <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-border pb-3 sm:pb-0 sm:pr-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-black">
            Bill To / Customer Information
          </div>
          <div className="text-sm font-bold text-black">
            {order.shopName}
          </div>
          <div className="font-medium text-black">
            Proprietor: {order.customerName}
          </div>
          <div className="flex items-center gap-1.5 text-black font-mono text-[11px]">
            <Store className="size-3 text-black" />
            <span>Customer Code: {order.customerCode}</span>
          </div>
          <div className="flex items-center gap-1.5 text-black font-mono text-[11px]">
            <Phone className="size-3 text-black" />
            <span>{order.phone}</span>
          </div>
          <div className="flex items-start gap-1.5 text-black text-[11px]">
            <MapPin className="size-3 text-black mt-0.5 shrink-0" />
            <span>{order.address}</span>
          </div>
        </div>

        {/* Fulfillment & Representative (MPO Name, Territory, Mobile, Depot) */}
        <div className="space-y-1.5 sm:pl-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-black">
            Fulfillment & Representative
          </div>
          {order.orderTakenBy === "AM/RM" ? (
            <div className="text-xs">
              <span className="text-black">MPO: </span>
              <span className="font-semibold text-black">Vacant</span>
            </div>
          ) : (
            <>
              <div className="text-xs">
                <span className="text-black">MPO: </span>
                <span className="font-semibold text-black">{order.officerName}</span>
                {order.officerCode && order.officerCode !== "-" && (
                  <span className="ml-1 font-mono text-[10px] text-black">({order.officerCode})</span>
                )}
              </div>
              <div className="text-xs">
                <span className="text-black">Territory: </span>
                <span className="font-semibold text-black">
                  {matchedOfficer?.territoryName || matchedOfficer?.areaName || "Dhunot"}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-black">Mobile: </span>
                <span className="font-mono font-medium text-black">
                  {matchedOfficer?.phone || order.phone || "01722-334411"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 4. Purchased Products Table */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-black">Purchased Products</div>
        <div className="overflow-x-auto rounded border border-border">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/50 text-[11px] font-semibold text-black uppercase">
              <tr>
                <th scope="col" className="w-10 px-3 py-2 text-center text-black">
                  SL
                </th>
                <th scope="col" className="px-3 py-2 text-black">
                  Product Code
                </th>
                <th scope="col" className="px-3 py-2 text-black">
                  Product Name
                </th>
                <th scope="col" className="px-3 py-2 text-black">
                  Pack Size
                </th>
                <th scope="col" className="px-3 py-2 text-center text-black">
                  Quantity
                </th>
                <th scope="col" className="px-3 py-2 text-right text-black">
                  TP (৳)
                </th>
                <th scope="col" className="px-3 py-2 text-right text-black">
                  Total (৳)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {order.items.map((item, idx) => (
                <tr key={item.id} className="transition-colors hover:bg-muted/20">
                  <td className="px-3 py-2 text-center font-medium text-black">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2 font-mono text-[11px] font-medium text-primary">
                    {item.productCode}
                  </td>
                  <td className="px-3 py-2 font-semibold text-black">
                    {item.productName}
                  </td>
                  <td className="px-3 py-2 text-black">
                    {item.packSize}
                  </td>
                  <td className="px-3 py-2 text-center font-mono font-bold text-black">
                    {item.quantity}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-black">
                    ৳ {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-right font-mono font-bold text-black">
                    ৳ {item.totalPrice.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bonus Products Section (if any assigned) */}
      {order.bonusItems && order.bonusItems.length > 0 && (
        <div className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Gift className="size-3.5" />
            <span>Bonus Products Assigned</span>
          </div>
          <div className="overflow-x-auto rounded border border-primary/20 bg-card">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-primary/10 bg-primary/10 text-[10px] font-semibold text-black uppercase">
                <tr>
                  <th scope="col" className="w-10 px-3 py-1.5 text-center text-black">
                    SL
                  </th>
                  <th scope="col" className="px-3 py-1.5 text-black">
                    Product Code
                  </th>
                  <th scope="col" className="px-3 py-1.5 text-black">
                    Bonus Product Name
                  </th>
                  <th scope="col" className="px-3 py-1.5 text-black">
                    Pack Size
                  </th>
                  <th scope="col" className="px-3 py-1.5 text-center font-bold text-primary">
                    Bonus Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {order.bonusItems.map((bonus, idx) => (
                  <tr key={bonus.id} className="transition-colors hover:bg-muted/10">
                    <td className="px-3 py-1.5 text-center font-medium text-black">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-1.5 font-mono text-[11px] font-medium text-primary">
                      {bonus.productCode}
                    </td>
                    <td className="px-3 py-1.5 font-semibold text-black">
                      {bonus.productName}
                    </td>
                    <td className="px-3 py-1.5 text-black">
                      {bonus.packSize}
                    </td>
                    <td className="px-3 py-1.5 text-center font-mono font-bold text-primary">
                      +{bonus.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Financial Calculation Box with Amount in Words in Left Empty Area */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pt-2">
        {/* Amount in Words (Left empty space) */}
        <div className="w-full sm:max-w-md rounded-md border border-border/80 bg-muted/10 p-3.5 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-black block mb-1">
            Amount in Words:
          </span>
          <p className="font-semibold text-black italic leading-relaxed text-xs">
            {numberToWords(order.grandTotal)} Only.
          </p>
        </div>

        {/* Financial Calculation Summary (Right) */}
        <div className="w-full sm:w-72 space-y-2 rounded-md border border-border bg-muted/20 p-3.5 text-xs shrink-0">
          <div className="flex items-center justify-between text-black">
            <span>Subtotal:</span>
            <span className="font-mono font-semibold text-black">
              ৳ {order.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Officer Discount */}
          <div className="flex items-center justify-between text-black">
            <span>Officer Discount ({order.officerDiscountPercent ?? 2.5}%):</span>
            <span className="font-mono font-semibold text-primary">
              - ৳ {((order.subtotal * (order.officerDiscountPercent ?? 2.5)) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Admin Additional Discount if any */}
          {order.adminDiscountPercent !== undefined && order.adminDiscountPercent > 0 && (
            <div className="flex items-center justify-between text-black">
              <span>Admin Addl. Discount ({order.adminDiscountPercent}%):</span>
              <span className="font-mono font-semibold text-primary">
                - ৳ {((order.subtotal * order.adminDiscountPercent) / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <div className="border-t border-border pt-2 flex items-center justify-between font-bold text-sm text-black">
            <span>Grand Total:</span>
            <span className="font-mono text-base text-primary">
              ৳ {order.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Signatures Block */}
      <div className="pt-10 pb-4 space-y-12">
        <p className="text-[11px] text-black italic">
          &ldquo;I do hereby accept that, I have a valid license.&rdquo;
        </p>

        <div className="grid grid-cols-3 gap-6 text-xs items-end">
          {/* Customer Signature */}
          <div className="text-left">
            <div className="border-t border-dashed border-border/80 pt-1.5">
              <span className="font-semibold text-black text-xs block">Customer Signature</span>
            </div>
          </div>

          {/* Depot Manager Signature */}
          <div className="text-center">
            <div className="border-t border-dashed border-border/80 pt-1.5">
              <span className="font-semibold text-black text-xs block">Depot Manager Signature</span>
            </div>
          </div>

          {/* MPO Signature */}
          <div className="text-right">
            <div className="border-t border-dashed border-border/80 pt-1.5">
              <span className="font-semibold text-black text-xs block">MPO Signature</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Office Address Footer at bottom left */}
      <div className="pt-2 text-[11px] text-black">
        <strong className="text-black">Office Address:</strong> Latifpur, Kolony, Bogura.
      </div>
    </div>
  )
}
