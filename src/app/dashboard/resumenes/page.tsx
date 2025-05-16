import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { Download, FileText, Search, Landmark } from "lucide-react"
import Link from "next/link"
import { api } from "~/trpc/server"

export default async function StatementsPage() {
  const statements = await api.statement.getAll();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Mis resumenes</h1>
        {/* ...search/filter UI... */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statements && statements.length > 0 ? (
          statements.map((statement) => (
            <Card key={statement.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-8 w-8" />
                    <span>{statement.bankName}</span>
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {new Date(statement.date).toLocaleDateString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Archivo</div>
                  <div className="font-medium truncate">
                    {statement.fileId ?? "Sin archivo"}
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
                {/* {statement.fileId && (
                  <Button variant="secondary" asChild>
                    <a href={`/dashboard/resumenes/${statement.id}`} target="_blank" rel="noopener noreferrer">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar
                    </a>
                  </Button>
                )} */}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 col-span-full">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No hay resumenes</h3>
            <p className="mt-2 text-sm text-muted-foreground">No has subido ningun resumen todavía.</p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/upload">Subir resumen</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}