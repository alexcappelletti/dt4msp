<script setup lang="ts">
import SpatialDatasetCard from "@/components/spatial-resources/SpatialDatasetCard.vue";
import type { SpatialResourceGroup } from "@/stores/spatialStore";
import { computed } from "vue";

const props = defineProps<{
	groups: SpatialResourceGroup[];
	searchText: string;
	sortBy: "title" | "popular" | "created";
	sortOptions: Array<{ label: string; value: "title" | "popular" | "created" }>;
	datasetCountLabel: string;
	expandedDescriptionPks: string[];
}>();

const emit = defineEmits<{
	"update:searchText": [value: string];
	"update:sortBy": [value: "title" | "popular" | "created"];
	"select-dataset": [pk: string];
	"toggle-description": [pk: string];
}>();

const updateSearchText = (value: string | null) => {
	emit("update:searchText", value ?? "");
};

const updateSortBy = (value: "title" | "popular" | "created" | null) => {
	if (value) {
		emit("update:sortBy", value);
	}
};

const isDescriptionExpanded = (pk: string) =>
	props.expandedDescriptionPks.includes(pk);

const specificGroup = computed(
	() => props.groups.find((group) => group.group === "specific") ?? null,
);

const generalGroup = computed(
	() => props.groups.find((group) => group.group === "general") ?? null,
);
</script>

<template>
	<div>
		<div class="filters-row">
			<v-text-field
				:model-value="searchText"
				label="Ricerca layer"
				variant="outlined"
				prepend-inner-icon="mdi-magnify"
				clearable
				hide-details
				class="mr-4"
				@update:model-value="updateSearchText"
			/>
			<v-select
				:model-value="sortBy"
				:items="sortOptions"
				label="Ordina per"
				hide-details
				variant="outlined"
				class="sort-select"
				@update:model-value="updateSortBy"
			/>
		</div>

		<p class="text-caption text-medium-emphasis mb-2">
			{{ datasetCountLabel }}
		</p>

		<div
			v-if="groups.length === 0"
			class="empty-state"
		>
			<v-icon size="48" class="text-grey-5">mdi-database-off-outline</v-icon>
			<p class="mt-4 text-body2">Nessun layer trovato</p>
		</div>

		<div v-else>
			<section
				v-if="specificGroup"
				class="resource-group"
			>
				<h3 class="group-label">Layer definiti per l'area</h3>
				<div class="datasets-grid">
					<SpatialDatasetCard
						v-for="item in specificGroup.items"
						:key="item.pk"
						:item="item"
						:group="specificGroup.group"
						:description-expanded="isDescriptionExpanded(item.pk)"
						@select="emit('select-dataset', $event)"
						@toggle-description="emit('toggle-description', $event)"
					/>
				</div>
			</section>

			<section
				v-if="generalGroup"
				class="resource-group"
			>
				<h3 class="group-label">{{ generalGroup.label }}</h3>
				<div class="datasets-grid">
					<SpatialDatasetCard
						v-for="item in generalGroup.items"
						:key="item.pk"
						:item="item"
						:group="generalGroup.group"
						:description-expanded="isDescriptionExpanded(item.pk)"
						@select="emit('select-dataset', $event)"
						@toggle-description="emit('toggle-description', $event)"
					/>
				</div>
			</section>
		</div>
	</div>
</template>

<style scoped lang="scss">
	.datasets-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 320px));
		justify-items: start;
		grid-auto-flow: row;
		gap: 1.5rem;
		padding: 1rem 0;
	}

	.resource-group {
		margin-bottom: 2rem;
	}

	.group-label {
		font-size: 1rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: rgba(0, 0, 0, 0.87);
	}

	.filters-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.sort-select {
		min-width: 220px;
		width: 100%;
		max-width: 280px;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 300px;
		color: var(--v-theme-grey);
		width: 100%;
	}

	@media (max-width: 960px) {
		.datasets-grid {
			grid-template-columns: repeat(auto-fit, minmax(260px, 260px));
			justify-content: start;
			justify-items: start;
		}
	}

	@media (max-width: 620px) {
		.datasets-grid {
			grid-template-columns: 1fr;
			justify-content: stretch;
		}
	}
</style>
