import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { ScenarioXlsxReader } from '@/models/xlsReaders'
import { Theme, Scenario } from '@/models/scenario'

describe.skip('Theme model from Excel file', () => {
	it('should correctly parse themes from Excel sheet', () => {
		const workbook = XLSX.readFile('./tests/fixtures/final_scenario_bd.xlsx')
		const sheet = workbook.Sheets['temi']
		const reader = new ScenarioXlsxReader(workbook)
		const scenario: Scenario = reader.readScenario()

		expect(scenario).toBeInstanceOf(Scenario)
		expect(scenario.name).toBe('Blue Development')
		const themes = Object.values(scenario.availableThemes)
		expect(themes.length).toBe(14)
		const topics = scenario.topics
		const energia = topics["BD_energia1"]
		expect(energia).toBeDefined()
		expect(energia?.type).toMatch(/primario|secondario|NA/)
		expect(energia?.geospatialResources.length).toBeGreaterThan(0)

		const firstLayer = energia?.geospatialResources[0]
		expect(firstLayer?.name).toBeTruthy()
		expect(firstLayer?.layerName).toBe(firstLayer?.name)
		expect(firstLayer?.id).toMatch(/^BD_energia1_layer_/)
	})

	it.skip('should skip rows that are completely empty', () => {
		const workbook = XLSX.readFile('./tests/fixtures/final_scenario_bd.xlsx')
		const reader = new ScenarioXlsxReader(workbook)
		const themes: Theme[] = reader.readThemesFromSheet()

		const emptyThemes = themes.filter(t => !t.ID && !t.name && !t.type)
		expect(emptyThemes.length).toBe(0)
	})
})