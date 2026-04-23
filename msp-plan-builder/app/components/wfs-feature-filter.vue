<script setup>
import { ref } from 'vue';
// Importa WfsEndpoint e il costruttore del filtro (FilterBuilder)
import { WfsEndpoint, FilterBuilder } from '@camptocamp/ogc-client';

const features = ref([]);
const loading = ref(false);
const error = ref(null);

// Inserisci l'URL del tuo endpoint WFS e il nome del layer (feature type)
const WFS_URL = 'https://example.com/geoserver/wfs'; // Sostituisci con il tuo URL
const FEATURE_TYPE_NAME = 'workspace:layer_name'; // Sostituisci con il nome del layer

const fetchWfsFeatures = async () => {
	loading.value = true;
	error.value = null;
	features.value = [];

	try {
		// 1. Inizializza l'endpoint WFS. ogc-client gestirà automaticamente la versione.
		const wfsEndpoint = await WfsEndpoint.searchAndCreateAsync(WFS_URL);

		// 2. Crea un filtro usando FilterBuilder.
		// Esempio: filtro per proprietà "name" uguale a "specific_value"
		const filterBuilder = new FilterBuilder();
		const filter = filterBuilder.propertyIsEqualTo('name', 'specific_value'); // Sostituisci 'name' e 'specific_value'

		// Se hai bisogno di filtri più complessi, puoi usare operatori logici:
		// const filter = filterBuilder.and(
		//	 filterBuilder.propertyIsGreaterThan('area', 100),
		//	 filterBuilder.propertyIsLike('name', 'Rome%')
		// );

		// 3. Esegui la richiesta GetFeature con il filtro.
		// Specifica il/i tipo/i di feature e il filtro come parte delle opzioni di query.
		const response = await wfsEndpoint.getFeatures(
			[{ name: FEATURE_TYPE_NAME }],
			{
				filter: filter,
				// Altre opzioni come outputFormat, maxFeatures, ecc.
			}
		);

		// ogc-client restituisce oggetti JavaScript nativi (spesso GeoJSON features)
		features.value = response.features;

	} catch (err) {
		console.error("Errore nel recupero delle feature WFS:", err);
		error.value = err;
	} finally {
		loading.value = false;
	}
};

// Carica le feature all'avvio della pagina
onMounted(fetchWfsFeatures);
</script>
<template>
	<div class="p-4">
		<h1 class="text-2xl font-bold mb-4">Filtro WFS OGC con ogc-client</h1>

		<div v-if="loading" class="text-blue-500">Caricamento delle feature...</div>
		<div v-if="error" class="text-red-500">Errore: {{ error.message }}</div>

		<div v-if="features.length">
			<h2 class="text-xl mt-4">Feature Trovate ({{ features.length }})</h2>
			<ul class="list-disc pl-5">
				<li v-for="feature in features" :key="feature.id" class="mb-1">
					ID: {{ feature.id }} -
					<!-- Mostra alcune proprietà della feature, ad es. "name" o "property_a" -->
					Proprietà Esempio: {{ feature.properties.name || feature.properties.property_a || 'N/D' }}
				</li>
			</ul>
		</div>
		<div v-else-if="!loading && !error">
			Nessuna feature trovata con i filtri specificati.
		</div>
	</div>
</template>



<style scoped>
/* Aggiungi qui eventuali stili specifici se necessario */
</style>
