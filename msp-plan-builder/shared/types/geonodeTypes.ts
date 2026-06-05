
/**
 * Interfaccia per la Bounding Box (bbox_polygon e ll_bbox_polygon)
 */
export interface BoundingBoxPolygon {
	type: "Polygon";
	coordinates: number[][][];
}

/**
 * Interfaccia per gli oggetti Utente/Contatto.
 * I campi sono resi opzionali (?) per gestire il caso di oggetti vuoti {}.
 */
export interface User {
	pk?: number;
	username?: string;
	first_name?: string;
	last_name?: string;
	avatar?: string;
	perms?: string[];
	is_superuser?: boolean;
	is_staff?: boolean;
	link?: string;
}

/**
 * Interfaccia per i singoli oggetti Stile (Style)
 */
export interface SldStyle {
	pk: number;
	name: string;
	workspace: string;
	sld_title: string;
	sld_url: string;
}

/**
 * Interfaccia per un singolo elemento del set di attributi (AttributeSetItem)
 */
export interface AttributeSetItem {
	pk: number;
	attribute: string;
	description: string | null;
	attribute_label: string | null;
	attribute_type: string;
	visible: boolean;
	display_order: number;
	featureinfo_type: string;
	count: number;
	min: string | number;
	max: string | number;
	average: string | number;
	median: string | number;
	stddev: string | number;
	sum: string | number;
	unique_values: string | number;
	last_stats_updated: string;
}

/**
 * Interfaccia per le Keywords semplici
 */
export interface Keyword {
	name: string;
	slug: string;
}

/**
 * Interfaccia per le Keywords Tassonomiche (tkeywords)
 * I campi sono resi opzionali (?) per gestire il caso di oggetti vuoti {}.
 */
export interface TaxonomicalKeyword {
	name?: string;
	slug?: string;
	uri?: string;
	thesaurus?: {
		name: string;
		slug: string;
		uri: string | null;
	};
	i18n?: {
		IT: string;
	};
}

/**
 * Interfaccia per le Regioni (Regions)
 */
export interface Region {
	code: string;
	name: string;
}

/**
 * Interfaccia per i Link aggiuntivi (Links)
 */
export interface ResourceLink {
	extension: string;
	link_type: string;
	name: string;
	mime: string;
	url: string;
	extras?: {
		type?: string;
		content?: {
			title?: string | null;
			description?: string | null;
			type?: string | null;
			download_url?: string;
		};
	};
}

export interface DatasetDownloadUrl {
	url: string;
	ajax_safe: boolean;
	default: boolean;
}

export interface DatasetExtent {
	coords: number[];
	srid: string;
}

export interface DatasetCategory {
	identifier: string;
	gn_description?: string;
}

export interface DatasetLicenseRef {
	identifier: string;
}

/**
 * Interfaccia per un dataset restituito da GeoNode.
 * Il payload segue il contratto Dataset di GeoNode, ma alcuni campi annidati
 * nel runtime reale arrivano come oggetti/array piu ricchi rispetto allo
 * schema OpenAPI, che spesso li descrive in modo piu generico.
 * L'endpoint che restituisce i dataset associati a una mappa puo rispondere
 * sia con un array puro di Dataset sia con un wrapper paginato che include
 * metadati come count, next, previous e results.
 */
export interface Dataset {
	pk: string;
	uuid: string;
	name: string;
	title: string;
	abstract: string;
	raw_abstract: string;
	workspace: string;
	store: string;
	charset: string;
	subtype?: string;
	srid?: string;
	ptype?: string;
	resource_type?: string;
	link: string;
	detail_url: string;
	download_url: string;
	dataset_ows_url: string;
	capabilities_url: string;
	ows_url?: string;
	storeType?: string;
	upload_session?: number;
	use_featureinfo_custom_template?: boolean;
	featureinfo_custom_template?: string;
	thumbnail_url: string;
	embed_url?: string;
	created: string;
	last_updated: string;
	date?: string;
	date_type?: string;
	language?: string;
	popular_count: string;
	share_count: string;
	rating: string;
	featured?: boolean;
	favorite: boolean;
	advertised?: boolean;
	is_published?: boolean;
	is_approved?: boolean;
	processed: boolean;
	metadata_only?: boolean;
	has_time: boolean;
	has_elevation?: boolean;
	is_mosaic?: boolean;
	is_copyable: boolean;
	alternate: string;
	sourcetype: string;
	state: string;
	polymorphic_ctype_id: string;
	download_urls: DatasetDownloadUrl[];
	perms: string[];
	owner: User;
	poc?: User[];
	metadata_author?: User[];
	keywords?: Keyword[];
	tkeywords?: TaxonomicalKeyword[];
	regions: Region[] | null;
	links: ResourceLink[];
	styles: SldStyle[];
	default_style: SldStyle | null;
	attribute_set: AttributeSetItem[] | null;
	category?: DatasetCategory | null;
	license?: DatasetLicenseRef | null;
	restriction_code_type?: DatasetLicenseRef | null;
	spatial_representation_type?: { identifier: string } | string | null;
	extent?: DatasetExtent | null;
	bbox_polygon: BoundingBoxPolygon;
	ll_bbox_polygon: BoundingBoxPolygon;
	group?: { pk?: number; name?: string } | string | null;
	constraints_other?: string | null;
	supplemental_information?: string | null;
	data_quality_statement?: string | null;
	purpose?: string | null;
	raw_purpose: string | null;
	raw_constraints_other: string | null;
	raw_supplemental_information: string | null;
	raw_data_quality_statement: string | null;
}

/**
 * Interfaccia leggera per layer e dataset.
 * Utilizzata sia da layers.get che da map-datasets.get.
 */
export interface DatasetListItem {
	pk: string;
	title: string;
	thumbnail_url: string;
	abstract: string;
	owner_username: string;
	created: string;
	popular_count: string;
}

/**
 * Interfaccia essenziale per i dataset associati a una mappa.
 */
export interface MapDatasetItem {
	pk: string;
	datasetName: string;
	progressiveNumber: number;
}

/**
 * Interfaccia leggera per una risorsa GeoNode generica.
 */
export interface GeonodeResourceListItem {
	pk: string;
	uuid?: string;
	resource_type: string;
	title: string;
	abstract: string;
	owner_username: string;
	created: string;
	last_updated?: string;
	detail_url: string;
	thumbnail_url: string;
	popular_count: string;
	share_count: string;
	rating: string;
}

export interface GeonodeResourcesResponse {
	links?: { next: string | null; previous: string | null };
	total?: number;
	page?: number;
	page_size?: number;
	resources?: Array<Record<string, unknown>>;
	objects?: Array<Record<string, unknown>>;
	results?: Array<Record<string, unknown>>;
}

export interface GeoNodeDatasetsResponse {
	count?: number;
	next?: string | null;
	previous?: string | null;
	links?: { next: string | null; previous: string | null };
	total?: number;
	page?: number;
	page_size?: number;
	datasets?: Dataset[];
	layers?: Dataset[];
	layer_set?: Dataset[];
	objects?: Dataset[];
	results?: Dataset[];
}

/**
 * Interfaccia per l'oggetto Layer principale
 */
/**
 * Interfaccia leggera per la lista mappe (catalogo GeoNode maps).
 */
export interface GeonodeMapListItem {
	pk: string;
	uuid?: string;
	title: string;
	abstract: string;
	attribution?: string | null;
	owner?: User;
	owner_username: string;
	poc?: User;
	metadata_author?: User;
	created: string;
	last_updated?: string;
	date?: string;
	date_type?: string;
	temporal_extent_start?: string | null;
	temporal_extent_end?: string | null;
	group?: string | null;
	language?: string;
	popular_count: string;
	share_count: string;
	rating: string;
	featuredurl?: string;
	featured?: boolean;
	is_published?: boolean;
	is_approved?: boolean;
	detail_url: string;
	thumbnail_url: string;
	embed_url?: string;
	resource_type?: 'map';
	urlsuffix?: string;
	projection?: string;
	zoom?: number;
	center_x?: number;
	center_y?: number;
}

export interface GeonodeMapListResponse {
	links: { next: string | null; previous: string | null };
	total: number;
	page: number;
	page_size: number;
	maps: GeonodeMapListItem[];
}

/**
 * Interfaccia per la risposta JSON completa che contiene l'oggetto Layer
 */
export interface LayerDetailsResponse {
	layer: Dataset;
}

/**
 * Interfaccia per l'oggetto Map principale di GeoNode (/api/v2/maps)
 */
export interface GeonodeMap {
	pk: string;
	uuid: string;
	zoom: number;
	projection: string;
	center_x: number;
	center_y: number;
	urlsuffix: string;
	featuredurl: string;
	resource_type: "map";
	polymorphic_ctype_id: string;
	owner: User;
	poc: User;
	metadata_author: User;
	title: string;
	abstract: string;
	attribution: string | null;
	doi: string | null;
	alternate: string | null;
	date: string;
	date_type: string;
	temporal_extent_start: string | null;
	temporal_extent_end: string | null;
	edition: string | null;
	purpose: string | null;
	maintenance_frequency: string | null;
	constraints_other: string | null;
	language: string;
	supplemental_information: string;
	data_quality_statement: string | null;
	bbox_polygon: BoundingBoxPolygon;
	ll_bbox_polygon: BoundingBoxPolygon;
	srid: string;
	group: string | null;
	popular_count: string;
	share_count: string;
	rating: string;
	featured: boolean;
	is_published: boolean;
	is_approved: boolean;
	detail_url: string;
	created: string;
	last_updated: string;
	raw_abstract: string;
	raw_purpose: string | null;
	raw_constraints_other: string | null;
	raw_supplemental_information: string;
	raw_data_quality_statement: string | null;
	metadata_only: boolean;
	processed: boolean;
	embed_url: string;
	thumbnail_url: string;
	keywords: Keyword[];
	tkeywords: TaxonomicalKeyword[];
	regions: Region[];
	category: { identifier: string } | null;
	restriction_code_type: { identifier: string } | null;
	license: { identifier: string } | null;
	spatial_representation_type: string | null;
	link: string;
	perms: string[];
	links: ResourceLink[];
}

/**
 * Interfaccia per la response paginata di GeoNode Maps
 */
export interface GeonodeMapsResponse {
	links: { next: string | null; previous: string | null };
	total: number;
	page: number;
	page_size: number;
	maps: GeonodeMap[];
}
