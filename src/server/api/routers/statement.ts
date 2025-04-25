// src/server/api/routers/statement.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const TransactionSchema = z.array(
  z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    description: z.string(),
    amount: z.number(),
    currency: z.enum(["ARS", "USD"]),
    category: z.string(),
  }),
);

export const statementRouter = createTRPCRouter({
  parseText: publicProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input }) => {
      const prompt = `
      Extraé transacciones del siguiente resumen de tarjeta de crédito. Devolveme **únicamente** un JSON con esta estructura exacta:

[
  {
    "date": "YYYY-MM-DD",
    "description": "Descripción del gasto",
    "amount": 1234.56,
    "currency": "ARS",
    "category": "Categoría del gasto"
  }
]

Reglas:
- No incluyas ningún texto extra, solo el array JSON.
- El campo "date" debe tener el formato YYYY-MM-DD.
- Ignora pagos y saldos anteriores.
- El campo "amount" debe ser un número positivo.
- La categoría para cada transacción debe ser una de las siguientes:
  "Comida", "Transporte", "Salud", "Entretenimiento", "Servicios", "Compras", "Viajes", "Mascotas", "Supermercado", "Otros".
- En caso de no poder determinar la categoría, usá "Otros".
- El campo "currency" debe ser "ARS" o "USD" según corresponda.
- No incluyas "comprobante", "IVA", ni ninguna otra clave extra.
- Si la fecha aparece sin año, asumí el año del resumen (por ejemplo 2025).
- No uses bloques Markdown como \`\`\`json.
- Devolvé **solamente** el array, sin envolverlo en objetos.

Texto:
"""${input.text}"""
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "Sos un extractor de transacciones bancarias. Devolvé solo JSON puro sin explicaciones ni comentarios. No uses bloques de código markdown.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      });

      const choice = completion.choices[0];
      if (!choice?.message?.content) {
        throw new Error("La respuesta de OpenAI está vacía o malformada.");
      }

      const response = choice.message.content;
      console.log("📦 Respuesta cruda de OpenAI:\n", response);

      // const clean = response
      //   .trim()
      //   .replace(/^```json|^```|```$/g, "")
      //   .trim();

      let parsedJson: any;

    try {
      // Intenta parsear directamente
      parsedJson = JSON.parse(response.trim());
    } catch {
      // Si falla, intenta limpiar bloques markdown tipo ```json ... ```
      const match = response.match(/\[.*\]/s); // captura array completo entre corchetes
      if (!match) {
        throw new Error("No se pudo encontrar un JSON válido.");
      }

      parsedJson = JSON.parse(match[0]);
    }

    const parsed = TransactionSchema.parse(parsedJson);
    return { transactions: parsed };


      // try {
      //   const parsed = TransactionSchema.parse(JSON.parse(clean));
      //   return { transactions: parsed };
      // } catch (err) {
      //   console.error("❌ Error al validar JSON devuelto por GPT:", err);
      //   throw new Error("OpenAI devolvió un resultado inválido.");
      // }
    }),
});

// import { z } from "zod";
// import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// const pdfjs = await import("pdfjs-dist/webpack.mjs")

// export const statementRouter = createTRPCRouter({
//   parsePdf: publicProcedure
//     .input(
//       z.object({
//         fileBuffer: z.instanceof(Uint8Array),
//       }),
//     )
//     .mutation(async ({ input }) => {
//       const pdf = await pdfjs.getDocument({
//         data: new Uint8Array(input.fileBuffer),
//       }).promise;

//       const numPages = pdf.numPages;
//       let rawTextHolder = "";

//       for (let i = 1; i <= numPages; i++) {
//         const page = await pdf.getPage(i);
//         const textContent = await page.getTextContent();

//         const text = textContent.items
//           .map((item) => {
//             // Check that item is TextItem (having "str" property) and filter undefineds, nulls, spaces, and empty strings
//             if ("str" in item && !!item.str.trim()) {
//               return item.str.trim();
//             }
//             return null;
//           })
//           .join(" ");

//         rawTextHolder += text;
//       }

//       return rawTextHolder;
//     }),
// });

// ==========

// import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
// import { z } from "zod";
// // import pdfParse from "pdf-parse";
// import { extractTextFromPdfBase64 } from "~/utils/pdf-extract";

// import OpenAI from "openai";
// import { Readable } from "stream";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // Asegurate de tenerla en tu .env
// });

// export const statementRouter = createTRPCRouter({
//   parsePdf: publicProcedure
//     .input(
//       z.object({
//         base64Pdf: z.string(), // frontend convierte archivo a base64
//       }),
//     )
//     .mutation(async ({ input }) => {
//       // try {
//         const pdfText = await extractTextFromPdfBase64(input.base64Pdf);
//         console.log("PDF Text:", pdfText);

//         const prompt = `
// Dado el siguiente resumen de tarjeta de crédito, devolvé un JSON con todas las transacciones, cada una con: date (YYYY-MM-DD), description, amount (número) y currency ("ARS" o "USD").
// Texto:
// """${pdfText}"""
// `;

//         const completion = await openai.chat.completions.create({
//           model: "gpt-4-turbo",
//           messages: [
//             {
//               role: "system",
//               content: "Sos un extractor de transacciones bancarias.",
//             },
//             { role: "user", content: prompt },
//           ],
//           temperature: 0.2,
//         });

//         const response = completion.choices[0]?.message?.content ?? "";
//         if (!response) {
//           throw new Error("The response content is null or undefined.");
//         }
//         const transactions = JSON.parse(response);

//         return { transactions };
//       } catch (error) {
//         console.error("Error parsing PDF:", error);
//         throw new Error("Failed to parse the PDF and extract transactions.");
//       }
//     }),
// });
