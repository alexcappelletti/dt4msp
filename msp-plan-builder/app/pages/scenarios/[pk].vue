<!-- app/pages/scenarios/[id].vue -->
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useMspDataProvider } from '@/composables/useMspProvider';
import type { Scenario } from '#/shared/types/msp-project';
import { debounce } from 'lodash-es'; // Richiede 'npm install lodash-es'

const route = useRoute();
const mpsDataProvider = useMspDataProvider();
const tab = ref('general');
const scenarioData = ref<Scenario | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);

onMounted(async () => {
	const scenarioId = route.params.id as string;
	scenarioData.value = await mpsDataProvider.fetchScenario(scenarioId);
	isLoading.value = false;
});

const hasScenario = computed(() => scenarioData.value !== null);

// Funzione di salvataggio effettiva (debounced)
const saveScenarioData = async (updatedData: Scenario) => {
	isSaving.value = true;
	try {
		await mpsDataProvider.updateScenario(updatedData);
	} catch (error) {
		console.error('Errore durante il salvataggio:', error);
	} finally {
		isSaving.value = false;
	}
};

// Debounce di 500ms
const debouncedSave = debounce((newValue: Scenario) => {
	saveScenarioData(newValue);
}, 500);

// Watcher profondo sull'oggetto scenarioData
watch(scenarioData, (newValue) => {
	if (newValue && !isLoading.value) {
		// Passiamo una copia profonda per evitare problemi di reattività nel debounce
		debouncedSave(JSON.parse(JSON.stringify(newValue)));
	}
}, { deep: true });
</script>

<template>
	<v-container fluid>
		<v-progress-linear v-if="isLoading" indeterminate color="primary"></v-progress-linear>

		<!-- Indicatore di salvataggio -->
		<v-fade-transition>
			<div v-if="isSaving" class="text-caption text-primary d-flex align-center position-absolute"
				style="top: 70px; right: 20px; z-index: 10;">
				<v-progress-circular indeterminate size="16" width="2" class="mr-2"></v-progress-circular>
				Salvataggio automatico...
			</div>
		</v-fade-transition>

		<v-alert v-if="!isLoading && !hasScenario" type="info" variant="tonal" icon="mdi-information-outline" prominent>
			Scenario non trovato.
		</v-alert>

		<v-card v-if="hasScenario" elevation="2">
			<v-tabs v-model="tab" color="primary">
				<v-tab value="general">Generale</v-tab>
				<v-tab value="narrative">Narrativa</v-tab>
				<v-tab value="measures">Misure & Effetti</v-tab>
				<v-tab value="map">Mappa & Risorse</v-tab>
			</v-tabs>

			<v-card-text>
				<v-window v-model="tab">

					<!-- Tab 1: Dettagli Generali (Nome, Descrizione, Obiettivi, Scope) -->
					<v-window-item value="general">
						<v-form>
							<v-row>
								<v-col cols="12" md="6" class="mt-2">
									<v-text-field v-model="scenarioData!.name" label="Nome Scenario" variant="outlined"
										clearable></v-text-field>
								</v-col>
								<v-col cols="12" md="6" class="mt-2">
									<v-text-field v-model="scenarioData!.temporalScope" label="Orizzonte Temporale"
										variant="outlined" clearable></v-text-field>
								</v-col>
							</v-row>

							<v-row>
								<v-col cols="12">
									<v-textarea v-model="scenarioData!.generalDescription"
										label="Descrizione Generale dello Scenario" variant="outlined" rows="3"
										clearable></v-textarea>
								</v-col>
							</v-row>
							<v-row>
								<v-col cols="12">
									<v-textarea v-model="scenarioData!.objectives" label="Obiettivi Principali"
										variant="outlined" rows="3" clearable></v-textarea>
								</v-col>
							</v-row>
						</v-form>
					</v-window-item>

					<!-- Tab 2: Narrativa -->
					<v-window-item value="narrative">
						<v-textarea v-model="scenarioData!.narrative" label="Narrativa Dettagliata (Descrizione Storie)"
							variant="outlined" rows="10" clearable></v-textarea>
					</v-window-item>

					<!-- Tab 3: Misure ed Effetti (Placeholder) -->
					<v-window-item value="measures">
						<p>Qui gestirai Misure ed Effetti (`Measure`, `Effect`).</p>
					</v-window-item>

					<!-- Tab 4: Mappa & Risorse (Placeholder) -->
					<v-window-item value="map">
						<p>Qui integrerai la mappa e gestirai `spatialResources` e `datasets`.</p>
					</v-window-item>

				</v-window>
			</v-card-text>
		</v-card>
	</v-container>
</template>

<style scoped>
.position-absolute {
	position: absolute !important;
}
</style>
