"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { CalendarDayComponent } from "~/components/calendar-day";
import { SubscriptionLegend } from "~/components/subscription-legend";
import {
  getDaysInMonth,
  getTransactionsForDay,
  getMonthlyTotal,
  formatCurrency,
} from "~/utils/calendar";
import type { TransactionOutput } from "~/server/api/types";
import type { CalendarDay } from "~/types/subscription";
import { DailySpendingChart } from "./daily-spending-chart";

interface DarkSubscriptionCalendarProps {
  transactions: TransactionOutput[];
  onDayClick?: (day: CalendarDay) => void;
}

const WEEKDAYS = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
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
];

export function DarkSubscriptionCalendar({
  transactions,
  onDayClick,
}: DarkSubscriptionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const days = getDaysInMonth(year, month);
    return days.map((day) => ({
      ...day,
      transactions: getTransactionsForDay(transactions, day.date),
    }));
  }, [year, month, transactions]);

  // const monthlyTotal = useMemo(() => getMonthlyTotal(transactions), [transactions])
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const date = new Date(t.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }, [transactions, year, month]);

  const monthlyTotal = useMemo(
    () => getMonthlyTotal(filteredTransactions),
    [filteredTransactions],
  );

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-6 bg-neutral-950 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("prev")}
            className="rounded-full border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="text-3xl font-bold text-white">
            {MONTHS[month]} {year}
          </h2>

          <Button
            variant="outline"
            size="icon"
            onClick={() => navigateMonth("next")}
            className="rounded-full border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            onClick={goToToday}
            className="border-gray-700 bg-gray-900 text-white hover:bg-gray-800"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            Hoy
          </Button>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-400">Gasto total</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(monthlyTotal, "USD")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Calendar */}
        <div className="xl:col-span-3">
          <Card className="border-neutral-800 bg-neutral-900">
            <CardHeader className="pb-4">
              <div className="grid grid-cols-7 gap-2">
                {WEEKDAYS.map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-sm font-medium tracking-wide text-neutral-400 uppercase"
                  >
                    {day}
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => (
                  <CalendarDayComponent
                    key={index}
                    day={day}
                    onDayClick={onDayClick}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <div className="xl:col-span-1">
          <SubscriptionLegend
            transactions={filteredTransactions}
            monthlyTotal={monthlyTotal}
          />
        </div>
        <div className="xl:col-span-3">
          <DailySpendingChart
            transactions={filteredTransactions}
            year={year}
            month={month}
          />
        </div>
      </div>
    </div>
  );
}
