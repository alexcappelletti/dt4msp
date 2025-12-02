import * as gn from '../../shared/types/gn-layer'

export const mockAquacultureLayer: gn.Layer = {
  pk: "9999",
  uuid: "a1b2c3d4-e5f6-7890-abcd-ef0123456789",
  name: "aquaculture", // Specificato nella richiesta
  workspace: "geonode", // Specificato nella richiesta
  store: "geoportal_data",
  storeType: "dataStore",
  charset: "UTF-8",
  is_mosaic: false,
  has_time: false,
  has_elevation: false,
  time_regex: null,
  elevation_regex: null,
  use_featureinfo_custom_template: false,
  featureinfo_custom_template: "<p>Dati sull'acquacoltura</p>",
  
  // Oggetti annidati con valori minimi validi
  default_style: {
    pk: 1,
    name: "generic_style",
    workspace: "geonode",
    sld_title: "Generic Style Title",
    sld_url: "http://example.com/geoserver/rest/styles/generic_style.sld"
  },
  styles: [], // Array vuoto per default
  attribute_set: [], // Array vuoto per default
  
  ptype: "gxp_wmscsource",
  ows_url: "https://geoplatform.tools4msp.eu/geoserver/ows",
  upload_session: 123,
  resource_type: "layer",
  polymorphic_ctype_id: "68",
  
  // Oggetti Utente (User) minimi
  owner: { pk: 1, username: "mockuser", first_name: "Mock", last_name: "User", perms: [], is_superuser: false, is_staff: false, link: "" },
  poc: { pk: 1, username: "mockuser", first_name: "Mock", last_name: "User", perms: [], is_superuser: false, is_staff: false, link: "" },
  metadata_author: { pk: 1, username: "mockuser", first_name: "Mock", last_name: "User", perms: [], is_superuser: false, is_staff: false, link: "" },

  title: "Aquaculture Data Layer",
  abstract: "<p>Dati relativi all'acquacoltura nel Mar Mediterraneo.</p>",
  attribution: "Example Organization",
  doi: null,
  alternate: "geonode:aquaculture",
  date: "2024-01-01T00:00:00Z",
  date_type: "publication",
  temporal_extent_start: null,
  temporal_extent_end: null,
  edition: null,
  purpose: "<p>Scopo del layer.</p>",
  maintenance_frequency: null,
  constraints_other: "",
  language: "eng",
  supplemental_information: "",
  data_quality_statement: "",
  
  // Bounding Box di esempio (un punto)
  bbox_polygon: { type: "Polygon", coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]] },
  ll_bbox_polygon: { type: "Polygon", coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]] },
  
  srid: "EPSG:4326",
  group: null,
  popular_count: "100",
  share_count: "0",
  rating: "0",
  featured: false,
  is_published: true,
  is_approved: true,
  detail_url: "http://example.com/details/aquaculture",
  created: "2024-01-01T00:00:00Z",
  last_updated: "2024-01-01T00:00:00Z",
  raw_abstract: "Raw abstract",
  raw_purpose: "Raw purpose",
  raw_constraints_other: "",
  raw_supplemental_information: "",
  raw_data_quality_statement: "",
  metadata_only: false,
  processed: true,
  embed_url: "http://example.com/embed/aquaculture",
  thumbnail_url: "http://example.com/thumbs/aquaculture.png",
  
  keywords: [],
  tkeywords: [],
  regions: [],
  category: { identifier: "biota" },
  restriction_code_type: { identifier: "copyright" },
  license: { identifier: "not_specified" },
  spatial_representation_type: null,
  link: "http://example.com/api/v2/layers/9999",
  perms: ["view_resourcebase"],
  favorite: false,
  links: [],
};

// Importa i tipi necessari. Assicurati che i percorsi siano corretti nel tuo progetto (es. ~/shared/types/gn-layers)
// import type { Layer, Style, AttributeSetItem, User, BoundingBoxPolygon, Keyword, TaxonomicalKeyword, Region, ResourceLink } from '~/shared/types/gn-layers';

export const mockScenariMspLayer: gn.Layer = {
    "pk": "1302",
    "uuid": "ea6e1ec7-646b-4448-b60c-1049a6857626",
    "name": "scenari_MSP4Biodiversity",
    "workspace": "geonode",
    "store": "geoportal_data",
    "storeType": "dataStore",
    "charset": "UTF-8",
    "is_mosaic": false,
    "has_time": false,
    "has_elevation": false,
    "time_regex": null,
    "elevation_regex": null,
    "use_featureinfo_custom_template": false,
    "featureinfo_custom_template": "<h1>Titolo</h1>\r\n<p>Info&nbsp;</p>\r\n<table style=\"border-collapse: collapse; width: 100.028%; height: 67.1874px;\" border=\"1\">\r\n<tbody>\r\n<tr style=\"height: 22.3958px;\">\r\n<td style=\"width: 47.9686%; height: 22.3958px;\">Scenario</td>\r\n<td style=\"width: 47.9686%; height: 22.3958px;\">${properties.Scenario}</td>\r\n</tr>\r\n<tr style=\"height: 22.3958px;\">\r\n<td style=\"width: 47.9686%; height: 22.3958px;\">&nbsp;</td>\r\n<td style=\"width: 47.9686%; height: 22.3958px;\">&nbsp;</td>\r\n</tr>\r\n<tr style=\"height: 22.3958px;\">\r\n<td style=\"width: 47.9686%; height: 22.3958px;\">&nbsp;</td>\r\n<td style=\"width: 47.9686%; height: 22.3958px;\">&nbsp;</td>\r\n</tr>\r\n</tbody>\r\n</table>",
    "default_style": {
        "pk": 1668,
        "name": "scenari_MSP4Biodiversity",
        "workspace": "geonode",
        "sld_title": "scenari_MSP4Biodiversity",
        "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_MSP4Biodiversity.sld"
    },
    "styles": [
        {
            "pk": 1668,
            "name": "scenari_MSP4Biodiversity",
            "workspace": "geonode",
            "sld_title": "scenari_MSP4Biodiversity",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_MSP4Biodiversity.sld"
        },
        {
            "pk": 1671,
            "name": "scenari_pesca",
            "workspace": "geonode",
            "sld_title": "scenari_pesca",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_pesca.sld"
        },
        {
            "pk": 1672,
            "name": "scenari_energia",
            "workspace": "geonode",
            "sld_title": "scenari_energia",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_energia.sld"
        },
        {
            "pk": 1673,
            "name": "scenari_sabbie",
            "workspace": "geonode",
            "sld_title": "scenari_sabbie",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_sabbie.sld"
        },
        {
            "pk": 1674,
            "name": "scenari_trasporto",
            "workspace": "geonode",
            "sld_title": "scenari_trasporto",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_trasporto.sld"
        },
        {
            "pk": 1675,
            "name": "scenari_turismo",
            "workspace": "geonode",
            "sld_title": "scenari_turismo",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_turismo.sld"
        },
        {
            "pk": 1676,
            "name": "scenari_ricerca",
            "workspace": "geonode",
            "sld_title": "scenari_ricerca",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_ricerca.sld"
        },
        {
            "pk": 1677,
            "name": "scenari_acquacoltura",
            "workspace": "geonode",
            "sld_title": "scenari_acquacoltura",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_acquacoltura.sld"
        },
        {
            "pk": 1678,
            "name": "scenari_protezione",
            "workspace": "geonode",
            "sld_title": "scenari_protezione",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_protezione.sld"
        },
        {
            "pk": 1680,
            "name": "scenari_difesa_costiera",
            "workspace": "geonode",
            "sld_title": "scenari_difesa_costiera",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_difesa_costiera.sld"
        },
        {
            "pk": 1688,
            "name": "scenari_paesaggio",
            "workspace": "geonode",
            "sld_title": "scenari_paesaggio",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_paesaggio.sld"
        },
        {
            "pk": 1689,
            "name": "scenari_protezione_tipi",
            "workspace": "geonode",
            "sld_title": "scenari_protezione_tipi",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_protezione_tipi.sld"
        },
        {
            "pk": 1690,
            "name": "scenari_pesca_tipi",
            "workspace": "geonode",
            "sld_title": "scenari_pesca_tipi",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_pesca_tipi.sld"
        },
        {
            "pk": 2273,
            "name": "scenari_effetti_pesca",
            "workspace": "geonode",
            "sld_title": "scenari_effetti_pesca",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_effetti_pesca.sld"
        },
        {
            "pk": 2274,
            "name": "scenari_effetti_trasporto",
            "workspace": "geonode",
            "sld_title": "scenari_effetti_trasporto",
            "sld_url": "https://geoplatform.tools4msp.eu/geoserver/rest/workspaces/geonode/styles/scenari_effetti_trasporto.sld"
        }
    ],
    "attribute_set": [
        {
            "pk": 12643,
            "attribute": "OriginUN",
            "description": null,
            "attribute_label": null,
            "attribute_type": "xsd:string",
            "visible": false,
            "display_order": 12,
            "featureinfo_type": "type_property",
            "count": 1,
            "min": "NA",
            "max": "NA",
            "average": "NA",
            "median": "NA",
            "stddev": "NA",
            "sum": "NA",
            "unique_values": "NA",
            "last_stats_updated": "2024-07-07T07:46:22.806229Z"
        },
        {
            "pk": 12638,
            "attribute": "HilucLU",
            "description": null,
            "attribute_label": null,
            "attribute_type": "xsd:string",
            "visible": false,
            "display_order": 7,
            "featureinfo_type": "type_property",
            "count": 1,
            "min": "NA",
            "max": "NA",
            "average": "NA",
            "median": "NA",
            "stddev": "NA",
            "sum": "NA",
            "unique_values": "NA",
            "last_stats_updated": "2024-07-07T07:46:22.571439Z"
        }
    ],

    ptype: "gxp_wmscsource",
    ows_url: "https://geoplatform.tools4msp.eu/geoserver/ows",
    upload_session: 990,
    resource_type: "layer",
    polymorphic_ctype_id: "68",
    owner: {}, // Oggetto utente vuoto di default
    poc: {},
    metadata_author: {},
    title: "MSP4Biodiversity - Spatial Mesures of scenarios",
    abstract: "<p>A single file compiling the areas envisaged</p>",
    attribution: "CNR ISMAR",
    doi: null,
    alternate: "geonode:scenari_MSP4Biodiversity",
    date: "2024-07-07T07:45:00Z",
    date_type: "publication",
    temporal_extent_start: null,
    temporal_extent_end: null,
    edition: null,
    purpose: "<p>For MSP4Biodiversity project</p>",
    maintenance_frequency: null,
    constraints_other: "",
    language: "eng",
    supplemental_information: "",
    data_quality_statement: "",
    bbox_polygon: { type: "Polygon", coordinates: [] },
    ll_bbox_polygon: { type: "Polygon", coordinates: [] },
    srid: "EPSG:3857",
    group: null,
    popular_count: "766",
    share_count: "0",
    rating: "0",
    featured: false,
    is_published: true,
    is_approved: true,
    detail_url: "geoplatform.tools4msp.eu",
    created: "2024-07-07T07:45:53.725622Z",
    last_updated: "2025-08-14T16:36:29.634490Z",
    raw_abstract: "Raw abstract",
    raw_purpose: "Raw purpose",
    raw_constraints_other: "",
    raw_supplemental_information: "",
    raw_data_quality_statement: "",
    metadata_only: false,
    processed: true,
    embed_url: "geoplatform.tools4msp.eu",
    thumbnail_url: "geoplatform.tools4msp.eu",
    keywords: [],
    tkeywords: [],
    regions: [],
    category: { identifier: "spatial_policy" },
    restriction_code_type: { identifier: "copyright" },
    license: { identifier: "not_specified" },
    spatial_representation_type: null,
    link: "geoplatform.tools4msp.eu",
    perms: ["view_resourcebase"],
    favorite: false,
    links: [],
};
