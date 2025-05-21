"use client";

import { useState, useRef } from "react";
import {
  Calendar,
  CreditCard,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  X,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { DatePicker, type DatePickerRef } from "~/components/ui/date-picker";
import type { TransactionOutput } from "~/server/api/types";

// Implement the cn utility function directly in this file
function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return inputs.filter(Boolean).join(" ");
}

// Implement the formatCurrency function directly in this file
const formatCurrency = (currencyCode: number): string => {
  const currencyMap: Record<number, string> = {
    1: "USD",
    2: "EUR",
    3: "GBP",
    4: "JPY",
    5: "CAD",
    6: "AUD",
    7: "CHF",
    8: "CNY",
    9: "MXN",
    10: "BRL",
    // Add more currency codes as needed
  };

  return currencyMap[currencyCode] || "USD";
};

export function TransactionsList({
  transactions,
}: {
  transactions: TransactionOutput[];
}) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [expandedTransaction, setExpandedTransaction] = useState<number | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("all");

  // Date range filter
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const startDatePickerRef = useRef<DatePickerRef>(null);
  const endDatePickerRef = useRef<DatePickerRef>(null);

  // Category filter
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Extract unique categories
  const uniqueCategories = Array.from(
    new Set(transactions.map((t) => t.category)),
  ).sort();

  // Toggle category selection
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedCategories([]);
    setSearchTerm("");
  };

  // Check if any filters are active
  const hasActiveFilters =
    startDate || endDate || selectedCategories.length > 0 || searchTerm;
  if (!transactions || transactions.length === 0) {
    return (
      <div className="mt-4 overflow-hidden rounded-xl border-none bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-lg sm:mt-6 dark:from-neutral-900 dark:to-neutral-800">
        <div className="flex flex-col items-center justify-center p-6 sm:p-12">
          <div className="rounded-full bg-neutral-100 p-3 sm:p-4 dark:bg-neutral-800">
            <CreditCard className="h-8 w-8 text-neutral-400 sm:h-10 sm:w-10" />
          </div>
          <h3 className="mt-3 text-lg font-medium text-neutral-700 sm:mt-4 sm:text-xl dark:text-neutral-200">
            No hay transacciones
          </h3>
          <p className="mt-1 text-center text-xs text-neutral-500 sm:mt-2 sm:text-sm dark:text-neutral-400">
            Sube un resumen para extraer tus transacciones
          </p>
        </div>
      </div>
    );
  }

  // Apply all filters
  const filteredTransactions = transactions.filter((t) => {
    // Search filter
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    // Date range filter
    const transactionDate = new Date(t.date);
    const matchesDateRange =
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate);

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(t.category);

    return matchesSearch && matchesDateRange && matchesCategory;
  });

  // Filter transactions based on active tab
  const tabFilteredTransactions = filteredTransactions.filter((t) => {
    if (activeTab === "all") return true;
    if (activeTab === "income") return Number.parseFloat(t.amount) < 0;
    if (activeTab === "expenses") return Number.parseFloat(t.amount) > 0;
    return true;
  });

  const sortedTransactions = [...tabFilteredTransactions].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortDirection === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    } else {
      const amountA = Number.parseFloat(a.amount);
      const amountB = Number.parseFloat(b.amount);
      return sortDirection === "asc" ? amountA - amountB : amountB - amountA;
    }
  });

  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const getCategoryColor = (category: string) => {
    const categories: Record<string, string> = {
      Food: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      Transport:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      Shopping:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      Entertainment:
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      Bills:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      Health: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Travel:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      Education:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Income:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };

    return (
      categories[category] ||
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const totalAmount = sortedTransactions.reduce(
    (sum, t) => sum + Number.parseFloat(t.amount),
    0,
  );
  const formattedTotal = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalAmount);

  return (
    <div className="mt-4 overflow-hidden rounded-xl border-none bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-xl sm:mt-6 dark:from-neutral-900 dark:to-neutral-800">
      {/* Card Header */}
      <div className="border-b border-neutral-200 bg-white px-3 py-3 sm:px-6 sm:py-4 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl dark:text-white">
              Transacciones
            </h2>
            <p className="mt-1 text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
              {sortedTransactions.length} transactions found • Total:{" "}
              {formattedTotal}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400 sm:h-4 sm:w-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 py-1.5 pl-8 text-xs outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-300 sm:h-10 sm:px-4 sm:py-2 sm:pl-9 sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex h-9 w-full items-center justify-center gap-1 rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 sm:h-10 sm:w-auto sm:py-2 sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700",
                showFilters && "bg-neutral-100 dark:bg-neutral-700",
              )}
            >
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-700 text-[10px] text-white sm:h-5 sm:w-5 sm:text-xs dark:bg-neutral-200 dark:text-neutral-800">
                  {(selectedCategories.length > 0 ? 1 : 0) +
                    (startDate || endDate ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50"
          >
            <div className="p-3 sm:p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xs font-medium text-neutral-700 sm:text-sm dark:text-neutral-300">
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex w-fit items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium text-neutral-600 hover:bg-neutral-200 sm:text-xs dark:text-neutral-400 dark:hover:bg-neutral-700"
                  >
                    <X className="h-3 w-3" />
                    Clear all
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-3 sm:gap-4 md:grid-cols-2">
                {/* Date Range Filter */}
                <div>
                  <h4 className="mb-1.5 text-[10px] font-medium text-neutral-500 sm:mb-2 sm:text-xs dark:text-neutral-400">
                    Date Range
                  </h4>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="w-full">
                      <DatePicker
                        ref={startDatePickerRef}
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Start date"
                      />
                    </div>
                    <div className="w-full">
                      <DatePicker
                        ref={endDatePickerRef}
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="End date"
                      />
                    </div>
                  </div>
                </div>

                {/* Categories Filter */}
                <div>
                  <h4 className="mb-1.5 text-[10px] font-medium text-neutral-500 sm:mb-2 sm:text-xs dark:text-neutral-400">
                    Categories
                  </h4>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {uniqueCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={cn(
                          "rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors sm:px-3 sm:py-1 sm:text-xs",
                          selectedCategories.includes(category)
                            ? getCategoryColor(category)
                            : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700",
                        )}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="scrollbar-hide w-full overflow-x-auto">
        <div className="border-b border-neutral-200 bg-neutral-50 px-3 sm:px-6 dark:border-neutral-700 dark:bg-neutral-800/50">
          <div className="flex h-10 min-w-[300px] space-x-1 sm:h-12">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-2 sm:text-sm",
                activeTab === "all"
                  ? "bg-white shadow-sm dark:bg-neutral-800"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-300",
              )}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("income")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-2 sm:text-sm",
                activeTab === "income"
                  ? "bg-white shadow-sm dark:bg-neutral-800"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-300",
              )}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab("expenses")}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-2 sm:text-sm",
                activeTab === "expenses"
                  ? "bg-white shadow-sm dark:bg-neutral-800"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-300",
              )}
            >
              Expenses
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          <div className="p-0">
            <div className="flex flex-row items-center justify-between border-b border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-500 sm:px-6 sm:py-3 sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
              <button
                className="flex items-center gap-1 rounded-md px-2 py-1 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => toggleSort("date")}
              >
                Date
                {sortBy === "date" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ))}
              </button>
              <button
                className="flex items-center gap-1 rounded-md px-2 py-1 font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => toggleSort("amount")}
              >
                Amount
                {sortBy === "amount" &&
                  (sortDirection === "asc" ? (
                    <ChevronUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  ))}
              </button>
            </div>

            {sortedTransactions.length === 0 ? (
              <div className="p-4 text-center sm:p-6">
                <div className="text-xs text-neutral-500 sm:text-sm dark:text-neutral-400">
                  No {activeTab} transactions found
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-2 rounded-md bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-700 hover:bg-neutral-200 sm:px-3 sm:py-1 sm:text-xs dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-700">
                <AnimatePresence>
                  {sortedTransactions.map((transaction, index) => {
                    const isExpanded = expandedTransaction === index;
                    const isPositive =
                      Number.parseFloat(transaction.amount) < 0;
                    const formattedAmount = new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(Math.abs(Number.parseFloat(transaction.amount)));

                    return (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={cn(
                          "relative cursor-pointer bg-white transition-colors hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/80",
                          isExpanded && "bg-neutral-50 dark:bg-neutral-800/80",
                        )}
                        onClick={() =>
                          setExpandedTransaction(isExpanded ? null : index)
                        }
                      >
                        <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
                          <div className="flex w-full items-start gap-2 sm:gap-4">
                            <div
                              className={cn(
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10",
                                isPositive
                                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                              )}
                            >
                              {isPositive ? (
                                <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                              )}
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                              <div className="flex w-full flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <h4 className="max-w-[220px] truncate text-sm font-medium text-neutral-900 sm:max-w-xs dark:text-white">
                                  {transaction.description.length > 30
                                    ? `${transaction.description.substring(0, 30)}...`
                                    : transaction.description}
                                </h4>
                                <div
                                  className={cn(
                                    "text-right text-sm font-medium",
                                    isPositive
                                      ? "text-green-600 dark:text-green-400"
                                      : "text-red-600 dark:text-red-400",
                                  )}
                                >
                                  {isPositive ? "+" : "-"}
                                  {formattedAmount} {transaction.currency}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-500 sm:gap-2 sm:text-xs dark:text-neutral-400">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  {formatDate(transaction.date)}
                                </span>
                                <span
                                  className={cn(
                                    "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-normal sm:px-2 sm:text-xs",
                                    getCategoryColor(transaction.category),
                                  )}
                                >
                                  {transaction.category}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 flex items-center justify-end sm:mt-0 sm:ml-4">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/dashboard/transactions/${transaction.id}`,
                                );
                              }}
                              className="flex items-center gap-1 rounded-md bg-neutral-100 px-2 py-1 text-[10px] font-medium text-neutral-700 transition-colors hover:bg-neutral-200 sm:text-xs dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                            >
                              <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              Detalles
                            </button>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-neutral-200 bg-neutral-50 px-3 py-3 sm:px-6 sm:py-4 dark:border-neutral-700 dark:bg-neutral-800/50"
                            >
                              <div className="grid gap-3 text-xs sm:text-sm md:grid-cols-2">
                                <div>
                                  <p className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                    Description
                                  </p>
                                  <p className="mt-1 text-xs break-words text-neutral-900 sm:text-sm dark:text-white">
                                    {transaction.description}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                    Category
                                  </p>
                                  <p className="mt-1 text-xs text-neutral-900 sm:text-sm dark:text-white">
                                    {transaction.category}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                    Date
                                  </p>
                                  <p className="mt-1 text-xs text-neutral-900 sm:text-sm dark:text-white">
                                    {formatDate(transaction.date)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-medium text-neutral-500 sm:text-xs dark:text-neutral-400">
                                    Amount
                                  </p>
                                  <p
                                    className={cn(
                                      "mt-1 text-xs font-medium sm:text-sm",
                                      isPositive
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-red-600 dark:text-red-400",
                                    )}
                                  >
                                    {isPositive ? "+" : "-"}
                                    {formattedAmount}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Default export for easy page testing
export default function TransactionsPage({
  transactions,
}: {
  transactions: TransactionOutput[];
}) {
  return (
    <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-4">
      <h1 className="mb-3 text-xl font-bold text-neutral-900 sm:mb-6 sm:text-2xl dark:text-white">
        Lista De Transacciones
      </h1>
      <TransactionsList transactions={transactions} />
    </div>
  );
}
