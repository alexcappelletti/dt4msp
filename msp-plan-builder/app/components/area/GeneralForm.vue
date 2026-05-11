<script setup lang="ts">
import StatementList from './StatementList.vue';
import StatementForm from './StatementForm.vue';
import type { AreaOfInterest, Statement } from '#/shared/types/msp-project';
import { generateUUID } from '#/shared/utils/generateUUID';
import { debounce } from 'lodash-es';
import { computed, nextTick, ref, watch } from 'vue';

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
		isSaving.value = false;
	}
};

const debouncedPersist = debounce((payload: AreaOfInterest) => {
	void persistArea(payload);
}, 500);

watch(
	area,
	(value) => {
		if (!value || !canPersist.value || isHydrating.value || props.loading) return;
		const safe = cloneArea(value);
		if (!safe) return;
		debouncedPersist(safe);
	},
	{ deep: true },
);

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

		<div v-else-if="hasArea">
			<v-tabs v-model="activeTab" color="primary" class="tab-style">
				<v-tab value="general">Generale</v-tab>
				<v-tab value="statements">Statements</v-tab>
				<v-tab value="map">Mappa</v-tab>
			</v-tabs>

			<v-window v-model="activeTab" class="ma-2 mt-4 area-form-window">
				<v-window-item value="general">
					<v-form class="pt-2">
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
					<geonode-layers />
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
	background-color: #fff;
	width: 100%;
	min-height: 100%;
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
	height: calc(100vh - 200px);
	overflow: hidden;
	display: flex;
	flex-direction: column;
}

:deep(.v-window-item) {
	height: 100%;
	overflow-y: auto;
}

.tab-style {
	background-color: #fef7ff;
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
