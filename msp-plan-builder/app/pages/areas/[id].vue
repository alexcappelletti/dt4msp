<script setup lang="ts">
// Puoi recuperare l'ID dalla route se vuoi fetchare i dati reali
const route = useRoute();
const areaId = route.params.id; 
</script>

<!-- pages/areas/[id].vue -->
<template>
	<div>
		<h1 class="text-h4 mb-4">Area Pagina: generale</h1>

		<div class="d-flex ga-4">
			<!-- Sidebar di navigazione Scenari (come nell'immagine) -->
			<v-card width="250" class="flex-shrink-0">
				<v-list density="compact" nav>
					<v-list-item title="Nuovo Scenario" prepend-icon="mdi-pencil-box-multiple-outline"
						color="primary"></v-list-item>
					<v-divider class="my-2"></v-divider>
					<v-list-item title="Area" prepend-icon="mdi-web"></v-list-item>
					<v-list-item title="Scenario 1" prepend-icon="mdi-crosshairs-gps"></v-list-item>
					<v-list-item title="Scenario 2" prepend-icon="mdi-crosshairs-gps"></v-list-item>
					<v-list-item title="Scenario 3" prepend-icon="mdi-crosshairs-gps"></v-list-item>
				</v-list>
			</v-card>

			<!-- Contenuto Principale -->
			<areas-area-form-general />
		</div>
	</div>
</template>
