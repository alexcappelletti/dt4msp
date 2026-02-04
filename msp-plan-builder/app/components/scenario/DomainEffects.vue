<script setup lang="ts">
import { computed, ref } from "vue";
import type { DomainEffect, DomainMeasure, Theme } from "#/shared/types/msp-project";

interface MenuItem {
	title: string;
	icon: string;
	action: (effect: DomainEffect) => void;
}

const props = defineProps<{
	domainEffects: DomainEffect[];
}>();

const emit = defineEmits<{
	(e: "edit:effect", effect: DomainEffect): void;
	(e: "delete:effect", effect: DomainEffect): void;
	(e: "clone:effect", effect: DomainEffect): void;
}>();

const store = useScenarioStore();
const availableThemes = computed(() => store.availableThemes);

// --- Filters (come Measures) ---
type EffectFilter = "Tutti" | "Spatial" | "Non-spatial";
const currentFilter = ref<EffectFilter>("Tutti");

// Theme filter (opzionale, ma utile visto il mock UI)
const selectedThemeId = ref<string | null>(null);

function effectType(effect: DomainEffect): "Spatial" | "Non-spatial" {
	const first = effect.affected?.[0] as DomainMeasure | undefined;
	if (!first) return "Non-spatial"; // fallback sensato
	return first.type === "Spatial" ? "Spatial" : "Non-spatial";
}

function isSpatialEffect(effect: DomainEffect) {
	return effectType(effect) === "Spatial";
}

// Unione dei temi degli affected
function themesForEffect(effect: DomainEffect): Theme[] {
	const all = (effect.affected ?? []).flatMap((m) => m.referenceThemes ?? []);
	const map = new Map<string, Theme>();
	for (const th of all) map.set(th.id, th);
	return [...map.values()];
}

const filteredEffects = computed(() => {
	let list = props.domainEffects ?? [];

	if (currentFilter.value === "Spatial") {
		list = list.filter(isSpatialEffect);
	} else if (currentFilter.value === "Non-spatial") {
		list = list.filter((e) => !isSpatialEffect(e));
	}

	if (selectedThemeId.value) {
		list = list.filter((e) =>
			themesForEffect(e).some((t) => t.id === selectedThemeId.value),
		);
	}

	return list;
});

const menuItems = (effect: DomainEffect): MenuItem[] => [
	{ title: "Duplicate", icon: "mdi-content-copy", action: (e) => emit("clone:effect", e) },
	{ title: "Delete", icon: "mdi-delete", action: (e) => emit("delete:effect", e) },
];
</script>

<template>
	<div class="measures-list-container">
		<!-- Filtri -->
		<div class="filters-container mb-4 d-flex align-center">
			<span class="text-caption mr-4">Filtri:</span>

			<v-chip-group mandatory selected-class="text-primary" v-model="currentFilter">
				<v-chip value="Tutti">Tutti</v-chip>
				<v-chip value="Spatial">Spatial</v-chip>
				<v-chip value="Non-spatial">Non-spatial</v-chip>
			</v-chip-group>

			<!-- Dropdown Theme -->
			<v-menu class="ml-3">
				<template #activator="{ props: menuProps }">
					<v-chip v-bind="menuProps" append-icon="mdi-menu-down" variant="outlined">
						Tema
					</v-chip>
				</template>

				<v-list density="compact" style="min-width: 240px">
					<v-list-item title="Tutti i temi" @click="selectedThemeId = null" />
					<v-divider />
					<v-list-item v-for="t in availableThemes" :key="t.id" :title="t.name"
						@click="selectedThemeId = t.id" />
				</v-list>
			</v-menu>
		</div>

		<!-- Cards -->
		<div v-if="filteredEffects.length > 0" class="measures-grid">
			<v-card v-for="effect in filteredEffects" :key="effect.id" class="measure-card hover-effect"
				@click="emit('edit:effect', effect)">
				<v-card-item>
					<div class="d-flex justify-space-between align-start">
						<div class="d-flex align-center">
							<v-avatar size="32" class="mr-3" :color="isSpatialEffect(effect) ? 'secondary' : 'primary'">
								<span class="white--text">{{ isSpatialEffect(effect) ? "S" : "N" }}</span>
							</v-avatar>

							<div>
								<div class="text-subtitle-1">
									<strong>{{ effect.name }}</strong>
								</div>
								<div class="text-caption text-medium-emphasis">
									{{ isSpatialEffect(effect) ? "Spatial" : "Non-spatial" }} effect
								</div>
							</div>
						</div>

						<v-menu>
							<template #activator="{ props: menuProps }">
								<v-btn icon variant="text" size="small" v-bind="menuProps" @click.stop>
									<v-icon>mdi-dots-vertical</v-icon>
								</v-btn>
							</template>

							<v-list density="compact">
								<v-list-item v-for="(item, index) in menuItems(effect)" :key="index"
									@click="item.action(effect)">
									<template #prepend>
										<v-icon :icon="item.icon" />
									</template>
									<v-list-item-title>{{ item.title }}</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>
					</div>
				</v-card-item>

				<!-- placeholder immagine SOLO per Spatial -->
				<div v-if="isSpatialEffect(effect)" class="image-placeholder bg-grey-lighten-3">
					<v-icon size="64" color="grey-darken-1">mdi-image</v-icon>
				</div>

				<v-card-text>
					<!-- long name (non esiste nel model Effect: metto id come fallback) -->
					<p class="font-weight-bold mb-1">{{ effect.id }}</p>

					<!-- themes selected (unione dei referenceThemes degli affected) -->
					<div v-if="themesForEffect(effect).length" class="d-flex flex-wrap ga-2 mb-2">
						<v-chip v-for="(theme, index) in themesForEffect(effect)" :key="theme.id ?? index"
							size="x-small" variant="tonal" color="primary" class="text-caption">
							{{ theme.name }}
						</v-chip>
					</div>

					<p class="text-medium-emphasis text-caption">
						{{ effect.description || "Nessuna descrizione disponibile." }}
					</p>
				</v-card-text>
			</v-card>
		</div>

		<v-alert v-else type="info" variant="tonal" class="mt-4">
			Nessun effetto trovato.
		</v-alert>
	</div>
</template>

<style scoped>
.measures-list-container {
	min-width: 100%;
	padding: 20px;
}

.measures-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
	gap: 16px;
}

.measure-card {
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
