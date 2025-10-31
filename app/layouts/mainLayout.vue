<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useWindowSize } from '@vueuse/core';
import { useDisplay } from 'vuetify';
import loaderNav from '~/components/loaderNav.vue';
const { width } = useWindowSize(); 
const { mdAndUp } = useDisplay();

const MIN_DRAWER_WIDTH = 290;

const drawerWidth = computed(() => {
	// Se lo schermo è 'mdAndUp' (medio o più grande), usiamo la logica dei 290 minimi
	if (mdAndUp.value) {
		// Calcolo proporzionale reattivo
		const proportionalWidth = Math.round(width.value * (2 / 12));
		console.log(`Larghezza browser: ${width.value}px, Larghezza proporzionale drawer: ${proportionalWidth}px`);
		// Restituisce il valore più grande tra la larghezza proporzionale e la larghezza minima
		return Math.max(proportionalWidth, MIN_DRAWER_WIDTH);
	}
	// Per schermi più piccoli, usiamo una larghezza fissa o proporzionale ridotta.
	return 300; 
});

const drawerOpen = ref(false);


</script>

<template>
	
		<v-app >
			<v-app-bar 
				elevation="0" 
				color="primary"
				title="Geostory analyzer --" >
				
				<!-- pulsante per aprire il drawer su schermi piccoli -->
				<template v-if="!mdAndUp">
					<v-app-bar-nav-icon @click="drawerOpen = !drawerOpen"></v-app-bar-nav-icon>
				</template>

			</v-app-bar>
			<v-navigation-drawer
				:permanent="mdAndUp"
				:temporary="!mdAndUp"
				v-model="drawerOpen"
				:width="drawerWidth">
				<loaderNav/>				
			</v-navigation-drawer>
			<v-main >
				<slot>
					<p >⚠️ Slot "body" non ricevuto</p>
				</slot>	
			</v-main>

		</v-app>
	
</template>
<style scoped >

</style>