import { Card } from "~/components/ui/card";
import { FileUpload } from "./file-upload";

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-6">Subir resumen</h1>
      <Card className="p-6">
        <FileUpload />
      </Card>
    </div>
  );
}
