import type { GeonodeLayer, LayerParams } from "./geonode";

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
	serviceParams?: string
	viewStyle?: Record<string, any>
}
export type StandardLayerType = 'raster' | 'vector' | 'geojson' | 'unknown';

export class MapVisual extends Visual {
	readonly format = "MAP";
	readonly contentType = "application/xml";
	serviceUrl: string;
	standardType: StandardLayerType;
	layerParams: LayerParams | null;
	owsFormat: string|null;

	layerName?: string;
	layerType?: string;
	viewStyle ?: Record<string, any>
	zoomLevel?: number;
	mapServiceParams?: string
	
	constructor(layerOrOptions: GeonodeLayer | MapVisualOptions) {
		super();

		// Controlla se l'input è un GeonodeLayer
		if ('pk' in layerOrOptions && 'layer_params' in layerOrOptions) {
			// Logica per estrarre i dati dal GeonodeLayer
			const layer = layerOrOptions as GeonodeLayer;
			this.serviceUrl = layer.owsUrl || layer.layer_params.url || '';
			console.log(`${layer.name} -> ${this.serviceUrl}`)
			this.layerName = layer.name;
			this.layerType = layer.layer_params.type ?? "undefined";
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
			this.viewStyle = options.viewStyle
		}
		this.standardType = this.mapToStandardType(this.layerType ?? "undefined");
	}

	getUrl(): string {
		// const params: string[] = [];
		// if (this.layerName) params.push(`layers=${encodeURIComponent(this.layerName)}`);
		// if (this.zoomLevel !== undefined) params.push(`zoom=${this.zoomLevel}`);
		// return params.length > 0 ? `${this.serviceUrl}?${params.join("&")}` : this.serviceUrl;
		return ""
	}
	
	
	
	getMapLibreURI(proxy?: string|null): string {
		// const url = new URL(this.serviceUrl)
		// if(this.standardType === "raster") {
		// 	url.searchParams.set('SERVICE', 'WMS');
        //     url.searchParams.set('VERSION', '1.3.0');
        //     url.searchParams.set('REQUEST', 'GetMap');
        //     url.searchParams.set('LAYERS', this.layerName);
        //     //url.searchParams.set('STYLES', this.layer_params.Style || '');
        //     url.searchParams.set('FORMAT', this.owsFormat || 'image/png');
        //     url.searchParams.set('TRANSPARENT', 'true');
        //     url.searchParams.set('CRS', 'EPSG:3857'); // MapLibre usa di default 3857 per i tilesets
        //     url.searchParams.set('WIDTH', '256');
        //     url.searchParams.set('HEIGHT', '256');
        //     url.searchParams.set('BBOX', '{bbox-epsg-3857}'); // Placeholder per MapLibre
        //     return url.toString();
		// } else if (this.standardType === 'vector'){
		// 	// Per i vettori, usiamo il metodo WFS esistente
		// 	url.searchParams.set('SERVICE', 'WFS');
        //     url.searchParams.set('VERSION', '1.0.0');
        //     url.searchParams.set('REQUEST', 'GetFeature');
        //     url.searchParams.set('TYPENAME', this.layerName);
		// } else if (this.standardType === 'geojson') {
		// 	url.searchParams.set('SERVICE', 'WFS');
        //     url.searchParams.set('VERSION', '1.0.0');
        //     url.searchParams.set('REQUEST', 'GetFeature');
        //     url.searchParams.set('TYPENAME', this.layerName);
		// 	url.searchParams.set('OUTPUTFORMAT', 'application/json')
		// } else {
		// 	console.warn(`Impossibile generare URI per tipo sconosciuto: ${this.standardType}`);
		// 	throw new Error(`Unsupported standard type: ${this.standardType}`);
		// }
		const url = new URL('https://geoplatform.tools4msp.eu/geoserver/ows?' 
			+'request=GetMap&styles'
			+ '&SERVICE=WMS'
			+ '&VERSION=1.3.0'
			+'&format=image/png'
			+'&layers=geonode:CaseStudySoS' 
			+'&WIDTH=256&HEIGHT=256&transparent=true'
			//+'&CRS=EPSG:3857'
			//+'&BBOX={bbox-epsg-3857}'
			+ '&BBOX=33.184100226407416,8.874491926432095,38.72390734265734,16.43304597701151'
			+ '&SRS=EPSG:4326'
		)
		if (proxy) {
            // Codifica l'URL finale generato sopra e passalo al proxy come parametro 'wfs' (o 'wms')
            proxy.searchParams.set('wfs', encodeURIComponent(url));
			console.log("generated url for proxy: " + proxy.toString())
			return proxy.toString()
        }
		const out = url.toString()
		console.log("generated url for server: " + out)
		return out
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
	readonly format = "IMAGE";
	readonly contentType: string;
	imageUrl: string;
	altText?: string;
	attribution?: string;

	constructor(imageUrl: string, altText?: string, attribution?: string) {
		super();
		this.imageUrl = imageUrl;
		this.altText = altText;
		this.attribution = attribution;
		this.contentType = this.detectContentType(imageUrl);
	}

	getUrl(): string {
		return this.imageUrl;
	}

	private detectContentType(url: string): string {
		const ext = url.split(".").pop()?.toLowerCase();
		switch (ext) {
			case "jpg":
			case "jpeg":
				return "image/jpeg";
			case "png":
				return "image/png";
			case "svg":
				return "image/svg+xml";
			case "webp":
				return "image/webp";
			default:
				return "application/octet-stream";
		}
	}
	render(): string {
		const alt = this.altText ? `alt="${this.altText}"` : `alt=""`;
		const title = this.attribution ? `title="${this.attribution}"` : "";
		return `<img src="${this.imageUrl}" ${alt} ${title} style="max-width:100%; height:auto;" />`;
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
		case "IMAGE":
			return new ImageVisual(data.url, data.altText, data.attribution);
		case "MAP":
			return new MapVisual({
				url: data.url,
				layerName: data.layerName,
				zoomLevel: data.zoomLevel
			} as MapVisualOptions);
		default:
			throw new Error(`Unsupported visual format: ${data.format}`);
	}
}
