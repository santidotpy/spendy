"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { CalendarDayComponent } from "~/components/calendar-day"
import { SubscriptionLegend } from "~/components/subscription-legend"
import { getDaysInMonth, getSubscriptionsForDay, getMonthlyTotal, formatCurrency } from "~/utils/calendar"
import type { Subscription, CalendarDay } from "~/types/subscription"

interface SubscriptionCalendarProps {
  subscriptions: Subscription[]
  onDayClick?: (day: CalendarDay) => void
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function SubscriptionCalendar({ subscriptions, onDayClick }: SubscriptionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const days = getDaysInMonth(year, month)
    return days.map((day) => ({
      ...day,
      subscriptions: getSubscriptionsForDay(subscriptions, day.date),
    }))
  }, [year, month, subscriptions])

  const monthlyTotal = useMemo(() => getMonthlyTotal(subscriptions), [subscriptions])

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

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")} className="rounded-full">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="text-2xl font-bold">
            {MONTHS[month]} {year}
          </h2>

          <Button variant="outline" size="icon" onClick={() => navigateMonth("next")} className="rounded-full">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Monthly spend</p>
          <p className="text-2xl font-bold">{formatCurrency(monthlyTotal, "USD")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <CalendarDayComponent key={index} day={day} onDayClick={onDayClick} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <div className="lg:col-span-1">
          <SubscriptionLegend subscriptions={subscriptions} monthlyTotal={monthlyTotal} />
        </div>
      </div>
    </div>
  )
}
