<script setup lang="ts">
import StatementList from './StatementList.vue';
import StatementForm from './StatementForm.vue';
import type { AreaOfInterest, Statement } from '#/shared/types/msp-project';
import { generateUUID } from '#/shared/utils/generateUUID';
import { debounce } from 'lodash-es';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import GeonodeMapList from './GeonodeMapList.vue';
import FormLayout from '#/app/components/layouts/FormLayout.vue';

const props = withDefaults(defineProps<{
	initialArea?: AreaOfInterest | null;
	projectId?: string;
	loading?: boolean;
}>(), {
	initialArea: null,
	projectId: '',
	loading: false,
});

const mspDataProvider = useMspDataProvider();
const projectStore = useProjectStore();

const activeTab = ref<'general' | 'statements' | 'map'>('general');
const isHydrating = ref(true);
const isSaving = ref(false);
const area = ref<AreaOfInterest | null>(null);

const statementView = ref<'list' | 'form'>('list');
const editedStatement = ref<Statement | null>(null);

const showToast = ref(false);
const toastColor = ref<'success' | 'error'>('success');
const toastMessage = ref('');

const hasArea = computed(() => Boolean(area.value));
const isBusy = computed(() => props.loading || isHydrating.value);
const canPersist = computed(() => Boolean(props.projectId) && hasArea.value);
const latestQueuedPayload = ref<AreaOfInterest | null>(null);
let isPersisting = false;
const missingDataMessage = computed(() => {
	if (props.loading) return '';
	if (!props.projectId) return 'Il progetto non è definito.';
	return 'Non ci sono aree di interesse associate al progetto selezionato.';
});

const notify = (message: string, color: 'success' | 'error' = 'success') => {
	toastMessage.value = message;
	toastColor.value = color;
	showToast.value = true;
};

const cloneArea = (value: AreaOfInterest | null): AreaOfInterest | null => {
	if (!value) return null;
	try {
		return structuredClone(value);
	} catch {
		return {
			...value,
			statements: Array.isArray(value.statements) ? [...value.statements] : [],
			scenarios: Array.isArray(value.scenarios) ? [...value.scenarios] : [],
			others: value.others instanceof Map ? new Map(value.others) : new Map(),
		};
	}
};

watch(
	() => props.initialArea,
	async (value) => {
		isHydrating.value = true;
		area.value = cloneArea(value);
		await nextTick();
		isHydrating.value = false;
	},
	{ immediate: true },
);

const persistArea = async (payload: AreaOfInterest) => {
	if (!props.projectId) return;
	isSaving.value = true;
	isPersisting = true;
	try {
		const updatedProject = await mspDataProvider.updateArea(
			payload,
			props.projectId,
			projectStore.currentProject?.updatedAt,
		);
		projectStore.setCurrentProject(updatedProject);
	} catch (error) {
		if (projectStore.registerConflict(error)) {
			notify(projectStore.conflictMessage || 'Conflitto di aggiornamento rilevato. Ricarica il progetto.', 'error');
			return;
		}
		console.error('Errore durante il salvataggio area:', error);
		notify('Errore durante il salvataggio automatico', 'error');
	} finally {
		isPersisting = false;
		isSaving.value = false;
	}
};

const flushPersistQueue = async () => {
	if (isPersisting) return;
	if (!latestQueuedPayload.value || !canPersist.value) return;
	const payload = latestQueuedPayload.value;
	latestQueuedPayload.value = null;
	await persistArea(payload);
	if (latestQueuedPayload.value) {
		await flushPersistQueue();
	}
};

const schedulePersist = debounce(() => {
	void flushPersistQueue();
}, 1000);

const queuePersist = (payload: AreaOfInterest) => {
	latestQueuedPayload.value = payload;
	schedulePersist();
};

watch(
	area,
	(value) => {
		if (!value || !canPersist.value || isHydrating.value || props.loading) return;
		const safe = cloneArea(value);
		if (!safe) return;
		queuePersist(safe);
	},
	{ deep: true },
);

onBeforeUnmount(() => {
	schedulePersist.cancel();
	void flushPersistQueue();
});

const openNewStatement = (type: 'General' | 'Sector-specific') => {
	editedStatement.value = {
		id: '',
		shortName: '',
		longName: '',
		description: '',
		sectorThemes: type === 'Sector-specific' ? [] : undefined,
	} as Statement;
	statementView.value = 'form';
};

const editStatement = (statement: Statement) => {
	editedStatement.value = { ...statement };
	statementView.value = 'form';
};

const deleteStatement = (id: string) => {
	if (!area.value) return;
	const current = area.value.statements || [];
	area.value.statements = current.filter((item) => item.id !== id);
	notify('Statement eliminato');
};

const saveStatement = (payload: Partial<Statement>) => {
	if (!area.value) return;
	const statements = area.value.statements || [];

	if (editedStatement.value?.id) {
		const idx = statements.findIndex((item) => item.id === editedStatement.value!.id);
		if (idx >= 0) {
			statements[idx] = { ...statements[idx], ...payload } as Statement;
			notify('Statement aggiornato');
		}
	} else {
		statements.push({ ...payload, id: generateUUID() } as Statement);
		notify('Statement aggiunto');
	}

	area.value.statements = statements;
	editedStatement.value = null;
	statementView.value = 'list';
};

const cancelStatement = () => {
	editedStatement.value = null;
	statementView.value = 'list';
};
</script>

<template>
	<div class="container-panel">
		<v-progress-linear v-if="isBusy" indeterminate color="primary" />

		<v-snackbar v-model="showToast" :color="toastColor" timeout="3000">
			{{ toastMessage }}
		</v-snackbar>

		<v-fade-transition>
			<div v-if="isSaving" class="saving-indicator">
				<v-progress-circular indeterminate size="16" width="2" class="mr-2" />
				Salvataggio in corso...
			</div>
		</v-fade-transition>

		<v-alert
			v-if="!isBusy && !hasArea"
			type="warning"
			variant="tonal"
			icon="mdi-alert-circle-outline"
			prominent
		>
			{{ missingDataMessage }}
		</v-alert>

		<StatementForm
			v-if="statementView === 'form'"
			:initial-data="editedStatement || {}"
			@save="saveStatement"
			@cancel="cancelStatement"
		/>

		<div v-else-if="hasArea" class="content-shell">
			<v-tabs v-model="activeTab" color="primary" class="tab-style">
				<v-tab value="general">Generale</v-tab>
				<v-tab value="statements">Statements</v-tab>
				<v-tab value="map">Mappa</v-tab>
			</v-tabs>

			<v-window v-model="activeTab" class="area-form-window">
				<v-window-item value="general">
					<FormLayout :loading="isSaving" >
						<v-form class="pt-1">
							<v-row>
								<v-col cols="12" md="6">
									<v-text-field v-model="area!.name" label="Nome Area" variant="outlined" clearable />
								</v-col>
								<v-col cols="12" md="6">
									<v-text-field v-model="area!.longName" label="Nome Completo Area" variant="outlined" clearable />
								</v-col>
							</v-row>

							<v-row>
								<v-col cols="12" md="6">
									<v-text-field v-model="area!.temporalScope" label="Orizzonte temporale" variant="outlined" clearable />
								</v-col>
								<v-col cols="12" md="6">
									<v-text-field v-model="area!.filterCQL" label="Filtro CQL" variant="outlined" clearable />
								</v-col>
							</v-row>

							<v-row>
								<v-col cols="12">
									<v-textarea v-model="area!.description" label="Descrizione" variant="outlined" rows="4" clearable />
								</v-col>
							</v-row>
						</v-form>
					</FormLayout>
				</v-window-item>

				<v-window-item value="statements">
					<StatementList
						v-if="area?.statements?.length"
						:statements="area.statements"
						@edit:statement="editStatement"
						@delete:statement="deleteStatement"
						class="pa-4"
					/>
					<p v-else class="pa-4">Nessun statements disponibile.</p>
				</v-window-item>

				<v-window-item value="map">
					<GeonodeMapList v-model="area!.associatedMap" />
				</v-window-item>
			</v-window>
		</div>

		<div v-if="activeTab === 'statements' && statementView === 'list' && hasArea" class="fab-container">
			<v-speed-dial location="top left" transition="scale-transition">
				<template #activator="{ props: activatorProps }">
					<v-btn v-bind="activatorProps" color="primary" icon="mdi-plus" size="large" elevation="4" />
				</template>

				<v-btn key="1" color="secondary" prepend-icon="mdi-tag-multiple" @click="openNewStatement('Sector-specific')">
					Sector-specific
				</v-btn>

				<v-btn key="2" color="surface-variant" prepend-icon="mdi-earth" @click="openNewStatement('General')">
					General
				</v-btn>
			</v-speed-dial>
		</div>
	</div>
</template>

<style scoped lang="scss">
.container-panel {
	position: relative;
	background-color: transparent;
	width: 100%;
	height: 100%;
	max-height: 100%;
	min-width: 0;
	min-height: 0;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.content-shell {
	display: flex;
	flex-direction: column;
	flex: 1 1 auto;
	min-height: 0;
	min-width: 0;
}

.saving-indicator {
	position: absolute;
	top: 10px;
	right: 20px;
	z-index: 10;
	display: flex;
	align-items: center;
}

.area-form-window {
	width: 100%;
	max-width: 100%;
	min-width: 0;
	flex: 1 1 auto;
	min-height: 0;
	margin-top: 12px;
	padding: 0;
	box-sizing: border-box;
	/* Ridimensionamento responsivo in base alla larghezza disponibile */
	//max-height: clamp(340px, 62vw, 72dvh);
	display: flex;
	flex-direction: column;
}

:deep(.v-window__container) {
	height: 100%;
	min-height: 0;
}

:deep(.v-window-item) {
	height: 100%;
	max-height: 100%;
	overflow-y: auto;
	overflow-x: hidden;
	//scrollbar-gutter: stable;
}

.tab-style {
	background-color: #fef7ff;
	flex: 0 0 auto;
}

.fab-container {
	position: absolute;
	bottom: 30px;
	right: 30px;
	z-index: 100;
	display: flex;
	flex-direction: column;
	align-items: center;
}

:deep(.v-speed-dial__content) {
	gap: 10px;
}
</style>
