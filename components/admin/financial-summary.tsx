"use client"

import * as React from "react"
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  CircleDollarSign,
  ArrowUpRight,
  HandCoins,
  BadgeAlert,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface FinancialSummaryData {
  lifetimeSales: number
  lifetimeCollected: number
  lifetimeOutstanding: number
  thisMonthSales: number
  thisMonthCollected: number
  thisMonthOutstanding: number
}

interface FinancialSummaryProps {
  data: FinancialSummaryData
  title?: string
}

export function FinancialSummary({
  data,
  title = "Financial Performance Summary",
}: FinancialSummaryProps) {
  return (
    <Card className="border-border/80 bg-card shadow-xs">
      <CardHeader className="border-b border-border/70 px-4 py-2">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <CircleDollarSign className="size-4 text-primary" />
            <CardTitle className="text-xs font-semibold text-foreground sm:text-sm">
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-2 sm:p-1 space-y-1">
        {/* ROW 1: LIFETIME PERFORMANCE */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="size-2 text-muted-foreground" />
              <span>Lifetime Overview</span>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              All-Time Cumulative
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/* 1. Lifetime Sales */}
            <div className="rounded border border-border/70 bg-muted/20 px-3 py-2 transition-colors hover:border-primary/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Lifetime Sales
                </span>
                <div className="flex size-5 items-center justify-center rounded bg-primary/10 text-primary">
                  <TrendingUp className="size-3" />
                </div>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-foreground">
                ৳ {data.lifetimeSales.toLocaleString()}
              </p>
            </div>

            {/* 2. Lifetime Collected */}
            <div className="rounded border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 transition-colors hover:border-emerald-500/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                  Lifetime Collected
                </span>
                <div className="flex size-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" />
                </div>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                ৳ {data.lifetimeCollected.toLocaleString()}
              </p>
            </div>

            {/* 3. Lifetime Outstanding */}
            <div className="rounded border border-amber-500/25 bg-amber-500/5 px-3 py-2 transition-colors hover:border-amber-500/40 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
                  Lifetime Outstanding
                </span>
                <div className="flex size-5 items-center justify-center rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-3" />
                </div>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-amber-600 dark:text-amber-400">
                ৳ {data.lifetimeOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* ROW 2: CURRENT MONTH PERFORMANCE */}
        <div className="space-y-1 border-t border-border/50 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="size-2 text-primary" />
              <span>Current Month Performance</span>
            </div>
            <span className="rounded-xs border border-primary/20 bg-primary/5 px-1 py-0.5 text-[10px] font-medium text-primary">
              09/2026
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {/* 4. This Month's Sales */}
            <div className="rounded border border-border/70 bg-muted/20 px-3 py-2 transition-colors hover:border-primary/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  This Month&apos;s Sales
                </span>
                <div className="flex size-5 items-center justify-center rounded bg-primary/10 text-primary">
                  <ArrowUpRight className="size-3" />
                </div>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-foreground">
                ৳ {data.thisMonthSales.toLocaleString()}
              </p>
            </div>

            {/* 5. This Month's Collected */}
            <div className="rounded border border-emerald-500/25 bg-emerald-500/5 px-3 py-2 transition-colors hover:border-emerald-500/40">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
                  This Month&apos;s Collected
                </span>
                <div className="flex size-5 items-center justify-center rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <HandCoins className="size-3" />
                </div>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                ৳ {data.thisMonthCollected.toLocaleString()}
              </p>
            </div>

            {/* 6. This Month's Outstanding */}
            <div className="rounded border border-amber-500/25 bg-amber-500/5 px-3 py-2 transition-colors hover:border-amber-500/40 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
                  This Month&apos;s Outstanding
                </span>
                <div className="flex size-5 items-center justify-center rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                  <BadgeAlert className="size-3" />
                </div>
              </div>
              <p className="mt-1 font-mono text-base font-bold text-amber-600 dark:text-amber-400">
                ৳ {data.thisMonthOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
