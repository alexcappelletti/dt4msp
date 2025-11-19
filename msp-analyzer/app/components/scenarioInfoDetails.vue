<script setup lang="ts">
import type { PropType } from 'vue';
import { populateScenario, type Scenario, type Theme } from '~/models/scenario';

interface Props {
	scenario: Scenario;
}

// Definizione delle props che il componente accetta
const {
	scenario = populateScenario({} as Partial<Scenario>)
} = defineProps<Props>();

// // Funzioni x logica di visualizzazione
// const hasImpacts = (theme: Theme): boolean => {
// 	return topic.impacts && Object.keys(topic.impacts).length > 0;
// };

const getTypeColor = (theme: Theme): string => {
	if (scenario === null) return 'grey';
	if (scenario.primaryThemes?.some(th => th.ID === theme.ID)) {
		return '#84b318';
	}
	else if (scenario.secondaryThemes?.some(th => th.ID === theme.ID)) {
		return '#ff9800';
	}
	return 'grey';
};

const hasResources = (scenario: Scenario): boolean => {
	const themeFiltered = scenario.availableThemes.some(t => t.geospatialResources.length !== 0);

	return themeFiltered;
};

</script>
<template>
	<v-container>
		<v-card v-if="scenario" class="pa-5" elevation="3">
			<v-card-title class="headline font-weight-bold text-h4 mb-4">
				{{ scenario.name }} 
			</v-card-title>

			<v-card-subtitle class="text-subtitle-1 mb-4">
				{{ scenario.generalDescription }}
			</v-card-subtitle>

			<v-divider class="my-4"></v-divider>

			<v-card-text>
				<div class="mb-4">
					<h3 class="text-h6 mb-2">Obiettivi</h3>
					<p>{{ scenario.objectives }}</p>
				</div>
				<div class="mb-4">
					<h3 class="text-h6 mb-2">Area di Interesse</h3>
					<p v-if="scenario.areaOfInterest">{{ scenario.areaOfInterest }}</p>
					<p v-else>N/A</p>
				</div>
				<div class="mb-4">
					<h3 class="text-h6 mb-2">Narrativa</h3>
					<p>{{ scenario.narrative }}</p>
				</div>

				<div class="mb-4">
					<h3 class="text-h6 mb-2">Ambito Temporale</h3>
					<v-chip color="info" outlined>
						{{ scenario.temporalScope }}
					</v-chip>
				</div>

				<v-divider class="my-4" v-if="scenario.statements?.length"></v-divider>
				<div class="mb-4" v-if="scenario.statements?.length">
					<h3 class="text-h6 mb-4">Statements</h3>
					<p> {{ scenario.statements.map(s => s.longName).join(', ') }}</p>
				</div>
				<v-divider class="my-4"></v-divider>



				<h3 class="text-h6 mb-4">Temi Disponibili</h3>
				<v-row>
					<v-col
						v-for="(th, key) in scenario.availableThemes"
						:key="key"
						cols="12"
						md="6"
						lg="4"
					>
						<v-card outlined class="pa-3 h-100">
							<v-card-title class="text-subtitle-1">
								{{ th.name }}
							</v-card-title>
							<v-card-subtitle>
								Tipo:
								<v-chip
									:color="getTypeColor(th)"
									small
									>{{ th.indexName }}</v-chip
								>
							</v-card-subtitle>

							<v-card-text v-if="th.description">
								{{ th.description }}
							</v-card-text>

							<!-- <div v-if="scenario.(topic)">
								<h4 class="text-h6 mt-3 mb-2">Impatti</h4>
								<v-list dense>
									<v-list-item
										v-for="(impact, impactKey) in topic.impacts"
										:key="impactKey"
									>
										<v-list-item-content>
											<v-list-item-title>{{ impact.name }}</v-list-item-title>
											<v-list-item-subtitle>{{
												impact.description
											}}</v-list-item-subtitle>
											<v-list-item-subtitle v-if="hasResources(impact)">
												Risorse collegate:
												<v-list-item
													v-for="resource in impact.geospatialResources"
													:key="resource.id"
												>
													<a
														:href="resource.url"
														target="_blank"
														rel="noopener noreferrer"
														>{{ resource.name }}</a
													>
												</v-list-item>
											</v-list-item-subtitle>
										</v-list-item-content>
									</v-list-item>
								</v-list>
							</div> -->
						</v-card>
					</v-col>
				</v-row>

				<v-divider class="my-4"></v-divider>

				<div class="mb-4" v-if="scenario.measures?.length">
					<h3 class="text-h6 mb-2">Measures</h3>
					<p>{{ scenario.measures?.map(x => x.name ).join(', ') }}</p>
				</div>

				<div class="mb-4" v-if="scenario.effects?.length">
					<h3 class="text-h6 mb-2">Effects</h3>
					<p>{{ scenario.effects?.map(x => x.name ).join(', ') }}</p>
				</div>


				<div class="mb-4">
					<h3 class="text-h6 mb-2">Risorse</h3>
					<p>Mappe: {{ scenario.spatialResources.join(', ') }}</p>
					<p>Dataset: {{ scenario.datasets.join(', ') }}</p>
				</div>
			</v-card-text>
		</v-card>
		<v-alert v-else type="error" outlined>
			Dati dello scenario non disponibili.
		</v-alert>
	</v-container>
</template>

<style scoped>
/* Stili specifici per il componente, se necessari */
</style>
