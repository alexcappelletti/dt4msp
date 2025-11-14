// src/types.ts
interface BboxBounds {
    maxx: number;
    maxy: number;
    minx: number;
    miny: number;
}


export interface LayerParams {
	id: number;
	title: string;
	type: 'osm' | 'wms' | 'tileprovider' | string; // Aggiungi altri tipi se noti
	singleTile: boolean;
	dimensions: any[]; // Array di oggetti dimensione, se ne hai la struttura
	hideLoading: boolean;
	handleClickOnLayer: boolean;
	useForElevation: boolean;
	hidden: boolean;
	extraParams: {
		msId: string;
		[key: string]: any; // Permette parametri extra non specificati
	};
	wrapDateLine: boolean;
	displayOutsideMaxExtent: boolean;
	// Potrebbero esserci altri campi come url, provider, bbox a seconda del tipo di layer
	url?: string|null; 
	provider?: string;
    Bbox?: { bounds: BboxBounds; crs: string };
    Style?: string|null;
}

interface GeonodeLayerBase {
	pk: number;
	name: string;
	store: string | null;
	stack_order: number;
	format: string | null;
	opacity: number;
	styles: string;
	transparent: boolean;
	fixed: boolean;
	group: string;
	visibility: boolean;
	owsUrl: string | null;
	raw_url: string | null;
	local: boolean;

}

export interface RawLayerDef extends GeonodeLayerBase {
	layer_params: string; 
	source_params: string;

}
export interface GeonodeLayer extends GeonodeLayerBase {
	layer_params: LayerParams;
	source_params: Record<string, any>;

}