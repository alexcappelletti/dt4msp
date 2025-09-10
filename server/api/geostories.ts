
// import { read, utils } from 'xlsx'
// import fs from 'fs'
// import path from 'path'
// import { fileURLToPath } from 'url'


// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)



// import { GeostoryXlsxReader, ScenarioXlsxReader } from '@/models/xlsReaders'
// import { Scenario } from '@/models/scenario'

// export default defineEventHandler(() => {
	
	
// 	// // Implement the logic to read Excel files and return geostories and scenarios
// 	// const filePath1 = path.resolve('./server/data/final_scenario_bd.xlsx')
// 	// const filePath2 =  path.resolve('./server/data/np_geostory2025-08-25.xlsx')
// 	// console.log('Path1:', filePath1)
// 	// console.log('Path2:', filePath2)

// 	// if (!fs.existsSync(filePath1) || !fs.existsSync(filePath2)) {
// 	// 	return { error: `Files non trovati [${filePath1} , ${filePath2}]` }
// 	// }

// 	// const workbook = read(fs.readFileSync(filePath1))
// 	// const reader = new ScenarioXlsxReader(workbook)
// 	// // const scenario: Scenario = reader.readScenario()

// 	// // const geostoryWorkbook = read(fs.readFileSync(filePath2))
// 	// // const geostoryReader = new GeostoryXlsxReader(geostoryWorkbook)
// 	// // const geostory = geostoryReader.loadGeoStory()

// 	// return { scenario, geostory}
// 	return { success: true, message: 'This is a placeholder API endpoint. Please implement the logic to load and return geostories and scenarios from Excel files.' }
// })
