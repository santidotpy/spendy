"use client"

import type { CalendarDay } from "../types/subscription"
import { categoryIcons, categoryColors, cn } from "~/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { formatCurrency, getTotalForDay } from "~/utils/calendar"
import { HelpCircle } from "lucide-react"

interface CalendarDayProps {
  day: CalendarDay
  onDayClick?: (day: CalendarDay) => void
}

export function CalendarDayComponent({ day, onDayClick }: CalendarDayProps) {
  const hasTransactions = day.transactions.length > 0
  const dayTotal = getTotalForDay(day.transactions)
  const transactionCount = day.transactions.length

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onDayClick?.(day)}
            className={cn(
              "relative w-full aspect-square rounded-xl border transition-all duration-200",
              "flex flex-col items-center justify-center text-sm",
              "bg-neutral-900 border-neutral-800 hover:border-neutral-600",
              day.isCurrentMonth ? "text-white" : "text-neutral-600",
              day.isToday && "bg-blue-600 border-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25",
              hasTransactions && day.isCurrentMonth && "border-neutral-600 bg-neutral-850",
              !day.isCurrentMonth && "opacity-50",
              hasTransactions && "hover:bg-neutral-800 cursor-pointer",
            )}
          >
            <span className={cn("mb-2", day.isToday && "font-bold")}>{day.date.getDate()}</span>

            {hasTransactions && (
              <>
                {/* Mobile: Show transaction count */}
                <div className="flex flex-col items-center sm:hidden">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs text-white font-medium">
                    {transactionCount > 5 ? "+5" : transactionCount}
                  </div>
                </div>

                {/* Desktop: Show individual icons */}
                <div className="hidden sm:flex flex-wrap gap-1 justify-center max-w-full">
                  {day.transactions.slice(0, 4).map((transaction) => {
                    const Icon = categoryIcons[transaction.category] ?? HelpCircle
                    const bgColor = categoryColors[transaction.category] ?? "#64748b"
                    return (
                      <div
                        key={transaction.id}
                        className="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm text-white"
                        style={{ backgroundColor: bgColor }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                    )
                  })}
                  {day.transactions.length > 4 && (
                    <div className="w-6 h-6 rounded-lg bg-neutral-700 flex items-center justify-center text-xs text-white font-medium">
                      +{day.transactions.length - 4}
                    </div>
                  )}
                </div>
              </>
            )}

            {hasTransactions && day.transactions.length <= 2 && (
              <div className="mt-1 hidden sm:block">
                <span className="text-xs text-gray-400 font-medium">{formatCurrency(dayTotal, "USD")}</span>
              </div>
            )}
          </button>
        </TooltipTrigger>
        {hasTransactions && (
          <TooltipContent side="top" className="max-w-xs bg-neutral-800 border-neutral-700">
            <div className="space-y-2">
              <div className="font-medium text-white">
                {day.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </div>
              {day.transactions.map((transaction) => {
                const Icon = categoryIcons[transaction.category] ?? HelpCircle
                const bgColor = categoryColors[transaction.category] ?? "#64748b"
                return (
                  <div key={transaction.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center text-white"
                        style={{ backgroundColor: bgColor }}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="text-xs text-white">{transaction.description}</span>
                    </div>
                    <span className="text-xs text-gray-300">
                      {formatCurrency(Number(transaction.amount), transaction.currency)}
                    </span>
                  </div>
                )
              })}
              <div className="border-t border-neutral-700 pt-2 flex justify-between">
                <span className="text-xs font-medium text-white">Total:</span>
                <span className="text-xs font-medium text-white">{formatCurrency(dayTotal, "USD")}</span>
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
