// test/layerDefinition.test.ts
import { describe, it, expect } from 'vitest'
import { GeonodeLayer } from '@/models/geonode.d'


const API_URL = 'https://geoplatform.tools4msp.eu/api/v2/maps/556/layers/'

describe.skip('LayerDefinition API', () => {
	it('should fetch and deserialize layers correctly', async () => {
		const response = await fetch(API_URL)
		expect(response.ok).toBe(true)

		const json = await response.json() as any[]
		expect(Array.isArray(json)).toBe(true)

		const layers = json.map((item: any) => new GeonodeLayer(item))

		// Verifica base su primo layer
		const first = layers[0]
		expect(first).toBeInstanceOf(GeonodeLayer)
		expect(first).toBeDefined()
		expect(typeof first?.pk).toBe('number')
		expect(typeof first?.name).toBe('string')
		expect(typeof first?.layerParams).toBe('object')
		expect(first?.getLayerId()).toBeDefined()
		//expect(first?.getThumbnail()).toMatch(/^https?:\/\//)
	})
})