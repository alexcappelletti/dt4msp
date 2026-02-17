<!-- components/areas/statements/StatementList.vue -->
<script setup lang="ts">
import type { Statement } from '#/shared/types/msp-project';
import { computed, ref } from 'vue';

const props = defineProps<{
	statements: Statement[];
}>();

// Logica di filtro semplificata (qui puoi espanderla)
const currentFilter = ref('Tutti');
const availableFilters = ['Tutti', 'Generale', 'Sector-specific'];

const filteredStatements = computed(() => {
	if (currentFilter.value === 'Tutti') return props.statements;
	// Aggiungi qui una logica di filtro reale basata sulle proprietà dello Statement
	return props.statements;
});

const emit = defineEmits(['delete:statement', 'edit:statement']);

const deleteStatement = (id: string) => {
	emit('delete:statement', id);
};

const editStatement = (statement: Statement) => {
	console.log('Editing statement:', statement);
	emit('edit:statement', statement);
};

</script>

<template>
	<div class="statements-list-container">
		<!-- Area Filtri -->
		<div class="filters-container mb-4 d-flex align-center">
			<span class="text-caption mr-4">Filtri:</span>
			<v-chip-group mandatory selected-class="text-primary" v-model="currentFilter">
				<v-chip v-for="filter in availableFilters" :key="filter" :value="filter">
					{{ filter }}
				</v-chip>
				<!-- Simulazione del dropdown 'Theme' -->
				<v-chip append-icon="mdi-menu-down">Tema</v-chip>
			</v-chip-group>
		</div>

		<!-- Lista di Card -->
		<div v-if="filteredStatements.length > 0" class="statements-grid">
			<v-card v-for="statement in filteredStatements" :key="statement.id" class="statement-card hover-effect"
				@click="editStatement(statement)">
				<v-card-item>
					<div class="d-flex justify-space-between align-start">
						<div class="d-flex align-center">
							<!-- Icona/Avatar con iniziale G o S -->
							<v-avatar size="32" class="mr-3"
								:color="statement.sectorThemes && statement.sectorThemes.length > 0 ? 'secondary' : 'primary'">
								<span class="white--text">{{ statement.sectorThemes && statement.sectorThemes.length > 0
									? 'S' : 'G' }}</span>
							</v-avatar>
							<div>
								<div class="text-subtitle-1"><strong>{{ statement.shortName }}</strong></div>
								<div class="text-caption text-medium-emphasis">
									{{ statement.sectorThemes && statement.sectorThemes.length > 0 ?
										'Sector-specific' :
										'General' }}
								</div>
							</div>
						</div>
						<v-btn icon variant="text" size="small" @click.stop="deleteStatement(statement.id)">
							<v-icon>mdi-delete</v-icon>
						</v-btn>
					</div>
				</v-card-item>

				<!-- Parte centrale con immagine segnaposto -->
				<div class="image-placeholder bg-grey-lighten-3">
					<v-icon size="64" color="grey-darken-1">mdi-image</v-icon>
				</div>

				<v-card-text>
					<p class="font-weight-bold mb-1">Nome esteso</p>
					<p class="text-medium-emphasis mb-3">{{ statement.longName }}</p>

					<p class="font-weight-bold mb-1">Description:</p>
					<p class="text-medium-emphasis text-caption">
						{{ statement.description || 'Nessuna descrizione disponibile.' }}</p>
				</v-card-text>
			</v-card>
		</div>
		<v-alert v-else type="info" variant="tonal" class="mt-4">
			Nessuno statement trovato con i filtri correnti.
		</v-alert>
	</div>
</template>

<style scoped>
.statements-list-container {
	/* background-color: aquamarine; */
	min-width: 100%;
	/* Aggiunge un po' di padding per non incollare ai bordi */
	padding: 20px;
}

.statements-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 16px;
}

.statement-card {
	display: flex;
	flex-direction: column;
	height: 100%;
}

.image-placeholder {
	height: 120px;
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 0 16px;
	border-radius: 4px;
}
</style>
