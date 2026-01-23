<!-- app/pages/scenarios/[id].vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useScenarioStore } from '@/stores/scenarioStore';
import { storeToRefs } from 'pinia';
import type { Scenario } from '#/shared/types/msp-project';

const route = useRoute();

const tab = ref('general');
const scenarioData = ref<Scenario | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);
const scenarioStore = useScenarioStore();
const { selectedScenario } = storeToRefs(scenarioStore);

const hasStatements = computed(() => {
	return scenarioData.value?.statements !== undefined && scenarioData.value.statements.length > 0;
});
const hasScenario = computed(() => scenarioData.value !== null);

const handleEditRequest = (statement: any) => {
	// Logica per gestire la richiesta di modifica dello statement
	console.log('Modifica richiesta per lo statement:', statement);
};
const handleDeleteStatement = (statementId: string) => {
	if (!scenarioData.value || !scenarioData.value.statements) return;

	const index = scenarioData.value.statements.findIndex(s => s.id === statementId);
	if (index !== -1) {
		scenarioData.value.statements.splice(index, 1);
	}
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

		<div v-if="selectedScenario" >
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
							class="pa-4" />
						<p v-else class="pa-4">Nessun dato statements disponibile.</p>
					</v-window-item>

					<v-window-item value="measures">
						<p>Integrazione Misure</p>
					</v-window-item>
					<v-window-item value="effects">
						<scenario-effects />
					</v-window-item>
					<v-window-item value="feedback">
						<scenario-feedback />
					</v-window-item>
					
					<v-window-item value="map">
						<p>Integrazione Mappa</p>
					</v-window-item>
				</v-window>
			</div>
		</div>
	</v-container>
</template>

<style scoped>
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
	background-color: #FFFFFF;
	/* Aggiunge lo sfondo bianco che v-card forniva */
	padding: 16px;
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
</style>
