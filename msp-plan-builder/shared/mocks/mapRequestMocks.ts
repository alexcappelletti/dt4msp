import type { MapRequest } from "#/shared/types/mapRequest";

export const mapRequestsMock: MapRequest[] = [
	{
		serviceUrl: "https://ows.emodnet-bathymetry.eu/wms",
		layerName: "emodnet:mean_multicolour",
		standardType: "raster",
		serviceLabel: "WMS",
		zoomLevel: 0,
		opacity: 1,
		visible: true,
		layerParams: null,
		owsFormat: null,
	},
	{
		serviceUrl: "https://ahocevar.com/geoserver/wms",
		layerName: "topp:states",
		standardType: "raster",
		serviceLabel: "WMS",
		zoomLevel: 0,
		opacity: 0.75,
		visible: true,
		layerParams: null,
		owsFormat: null,
	},
	{
		serviceUrl:
			"https://ahocevar.com/geoserver/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&TYPENAME=topp:states&OUTPUTFORMAT=application/json&SRSNAME=EPSG:4326",
		layerName: "topp:states",
		standardType: "geojson",
		serviceLabel: "WFS",
		zoomLevel: 0,
		opacity: 0.7,
		visible: false,
		layerParams: null,
		owsFormat: "application/json",
	},
	{
		serviceUrl:
			"https://demo.mapserver.org/cgi-bin/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=continents&OUTPUTFORMAT=application/json",
		layerName: "continents",
		standardType: "geojson",
		serviceLabel: "WFS",
		zoomLevel: 0,
		opacity: 1,
		visible: true,
		layerParams: null,
		owsFormat: "application/json",
	},
];

export const defaultMapRequest: MapRequest[] = [...mapRequestsMock];
