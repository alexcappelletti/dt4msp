
<script setup lang="ts">
import { ref } from 'vue'
import ScenarioDetails from '@/components/scenarioDetails.vue'
import commandPreview from '~/components/commandPreview.vue';

  
// const layers = [
// 	{ id: 'layer-001', name: 'Vegetazione', type: 'raster' },
// 	{ id: 'layer-002', name: 'Qualità dell\'aria', type: 'vector' },
// 	{ id: 'layer-003', name: 'Popolazione', type: 'vector' }
// ]
</script>

<template>
	<CommandPreview></CommandPreview>
	<!-- <ScenarioDetails></ScenarioDetails> -->
   
</template>

<style scoped lang="scss">

.container {
	max-width: 800px;
	margin: 2rem auto;
	padding: 1rem;
	//font-family: $font-primary;
}

h1 {
	color: $color-primary;
	
}

ul {
	list-style: none;
	padding: 0;
}

li {
	background: #f0f0f0;
	margin: 0.5rem 0;
	padding: 0.5rem;
	border-radius: 4px;
}
</style>