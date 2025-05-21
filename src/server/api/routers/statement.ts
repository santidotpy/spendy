// src/server/api/routers/statement.ts
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import OpenAI from "openai";
import { transactions, files, statements } from "~/server/db/schema";
import { mediaBuckets, supabase } from "~/lib/supabase";
import { sanitizeFileName } from "~/lib/utils";

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
  parseText: protectedProcedure
    .input(z.object({ text: z.string() }))
    .mutation(async ({ input, ctx }) => {
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
        model: "gpt-4.1-mini",
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
      await ctx.db.insert(transactions).values(
        parsed.map((transaction) => ({
          ...transaction,
          userId: ctx.userId,
          cardId: null, // Asignar el ID de la tarjeta si es necesario
          amount: String(transaction.amount).replace(",", "."),
        })),
      );
      return { transactions: parsed };
    }),

  checkFileExists: protectedProcedure
    .input(z.object({ dataHash: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const existing = await ctx.db.query.files.findFirst({
        where: (f, { eq, and }) =>
          and(eq(f.dataHash, input.dataHash), eq(f.userId, ctx.userId)),
      });

      return {
        exists: !!existing,
        fileId: existing?.id || null,
        url: existing?.path || null,
      };
    }),

    createFile: protectedProcedure
    .input(z.object({
      fileData: z.string(),
      fileName: z.string(),
      contentType: z.string(),
      dataHash: z.string(),
      // Optionally, add bankName and date if you want to store them
      bankName: z.string().optional(),
      date: z.string().optional(), // ISO string
    }))
    .mutation(async ({ input, ctx }) => {
      // Verificar primero si el archivo ya existe
      const existing = await ctx.db.query.files.findFirst({
        where: (f, { eq, and }) =>
          and(eq(f.dataHash, input.dataHash), eq(f.userId, ctx.userId)),
      });

      if (existing) {
        // Si ya existe, retornamos la información del archivo existente
        return { 
          url: existing.path, 
          id: existing.id,
          duplicate: true 
        };
      }

      // Si no existe, procedemos con la subida
      const { fileData, fileName, contentType, dataHash } = input;
      const buffer = Buffer.from(fileData, "base64");
  
      const filePath = `${Date.now()}-${sanitizeFileName(fileName)}`;
      const { data, error } = await supabase.storage
        .from(mediaBuckets.statements)
        .upload(filePath, buffer, {
          contentType,
          upsert: false,
        });
  
      if (error) throw new Error("Error al subir el archivo");
  
      const {
        data: { publicUrl },
      } = supabase.storage
        .from(mediaBuckets.statements)
        .getPublicUrl(data.path);
  
      // Guardamos el registro en la base de datos
      const fileRecord = await ctx.db.insert(files).values({
        name: fileName,
        path: publicUrl,
        dataHash,
        userId: ctx.userId,
        extension: fileName.split(".").pop() || "",
      }).returning({ id: files.id });
  
      // Create statement record
      await ctx.db.insert(statements).values({
        userId: ctx.userId,
        fileId: fileRecord[0]?.id,
        bankName: input.bankName ?? "Desconocido",
        date: input.date ? input.date : new Date().toISOString(),
      });
  
      return { 
        url: publicUrl, 
        id: fileRecord[0]?.id || data.path,
        duplicate: false 
      };
    }),

    getAllFiles: protectedProcedure.query(async ({ ctx }) => {
      const userFiles = await ctx.db.query.files.findMany({
        where: (f, { eq }) => eq(f.userId, ctx.userId),
        orderBy: (f, { desc }) => [desc(f.id)],
      });
      return userFiles;
    }),

    getAllStatements: protectedProcedure.query(async ({ ctx }) => {
      const userStatements = await ctx.db.query.statements.findMany({
        where: (s, { eq }) => eq(s.userId, ctx.userId),
        orderBy: (s, { desc }) => [desc(s.id)],
      });
      return userStatements;
    }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      const myStatements = await ctx.db.query.statements.findMany({
        where: (statements, { eq }) => eq(statements.userId, ctx.userId),
        orderBy: (statements, { desc }) => [desc(statements.date)],
      });
      return myStatements;
    }),

    getFileById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      const file = await ctx.db.query.files.findFirst({
        where: (f, { eq }) => eq(f.id, input.id),
      });
      return file;
    }),
    getStatementById: protectedProcedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
      const statement = await ctx.db.query.statements.findFirst({
        where: (s, { eq }) => eq(s.id, input.id),
      });
      return statement;
    }),

    getSignedFileUrl: protectedProcedure
  .input(z.object({ path: z.string() }))
  .query(async ({ input }) => {
    const { data, error } = await supabase.storage
      .from(mediaBuckets.statements)
      .createSignedUrl(input.path, 60); // 1 minuto

    if (error || !data) throw new Error("No se pudo generar la URL firmada");
    return { signedUrl: data.signedUrl };
  })

});