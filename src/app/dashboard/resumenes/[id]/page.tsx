import { api } from "~/trpc/server"
import ClientPage from "./client-page"

export default async function StatementDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const statement = await api.statement.getStatementById({ id: Number(params.id) })
  // console.log("123 statement", statement)
  const file = await api.statement.getFileById({ id: statement?.fileId! })
  // console.log("123 file", file)
  const signedFileUrl = await api.statement.getSignedFileUrl({ path: file?.path.split("/").pop()! })
  // console.log("123 signedFileUrl", signedFileUrl)
  
  if (file) {
    file.path = signedFileUrl.signedUrl
  }

  if (!statement || !file) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h3 className="mt-4 text-lg font-medium">Statement not found</h3>
          <p className="text-muted-foreground mt-2">
            The statement you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-4">
            <a href="/dashboard/resumenes" className="text-primary hover:underline">
              Back to Statements
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <ClientPage statement={statement} file={file} />
}
