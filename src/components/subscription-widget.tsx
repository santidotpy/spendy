"use client"

import { useState, useMemo } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Zap,
  Play,
  Music,
  ShoppingBag,
  Gamepad2,
  Video,
  Wifi,
  Dumbbell,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { formatCurrency } from "~/utils/pdf-extract"
import type { TransactionOutput } from "~/server/api/types"

// Subscription service patterns and their associated icons/colors
const subscriptionPatterns = {
  netflix: {
    keywords: ["netflix", "nflx"],
    name: "Netflix",
    icon: Video,
    color: "bg-red-500",
    category: "Entertainment",
  },
  spotify: {
    keywords: ["spotify", "spot"],
    name: "Spotify",
    icon: Music,
    color: "bg-green-500",
    category: "Music",
  },
  prime: {
    keywords: ["amazon prime", "prime video", "amzn"],
    name: "Prime Video",
    icon: Play,
    color: "bg-blue-600",
    category: "Entertainment",
  },
  disney: {
    keywords: ["disney", "disney+", "disneyplus"],
    name: "Disney+",
    icon: Video,
    color: "bg-blue-700",
    category: "Entertainment",
  },
  youtube: {
    keywords: ["youtube premium", "youtube music", "ytb"],
    name: "YouTube Premium",
    icon: Play,
    color: "bg-red-600",
    category: "Entertainment",
  },
  gaming: {
    keywords: ["xbox", "playstation", "steam", "epic games", "nintendo"],
    name: "Gaming",
    icon: Gamepad2,
    color: "bg-purple-600",
    category: "Gaming",
  },
  utilities: {
    keywords: ["internet", "wifi", "telefonica", "claro", "movistar"],
    name: "Internet/Phone",
    icon: Wifi,
    color: "bg-orange-500",
    category: "Utilities",
  },
  shopping: {
    keywords: ["mercadolibre", "amazon", "subscription"],
    name: "Shopping",
    icon: ShoppingBag,
    color: "bg-yellow-600",
    category: "Shopping",
  },
  gym: {
    keywords: ["gym", "fitness", "gympass"],
    name: "Gym",
    icon: Dumbbell,
    color: "bg-green-500",
    category: "Gym",
  },
}

interface SubscriptionData {
  id: string
  name: string
  icon: any
  color: string
  monthlyAmount: number
  currency: string
  lastPayment: string
  nextPayment: string
  category: string
  transactions: TransactionOutput[]
}

function identifySubscriptions(transactions: TransactionOutput[]): SubscriptionData[] {
  const subscriptionMap = new Map<string, TransactionOutput[]>()

  // Group transactions by potential subscription services
  transactions.forEach((transaction) => {
    const description = transaction.description.toLowerCase()

    // Check against known patterns
    for (const [key, pattern] of Object.entries(subscriptionPatterns)) {
      if (pattern.keywords.some((keyword) => description.includes(keyword))) {
        if (!subscriptionMap.has(key)) {
          subscriptionMap.set(key, [])
        }
        subscriptionMap.get(key)!.push(transaction)
        return
      }
    }

    // Check for recurring patterns (same description, similar amounts)
    const existingKey = Array.from(subscriptionMap.keys()).find((k) => {
      const existing = subscriptionMap.get(k)!
      return existing.some(
        (t) =>
          t.description.toLowerCase() === description &&
          Math.abs(Number.parseFloat(t.amount) - Number.parseFloat(transaction.amount)) < 100,
      )
    })

    if (existingKey) {
      subscriptionMap.get(existingKey)!.push(transaction)
    } else {
      // Create new potential subscription
      subscriptionMap.set(description, [transaction])
    }
  })

  // Filter and format subscriptions (only those with multiple transactions)
  const subscriptions: SubscriptionData[] = []

  subscriptionMap.forEach((transactions, key) => {
    if (transactions.length >= 2) {
      // At least 2 transactions to be considered recurring
      const pattern = subscriptionPatterns[key as keyof typeof subscriptionPatterns]
      const sortedTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const latestTransaction = sortedTransactions[0]
      if (!latestTransaction) return
      const avgAmount =
        transactions.reduce((sum, t) => sum + Math.abs(Number.parseFloat(t.amount)), 0) / transactions.length

      // Calculate next payment (estimate based on frequency)
      const dates = transactions.map((t) => new Date(t.date)).sort((a, b) => b.getTime() - a.getTime())
      if (!dates[0]) return;

      const daysBetween =
        dates.length > 1 && dates[0] && dates[1]
          ? Math.round((dates[0].getTime() - dates[1].getTime()) / (1000 * 60 * 60 * 24))
          : 30

      const nextPayment = new Date(dates[0]!)
      nextPayment.setDate(nextPayment.getDate() + Math.max(daysBetween, 30))

      subscriptions.push({
        id: key,
        name: pattern?.name || latestTransaction.description,
        icon: pattern?.icon || Zap,
        color: pattern?.color || "bg-gray-500",
        monthlyAmount: avgAmount,
        currency: latestTransaction.currency,
        lastPayment: latestTransaction.date,
        nextPayment: (nextPayment.toISOString().split("T")[0] as string),
        category: pattern?.category || latestTransaction.category,
        transactions: sortedTransactions,
      })
    }
  })

  return subscriptions.sort((a, b) => b.monthlyAmount - a.monthlyAmount)
}

export function SubscriptionWidget({ transactions }: { transactions: TransactionOutput[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const subscriptions = useMemo(() => {
    return identifySubscriptions(transactions.filter((t) => Number.parseFloat(t.amount) > 0))
  }, [transactions])

  const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
    return sum + (sub.currency === "USD" ? sub.monthlyAmount * 1000 : sub.monthlyAmount) // Rough conversion for display
  }, 0)

  if (subscriptions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Suscripciones Activas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se detectaron suscripciones recurrentes</p>
            <p className="text-sm">Las suscripciones aparecerán cuando tengas transacciones recurrentes</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const nextIndex = () => {
    setCurrentIndex((prev) => (prev + 1) % subscriptions.length)
  }

  const prevIndex = () => {
    setCurrentIndex((prev) => (prev - 1 + subscriptions.length) % subscriptions.length)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    })
  }

  const getDaysUntilNext = (nextPayment: string) => {
    const today = new Date()
    const next = new Date(nextPayment)
    const diffTime = next.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Suscripciones Activas
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {subscriptions.length} activas
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Gasto mensual estimado: <span className="font-semibold">{formatCurrency(totalMonthlySpend)}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Main subscription carousel */}
        <div className="relative">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevIndex}
              disabled={subscriptions.length <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex-1 mx-4">
              {subscriptions.map((subscription, index) => (
                <div
                  key={subscription.id}
                  className={`transition-all duration-300 ${index === currentIndex ? "block" : "hidden"}`}
                >
                  <div className="bg-gradient-to-br from-white to-gray-50 dark:from-stone-800 dark:to-stone-900 rounded-xl p-4 border shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`${subscription.color} p-2 rounded-lg text-white`}>
                          <subscription.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{subscription.name}</h3>
                          <p className="text-xs text-muted-foreground">{subscription.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          {subscription.currency === "USD" ? "$" : "$"}
                          {subscription.currency === "USD"
                            ? subscription.monthlyAmount.toFixed(2)
                            : formatCurrency(subscription.monthlyAmount).replace("$", "")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {subscription.currency === "USD" ? "USD" : "ARS"}/mes
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Último pago</p>
                          <p className="font-medium">{formatDate(subscription.lastPayment)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Próximo pago</p>
                          <p className="font-medium">
                            {formatDate(subscription.nextPayment)}
                            <span className="ml-1 text-xs text-orange-600">
                              ({getDaysUntilNext(subscription.nextPayment)}d)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{subscription.transactions.length} transacciones</span>
                        <Badge variant="outline">
                          Activa
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextIndex}
              disabled={subscriptions.length <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Pagination dots */}
          {subscriptions.length > 1 && (
            <div className="flex justify-center gap-1 mt-4">
              {subscriptions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick overview of all subscriptions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Resumen rápido</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {subscriptions.slice(0, 4).map((subscription) => (
              <div
                key={subscription.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => setCurrentIndex(subscriptions.indexOf(subscription))}
              >
                <div className={`${subscription.color} p-1 rounded text-white`}>
                  <subscription.icon className="h-3 w-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{subscription.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {subscription.currency === "USD" ? "$" : "$"}
                    {subscription.currency === "USD"
                      ? subscription.monthlyAmount.toFixed(0)
                      : Math.round(subscription.monthlyAmount).toLocaleString()}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">{getDaysUntilNext(subscription.nextPayment)}d</div>
              </div>
            ))}
          </div>

          {subscriptions.length > 4 && (
            <p className="text-xs text-muted-foreground text-center">+{subscriptions.length - 4} suscripciones más</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
