<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
// Puoi recuperare l'ID dalla route se vuoi fetchare i dati reali
const route = useRoute();
const areaId = route.params.id; 

onMounted(async() => {
	// Logica per fetchare i dati dell'area usando areaId
	
});


</script>

<!-- pages/areas/[id].vue -->
<template>
	<div class="d-flex areaOI-panel">
			
			<!-- Contenuto Principale -->
			<area-general-form />
		</div>
</template>

<style scoped>


.areaOI-panel {
	background-color: rgb(var(--v-theme-main-rose)) !important;
	

}



</style>
