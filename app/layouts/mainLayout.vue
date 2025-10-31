<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import Header from '@/components/header.vue'


// Referenza per la larghezza della finestra, inizializzata a 0 per la compatibilità SSR
const windowWidth = ref(0);

const drawerWidth = computed(() => {
  const width = windowWidth.value;
  // Calcola la larghezza proporzionale e la converte in pixel
  const result = Math.round(width * (2 / 12)); 
  return result;
});

// Funzione per aggiornare la larghezza della finestra
function handleResize() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  // Imposta la larghezza iniziale
  handleResize();
  // Aggiunge il listener per l'evento di resize della finestra
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  // Rimuove il listener prima che il componente venga smontato
  window.removeEventListener('resize', handleResize);
});

// import Header from '@/components/header.vue'
import loaderNav from '~/components/loaderNav.vue';
</script>


<template>
	<v-responsive>
		<v-app >
			<v-app-bar 
				elevation="0" 
				class="appBar"
				title="Geostory analyzer" >
				
			</v-app-bar>
			<v-navigation-drawer
				permanent
				:width="drawerWidth">
				<loader-nav></loader-nav>
			</v-navigation-drawer>
			<v-main  class="tw-bg-gray-100">
				<slot>
					<p >⚠️ Slot "body" non ricevuto</p>
				</slot>	
			</v-main>

		</v-app>
	</v-responsive>
	
</template>
<style scoped >
@reference "@/assets/css/tailwind.css";


.appBar {
  @apply tw:bg-ux1 tw:text-ux5 tw:font-roboto;
  
}

.custom-drawer-width {
  /* // Imposta la larghezza a 25% con una larghezza minima di 500px
	width: clamp(600px, 25%, 100vw) !important; */
}

</style>