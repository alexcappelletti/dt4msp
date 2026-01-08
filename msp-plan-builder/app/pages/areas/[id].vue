<script setup lang="ts">
// Puoi recuperare l'ID dalla route se vuoi fetchare i dati reali
const route = useRoute();
const areaId = route.params.id; 
</script>

<!-- pages/areas/[id].vue -->
<template>
	<div class="d-flex areaOI-panel">
			

			<!-- Contenuto Principale -->
			<areas-area-form-general />
		</div>
</template>

<style scoped>


.areaOI-panel {
	background-color: rgb(var(--v-theme-main-rose)) !important;
	

}



</style>
