<!-- layouts/default.vue -->
<template>
		<!-- Il layout principale ha un unico elemento radice -->
		<v-app class="app-layout">
			<!-- L'header della pagina, auto-importato da app/components/layout/AppHeader.vue -->
			<LayoutAppHeader />
			<!-- La sidebar di navigazione, auto-importata da app/components/layout/SidebarNav.vue -->
			<LayoutSidebarNav />

			<!-- Questa Š l'area in cui Nuxt inietta il contenuto della pagina corrente (es. pages/areas/[id].vue) -->
			<v-main>
				<slot />
			</v-main>
		</v-app>
	
</template>

<style lang="scss" scoped>
/* Stili di base per replicare il layout mostrato nella tua immagine */
.app-layout {
	display: flex;
	/* Affianca la sidebar e l'area principale */
	min-height: 100vh;
	//background-color: $main-rose-color !important;

}

.main-content-area {
	flex-grow: 1;
	/* Permette all'area del contenuto di espandersi */
	display: flex;
	flex-direction: column;
	//background-color: $main-rose-color !important;

}

.page-wrapper {
	padding: 20px;
	/* L'area bianca che contiene il form nell'immagine sar… gestita dal CSS della pagina stessa */
}
</style>
