import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { Scenario, Theme, Impact, MapLayer } from '@/models/scenario'

describe('Scenario JSON loader', () => {
	const jsonPath = path.resolve(__dirname, '../../public/fixtures/scenario_bd-v0_02.json')
	const rawData = fs.readFileSync(jsonPath, 'utf-8')
	const parsed: Scenario = JSON.parse(rawData)


	it('parsed should correctly set basic data', () => {
		//expect(parsed).toBeInstanceOf(Scenario)
		expect(parsed.name).toBe('Blue Development')
		expect(parsed.generalDescription).toBe('Economia blu sostenibile basata su soluzioni innovative/tecnologie verdi')
		expect(parsed.narrative).toContain('obiettivi di conservazione e azioni per fvorire sviluppo sostenibile di economa blu')
		
		
	})
	it('parsed should correctly set themes and topics', () => {
		expect(parsed.availableThemes.length).toBe(13)
		expect(parsed.primaryThemes.length).toBeGreaterThan(0)
		expect(parsed.secondaryThemes.length).toBeGreaterThan(0)
		
		expect(Object.values(parsed.topics).length).toBe(13)
	})
})
