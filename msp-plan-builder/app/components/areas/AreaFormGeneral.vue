<script setup lang="ts">
import { ref } from 'vue';
import { useMspData } from '@/composables/useMspData';
import type { AreaOfInterest } from '#/shared/types/msp-project';

const { fetchProject } = useMspData();
const tab = ref('general');
const dataArea = ref<AreaOfInterest|null>()
onMounted(async() => {
	dataArea.value = await fetchProject('001')
})



</script>

<!-- components/areas/AreaFormGeneral.vue -->

<template>
	<v-container fluid>
		<v-card elevation="2">

			<!-- Tabs di navigazione (come nell'immagine: General, Statements, Map) -->
			<v-tabs v-model="tab" color="primary">
				<v-tab value="general">Generale</v-tab>
				<v-tab value="statements">Statements</v-tab>
				<v-tab value="map">Mappa</v-tab>
			</v-tabs>

			<v-card-text>
				<v-window v-model="tab">

					<!-- Tab 1: Dettagli Generali (come nell'immagine) -->
					<v-window-item value="general">
						<v-form>
							<v-row>
								<v-col cols="12" md="6">
									<v-text-field v-model="areaData.name" label="Nome Progetto" variant="outlined"
										clearable></v-text-field>
								</v-col>
							</v-row>

							<v-row>
								<v-col cols="12" md="6">
									<v-text-field v-model="areaData.name" label="Nome Corto Area" variant="outlined"
										clearable></v-text-field>
								</v-col>
								<v-col cols="12" md="6">
									<v-text-field v-model="areaData.longName" label="Nome Completo Area"
										variant="outlined" clearable></v-text-field>
								</v-col>
							</v-row>

							<v-row>
								<v-col cols="12">
									<v-textarea v-model="areaData.description" label="Descrizione Generale dell'area"
										variant="outlined" rows="4" clearable></v-textarea>
								</v-col>
							</v-row>

							<v-row>
								<v-col cols="12">
									<v-textarea v-model="areaData.temporalScope"
										label="Orizzonte temporale (Time horizon)"
										hint="La distanza temporale del progetto." variant="outlined" rows="3"
										clearable></v-textarea>
								</v-col>
							</v-row>
						</v-form>
					</v-window-item>

					<!-- Tab 2: Statements (da implementare in futuro) -->
					<v-window-item value="statements">
						<p>Qui gestirai gli statements (interfacce `Statement`).</p>
					</v-window-item>

					<!-- Tab 3: Map (da implementare in futuro) -->
					<v-window-item value="map">
						<p>Qui integrerai la mappa (dove definire il poligono `areaOfInterest.coordinates`).</p>
					</v-window-item>

				</v-window>
			</v-card-text>

			<v-card-actions>
				<v-spacer></v-spacer>
				<v-btn color="primary" variant="tonal">Salva Modifiche</v-btn>
			</v-card-actions>
		</v-card>
	</v-container>
</template>

<style scoped>
/* Stili specifici se necessari, altrimenti usa Tailwind/Vuetify */
</style>
