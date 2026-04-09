<!-- app/pages/areas/[id].vue -->
<script setup lang="ts">
import StatementList from './StatementList.vue';
import StatementForm from './StatementForm.vue';
import type { AreaOfInterest, Statement } from '#/shared/types/msp-project';
import { generateUUID } from '#/shared/utils/generateUUID';
import { debounce } from 'lodash-es';
import { computed, onMounted, ref, watch } from 'vue';


const mpsDataProvider = useMspDataProvider();
const tab = ref('general');
const showToast = ref(false);
const toastMessage = ref('');
const toastColor = ref('success');
const currentStatementView = ref<'list' | 'statement-form'>('list');
const isLoading = ref(true);
const isSaving = ref(true); // Feedback visivo per l'utente

const notify = (message: string, color = 'success') => {
	toastMessage.value = message;
	toastColor.value = color;
	showToast.value = true;
};





const areaData = ref<AreaOfInterest | null>(null);
const selectedStatement = ref<Statement | null>(null);

const openNewStatementForm = (type: 'General' | 'Sector-specific') => {
	selectedStatement.value = {
		id: '', // Sarà generato al salvataggio
		shortName: '',
		longName: '',
		description: '',
		// Se è sector-specific, inizializziamo l'array, altrimenti undefined
		sectorThemes: type === 'Sector-specific' ? [] : undefined
	};
	currentStatementView.value = 'statement-form';
};

const handleSaveStatement = (formData: Partial<Statement>) => {
	if (!areaData.value) return;
	if (!areaData.value.statements) areaData.value.statements = [];

	if (selectedStatement.value?.id) {
		// --- LOGICA EDIT ---
		const index = areaData.value.statements.findIndex(s => s.id === selectedStatement.value!.id);
		if (index !== -1) {
			areaData.value.statements[index] = {
				...selectedStatement.value,
				...formData
			} as Statement;
			notify("Statement aggiornato con successo");
		}
	} else {
		// --- LOGICA NUOVO ---
		const newStatement: Statement = {
			...formData,
			id: generateUUID(),
		} as Statement;
		areaData.value.statements.push(newStatement);
		notify("Nuovo statement aggiunto");
	}

	currentStatementView.value = 'list';
	selectedStatement.value = null;
};
const handleCancelNewStatement = () => {
	currentStatementView.value = 'list';
};


const handleDeleteStatement = (id: string) => {
	try {
		if (!areaData.value?.statements) return;
		//await api.statements.delete(id);
		const index = areaData.value.statements.findIndex(s => s.id === id);
		areaData.value.statements.splice(index, 1);
		notify("Eliminato con successo");
	}
	catch (error) {
		console.error("Errore durante l'eliminazione dello statement:", error);
		notify("Errore durante l'eliminazione dello statement", "error");
		return;
	}
	
	
};

const handleEditRequest = (statement: Statement) => {
	selectedStatement.value = { ...statement }; // Copia per evitare modifiche reattive immediate
	currentStatementView.value = 'statement-form';
};


onMounted(async () => {
	const project = await mpsDataProvider.fetchProject('001');
	areaData.value = project?.areaOfInterest || null;
	isLoading.value = false;
});

const hasArea = computed(() => areaData.value !== null);

const saveProjectData = async (updatedData: AreaOfInterest) => {
	isSaving.value = true;
	try {
		console.log('Salvataggio automatico in corso...', updatedData);
		// Assicurati che il tuo composable supporti un metodo di update
		await mpsDataProvider.updateArea(updatedData);
	} catch (error) {
		console.error('Errore durante il salvataggio:', error);
	} finally {
		// Simuliamo un delay per il feedback visivo
		setTimeout(() => { isSaving.value = false; }, 500);
	}
};

const debouncedSave = debounce((newValue: AreaOfInterest) => {
	saveProjectData(newValue);
}, 500);


watch(
	areaData,
	(newValue) => {
		if (newValue && !isLoading.value) {
			debouncedSave(JSON.parse(JSON.stringify(newValue)));
		}
	},
	{ deep: true }
);







</script>

<template>
	<div class="container-panel">
		<!-- Stato di caricamento iniziale -->
		<v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>
		<v-snackbar v-model="showToast" :color="toastColor" timeout="3000">
			{{ toastMessage }}
		</v-snackbar>


		<!-- Indicatore di salvataggio in corso -->
		<v-fade-transition>
			<div v-if="isSaving" class="text-caption text-primary d-flex align-center position-absolute"
				style="top: 10px; right: 20px; z-index: 10;">
				<v-progress-circular indeterminate size="16" width="2" class="mr-2"></v-progress-circular>
				Salvataggio in corso...
			</div>
		</v-fade-transition>

		<!-- Messaggio di info se i dati non sono disponibili -->
		<v-alert v-if="!isLoading && !hasArea" type="info" variant="tonal" icon="mdi-information-outline" prominent>
			Occorre selezionare un'area all'interno di un progetto per visualizzare o modificare i dettagli.
		</v-alert>
		<StatementForm v-if="currentStatementView === 'statement-form'" 
			:initial-data="selectedStatement || {}" 
			@save="handleSaveStatement"
			@cancel="handleCancelNewStatement" />



		<div v-else-if="hasArea" elevation="2">
			<v-tabs v-model="tab" color="primary" class="tab-style">
				<v-tab value="general">Generale</v-tab>
				<v-tab value="statements">Statements</v-tab>
				<v-tab value="map">Mappa</v-tab>
			</v-tabs>
			<v-window v-model="tab" class="ma-2 mt-4 area-form-window">
				<!-- Tab 1: Dettagli Generali -->
				<v-window-item value="general">
					<v-form>
						<v-row>
							<v-col cols="12" md="6" class="mt-2">
								<v-text-field v-model="areaData!.name" label="Nome Progetto" variant="outlined"
									clearable></v-text-field>
							</v-col>
						</v-row>

						<v-row>
							<v-col cols="12" md="6">
								<v-text-field v-model="areaData!.name" label="Nome Corto Area" variant="outlined"
									clearable></v-text-field>
							</v-col>
							<v-col cols="12" md="6">
								<v-text-field v-model="areaData!.description" label="Nome Completo Area"
									variant="outlined" clearable></v-text-field>
							</v-col>
						</v-row>

						<v-row>
							<v-col cols="12">
								<v-textarea v-model="areaData!.description" label="Descrizione Generale dell'area"
									variant="outlined" rows="4" clearable></v-textarea>
							</v-col>
						</v-row>

						<v-row>
							<v-col cols="12">
								<v-textarea v-model="areaData!.description" label="Orizzonte temporale"
									hint="La distanza temporale del progetto." variant="outlined" rows="3"
									clearable></v-textarea>
							</v-col>
						</v-row>
					</v-form>
				</v-window-item>

				<v-window-item value="statements">
					<!-- Sostituisci il placeholder con il nuovo componente -->
					<!-- areaData!.statements dovrebbe essere un array di Statement[] -->
					<StatementList v-if="areaData?.statements" 
						:statements="areaData.statements"
						@edit:statement="handleEditRequest"
						@delete:statement="handleDeleteStatement" 
						class="pa-4" />
					<p v-else class="pa-4">Nessun statements disponibile.</p>
				</v-window-item>
				
				<v-window-item value="map">
					<p class="pa-4">Servizio di accesso cartografia non disponibile</p>
				</v-window-item>
			</v-window>
		</div>
		<!-- FAB Button in basso a destra -->
		<div v-if="tab === 'statements' && currentStatementView === 'list' && hasArea" class="fab-container">
			<v-speed-dial location="top left" transition="scale-transition">
				<template v-slot:activator="{ props: activatorProps }">
					<v-btn v-bind="activatorProps" color="primary" icon="mdi-plus" size="large" elevation="4"></v-btn>
				</template>

				<!-- Opzione Sector-specific -->
				<v-btn key="1" color="secondary" prepend-icon="mdi-tag-multiple"
					@click="openNewStatementForm('Sector-specific')">
					Sector-specific
					
				</v-btn>

				<!-- Opzione General -->
				<v-btn key="2" color="surface-variant" prepend-icon="mdi-earth"
					@click="openNewStatementForm('General')">
					General
					
				</v-btn>
			</v-speed-dial>
		</div>

	</div>
	
</template>

<style scoped lang="scss">
.container-panel {
	position: relative;
    background-color: #FFFF;
    width: 100%;
    min-height: 100%; /* Assicurati che il contenitore principale sia alto almeno quanto la viewport se necessario per il layout generale */
}

.area-form-window {
	height: calc(100vh - 200px);
	/* Regola in base alla tua toolbar/header */
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
:deep(.v-window-item) {
	height: 100%;
	overflow-y: auto;
	/* Permette lo scroll verticale se le card eccedono */
}
.position-absolute {
	position: absolute !important;
}


.tab-style {
	background-color: #FEF7FF;

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

/* Spaziatura tra i bottoni dello speed dial quando aperto */
:deep(.v-speed-dial__content) {
	gap: 10px;
}
 
</style>
