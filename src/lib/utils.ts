import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        return reject(new Error("Expected a Data URL string"));
      }

      // split into [ "data:image/…" , "BASE64…" ]
      const parts = result.split(",", 2);
      const base64 = parts[1];
      if (!base64) {
        return reject(new Error("Invalid Data URL: no base64 payload"));
      }

      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

export function sanitizeFileName(filename: string): string {
  return filename
    .normalize("NFD") // separa acentos y tildes
    .replace(/[\u0300-\u036f]/g, "") // elimina tildes
    .replace(/[^a-zA-Z0-9._-]/g, "-") // reemplaza todo lo no permitido
    .replace(/-+/g, "-") // colapsa múltiples guiones
    .toLowerCase();
}