<!-- app/components/layout/SidebarNav.vue -->
<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

interface NavItem {
	name: string;
	icon: string;
	path: string;
	isActive: boolean;
}

const navItems = computed<NavItem[]>(() => [
	{
		name: 'Areas',
		icon: 'mdi-earth',
		path: '/areas/1',
		isActive: route.path.startsWith('/areas')
	},
	{
		name: 'Scenario 1',
		icon: 'mdi-chart-bar',
		path: '/scenarios/1',
		isActive: route.path.startsWith('/scenarios/1')
	},
	{
		name: 'Scenario 2',
		icon: 'mdi-chart-line',
		path: '/scenarios/2',
		isActive: route.path.startsWith('/scenarios/2')
	},
	{
		name: 'Scenario 3',
		icon: 'mdi-chart-line',
		path: '/scenarios/3',
		isActive: route.path.startsWith('/scenarios/3')
	}
]);

const createNewScenario = () => {
	alert('Simulazione: creazione nuovo scenario');
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
