import type { LucideIcon } from "lucide-react"

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
  subscriptions: Subscription[]
  isCurrentMonth: boolean
  isToday: boolean
}
