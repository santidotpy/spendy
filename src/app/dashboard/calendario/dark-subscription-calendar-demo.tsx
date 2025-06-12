"use client"

import { useState } from "react"
import {
  Music,
  Video,
  Home,
  Briefcase,
  Palette,
  Package,
  TrendingUp,
  Cloud,
  Gamepad2,
  Coffee,
  Car,
  Dumbbell,
} from "lucide-react"
import { DarkSubscriptionCalendar } from "~/components/dark-subscription-calendar"
import { SubscriptionDetailsDialog } from "~/components/subscription-details-dialog"
import type { Subscription, CalendarDay } from "~/types/subscription"
import { TransactionOutput } from "~/server/api/types"
import { identifySubscriptions } from "~/lib/utils"

// Sample subscription data with proper icons and categories
const sampleSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Spotify Premium",
    amount: 9.99,
    currency: "USD",
    color: "#1DB954",
    icon: Music,
    paymentDay: 15,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 15),
    category: "Entertainment",
  },
  {
    id: "2",
    name: "Netflix",
    amount: 15.99,
    currency: "USD",
    color: "#E50914",
    icon: Video,
    paymentDay: 12,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 12),
    category: "Entertainment",
  },
  {
    id: "3",
    name: "Airbnb Plus",
    amount: 199,
    currency: "USD",
    color: "#FF5A5F",
    icon: Home,
    paymentDay: 7,
    frequency: "annual",
    nextPayment: new Date(2024, 9, 7),
    category: "Travel",
  },
  {
    id: "4",
    name: "LinkedIn Premium",
    amount: 29.99,
    currency: "USD",
    color: "#0077B5",
    icon: Briefcase,
    paymentDay: 24,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 24),
    category: "Professional",
  },
  {
    id: "5",
    name: "Adobe Creative Cloud",
    amount: 52.99,
    currency: "USD",
    color: "#FF0000",
    icon: Palette,
    paymentDay: 2,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 2),
    category: "Professional",
  },
  {
    id: "6",
    name: "Amazon Prime",
    amount: 8.99,
    currency: "USD",
    color: "#FF9900",
    icon: Package,
    paymentDay: 30,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 30),
    category: "Shopping",
  },
  {
    id: "7",
    name: "Robinhood Gold",
    amount: 5.0,
    currency: "USD",
    color: "#00C805",
    icon: TrendingUp,
    paymentDay: 11,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 11),
    category: "Finance",
  },
  {
    id: "8",
    name: "iCloud Storage",
    amount: 2.99,
    currency: "USD",
    color: "#007AFF",
    icon: Cloud,
    paymentDay: 18,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 18),
    category: "Productivity",
  },
  {
    id: "9",
    name: "PlayStation Plus",
    amount: 8.99,
    currency: "USD",
    color: "#003791",
    icon: Gamepad2,
    paymentDay: 22,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 22),
    category: "Entertainment",
  },
  {
    id: "10",
    name: "Starbucks Rewards",
    amount: 25.0,
    currency: "USD",
    color: "#00704A",
    icon: Coffee,
    paymentDay: 1,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 1),
    category: "Food & Drink",
  },
  {
    id: "11",
    name: "Tesla Supercharging",
    amount: 15.99,
    currency: "USD",
    color: "#CC0000",
    icon: Car,
    paymentDay: 5,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 5),
    category: "Transportation",
  },
  {
    id: "12",
    name: "Fitness+ Premium",
    amount: 12.99,
    currency: "USD",
    color: "#FA7268",
    icon: Dumbbell,
    paymentDay: 28,
    frequency: "monthly",
    nextPayment: new Date(2024, 9, 28),
    category: "Health & Fitness",
  },
]

export default function DarkSubscriptionCalendarDemo({ transactions }: { transactions: TransactionOutput[] }) {
  const subscriptionData = identifySubscriptions(transactions)

  // Map SubscriptionData to Subscription for the calendar
  const subscriptions: Subscription[] = subscriptionData.map((sub) => {
    // Try to infer paymentDay and frequency
    let paymentDay = 1
    let frequency: "monthly" | "annual" = "monthly"
    let nextPayment: Date = new Date(sub.nextPayment)
    if (sub.transactions && sub.transactions.length > 0 && sub.transactions[0]) {
      const lastDate = new Date(sub.transactions[0].date)
      paymentDay = lastDate.getDate()
      // Heuristic: if the gap between last two payments is > 28 days, treat as annual
      if (sub.transactions.length > 1 && sub.transactions[1]) {
        const prevDate = new Date(sub.transactions[1].date)
        const diffDays = Math.abs((lastDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays > 330) frequency = "annual"
      }
    }
    return {
      id: sub.id,
      name: sub.name,
      amount: sub.monthlyAmount,
      currency: sub.currency,
      color: sub.color,
      icon: sub.icon,
      paymentDay,
      frequency,
      nextPayment,
      category: sub.category,
    }
  })

  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  const handleDayClick = (day: CalendarDay) => {
    if (day.subscriptions.length > 0) {
      setSelectedDay(day)
    }
  }

  const handleEdit = (subscriptionId: string) => {
    console.log("Edit subscription:", subscriptionId)
    // Implement edit functionality
  }

  const handleDelete = (subscriptionId: string) => {
    console.log("Delete subscription:", subscriptionId)
    // Implement delete functionality
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <DarkSubscriptionCalendar subscriptions={subscriptions} onDayClick={handleDayClick} />

      <SubscriptionDetailsDialog
        selectedDay={selectedDay}
        onClose={() => setSelectedDay(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
