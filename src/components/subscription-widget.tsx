"use client"

import type React from "react"

import { useState, useMemo, useRef, useCallback } from "react"
import { ChevronLeft, ChevronRight, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import { formatCurrency } from "~/utils/pdf-extract"
import type { TransactionOutput } from "~/server/api/types"
import { identifySubscriptions } from "~/lib/utils"

export function SubscriptionWidget({ transactions }: { transactions: TransactionOutput[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const subscriptions = useMemo(() => {
    return identifySubscriptions(transactions.filter((t) => Number.parseFloat(t.amount) > 0))
  }, [transactions])

  const totalMonthlySpend = subscriptions.reduce((sum, sub) => {
    return sum + (sub.currency === "USD" ? sub.monthlyAmount * 1000 : sub.monthlyAmount)
  }, 0)

  const nextIndex = useCallback(() => {
    if (isTransitioning || subscriptions.length <= 1) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev + 1) % subscriptions.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [subscriptions.length, isTransitioning])

  const prevIndex = useCallback(() => {
    if (isTransitioning || subscriptions.length <= 1) return
    setIsTransitioning(true)
    setCurrentIndex((prev) => (prev - 1 + subscriptions.length) % subscriptions.length)
    setTimeout(() => setIsTransitioning(false), 300)
  }, [subscriptions.length, isTransitioning])

  // Touch event handlers for swipe detection
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? 0
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0]?.clientX ?? 0
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const distance = touchStartX.current - touchEndX.current
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && subscriptions.length > 1) {
      nextIndex()
    }
    if (isRightSwipe && subscriptions.length > 1) {
      prevIndex()
    }

    // Reset touch positions
    touchStartX.current = 0
    touchEndX.current = 0
  }

  if (subscriptions.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            Suscripciones Activas
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <Zap className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
            <p className="text-sm sm:text-base">No se detectaron suscripciones recurrentes</p>
            <p className="text-xs sm:text-sm mt-1">
              Las suscripciones aparecerán cuando tengas transacciones recurrentes
            </p>
          </div>
        </CardContent>
      </Card>
    )
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
      <CardHeader className="pb-3 sm:pb-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
            Suscripciones Activas
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {subscriptions.length} activas
          </Badge>
        </div>
        <div className="text-xs sm:text-sm text-muted-foreground">
          Gasto mensual estimado: <span className="font-semibold">{formatCurrency(totalMonthlySpend)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
        {/* Main subscription carousel */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {/* Navigation arrows - hidden on touch devices, visible for accessibility and non-touch devices */}
            <Button
              variant="ghost"
              size="sm"
              onClick={prevIndex}
              disabled={subscriptions.length <= 1 || isTransitioning}
              className="h-9 w-9 sm:h-8 sm:w-8 p-0 touch-manipulation hidden sm:flex hover:bg-muted/50 transition-colors"
              aria-label="Suscripción anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Swipeable carousel container */}
            <div
              className="flex-1 mx-0 sm:mx-4 overflow-hidden"
              ref={carouselRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative">
                {/* Swipe indicator for mobile */}
                {subscriptions.length > 1 && (
                  <div className="sm:hidden text-center mb-2">
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                      <span>Desliza para navegar</span>
                      <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                        <div className="w-1 h-1 bg-current rounded-full opacity-40"></div>
                        <div className="w-1 h-1 bg-current rounded-full opacity-60"></div>
                      </div>
                    </div>
                  </div>
                )}

                {subscriptions.map((subscription, index) => (
                  <div
                    key={subscription.id}
                    className={`transition-all duration-300 ease-out ${
                      index === currentIndex ? "block" : "hidden"
                    } ${isTransitioning ? "scale-[0.98] opacity-90" : "scale-100 opacity-100"}`}
                  >
                    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-stone-800 dark:to-stone-900 rounded-xl p-3 sm:p-4 border shadow-sm select-none">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className={`${subscription.color} p-1.5 sm:p-2 rounded-lg text-white flex-shrink-0`}>
                            <subscription.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-sm sm:text-base truncate">{subscription.name}</h3>
                            <p className="text-xs text-muted-foreground truncate">{subscription.category}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-bold text-base sm:text-lg">
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
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <Badge variant="outline" className="text-xs">
                            Activa
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={nextIndex}
              disabled={subscriptions.length <= 1 || isTransitioning}
              className="h-9 w-9 sm:h-8 sm:w-8 p-0 touch-manipulation hidden sm:flex hover:bg-muted/50 transition-colors"
              aria-label="Siguiente suscripción"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Pagination dots */}
          {subscriptions.length > 1 && (
            <div className="flex justify-center gap-1.5 sm:gap-1 mt-4">
              {subscriptions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true)
                      setCurrentIndex(index)
                      setTimeout(() => setIsTransitioning(false), 300)
                    }
                  }}
                  disabled={isTransitioning}
                  className={`h-2.5 w-2.5 sm:h-2 sm:w-2 rounded-full transition-all touch-manipulation ${
                    index === currentIndex ? "bg-primary scale-110" : "bg-muted hover:bg-muted-foreground/30"
                  }`}
                  aria-label={`Ir a suscripción ${index + 1}`}
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
                className="flex items-center gap-2 p-2.5 sm:p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer touch-manipulation min-h-[44px] sm:min-h-0"
                onClick={() => {
                  if (!isTransitioning) {
                    setIsTransitioning(true)
                    setCurrentIndex(subscriptions.indexOf(subscription))
                    setTimeout(() => setIsTransitioning(false), 300)
                  }
                }}
              >
                <div className={`${subscription.color} p-1 rounded text-white flex-shrink-0`}>
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
                <div className="text-xs text-muted-foreground flex-shrink-0">
                  {getDaysUntilNext(subscription.nextPayment)}d
                </div>
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
