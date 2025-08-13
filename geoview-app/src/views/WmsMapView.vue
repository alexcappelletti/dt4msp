<template>
    <div class="controls">
      <button @click="zoomIn">Zoom In</button>
      <button @click="zoomOut">Zoom Out</button>
      <button @click="flyToTrentino">Fly to Trentino (ITA)</button>
    </div>
    <div id="wms-map" class="wms-map-container"></div>
    <div class="wms-map-2">
        <p>
            This is a WMS map displayed using leaflet. The map shows the states of
            the USA from a GeoServer demo instance.
        </p>
    </div>
</template>

<script setup language="ts">
import { ref, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'



// Esempio di URL WMS visualizzabile tramite iframe (GeoServer demo)
const wmsUrl = ref(
    'https://ahocevar.com/geoserver/wms?service=WMS&version=1.1.0&request=GetMap&layers=topp:states&styles=&bbox=-124.73142200000001,24.955967,-66.969849,49.371735&width=600&height=400&srs=EPSG:4326&format=image/png'
)

let map

onMounted(() => {
    // Inizializza la mappa quando il componente è montato
    initMap()
})

function initMap() {
    // Crea una mappa Leaflet
    map = L.map('wms-map').setView([37.8, -90], 4)
    // Aggiungi un layer di base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Aggiungi il layer WMS
    L.tileLayer.wms('https://ahocevar.com/geoserver/wms', {
        layers: 'topp:states',
        format: 'image/png',
        transparent: true,
        attribution: '© GeoServer demo'
    }).addTo(map)

    console.log('WMS map initialized')
}


function zoomIn() {
  if (map) map.setZoom(map.getZoom() + 1, { animate: true })
}

function zoomOut() {
  if (map) map.setZoom(map.getZoom() - 1, { animate: true })
}

function flyToTrentino() {
  if (map === undefined){return} 
  map.flyTo([46.0674, 11.1267], 10, { animate: true, duration: 2 })
  console

}

</script>

<style lang="scss" scoped>
.wms-map-container {
    width: 100%;
    height: 80vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.wms-map-iframe {
    border: none;
    width: 100%;
    height: 80vh;
}
</style>