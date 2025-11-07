<script setup lang="ts">
import mapViewer from '@/components/mapViewer.vue';
import { useGeostoryStore } from '~/stores/geostoryStore';

const store = useGeostoryStore()


</script>
<template>
	<mapViewer :visuals="store.mapVisuals" :info="false" class="tw:h-full tw:w-full" ></mapViewer>
</template> 
