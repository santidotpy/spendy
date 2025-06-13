"use client";

import type { CalendarDay } from "../types/subscription";
import { formatCurrency, getTotalForDay } from "../utils/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Edit, Trash2, HelpCircle, Music, Video } from "lucide-react";
import { categoryIcons, categoryColors } from "~/lib/utils";

function getTransactionIcon(category: string, description: string) {
  const desc = description.toLowerCase();
  if (desc.includes("spotify")) return { Icon: Music, bgColor: "#1ED760" };
  if (desc.includes("DLO*PRIMEVIDEO")) return { Icon: Video, bgColor: "#00A8E1" };

  const Icon = categoryIcons[category] ?? HelpCircle;
  const bgColor = categoryColors[category] ?? "#64748b";
  return { Icon, bgColor };
}

interface SubscriptionDetailsDialogProps {
  selectedDay: CalendarDay | null;
  onClose: () => void;
  onEdit?: (subscriptionId: string) => void;
  onDelete?: (subscriptionId: string) => void;
}

export function SubscriptionDetailsDialog({
  selectedDay,
  onClose,
  onEdit,
  onDelete,
}: SubscriptionDetailsDialogProps) {
  if (!selectedDay) return null;

  const dayTotal = getTotalForDay(selectedDay.transactions);

  return (
    <Dialog open={!!selectedDay} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-neutral-700 bg-neutral-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {(() => {
              const dateStr = selectedDay.date.toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              });
              return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
            })()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {selectedDay.transactions.map((subscription) => {
            const { Icon, bgColor } = getTransactionIcon(
              subscription.category,
              subscription.description,
            );

            return (
              <div
                key={subscription.id}
                className="bg-neutral-850 flex items-center justify-between rounded-xl border border-neutral-700 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-white shadow"
                    style={{ backgroundColor: bgColor }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {subscription.description}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-neutral-600 text-xs text-neutral-300"
                      >
                        {subscription.category}
                      </Badge>
                      <span className="text-xs text-neutral-400">
                        {subscription.currency}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <p className="mr-1 text-sm font-semibold text-white">
                    {formatCurrency(
                      Number(subscription.amount),
                      subscription.currency,
                    )}
                  </p>

                  {/* {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(subscription.id.toString())}
                      className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-700"
                      aria-label="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}

                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(subscription.id.toString())}
                      className="h-8 w-8 text-neutral-400 hover:text-red-500 hover:bg-neutral-700"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )} */}
                </div>
              </div>
            );
          })}

          <div className="border-t border-neutral-700 pt-4">
            <div className="flex items-center justify-between text-base font-medium">
              <span className="text-neutral-300">Total del día:</span>
              <span className="text-white">
                {formatCurrency(dayTotal, "USD")}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
