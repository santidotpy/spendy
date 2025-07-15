"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { CalendarDayComponent } from "~/components/calendar-day"
import { SubscriptionLegend } from "~/components/subscription-legend"
import { getDaysInMonth, getTransactionsForDay, getMonthlyTotal, formatCurrency } from "~/utils/calendar"
import type { TransactionOutput } from "~/server/api/types"
import type { CalendarDay } from "~/types/subscription"
import { DailySpendingChart } from "./daily-spending-chart"

interface DarkSubscriptionCalendarProps {
  transactions: TransactionOutput[]
  onDayClick?: (day: CalendarDay) => void
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

export function DarkSubscriptionCalendar({ transactions, onDayClick }: DarkSubscriptionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const days = getDaysInMonth(year, month)
    return days.map((day) => ({
      ...day,
      transactions: getTransactionsForDay(transactions, day.date),
    }))
  }, [year, month, transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date)
      return date.getFullYear() === year && date.getMonth() === month
    })
  }, [transactions, year, month])

  const monthlyTotal = useMemo(() => getMonthlyTotal(filteredTransactions), [filteredTransactions])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-4 bg-neutral-950 p-3 sm:space-y-6 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center gap-2 sm:justify-start sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("prev")}
            className="h-8 w-8 rounded-full border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <h2 className="text-xl font-bold text-white sm:text-3xl">
            {MONTHS[month]} {year}
          </h2>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("next")}
            className="h-8 w-8 rounded-full border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={goToToday}
            className="border-gray-700 bg-gray-900 text-xs text-white hover:bg-gray-800 sm:text-sm"
          >
            <CalendarIcon className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
            Hoy
          </Button>
        </div>
        <div className="text-center sm:text-right">
          <p className="text-xs text-gray-400 sm:text-sm">Gasto total</p>
          <p className="text-xl font-bold text-white sm:text-3xl">{formatCurrency(monthlyTotal, "USD")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-4">
        {/* Calendar */}
        <div className="xl:col-span-3">
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-2 sm:pb-4">
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="py-2 text-center text-xs font-medium uppercase tracking-wide text-neutral-400 sm:py-3 sm:text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-2 sm:p-4">
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {calendarDays.map((day, index) => (
                  <CalendarDayComponent key={index} day={day} onDayClick={onDayClick} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <div className="xl:col-span-1">
          <SubscriptionLegend transactions={filteredTransactions} monthlyTotal={monthlyTotal} />
        </div>

        <div className="xl:col-span-3">
          <DailySpendingChart transactions={filteredTransactions} year={year} month={month} />
        </div>
      </div>
    </div>
  )
}
