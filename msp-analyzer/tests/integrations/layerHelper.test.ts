// tests/unit/layerManipulator.spec.ts
import { describe, it, expect } from 'vitest';
import { useLayerHelper } from '../../app/composables/useLayerHelper';
import {mockAquacultureLayer, mockScenariMspLayer} from '../mocks/gn-layer-mock';


// 'describe' raggruppa una suite di test per una specifica funzione o modulo
describe.skip('useLayerHelper suite', () => {

	// Inizializza il manipolatore prima di ogni test
	const { buildWfsGetFeatureParams } = useLayerHelper();

	it('should generate the correct WFS parameters with default values', () => {
		// Esegui la funzione che stiamo testando
		const params = buildWfsGetFeatureParams(mockAquacultureLayer);

		expect(params).toEqual({
			service: 'WFS',
			version: '2.0.0',
			request: 'GetFeature',
			typename: 'geonode:aquaculture',
			outputFormat: 'application/json',
			srsName: 'EPSG:3857',
			maxFeatures: '50',
		});
	});

	it.skip('should include a CQL filter when specified', () => {

		const cqlFilter = "STATE_NAME = 'California'";

		const params = buildWfsGetFeatureParams(mockAquacultureLayer, { cqlFilter });

		expect(params).toHaveProperty('cql_filter', cqlFilter);

		expect(params.service).toBe('WFS');
		expect(params.maxFeatures).toBe('50');
	});

	it('should override default options (maxFeatures and format)', () => {
		const params = buildWfsGetFeatureParams(mockAquacultureLayer, {
			maxFeatures: 10,
			outputFormat: 'text/xml; subtype=gml/3.1.1'
		});

		// Verifica le sovrascritture
		expect(params.maxFeatures).toBe('10');
		expect(params.outputFormat).toBe('text/xml; subtype=gml/3.1.1');
		expect(params.service).toBe('WFS');
	});
	it('should compose a valid http query', ()=>{
		const query = new URLSearchParams(buildWfsGetFeatureParams(mockScenariMspLayer))
		const fullUrl = `${mockAquacultureLayer.ows_url}?${query.toString()}` 
		const expected =
			'https://geoplatform.tools4msp.eu/geoserver/ows?VERSION=2.0.0&SERVICE=WFS&REQUEST=GetFeature&TYPENAME=geonode%3Ascenari_MSP4Biodiversity&OUTPUTFORMAT=application%2Fjson';
		expect(expected).toEqual(fullUrl)

	})
	
});
