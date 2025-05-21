"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  ArrowLeft,
  Eye,
  FileText,
  Clock,
  FileIcon,
  Landmark,
} from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import PDFViewer from "~/components/pdf-viewer";

interface Statement {
  id: number;
  date: string;
  bankName: string;
  userId: string;
  fileId: number | null;
}

interface File {
  id: number;
  name: string;
  path: string;
  dataHash: string;
  userId: string;
  extension: string;
}

interface ClientPageProps {
  statement: Statement;
  file: File;
}

export default function ClientPage({ statement, file }: ClientPageProps) {
  const [showPreview, setShowPreview] = useState(true);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header with breadcrumb and actions */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="mt-1 h-8 w-8">
            <Link href="/dashboard/resumenes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver a resumenes</span>
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Landmark className="h-12 w-12" />
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                Resumen de {statement.bankName}
              </h1>
              <p className="text-muted-foreground text-sm">{statement.date}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column - Statement details */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="overflow-hidden border-none bg-gradient-to-br from-slate-50 to-white shadow-md dark:from-neutral-900 dark:to-neutral-800">
            <CardContent className="px-6">
              <div className="mb-6 flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="rounded-full px-3 py-1 text-sm font-medium"
                >
                  {statement.bankName}
                </Badge>
              </div>

              <h2 className="mb-6 text-xl font-semibold">
                Información del archivo
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <Clock className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Fecha de subida
                    </p>
                    <p className="font-medium">{statement.date}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 rounded-full p-2">
                    <FileIcon className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">
                      Nombre del archivo
                    </p>
                    <p className="truncate font-medium" title={file.name}>
                      {file.name}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - PDF Preview */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-1">
              <TabsTrigger value="preview">Vista previa</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-0">
              {showPreview ? (
                <div className="overflow-hidden rounded-lg bg-white shadow-lg dark:bg-neutral-900">
                  <PDFViewer file={file.path} className="min-h-[800px]" />
                  {/* <Document file={file.path}>
                    <Page pageNumber={1} />
                  </Document> */}

                  {/* <Card className="flex h-[600px] items-center justify-center border-none bg-gradient-to-br from-slate-50 to-white shadow-lg dark:from-neutral-900 dark:to-neutral-800">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                      <div className="bg-primary/10 mb-6 rounded-full p-4">
                        <FileText className="text-primary h-12 w-12" />
                      </div>

                      <Link href={file.path} target="_blank">
                        <Button className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" />
                          Ver resumen
                        </Button>
                      </Link>
                    </CardContent>
                  </Card> */}
                </div>
              ) : (
                <Card className="flex h-[600px] items-center justify-center border-none bg-gradient-to-br from-slate-50 to-white shadow-lg dark:from-neutral-900 dark:to-neutral-800">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-primary/10 mb-6 rounded-full p-4">
                      <FileText className="text-primary h-12 w-12" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold">
                      Preview Hidden
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      You've chosen to hide the document preview. Click the
                      button below to view the statement directly in your
                      browser.
                    </p>
                    <Button onClick={() => setShowPreview(true)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver resumen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
