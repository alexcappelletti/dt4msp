<script setup lang="ts">
import StatementList from './StatementList.vue';
import StatementForm from './StatementForm.vue';
import type {
	AreaOfInterest,
	DomainMeasure,
	GeonodeMapReference,
	MapLayer,
	Scenario,
	Statement,
} from '#/shared/types/msp-project';
import type { GeonodeMap } from '#/shared/types/geonodeTypes';
import { generateUUID } from '#/shared/utils/generateUUID';
import { debounce } from 'lodash-es';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import MapChooser from './MapChooser.vue';
import MapEmbedPreview from './MapEmbedPreview.vue';
import GeonodeMapDetailsPanel from './GeonodeMapDetailsPanel.vue';
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
const tabsStore = useTabsStore();
const spatialStore = useSpatialResourceStore();
const { areaTab: activeTab } = storeToRefs(tabsStore);
const isHydrating = ref(true);
const isSaving = ref(false);
const area = ref<AreaOfInterest | null>(null);

const statementView = ref<'list' | 'form' | 'link-map'>('list');
const editedStatement = ref<Statement | null>(null);
const activeMap = ref<GeonodeMap | null>(null);
const editingMap = ref<boolean>(false);
const mapChooserKey = ref(0);

const showToast = ref(false);
const toastColor = ref<'success' | 'error'>('success');
const toastMessage = ref('');
const isValidatingMapAssociation = ref(false);
const pendingAssociatedMap = ref<GeonodeMapReference | null>(null);
const missingLayerDependencies = ref<MissingLayerDependency[]>([]);

const hasArea = computed(() => Boolean(area.value));
const isBusy = computed(() => props.loading || isHydrating.value);
const canPersist = computed(() => Boolean(props.projectId) && hasArea.value);
const hasAssociatedMapReference = computed(() =>
	Boolean(String(area.value?.associatedMap?.pk || '').trim()),
);
const areaAssociatedMap = computed(() => {
	const associatedPk = String(area.value?.associatedMap?.pk || '').trim();
	if (!associatedPk) return null;
	return spatialStore.availableMaps.find((item) => String(item.pk) === associatedPk) || null;
});
const isLoadingAssociatedMap = computed(() =>
	hasAssociatedMapReference.value
	&& !areaAssociatedMap.value
	&& spatialStore.busy,
);
const mapAssociationButtonLabel = computed(() =>
	hasAssociatedMapReference.value ? 'Associa una mappa differente' : 'Associa una mappa',
);
const hasInconsistencies = computed(() => missingLayerDependencies.value.length > 0);
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

interface LayerUsageItem {
	id: string;
	name: string;
	scenarioId: string;
	scenarioName: string;
}

interface MissingLayerDependency {
	key: string;
	label: string;
	measures: LayerUsageItem[];
	effects: LayerUsageItem[];
}

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

const openMapsBrowser = () => {
	editingMap.value = true;
	statementView.value = "link-map";
};

const closeMapsBrowser = () => {
	editingMap.value = false;
	statementView.value = "list";
	closeMapDetails();
};

const closeMapDetails = () => {
	activeMap.value = null;
};

const resourceCandidates = (resource: Partial<MapLayer> | null | undefined): string[] => {
	if (!resource) return [];

	return [
		resource.id,
		resource.pk as string | undefined,
		resource.datasetPk as string | undefined,
		resource.name as string | undefined,
		resource.title as string | undefined,
	]
		.map((value) => String(value || '').trim())
		.filter(Boolean);
};

const isDefinedDatasetResource = (resource: Partial<MapLayer> | null | undefined): boolean =>
	resourceCandidates(resource).length > 0;

const resourceLabel = (resource: Partial<MapLayer> | null | undefined): string =>
	String(
		resource?.title
		?? resource?.name
		?? resource?.id
		?? resource?.pk
		?? resource?.datasetPk
		?? 'Layer senza nome',
	).trim() || 'Layer senza nome';

const getMeasureResources = (measure: DomainMeasure | null | undefined): MapLayer[] => {
	if (!measure) return [];
	if (measure.type !== 'Spatial') return [];
	const resources = (measure as DomainMeasure & { geospatialResources?: MapLayer[] }).geospatialResources;
	return Array.isArray(resources) ? resources : [];
};

const isLayerAvailable = (resource: MapLayer, availableKeys: Set<string>) =>
	resourceCandidates(resource).some((candidate) => availableKeys.has(candidate));

const addLayerUsage = (
	target: MissingLayerDependency[],
	resource: MapLayer,
	usageType: 'measure' | 'effect',
	item: LayerUsageItem,
) => {
	const key = resourceCandidates(resource)[0] || resourceLabel(resource);
	let dependency = target.find((entry) => entry.key === key);
	if (!dependency) {
		dependency = {
			key,
			label: resourceLabel(resource),
			measures: [],
			effects: [],
		};
		target.push(dependency);
	}

	const usageList = usageType === 'measure' ? dependency.measures : dependency.effects;
	if (!usageList.some((entry) => entry.id === item.id && entry.scenarioId === item.scenarioId)) {
		usageList.push(item);
	}
};

const getScenariosForValidation = (): Scenario[] => {
	const fromArea = area.value?.scenarios;
	if (Array.isArray(fromArea) && fromArea.length > 0) return fromArea;

	const fromProjectArea = projectStore.currentProject?.areaOfInterest?.scenarios;
	if (Array.isArray(fromProjectArea) && fromProjectArea.length > 0) return fromProjectArea;

	return Array.isArray(projectStore.currentProject?.scenarios)
		? projectStore.currentProject.scenarios
		: [];
};

const buildMissingLayerDependencies = (availableLayers: MapLayer[]): MissingLayerDependency[] => {
	const availableKeys = new Set(
		availableLayers.flatMap((resource) => resourceCandidates(resource)),
	);
	const dependencies: MissingLayerDependency[] = [];

	for (const scenario of getScenariosForValidation()) {
		for (const measure of scenario.domainMeasures ?? []) {
			for (const resource of getMeasureResources(measure)) {
				if (!isDefinedDatasetResource(resource)) continue;
				if (isLayerAvailable(resource, availableKeys)) continue;
				addLayerUsage(dependencies, resource, 'measure', {
					id: measure.id,
					name: measure.name || measure.longName || measure.id,
					scenarioId: scenario.id,
					scenarioName: scenario.name || scenario.id,
				});
			}
		}

		for (const effect of scenario.domainEffects ?? []) {
			const effectResources = new Map<string, MapLayer>();
			for (const measure of effect.affected ?? []) {
				for (const resource of getMeasureResources(measure)) {
					if (!isDefinedDatasetResource(resource)) continue;
					const key = resourceCandidates(resource)[0] || resourceLabel(resource);
					if (!key) continue;
					effectResources.set(key, resource);
				}
			}

			for (const resource of effectResources.values()) {
				if (isLayerAvailable(resource, availableKeys)) continue;
				addLayerUsage(dependencies, resource, 'effect', {
					id: effect.id,
					name: effect.name || effect.id,
					scenarioId: scenario.id,
					scenarioName: scenario.name || scenario.id,
				});
			}
		}
	}

	return dependencies.sort((left, right) => left.label.localeCompare(right.label, 'it-IT'));
};

const fetchAvailableLayersForMap = async (mapPk: string): Promise<MapLayer[]> => {
	const [specificResult, generalResult] = await Promise.allSettled([
		$fetch<Array<{ pk: string; title: string }>>('/api/geonode/map-datasets', {
			method: 'GET',
			query: { mapId: mapPk },
		}),
		$fetch<Array<{ pk: string; title: string }>>('/api/geonode/datasets', {
			method: 'GET',
		}),
	]);

	const allLayers: Array<{ pk: string; title: string }> = [];
	if (specificResult.status === 'fulfilled') {
		allLayers.push(...specificResult.value);
	}
	if (generalResult.status === 'fulfilled') {
		allLayers.push(...generalResult.value);
	}

	if (allLayers.length === 0) {
		const firstError = specificResult.status === 'rejected'
			? specificResult.reason
			: (generalResult.status === 'rejected' ? generalResult.reason : null);
		throw firstError ?? new Error('Impossibile recuperare i layer della mappa selezionata.');
	}

	const uniqueLayers = new Map<string, MapLayer>();
	for (const layer of allLayers) {
		const key = String(layer.pk || '').trim();
		if (!key || uniqueLayers.has(key)) continue;
		uniqueLayers.set(key, {
			id: key,
			pk: key,
			name: layer.title,
			title: layer.title,
		});
	}

	return [...uniqueLayers.values()];
};

const mapToReference = (map: GeonodeMap): GeonodeMapReference => ({
	pk: map.pk,
	title: map.title,
	detailUrl: map.detail_url,
	thumbnailUrl: map.thumbnail_url,
});

const applyAssociatedMap = (mapReference: GeonodeMapReference) => {
	if (!area.value) return;
	area.value.associatedMap = mapReference;
};

const clearMapInconsistencies = () => {
	pendingAssociatedMap.value = null;
	missingLayerDependencies.value = [];
	mapChooserKey.value += 1;
};

const cancelPendingMapAssociation = () => {
	clearMapInconsistencies();
	activeTab.value = 'map';
	notify('Sostituzione mappa annullata');
};

const confirmPendingMapAssociation = () => {
	if (!pendingAssociatedMap.value) return;
	applyAssociatedMap(pendingAssociatedMap.value);
	clearMapInconsistencies();
	activeTab.value = 'map';
	notify('Mappa associata all\'area');
};

const validateAndAssociateMap = async (nextMap: GeonodeMapReference | null) => {
	if (!area.value || !nextMap) return;
	if (String(area.value.associatedMap?.pk || '') === String(nextMap.pk)) {
		applyAssociatedMap(nextMap);
		return;
	}

	isValidatingMapAssociation.value = true;
	try {
		const availableLayers = await fetchAvailableLayersForMap(String(nextMap.pk));
		const dependencies = buildMissingLayerDependencies(availableLayers);
		if (dependencies.length === 0) {
			clearMapInconsistencies();
			applyAssociatedMap(nextMap);
			notify('Mappa associata all\'area');
			return;
		}

		pendingAssociatedMap.value = nextMap;
		missingLayerDependencies.value = dependencies;
		editingMap.value = false;
		statementView.value = 'list';
		closeMapDetails();
		activeTab.value = 'inconsistencies';
	} catch (error) {
		console.error('Errore durante la validazione della nuova mappa:', error);
		notify('Errore durante il controllo dei layer della nuova mappa', 'error');
	} finally {
		isValidatingMapAssociation.value = false;
	}
};




const associateActiveMapToArea = () => {
	if (!activeMap.value) return;
	void validateAndAssociateMap(mapToReference(activeMap.value));
};

watch(activeTab, (tab) => {
	if (tab !== 'map') {
		closeMapDetails();
	}
});

watch(
	() => area.value?.id,
	() => {
		closeMapDetails();
	},
);

watch(
	() => activeTab.value,
	async (tab) => {
		if (tab !== 'map') return;
		if (spatialStore.availableMaps.length > 0) return;
		await spatialStore.loadMaps();
	},
	{ immediate: true },
);

watch(
	() => area.value?.associatedMap?.pk,
	async (pk) => {
		if (!pk) return;
		const found = spatialStore.availableMaps.find((item) => String(item.pk) === String(pk));
		if (found || spatialStore.availableMaps.length > 0) return;
		await spatialStore.loadMaps();
	},
	{ immediate: true },
);
</script>

<template>
	<div class="container-panel">
		<v-progress-linear v-if="isBusy" indeterminate color="primary" />
		<v-progress-linear v-if="isValidatingMapAssociation" indeterminate color="secondary" />

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

		<div v-else-if="hasArea && statementView === 'list'" class="content-shell">
			<v-tabs v-model="activeTab" color="primary" class="tab-style">
				<v-tab value="general">Generale</v-tab>
				<v-tab value="statements">Statements</v-tab>
				<v-tab value="map">Mappa</v-tab>
				<v-tab v-if="hasInconsistencies" value="inconsistencies" color="error">
					Inconsistenze
				</v-tab>
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
				<v-window-item v-if="hasInconsistencies" value="inconsistencies">
					<section class="dependency-panel">
						<v-alert
							type="warning"
							variant="tonal"
							icon="mdi-alert-outline"
							class="dependency-panel__intro"
						>
							La nuova mappa
							<strong>{{ pendingAssociatedMap?.title || 'selezionata' }}</strong>
							non contiene tutti i layer oggi usati in misure, aspetti o effetti.
						</v-alert>

						<div class="dependency-panel__actions">
							<v-btn variant="text" @click="cancelPendingMapAssociation">
								Annulla sostituzione
							</v-btn>
							<v-btn color="primary" variant="flat" @click="confirmPendingMapAssociation">
								Sostituisci comunque
							</v-btn>
						</div>

						<div class="dependency-panel__list">
							<div
								v-for="dependency in missingLayerDependencies"
								:key="dependency.key"
								class="dependency-dialog__item"
							>
								<div class="dependency-dialog__header">
									<strong>{{ dependency.label }}</strong>
								</div>

								<div v-if="dependency.measures.length" class="dependency-dialog__section">
									<div class="dependency-dialog__label">Misure</div>
									<ul class="dependency-dialog__list">
										<li
											v-for="measure in dependency.measures"
											:key="`measure-${dependency.key}-${measure.scenarioId}-${measure.id}`"
										>
											{{ measure.name }} <span>({{ measure.scenarioName }})</span>
										</li>
									</ul>
								</div>

								<div v-if="dependency.effects.length" class="dependency-dialog__section">
									<div class="dependency-dialog__label">Effetti</div>
									<ul class="dependency-dialog__list">
										<li
											v-for="effect in dependency.effects"
											:key="`effect-${dependency.key}-${effect.scenarioId}-${effect.id}`"
										>
											{{ effect.name }} <span>({{ effect.scenarioName }})</span>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</section>
				</v-window-item>
				<v-window-item v-if="!editingMap" value="map">
					<div
						v-if="isLoadingAssociatedMap"
						class="map-preview-tab map-preview-tab--loading"
					>
						<v-progress-circular indeterminate color="primary" size="36" />
						<p>Caricamento mappa associata...</p>
					</div>
					<div class="map-preview-tab" 
						v-else-if="areaAssociatedMap">
						<div class="tw:flex tw:flex-row tw:items-center tw:gap-2 tw:mb-2 tw:text-md">
							Mappa geonode associata:
							<strong>{{ areaAssociatedMap.title }}</strong>
							<v-btn key="3" color="secondary" prepend-icon="mdi-tag-multiple" @click="openMapsBrowser()">
								{{ mapAssociationButtonLabel }}
							</v-btn>

						</div>
						<MapEmbedPreview
							:title="areaAssociatedMap.title"
							:embed-url="areaAssociatedMap.embed_url"
							:full-height="true"
						/> 
					</div>
					<v-alert 
						v-else
						variant="tonal" 
						icon="mdi-map-search-outline" 
						class="map-preview-tab__empty">
						Nessuna risorsa mappa associata. È possibile scegliere la mappa in <strong>Lista mappe</strong>.
						<template #append>
							<v-btn
								color="secondary"
								prepend-icon="mdi-tag-multiple"
								@click="openMapsBrowser()"
							>
								{{ mapAssociationButtonLabel }}
							</v-btn>
						</template>
					</v-alert>
				</v-window-item>
			</v-window>
		</div>

		<div v-else-if="editingMap && statementView === 'link-map'" class="map-browser-panel">
			<MapChooser :key="mapChooserKey" class="tw:size-full" :selected-geonode-map="area!.associatedMap"
				@close="closeMapsBrowser"
				@open-details="activeMap = $event"
				@update:selected-geonode-map="validateAndAssociateMap"
			>	
				<transition name="map-details-zoom" appear>
					<GeonodeMapDetailsPanel
						v-if="activeMap"
						:map="activeMap"
						:associated-map-pk="area?.associatedMap?.pk"
						@associate="associateActiveMapToArea"
						@close="closeMapDetails"
					/>
				</transition>
			</MapChooser>	
			
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

.map-preview-tab {
	height: 100%;
	min-height: 0;
	padding: 12px;
	box-sizing: border-box;
}

.map-preview-tab--loading {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	color: rgba(0, 0, 0, 0.66);
}

.map-preview-tab__empty {
	margin: 12px;
}

.map-browser-panel {
	position: relative;
	height: 100%;
	min-height: 0;
}

.dependency-panel {
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
}

.dependency-panel__intro {
	margin: 0;
}

.dependency-panel__actions {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	flex-wrap: wrap;
}

.dependency-panel__list {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.dependency-dialog {
	display: flex;
	flex-direction: column;
	gap: 12px;

	p {
		margin: 0;
		line-height: 1.5;
	}
}

.dependency-dialog__item {
	padding: 12px 14px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 10px;
	background: rgba(0, 0, 0, 0.02);
}

.dependency-dialog__header {
	margin-bottom: 8px;
}

.dependency-dialog__section + .dependency-dialog__section {
	margin-top: 10px;
}

.dependency-dialog__label {
	font-size: 0.8rem;
	font-weight: 700;
	text-transform: uppercase;
	color: rgba(0, 0, 0, 0.56);
	margin-bottom: 6px;
}

.dependency-dialog__list {
	margin: 0;
	padding-left: 18px;

	li + li {
		margin-top: 4px;
	}

	span {
		color: rgba(0, 0, 0, 0.62);
	}
}

.map-details-zoom-enter-active,
.map-details-zoom-leave-active {
	transition:
		opacity 0.24s ease,
		transform 0.24s ease;
	transform-origin: center center;
}

.map-details-zoom-enter-from,
.map-details-zoom-leave-to {
	opacity: 0;
	transform: scale(0.92);
}

.map-details-zoom-enter-to,
.map-details-zoom-leave-from {
	opacity: 1;
	transform: scale(1);
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

.map-preview-tab__title {
	font-size: 1rem;
	padding: 0.15rem 0.5rem;
	color: #1f2937;
	line-height: 1.3;
}


:deep(.v-window__container) {
	height: 100%;
	min-height: 0;
}

:deep(.v-window-item) {
	height: 100%;
	max-height: 100%;
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
