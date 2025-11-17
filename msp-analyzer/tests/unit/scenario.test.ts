import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'
import { Scenario, Theme, Impact, MapLayer } from '@/models/scenario'

describe.skip('Scenario JSON loader with nested Theme, Impact, and MapLayer', () => {
	it('should correctly instantiate a full Scenario from JSON', () => {
		const jsonPath = path.resolve(__dirname, '../../out/scenario.json')
		const rawData = fs.readFileSync(jsonPath, 'utf-8')
		const parsed: Scenario = JSON.parse(rawData)



		// ✅ Verifiche
		//expect(parsed).toBeInstanceOf(Scenario)
		expect(parsed.name).toBe('Blue Development')
		expect(Object.values(parsed.topics).length).toBe(13)

		const trasp = parsed.topics['BD_trasporto']
		expect(trasp).toBeDefined()
		expect(Object.values(trasp?.impacts|| {}).length).toBe(6)

		expect(trasp?.impacts["Incremento del traffico marittimo"]?.nome).toBe('Incremento del traffico marittimo')
		expect(trasp?.impacts["Incremento del traffico marittimo"]?.layers.length).toBe(2)
		expect(trasp?.impacts["Incremento del traffico marittimo"]?.layers[0]?.type).toBe("map")
		

		const energia = parsed.topics['BD_energia1']
		expect(energia).toBeDefined()
		expect(Object.values(energia?.impacts || {}).length).toBe(0)
		
	})
})
