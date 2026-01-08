<script setup lang="ts">
// In Nuxt 4, puoi accedere al titolo della pagina definito nelle meta.
const route = useRoute();
const pageTitle = computed(() => route.meta.title || 'MSP-plan builder');

// Potresti anche aggiungere logica per l'autenticazione utente qui in futuro.
</script>

<template>
	<v-app-bar app class="app-header" elevation="0">
		<div class="header-title">
			{{ pageTitle }}
		</div>
		<v-spacer></v-spacer>
		<div class="user-profile">
			<!-- Icone segnaposto per l'utente e le impostazioni -->
			<span class="icon">⚙️</span>
			<span class="icon">👤</span>
		</div>
	</v-app-bar>
</template>

<style lang="scss" scoped>
.app-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20px;
	height: 60px;
	/* Altezza fissa per l'header */
	background-color: $main-rose-color !important;;
	/* Sfondo bianco come nell'immagine */
	border-bottom: 1px solid #e0e0e0;
	//box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-title {
	font-size: 1rem;
	font-weight: 500;
	color: #333;
}

.user-profile {
	display: flex;
	gap: 15px;
}

.icon {
	cursor: pointer;
	font-size: 1.2rem;
}
</style>