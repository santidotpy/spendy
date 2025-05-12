"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Label,
} from "recharts";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  X,
  WalletIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  TrendingUp,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "~/components/ui/chart";
import { Input } from "~/components/ui/input";
import { TransactionOutput } from "~/server/api/types";
import { useDollarRate } from "~/hooks/use-currency-rate";
import { formatCurrency } from "~/utils/pdf-extract";

// Helper function for class names
function cn(...inputs: (string | undefined | null | false | 0)[]) {
  return inputs.filter(Boolean).join(" ");
}

const chartConfig = {
  amount: {
    label: "Amount",
  },
  comida: {
    label: "Comida",
    color: "hsl(var(--chart-1))",
  },
  transporte: {
    label: "Transporte",
    color: "hsl(var(--chart-2))",
  },
  utilities: {
    label: "Utilities",
    color: "hsl(var(--chart-3))",
  },
  entertainment: {
    label: "Entertainment",
    color: "hsl(var(--chart-4))",
  },
  health: {
    label: "Health",
    color: "hsl(var(--chart-5))",
  },
  shopping: {
    label: "Shopping",
    color: "hsl(var(--chart-6))",
  },
  housing: {
    label: "Housing",
    color: "hsl(var(--chart-7))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-8))",
  },
} satisfies ChartConfig;

// Mock data for the dashboard
const timeRanges = [
  "Last 30 Days",
  "This Month",
  "Last Month",
  "This Quarter",
  "This Year",
  "Custom",
];

// Daily expenses data for line chart
const dailyExpenses = [
  { date: "Sep 01", amount: 45 },
  { date: "Sep 05", amount: 1200 },
  { date: "Sep 10", amount: -850 },
  { date: "Sep 15", amount: 60 },
  { date: "Sep 18", amount: 10 },
  { date: "Sep 20", amount: 32 },
  { date: "Sep 23", amount: 18 },
  { date: "Sep 25", amount: -3500 },
  { date: "Sep 27", amount: 25 },
  { date: "Sep 28", amount: 13 },
  { date: "Sep 30", amount: 85 },
];

// Get category color
const getCategoryColorPie = (category: string) => {
  const categories: Record<string, string> = {
    Comida: "#10B981", // verde esmeralda
    Transporte: "#3B82F6", // azul brillante
    Servicios: "#6366F1", // azul-violeta
    Entretenimiento: "#EC4899", // rosa fuerte
    Viajes: "#F59E0B", // naranja dorado
    Salud: "#EF4444", // rojo vivo
    Compras: "#E879F9", // rosa lavanda
    Mascotas: "#0D9488", // verde-azulado
    Supermercado: "#84CC16", // verde lima
    Otros: "#9CA3AF", // gris neutro
  };

  return categories[category] || "#6b7280";
};

const getCategoryColor = (category: string) => {
  const categories: Record<string, string> = {
    Food: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    Transport: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
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
    Income: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };

  return (
    categories[category] ||
    "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
  );
};

// Weekly comparison data for bar chart
const weeklyComparison = [
  { name: "Week 1", expenses: 1500, income: 3500 },
  { name: "Week 2", expenses: 800, income: 0 },
  { name: "Week 3", expenses: 1200, income: 850 },
  { name: "Week 4", expenses: 950, income: 0 },
];

// const balance = totalIncome - totalExpenses

// Format currency
const formatCurrencyUSD = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatCurrencyARS = (amount: number) => {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export function Dashboard({
  transactions,
}: {
  transactions: TransactionOutput[];
}) {
  const [selectedTimeRange, setSelectedTimeRange] = useState("Last 30 Days");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Extract unique categories
  const uniqueCategories = Array.from(
    new Set(transactions.map((t) => t.category)),
  ).sort();
  console.log(uniqueCategories);

  // gasto por categoría
  const categoryExpenses = uniqueCategories.map((category) => {
    const total = transactions
      .filter((t) => t.category === category)
      .reduce((sum, t) => sum + Math.abs(Number.parseFloat(t.amount)), 0);

    return {
      name: category,
      value: total,
      fill: getCategoryColorPie(category),
    };
  });

  // Calculate total expenses
  const totalExpenses = transactions
    .filter((t) => Number.parseFloat(t.amount) > 0)
    .reduce((sum, t) => sum + Math.abs(Number.parseFloat(t.amount)), 0);

  // Calculate expenses in USD
  const totalExpensesUSD = transactions
    .filter((t) => Number.parseFloat(t.amount) > 0 && t.currency === "USD")
    .reduce((sum, t) => sum + Math.abs(Number.parseFloat(t.amount)), 0);

  const totalIncome = transactions
    .filter((t) => Number.parseFloat(t.amount) < 0)
    .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0);
  // Calculate balance
  const balance = totalIncome - totalExpenses;

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
    setSelectedCategories([]);
    setSearchTerm("");
  };

  const showPercentage = (value: number, total: number) => {
    return ((value / total) * 100).toFixed(0);
  };

  function CustomTooltipContent({ payload }: { payload?: any[] }) {
    if (!payload || payload.length === 0) return null;

    const { name, value } = payload[0];
    const percentage = showPercentage(value, totalExpenses);

    return (
      <div className="bg-background rounded-md border p-2 shadow-sm">
        {/* <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div> */}
        <div className="text-foreground text-sm font-medium">{name}</div>
        <div className="text-muted-foreground text-sm">
          ${value.toLocaleString()} ({percentage}%)
        </div>
      </div>
    );
  }

  const monthlyExpenses = transactions.map((t) => {
    const date = new Date(t.date);
    return {
      date: date.toLocaleString("default", { month: "long" }),
      amount: Number.parseFloat(t.amount),
    };
  });

  // Check if any filters are active
  const hasActiveFilters = selectedCategories.length > 0 || searchTerm;

  // Apply all filters
  const filteredTransactions = transactions.filter((t) => {
    // Search filter
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(t.category);

    return matchesSearch && matchesCategory;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
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

  // Paginate transactions
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  // Toggle sort
  const toggleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

  const dollarRate = useDollarRate();

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50 dark:bg-neutral-900">
      <main className="flex-1 p-6">
        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Gastado (USD)
              </CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrencyUSD(totalExpensesUSD)}
              </div>
              {/* <p className="text-xs text-gray-500">+12.5% from last month</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Gastado (ARS)
              </CardTitle>
              <ArrowDownIcon className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
              {/* <p className="text-xs text-gray-500">+5.2% from last month</p> */}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              {balance >= 0 ? (
                <TrendingUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDownIcon className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                <p className="text-xs text-gray-500">Aproximado en ARS</p>
                {totalExpensesUSD > 0
                  ? dollarRate !== undefined
                    ? formatCurrency(
                        totalExpenses + totalExpensesUSD * dollarRate,
                      )
                    : "Cargando..."
                  : formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-gray-500">
                1 USD ={" "}
                {dollarRate !== undefined
                  ? formatCurrency(dollarRate)
                  : "Cargando..."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Monthly Spendings Bar Chart (USD vs ARS) */}
          <Card className="col-span-full lg:col-span-2">
            <CardHeader>
              <CardTitle>Gastos mensuales por moneda</CardTitle>
              <CardDescription>Últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  usd: { label: "USD", color: "#85BB65" },
                  ars: { label: "ARS", color: "#1DA1F2" },
                }}
                className="aspect-[4/3] w-full sm:aspect-[2/1]"
              >
                <BarChart
                  accessibilityLayer
                  data={(() => {
                    const monthly: Record<
                      string,
                      { usd: number; ars: number }
                    > = {};

                    transactions.forEach((t) => {
                      if (Number.parseFloat(t.amount) > 0) {
                        const date = new Date(t.date);
                        const key = `${date.getFullYear()}-${String(
                          date.getMonth() + 1,
                        ).padStart(2, "0")}`;
                        if (!monthly[key]) monthly[key] = { usd: 0, ars: 0 };
                        if (t.currency === "USD") {
                          monthly[key].usd += Math.abs(
                            Number.parseFloat(t.amount),
                          );
                        } else if (t.currency === "ARS") {
                          monthly[key].ars += Math.abs(
                            Number.parseFloat(t.amount),
                          );
                        }
                      }
                    });

                    const result = Object.entries(monthly)
                      .map(([key, vals]) => {
                        const [year, month] = key.split("-");
                        const date = new Date(Number(year), Number(month) - 1); // -1 porque los meses son 0-11
                        return {
                          month: date.toLocaleString("default", {
                            month: "short",
                            year: "numeric",
                          }),
                          sortKey: key,
                          ...vals,
                          date,
                        };
                      })
                      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

                    const sixMonthsAgo = new Date();
                    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

                    return result.filter((entry) => entry.date >= sixMonthsAgo);
                  })()}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    stroke="#94a3b8"
                    fontSize={12}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Legend />
                  <Bar dataKey="usd" fill="#85BB65" radius={4} name="USD" />
                  <Bar dataKey="ars" fill="#1DA1F2" radius={4} name="ARS" />
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 leading-none font-medium">
                Gastos totales en aumento este mes
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                Mostrando gastos de los últimos 6 meses
              </div>
            </CardFooter>
          </Card>

          {/* Spending by Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Gastos por Categoría</CardTitle>
              <CardDescription>
                Distribución de gastos por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  {/* TODO: que todas los consumos esten en ARS */}
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={<CustomTooltipContent />}
                      />
                      <Pie
                        data={categoryExpenses}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-center text-sm font-bold"
                                  >
                                    {/* categoria mas alta */}
                                    {
                                      categoryExpenses.reduce((max, cat) =>
                                        cat.value > max.value ? cat : max,
                                      ).name
                                    }
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    {/* {totalExpenses.toLocaleString()} */}
                                    Mayor consumo
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {uniqueCategories.map((category) => (
                  <div key={category} className="flex items-center gap-2">
                    {/* <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} /> */}
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: getCategoryColorPie(category) }}
                    />
                    <span className="text-xs">{category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Transacciones Recientes</CardTitle>
                <div className="flex gap-2">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Buscar Transacciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "flex items-center gap-1",
                      showFilters && "bg-gray-100",
                    )}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filtros</span>
                    {hasActiveFilters && (
                      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                        {selectedCategories.length}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              <CardDescription>
                Tus transacciones financieras más recientes
              </CardDescription>
            </CardHeader>

            {/* Filters Panel */}
            {showFilters && (
              <div className="border-t border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-neutral-700 dark:bg-neutral-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Filtros</h3>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-8 px-2 text-xs"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Limpiar todos
                    </Button>
                  )}
                </div>

                <div className="mt-3">
                  <h4 className="mb-2 text-xs font-medium text-gray-500 dark:text-neutral-400">
                    Categorías
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCategories.map((category) => (
                      <Badge
                        key={category}
                        variant="outline"
                        className={cn(
                          "cursor-pointer",
                          selectedCategories.includes(category)
                            ? getCategoryColor(category)
                            : "dark:bg-neutral-700 dark:text-white",
                        )}
                        onClick={() => toggleCategory(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 font-medium"
                          onClick={() => toggleSort("date")}
                        >
                          Fecha
                          {sortBy === "date" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 font-medium"
                          onClick={() => toggleSort("amount")}
                        >
                          Monto
                          {sortBy === "amount" &&
                            (sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            ))}
                        </Button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedTransactions.map((transaction) => {
                        const isIncome =
                          Number.parseFloat(transaction.amount) < 0;
                        const formattedAmount = formatCurrency(
                          Math.abs(Number.parseFloat(transaction.amount)),
                        );

                        return (
                          <TableRow
                            key={transaction.id}
                            className="hover:bg-gray-50 dark:hover:bg-neutral-800"
                          >
                            <TableCell className="font-medium">
                              {formatDate(transaction.date)}
                            </TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-normal",
                                  getCategoryColor(transaction.category),
                                )}
                              >
                                {transaction.category}
                              </span>
                            </TableCell>
                            <TableCell
                              className={
                                isIncome ? "text-green-600" : "text-red-600"
                              }
                            >
                              <div className="flex items-center">
                                {isIncome ? (
                                  <ArrowUpRight className="mr-1 h-4 w-4" />
                                ) : (
                                  <ArrowDownLeft className="mr-1 h-4 w-4" />
                                )}
                                {isIncome ? "+" : "-"}
                                {formattedAmount}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(
                      currentPage * itemsPerPage,
                      sortedTransactions.length,
                    )}{" "}
                    of {sortedTransactions.length} transactions
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function DashboardGraphs({
  transactions,
}: {
  transactions: TransactionOutput[];
}) {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">
        Dashboard
      </h1>
      <Dashboard transactions={transactions} />
    </div>
  );
}
