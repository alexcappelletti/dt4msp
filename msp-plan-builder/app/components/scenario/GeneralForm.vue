<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import type { Scenario, Theme } from '#/shared/types/msp-project';
import { useScenarioStore } from '~/stores/scenarioStore';
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
		<!-- <v-toolbar color="background" flat>
			<v-btn icon @click="cancelForm">
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>
			<v-toolbar-title class="font-weight-bold">
			
				{{ formData.id ? 'Modifica Scenario' : 'Nuovo Scenario' }}
			</v-toolbar-title>
			<v-spacer></v-spacer>
			<v-btn icon @click="saveForm" :disabled="!canSave">
				<v-icon color="primary">mdi-content-save</v-icon>
			</v-btn>
		</v-toolbar> -->

		<v-form>
				<v-row>
					<v-col cols="12" md="6">
						<!-- I v-model ora scrivono direttamente tramite la computed property nel formData -->
						<v-text-field v-model="formData.name" label="Nome Scenario" variant="outlined" clearable
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
						<v-chip-group v-model="formData.primaryThemes" column multiple selected-class="text-primary">
							<v-chip v-for="theme in availableThemes" :key="theme.id" :value="theme" variant="outlined">
								{{ theme.name }}
							</v-chip>
						</v-chip-group>
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-label class="mb-2">Secondary Themes</v-label>
						<!-- v-model="formData.secondaryThemes" si aggiorna automaticamente con lo store -->
						<v-chip-group v-model="formData.secondaryThemes" column multiple
							selected-class="text-secondary">
							<v-chip v-for="theme in availableThemes" :key="theme.id" :value="theme" variant="outlined">
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
