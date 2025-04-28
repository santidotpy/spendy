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
    }),
});
