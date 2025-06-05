"use client"

import type { CalendarDay } from "../types/subscription"
import { formatCurrency, getTotalForDay } from "../utils/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Edit, Trash2 } from "lucide-react"

interface SubscriptionDetailsDialogProps {
  selectedDay: CalendarDay | null
  onClose: () => void
  onEdit?: (subscriptionId: string) => void
  onDelete?: (subscriptionId: string) => void
}

export function SubscriptionDetailsDialog({ selectedDay, onClose, onEdit, onDelete }: SubscriptionDetailsDialogProps) {
  if (!selectedDay) return null

  const dayTotal = getTotalForDay(selectedDay.subscriptions)

  return (
    <Dialog open={!!selectedDay} onOpenChange={onClose}>
      <DialogContent className="bg-neutral-900 border-neutral-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {selectedDay.date.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedDay.subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg border border-neutral-700"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: subscription.color }}
                >
                  <subscription.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{subscription.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                      {subscription.frequency}
                    </Badge>
                    <span className="text-xs text-neutral-400">{subscription.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right mr-2">
                  <p className="font-medium text-white">{formatCurrency(subscription.amount, subscription.currency)}</p>
                </div>

                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(subscription.id)}
                    className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(subscription.id)}
                    className="h-8 w-8 text-neutral-400 hover:text-red-400 hover:bg-neutral-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="border-t border-neutral-700 pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-white">Total for this day:</span>
              <span className="text-white">{formatCurrency(dayTotal, "USD")}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
