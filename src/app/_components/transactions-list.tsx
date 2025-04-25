"use client";

import { useState } from "react";
import { usePDFJS } from "~/hooks/use-pdftext";
import { api } from "~/trpc/react";
import type { TransactionOutput } from "~/server/types";
import { formatCurrency } from "~/utils/pdf-extract";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";

export function TransactionsList({ transactions }: { transactions: TransactionOutput[] | null }) {
  if (!transactions || transactions.length === 0) return null;

  return (
    <Card className="mt-6 border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg md:text-xl font-bold tracking-tight">
          💳 Transacciones extraídas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <ul className="space-y-4 text-sm md:text-base">
            {transactions.map((t, i) => (
              <li
                key={i}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 rounded-xl border border-zinc-800 hover:bg-zinc-900 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium text-zinc-200">{t.description}</p>
                  <div className="text-xs text-zinc-400">
                    <span>📅 {t.date}</span> — <span>🏷️ {t.category}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  <Badge variant="outline" className="text-[#1c9cf0] border-white">
                    {t.currency}
                  </Badge>
                  <span className="text-[#ede4d4] font-semibold">
                    {formatCurrency(Number(t.amount))}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}