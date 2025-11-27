import { MapVisual, ImageVisual, Visual, MapVisualOptions, StandardLayerType } from '@/models/visual';

// Assumiamo che GeonodeLayer e LayerParams siano definiti nel file your-visual-file
// import type { GeonodeLayer, LayerParams } from "./geonode";


/**
 * Genera un array di 6 MapVisual mock per i test.
 */
export function createMockSOSMaps(): MapVisual[] {
    const visuals: MapVisual[] = [];

    // 1. Sfondo di base (Emodnet Bathymetry)
    visuals.push(new MapVisual({
        url: 'https://ows.emodnet-bathymetry.eu/wms',
        standardType: 'raster',
        layerName: 'emodnet:mean_sea_level', // Esempio di layer name
        layerType: 'wms',
    } as MapVisualOptions));

    // 2. Dominio SoS (Vector/GeoJSON Style 1)
    visuals.push(new MapVisual({
        url: 'https://geoplatform.tools4msp.eu/geoserver/ows?',
        layerName: 'geonode:Dominio_SoS',
        layerType: 'geojson',
        viewStyle: {
            'fill-color': '#1d530b',
            'fill-opacity': 0.68,
            'fill-outline-color': '#b0d2a2'
        },
        standardType: 'geojson'
    } as MapVisualOptions));

    // 3. Acquacultura (Vector/GeoJSON Style 2)
    visuals.push(new MapVisual({
        url: 'https://geoplatform.tools4msp.eu/geoserver/ows',
        layerName: 'geonode:Aquaculture',
        layerType: 'geojson',
        viewStyle: {
            'fill-color': '#e2acf4',
            'fill-opacity': 0.68,
            'fill-outline-color': '#103020'
        },
        // Nota: hai specificato standardType: 'raster' nell'esempio, 
        // ma è più logico 'geojson' data l'URL e lo stile. Lo mantengo come da richiesta:
        standardType: 'raster' 
    } as MapVisualOptions));

    // 4. Rotte Commerciali (Esempio aggiuntivo)
    visuals.push(new MapVisual({
        url: 'https://geoplatform.tools4msp.eu/geoserver/ows',
        layerName: 'geonode:Shipping_Lanes',
        layerType: 'vector',
        viewStyle: {
            'line-color': '#ff0000',
            'line-width': 2
        },
        standardType: 'vector'
    } as MapVisualOptions));
    
    // 5. Aree Protette (Esempio aggiuntivo)
    visuals.push(new MapVisual({
        url: 'data.europa.eu',
        layerName: 'Habitat_Directive_Areas',
        layerType: 'wms',
        standardType: 'raster'
    } as MapVisualOptions));
    
    // 6. Zone di Pesca (Esempio aggiuntivo)
    visuals.push(new MapVisual({
        url: 'ows.fisheries-atlas.eu',
        layerName: 'Fishing_Zones_GFCM',
        layerType: 'wms',
        standardType: 'raster'
    } as MapVisualOptions));

    return visuals;
}