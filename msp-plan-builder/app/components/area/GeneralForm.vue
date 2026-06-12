<script setup lang="ts">
import StatementList from './StatementList.vue';
import StatementForm from './StatementForm.vue';
import type { AreaOfInterest, Statement } from '#/shared/types/msp-project';
import type { GeonodeMapListItem } from '#/shared/types/geonodeTypes';
import { generateUUID } from '#/shared/utils/generateUUID';
import { debounce } from 'lodash-es';
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import GeonodeMapList from './GeonodeMapList.vue';
import MapChooser from './MapChooser.vue';
import MapEmbedPreview from './MapEmbedPreview.vue';
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
const { areaTab: activeTab } = storeToRefs(tabsStore);
const isHydrating = ref(true);
const isSaving = ref(false);
const area = ref<AreaOfInterest | null>(null);

const statementView = ref<'list' | 'form'>('list');
const editedStatement = ref<Statement | null>(null);
const activeMap = ref<GeonodeMapListItem | null>(null);

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

const formatMapDate = (value?: string | null) => {
	if (!value) return '-';
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return '-';
	return new Intl.DateTimeFormat('it-IT', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	}).format(parsed);
};

const stripMapHtml = (value?: string | null) => {
	if (!value) return 'Nessuna descrizione disponibile.';
	const cleaned = value.replace(/<[^>]*>/g, '').trim();
	return cleaned || 'Nessuna descrizione disponibile.';
};

const closeMapDetails = () => {
	activeMap.value = null;
};

const associateActiveMapToArea = () => {
	if (!area.value || !activeMap.value) return;
	area.value.associatedMap = {
		pk: activeMap.value.pk,
		title: activeMap.value.title,
		detailUrl: activeMap.value.detail_url,
		thumbnailUrl: activeMap.value.thumbnail_url,
	};
};

watch(activeTab, (tab) => {
	if (tab !== 'map2') {
		closeMapDetails();
	}
});

watch(
	() => area.value?.id,
	() => {
		closeMapDetails();
	},
);
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
				<v-tab value="map2">Browse mappe</v-tab>
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
				<v-window-item value="map2">
					<div class="map-browser-panel">
						<MapChooser
							v-model:selected-geonode-map="area!.associatedMap"
							@open-details="activeMap = $event"
						/>

						<v-fade-transition>
							<section v-if="activeMap" class="map-details-window">
								<header class="map-details-window__header">
									<div class="map-details-window__heading">
										<p class="map-details-window__eyebrow">Dettagli mappa</p>
										<h2>{{ activeMap.title }}</h2>
										<p>{{ stripMapHtml(activeMap.abstract) }}</p>
									</div>
									<div class="map-details-window__actions">
										<v-btn
											v-if="String(area?.associatedMap?.pk || '') !== String(activeMap.pk)"
											color="primary"
											variant="flat"
											prepend-icon="mdi-map-plus"
											@click="associateActiveMapToArea"
										>
											Associa all'area
										</v-btn>
										<v-btn variant="text" prepend-icon="mdi-close" @click="closeMapDetails">
											Chiudi
										</v-btn>
									</div>
								</header>

								<div class="map-details-window__body">
									<div class="map-details-window__content">
										<div class="map-details-window__meta-grid">
											<div class="map-details-window__meta-card">
												<span>Owner</span>
												<strong>{{ activeMap.owner_username || '-' }}</strong>
											</div>
											<div class="map-details-window__meta-card">
												<span>Creata</span>
												<strong>{{ formatMapDate(activeMap.created) }}</strong>
											</div>
											<div class="map-details-window__meta-card">
												<span>Aggiornata</span>
												<strong>{{ formatMapDate(activeMap.last_updated) }}</strong>
											</div>
											<div class="map-details-window__meta-card">
												<span>Visite</span>
												<strong>{{ activeMap.popular_count || '0' }}</strong>
											</div>
											<div class="map-details-window__meta-card">
												<span>Condivisioni</span>
												<strong>{{ activeMap.share_count || '0' }}</strong>
											</div>
											<div class="map-details-window__meta-card">
												<span>Proiezione</span>
												<strong>{{ activeMap.projection || '-' }}</strong>
											</div>
										</div>

										<div class="map-details-window__section">
											<h3>Descrizione</h3>
											<p>{{ stripMapHtml(activeMap.abstract) }}</p>
										</div>

										<div class="map-details-window__section">
											<h3>Coordinate e navigazione</h3>
											<ul class="map-details-window__facts">
												<li>Centro X: {{ activeMap.center_x ?? '-' }}</li>
												<li>Centro Y: {{ activeMap.center_y ?? '-' }}</li>
												<li>Zoom: {{ activeMap.zoom ?? '-' }}</li>
												<li>Lingua: {{ activeMap.language || '-' }}</li>
											</ul>
										</div>

										<MapEmbedPreview
											:title="activeMap.title"
											:embed-url="activeMap.embed_url"
										/>

										<div class="map-details-window__links">
											<v-btn
												v-if="activeMap.detail_url"
												:href="activeMap.detail_url"
												target="_blank"
												rel="noopener noreferrer"
												variant="outlined"
												prepend-icon="mdi-open-in-new"
											>
												Apri su GeoNode
											</v-btn>
										</div>
									</div>
								</div>
							</section>
						</v-fade-transition>
					</div>
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

.map-browser-panel {
	position: relative;
	height: 100%;
	min-height: 0;
}

.map-details-window {
	position: absolute;
	inset: 0;
	z-index: 5;
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 20px;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(254, 247, 255, 0.98));
	overflow-y: auto;
}

.map-details-window__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
}

.map-details-window__heading {
	max-width: 820px;

	h2 {
		margin: 0;
		font-size: clamp(1.5rem, 2vw, 2rem);
		line-height: 1.15;
		color: #1f2937;
	}

	p {
		margin: 0.6rem 0 0;
		line-height: 1.6;
		color: rgba(0, 0, 0, 0.68);
	}
}

.map-details-window__eyebrow {
	margin: 0 0 0.45rem !important;
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: rgba(0, 0, 0, 0.45) !important;
}

.map-details-window__actions {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.map-details-window__body {
	display: flex;
	flex-direction: column;
	gap: 20px;
	min-height: 0;
}

.map-details-window__content {
	min-width: 0;
}

.map-details-window__content {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12px 18px;
}

.map-details-window__meta-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 8px 16px;
	grid-column: 1 / -1;
}

.map-details-window__meta-card {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	padding: 0;

	span {
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: rgba(0, 0, 0, 0.45);
	}

	strong {
		font-size: 0.96rem;
		color: rgba(0, 0, 0, 0.82);
	}
}

.map-details-window__section {
	padding: 0.15rem 0;

	h3 {
		margin: 0 0 0.35rem;
		font-size: 0.92rem;
		color: #1f2937;
	}

	p {
		margin: 0;
		line-height: 1.55;
		font-size: 0.94rem;
		color: rgba(0, 0, 0, 0.7);
	}
}

.map-details-window__facts {
	margin: 0;
	padding-left: 1rem;
	display: grid;
	gap: 0.25rem;
	font-size: 0.94rem;
	color: rgba(0, 0, 0, 0.7);
}

.map-details-window__links {
	display: flex;
	justify-content: flex-start;
	grid-column: 1 / -1;
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

@media (max-width: 960px) {
	.map-details-window__content {
		grid-template-columns: 1fr;
	}

	.map-details-window__meta-grid {
		grid-template-columns: 1fr;
	}
}
</style>
