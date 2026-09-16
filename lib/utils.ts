import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Standard System Date Formatter: DD/MM/YYYY
 * Example: 05/09/2026
 */
export function formatDate(dateInput?: string | Date | null): string {
  if (!dateInput) return ""

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim()
    // Already matches DD/MM/YYYY or starts with DD/MM/YYYY
    const ddmmyyyyMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})/)
    if (ddmmyyyyMatch) {
      return `${ddmmyyyyMatch[1]}/${ddmmyyyyMatch[2]}/${ddmmyyyyMatch[3]}`
    }

    // Matches YYYY-MM-DD (from input type="date")
    const yyyymmddMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (yyyymmddMatch) {
      return `${yyyymmddMatch[3]}/${yyyymmddMatch[2]}/${yyyymmddMatch[1]}`
    }

    // Try parsing as Date
    const parsed = new Date(trimmed)
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, "0")
      const month = String(parsed.getMonth() + 1).padStart(2, "0")
      const year = parsed.getFullYear()
      return `${day}/${month}/${year}`
    }

    return trimmed
  }

  const d = dateInput
  if (isNaN(d.getTime())) return ""
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Standard System Date & Time Formatter: DD/MM/YYYY, hh:mm A
 * Example: 05/09/2026, 10:30 AM
 */
export function formatDateTime(dateInput?: string | Date | null): string {
  const d = dateInput instanceof Date ? dateInput : (dateInput ? new Date(dateInput) : new Date())
  const validDate = isNaN(d.getTime()) ? new Date() : d

  const day = String(validDate.getDate()).padStart(2, "0")
  const month = String(validDate.getMonth() + 1).padStart(2, "0")
  const year = validDate.getFullYear()

  let hours = validDate.getHours()
  const minutes = String(validDate.getMinutes()).padStart(2, "0")
  const ampm = hours >= 12 ? "PM" : "AM"
  hours = hours % 12
  hours = hours ? hours : 12 // 0 becomes 12
  const formattedHours = String(hours).padStart(2, "0")

  return `${day}/${month}/${year}, ${formattedHours}:${minutes} ${ampm}`
}

/**
 * Standard Month-Year Formatter: MM/YYYY
 * Example: 09/2026
 */
export function formatMonthYear(dateInput?: string | Date | null): string {
  const d = dateInput instanceof Date ? dateInput : (dateInput ? new Date(dateInput) : new Date())
  const validDate = isNaN(d.getTime()) ? new Date() : d
  const month = String(validDate.getMonth() + 1).padStart(2, "0")
  const year = validDate.getFullYear()
  return `${month}/${year}`
}

/**
 * Safely parse date strings (DD/MM/YYYY, DD/MM/YYYY, hh:mm A, YYYY-MM-DD, etc.) into a numeric timestamp
 */
export function parseDateToTimestamp(dateStr?: string | Date | null): number {
  if (!dateStr) return 0
  if (dateStr instanceof Date) return isNaN(dateStr.getTime()) ? 0 : dateStr.getTime()

  const str = String(dateStr).trim()

  // Match DD/MM/YYYY or DD/MM/YYYY, HH:MM AM/PM
  const ddmmyyyyMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:,\s*(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?)?/i)
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10)
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1
    const year = parseInt(ddmmyyyyMatch[3], 10)
    let hours = ddmmyyyyMatch[4] ? parseInt(ddmmyyyyMatch[4], 10) : 0
    const minutes = ddmmyyyyMatch[5] ? parseInt(ddmmyyyyMatch[5], 10) : 0
    const ampm = ddmmyyyyMatch[6]?.toUpperCase()

    if (ampm === "PM" && hours < 12) hours += 12
    if (ampm === "AM" && hours === 12) hours = 0

    return new Date(year, month, day, hours, minutes).getTime()
  }

  // Match YYYY-MM-DD
  const yyyymmddMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (yyyymmddMatch) {
    const year = parseInt(yyyymmddMatch[1], 10)
    const month = parseInt(yyyymmddMatch[2], 10) - 1
    const day = parseInt(yyyymmddMatch[3], 10)
    return new Date(year, month, day).getTime()
  }

  const d = new Date(str)
  return isNaN(d.getTime()) ? 0 : d.getTime()
}

/**
 * Check if a date string falls in a given range
 */
export function isDateInRange(dateStr: string, startDate?: string, endDate?: string): boolean {
  if (!startDate && !endDate) return true
  const targetTs = parseDateToTimestamp(dateStr)
  if (!targetTs) return true

  if (startDate) {
    const startTs = parseDateToTimestamp(startDate)
    if (startTs && targetTs < startTs) return false
  }

  if (endDate) {
    // End date should include the full end day (23:59:59)
    const endTs = parseDateToTimestamp(endDate) + 86400000 - 1
    if (endTs && targetTs > endTs) return false
  }

  return true
}

/**
 * Convert numeric currency amounts to English words (Bangladeshi Lakh/Crore format)
 * Example: 197980 -> "Taka One Lakh Ninety Seven Thousand Nine Hundred Eighty"
 */
export function numberToWords(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "Taka Zero"
  const integerPart = Math.floor(Math.abs(amount))
  const decimalPart = Math.round((Math.abs(amount) - integerPart) * 100)

  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ]
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ]

  function convertTwoDigits(n: number): string {
    if (n < 20) return ones[n]
    const ten = Math.floor(n / 10)
    const unit = n % 10
    return (tens[ten] + (unit > 0 ? " " + ones[unit] : "")).trim()
  }

  function convertThreeDigits(n: number): string {
    let str = ""
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred"
      n %= 100
      if (n > 0) str += " "
    }
    if (n > 0) {
      str += convertTwoDigits(n)
    }
    return str.trim()
  }

  if (integerPart === 0 && decimalPart === 0) return "Taka Zero"

  let n = integerPart
  const crore = Math.floor(n / 10000000)
  n %= 10000000
  const lakh = Math.floor(n / 100000)
  n %= 100000
  const thousand = Math.floor(n / 1000)
  n %= 1000
  const remainder = n

  const parts: string[] = []
  if (crore > 0) {
    parts.push((crore >= 100 ? convertThreeDigits(crore) : convertTwoDigits(crore)) + " Crore")
  }
  if (lakh > 0) {
    parts.push(convertTwoDigits(lakh) + " Lakh")
  }
  if (thousand > 0) {
    parts.push(convertTwoDigits(thousand) + " Thousand")
  }
  if (remainder > 0) {
    parts.push(convertThreeDigits(remainder))
  }

  let text = "Taka " + (parts.length > 0 ? parts.join(" ") : "Zero")
  if (decimalPart > 0) {
    text += " and " + convertTwoDigits(decimalPart) + " Paisa"
  }
  return text
}

/**
 * Returns current date in YYYY-MM-DD local format
 */
export function getLocalTodayDateString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/**
 * Checks if an MPO is active based on Resignation Date.
 * If resignationDate is empty: active.
 * If resignationDate exists: active through that date.
 * Day after resignationDate: no longer active.
 */
export function isMPOActive(
  officer?: { resignationDate?: string } | null,
  todayDateStr?: string
): boolean {
  if (!officer) return false
  if (!officer.resignationDate || !officer.resignationDate.trim()) return true

  const today = todayDateStr || getLocalTodayDateString()
  let cleanResign = officer.resignationDate.trim()

  // If in DD/MM/YYYY format, convert to YYYY-MM-DD for standard comparison
  const ddmmyyyy = cleanResign.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (ddmmyyyy) {
    cleanResign = `${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, "0")}-${ddmmyyyy[1].padStart(2, "0")}`
  }

  return today <= cleanResign
}

