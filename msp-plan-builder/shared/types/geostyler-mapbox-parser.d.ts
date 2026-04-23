declare module 'geostyler-mapbox-parser' {
	export class MapboxStyleParser {
		constructor();
		writeStyle(style: unknown): Promise<{ output?: { layers?: unknown[] } }>;
		getFilterFromMapboxFilter?: (filter: unknown) => unknown;
	}
}
