import { defineStore } from 'pinia'
import type { Geostory } from '@/models/geostory'
import type { Scenario, Theme } from '@/models/scenario'
import { MapVisual } from '@/models/visual'

 
const geonodeISMAR = 'https://geoplatform.tools4msp.eu/geoserver/ows?'
const owsParams = 'service=WFS'+
	'&version=2.0.0'+
	'&request=GetFeature&' +
	'&outputFormat=application/json'

const wmsParams = 'service=WMS' +
	'&request=GetMap'+
	'&version=1.3.0' + 
	'&styles=&format=image/png&transparent=true'+
	'&width=256&height=256'



export const useGeostoryStore = defineStore('geostory', ()=>{
	const stories = ref<Array<Geostory>>([])
	const selectedStory = ref<Geostory | null>(null)	
	const scenario = ref<Scenario| (null)>(null)
	const themes = ref<Array<Theme>>([])
	const mapVisuals = ref<MapVisual[]>([
	// new MapVisual({
	// 	url:'https://ows.emodnet-bathymetry.eu/wms?format=image/png&layers=emodnet:mean_2022&styles&request=GetMap&WIDTH=256&HEIGHT=256&BBOX=-70.5000000000000000,11.0000000000000000,43.0000000000000853,90.0000000000000000&transparent=true&SERVICE=WMS&VERSION=1.3.0',
	// 	layerName: 'emodnet:mean_2022',
	// 	layerType: 'raster',
	// 	zoomLevel: 8
	// }),
	// url:'https://ows.emodnet-bathymetry.eu/wms?request=GetMap&styles&format=image/png&layers=emodnet:mean_multicolour&WIDTH=500&HEIGHT=500&BBOX=-70.5000000000000000,11.0000000000000000,43.0000000000000853,90.0000000000000000&transparent=true&SERVICE=WMS&VERSION=1.3.0'
	new MapVisual({
		url: 'https://ows.emodnet-bathymetry.eu/wms?',
		serviceParams: wmsParams,
		layerName: 'emodnet:mean_atlas_land',
		layerType: 'raster',
		zoomLevel: 8}),
	new MapVisual({
		url: 'https://ows.emodnet-bathymetry.eu/wms?',
		serviceParams: wmsParams,
		layerName: 'coastlines',
		layerType: 'raster',
		zoomLevel: 8}),
	new MapVisual({
		url: 'https://ows.emodnet-bathymetry.eu/wms?',
		serviceParams: wmsParams,
		layerName: 'emodnet:contours',
		layerType: 'raster',
		zoomLevel: 8}),
	
	new MapVisual({
		url: 'https://geoplatform.tools4msp.eu/geoserver/ows?',
		serviceParams: owsParams,
		layerName: 'geonode:Aquaculture',
		layerType: 'geojson',
		viewStyle: {
			'fill-color': '#e2acf4',
			'fill-opacity': 0.68,
			'fill-outline-color': '#103020'
		},
		zoomLevel: 22}), 
	new MapVisual({
		url: geonodeISMAR,
		serviceParams: owsParams,
		layerName: 'geonode:Dominio_SoS',
		layerType: 'geojson',
		viewStyle: {
				'fill-color': '#1d530b',
				'fill-opacity': 0.68,
				'fill-outline-color': '#b0d2a2'}
		}),
	])

	function setStories(sts: Array<any>) {
		stories.value = sts
	}

	function setScenario(s: Scenario) {
		scenario.value = s		
	}
	function setThemes(t: Array<Theme>) {
		themes.value = t	
	}
	
	function selectStory(story: Geostory) {
		selectedStory.value = story
	}
	


	return { 
		stories, 
		selectedStory, 
		scenario,
		themes,
		mapVisuals,
		setStories, 
		selectStory,
		setScenario, 
		setThemes}
})