export type StandardLayerType = 'raster' | 'vector' | 'geojson' | 'unknown';
export type LayerParams = Record<string, string | number | boolean>;

export type MapVisualOptions = {
	url: string;
	standardType: StandardLayerType;
	layerName: string;
	layerType?: string;
	zoomLevel?: number;
	serviceParams?: string;
	viewStyle?: Record<string, any>;
};
export interface MapRequest {
	serviceUrl: string;
	standardType: StandardLayerType;
	serviceLabel: "WMS"| "WFS";
	opacity: number; // da 0 a 1
	visible: boolean;
	legendUrl?: string;
	layerParams: LayerParams | null ;
	owsFormat: string | null ;

	layerName?: string;
	layerType?: string;
	viewStyle?: Record<string, any>;
	zoomLevel?: number;
	mapServiceParams?: string;
		// Altri parametri specifici per il tipo di servizio possono essere aggiunti qui
}


export const mapToStandardType = (rawType: string): StandardLayerType => {
		const lowerCaseType = rawType.toLowerCase();
		switch (lowerCaseType) {
			case 'wms':
			case 'tileprovider':
			case 'osm':
			case 'raster':
				return 'raster';
			case 'wfs':
			case 'vector':
			//	return 'vector';
			case 'geojson':
				return 'geojson';
			// Aggiungi altri case se necessario
			default:
				return 'unknown';
		}
	}
