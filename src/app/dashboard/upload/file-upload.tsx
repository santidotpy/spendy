"use client";

import { useCallback, useState, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { api } from "~/trpc/react";
import { Buffer } from "buffer";
import { TransactionsList } from "~/app/_components/transactions-list";
import { usePDFJS } from "~/hooks/use-pdftext";
import * as PDFJS from "pdfjs-dist/types/src/pdf";
import type { TransactionOutput } from "~/server/types";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { Sparkles } from "lucide-react";
import { Badge } from "~/components/ui/badge";
const MAX_RETRY_AMOUNT = 3;

export function FileUpload() {
  const [error, setError] = useState<string | null>(null);
  const parseText = api.statement.parseText.useMutation();
  const [isPdfLibReady, setIsPdfLibReady] = useState(false);
  const [transactions, setTransactions] = useState<TransactionOutput[] | null>(
    null,
  );
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [useAI, setUseAI] = useState(true);
  const pdfjs = useRef<typeof PDFJS | null>(null);
  usePDFJS(async (pdfjsLib) => {
    setIsPdfLibReady(true);
    pdfjs.current = pdfjsLib;
  });

  const handleSendToOpenAI = async (text: string) => {
    try {
      const result = await parseText.mutateAsync({ text });
      return result.transactions;
    } catch (err) {
      console.error("Error al enviar a OpenAI:", err);
      setError("Error procesando con GPT.");
    }
  };

  const getRawText = useCallback(
    async (file: File, retryAmount = 0): Promise<string> => {
      const buffer = await file.arrayBuffer();

      const pdfLib = pdfjs.current;
      if (!pdfLib) {
        if (retryAmount >= MAX_RETRY_AMOUNT) {
          throw new Error("PDFJS not loaded");
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
        return getRawText(file, retryAmount + 1);
      }

      const pdf = await pdfLib.getDocument({
        data: new Uint8Array(buffer),
      }).promise;

      const numPages = pdf.numPages;
      let rawTextHolder = "";

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        const text = textContent.items
          .map((item) => {
            // Check that item is TextItem (having "str" property) and filter undefineds, nulls, spaces, and empty strings
            if ("str" in item && !!item.str.trim()) {
              return item.str.trim();
            }
            return null;
          })
          .join(" ");

        rawTextHolder += text;
      }

      return rawTextHolder;
    },
    [pdfjs.current],
  );

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    const text = await getRawText(uploadedFile);
    const transactions = await handleSendToOpenAI(text);

    if (transactions) setTransactions(transactions);

    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const AI_MODELS = [
    {
      provider: "OpenAI",
      id: "openai:gpt-4o",
      label: "GPT-4o",
    },
    {
      provider: "OpenAI",
      id: "openai:gpt-4.1-mini",
      label: "GPT-4.1 Mini",
    },
    {
      provider: "Anthropic",
      id: "anthropic:claude-3-sonnet",
      label: "Claude 3 Sonnet",
    },
    {
      provider: "Anthropic",
      id: "anthropic:claude-3-opus",
      label: "Claude 3 Opus",
    },
    {
      provider: "xAI",
      id: "xai:grok-1",
      label: "Grok 1",
    },
    {
      provider: "xAI",
      id: "xai:grok-3",
      label: "Grok 3",
    },
    {
      provider: "Google",
      id: "google:gemini-1.5-flash",
      label: "Gemini 1.5 Flash",
    },
    {
      provider: "Google",
      id: "google:gemini-1.5-pro",
      label: "Gemini 1.5 Pro",
    },
  ];

  const handleModelChange = (modelId: string) => {
    const selectedModel = AI_MODELS.find((model) => model.id === modelId);
    if (selectedModel) {
      setSelectedProvider(selectedModel.provider);
      setSelectedModel(modelId);
      console.log("Selected model:", selectedModel);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center space-x-4 p-3 sm:mb-0">
        <Switch id="ai-extraction" checked={useAI} onCheckedChange={setUseAI} />
        <div className="flex items-center gap-2">
          <Label htmlFor="ai-extraction" className="font-medium">
            {useAI ? "Extraccion con IA" : "Extraccion sin IA"}
            {useAI && (
              <Badge className="flex items-center gap-1 bg-purple-600 text-white hover:bg-purple-700">
                <Sparkles className="h-3.5 w-3.5" />
              </Badge>
            )}
          </Label>
        </div>
      </div>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"} ${error ? "border-red-500" : ""}`}
      >
        {parseText.isPending && (
          <div className="absolute top-1/2 left-1/2 mx-auto">
            <Loader2 className="animate-spin" />
          </div>
        )}

        <div className={parseText.isPending ? "invisible" : ""}>
          <input
            {...getInputProps()}
            disabled={!isPdfLibReady || parseText.isPending}
          />
          <Upload className="text-muted-foreground mx-auto h-12 w-12" />

          <p className="text-muted-foreground mt-4 text-sm">
            {isDragActive
              ? "Soltá tu resumen aquí..."
              : "Arrastrá tu resumen de tarjeta acá, o hacé clic para seleccionarlo"}
          </p>
          <p className="text-muted-foreground mt-2 text-xs">
            Solo se aceptan archivos PDF
          </p>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        </div>
      </div>

      {transactions && <TransactionsList transactions={transactions} />}
    </div>
  );
}

function TransactionsListSkeleton() {
  return (
    <div className="mt-6 animate-pulse space-y-2">
      <div className="bg-muted h-4 w-1/4 rounded" />
      <div className="mt-4 grid grid-cols-4 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="col-span-4 grid grid-cols-4 gap-4">
            <div className="bg-muted col-span-1 h-4 rounded" />
            <div className="bg-muted col-span-2 h-4 rounded" />
            <div className="bg-muted col-span-1 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
