import type { GeonodeLayer, LayerParams } from './geonode';

export abstract class Visual {
	abstract readonly format: string;
	abstract readonly contentType: string;
	abstract getUrl(): string;
}

export type MapVisualOptions = {
	url: string;
	standardType: StandardLayerType;
	layerName?: string;
	layerType?: string;
	zoomLevel?: number;
	serviceParams?: string;
	viewStyle?: Record<string, any>;
};
export type StandardLayerType = 'raster' | 'vector' | 'geojson' | 'unknown';

export class MapVisual extends Visual {
	readonly format = 'MAP';
	contentType = 'application/xml';
	serviceUrl: string;
	standardType: StandardLayerType;
	layerParams: LayerParams | null = {} as LayerParams;
	owsFormat: string | null = '';

	layerName?: string;
	layerType?: string;
	viewStyle?: Record<string, any>;
	zoomLevel?: number;
	mapServiceParams?: string;

	constructor(layerOrOptions: GeonodeLayer | MapVisualOptions) {
		super();

		// Controlla se l'input è un GeonodeLayer
		if ('pk' in layerOrOptions && 'layer_params' in layerOrOptions) {
			// Logica per estrarre i dati dal GeonodeLayer
			const layer = layerOrOptions as GeonodeLayer;
			this.serviceUrl = layer.owsUrl || layer.layer_params.url || '';
			console.log(`${layer.name} -> ${this.serviceUrl}`);
			this.layerName = layer.name;
			this.layerType = layer.layer_params.type ?? 'undefined';
			this.layerParams = layer.layer_params;
			this.owsFormat = layer.format;
			// ... estrai altri campi necessari e assegnali a this.proprietà ...
			// this.mapServiceParams = layer.layer_params.mapServiceParams;
			// this.zoomLevel = layer.layer_params.zoomLevel;
			// this.viewStyle = layer.layer_params.viewStyle;
		} else {
			// Logica per il costruttore options standard (se vuoi mantenerlo)
			const options = layerOrOptions as MapVisualOptions;
			this.serviceUrl = options.url;
			this.layerName = options.layerName;
			this.layerType = options.layerType;
			this.zoomLevel = options.zoomLevel;
			this.mapServiceParams = options.serviceParams;
			this.viewStyle = options.viewStyle;
		}
		this.standardType = this.mapToStandardType(
			this.layerType ?? 'undefined',
		);
	}

	getUrl(): string {
		// const params: string[] = [];
		// if (this.layerName) params.push(`layers=${encodeURIComponent(this.layerName)}`);
		// if (this.zoomLevel !== undefined) params.push(`zoom=${this.zoomLevel}`);
		// return params.length > 0 ? `${this.serviceUrl}?${params.join("&")}` : this.serviceUrl;
		return '';
	}

	private mapToStandardType(rawType: string): StandardLayerType {
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
}

export class ImageVisual extends Visual {
	readonly format = 'IMAGE';
	readonly contentType: string;
	serviceUrl: string;
	altText?: string;
	attribution?: string;

	constructor(imageUrl: string, altText?: string, attribution?: string) {
		super();
		this.serviceUrl = imageUrl;
		this.altText = altText;
		this.attribution = attribution;
		this.contentType = this.detectContentType(imageUrl);
	}

	getUrl(): string {
		return this.serviceUrl;
	}

	private detectContentType(url: string): string {
		const ext = url.split('.').pop()?.toLowerCase();
		switch (ext) {
			case 'jpg':
			case 'jpeg':
				return 'image/jpeg';
			case 'png':
				return 'image/png';
			case 'svg':
				return 'image/svg+xml';
			case 'webp':
				return 'image/webp';
			default:
				return 'application/octet-stream';
		}
	}
	render(): string {
		const alt = this.altText ? `alt="${this.altText}"` : `alt=""`;
		const title = this.attribution ? `title="${this.attribution}"` : '';
		return `<img src="${this.serviceUrl}" ${alt} ${title} style="max-width:100%; height:auto;" />`;
	}
}

type VisualInput = {
	format: string;
	url: string;
	altText?: string;
	attribution?: string;
	layerName?: string;
	zoomLevel?: number;
};

export function createVisualFromJson(data: VisualInput): Visual {
	switch (data.format.toUpperCase()) {
		case 'IMAGE':
			return new ImageVisual(data.url, data.altText, data.attribution);
		case 'MAP':
			return new MapVisual({
				url: data.url,
				layerName: data.layerName,
				zoomLevel: data.zoomLevel,
			} as MapVisualOptions);
		default:
			throw new Error(`Unsupported visual format: ${data.format}`);
	}
}
