"use client";

import { useState } from "react";
import { usePDFJS } from "~/hooks/use-pdftext";
import { Button } from "~/components/ui/button";

export function PDFTextExtractor({ file }: { file: File | null }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  usePDFJS(
    async (pdfjs) => {
      if (!file) return;

      try {
        setLoading(true);
        setText(null);
        setError(null);

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
    [file?.name] // se vuelve a ejecutar cada vez que cambia el archivo
  );

  return (
    <div className="mt-4">
      {loading && <p className="text-muted-foreground">Procesando PDF…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {text && (
        <pre className="whitespace-pre-wrap text-xs bg-muted p-3 rounded max-h-[300px] overflow-y-auto">
          {text}
        </pre>
      )}
    </div>
  );
}
