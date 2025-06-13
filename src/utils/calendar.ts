import type { Subscription, CalendarDay } from "~/types/subscription"
import type { TransactionOutput } from "~/server/api/types"

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
      transactions: [],
      isCurrentMonth: false,
      isToday: false,
    })
  }

  // Add current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push({
      date,
      transactions: [],
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
      transactions: [],
      isCurrentMonth: false,
      isToday: false,
    })
  }

  return days
}

export function getTransactionsForDay(transactions: TransactionOutput[], date: Date): TransactionOutput[] {
  return transactions.filter((tx) => {
    const txDate = new Date(tx.date)
    return (
      txDate.getFullYear() === date.getFullYear() &&
      txDate.getMonth() === date.getMonth() &&
      txDate.getDate() === date.getDate()
    )
  })
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function getMonthlyTotal(transactions: TransactionOutput[]): number {
  return transactions.reduce((total, tx) => total + Number(tx.amount), 0)
}

export function getTotalForDay(transactions: TransactionOutput[]): number {
  return transactions.reduce((total, tx) => total + Number(tx.amount), 0)
}
