"use client"

import { useCallback, useState, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"
import { TransactionsList } from "~/app/_components/transactions-list"
import { usePDFJS } from "~/hooks/use-pdftext"
import type * as PDFJS from "pdfjs-dist/types/src/pdf"
import type { TransactionOutput } from "~/server/types"
import { calculateFileHash, fileToBase64, getBankName } from "~/lib/utils"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
const MAX_RETRY_AMOUNT = 3

export function FileUpload() {
  const createFile = api.statement.createFile.useMutation()
  const [error, setError] = useState<string | null>(null)
  const parseText = api.statement.parseText.useMutation()
  const [isPdfLibReady, setIsPdfLibReady] = useState(false)
  const [transactions, setTransactions] = useState<TransactionOutput[] | null>(null)
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [useAI, setUseAI] = useState(true)
  const [processingStage, setProcessingStage] = useState<"idle" | "uploading" | "extracting" | "success">("idle")
  const pdfjs = useRef<typeof PDFJS | null>(null)
  usePDFJS(async (pdfjsLib) => {
    setIsPdfLibReady(true)
    pdfjs.current = pdfjsLib
  })

  const handleSendToOpenAI = async (text: string) => {
    try {
      setProcessingStage("extracting")
      const result = await parseText.mutateAsync({ text })
      setProcessingStage("success")
      toast.success("Extracción de transacciones completada")
      return result.transactions
    } catch (err) {
      console.error("Error al enviar a OpenAI:", err)
      setError("Error procesando con GPT.")
      setProcessingStage("idle")
    }
  }

  const handleFileChange = async (file: File): Promise<boolean> => {
    if (!file.type.startsWith("application/pdf")) {
      setError("Por favor selecciona un archivo PDF")
      return true
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("El archivo no puede ser mayor a 4MB")
      return true
    }

    setProcessingStage("uploading")
    const dataHash = await calculateFileHash(file)
    try {
      const fileData = await fileToBase64(file)
      const rawText = await getRawText(file)
      const bankName = getBankName(rawText)
      const {
        url: publicUrl,
        id,
        duplicate,
      } = await createFile.mutateAsync({
        fileName: file.name,
        fileData,
        contentType: file.type,
        dataHash: dataHash,
        bankName: bankName,
      })

      if (duplicate) {
        toast.warning("Este archivo ya ha sido subido anteriormente")
        setError("Este archivo ya ha sido subido anteriormente")
        setProcessingStage("idle")
        return true // archivo duplicado
      }

      setError(null)
      return false // archivo no duplicado
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Error subiendo el archivo")
      setProcessingStage("idle")
      return true // error: mejor evitar seguir
    }
  }

  const getRawText = useCallback(
    async (file: File, retryAmount = 0): Promise<string> => {
      const buffer = await file.arrayBuffer()

      const pdfLib = pdfjs.current
      if (!pdfLib) {
        if (retryAmount >= MAX_RETRY_AMOUNT) {
          throw new Error("PDFJS not loaded")
        }

        await new Promise((resolve) => setTimeout(resolve, 200))
        return getRawText(file, retryAmount + 1)
      }

      const pdf = await pdfLib.getDocument({
        data: new Uint8Array(buffer),
      }).promise

      const numPages = pdf.numPages
      let rawTextHolder = ""

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()

        const text = textContent.items
          .map((item) => {
            // Check that item is TextItem (having "str" property) and filter undefineds, nulls, spaces, and empty strings
            if ("str" in item && !!item.str.trim()) {
              return item.str.trim()
            }
            return null
          })
          .join(" ")

        rawTextHolder += text
      }

      return rawTextHolder
    },
    [pdfjs.current],
  )

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const uploadedFile = acceptedFiles[0]
    if (!uploadedFile) return

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file")
      return
    }

    const wasDuplicate = await handleFileChange(uploadedFile)
    // si esta duplicado, no se procesa
    if (wasDuplicate) return

    const text = await getRawText(uploadedFile)
    const transactions = await handleSendToOpenAI(text)

    if (transactions) setTransactions(transactions)

    setError(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: processingStage !== "idle",
  })

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
  ]

  const handleModelChange = (modelId: string) => {
    const selectedModel = AI_MODELS.find((model) => model.id === modelId)
    if (selectedModel) {
      setSelectedProvider(selectedModel.provider)
      setSelectedModel(modelId)
      console.log("Selected model:", selectedModel)
    }
  }

  const getProcessingMessage = () => {
    switch (processingStage) {
      case "uploading":
        return "Subiendo archivo..."
      case "extracting":
        return "Extrayendo transacciones..."
      case "success":
        return "¡Extracción completada!"
      default:
        return ""
    }
  }

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`relative overflow-hidden cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragActive
            ? "border-primary bg-primary/5 scale-[1.02] shadow-lg"
            : processingStage !== "idle"
              ? "border-primary/50 bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/30 hover:bg-muted/30"
        } ${error ? "border-red-500 bg-red-50 dark:bg-red-950/20" : ""}`}
      >
        <AnimatePresence mode="wait">
          {processingStage === "idle" && !parseText.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center"
            >
              <input
                {...getInputProps()}
                disabled={!isPdfLibReady || parseText.isPending || processingStage !== "idle"}
              />
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Upload className="text-primary h-10 w-10" />
              </div>

              <h3 className="mb-2 text-lg font-medium">
                {isDragActive ? "Soltá tu archivo aquí" : "Arrastrá o seleccioná tu archivo"}
              </h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                Sube tu resumen de tarjeta para extraer automáticamente las transacciones
              </p>
              <p className="text-muted-foreground mt-2 text-xs">Solo se aceptan archivos PDF (máx. 4MB)</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 rounded-md bg-red-100 p-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {(processingStage !== "idle" || parseText.isPending) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center py-8"
            >
              {processingStage === "success" ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <motion.div
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </motion.div>
                  </div>
                  <h3 className="mb-1 text-lg font-medium text-green-700 dark:text-green-400">
                    ¡Extracción completada!
                  </h3>
                  <p className="text-muted-foreground text-sm">Las transacciones han sido procesadas correctamente</p>
                  <Button variant="outline" className="mt-4" onClick={() => setProcessingStage("idle")}>
                    Subir otro archivo
                  </Button>
                </motion.div>
              ) : (
                <>
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                      >
                        <Loader2 className="h-10 w-10 text-primary" />
                      </motion.div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        initial={{ opacity: 0.2 }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        className="h-20 w-20 rounded-full bg-primary/10"
                      />
                    </div>
                    <div className="h-20 w-20" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">{getProcessingMessage()}</h3>
                  <p className="text-muted-foreground text-sm">
                    {processingStage === "uploading"
                      ? "Preparando tu archivo para procesamiento"
                      : "Analizando el contenido con IA"}
                  </p>
                  <motion.div
                    className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-muted"
                    initial={{ width: "12rem" }}
                  >
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 1.5,
                        ease: "linear",
                      }}
                    />
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {transactions && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <TransactionsList transactions={transactions} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TransactionsListSkeleton() {
  return (
    <div className="mt-6 space-y-2">
      <div className="h-4 w-1/4 rounded bg-muted" />
      <div className="mt-4 grid grid-cols-4 gap-4">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="col-span-4 grid grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <div className="col-span-1 h-4 rounded bg-muted" />
            <div className="col-span-2 h-4 rounded bg-muted" />
            <div className="col-span-1 h-4 rounded bg-muted" />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
