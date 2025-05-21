import { api } from "~/trpc/server";
import ClientPage from "./client-page";

export default async function StatementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const statement = await api.statement.getStatementById({
    id: Number(params.id),
  });
  const file = await api.statement.getFileById({ id: statement?.fileId! });
  const signedFileUrl = await api.statement.getSignedFileUrl({
    path: file?.path.split("/").pop()!,
  });

  if (file) {
    file.path = signedFileUrl.signedUrl;
  }

  if (!statement || !file) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h3 className="mt-4 text-lg font-medium">Resumen no encontrado</h3>
          <p className="text-muted-foreground mt-2">
            El resumen que estás buscando no existe o ha sido eliminado.
          </p>
          <div className="mt-4">
            <a
              href="/dashboard/resumenes"
              className="text-primary hover:underline"
            >
              Volver a Resúmenes
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <ClientPage statement={statement} file={file} />;
}
