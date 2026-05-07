<script setup lang="ts">
import type { Statement, Theme } from '#/shared/types/msp-project';
import { computed, ref } from 'vue';

const props = defineProps<{
	statements: Statement[];
}>();

const emit = defineEmits(['delete:statement', 'edit:statement']);

type FilterType = 'Tutti' | 'Generale' | 'Sector-specific';
const currentFilter = ref<FilterType>('Tutti');
const availableFilters: FilterType[] = ['Tutti', 'Generale', 'Sector-specific'];
const selectedThemeKey = ref<string | null>(null);

const availableThemes = computed<Theme[]>(() => {
	const all = (props.statements ?? []).flatMap((statement) => statement.sectorThemes ?? []);
	const merged = new Map<string, Theme>();
	for (const theme of all) {
		const key = theme?.indexName || theme?.name || theme?.id;
		if (!key) continue;
		merged.set(key, theme);
	}
	return [...merged.values()];
});

const selectedThemeLabel = computed(() => {
	if (!selectedThemeKey.value) return 'Tema';
	const found = availableThemes.value.find(
		(theme) => (theme.indexName || theme.name || theme.id) === selectedThemeKey.value,
	);
	return found?.name || 'Tema';
});

const filteredStatements = computed(() => {
	let list = props.statements ?? [];

	if (currentFilter.value === 'Generale') {
		list = list.filter((statement) => !statement.sectorThemes || statement.sectorThemes.length === 0);
	} else if (currentFilter.value === 'Sector-specific') {
		list = list.filter((statement) => Array.isArray(statement.sectorThemes) && statement.sectorThemes.length > 0);
	}

	if (selectedThemeKey.value) {
		list = list.filter((statement) =>
			(statement.sectorThemes ?? []).some(
				(theme) => (theme.indexName || theme.name || theme.id) === selectedThemeKey.value,
			),
		);
	}

	return list;
});

const deleteStatement = (id: string) => {
	emit('delete:statement', id);
};

const editStatement = (statement: Statement) => {
	emit('edit:statement', statement);
};
</script>

<template>
	<div class="statements-list-container">
		<div class="filters-container mb-4 d-flex align-center">
			<span class="text-caption mr-4">Filtri:</span>
			<v-chip-group mandatory selected-class="text-primary" v-model="currentFilter">
				<v-chip v-for="filter in availableFilters" :key="filter" :value="filter">
					{{ filter }}
				</v-chip>
			</v-chip-group>

			<v-menu class="ml-3">
				<template #activator="{ props: menuProps }">
					<v-chip v-bind="menuProps" append-icon="mdi-menu-down" variant="outlined">
						{{ selectedThemeLabel }}
					</v-chip>
				</template>

				<v-list density="compact" style="min-width: 240px">
					<v-list-item title="Tutti i temi" @click="selectedThemeKey = null" />
					<v-divider />
					<v-list-item
						v-for="theme in availableThemes"
						:key="theme.id"
						:title="theme.name"
						@click="selectedThemeKey = theme.indexName || theme.name || theme.id"
					/>
				</v-list>
			</v-menu>
		</div>

		<div v-if="filteredStatements.length > 0" class="statements-grid">
			<v-card
				v-for="statement in filteredStatements"
				:key="statement.id"
				class="statement-card hover-effect"
				@click="editStatement(statement)"
			>
				<v-card-item>
					<div class="d-flex justify-space-between align-start">
						<div class="d-flex align-center">
							<v-avatar
								size="32"
								class="mr-3"
								:color="statement.sectorThemes && statement.sectorThemes.length > 0 ? 'secondary' : 'primary'"
							>
								<span class="white--text">
									{{ statement.sectorThemes && statement.sectorThemes.length > 0 ? 'S' : 'G' }}
								</span>
							</v-avatar>
							<div>
								<div class="text-subtitle-1"><strong>{{ statement.shortName }}</strong></div>
								<div class="text-caption text-medium-emphasis">
									{{ statement.sectorThemes && statement.sectorThemes.length > 0 ? 'Sector-specific' : 'General' }}
								</div>
							</div>
						</div>
						<v-btn icon variant="text" size="small" @click.stop="deleteStatement(statement.id)">
							<v-icon>mdi-delete</v-icon>
						</v-btn>
					</div>
				</v-card-item>

				<div class="image-placeholder bg-grey-lighten-3">
					<v-icon size="64" color="grey-darken-1">mdi-image</v-icon>
				</div>

				<v-card-text>
					<p class="font-weight-bold mb-1">Nome esteso</p>
					<p class="text-medium-emphasis mb-3">{{ statement.longName }}</p>

					<p class="font-weight-bold mb-1">Description:</p>
					<p class="text-medium-emphasis text-caption">
						{{ statement.description || 'Nessuna descrizione disponibile.' }}
					</p>
				</v-card-text>
			</v-card>
		</div>

		<v-alert v-else type="info" variant="tonal" class="mt-4">
			Nessuno statement trovato con i filtri correnti.
		</v-alert>
	</div>
</template>

<style scoped>
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

