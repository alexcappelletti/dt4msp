import { readBody } from 'h3'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
  try {
    // Salva il file in una cartella temporanea
    const filePath = join(process.cwd(), 'public', 'data', 'scenario.json')
    
    // Rilegge il file
    const fileContent = await readFile(filePath, 'utf-8')
    const parsed = JSON.parse(fileContent)

    return {
      success: true,
      message: 'File JSON caricato e letto correttamente',
      data: parsed
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Errore sconosciuto'
    }
  }
})
