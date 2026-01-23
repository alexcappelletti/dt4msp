<!-- app/pages/index.vue -->
<script setup lang="ts">
// Opzione 1: Reindirizza automaticamente alla prima area quando si arriva alla root '/'
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';

const router = useRouter();

// Reindirizza non appena la pagina viene caricata lato client
onMounted(() => {
	//router.push('/areas/1');
});

// Imposta un titolo per questa pagina specifica
useHead({
	title: 'Home'
});
</script>

<template>
	<div>
		<!-- Mostra un messaggio di caricamento mentre avviene il redirect -->
		<h1>Caricamento in corso...</h1>
		<p>Verrai reindirizzato all'area principale del progetto.</p>
	</div>
</template>

<style scoped>
/* Nessuno stile specifico richiesto per questa pagina di reindirizzamento */
</style>
