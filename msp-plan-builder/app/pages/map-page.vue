<script setup lang="ts">
import { mapRequestsMock } from "#/shared/mocks/mocked";

const mapRequests = mapRequestsMock;
const emptyMapRequests = ref<Array<MapRequest>>([]) // Per testare il caso senza dati	
</script>
<template>
	<MapViewer :visuals="emptyMapRequests" :info="true" class="tw:h-full tw:w-full" />
</template>
