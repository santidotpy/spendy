import type { LucideIcon } from "lucide-react"
import type { TransactionOutput } from "~/server/api/types"

export interface Subscription {
  id: string
  name: string
  amount: number
  currency: string
  color: string
  icon: LucideIcon
  paymentDay: number
  frequency: "monthly" | "annual"
  nextPayment: Date
  category: string
}

export interface CalendarDay {
  date: Date
  transactions: TransactionOutput[]
  isCurrentMonth: boolean
  isToday: boolean
}
