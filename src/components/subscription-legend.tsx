import type { Subscription } from "~/types/subscription";
import { formatCurrency } from "~/utils/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { TransactionOutput } from "~/server/api/types";
import { categoryIcons, categoryColors } from "~/lib/utils";
import { CreditCard, HelpCircle } from "lucide-react";

function getTransactionIcon(category: string, description: string) {
  const desc = description.toLowerCase();
  if (desc.includes("spotify"))
    return { Icon: categoryIcons["spotify"], bgColor: "#1ED760" };
  if (desc.includes("netflix"))
    return { Icon: categoryIcons["netflix"], bgColor: "#E50914" };
  if (desc.includes("prime"))
    return { Icon: categoryIcons["prime"], bgColor: "#00A8E1" };

  const Icon = categoryIcons[category] ?? HelpCircle;
  const bgColor = categoryColors[category] ?? "#64748b";
  return { Icon, bgColor };
}

interface SubscriptionLegendProps {
  transactions: TransactionOutput[];
  monthlyTotal: number;
}

export function SubscriptionLegend({
  transactions,
  monthlyTotal,
}: SubscriptionLegendProps) {
  const groupedSubscriptions = transactions.reduce(
    (acc, sub) => {
      if (!acc[sub.category]) acc[sub.category] = [];
      acc[sub.category]?.push(sub);
      return acc;
    },
    {} as Record<string, TransactionOutput[]>,
  );

  if (transactions.length === 0) {
    return (
      <Card className="border border-neutral-800 bg-neutral-900">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-white">Gastos</CardTitle>
          <div className="flex flex-col items-center justify-center p-6 sm:p-12">
            <div className="rounded-full bg-neutral-100 p-3 sm:p-4 dark:bg-neutral-800">
              <CreditCard className="h-8 w-8 text-neutral-400 sm:h-10 sm:w-10" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-neutral-700 sm:mt-4 sm:text-xl dark:text-neutral-200">
              No hay gastos
            </h3>
            <p className="mt-1 text-center text-xs text-neutral-500 sm:mt-2 sm:text-sm dark:text-neutral-400">
              Este mes aún no posee gastos.
            </p>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border border-neutral-800 bg-neutral-900">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-white">Gastos</CardTitle>
        {/* <div className="text-right">
          <p className="text-sm text-neutral-400">Gasto mensual</p>
          <p className="text-xl font-bold text-white">
            {formatCurrency(monthlyTotal, "USD")}
          </p>
        </div> */}
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[500px] pr-2">
          <div className="space-y-6">
            {Object.entries(groupedSubscriptions).map(
              ([category, subs], index, arr) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-sm font-medium tracking-wide text-neutral-300 uppercase">
                    {category}
                  </h4>
                  <div className="space-y-2">
                    {subs.map((subscription) => {
                      const { Icon, bgColor } = getTransactionIcon(
                        subscription.category,
                        subscription.description,
                      );
                      return (
                        <div
                          key={subscription.id}
                          className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-neutral-800"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">
                                {subscription.description}
                              </p>
                              <p className="text-xs text-neutral-400">
                                Día {subscription.date}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {formatCurrency(
                              Number(subscription.amount),
                              subscription.currency,
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {index < arr.length - 1 && (
                    <Separator className="bg-neutral-800" />
                  )}
                </div>
              ),
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
