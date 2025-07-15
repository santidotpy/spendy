"use client"

import type { CalendarDay } from "../types/subscription"
import { formatCurrency, getTotalForDay } from "../utils/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Edit, Trash2, HelpCircle, Music, Video } from "lucide-react"
import { categoryIcons, categoryColors } from "~/lib/utils"

function getTransactionIcon(category: string, description: string) {
  const desc = description.toLowerCase()
  if (desc.includes("spotify")) return { Icon: Music, bgColor: "#1ED760" }
  if (desc.includes("DLO*PRIMEVIDEO")) return { Icon: Video, bgColor: "#00A8E1" }
  const Icon = categoryIcons[category] ?? HelpCircle
  const bgColor = categoryColors[category] ?? "#64748b"
  return { Icon, bgColor }
}

interface SubscriptionDetailsDialogProps {
  selectedDay: CalendarDay | null
  onClose: () => void
  onEdit?: (subscriptionId: string) => void
  onDelete?: (subscriptionId: string) => void
}

export function SubscriptionDetailsDialog({ selectedDay, onClose, onEdit, onDelete }: SubscriptionDetailsDialogProps) {
  if (!selectedDay) return null

  const dayTotal = getTotalForDay(selectedDay.transactions)

  return (
    <Dialog open={!!selectedDay} onOpenChange={onClose}>
      <DialogContent className="mx-2 w-[calc(100vw-1rem)] max-w-lg border-neutral-700 bg-neutral-900 text-white sm:mx-auto sm:w-full">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-base font-semibold leading-tight sm:text-xl">
            {(() => {
              const dateStr = selectedDay.date.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
              return dateStr.charAt(0).toUpperCase() + dateStr.slice(1)
            })()}
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2 sm:max-h-[70vh] sm:space-y-4">
          {selectedDay.transactions.map((subscription) => {
            const { Icon, bgColor } = getTransactionIcon(subscription.category, subscription.description)
            return (
              <div
                key={subscription.id}
                className="flex items-start gap-3 rounded-xl border border-neutral-700 bg-neutral-850 p-3 shadow-sm sm:items-center sm:p-4"
              >
                <div
                  className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white shadow sm:mt-0 sm:h-10 sm:w-10"
                  style={{ backgroundColor: bgColor }}
                >
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>

                <div className="min-w-0 flex-1 space-y-1 sm:space-y-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium leading-tight text-white sm:text-base">
                      {subscription.description}
                    </p>
                    <p className="text-base font-semibold text-white sm:text-lg">
                      {formatCurrency(Number(subscription.amount), subscription.currency)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="border-neutral-600 text-xs text-neutral-300">
                      {subscription.category}
                    </Badge>
                    <span className="text-xs text-neutral-400">{subscription.currency}</span>
                  </div>

                  {/* Action buttons - only show on larger screens for now */}
                  {(onEdit || onDelete) && (
                    <div className="hidden gap-1 pt-1 sm:flex">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(subscription.id.toString())}
                          className="h-8 px-2 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                          aria-label="Editar"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(subscription.id.toString())}
                          className="h-8 px-2 text-neutral-400 hover:bg-neutral-700 hover:text-red-500"
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="border-t border-neutral-700 pt-3 sm:pt-4">
          <div className="flex items-center justify-between text-sm font-medium sm:text-base">
            <span className="text-neutral-300">Total del día:</span>
            <span className="text-white">{formatCurrency(dayTotal, "USD")}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
