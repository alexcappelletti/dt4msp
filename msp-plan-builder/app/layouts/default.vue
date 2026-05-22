<!-- layouts/default.vue -->
<template>
	<!-- Il layout principale ha un unico elemento radice -->
	<v-app class="app-layout">
		<!-- L'header della pagina, auto-importato da app/components/shell/AppHeader.vue -->
		<shell-app-header />
		<!-- La sidebar di navigazione, auto-importata da app/components/shell/SidebarNav.vue -->
		<shell-sidebar-nav />

		<!-- Questa Š l'area in cui Nuxt inietta il contenuto della pagina corrente (es. pages/areas/[id].vue) -->
		<v-main class="main-shell">
			<div class="page-slot">
				<slot />
			</div>
		</v-main>
	</v-app>

</template>

<style lang="scss" scoped>
/* Stili di base per replicare il layout mostrato nella tua immagine */
.app-layout {
	display: flex;
	/* Affianca la sidebar e l'area principale */
	height: 100dvh;
	overflow: hidden;
	background-color: $main-rose-color !important;

}

.main-shell {
	min-width: 0;
	min-height: 0;
	height: 100%;
	overflow: hidden;
}

.page-slot {
	flex: 1 1 auto;
	display: flex;
	height: 100%;
	min-width: 0;
	min-height: 0;
	overflow: hidden;
}

:deep(.v-main__wrap) {
	display: flex;
	flex: 1 1 auto;
	min-height: 0;
	height: 100%;
	overflow: hidden;
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
