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
    if (day.transactions.length > 0) {
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
      <DarkSubscriptionCalendar transactions={transactions} onDayClick={handleDayClick} />

      <SubscriptionDetailsDialog
        selectedDay={selectedDay}
        onClose={() => setSelectedDay(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
