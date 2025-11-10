import { describe, it, expect, vi, beforeEach } from 'vitest'
import { normalizeUrl, verifyOwsService } from '@/utils/ows'

describe('normalizeUrl', () => {
	it.each([
		['http://localhost:8080/test?x=1', 'http://localhost:8080/test'],
		['invalid-url', 'invalid-url'],
		['https://ows.emodnet-humanactivities.eu/wfs?SERVICE=WFS&REQUEST=GetCapabilities&VERSION=2.0.0', 'https://ows.emodnet-humanactivities.eu/wfs'],
		['https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_open/wfs', 'https://ows.emodnet-seabedhabitats.eu/geoserver/emodnet_open/wfs'],
	])('normalizza %s in %s', (input, expected) => {
		expect(normalizeUrl(input)).toBe(expected)
	})
})

describe('verifyOwsService', () => {
	const mockFetch = vi.fn()

	beforeEach(() => {
		vi.stubGlobal('fetch', mockFetch)
	})

	it('restituisce false per URL non valido', async () => {
		const result = await verifyOwsService('not-a-valid-url')
		expect(result).toBe(false)
	})

	it('restituisce false se fetch fallisce', async () => {
		mockFetch.mockRejectedValueOnce(new Error('Network error'))
		const result = await verifyOwsService('https://example.com/wms')
		expect(result).toBe(false)
	})

	it('restituisce false se response non è ok', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: false,
			status: 404,
			statusText: 'Not Found',
		})
		const result = await verifyOwsService('https://example.com/wms')
		expect(result).toBe(false)
	})

	it('restituisce false se XML non contiene tag OWS', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: async () => '<html><body>No capabilities here</body></html>',
		})
		const result = await verifyOwsService('https://example.com/wms')
		expect(result).toBe(false)
	})

	it('restituisce true se XML contiene <WMS_Capabilities>', async () => {
		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: async () => '<WMS_Capabilities></WMS_Capabilities>',
		})
		const result = await verifyOwsService('https://example.com/wms')
		expect(result).toBe(true)
	})
})