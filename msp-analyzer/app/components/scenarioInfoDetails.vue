<script setup lang="ts">
import { PropType } from 'vue';
import type { Scenario, Topic } from '~/models/scenario';



// Definizione delle props che il componente accetta
const props = defineProps({
	scenario: {
		type: Object as PropType<Scenario>,
		required: true,
	},
});

// Funzioni helper per la logica di visualizzazione
const hasImpacts = (topic: Topic): boolean => {
	return topic.impacts && Object.keys(topic.impacts).length > 0;
};

const hasResources = (impact: Impact): boolean => {
	return impact.geospatialResources && impact.geospatialResources.length > 0;
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
					<h3 class="text-h6 mb-2">Narrativa</h3>
					<p>{{ scenario.narrative }}</p>
				</div>

				<div class="mb-4">
					<h3 class="text-h6 mb-2">Ambito Temporale</h3>
					<v-chip color="info" outlined>
						{{ scenario.temporalScope }}
					</v-chip>
				</div>

				<v-divider class="my-4"></v-divider>

				<h3 class="text-h6 mb-4">Temi Principali</h3>
				<v-row>
					<v-col
						v-for="(topic, key) in scenario.topics"
						:key="key"
						cols="12"
						md="6"
						lg="4"
					>
						<v-card outlined class="pa-3 h-100">
							<v-card-title class="text-subtitle-1">
								{{ topic.nome }}
							</v-card-title>
							<v-card-subtitle>
								Tipo:
								<v-chip
									:color="topic.type === 'primario' ? 'primary' : 'secondary'"
									small
									>{{ topic.type }}</v-chip
								>
							</v-card-subtitle>

							<v-card-text v-if="topic.description">
								{{ topic.description }}
							</v-card-text>

							<div v-if="hasImpacts(topic)">
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
							</div>
						</v-card>
					</v-col>
				</v-row>

				<v-divider class="my-4"></v-divider>

				<div class="mb-4">
					<h3 class="text-h6 mb-2">Aspetti Estesi</h3>
					<p>{{ scenario.extendedAspects }}</p>
				</div>

				<div class="mb-4">
					<h3 class="text-h6 mb-2">Risorse</h3>
					<p>Mappe: {{ scenario.maps.join(', ') }}</p>
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
