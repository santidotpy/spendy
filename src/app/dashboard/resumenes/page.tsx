import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { FileText, Landmark } from "lucide-react";
import Link from "next/link";
import { api } from "~/trpc/server";

export default async function StatementsPage() {
  const statements = await api.statement.getAll();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-3xl font-bold">Mis resumenes</h1>
        {/* ...search/filter UI... */}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statements && statements.length > 0 ? (
          statements.map((statement) => (
            <Card key={statement.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Landmark className="h-8 w-8" />
                    <span>{statement.bankName}</span>
                  </div>
                  {/* <span className="text-sm font-normal text-muted-foreground">
                    {new Date(statement.date).toLocaleDateString()}
                  </span> */}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm">
                    Fecha de subida
                  </div>
                  <div className="truncate font-medium">{statement.date}</div>
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
          <div className="col-span-full py-12 text-center">
            <FileText className="text-muted-foreground mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-medium">No hay resumenes</h3>
            <p className="text-muted-foreground mt-2 text-sm">
              No has subido ningun resumen todavía.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/upload">Subir resumen</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
