import type { Subscription } from "~/types/subscription"
import { formatCurrency } from "~/utils/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { ScrollArea } from "~/components/ui/scroll-area"

interface SubscriptionLegendProps {
  subscriptions: Subscription[]
  monthlyTotal: number
}

export function SubscriptionLegend({ subscriptions, monthlyTotal }: SubscriptionLegendProps) {
  const groupedSubscriptions = subscriptions.reduce(
    (acc, sub) => {
      if (!acc[sub.category]) {
        acc[sub.category] = []
      }
      acc[sub.category]?.push(sub)
      return acc
    },
    {} as Record<string, Subscription[]>,
  )

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="pb-4">
        <CardTitle className="text-white text-lg">Subscriptions</CardTitle>
        <div className="text-right">
          <p className="text-sm text-gray-400">Monthly Total</p>
          <p className="text-xl font-bold text-white">{formatCurrency(monthlyTotal, "USD")}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[500px]">
        {Object.entries(groupedSubscriptions).map(([category, subs]) => (
          <div key={category} className="space-y-3">
            <h4 className="text-sm font-medium text-neutral-300 uppercase tracking-wide">{category}</h4>
            <div className="space-y-2">
              {subs.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between group hover:bg-neutral-800 p-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: subscription.color }}
                    >
                      <subscription.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{subscription.name}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-neutral-400">Day {subscription.paymentDay}</span>
                        <Badge variant="outline" className="text-xs border-neutral-600 text-neutral-300">
                          {subscription.frequency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-white">
                    {formatCurrency(subscription.amount, subscription.currency)}
                  </span>
                </div>
              ))}
            </div>
            {Object.keys(groupedSubscriptions).indexOf(category) < Object.keys(groupedSubscriptions).length - 1 && (
              <Separator className="bg-neutral-800" />
            )}
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
