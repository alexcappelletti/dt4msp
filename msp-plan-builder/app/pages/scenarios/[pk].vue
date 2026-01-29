<script setup lang="ts">
import type { Scenario, Statement, Measure, Aspect, DomainMeasure } from '#/shared/types/msp-project';
import { useScenarioStore } from '@/stores/scenarioStore';
import {useThemesProvider} from '@/composables/useThemesProvider';
import { generateUUID } from "#/shared/utils/generateUUID"; // Import mancante
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

type ViewModeType = 'tab-view' | 'edit';

const route = useRoute();
const scenarioStore = useScenarioStore();
const { selectedScenario } = storeToRefs(scenarioStore); // Reattivo dallo store

const tab = ref('general');
const isLoading = ref(true);
const isSaving = ref(false);

const viewMode = ref<ViewModeType>('tab-view');
const selectedStatement = ref<Statement | null>(null);
const selectedMeasure = ref<DomainMeasure | null>(null); // Aggiunto ref mancante

// Utilizziamo direttamente selectedScenario dallo store per evitare sfasamenti
const hasStatements = computed(() => (selectedScenario.value?.statements?.length ?? 0) > 0);
const hasMeasures = computed(() => (selectedScenario.value?.domainMeasures?.length ?? 0) > 0);
const hasEffects = computed(() => (selectedScenario.value?.domainEffects?.length ?? 0) > 0);


// --- LOGICA STATEMENT ---
const handleNewStatement = (type: 'General' | 'Sector-specific') => {
	viewMode.value = 'edit';
	selectedStatement.value = {
		id: '',
		shortName: '',
		longName: '',
		description: '',
		sectorThemes: type === 'Sector-specific' ? [] : undefined
	} as Statement;
};
const handleSaveStatement = (formData: Partial<Statement>) => {
	if (!selectedScenario.value) return;
	if (!selectedScenario.value.statements) selectedScenario.value.statements = [];

	if (selectedStatement.value?.id) {
		const index = selectedScenario.value.statements.findIndex(s => s.id === selectedStatement.value!.id);
		if (index !== -1) {
			selectedScenario.value.statements[index] = { ...selectedStatement.value, ...formData } as Statement;
		}
	} else {
		selectedScenario.value.statements.push({
			...formData,
			id: generateUUID(),
		} as Statement);
	}
	viewMode.value = 'tab-view';
	selectedStatement.value = null;
};


const handleEditStatement = (statement: Statement) => {
	viewMode.value = 'edit';
	selectedStatement.value = statement;
};

const handleDeleteStatement = (statementId: string) => {
	if (!selectedScenario.value?.statements) return;
	selectedScenario.value.statements = selectedScenario.value.statements.filter(s => s.id !== statementId);
};

const handleNewMeasure = (type: 'Spatial' | 'Contextual') => {
	viewMode.value = 'edit';
	// Logica di inizializzazione per Aspect o Measure
	selectedMeasure.value = type === 'Spatial'
		? {
			type: 'Spatial',
			id: '',
			description: '',
			name: '',
			impact: '',
			geospatialResources: []
		} as DomainMeasure
		: {
			type: 'Contextual',
			id: '',
			description: '',
			name: '',
		} as DomainMeasure;

};
const handleEditMeasure = (measure: DomainMeasure) => {
	viewMode.value = 'edit';
	selectedMeasure.value = measure;
};
const handleSaveAspect = (formData: Partial<DomainMeasure>) => {
	if (!selectedScenario.value) return;
	if (!selectedScenario.value.domainMeasures) selectedScenario.value.domainMeasures = [];
	
	if (selectedMeasure.value?.id) {
		const index = selectedScenario.value.domainMeasures.findIndex(m => m.id === selectedMeasure.value!.id);
		console.log("1")
		if (index !== -1) {
			console.log("2")
			selectedScenario.value.domainMeasures[index] = { ...selectedMeasure.value, ...formData } as DomainMeasure;

		}
	} else {
		console.log("3")
		selectedScenario.value.domainMeasures.push({
			...formData,
			id: generateUUID(),
		} as DomainMeasure);
	}
	viewMode.value = 'tab-view';
	selectedMeasure.value = null;
};
const handleCloneMeasure = (measure: DomainMeasure) => {
	const { id, ...clonedMeasureData } = measure;
	selectedMeasure.value = { ...clonedMeasureData, id: '' }; // Reset id for new measure
	viewMode.value = 'edit';	
};
const handleDeleteMeasure = (measure: DomainMeasure) => {
	if (!selectedScenario.value?.domainMeasures) return;
	selectedScenario.value.domainMeasures = selectedScenario.value.domainMeasures
		.filter(m => m.id !== measure.id);
};

onMounted(async () => {
	const scenarioId = route.params.id as string; // pk o id in base al tuo router
	await scenarioStore.fetchScenarioMock(scenarioId);
	isLoading.value = false;
});


</script>

<template>
	<v-container fluid class="main-scenario-container">
		<v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>

		<!-- Utilizziamo selectedScenario dallo store -->
		<div v-if="viewMode === 'tab-view' && selectedScenario">
			<v-tabs v-model="tab" color="primary">
				<v-tab value="general">Generale</v-tab>
				<v-tab value="statements">Statements</v-tab>
				<v-tab value="measures">Misure</v-tab>
				<v-tab value="effects">Effects</v-tab>
				<v-tab value="feedback">Feedback</v-tab>
			</v-tabs>

			<div class="scenario-window">
				<v-window v-model="tab">
					<v-window-item value="general">
						<scenario-general-form />
					</v-window-item>

					<v-window-item value="statements">
						<scenario-statements :statements="selectedScenario.statements || []" v-if="hasStatements"
							@edit:statement="handleEditStatement" @delete:statement="handleDeleteStatement" />
						<p v-else class="pa-4">Nessun statements disponibile.</p>
					</v-window-item>

					<v-window-item value="measures">
						<scenario-domain-measures 
							:domain-measures="selectedScenario.domainMeasures || []" 
							@edit:measure="handleEditMeasure"
							@delete:measure="handleDeleteMeasure"
							@clone:measure="handleCloneMeasure" />
					</v-window-item>

					<v-window-item value="effects">
						<scenario-domain-effects :domain-effects="selectedScenario.domainEffects || []" />
					</v-window-item>
				</v-window>
			</div>
		</div>

		<!-- Forms di editing -->
		<statement-form v-if="viewMode === 'edit' && tab === 'statements' && selectedStatement" 
			:initial-data="selectedStatement"
			@save="handleSaveStatement" @cancel="viewMode = 'tab-view'" />

		<!-- Fix: Aggiunto controllo per selectedMeasure -->
		<scenario-aspect-form v-if="viewMode === 'edit' && tab === 'measures' && selectedMeasure"
			:initial-data="selectedMeasure" 
			@save="handleSaveAspect" 
			@cancel="viewMode = 'tab-view'" />

		<!-- FABs -->
		<div class="fab-speed-dial-container"
			v-if="viewMode === 'tab-view' && tab !== 'general'">
			<v-speed-dial v-if="tab === 'statements'" location="top right" transition="scale-transition">
				<template v-slot:activator="{ props }">
					<v-btn v-bind="props" color="primary" icon="mdi-plus" size="large"></v-btn>
				</template>
				<v-btn key="1" color="secondary" @click="handleNewStatement('Sector-specific')">Sector-specific</v-btn>
				<v-btn key="2" color="surface-variant" @click="handleNewStatement('General')">General</v-btn>
			</v-speed-dial>

			<v-speed-dial v-if="tab === 'measures'" location="top right" transition="scale-transition">
				<template v-slot:activator="{ props }">
					<v-btn v-bind="props" color="primary" icon="mdi-plus" size="large"></v-btn>
				</template>
				<v-btn key="1" color="secondary" @click="handleNewMeasure('Contextual')">Non-spatial</v-btn>
				<v-btn key="2" color="surface-variant" @click="handleNewMeasure('Spatial')">Spatial</v-btn>
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
