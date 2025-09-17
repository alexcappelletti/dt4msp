
<script setup lang="ts">
import { ref } from 'vue'
import { read } from 'xlsx'
import { useGeostoryStore } from '@/stores/geostoryStore'
import { GeostoryXlsxReader, ScenarioXlsxReader } from '~/models/xlsReaders'
import { useGeostoryPdf } from '@/composables/geostoryToPdf'
import type { Geostory } from '~/models/geostory'

const store = useGeostoryStore()
const loadingS = ref(false)
const loadingG = ref(false)
const { generatePdf } = useGeostoryPdf()

async function loadScenario() {
  loadingS.value = true
  try {
    const response = await fetch('/data/final_scenario_bd.xlsx')
    const arrayBuffer = await response.arrayBuffer()
    const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' })
    const reader = new ScenarioXlsxReader(workbook)
    store.setScenario(reader.readScenario())
    store.setThemes(reader.readThemesFromSheet())
  } catch (error) {
    console.error('Errore nella lettura del file Excel:', error)
  } finally {
    loadingS.value = false
  }
}

async function loadGeostory() {
  loadingG.value = true
  try {
    const response = await fetch('/data/np_geostory2025-08-25.xlsx')
    const arrayBuffer = await response.arrayBuffer()
    const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' })
    const reader = new GeostoryXlsxReader(workbook)
    store.selectStory(reader.loadGeoStory())
  } catch (error) {
    console.error('Errore nella lettura del file Excel:', error)
  } finally {
    loadingG.value = false
  }
}

function exportToPDF() {
  generatePdf(store.selectedStory as Geostory)
}
</script>

<template>
  <div class="max-w-md mx-auto mt-10 p-6 border border-gray-300 rounded-lg text-center bg-white shadow">
    <h2 class="text-2xl font-bold mb-6">Carica i file Locali</h2>
    <div class="flex flex-col gap-4">
      <button
        @click="loadScenario"
        :disabled="loadingS || store.scenario !== null"
        class="bg-primary-500 px-6 py-3 text-lg rounded-full text-white hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
      >
        {{ loadingS ? 'Caricamento...' : 'Carica Scenario' }}
      </button>

      <button
        @click="loadGeostory"
        :disabled="loadingG || store.selectedStory !== null"
        class="bg-primary-500 text-lg rounded-full text-white hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition px-6 py-3"
      >
        {{ loadingG ? 'Caricamento...' : 'Carica Geostoria' }}
      </button>
    </div>
  </div>

  <div v-if="store.scenario" class="max-w-md mx-auto mt-8 bg-gray-50 p-4 rounded shadow">
    <h3 class="text-xl font-semibold mb-2">Scenario caricato: {{ store.scenario?.name }}</h3>
    <p class="text-gray-700">Numero di temi: {{ store.themes.length }}</p>
  </div>

  <div v-if="store.selectedStory" class="max-w-md mx-auto mt-8 bg-gray-50 p-4 rounded shadow">
    <div class="mb-4">
      <h3 class="text-xl font-semibold">Geostoria caricata: {{ store.selectedStory?.title }}</h3>
      <p class="text-gray-700">Numero di elementi: {{ store.selectedStory?.elements.length }}</p>
    </div>
    <button
      @click="exportToPDF"
      class="bg-primary-500 rounded-xl w-full px-6 py-3 text-white hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition "
    >
      📄 Esporta Geostoria in PDF
    </button>	
  </div>
</template>



<style scoped lang="scss">
$primary-color: #Fb82f6; // Blu primario
.app-button {
	background-color: $primary-color;

}
</style>	
