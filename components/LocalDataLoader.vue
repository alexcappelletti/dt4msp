<template>
	<div class="uploader">
		<h2>Carica i file Locali</h2>
		<div class="button-group">
			<button @click="loadScenario" :disabled="loadingS || store.scenario !== null">
				{{ loadingS ? 'Caricamento...' : 'Carica Scenario' }}
			</button>

			<button @click="loadGeostory" :disabled="loadingG || store.selectedStory !== null">
				{{ loadingG ? 'Caricamento...' : 'Carica Geostoria' }}
			</button>
		</div>
	</div>
	<div v-if="store.scenario">
		<h3>Scenario caricato: {{ store.scenario?.name }}</h3>
		<p>Numero di temi: {{ store.themes.length }}</p>
	</div>
	<div v-if="store.selectedStory" class="geostory-wrapper">
		<div class="geostory-header">
			<h3>Geostoria caricata: {{ store.selectedStory?.title }}</h3>
			<p>Numero di elementi: {{ store.selectedStory?.elements.length }}</p>
		</div>
		<button class="export-button" @click="exportToPDF">📄 Esporta Geostoria in PDF</button>

	</div>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { read, utils } from 'xlsx'
import { useGeostoryStore } from '@/stores/geostoryStore'
import { GeostoryXlsxReader, ScenarioXlsxReader } from '~/models/xlsReaders'
import { useGeostoryPdf } from '@/composables/geostoryToPdf'
import type { Geostory } from '~/models/geostory'


const store = useGeostoryStore()
const loadingS = ref(false)
const loadingG = ref(false)

const { generatePdf } = useGeostoryPdf()


async function loadScenario(event: Event): Promise<void> {
	loadingS.value = true
	try {
		const response = await fetch('/data/final_scenario_bd.xlsx')
		const arrayBuffer = await response.arrayBuffer()
		const uint8 = new Uint8Array(arrayBuffer)
		console.log('Scenario caricato1');
		const workbook = read(uint8, { type: 'array' })
		const reader = new ScenarioXlsxReader(workbook);
		console.log('Scenario caricato');
		store.setScenario(reader.readScenario());
		store.setThemes(reader.readThemesFromSheet());
		loadingS.value = false
	}
	catch (error) {
		console.error('Errore nella lettura del file Excel:', error)
	}
}
async function exportToPDF() {
	generatePdf(store.selectedStory as Geostory)
}


async function loadGeostory(event: Event): Promise<void> {
	loadingG.value = true
	try {
		const response = await fetch('/data/np_geostory2025-08-25.xlsx')
		const arrayBuffer = await response.arrayBuffer()
		const uint8 = new Uint8Array(arrayBuffer)
		const workbook = read(uint8, { type: 'array' })
		const reader = new GeostoryXlsxReader(workbook);
		store.selectStory(reader.loadGeoStory());
		loadingG.value = false

	}
	catch (error) {
		console.error('Errore nella lettura del file Excel:', error)
	}
}

</script>

<style scoped>
.uploader {
	padding: 2rem;
	border: 1px solid #ccc;
	border-radius: 8px;
}

input {
	display: block;
	margin-bottom: 1rem;
}

.uploader {
	max-width: 400px;
	margin: 0 auto;
	text-align: center;
}

.button-group {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	margin-top: 1.5rem;
}

.geostory-wrapper {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: 1rem;
	margin-top: 2rem;
}

.geostory-header {
	display: flex;
	flex-direction: column;
	gap: 0.3rem;
	/* Riduce lo spazio tra titolo e paragrafo */
}


button {
	padding: 1rem 2rem;
	font-size: 1.2rem;
	border-radius: 8px;
	border: none;
	background-color: #007bff;
	color: white;
	cursor: pointer;
	transition: background-color 0.3s ease;
}

button:disabled {
	background-color: #aaa;
	cursor: not-allowed;
}

button:hover:not(:disabled) {
	background-color: #0056b3;
}

.export-button-wrapper {
	margin-top: 2rem;
	text-align: center;
}

.export-button {
	width: 20rem;
	padding: 1rem;
	font-size: 1.2rem;
	border-radius: 8px;
	border: none;
	background-color: #007bff;
	color: white;
	cursor: pointer;
	transition: background-color 0.3s ease;
}

.export-button:hover {
	background-color: #218838;
}

.pdf-capture-wrapper {
	position: absolute;
	top: -9999px;
	left: -9999px;
	visibility: hidden;
}
</style>
