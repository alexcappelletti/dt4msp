import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Geostory } from '@/models/geostory'
import type { Scenario, Theme } from '@/models/scenario'
import { MapVisual, type MapVisualOptions } from '@/models/visual'


 



export const useGeostoryStore = defineStore('geostory', ()=>{
	const error = ref<string | null>(null)
	const stories = ref<Array<Geostory>>([])
	const selectedStory = ref<Geostory | null>(null)	
	const scenario = ref<Scenario| (null)>(null)
	const themes = ref<Array<Theme>>([])
	const mapVisuals = computed(() => [
		// new MapVisual({
		// 	url:'https://ows.emodnet-bathymetry.eu/wms',
		// 	layerName: 'emodnet:mean_2022',
		// 	layerType: 'raster',
		// 	zoomLevel: 8
		// }),
		// url:'https://ows.emodnet-bathymetry.eu/wms?request=GetMap&styles&format=image/png&layers=emodnet:mean_multicolour&WIDTH=500&HEIGHT=500&BBOX=-70.5000000000000000,11.0000000000000000,43.0000000000000853,90.0000000000000000&transparent=true&SERVICE=WMS&VERSION=1.3.0'
		new MapVisual({
			url: 'https://ows.emodnet-bathymetry.eu/wms',
			layerName: 'emodnet:mean_atlas_land',
			layerType: 'raster',
			standardType: 'raster'} as MapVisualOptions),
		// new MapVisual({
		// 	url: 'https://ows.emodnet-bathymetry.eu/wms',
		// 	layerName: 'coastlines',
		// 	layerType: 'raster',
		// 	standardType: 'raster'} as MapVisualOptions),
		// new MapVisual({
		// 	url:'https://geoplatform.tools4msp.eu/geoserver/ows',
		// 	layerName: 'geonode:Map_DI_Hake',
		// 	layerType: 'raster',
		// 	zoomLevel: 8
		// }),
		// new MapVisual({
		// 	url: 'https://ows.emodnet-bathymetry.eu/wms',
		// 	layerName: 'emodnet:contours',
		// 	layerType: 'raster',
		// 	standardType: 'raster'} as MapVisualOptions),
		// new MapVisual({
		// 	url:'https://geoplatform.tools4msp.eu/geoserver/ows',
		// 	layerName: 'geonode:CaseStudySoS',
		// 	layerType: 'raster',
		// 	zoomLevel: 8
		// }),
		// // new MapVisual({									///esempio di layer non funzionante
		// // 	url:'https://geoplatform.tools4msp.eu/geoserver/ows',
		// // 	layerName: 'geonode:SSF_GSA16_TOT',
		// // 	layerType: 'raster',
		// // 	zoomLevel: 8
		// // }),   
		// new MapVisual({
		// 	url:'https://geoplatform.tools4msp.eu/geoserver/ows',
		// 	layerName: 'geonode:FRA1000m_SoS',
		// 	layerType: 'raster',
		// 	zoomLevel: 8
		// }),
		

		new MapVisual({
			url: 'https://geoplatform.tools4msp.eu/geoserver/ows?',
			layerName: 'geonode:Dominio_SoS',
			layerType: 'geojson',
			viewStyle: {
					'fill-color': '#1d530b',
					'fill-opacity': 0.68,
					'fill-outline-color': '#b0d2a2'},
			standardType: 'geojson'} as MapVisualOptions),
		new MapVisual({
			url: 'https://geoplatform.tools4msp.eu/geoserver/ows',
			layerName: 'geonode:Aquaculture',
			layerType: 'geojson',
			viewStyle: {
				'fill-color': '#e2acf4',
				'fill-opacity': 0.68,
				'fill-outline-color': '#103020'
			},
			standardType: 'raster'} as MapVisualOptions)
		 ])

	const availableVisuals = ref<MapVisual[]>([])

	const visuals2 = computed(()=> availableVisuals.value)

	function setStories(sts: Array<any>) {
		stories.value = sts
	}

	async function getScenario(params:{scenarioID: string, from: string}) {
		try {
			const response:any = await $fetch<{scenario: Scenario}>('/api/scenario-provider', {
					method: 'POST',
					body: params,
				})
			scenario.value = response.scenario
		} catch (err) {
			console.error('Errore durante il caricamento dello scenario dal server:', err)
			error.value = `Errore durante il caricamento dello scenario dal server: ${err}`;
		}
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
	function setAvailableVisuals(vs: MapVisual[]){
		availableVisuals.value = vs
	}
	

	return { 
		error,
		stories, 
		selectedStory, 
		scenario,
		themes,
		mapVisuals,
		visuals2,
		setStories, 
		selectStory,
		setScenario, 
		getScenario, 
		setThemes, 
		setAvailableVisuals}
})