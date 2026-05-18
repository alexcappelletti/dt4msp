<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import type { AreaOfInterest } from '#/shared/types/msp-project';
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

const route = useRoute();
const router = useRouter();
const scenarioStore = useScenarioStore();
const { currentProject } = storeToRefs(scenarioStore);
const areaId = computed(() => String(route.params.id || ''));
const areaData = ref<AreaOfInterest | null>(null);
const isLoadingArea = ref(true);
const projectMissing = ref(false);
const resolvedProjectId = ref('');
let loadSeq = 0;

const loadArea = async () => {
	const seq = ++loadSeq;
	isLoadingArea.value = true;
	try {
		if (!currentProject.value) {
			await scenarioStore.fetchProjectScenarios();
		}
		const project = currentProject.value;
		projectMissing.value = !project;
		resolvedProjectId.value = project?.id || '';
		const projectArea = project?.areaOfInterest || null;
		areaData.value = projectArea;

		if (projectArea?.id && projectArea.id !== areaId.value) {
			isLoadingArea.value = false;
			await router.replace(`/areas/${projectArea.id}`);
			return;
		}
	} catch (error) {
		console.error('Errore caricamento area del progetto:', error);
		projectMissing.value = true;
		areaData.value = null;
		resolvedProjectId.value = '';
	} finally {
		if (seq === loadSeq) {
			isLoadingArea.value = false;
		}
	}
};

watch(
	() => areaId.value,
	async () => {
		await loadArea();
	},
	{ immediate: true },
);


</script>

<!-- pages/areas/[id].vue -->
<template>
	<div class="d-flex areaOI-panel">
			
			<!-- Contenuto Principale -->
			<area-general-form :initial-area="areaData" :project-id="projectMissing ? '' : resolvedProjectId" :loading="isLoadingArea" />
		</div>
</template>

<style scoped>


.areaOI-panel {
	background-color: rgb(var(--v-theme-main-rose)) !important;
	width: 100%;
	height: 100%;
	min-height: 0;
	overflow: hidden;
}



</style>
