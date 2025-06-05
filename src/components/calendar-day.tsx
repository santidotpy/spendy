"use client"

import type { CalendarDay } from "../types/subscription"
import { cn } from "~/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip"
import { formatCurrency, getTotalForDay } from "~/utils/calendar"

interface CalendarDayProps {
  day: CalendarDay
  onDayClick?: (day: CalendarDay) => void
}

export function CalendarDayComponent({ day, onDayClick }: CalendarDayProps) {
  const hasSubscriptions = day.subscriptions.length > 0
  const dayTotal = getTotalForDay(day.subscriptions)

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
              hasSubscriptions && day.isCurrentMonth && "border-neutral-600 bg-neutral-850",
              !day.isCurrentMonth && "opacity-50",
              hasSubscriptions && "hover:bg-neutral-800 cursor-pointer",
            )}
          >
            <span className={cn("mb-2", day.isToday && "font-bold")}>{day.date.getDate()}</span>

            {hasSubscriptions && (
              <div className="flex flex-wrap gap-1 justify-center max-w-full">
                {day.subscriptions.slice(0, 4).map((subscription) => (
                  <div
                    key={subscription.id}
                    className="w-6 h-6 rounded-lg flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: subscription.color }}
                  >
                    <subscription.icon className="w-3 h-3 text-white" />
                  </div>
                ))}
                {day.subscriptions.length > 4 && (
                  <div className="w-6 h-6 rounded-lg bg-neutral-700 flex items-center justify-center text-xs text-white font-medium">
                    +{day.subscriptions.length - 4}
                  </div>
                )}
              </div>
            )}

            {hasSubscriptions && day.subscriptions.length <= 2 && (
              <div className="mt-1">
                <span className="text-xs text-gray-400 font-medium">{formatCurrency(dayTotal, "USD")}</span>
              </div>
            )}
          </button>
        </TooltipTrigger>

        {hasSubscriptions && (
          <TooltipContent side="top" className="max-w-xs bg-neutral-800 border-neutral-700">
            <div className="space-y-2">
              <div className="font-medium text-white">
                {day.date.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
              </div>
              {day.subscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded flex items-center justify-center"
                      style={{ backgroundColor: subscription.color }}
                    >
                      <subscription.icon className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-xs text-white">{subscription.name}</span>
                  </div>
                  <span className="text-xs text-gray-300">
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </span>
                </div>
              ))}
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
