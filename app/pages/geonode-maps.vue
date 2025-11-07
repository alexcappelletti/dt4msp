<script setup lang="ts">
import { ref } from 'vue';
import type { GeonodeLayer } from '~/models/geonode';
import mapViewer from '~/components/mapViewer.vue';
import { MapVisual } from '~/models/visual';
import { useGeostoryStore } from '~/stores/geostoryStore';
import { storeToRefs } from 'pinia';

const store = useGeostoryStore()

const { visuals2 } = storeToRefs(store); 

const { data, pending, error, execute } = useFetch('/api/geonode-proxy', {
	immediate: false, // <-- QUESTO impedisce il fetch automatico all'avvio
	params: {
		cmd: "layers",
		mapid: "556"
	},
});

const selectedLayer = ref<Layer | null>(null);
const dialogVisible = ref(false); // Stato per gestire l'apertura/chiusura della dialog


const layers = computed(()=>{
	return data.value || new Array<GeonodeLayer>()
})

const visibleLayers = computed(() =>{
	const allData = data.value || new Array<GeonodeLayer>()
	return allData
		.filter(l => l.ows_url &&l.visibility === true )

})


const fetchLayers = async () => {
	await execute(); 
	const allData = data.value || new Array<GeonodeLayer>()
	store.setAvailableVisuals(allData
		.filter(l => l.ows_url && l.visibility === true )
		.map(l => new MapVisual(l as GeonodeLayer))
		//.filter((v, idx) => v.standardType === 'raster' )) //solo raster e primi tre
    )
};

const selectLayer = (layer: Layer) => {
    selectedLayer.value = layer;
    dialogVisible.value = true;
};

const closeDialog = () => {
    dialogVisible.value = false;
};

const formatKey = (key: string): string => {
    const result = key.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
};

const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value, null, 2); // Ritorna una stringa JSON formattata
    }
    if (value === true) return 'Sì';
    if (value === false) return 'No';
    if (value === null || value === undefined) return 'N/A';
    return String(value);
};

</script>

<template>
    <v-container fluid class="fill-height bg-surface-variant">
        <v-row class="tw:h-full">
            <!-- Colonna 1: Lista Layer (Larghezza 2) -->
            <v-col cols="2">
                <!-- ... Contenuto del header: bottone e messaggi (rimane uguale) ... -->
                <div align-self="start" class="mb-2"> 
					<v-btn @click="fetchLayers" :disabled="pending"> {{ pending ? 'Caricamento...' : 'Carica Layers BASSET-MED case study' }} </v-btn>
					<p v-if="pending" class="mt-2">Caricamento dei dati in corso...</p>
					<div v-else-if="error" class="error-message mt-2">Errore nel caricamento: {{ error.message }}</div>
				</div>

                <div class="flex-grow-1 overflow-y-auto">
                    <ul v-if="visibleLayers.length > 0">
                        <li 
                            v-for="layer in visibleLayers" 
                            :key="layer.pk"
                            @click="selectLayer(layer)"
                            :class="{'selected-layer-item': selectedLayer && selectedLayer.pk === layer.pk}"
                        >
                            <v-icon :color="layer.local ? 'info' : 'grey'" small class="mr-2">
                                {{ layer.local ? 'mdi-home-city' : 'mdi-web' }}
                            </v-icon> 
                            [{{ layer.name }}-{{ layer.pk }}] <strong>{{layer.layer_params.title }}</strong>
                            <span :style="{ color: layer.visibility ? 'green' : 'red' }" class="ml-2">
                                {{ layer.visibility ? '-' : 'Nascosto' }}
                            </span>
                        </li>
                    </ul>
                    <p v-else-if="!pending && !error">Nessun dato disponibile.</p>
                </div>
            </v-col>
            
            <!-- Colonna 2: Visualizzatore Mappa -->
            <v-col>
                <map-viewer :visuals="visuals2" :info="false"></map-viewer>
            </v-col>
        </v-row>
    </v-container>
    <v-dialog v-model="dialogVisible" max-width="800px">
        <v-card v-if="selectedLayer">
            <v-card-title class="headline">Dettagli Completi del Layer</v-card-title>
            
            <v-card-text>
                
                <!-- Iterazione sulle proprietà di primo livello di GeonodeLayer -->
                <h4>Proprietà Principali</h4>
                 <div class="details-section">
                    <p v-for="key in Object.keys(selectedLayer)" :key="key">
                        <strong>{{ formatKey(key) }}:</strong> 
                        <!-- Gestione speciale per gli oggetti interni -->
                        <span v-if="typeof selectedLayer[key] === 'object' && selectedLayer[key] !== null && !Array.isArray(selectedLayer[key])">
                            Vedi sezione dedicata sotto
                        </span>
                        <span v-else>
                            {{ formatValue(selectedLayer[key]) }}
                        </span>
                    </p>
                </div>

                <v-divider class="my-4"></v-divider>

                <!-- Sezione Sottocampi (layer_params) -->
                <h4 class="mt-4">Parametri del Layer (layer_params)</h4>
                <!-- Sostituzione di v-list con div e p -->
                <div class="details-section">
                    <p v-for="key in Object.keys(selectedLayer.layer_params)" :key="'param-' + key">
                        <strong>{{ formatKey(key) }}:</strong> 
                        {{ formatValue(selectedLayer.layer_params[key]) }}
                    </p>
                </div>

                 <v-divider class="my-4"></v-divider>

                <!-- Sezione Sottocampi (source_params) -->
                <h4 class="mt-4">Parametri Sorgente (source_params)</h4>
                <!-- Sostituzione di v-list con div e p -->
                <div class="details-section">
                    <p v-for="key in Object.keys(selectedLayer.source_params)" :key="'source-' + key">
                        <strong>{{ formatKey(key) }}:</strong> 
                        {{ formatValue(selectedLayer.source_params[key]) }}
                    </p>
                </div>

            </v-card-text>
            
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="closeDialog">Chiudi</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>


<style scoped>
	li {
		cursor: pointer;
		padding: 5px;
		transition: background-color 0.2s;
	}
	li:hover {
		background-color: #f0f0f0;
	}
	.selected-layer-item {
		background-color: #97c73d;
		font-weight: bold;
		border-left: 4px solid #1976D2; /* Colore primary di Vuetify */
	}
</style>