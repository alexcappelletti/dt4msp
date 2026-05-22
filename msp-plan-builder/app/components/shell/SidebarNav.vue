<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { useScenarioStore } from '@/stores/scenarioStore';
import { map } from 'lodash-es';
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const scenarioStore = useScenarioStore();
const { scenarios, currentProject } = storeToRefs(scenarioStore);
const { authenticated, refresh } = useAuth();

interface NavItem {
	id: string;
	name: string;
	icon: string;
	path: string;
	isActive: boolean;
}

const activeScenarioId = computed(() => {
	const paramPk = route.params.pk;
	if (typeof paramPk === 'string' && paramPk.trim()) return paramPk;
	return '';
});

const hasAssociatedMap = computed(
	() => !!currentProject.value?.areaOfInterest?.associatedMap
);

const navItems = computed<NavItem[]>(() => {
	const items: NavItem[] = [
		{
			id: 'area',
			name: currentProject.value?.areaOfInterest?.name || 'Area',
			icon: 'mdi-earth',
			path: `/areas/${currentProject.value?.areaOfInterest?.id || ''}`,
			isActive: route.path.startsWith('/areas') && route.path.includes(currentProject.value?.areaOfInterest?.id || '')
		}
	];
	if (hasAssociatedMap.value) {
		const geonodeMapPk = currentProject.value?.areaOfInterest?.associatedMap?.pk || '--';
		items.push({
			id: 'map',
			name: "Risorse spaziali",
			icon: 'mdi-map',
			path: `/spatial-resources/${currentProject.value?.areaOfInterest?.associatedMap?.pk || ''}`,
			isActive: route.path.startsWith('/spatial-resources') && route.path.includes(geonodeMapPk)
		});
	}	

	// // Aggiungi "Risorse Spaziali" se c'è una mappa associata all'area
	// if (currentProject.value?.areaOfInterest?.associatedMap?.pk) {
	// 	items.push({
	// 		id: 'spatial-resources',
	// 		name: 'Risorse Spaziali',
	// 		icon: 'mdi-layers',
	// 		path: `/spatial-resources/${currentProject.value.areaOfInterest.associatedMap.pk}/spatial-resources`,
	// 		
	// 	});
	// }

	// Aggiungi scenari
	items.push(
		...scenarios.value.map((scenario, index) => ({
			id: `scenario-${scenario.id}`,
			name: scenario.name || `Scenario ${index + 1}`,
			icon: index === 0 ? 'mdi-chart-bar' : 'mdi-chart-line',
			path: `/scenarios/${scenario.id}`,
			isActive: activeScenarioId.value === scenario.id
		}))
	);

	// Aggiungi Home
	items.push({
		id: 'home',
		name: 'Home',
		icon: 'mdi-home-outline',
		path: '/',
		isActive: route.path === '/'
	});

	return items;
});

onMounted(async () => {
	await refresh();
	if (!authenticated.value) return;
	if (scenarios.value.length > 0) return;
	try {
		await scenarioStore.fetchProjectScenarios('prj-2026-001');
	} catch (error) {
		console.error('Errore caricamento scenari in sidebar:', error);
	}
});

const createNewScenario = async () => {
	const newScenario = await scenarioStore.createNewScenario();
	await router.push(`/scenarios/${newScenario.id}`);
};
</script>

<template>
	<v-navigation-drawer app permanent width="250" class="sidebar-nav">
		<!-- Rimosso il logo "Map" per allinearci all'immagine -->

		<div class="pa-4 pt-6">
			<v-btn class="new-scenario-btn" block @click="createNewScenario" prepend-icon="mdi-pencil">
				New scenario
			</v-btn>
		</div>

		<!-- Lista di navigazione compatta -->
		<v-list density="compact" nav class="pa-4 pt-0">
			<v-list-item v-for="item in navItems" :key="item.id" :to="item.path" :value="item.path"
				:active="item.isActive" :prepend-icon="item.icon" class="nav-item">
				<v-list-item-title>{{ item.name }}</v-list-item-title>
			</v-list-item>
		</v-list>
	</v-navigation-drawer>
</template>

<style lang="scss" scoped>
.sidebar-nav {
	// Sfondo della sidebar generale (leggermente rosa/viola chiaro)
	background-color: #fef7ff !important;
	padding-top: 0;

	.new-scenario-btn {
		// Stile a "pillola" e colore di sfondo come nell'immagine
		background-color: $bt-color !important;
		//color: #5d3aee !important;
		border-radius: 15px; // Forma a pillola
		box-shadow: none;
		text-transform: none; // Rimuovi maiuscolo automatico
	}

	.nav-item {
		margin-bottom: 8px;
		color: #333;
		border-radius: 20px; // Forma a pillola per gli item
		min-height: 40px; // Rendi gli item più compatti

		/* Stile per l'elemento attivo (es. "Areas" nell'immagine) */
		&.v-list-item--active {
			background-color: $main-dark-rose-color !important; // Usa il tuo main-purple/rose scuro
			//color: white !important;
			font-weight: 500;

			/* Rendi l'icona bianca quando l'item è attivo */
			:deep(.v-list-item__prepend .v-icon) {
				color: white !important;
			}
		}

		/* Stile di default delle icone */
		:deep(.v-list-item__prepend .v-icon) {
			color: #5d3aee; // Colore delle icone non attive
		}
	}
}
</style>
