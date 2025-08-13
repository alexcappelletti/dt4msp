<template>
    <div>
        <div class="wfs-map-info">
            <p>
                Questa è una mappa Leaflet che mostra dati WFS (GeoJSON) dal GeoServer demo.
            </p>
        </div>
        <div id="wfs-map" class="wfs-map-container"></div>
        
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'


const WFS_URL = 'http://localhost/geoserver/geonode/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=geonode%3Abuildings&outputFormat=application/json'
let map: L.Map

onMounted(async () => {
    map = L.map('wfs-map').setView([37.8, -96], 4)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map)

    // Fetch WFS GeoJSON
    const response = await fetch(WFS_URL)
    const geojson = await response.json()

    // Add GeoJSON layer
    L.geoJSON(geojson, {
        style: { color: '#1976d2', weight: 2, fillOpacity: 0.2 },
        onEachFeature: (feature, layer) => {
            if (feature.properties && feature.properties.name) {
                layer.bindPopup(feature.properties.name)
            }
        }
    }).addTo(map)


    setTimeout(() => {
        if (map) {
        map.flyTo([46.0674, 11.1211], 13, { animate: true, duration: 2 })
        }
    }, 500)
})
</script>

<style lang="scss" scoped>
.wfs-map-container {
  width: 100%;
  height: 80vh;
  margin-bottom: 1rem;
}
</style>
