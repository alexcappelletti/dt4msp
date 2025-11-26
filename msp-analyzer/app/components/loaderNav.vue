<script setup lang="ts">

import { ref } from 'vue'
import { read } from 'xlsx'
import { useGeostoryStore } from '@/stores/geostoryStore'
import { GeostoryXlsxReader, ScenarioXlsxReader } from '~/models/xlsReaders'
import { useGeostoryPdf } from '@/composables/geostoryToPdf'
import type { Geostory } from '@/models/geostory'
import type { Scenario } from '~/models/scenario'

const store = useGeostoryStore()
const loadingS = ref(false)
const loadingG = ref(false)
const loading = ref(false)
const fileScenario = ref<string | null>(null);
const fileGeostory = ref<string | null>(null);	
const { generatePdf, printGeostory } = useGeostoryPdf()

async function handleFileUpload(event: Event, type: 'scenario' | 'geostory') {
	const input = event.target as HTMLInputElement
	const file = input.files?.[0]
	if (!file) {return}

	loading.value = true
	try {
		const arrayBuffer = await file.arrayBuffer()
		const workbook = read(new Uint8Array(arrayBuffer), { type: 'array' })
		if (type === 'scenario') {
			const reader = new ScenarioXlsxReader(workbook)
			store.setScenario(reader.readScenario())
			store.setThemes(reader.readThemesFromSheet())
			fileScenario.value = file.name;
		} else {
			const reader = new GeostoryXlsxReader(workbook)
			store.selectStory(reader.loadGeoStory())
			//questo é solo per la demo: nella versione finale visual maps sono letti dal file xls
			applyHCMaps()
			fileGeostory.value = file.name;
		}
	} catch (err) {
		console.error('Errore durante la lettura del file:', err)
	} finally {
		loading.value = false
	}
}

async function handleFromServer(event: Event, type: 'scenario' | 'geostory') {
	loading.value = true
	try {
		if (type === 'scenario') {await store.loadScenario({scenarioID:"default", from: "storage"})} 
		else if (type === 'geostory') {await store.loadGeostory({geostoryID:"default", from: "storage"})}
		loading.value = false
	} catch (err) {
		console.error('Errore durante il caricamento dal server:', err)
		loading.value = false
	}
}	
function applyHCMaps(){
	store.selectedStory?.elements.forEach(e =>{
		
		if (e.storyItems[0]?.visual) {


		}



	})


}



async function exportToPDF() {
	await generatePdf(store.selectedStory as Geostory)
	//await printGeostory(store.selectedStory as Geostory)
}
const viewGeostory = () => {
	navigateTo('/geostory-page');

	// if (store.selectedStory) {
	// 	const url = '/geostory-page';
	// 	window.open(url, '_blank');
	// }
};

</script>

<template>
	<v-container class="vert-item">
		<span>Scenario</span>
		<v-file-input 
			accept=".xlsx"
			label="carica file scenario"
			@change="(e:any) => handleFileUpload(e, 'scenario')">
		</v-file-input>
		<v-btn
			variant="outlined"
			@click="(e:any) => handleFromServer(e, 'scenario')">Esempio scenario
		</v-btn>
		
		<span class="tw:mt-15">Geostoria</span>
			<v-file-input 
				accept=".xlsx"
				label="carica file geostoria"
				@change="(e:any) => handleFileUpload(e, 'geostory')">
			</v-file-input>	
			<v-btn
			variant="outlined"
			@click="(e:any) => handleFromServer(e, 'geostory')">Esempio geostoria
		</v-btn>
		
			<v-btn
				variant="outlined"
				@click="exportToPDF"
				:disabled="!store.selectedStory"
				v-if="store.selectedStory"
				class="ex-button">
					Esporta Geostoria in PDF
			</v-btn>
			<v-btn
				variant="outlined"
				@click="viewGeostory"
				:disabled="!store.selectedStory"
				v-if="store.selectedStory"
				class="ex-button">
					Visualizza
			</v-btn>
		
	</v-container>



</template>



<style scoped lang="css">
@reference "@/assets/css/tailwind.css";

.vert-item {
	@apply tw:flex tw:flex-col tw:gap-2 tw:mb-4 tw:text-xl;
}	
/* .input-label {
	@apply flex flex-row text-lg  hover:bg-ux2 hover:text-ux5 
	rounded-xl mx-2 p-1 w-full
	ml-2 gap-1;
}

.input-label input[type="file"] {
  @apply hidden block m-2;
} */

.ex-button{
	@apply tw:border-ux1 tw:text-ux1 
	tw:transition;
	/* background-color: var(--color-debug); */

}
/* 
.choice-button {
	@apply bg-gray-100 pl-40 py-2 rounded-md text-lg text-ux1;
  border: none;
  border-bottom: 1px solid ux2;
  background-image: url('searchicon.png');
  background-position: 10px 10px;
  background-repeat: no-repeat;
  
  padding-left: 40px;
} */


	/* @apply bg-ux3 p-2 font-roboto text-lg rounded-md text-ux5 hover:bg-ux1 disabled:bg-gray-300 disabled:cursor-not-allowed transition
	/* background-color: var(--color-debug); */
/* } */ 
</style>	
