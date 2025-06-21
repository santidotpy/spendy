"use client"

import * as React from "react"
import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart"
import { formatCurrency } from "~/utils/calendar"
import type { TransactionOutput } from "~/server/api/types"

interface DailySpendingChartProps {
  transactions: TransactionOutput[]
  year: number
  month: number
}

const chartConfig = {
  spending: {
    label: "Gasto Mensual",
    color: "var(--chart-3)",
  },
  average: {
    label: "Promedio",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function DailySpendingChart({ transactions, year, month }: DailySpendingChartProps) {
  const [activeChart, setActiveChart] = React.useState<keyof typeof chartConfig>("spending")

  const { chartData, totals } = useMemo(() => {
    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    // Initialize data for all days of the month
    const dailySpending: { [key: number]: number } = {}
    for (let day = 1; day <= daysInMonth; day++) {
      dailySpending[day] = 0
    }

    // Sum up transactions by day
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date)
      if (transactionDate.getFullYear() === year && transactionDate.getMonth() === month) {
        const day = transactionDate.getDate()
        dailySpending[day] += Math.abs(Number(transaction.amount))
      }
    })

    // Calculate totals
    const totalSpending = Object.values(dailySpending).reduce((sum, amount) => sum + amount, 0)
    const averageSpending = totalSpending / daysInMonth

    // Convert to chart format
    const data = Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1
      const amount = dailySpending[day] || 0
      return {
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        day: day.toString(),
        spending: amount,
        average: averageSpending,
      }
    })

    return {
      chartData: data,
      totals: {
        spending: totalSpending,
        average: averageSpending,
      },
    }
  }, [transactions, year, month])

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader className="flex flex-col items-stretch border-b border-neutral-700 !p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
          <CardTitle className="text-white">Gasto Diario - Interactivo</CardTitle>
          <CardDescription className="text-neutral-400">
            Mostrando gastos para {monthNames[month]} {year}
          </CardDescription>
        </div>
        <div className="flex">
          {(["spending", "average"] as const).map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="data-[active=true]:bg-neutral-800/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-neutral-700 px-6 py-4 text-left even:border-l even:border-neutral-700 sm:border-t-0 sm:border-l sm:px-8 sm:py-6 hover:bg-neutral-800/30 transition-colors"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-neutral-400 text-xs">{chartConfig[chart].label}</span>
                <span className="text-lg leading-none font-bold sm:text-3xl text-white">
                  {formatCurrency(totals[key], "USD")}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} stroke="#374151" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[200px] bg-neutral-800 border-neutral-700"
                  labelFormatter={(value) => `Día ${value}`}
                  formatter={(value) => [
                    formatCurrency(Number(value), "USD")
                  ]}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
