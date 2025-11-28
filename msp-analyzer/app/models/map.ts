export interface MapLayer {
	id: string,
	name:string,
	type: string,
	owsType: "ows"| "features" | "raster" | "geojson",
	owsUrl: "tinyurl/sample",
	description: string,
	layerName: string,
	legendUrl: string,
}