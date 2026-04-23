
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
}

/**
 * Interfaccia per l'oggetto Layer principale
 */
export interface Layer {
	pk: string;
	uuid: string;
	name: string;
	workspace: string;
	store: string;
	storeType: string;
	charset: string;
	is_mosaic: boolean;
	has_time: boolean;
	has_elevation: boolean;
	time_regex: string | null;
	elevation_regex: string | null;
	use_featureinfo_custom_template: boolean;
	featureinfo_custom_template: string;
	default_style: SldStyle;
	styles: SldStyle[];
	attribute_set: AttributeSetItem[];
	ptype: string;
	ows_url: string;
	upload_session: number;
	resource_type: string;
	polymorphic_ctype_id: string;
	owner: User;
	poc: User;
	metadata_author: User;
	title: string;
	abstract: string;
	attribution: string;
	doi: string | null;
	alternate: string;
	date: string;
	date_type: string;
	temporal_extent_start: string | null;
	temporal_extent_end: string | null;
	edition: string | null;
	purpose: string;
	maintenance_frequency: string | null;
	constraints_other: string;
	language: string;
	supplemental_information: string;
	data_quality_statement: string;
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
	raw_purpose: string;
	raw_constraints_other: string;
	raw_supplemental_information: string;
	raw_data_quality_statement: string;
	metadata_only: boolean;
	processed: boolean;
	embed_url: string;
	thumbnail_url: string;
	keywords: Keyword[];
	tkeywords: TaxonomicalKeyword[];
	regions: Region[];
	category: { identifier: string };
	restriction_code_type: { identifier: string };
	license: { identifier: string };
	spatial_representation_type: string | null;
	link: string;
	perms: string[];
	favorite: boolean;
	links: ResourceLink[];
}

/**
 * Interfaccia leggera per la lista layer (catalogo).
 */
export interface LayerListItem {
	pk: string;
	title: string;
	thumbnail_url: string;
	abstract: string;
	owner_username: string;
	created: string;
	popular_count: string;
}

/**
 * Interfaccia per la risposta JSON completa che contiene l'oggetto Layer
 */
export interface LayerDetailsResponse {
	layer: Layer;
}
