import { createWorker } from "tesseract.js"

export async function extractTextFromImage(file: File): Promise<string> {
  const worker = await createWorker("spa+eng", 1, {
    logger: (m) => console.log(m),
  })

  const {
    data: { text },
  } = await worker.recognize(file)
  await worker.terminate()

  return text
}
