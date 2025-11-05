export abstract class Visual {
	abstract readonly format: string;
	abstract readonly contentType: string;
	abstract getUrl(): string;
}

export class MapVisual extends Visual {
	readonly format = "MAP";
	readonly contentType = "application/xml";
	serviceUrl: string;
	layerName?: string;
	layerType?: string;
	viewStyle ?: Record<string, any>
	zoomLevel?: number;
	mapServiceParams?: string

	constructor(
		options: {
			url: string;
			layerName?: string;
			layerType?: string;
			zoomLevel?: number;
			serviceParams?: string
			viewStyle?: Record<string, any>
		}) {

		super();
		this.serviceUrl = options.url;
		this.layerName = options.layerName;
		this.layerType = options.layerType;
		this.zoomLevel = options.zoomLevel;
		this.mapServiceParams = options.serviceParams;
		this.viewStyle = options.viewStyle
	}

	getUrl(): string {
		// const params: string[] = [];
		// if (this.layerName) params.push(`layers=${encodeURIComponent(this.layerName)}`);
		// if (this.zoomLevel !== undefined) params.push(`zoom=${this.zoomLevel}`);
		// return params.length > 0 ? `${this.serviceUrl}?${params.join("&")}` : this.serviceUrl;
		return ""
	}


	getMapLibreRasterUri(): string {
		const params: string[] = []
		if (this.mapServiceParams) { params.push(this.mapServiceParams) }
		if (this.layerName) { params.push(`&layers=${this.layerName}`) }
		params.push('&CRS=EPSG:3857&BBOX={bbox-epsg-3857}') //placeholder x layer raster in maplibre
		return `${this.serviceUrl}${params.join("")}`
	}
	getMapLibreJSONFeatureUri(): string{
		const params: string[] = []
		if (this.mapServiceParams) { params.push(this.mapServiceParams) }
		if (this.layerName) {params.push(`&typeName=${this.layerName}`)}
		return `${this.serviceUrl}${params.join('')}`
	}
	getWFSUri(): string {
		const params: string[] = []
		if (this.mapServiceParams) { params.push(this.mapServiceParams) }
		return `${this.serviceUrl}${params.join('')}`
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
			});
		default:
			throw new Error(`Unsupported visual format: ${data.format}`);
	}
}
