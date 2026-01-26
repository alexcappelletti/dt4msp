<!-- app/pages/scenarios/[id].vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useScenarioStore } from '@/stores/scenarioStore';
import { storeToRefs } from 'pinia';
import type { Scenario, Statement } from '#/shared/types/msp-project';
type ViewModeType = 
	'tab-view' | 
	'edit-statement' | 
	'edit-measures' | 
	'edit-effects' |
	'edit-feedbacks';
const route = useRoute();

const tab = ref('general');
const scenarioData = ref<Scenario | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);
const scenarioStore = useScenarioStore();
const { selectedScenario } = storeToRefs(scenarioStore);

const viewMode = ref<ViewModeType>('tab-view');
const selectedStatement = ref<Statement | null>(null);	



const hasStatements = computed(() => {
	return scenarioData.value?.statements !== undefined && scenarioData.value.statements.length > 0;
});
const hasScenario = computed(() => scenarioData.value !== null);

const handleNewStatement = (type: 'General' | 'Sector-specific') => {
	// Logica per gestire la cancellazione del form di nuovo statement
	console.log('Cancellazione del form di nuovo statement');
	viewMode.value = 'edit-statement';
	selectedStatement.value = {
		id: '', // Sarà generato al salvataggio
		shortName: '',
		longName: '',
		description: '',
		// Se è sector-specific, inizializziamo l'array, altrimenti undefined
		sectorThemes: type === 'Sector-specific' ? [] : undefined
	};
	console.log('Apertura del form di nuovo statement di tipo:', type);
	console.log('Selected Statement:', selectedStatement.value);
};

const handleEditRequest = (statement: Statement) => {
	// Logica per gestire la richiesta di modifica dello statement
	viewMode.value = 'edit-statement';
	selectedStatement.value = statement;
	console.log('Modifica richiesta per lo statement:', statement);

};
const handleDeleteStatement = (statementId: string) => {
	if (!scenarioData.value || !scenarioData.value.statements) return;

	const index = scenarioData.value.statements.findIndex(s => s.id === statementId);
	if (index !== -1) {
		scenarioData.value.statements.splice(index, 1);
	}
};

const handleSaveStatement = (formData: Partial<Statement>) => {
	if (!scenarioData.value) return;
	if (!scenarioData.value.statements) scenarioData.value.statements = [];

	if (selectedStatement.value?.id) {
		// --- LOGICA EDIT ---
		const index = scenarioData.value.statements.findIndex(s => s.id === selectedStatement.value!.id);
		if (index !== -1) {
			scenarioData.value.statements[index] = {
				...selectedStatement.value,
				...formData
			} as Statement;
			console.log("Statement aggiornato con successo");
		}
	} else {
		// --- LOGICA NUOVO ---
		const newStatement: Statement = {
			id: generateUUID(),
			shortName: formData.shortName || '',
			longName: formData.longName || '',
			description: formData.description || '',
			sectorThemes: formData.sectorThemes
		};
		scenarioData.value.statements.push(newStatement);
		console.log("Nuovo statement creato con successo");
	}
	viewMode.value = 'tab-view';
	selectedStatement.value = null;
};

const handleCancelEditStatement = () => {
	viewMode.value = 'tab-view';
	selectedStatement.value = null;
};	

onMounted(async () => {
	const scenarioId = route.params.pk as string;
	await useScenarioStore().fetchScenarioMock(scenarioId);
	scenarioData.value = useScenarioStore().selectedScenario;
	isLoading.value = false;
});


// Debounce di 500ms
</script>
<template>
	<v-container fluid class="main-scenario-container">
		<v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>

		<v-fade-transition>
			<div v-if="isSaving" class="text-caption text-primary d-flex align-center position-absolute"
				style="top: 70px; right: 20px; z-index: 10;">
				<v-progress-circular indeterminate size="16" width="2" class="mr-2"></v-progress-circular>
				Salvataggio automatico...
			</div>
		</v-fade-transition>

		
		<div v-if="viewMode === 'tab-view' && selectedScenario" >
			<v-tabs v-model="tab" color="primary">
				<v-tab value="general">Generale</v-tab>
				<v-tab value="statements">Statements</v-tab>
				<v-tab value="measures">Misure</v-tab>
				<v-tab value="effects">Effects</v-tab>
				<v-tab value="feedback">Feedback</v-tab>
<!-- 				
				<v-tab value="map">Mappa</v-tab> -->
			</v-tabs>
			<div class="scenario-window">
				<v-window v-model="tab">
					<v-window-item value="general">
						<scenario-general-form />
					</v-window-item>
					<v-window-item value="statements">
						<scenario-statements :statements="selectedScenario.statements || []" 
							v-if="hasStatements"
							@edit:statement="handleEditRequest" 
							@delete:statement="handleDeleteStatement"
							 />
						<p v-else class="pa-4">Nessun statements disponibile.</p>
					</v-window-item>

					<v-window-item value="measures">
						<scenario-measures :measures="selectedScenario.measures || []" />

					</v-window-item>
					<v-window-item value="effects">
						<scenario-effects />
					</v-window-item>
					<v-window-item value="feedback">
						<scenario-feedbacks />
					</v-window-item>
					
					<v-window-item value="map">
						<p>Integrazione Mappa</p>
					</v-window-item>
				</v-window>
			</div>
		</div>

		<statement-form v-if="viewMode === 'edit-statement' && selectedStatement" 
			:initial-data="selectedStatement"
			@save="handleSaveStatement" 
			@cancel="handleCancelEditStatement" />
		<!-- FAB Button in basso a destra -->
		<div class="fab-speed-dial-container" v-if="viewMode === 'tab-view' && tab === 'statements'">
			<v-speed-dial location="top right" transition="scale-transition">
				<template v-slot:activator="{ props: activatorProps }">
					<v-btn v-bind="activatorProps" color="primary" icon="mdi-plus" size="large" elevation="4"></v-btn>
				</template>
				<!-- Opzione Sector-specific -->
				<v-btn key="1" color="secondary" prepend-icon="mdi-tag-multiple"
					@click="handleNewStatement('Sector-specific')">
					Sector-specific
				</v-btn>

				<!-- Opzione General -->
				<v-btn key="2" color="surface-variant" prepend-icon="mdi-earth" @click="handleNewStatement('General')">
					General
				</v-btn>
			</v-speed-dial>
		</div>
	</v-container>
</template>

<style scoped>
.debug {
	border: 1px solid red;
	background-color: peru;
}
.position-absolute {
	position: absolute !important;
	
}

/* Assicura che il v-container occupi l'altezza necessaria per calcolare lo scrolling */
.main-scenario-container {
	height: 100%;
	display: flex;
	flex-direction: column;
	
}

/* Applica altezza massima e scrolling solo al contenuto delle tab */
.scenario-window {
	/* 
    * Calcola l'altezza: 
    * 100% dell'altezza disponibile MENO l'altezza della barra dei tab (~48px di default) 
    * Meno l'header di navigazione globale (~64px di default) e un po' di margine.
    */
	max-height: calc(100vh - 150px);
	overflow-y: auto;
	/* Attiva la scrollbar verticale se il contenuto eccede */
	overflow-x: hidden;
	/* Nasconde scrollbar orizzontale */
	/* Aggiunge lo sfondo bianco che v-card forniva */
	padding: 4px;
}

/* Opzionale: aggiunge un leggero bordo sotto i tab per separare visivamente */
.tabs-header {
	border-bottom: 1px solid #eee;
	background-color: #f9f9f9;
}

/* Assicurati che il contenuto interno delle window-item abbia un padding */
:deep(.v-window-item) {
	/* Il padding è già gestito nel wrapper, ma se i componenti figli sono complessi, potrebbe servire qui */
}
.fab-speed-dial-container {
	position: absolute;
	/* Rimane fisso rispetto alla finestra (viewport) */
	bottom: 30px;
	/* 20px dal basso */
	right: 40px;
	/* 20px da destra */
	z-index: 1000;
	display: flex;
	flex-direction: column;
	display: flex;
	align-items: left;
	/* Assicura che sia sopra gli altri elementi */
}
</style>
