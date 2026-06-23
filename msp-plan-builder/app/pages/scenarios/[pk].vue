<script setup lang="ts">
import type { Aspect, DomainEffect, DomainMeasure, Effect, Feedback, Measure, Statement } from '#/shared/types/msp-project';
// import { useScenarioStore } from '@/stores/scenarioStore';
import { generateUUID } from "#/shared/utils/generateUUID"; // Import mancante
import { storeToRefs } from 'pinia';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import type { EffectInitProp } from '~/components/scenario/EffectEditor.vue'
import type { MeasureType } from '~/components/scenario/DomainMeasures.vue';
import { debounce } from 'lodash-es';

type ViewModeType = 'tab-view' | 'edit';

const route = useRoute();
const router = useRouter();
const scenarioStore = useScenarioStore();
const projectStore = useProjectStore();
const tabsStore = useTabsStore();
const { selectedScenario, scenarios } = storeToRefs(scenarioStore); // Reattivo dallo store
const { scenarioTab } = storeToRefs(tabsStore);
const tab = computed({
	get: () => scenarioTab.value,
	set: (val: 'general' | 'statements' | 'measures' | 'effects' | 'feedback') => {
		scenarioTab.value = val;
	}
});
const mspProvider = useMspDataProvider();
const routeProjectId = computed(() => {
	const value = route.query.projectId;
	return typeof value === 'string' && value.trim() ? value.trim() : undefined;
});
const resolvedProjectId = computed(() => projectStore.currentProject?.id ?? routeProjectId.value);

const isLoading = ref(true);
const isSaving = ref(false);
const deleteDialogOpen = ref(false);
const deleteScenarioNameInput = ref('');
const isDeletingScenario = ref(false);
const showConflictToast = ref(false);
const latestScenarioSnapshot = ref<any | null>(null);
let isPersistingScenario = false;

const viewMode = ref<ViewModeType>('tab-view');
const selectedStatement = ref<Statement | null>(null);
const selectedMeasure = ref<DomainMeasure | null>(null); // Aggiunto ref mancante
const selectedFeedback = ref<Feedback | null>(null);

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
const syncSelectedScenarioInList = () => {
	if (!selectedScenario.value) return;
	const index = scenarios.value.findIndex((item) => item.id === selectedScenario.value!.id);
	if (index >= 0) {
		scenarios.value[index] = selectedScenario.value;
		return;
	}
	scenarios.value.unshift(selectedScenario.value);
};

const persistSelectedScenarioNow = async () => {
	if (!selectedScenario.value || isLoading.value) return;
	syncSelectedScenarioInList();
	scheduleScenarioPersist.cancel();
	queueScenarioPersist(JSON.parse(JSON.stringify(selectedScenario.value)));
	await flushScenarioPersistQueue();
};

const handleSaveStatement = async (formData: Partial<Statement>) => {
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
	await persistSelectedScenarioNow();
};


const handleEditStatement = (statement: Statement) => {
	viewMode.value = 'edit';
	selectedStatement.value = statement;
};

const handleDeleteStatement = async (statementId: string) => {
	if (!selectedScenario.value?.statements) return;
	selectedScenario.value.statements = selectedScenario.value.statements.filter(s => s.id !== statementId);
	await persistSelectedScenarioNow();
};
///logica Measures/Aspects
const handleNewMeasure = (type: MeasureType) => {
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
			type: 'Non-spatial',
			id: '',
			description: '',
			name: '',
		} as DomainMeasure;

};
const handleEditMeasure = (measure: DomainMeasure) => {
	viewMode.value = 'edit';
	selectedMeasure.value = measure;
};
const handleSaveAspect = async (formData: Partial<DomainMeasure>) => {
	if (!selectedScenario.value) return;
	if (!selectedScenario.value.domainMeasures) selectedScenario.value.domainMeasures = [];

	if (selectedMeasure.value?.id) {
		const index = selectedScenario.value.domainMeasures.findIndex(m => m.id === selectedMeasure.value!.id);
		if (index !== -1) {
			selectedScenario.value.domainMeasures[index] = { ...selectedMeasure.value, ...formData } as DomainMeasure;
		}
	} else {
		selectedScenario.value.domainMeasures.push({
			...formData,
			id: generateUUID(),
		} as DomainMeasure);
	}
	viewMode.value = 'tab-view';
	selectedMeasure.value = null;
	await persistSelectedScenarioNow();
};
const handleCloneMeasure = (measure: DomainMeasure) => {
	const { id, ...clonedMeasureData } = measure;
	selectedMeasure.value = { ...clonedMeasureData, id: '' }; // Reset id for new measure
	viewMode.value = 'edit';
};
const handleDeleteMeasure = async (measure: DomainMeasure) => {
	if (!selectedScenario.value?.domainMeasures) return;
	selectedScenario.value.domainMeasures = selectedScenario.value.domainMeasures
		.filter(m => m.id !== measure.id);
	await persistSelectedScenarioNow();
};


//logica Effects 
const selectedEffect = ref<DomainEffect | null>(null);
const initEffectData = ref<EffectInitProp>({
	effect: {} as DomainEffect,
	type: "Non-spatial"
});



// helper: inferisce tipo effetto dal primo affected, se non lo trova restituisce "Non-spatial" come fallback (scelta più sicura in caso di dati incompleti)	
function effectType(effect: DomainEffect): MeasureType {
	const first = effect.affected?.[0];
	return first?.type === "Spatial" ? "Spatial" : "Non-spatial";
}


const handleNewEffect = (type: MeasureType) => {
	viewMode.value = "edit";	
	initEffectData.value = type === "Spatial" ? {
		effect: {
			id: "",
			name: "",
			description: "",
			affected: [] as Measure[],
		} as Effect<Measure>,
		type: "Spatial"
	} : {
		effect: {
				id: "",
				name: "",
				description: "",
				affected: [] as Aspect[],
			} as Effect<Aspect>,
		type: "Non-spatial"
	};
	selectedEffect.value = initEffectData.value.effect as DomainEffect;

};

const handleEditEffect = (effect: DomainEffect) => {
	viewMode.value = "edit";
	initEffectData.value = {
		effect,
		type: effectType(effect)
	};
	selectedEffect.value = effect;
};

const handleSaveEffect = async (formData: Partial<DomainEffect>) => {
	if (!selectedScenario.value) return;
	if (!selectedScenario.value.domainEffects) {selectedScenario.value.domainEffects = [];}

	if (selectedEffect.value?.id) {
		const idx = selectedScenario.value.domainEffects.findIndex((e) => e.id === selectedEffect.value!.id);
		if (idx !== -1) {
			selectedScenario.value.domainEffects[idx] = {
				...selectedEffect.value,
				...formData,
			} as DomainEffect;
		}
	} else {
		selectedScenario.value.domainEffects.push({
			...selectedEffect.value,
			...formData,
			id: generateUUID(),
		} as DomainEffect);
	}

	viewMode.value = "tab-view";
	selectedEffect.value = null;
	await persistSelectedScenarioNow();
};

const handleDeleteEffect = async (effect: DomainEffect) => {
	if (!selectedScenario.value?.domainEffects) return;
	selectedScenario.value.domainEffects = selectedScenario.value.domainEffects.filter((e) => e.id !== effect.id);
	await persistSelectedScenarioNow();
};
const handleCloneEffect = (effect: DomainEffect) => {
	const { id, ...rest } = effect;
	console.log("Clonazione effetto:", effect.name);
	initEffectData.value = {
		effect: { ...rest, id: "" } as DomainEffect,
		type: effectType(effect)
	};
	selectedEffect.value = initEffectData.value.effect as DomainEffect;
	viewMode.value = "edit";
};

// --- LOGICA FEEDBACK ---
const handleNewFeedback = () => {
	viewMode.value = 'edit';
	selectedFeedback.value = {
		id: '',
		author: '',
		comment: '',
		rating: 3,
		createdAt: new Date(),
		status: 'new',
	} as Feedback;
};

const handleEditFeedback = (feedback: Feedback) => {
	viewMode.value = 'edit';
	selectedFeedback.value = feedback;
};

const handleCloneFeedback = (feedback: Feedback) => {
	viewMode.value = 'edit';
	selectedFeedback.value = {
		...feedback,
		id: '',
		createdAt: new Date(),
		updatedAt: undefined,
	} as Feedback;
};

const handleSaveFeedback = async (formData: Partial<Feedback>) => {
	if (!selectedScenario.value) return;
	if (!selectedScenario.value.feedbacks) selectedScenario.value.feedbacks = [];

	if (selectedFeedback.value?.id) {
		const index = selectedScenario.value.feedbacks.findIndex((f) => f.id === selectedFeedback.value!.id);
		if (index !== -1) {
			selectedScenario.value.feedbacks[index] = {
				...selectedScenario.value.feedbacks[index],
				...formData,
			} as Feedback;
		}
	} else {
		selectedScenario.value.feedbacks.push({
			...formData,
			id: generateUUID(),
		} as Feedback);
	}

	viewMode.value = 'tab-view';
	selectedFeedback.value = null;
	await persistSelectedScenarioNow();
};

const handleDeleteFeedback = async (feedback: Feedback) => {
	if (!selectedScenario.value?.feedbacks) return;
	selectedScenario.value.feedbacks = selectedScenario.value.feedbacks.filter((f) => f.id !== feedback.id);
	await persistSelectedScenarioNow();
};





onMounted(async () => {
	const scenarioId = route.params.pk as string;
	try {
		if (routeProjectId.value) {
			await scenarioStore.fetchProjectScenarios(routeProjectId.value);
		} else {
			await scenarioStore.fetchProjectScenarios();
		}
		await scenarioStore.fetchScenarioMock(scenarioId);
	} catch (error) {
		console.warn('Scenario non trovato sul backend, uso fallback locale:', error);
		const localScenario = scenarios.value.find((item) => item.id === scenarioId) || null;
		if (localScenario) {
			scenarioStore.setScenarioToEdit(localScenario);
		}
	} finally {
		isLoading.value = false;
	}
});

const persistScenario = async (scenarioSnapshot: any) => {
	try {
		if (!resolvedProjectId.value) {
			console.error('Impossibile salvare lo scenario: projectId mancante.');
			return;
		}
		isSaving.value = true;
		isPersistingScenario = true;
		await mspProvider.updateScenario(
			scenarioSnapshot,
			resolvedProjectId.value,
			projectStore.currentProject?.updatedAt,
		);
		await projectStore.refreshProject(resolvedProjectId.value);
	} catch (error) {
		if (projectStore.registerConflict(error)) {
			showConflictToast.value = true;
			return;
		}
		console.error('Errore salvataggio scenario su layer persistente:', error);
	} finally {
		isPersistingScenario = false;
		isSaving.value = false;
	}
};

const flushScenarioPersistQueue = async () => {
	if (isPersistingScenario) return;
	if (!latestScenarioSnapshot.value) return;
	const snapshot = latestScenarioSnapshot.value;
	latestScenarioSnapshot.value = null;
	await persistScenario(snapshot);
	if (latestScenarioSnapshot.value) {
		await flushScenarioPersistQueue();
	}
};

const scheduleScenarioPersist = debounce(() => {
	void flushScenarioPersistQueue();
}, 1000);

const queueScenarioPersist = (scenarioSnapshot: any) => {
	latestScenarioSnapshot.value = scenarioSnapshot;
	scheduleScenarioPersist();
};

const expectedScenarioName = computed(() => selectedScenario.value?.name?.trim() ?? '');
const canConfirmScenarioDeletion = computed(() => {
	return expectedScenarioName.value.length > 0
		&& deleteScenarioNameInput.value.trim() === expectedScenarioName.value;
});

const openDeleteScenarioDialog = () => {
	deleteScenarioNameInput.value = '';
	deleteDialogOpen.value = true;
};

const closeDeleteScenarioDialog = () => {
	deleteDialogOpen.value = false;
	deleteScenarioNameInput.value = '';
};

const handleDeleteScenario = async () => {
	if (!selectedScenario.value) return;
	if (!resolvedProjectId.value) {
		console.error('Impossibile cancellare lo scenario: projectId mancante.');
		return;
	}
	const scenarioId = selectedScenario.value.id;
	if (!canConfirmScenarioDeletion.value) return;

	try {
		isDeletingScenario.value = true;
		scheduleScenarioPersist.cancel();
		latestScenarioSnapshot.value = null;
		await mspProvider.deleteScenario(
			scenarioId,
			resolvedProjectId.value,
			projectStore.currentProject?.updatedAt,
		);
		scenarios.value = scenarios.value.filter((item) => item.id !== scenarioId);
		scenarioStore.clearSelectedScenario();
		closeDeleteScenarioDialog();

		const nextScenario = scenarios.value[0];
		if (nextScenario) {
			await router.push(`/scenarios/${nextScenario.id}`);
			return;
		}

		const areaId = scenarioStore.currentProject?.areaOfInterest?.id;
		if (areaId) {
			await router.push(`/areas/${areaId}`);
			return;
		}
		await router.push('/');
	} catch (error) {
		if (projectStore.registerConflict(error)) {
			showConflictToast.value = true;
			return;
		}
		console.error('Errore durante la cancellazione dello scenario:', error);
	} finally {
		isDeletingScenario.value = false;
	}
};

const reloadProjectAfterConflict = async () => {
	try {
		if (!resolvedProjectId.value) {
			console.error('Impossibile ricaricare il progetto: projectId mancante.');
			return;
		}
		await projectStore.refreshProject(resolvedProjectId.value);
		await scenarioStore.fetchProjectScenarios(resolvedProjectId.value);
		projectStore.clearConflict();
		showConflictToast.value = false;
	} catch (error) {
		console.error('Errore durante il refresh dopo conflitto:', error);
	}
};

watch(
	selectedScenario,
	(newScenario) => {
		if (!newScenario || isLoading.value) return;
		queueScenarioPersist(JSON.parse(JSON.stringify(newScenario)));
	},
	{ deep: true },
);

onBeforeUnmount(() => {
	scheduleScenarioPersist.cancel();
	void flushScenarioPersistQueue();
});

onBeforeRouteLeave(async () => {
	scheduleScenarioPersist.cancel();
	await flushScenarioPersistQueue();
});


</script>

<template>
	<v-container fluid class="main-scenario-container">
		<v-snackbar v-model="showConflictToast" color="warning" timeout="-1">
			{{ projectStore.conflictMessage || 'Conflitto di aggiornamento rilevato.' }}
			<template #actions>
				<v-btn variant="text" @click="reloadProjectAfterConflict">Ricarica</v-btn>
				<v-btn variant="text" @click="showConflictToast = false">Chiudi</v-btn>
			</template>
		</v-snackbar>

		<v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>

		<!-- Utilizziamo selectedScenario dallo store -->
		<div v-if="viewMode === 'tab-view' && selectedScenario">
			<div class="scenario-tabs-header">
				<v-tabs v-model="tab" color="primary" class="scenario-tabs">
					<v-tab value="general">Generale</v-tab>
					<v-tab value="statements">Statements</v-tab>
					<v-tab value="measures">Misure</v-tab>
					<v-tab value="effects">Effetti</v-tab>
					<v-tab value="feedback">Commenti</v-tab>
				</v-tabs>
				<v-btn
					icon="mdi-trash-can-outline"
					variant="text"
					color="error"
					size="large"
					aria-label="Cancella scenario"
					@click="openDeleteScenarioDialog"
				/>
			</div>

			<div class="scenario-window">
				<v-window v-model="tab">
					<v-window-item value="general" :transition="false" :reverse-transition="false">
						<scenario-general-form />
					</v-window-item>

					<v-window-item value="statements" :transition="false" :reverse-transition="false">
						<scenario-statements :statements="selectedScenario.statements || []" v-if="hasStatements"
							@edit:statement="handleEditStatement" @delete:statement="handleDeleteStatement" />
						<p v-else class="pa-4">Nessun statements disponibile.</p>
					</v-window-item>

					<v-window-item value="measures" :transition="false" :reverse-transition="false">
						<scenario-domain-measures :domain-measures="selectedScenario.domainMeasures || []"
							@edit:measure="handleEditMeasure" @delete:measure="handleDeleteMeasure"
							@clone:measure="handleCloneMeasure" />
					</v-window-item>

					<v-window-item value="effects" :transition="false" :reverse-transition="false">
						<scenario-domain-effects :domain-effects="selectedScenario.domainEffects || []"
							@edit:effect="handleEditEffect" @delete:effect="handleDeleteEffect"
							@clone:effect="handleCloneEffect" />
					</v-window-item>

					<v-window-item value="feedback" :transition="false" :reverse-transition="false">
						<scenario-feedbacks :feedbacks="selectedScenario.feedbacks || []"
							@edit:feedback="handleEditFeedback" @clone:feedback="handleCloneFeedback"
							@delete:feedback="handleDeleteFeedback" />
					</v-window-item>
				</v-window>
			</div>
		</div>

		<!-- Forms di editing -->
		<scenario-statement-form v-if="viewMode === 'edit' && tab === 'statements' && selectedStatement"
			:initial-data="selectedStatement" @save="handleSaveStatement" @cancel="viewMode = 'tab-view'" />
		<scenario-aspect-form v-if="viewMode === 'edit' && tab === 'measures' && selectedMeasure"
			:initial-data="selectedMeasure" @save="handleSaveAspect" @cancel="viewMode = 'tab-view'" />
		<scenario-effect-editor v-if="viewMode === 'edit' && tab === 'effects' && selectedEffect"
			:initial-data="initEffectData" @save="handleSaveEffect" @cancel="viewMode = 'tab-view'" />
		<scenario-feedback-editor v-if="viewMode === 'edit' && tab === 'feedback' && selectedFeedback"
			:initial-data="selectedFeedback" @save="handleSaveFeedback" @cancel="viewMode = 'tab-view'" />

		<!-- FABs -->
		<div class="fab-speed-dial-container" v-if="viewMode === 'tab-view' && tab !== 'general'">
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
				<v-btn key="1" color="secondary" @click="handleNewMeasure('Non-spatial')">Non-spatial</v-btn>
				<v-btn key="2" color="surface-variant" @click="handleNewMeasure('Spatial')">Spatial</v-btn>
			</v-speed-dial>

			<v-speed-dial v-if="tab === 'effects'" location="top right" transition="scale-transition">
				<template v-slot:activator="{ props }">
					<v-btn v-bind="props" color="primary" icon="mdi-plus" size="large"></v-btn>
				</template>
				<v-btn key="1" color="secondary" @click="handleNewEffect('Non-spatial')">Non-spatial</v-btn>
				<v-btn key="2" color="surface-variant" @click="handleNewEffect('Spatial')">Spatial</v-btn>
			</v-speed-dial>

			<v-btn v-if="tab === 'feedback'" color="primary" icon="mdi-plus" size="large" @click="handleNewFeedback" />
		</div>
		<v-dialog v-model="deleteDialogOpen" max-width="520">
			<v-card>
				<v-card-title class="text-h6">Conferma cancellazione scenario</v-card-title>
				<v-card-text>
					<div class="mb-3">
						Per confermare, digita il nome dello scenario:
						<strong>{{ expectedScenarioName }}</strong>
					</div>
					<v-text-field
						v-model="deleteScenarioNameInput"
						label="Nome scenario"
						variant="outlined"
						hide-details="auto"
						:disabled="isDeletingScenario"
					/>
				</v-card-text>
				<v-card-actions>
					<v-spacer />
					<v-btn variant="text" :disabled="isDeletingScenario" @click="closeDeleteScenarioDialog">Annulla</v-btn>
					<v-btn
						color="error"
						variant="flat"
						:disabled="!canConfirmScenarioDeletion || isDeletingScenario"
						:loading="isDeletingScenario"
						@click="handleDeleteScenario"
					>
						Cancella
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
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

.scenario-tabs-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 8px;
}

.scenario-tabs {
	flex: 1;
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
