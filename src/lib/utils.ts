import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Zap,
  Video,
  Music,
  Play,
  Gamepad2,
  Wifi,
  ShoppingBag,
  Dumbbell,
  Clapperboard,
  ShoppingCart,
  Briefcase,
  PiggyBank,
  Sparkles,
  CirclePlay,
} from "lucide-react"

import type { TransactionOutput } from "~/server/api/types"

export const subscriptionPatterns = {
  netflix: {
    keywords: ["netflix", "nflx"],
    name: "Netflix",
    icon: Video,
    color: "bg-red-500",
    category: "Entretenimiento",
  },
  spotify: {
    keywords: ["spotify", "spot"],
    name: "Spotify",
    icon: Music,
    color: "bg-green-500",
    category: "Entretenimiento",
  },
  prime: {
    keywords: ["amazon prime", "prime video", "amzn", "DLO*PRIMEVIDEO", "dlo*primevideo", "prime"],
    name: "Prime Video",
    icon: Play,
    color: "bg-blue-600",
    category: "Entretenimiento",
  },
  disney: {
    keywords: ["disney", "disney+", "disneyplus"],
    name: "Disney+",
    icon: Video,
    color: "bg-blue-700",
    category: "Entretenimiento",
  },
  youtube: {
    keywords: ["youtube premium", "youtube music", "ytb"],
    name: "YouTube Premium",
    icon: Play,
    color: "bg-red-600",
    category: "Entretenimiento",
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
    category: "Servicios",
  },
  shopping: {
    keywords: ["mercadolibre", "amazon", "subscription"],
    name: "Shopping",
    icon: ShoppingBag,
    color: "bg-yellow-600",
    category: "Compras",
  },
  gym: {
    keywords: ["gym", "fitness", "gympass"],
    name: "Gym",
    icon: Dumbbell,
    color: "bg-green-500",
    category: "Salud",
  },
  max: {
    keywords: ["max", "HBO", "HBO Max", "HBO Go", "hbo", "hbo max"],
    name: "HBO Max",
    icon: Clapperboard,
    color: "bg-purple-600",
    category: "Entretenimiento",
  },
} as const

export interface SubscriptionData {
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

export function identifySubscriptions(transactions: TransactionOutput[]): SubscriptionData[] {
  const subscriptionMap = new Map<string, TransactionOutput[]>()

  transactions.forEach((transaction) => {
    const description = transaction.description.toLowerCase()

    for (const [key, pattern] of Object.entries(subscriptionPatterns)) {
      if (pattern.keywords.some((keyword) => description.includes(keyword))) {
        if (!subscriptionMap.has(key)) subscriptionMap.set(key, [])
        subscriptionMap.get(key)!.push(transaction)
        return
      }
    }

    const existingKey = Array.from(subscriptionMap.keys()).find((k) => {
      const existing = subscriptionMap.get(k)!
      return existing.some(
        (t) =>
          t.description.toLowerCase() === description &&
          Math.abs(Number.parseFloat(t.amount) - Number.parseFloat(transaction.amount)) < 100, // 100 pesos de diferencia, podria ser un poco mas
      )
    })

    if (existingKey) {
      subscriptionMap.get(existingKey)!.push(transaction)
    } else {
      subscriptionMap.set(description, [transaction])
    }
  })

  let subscriptions: SubscriptionData[] = []

  subscriptionMap.forEach((transactions, key) => {
    if (transactions.length >= 1) {
      const pattern = subscriptionPatterns[key as keyof typeof subscriptionPatterns]
      const sortedTransactions = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      const latestTransaction = sortedTransactions[0]
      if (!latestTransaction) return

      const avgAmount =
        transactions.reduce((sum, t) => sum + Math.abs(Number.parseFloat(t.amount)), 0) / transactions.length

      const dates = transactions.map((t) => new Date(t.date)).sort((a, b) => b.getTime() - a.getTime())
      if (!dates[0]) return

      const daysBetween =
        dates.length > 1
          ? Math.round((dates[0].getTime() - dates[1]!.getTime()) / (1000 * 60 * 60 * 24))
          : 30

      const nextPayment = new Date(dates[0])
      nextPayment.setDate(nextPayment.getDate() + Math.max(daysBetween, 30))

      subscriptions.push({
        id: key,
        name: pattern?.name || latestTransaction.description,
        icon: pattern?.icon || Zap,
        color: pattern?.color || "bg-gray-500",
        monthlyAmount: avgAmount,
        currency: latestTransaction.currency,
        lastPayment: latestTransaction.date,
        nextPayment: nextPayment.toISOString().split("T")[0] || "",
        category: pattern?.category || latestTransaction.category,
        transactions: sortedTransactions,
      })
    }
  })
  //remove supermercado and compras from subscriptions
  return subscriptions.filter((s) => s.category !== "Supermercado" && s.category !== "Compras").sort((a, b) => b.monthlyAmount - a.monthlyAmount)
}


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        return reject(new Error("Expected a Data URL string"));
      }

      // split into [ "data:image/…" , "BASE64…" ]
      const parts = result.split(",", 2);
      const base64 = parts[1];
      if (!base64) {
        return reject(new Error("Invalid Data URL: no base64 payload"));
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

export function sanitizeFileName(filename: string): string {
  return filename
    .normalize("NFD") // separa acentos y tildes
    .replace(/[\u0300-\u036f]/g, "") // elimina tildes
    .replace(/[^a-zA-Z0-9._-]/g, "-") // reemplaza todo lo no permitido
    .replace(/-+/g, "-") // colapsa múltiples guiones
    .toLowerCase();
}

export async function calculateFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}


export function getBankName(text: string): string {
  const banks = ["Santander", "BBVA", "Galicia"];
  const encontrado = banks.find((bank) =>
    text.toLowerCase().includes(bank.toLowerCase())
  );
  return encontrado ?? "Desconocido";
}


export const categoryIcons: Record<string, React.ElementType> = {
  "Compras": ShoppingBag,
  "Supermercado": ShoppingCart,
  "Entretenimiento": CirclePlay,
  "Gaming": Gamepad2,
  "Salud": Dumbbell,
  "Servicios": Wifi,
  "Trabajo": Briefcase,
  "Ahorros": PiggyBank,
  "Otros": Sparkles,
  "Musica": Music,
}

export const categoryColors: Record<string, string> = {
  "Compras": "#FF4F00",
  "Supermercado": "#fb923c",
  "Entretenimiento": "#1ED760",
  "Gaming": "#8b5cf6",
  "Salud": "#10b981",
  "Servicios": "#f97316",
  "Trabajo": "#3b82f6",
  "Ahorros": "#22c55e",
  "Otros": "#a855f7",
  "Musica": "#1ED760",
}