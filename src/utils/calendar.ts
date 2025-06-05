import type { Subscription, CalendarDay } from "~/types/subscription"

export function getDaysInMonth(year: number, month: number): CalendarDay[] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days: CalendarDay[] = []
  const today = new Date()

  // Add previous month's trailing days
  const prevMonth = new Date(year, month - 1, 0)
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonth.getDate() - i)
    days.push({
      date,
      subscriptions: [],
      isCurrentMonth: false,
      isToday: false,
    })
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push({
      date,
      subscriptions: [],
      isCurrentMonth: true,
      isToday: date.toDateString() === today.toDateString(),
    })
  }

  // Add next month's leading days
  const remainingDays = 42 - days.length // 6 rows × 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day)
    days.push({
      date,
      subscriptions: [],
      isCurrentMonth: false,
      isToday: false,
    })
  }

  return days
}

export function getSubscriptionsForDay(subscriptions: Subscription[], date: Date): Subscription[] {
  return subscriptions.filter((sub) => {
    if (sub.frequency === "monthly") {
      return date.getDate() === sub.paymentDay
    } else {
      // For annual subscriptions, check if it's the anniversary date
      const nextPayment = new Date(sub.nextPayment)
      return date.getDate() === nextPayment.getDate() && date.getMonth() === nextPayment.getMonth()
    }
  })
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function getMonthlyTotal(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => {
    if (sub.frequency === "monthly") {
      return total + sub.amount
    } else {
      return total + sub.amount / 12 // Convert annual to monthly
    }
  }, 0)
}

export function getTotalForDay(subscriptions: Subscription[]): number {
  return subscriptions.reduce((total, sub) => total + sub.amount, 0)
}
