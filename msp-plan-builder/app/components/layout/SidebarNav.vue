<!-- app/components/layout/SidebarNav.vue -->
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useScenarioStore } from '@/stores/scenarioStore';

const router = useRouter();
const route = useRoute();
const scenarioStore = useScenarioStore();
const { scenarios } = storeToRefs(scenarioStore);

interface NavItem {
	name: string;
	icon: string;
	path: string;
	isActive: boolean;
}

const navItems = computed<NavItem[]>(() => [
	{
		name: 'Area',
		icon: 'mdi-earth',
		path: '/areas/1',
		isActive: route.path.startsWith('/areas')
	},
	...scenarios.value.map((scenario, index) => ({
		name: scenario.name || `Scenario ${index + 1}`,
		icon: index === 0 ? 'mdi-chart-bar' : 'mdi-chart-line',
		path: `/scenarios/${scenario.id}`,
		isActive: route.path.startsWith(`/scenarios/${scenario.id}`)
	})),
	{
		name: 'Mappa di esempio',
		icon: 'mdi-chart-line',
		path: '/map-page',
		isActive: route.path.startsWith('/map-page')
	}
]);

const createNewScenario = async () => {
	const newScenario = scenarioStore.createNewScenario();
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
			<v-list-item v-for="item in navItems" :key="item.name" :to="item.path" :value="item.name"
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
