<script setup lang="ts">
import mapViewer from '@/components/mapViewer.vue';
import { MapVisual } from '~/models/visual';
import { ref } from 'vue';
    
const proxyUrl = '/api/geoserver-proxy?wfs='
const vs = ref<MapVisual[]>([
	new MapVisual({
		url:'https://ows.emodnet-bathymetry.eu/wms?service=WMS&request=GetMap&layers=emodnet:mean_multicolour&styles=&format=image/png&transparent=true&version=1.3.0&width=256&height=256&crs=EPSG:3857&bbox={bbox-epsg-3857}',
		layerName: 'emodnet:mean_multicolour',
		layerType: 'raster',
		zoomLevel: 8}),
	//new MapVisual({
	// 	url:'https://ows.emodnet-bathymetry.eu/wms?service=WMS&request=GetMap&layers=emodnet:contours&styles=&format=image/png&transparent=true&version=1.3.0&width=256&height=256&crs=EPSG:3857&bbox={bbox-epsg-3857}',
	// 	layerName: 'emodnet:contours',
	// 	layerType: 'raster',
	// 	zoomLevel: 8}),
	// new MapVisual({
	// 	url: `${proxyUrl}${encodeURIComponent('https://geoplatform.tools4msp.eu/geoserver/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=geonode:Aquaculture&outputFormat=application/json')}`,
	// 	layerName: 'geonode:Aquaculture',
	// 	layerType: 'geojson',
	// 	zoomLevel: 22})
	])




</script>
<template>
    <mapViewer :visuals="vs" class="tw:border-1 tw:border-black tw:min-h-300 tw:h-400"></mapViewer>
  
</template> 
<!-- 
<template>
	<mapViewer :visuals="vs" class="tw:h-full tw:w-full "/>  
</template>  -->