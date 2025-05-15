import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Download, FileText, Search, Landmark } from "lucide-react"
import Link from "next/link"

// Mock data for bank statements
const statements = [
  {
    id: "1",
    bankName: "Santander",
    dateRange: "Jan 1 - Jan 31, 2025",
    uploadDate: "Feb 5, 2025",
    fileName: "santander_statement_jan_2025.pdf",
  },
  {
    id: "2",
    bankName: "BBVA",
    dateRange: "Jan 1 - Jan 31, 2025",
    uploadDate: "Feb 3, 2025",
    fileName: "bbva_statement_jan_2025.pdf",
  },
  {
    id: "3",
    bankName: "Galicia",
    dateRange: "Jan 1 - Jan 31, 2025",
    uploadDate: "Feb 2, 2025",
    fileName: "galicia_statement_jan_2025.pdf",
  },
  {
    id: "4",
    bankName: "Santander",
    dateRange: "Dec 1 - Dec 31, 2024",
    uploadDate: "Jan 5, 2025",
    fileName: "santander_statement_dec_2024.pdf",
  },
  {
    id: "5",
    bankName: "BBVA",
    dateRange: "Dec 1 - Dec 31, 2024",
    uploadDate: "Jan 4, 2025",
    fileName: "bbva_statement_dec_2024.pdf",
  },
  {
    id: "6",
    bankName: "Galicia",
    dateRange: "Dec 1 - Dec 31, 2024",
    uploadDate: "Jan 3, 2025",
    fileName: "galicia_statement_dec_2024.pdf",
  },
]

export default function StatementsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Mis resumenes</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Buscar resumenes..." className="pl-8 w-full" />
          </div>
          <Select>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filtrar por banco" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="santander">Santander</SelectItem>
              <SelectItem value="bbva">BBVA</SelectItem>
              <SelectItem value="galicia">Galicia</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statements.map((statement) => (
          <Card key={statement.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Landmark className="h-8 w-8" />
                  <span>{statement.bankName}</span>
                </div>
                <span className="text-sm font-normal text-muted-foreground">Subido: {statement.uploadDate}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Periodo</div>
                <div className="font-medium">{statement.dateRange}</div>
                <div className="text-sm text-muted-foreground mt-4">Nombre del archivo</div>
                <div className="font-medium truncate" title={statement.fileName}>
                  {statement.fileName}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/resumenes/${statement.id}`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Ver detalles
                </Link>
              </Button>
              <Button variant="secondary">
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {statements.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No hay resumenes</h3>
          <p className="mt-2 text-sm text-muted-foreground">No has subido ningun resumen todavía.</p>
          <Button className="mt-4">Subir resumen</Button>
        </div>
      )}
    </div>
  )
}
