<template>
    <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as maplibregl from 'maplibre-gl';
import { isMapboxURL, transformMapboxUrl } from 'maplibregl-mapbox-request-transformer'
import 'maplibre-gl/dist/maplibre-gl.css';

const mapContainer = ref(null);
const lowerMapContainer = ref(null);

const MAPBOX_APITOKEN = 'pk.eyJ1IjoiYWxleGNhcHBlbGxldHQiLCJhIjoiY21jMDRsbGpzMTh2OTJpczY1bDN4eW1nbiJ9.NYOVoBKyx3j3K-swhpG9tw'
//const customStyle = `https://api.mapbox.com/styles/v1/alexcappellett/cm4sbuz7q00dv01r3ato87p8k/style.json?access_token=${MAPBOX_APITOKEN}`
//const customStyle = 'https://api.maptiler.com/maps/01977d24-5a0d-7174-aa53-eb1afac5a4b8/style.json?key=Mvvx2kpF9y1yah2p0HnG'    //`https://api.maptiler.com/maps/backdrop/style.json?key=Mvvx2kpF9y1yah2p0HnG`
const customStyle = 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer'

const ESRI_APIKEY = 'AAPTxy8BH1VEsoebNVZXo8HurE5LO4FUhatJdc1IZlmsXTPpy7jlZW-kfj4BQ63Wd-3n5Ii77I2A45sPb7QCyvNfLFYHCsFbSuz0VRqp7BipY5A1mFsOvFC9xoy93BNCAeAJyOrnezl3dLvfRVhuZ2Gbc-54q84J0mHA6JT63uUjsHQbFPVWWwMxsSh8thdt93j99Jw_VEeKx1VS9QH9-uK5ZR6eSnQxAGCf9Qi-sI7lq3E.AT1_UcENSzTI'
//const basemapEnum = "arcgis/streets";
const basemapEnum = "9d94a890b76a417cad8a748df4f97336"; // Custom vector tile style
const customStyleArcGIS = `https://basemapstyles-api.arcgis.com/arcgis/rest/services/styles/v2/styles/items/${basemapEnum}?token=${ESRI_APIKEY}`

const transformRequest = (url: string, resourceType: string) => {
  if (isMapboxURL(url)) {
    return transformMapboxUrl(url, resourceType, MAPBOX_APITOKEN)
  }
  
  // Do any other transforms you want
  return {url}
}

async function queryWFsResources({
    baseURL = 'http://localhost/geoserver/geonode/ows',
    workspace,
    layerName,
    srsName = 'EPSG:4326',
    cqlFilter = null}) {
   
    const params = new URLSearchParams({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: `geonode:buildings`, // `${workspace}:${layerName}`,
        outputFormat: 'application/json',
        //srsName: 'EPSG:4326'
    });
    try {
        const response = await fetch(`${baseURL}?${params.toString()}`)
        if (!response.ok) {
          throw new Error(`Errore WFS: ${response.statusText}`)
        }
        const geojson = await response.json()
        return geojson 
    } 
    catch (error) {
        console.error('❌ Errore nella chiamata WFS:', error)
        return null
    }
}


onMounted(async () => {
    console.log("Map component mounted");
    if (!mapContainer.value) {
        console.error("Map container is not defined");
        return;
    }

    const map = new maplibregl.Map({
        container: mapContainer.value, // container id
        //'https://api.maptiler.com/maps/streets/style.json?key=Mvvx2kpF9y1yah2p0HnG', // stylesheet location
        center: [11.113187, 46.063899], // starting position [lng, lat]
        zoom: 10, // starting zoom,
        style: customStyleArcGIS, // custom style URL
    });

    map.addControl(new maplibregl.NavigationControl())
    map.on("load", async() => {
        console.log("Map loaded successfully");
        const geoJSONRes = await queryWFsResources({workspace: "geonode", layerName:"buildings"})
        if (geoJSONRes === undefined || geoJSONRes === null) {
            console.error("No GeoJSON data found for buildings layer"); 
            return;
        }  
        map.addSource('wfs-source', {
            type: 'geojson',
            data: geoJSONRes
          })
        map.addLayer({
                   id: 'buildings-layer',
                    type: 'fill',
                    source: 'wfs-source',
                    paint: {
                        'fill-color': '#888888',
                        'fill-opacity': 0.5
                    }
                });
        console.log("Buildings layer added successfully");
    });

    // map.setStyle('https://demotiles.maplibre.org/style.json', {
    //     transformStyle: (previousStyle, nextStyle) => ({
    //         ...nextStyle,
    //         sources: {
    //             ...nextStyle.sources,
    //             // copy a source from previous style
    //             'osm': previousStyle.sources.osm
    //         },
    //         layers: [
    //             // background layer
    //             nextStyle.layers[0],
    //             // copy a layer from previous style
    //             previousStyle.layers[0],
    //             // other layers from the next style
    //             ...nextStyle.layers.slice(1).map(layer => {
    //                 // hide the layers we don't need from demotiles style
    //                 if (layer.id.startsWith('geolines')) {
    //                     layer.layout = {...layer.layout || {}, visibility: 'none'};
    //                 // filter out US polygons
    //                 } else if (layer.id.startsWith('coastline') || layer.id.startsWith('countries')) {
    //                     layer.filter = ['!=', ['get', 'ADM0_A3'], 'USA'];
    //                 }
    //                 return layer;
    //             })
    //         ]
    //     })
    // });

    // map.on('load', () => {
    //     map.addSource('tn-water-source', {
    //         'type': 'geojson',
    //         'data': 'http://localhost/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=geonode%3Awaterways&outputFormat=json&srs=EPSG%3A4326&srsName=EPSG%3A4326'
    //         // 'https://maplibre.org/maplibre-gl-js/docs/assets/rwanda-provinces.geojson'
    //     });
    //     map.addLayer({
    //         'id': 'tn-waterways',
    //         'type': 'line',
    //         'source': 'tn-water-source',
    //         'layout': {},
    //         'paint': {
    //             'line-color': [
    //                 'match',
    //                 ['get', 'type'],
    //                 'stream', '#1e90ff',        // blu per fiumi principali
    //                 'drain', '#00b894',   // verde acqua per secondari
    //                 'ditch', '#cdcb6e',       
    //                 'river', '#edcb6e',       
    //                 'weir', '#1dcb6e',       
    //                 /* other */ '#636e72'      // grigio per altri tipi



    //             ],
                
    //             'line-width': 2
    //         }

    //     });
    //     console.log("Layer added")
    // });



});


</script>

<style scoped>
.map-container {
    width: 100%;
    height: 500px;
}
</style>