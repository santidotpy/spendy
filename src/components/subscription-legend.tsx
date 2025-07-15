import { formatCurrency } from "~/utils/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Separator } from "~/components/ui/separator"
import type { TransactionOutput } from "~/server/api/types"
import { categoryIcons, categoryColors } from "~/lib/utils"
import { CreditCard, HelpCircle } from "lucide-react"

function getTransactionIcon(category: string, description: string) {
  const desc = description.toLowerCase()
  if (desc.includes("spotify")) return { Icon: categoryIcons["spotify"], bgColor: "#1ED760" }
  if (desc.includes("netflix")) return { Icon: categoryIcons["netflix"], bgColor: "#E50914" }
  if (desc.includes("prime")) return { Icon: categoryIcons["prime"], bgColor: "#00A8E1" }
  const Icon = categoryIcons[category] ?? HelpCircle
  const bgColor = categoryColors[category] ?? "#64748b"
  return { Icon, bgColor }
}

interface SubscriptionLegendProps {
  transactions: TransactionOutput[]
  monthlyTotal: number
}

export function SubscriptionLegend({ transactions, monthlyTotal }: SubscriptionLegendProps) {
  const groupedSubscriptions = transactions.reduce(
    (acc, sub) => {
      if (!acc[sub.category]) acc[sub.category] = []
      acc[sub.category]?.push(sub)
      return acc
    },
    {} as Record<string, TransactionOutput[]>,
  )

  if (transactions.length === 0) {
    return (
      <Card className="border border-neutral-800 bg-neutral-900">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-base text-white sm:text-lg">Gastos</CardTitle>
          <div className="flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
            <div className="rounded-full bg-neutral-100 p-2 dark:bg-neutral-800 sm:p-3 md:p-4">
              <CreditCard className="h-6 w-6 text-neutral-400 sm:h-8 sm:w-8 md:h-10 md:w-10" />
            </div>
            <h3 className="mt-2 text-base font-medium text-neutral-700 dark:text-neutral-200 sm:mt-3 sm:text-lg md:mt-4 md:text-xl">
              No hay gastos
            </h3>
            <p className="mt-1 text-center text-xs text-neutral-500 dark:text-neutral-400 sm:mt-2 sm:text-sm">
              Este mes aún no posee gastos.
            </p>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="border border-neutral-800 bg-neutral-900 lg:w-[400px]">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-base text-white sm:text-lg">Gastos</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[300px] pr-2 sm:h-[400px] lg:h-[500px]">
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(groupedSubscriptions).map(([category, subs], index, arr) => (
              <div key={category} className="space-y-2 sm:space-y-3">
                <h4 className="text-xs font-medium uppercase tracking-wide text-neutral-300 sm:text-sm">{category}</h4>
                <div className="space-y-1 sm:space-y-2">
                  {subs.map((subscription) => {
                    const { Icon, bgColor } = getTransactionIcon(subscription.category, subscription.description)
                    return (
                      <div
                        key={subscription.id}
                        className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-neutral-800 sm:p-3"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-white sm:text-sm">
                              {subscription.description}
                            </p>
                            <p className="text-xs text-neutral-400">Día {subscription.date}</p>
                          </div>
                        </div>
                        <span className="flex-shrink-0 text-xs font-semibold text-white sm:text-sm">
                          {formatCurrency(Number(subscription.amount), subscription.currency)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {index < arr.length - 1 && <Separator className="bg-neutral-800" />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
