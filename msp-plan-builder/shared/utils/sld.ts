import type { Style, Rule, Filter } from 'geostyler-style';
// Importa i tipi corretti da 'maplibre-gl'
import type {
	LayerSpecification,
	FilterSpecification,
	FillLayerSpecification,
	SymbolLayerSpecification,
	LineLayerSpecification
} from 'maplibre-gl';
import type { AnyLayer } from 'mapbox-gl';

type FilterTranslator = (filter: Filter) => FilterSpecification;
export type SourcedLayer = FillLayerSpecification | SymbolLayerSpecification | LineLayerSpecification;

/**
 * Converte una risposta testuale SLD in un array di LayerSpecification per Maplibre GL JS.
 * Gestisce la conversione tramite geostyler e inietta manualmente i filtri SLD 
 * nell'output Mapbox/Maplibre per garantire una corretta visualizzazione condizionale.
 */
export async function getLayerFromSLDResponse(text: string): Promise<LayerSpecification[]> {
	try {
		// Import dinamico dei parser, necessario in Nuxt o ambienti SSR
		const sldParserModule = await import('geostyler-sld-parser');
		const MapboxStyleParserModule = await import('geostyler-mapbox-parser');

		const sdl = new sldParserModule.SldStyleParser();
		const mbParser = new MapboxStyleParserModule.MapboxStyleParser();

		// Passo 1: Leggi lo stile SLD nel formato intermedio di GeoStyler
		const { output: rawGeoStylerStyle } = await sdl.readStyle(text);

		if (!rawGeoStylerStyle?.rules || rawGeoStylerStyle.rules.length === 0) {
			return [];
		}

		const mbStyle = await mbParser.writeStyle(rawGeoStylerStyle as Style);
		const styles = mbStyle?.output?.layers as AnyLayer[] || [];

		const filterTranslator: FilterTranslator = (f: Filter) => mbParser.getFilterFromMapboxFilter!([f]) as FilterSpecification;// Override della funzione di traduzione dei filtri per mantenere i filtri SLD originali

		const finalLayers = injectSldFilter(
			rawGeoStylerStyle.rules,
			styles,
			filterTranslator);

		finalLayers.forEach(l => {
			console.log("final layer:", JSON.stringify(l))
		});

		return finalLayers;

	} catch (error) {
		console.error("Server SLD conversion error:", error);
		return [];
	}
}

/**
 * Associa i filtri definiti nelle regole SLD originali ai layer Maplibre generati, 
 * utilizzando l'indice per garantire la corrispondenza corretta.
 */
function injectSldFilter(rules: Rule[], baseLayers: AnyLayer[], ft: FilterTranslator): LayerSpecification[] {
	const finalLayers: LayerSpecification[] = [];
	const processedBaseLayerIds = new Set<string>();
	const styleCache = new Map<string, SourcedLayer>();
	rules.forEach((rule, ruleIndex) => {
		// Determina il suffisso ID corretto per il tipo di symbolizer (0 per Fill, 1 per Line/Outline)
		// Nota: questa logica è basata sulla osservazione degli ID generati da geostyler-mapbox-parser
		if (rule.symbolizers?.some(s => s.kind === 'Raster')) {
			return; // Non gestire i layer raster
		}

		const stTypeSuffix = rule.symbolizers?.find(s => s.kind === 'Fill') ? 0 : 1;
		const layerId = `r${ruleIndex}_sy0_st${stTypeSuffix}`;
		console.log("processing rule:", rule.name, " with filter:", rule.filter, " looking for generated layer id:", layerId);
		const foundLayer = baseLayers.find(l => l.id === layerId) as SourcedLayer | undefined;
		if (!foundLayer) {
			console.warn(`Layer not found for ID: ${layerId}. Rule "${rule.name}" might be skipped.`);
			return;
		}

		let currentFilter = rule.filter ? cleanFilter(ft(rule.filter)) : null
		if (Array.isArray(currentFilter)) {
			const filters = currentFilter as any[]
			if (filters[0] === "||") filters[0] = "any";
			if (filters[0] === "&&") filters[0] = "all";
		}
		if (currentFilter) {
			foundLayer.filter = currentFilter;
		} else {
			delete foundLayer.filter;
		}


		console.log(`Injected filter for layer ${layerId}`)

		// Aggiungi il layer (con o senza filtro) all'array finale, se non è già stato aggiunto
		if (!processedBaseLayerIds.has(layerId)) {
			finalLayers.push(foundLayer);
			processedBaseLayerIds.add(layerId);
		}

	});

	// Se ci sono layer base che non sono stati gestiti da nessuna regola SLD specifica, 
	// potremmo volerli aggiungere qui come fallback generici.
	baseLayers.forEach(layer => {
		if (layer.id && !processedBaseLayerIds.has(layer.id!)) {
			finalLayers.push(layer as LayerSpecification); // Abilitare se si vuole un fallback generico
			processedBaseLayerIds.add(layer.id!);
		}
	});
	return finalLayers;
}
function cleanFilter(filter: any): FilterSpecification {
	if (!Array.isArray(filter)) return filter;

	// Se è un array che contiene un solo elemento che è a sua volta un array: [[...]] -> [...]
	if (filter.length === 1 && Array.isArray(filter[0])) {
		return cleanFilter(filter[0]);
	}

	return filter.map(item => cleanFilter(item)) as any;
}

function sample(rules: Rule[], baseLayers: AnyLayer[], ft: FilterTranslator): LayerSpecification[] {
	const finalLayers: LayerSpecification[] = [];
	const filter = ["any", ["==", "GESAchieve", "GES achieved by 2018"]] as FilterSpecification;
	finalLayers.push({
		paint: { "fill-color": "#0083e0" },
		filter: filter,
		type: "fill",

		id: "r0_sy0_st0",

	} as LayerSpecification);
	finalLayers.push({
		paint: { "fill-color": "#b83230" },
		filter: ["==", "GESAchieve", "GES not achieved by 2018"],
		type: "fill",

		id: "r1_sy0_st0",

	} as LayerSpecification);

	return finalLayers;

}