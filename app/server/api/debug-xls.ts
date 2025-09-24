// // server/api/debug-xls.ts
// process.env.XLSX_NO_DYNAMIC_IMPORTS = 'true'
// import axios from 'axios'
// import { read } from 'xlsx'

// export default defineEventHandler(async () => {
// 	try {

// 		const fileUrl = 'http://localhost:3000/data/np_geostory2025-08-25.xlsx'

// 		// Scarica il file come arraybuffer
// 		const response = await axios.get(fileUrl, { responseType: 'arraybuffer' })
// 		console.log(`File downloaded successfully\nResponse size: ${response.data.byteLength} bytes`)
// 		// Legge il file Excel dal buffer
// 		const uint8 = new Uint8Array(response.data)
// 		const workbook = read(uint8, { type: 'array' })

// 		// // 		console.log(`File read successfully\nbuffer length: ${buffer.length}`)
// 		// //		const workbook = read(buffer, { type: 'buffer' })
// 		//     	const sheetName = workbook.SheetNames[0] // Prende il primo foglio
// 		//     	const sheet = workbook.Sheets[sheetName]
// 		//     	const data = utils.sheet_to_json(sheet)


// 		return { data: "file read" }
// 	} catch (error) {
// 		console.error('Errore completo:', error)
// 		return { error: (error as Error).message }
// 	}

// })

