<!-- app.vue -->
<script setup lang="ts">
// Puoi usare qui logica globale, meta tag, ecc.
useHead({
	titleTemplate: '%s - MSP Plab Builder',
	meta: [
		{ name: 'description', content: 'Applicazione di gestione di pianificazione ambienti marini' }
	],
})
</script>

<template>
	<!-- <NuxtLayout> gestisce l'uso del layout predefinito (layouts/default.vue) -->
	<!-- che al suo interno usa <slot /> per il contenuto. -->
	<NuxtLayout>
		<!-- <NuxtPage /> è dove Nuxt renderizza la pagina corrente in base alla URL -->
		<NuxtPage />
	</NuxtLayout>
</template>

<style>
/* Qui puoi mettere CSS globale che si applica a tutta l'app */
</style>
