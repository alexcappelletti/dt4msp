<script setup lang="ts">
import { computed, onMounted } from 'vue';
import type { Scenario, Theme } from '#/shared/types/msp-project';
// Importa la funzione di popolamento e i temi disponibili (aggiustare il percorso se necessario)
import { populateScenario } from '#/shared/types/msp-project';


const emit = defineEmits(['save', 'cancel']);
const store = useScenarioStore();

// --- Gestione dei Temi Disponibili (Caricati da un'altra fonte/API) ---
// Utilizziamo un ref locale o carichiamo questi dati all'avvio dell'app/pagina principale
const availableThemes = computed(() => store.availableThemes);


// --- Dati del Form (Derivati dallo Store) ---
// Usiamo un computed property che punta direttamente allo scenario nello store
const formData = computed<Partial<Scenario>>({
	get: () => store.selectedScenario || populateScenario({}),
	set: (value) => {
		if (store.selectedScenario) {
			// Aggiorna lo store direttamente quando i campi del form cambiano
			Object.assign(store.selectedScenario, value);
		}
	}
});

const selectedPrimaryThemeIds = computed(() =>
	(formData.value.primaryThemes ?? []).map((theme) => theme.id),
);

const selectedSecondaryThemeIds = computed(() =>
	(formData.value.secondaryThemes ?? []).map((theme) => theme.id),
);

function mapIdsToThemes(ids: string[], existing: Theme[] | undefined): Theme[] {
	const currentById = new Map((existing ?? []).map((theme) => [theme.id, theme]));
	for (const theme of availableThemes.value) {
		if (ids.includes(theme.id)) {
			currentById.set(theme.id, theme);
		}
	}
	return ids
		.map((id) => currentById.get(id))
		.filter((theme): theme is Theme => !!theme);
}

const updatePrimaryThemes = (ids: string[]) => {
	formData.value.primaryThemes = mapIdsToThemes(ids, formData.value.primaryThemes);
};

const updateSecondaryThemes = (ids: string[]) => {
	formData.value.secondaryThemes = mapIdsToThemes(ids, formData.value.secondaryThemes);
};


// Controlla se i campi obbligatori sono stati compilati
const canSave = computed(() => {
	return formData.value.name?.trim() &&
		formData.value.generalDescription?.trim() &&
		formData.value.narrative?.trim();
});


// --- Azioni del Form ---

const saveForm = () => {
	if (canSave.value) {
		// Emit l'evento di salvataggio al componente padre, che gestirà l'API call
		emit('save', formData.value);
	}
};

const cancelForm = () => {
	// Pulisci lo stato nello store e notifica il padre
	store.clearSelectedScenario();
	emit('cancel');
};
onMounted(async() => {
	if (availableThemes.value.length === 0) {
		// Chiama l'azione Pinia per popolare i temi [1]
		await store.fetchAvailableThemes();
	}
});
</script>

<template>
	<div class="form-container">
		<v-form>
				<v-row>
					<v-col cols="12" md="6">
						<!-- I v-model ora scrivono direttamente tramite la computed property nel formData -->
						<v-text-field v-model="formData.name" data-testid="scenario-name-input" label="Nome Scenario" variant="outlined" clearable
							hint="Nome breve e identificativo dello scenario" persistent-hint></v-text-field>
					</v-col>
					<v-col cols="12" md="6">
						<v-text-field v-model="formData.temporalScope" label="Orizzonte Temporale" variant="outlined"
							clearable hint="Esempio: 2025-2030" persistent-hint></v-text-field>
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-textarea v-model="formData.generalDescription" label="Descrizione Generale"
							variant="outlined" rows="4" clearable hint="Descrizione sommaria dello scenario"
							persistent-hint></v-textarea>
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-textarea v-model="formData.narrative" label="Narrativa Dettagliata" variant="outlined"
							rows="6" clearable hint="Racconto più esteso o driver principali"
							persistent-hint></v-textarea>
					</v-col>
				</v-row>

				<!-- Sezione Temi Primari e Secondari come da immagine -->
				<v-row>
					<v-col cols="12">
						<v-label class="mb-2">Primary Themes</v-label>
						<!-- v-model="formData.primaryThemes" si aggiorna automaticamente con lo store -->
						<v-chip-group
							:model-value="selectedPrimaryThemeIds"
							column
							multiple
							selected-class="text-primary"
							@update:model-value="updatePrimaryThemes"
						>
							<v-chip v-for="theme in availableThemes" :key="theme.id" :value="theme.id" variant="outlined">
								{{ theme.name }}
							</v-chip>
						</v-chip-group>
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-label class="mb-2">Secondary Themes</v-label>
						<!-- v-model="formData.secondaryThemes" si aggiorna automaticamente con lo store -->
						<v-chip-group
							:model-value="selectedSecondaryThemeIds"
							column
							multiple
							selected-class="text-secondary"
							@update:model-value="updateSecondaryThemes"
						>
							<v-chip v-for="theme in availableThemes" :key="theme.id" :value="theme.id" variant="outlined">
								{{ theme.name }}
							</v-chip>
						</v-chip-group>
					</v-col>
				</v-row>
			</v-form>
		
	</div>
</template>

<style scoped>
.form-container {
	padding-top: 16px;
	display: flex;
	flex-direction: column;
	gap: 16px;
}

</style>
