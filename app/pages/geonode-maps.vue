<script setup lang="ts">
import { ref } from 'vue';
import { $fetch } from 'ofetch'
import type { GeonodeLayer } from '~/models/geonode';


const { data, pending, error, execute } = useFetch('/api/geonode-proxy', {
	immediate: false, // <-- QUESTO impedisce il fetch automatico all'avvio
	params: {
		cmd: "layers",
		mapid: "556"
	},
});


const layers = computed(()=>{
	return data.value || new Array<GeonodeLayer>()
})

const visibleLayers = computed(() =>{
	const allData = data.value || new Array<GeonodeLayer>()
	return allData.filter(l => l.visibility === true)


})

const fetchLayers = async () => {
	await execute(); 
};



</script>


<template>
	<v-container fluid class="d-flex flex-column fill-height">
		
		<div class="mb-4"> 
			<!-- Contenuto del header: bottone e messaggi -->
			<v-btn @click="fetchLayers" :disabled="pending"> {{ pending ? 'Caricamento...' : 'Carica Layers BASSET-MED case study' }} </v-btn>
			<p v-if="pending" class="mt-2">Caricamento dei dati in corso...</p>
			<div v-else-if="error" class="error-message mt-2">Errore nel caricamento: {{ error.message }}</div>
		</div> <!-- </div> CHISURA CORRETTA -->
		
		<!-- Contenitore scrollabile che ora è un elemento FRATELLO -->
		<div class="flex-grow-1 overflow-y-auto">
			
			<!-- Logica condizionale della lista -->
			<ul v-if="visibleLayers.length >0">
				<li v-for="layer in visibleLayers" :key="layer.pk">
					<v-icon :color="layer.local ? 'info' : 'grey'" small class="mr-2">
                        {{ layer.local ? 'mdi-home-city' : 'mdi-web' }}
                    </v-icon> 



					[{{ layer.name }}-{{ layer.pk }}] <strong>{{layer.layer_params.title }}</strong>
					<span :style="{ color: layer.visibility ? 'green' : 'red' }" class="ml-2">
						{{ layer.visibility ? '-' : 'Nascosto' }}
					</span>
				</li>
			</ul>
			
			<!-- Se non ci sono dati -->
			<!-- Nota: Ho aggiunto !pending e !error per una migliore UX -->
			<p v-else-if="!pending && !error">Nessun dato disponibile.</p>

		</div>
		
	</v-container>
</template>

