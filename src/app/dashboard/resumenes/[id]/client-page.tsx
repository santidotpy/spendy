"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { ArrowLeft, Download, Eye, FileText, Calendar, CreditCard, Clock, FileIcon, Landmark } from "lucide-react"
import Link from "next/link"
// import { PDFViewer } from "~/components/pdf-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
// import { BankLogo } from "~/components/bank-logo"

interface Statement {
  id: string
  bankName: string
  accountNumber: string
  accountType: string
  dateRange: string
  uploadDate: string
  fileName: string
  fileSize: string
  pdfUrl: string
  summary: {
    openingBalance: string
    closingBalance: string
    deposits: string
    withdrawals: string
  }
}

interface ClientPageProps {
  statement: Statement
}

export default function ClientPage({ statement }: ClientPageProps) {
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header with breadcrumb and actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 mt-1">
            <Link href="/dashboard/resumenes">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Volver a resumenes</span>
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Landmark className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                Resumen de {statement.bankName}
              </h1>
              <p className="text-muted-foreground text-sm">{statement.dateRange}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button variant="outline" className="w-full md:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button className="w-full md:w-auto" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Statement details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="outline" className="px-3 py-1 text-sm font-medium rounded-full">
                  {statement.accountType}
                </Badge>
                <div className="text-sm text-muted-foreground">ID: {statement.id}</div>
              </div>

              <h2 className="text-xl font-semibold mb-6">Account Information</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                    <p className="font-medium">{statement.accountNumber}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Statement Period</p>
                    <p className="font-medium">{statement.dateRange}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upload Date</p>
                    <p className="font-medium">{statement.uploadDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <FileIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">File Details</p>
                    <p className="font-medium truncate" title={statement.fileName}>
                      {statement.fileName}
                    </p>
                    <p className="text-sm text-muted-foreground">{statement.fileSize}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-md bg-gradient-to-br from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Financial Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Opening Balance</span>
                  <span className="font-semibold">{statement.summary.openingBalance}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Total Deposits</span>
                  <span className="font-semibold text-green-600">{statement.summary.deposits}</span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Total Withdrawals</span>
                  <span className="font-semibold text-red-600">{statement.summary.withdrawals}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium">Closing Balance</span>
                  <span className="text-xl font-bold">{statement.summary.closingBalance}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - PDF Preview */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="preview">Document Preview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-0">
              {showPreview ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                  {/* <PDFViewer url={statement.pdfUrl} fileName={statement.fileName} /> */}
                </div>
              ) : (
                <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800 h-[600px] flex items-center justify-center">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-6">
                      <FileText className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Preview Hidden</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      You've chosen to hide the document preview. Click the button below to view the statement directly
                      in your browser.
                    </p>
                    <Button onClick={() => setShowPreview(true)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Show Preview
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <Card className="border-none shadow-lg bg-gradient-to-br from-slate-50 to-white dark:from-neutral-900 dark:to-neutral-800 h-[600px] flex items-center justify-center">
                <CardContent className="text-center p-6">
                  <h3 className="text-xl font-semibold mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    We're working on adding detailed analytics for your bank statements. This feature will be available
                    soon.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
