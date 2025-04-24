"use client";

import { useState } from "react";
import { usePDFJS } from "~/hooks/use-pdftext";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

export function PDFTextExtractor({ file }: { file: File | null }) {
  const [text, setText] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseText = api.statement.parseText.useMutation();

  usePDFJS(
    async (pdfjs) => {
      if (!file) return;

      try {
        setLoading(true);
        setText(null);
        setError(null);
        setTransactions(null);

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        let output = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items.map((item: any) => item.str).join(" ");
          output += pageText + "\n";
        }

        setText(output);
      } catch (err) {
        console.error("Error leyendo PDF:", err);
        setError("No se pudo procesar el PDF.");
      } finally {
        setLoading(false);
      }
    },
    [file?.name]
  );

  const handleSendToOpenAI = async () => {
    if (!text) return;

    try {
      const result = await parseText.mutateAsync({ text });
      setTransactions(result.transactions);
    } catch (err) {
      console.error("Error al enviar a OpenAI:", err);
      setError("Error procesando con GPT.");
    }
  };

  return (
    <div className="mt-4 space-y-4">
      {loading && <p className="text-muted-foreground">Procesando PDF…</p>}
      {error && <p className="text-red-500">{error}</p>}

      {text && (
        <>
          <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded max-h-[300px] overflow-y-auto">
            {text}
          </pre>

          <Button onClick={handleSendToOpenAI}>Extraer transacciones con GPT</Button>
        </>
      )}

      {transactions && (
        <div>
          <h3 className="font-semibold mt-4 mb-2">Transacciones extraídas</h3>
          <ul className="text-sm space-y-1">
            {transactions.map((t, i) => (
              <li key={i} className="border-b py-1">
                📅 {t.date} — 💳 {t.description} — 💰 {t.amount} {t.currency}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
