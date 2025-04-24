"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { Buffer } from "buffer";
import { PDFTextExtractor } from "~/app/_components/pdf-extractor";

export function FileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile) return;

    if (uploadedFile.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setFile(uploadedFile);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  // const removeFile = () => {
  //   setFile(null);
  //   setError(null);
  // };

  // const parsePdf = api.statement.parsePdf.useMutation();
  // const [transactions, setTransactions] = useState<any[] | null>(null);
  // const [loading, setLoading] = useState(false);

  // const handleParse = async () => {
  //   if (!file) return;

  //   setLoading(true);
  //   setError(null);
  //   setTransactions(null);

  //   try {
  //     const arrayBuffer = await file.arrayBuffer();
  //     const base64Pdf = Buffer.from(arrayBuffer).toString("base64");

  //     const result = await parsePdf.mutateAsync({ fileBuffer: arrayBuffer });
  //     console.log("Parsed transactions:", result);
  //     // setTransactions(result);
  //   } catch (err) {
  //     console.error(err);
  //     setError("Error processing the PDF. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"} ${error ? "border-red-500" : ""}`}
      >
        <input {...getInputProps()} />
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

      {file && <PDFTextExtractor file={file} />}
    </div>
  );
}
