"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  CheckCircle,
  CreditCardIcon as PaymentIcon,
  Layers,
  Clock,
} from "lucide-react"
import { motion } from "motion/react"
import { TransactionOutput } from "~/server/api/types"



// Utility functions
function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return inputs.filter(Boolean).join(" ")
}

// const formatCurrency = (currencyCode: number): string => {
//   const currencyMap: Record<number, string> = {
//     1: "USD",
//     2: "EUR",
//     3: "GBP",
//     4: "JPY",
//     5: "CAD",
//     6: "AUD",
//     7: "CHF",
//     8: "CNY",
//     9: "MXN",
//     10: "BRL",
//   }

//   return currencyMap[currencyCode] || "USD"
// }

const getCategoryColor = (category: string) => {
  const categories: Record<string, string> = {
    Food: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    Transport: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    Shopping: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    Entertainment: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    Bills: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    Health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    Travel: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    Education: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Income: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  }

  return categories[category] || "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("es", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export default function TransactionDetails({transaction}: { transaction: TransactionOutput }) {
  const router = useRouter()

 

  if (!transaction) {
    return (
      <div className="container mx-auto p-4">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to transactions
        </button>
        <div className="rounded-xl bg-white p-8 text-center shadow-md dark:bg-neutral-900">
          <h1 className="text-xl font-bold text-neutral-900 dark:text-white">Transaction not found</h1>
          <p className="mt-2 text-neutral-500 dark:text-neutral-400">
            The transaction you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    )
  }

  const isPositive = Number.parseFloat(transaction.amount) < 0
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(Number.parseFloat(transaction.amount)))

  return (
    <div className="container mx-auto p-4">
      <button
        onClick={() => router.push("/dashboard/transactions")}
        className="mb-4 flex items-center gap-1 rounded-md bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to transactions
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-xl border-none bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-xl dark:from-neutral-900 dark:to-neutral-800"
      >
        {/* Header */}
        <div className="border-b border-neutral-200 bg-white px-6 py-5 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-white">{transaction.description}</h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Transaction ID: {transaction.id}</p>
            </div>
            <div
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium",
                isPositive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
              )}
            >
              {isPositive ? "Income" : "Expense"}
            </div>
          </div>
        </div>

        {/* Transaction Amount */}
        <div className="bg-white px-6 py-8 text-center dark:bg-neutral-900">
          <div
            className={cn(
              "text-4xl font-bold",
              isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
            )}
          >
            {isPositive ? "+" : "-"}
            {formattedAmount}
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{formatDate(transaction.date)}</p>

          {/* Installment Badge */}
          {/* {transaction.isInstallment && (
            <div className="mt-3 flex justify-center">
              <div className="rounded-full bg-neutral-100 px-4 py-1 text-sm font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                Cuota {transaction.currentInstallment} de {transaction.totalInstallments}
              </div>
            </div>
          )} */}
        </div>

        {/* Transaction Details */}
        <div className="grid gap-6 bg-neutral-50 px-6 py-6 dark:bg-neutral-800/50 md:grid-cols-2">
          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-neutral-400" />
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Date</h3>
            </div>
            <p className="mt-2 text-neutral-900 dark:text-white">{formatDate(transaction.date)}</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-neutral-400" />
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Category</h3>
            </div>
            <div className="mt-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium",
                  getCategoryColor(transaction.category),
                )}
              >
                {transaction.category}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-neutral-400" />
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Amount</h3>
            </div>
            <p
              className={cn(
                "mt-2 font-medium",
                isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {isPositive ? "+" : "-"}
              {formattedAmount} {transaction.currency}
            </p>
          </div>

          {/* <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-neutral-400" />
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Reference</h3>
            </div>
            <p className="mt-2 text-neutral-900 dark:text-white">{transaction.reference || "N/A"}</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-neutral-400" />
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Status</h3>
            </div>
            <p className="mt-2 text-neutral-900 dark:text-white">{transaction.status || "N/A"}</p>
          </div>

          <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-900">
            <div className="flex items-center gap-2">
              <PaymentIcon className="h-5 w-5 text-neutral-400" />
              <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Payment Method</h3>
            </div>
            <p className="mt-2 text-neutral-900 dark:text-white">{transaction.paymentMethod || "N/A"}</p>
          </div> */}

          {/* Installment Details */}
          {/* {transaction.isInstallment && (
            <>
              <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-900">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-neutral-400" />
                  <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Installment</h3>
                </div>
                <p className="mt-2 text-neutral-900 dark:text-white">
                  Cuota {transaction.currentInstallment} de {transaction.totalInstallments}
                </p>
              </div>

              <div className="rounded-lg bg-white p-4 shadow-sm dark:bg-neutral-900">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-neutral-400" />
                  <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Last Payment</h3>
                </div>
                <p className="mt-2 text-neutral-900 dark:text-white">
                  {transaction.lastInstallmentDate ? formatDate(transaction.lastInstallmentDate) : "N/A"}
                </p>
              </div>
            </>
          )} */}
        </div>

        {/* Notes */}
        {/* {transaction.notes && (
          <div className="border-t border-neutral-200 bg-white px-6 py-6 dark:border-neutral-700 dark:bg-neutral-900">
            <h3 className="mb-2 font-medium text-neutral-700 dark:text-neutral-300">Notes</h3>
            <p className="text-neutral-600 dark:text-neutral-400">{transaction.notes}</p>
          </div>
        )} */}
      </motion.div>
    </div>
  )
}
