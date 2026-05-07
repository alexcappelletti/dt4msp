<script setup lang="ts">
import { onMounted, ref } from 'vue';

const scenarioStore = useScenarioStore();
const loadingMessage = ref('Caricamento progetto in corso...');

onMounted(async () => {
	try {
		const project = scenarioStore.currentProject ?? await scenarioStore.fetchProjectScenarios();
		const areaId = project?.areaOfInterest?.id;
		if (areaId) {
			await navigateTo(`/areas/${areaId}`, { replace: true });
			return;
		}
		loadingMessage.value = 'Nessuna area disponibile per questo progetto.';
	} catch {
		loadingMessage.value = 'Errore durante il caricamento del progetto.';
	}
});
</script>

<template>
	<div class="project-loading">
		<div class="loading-card">
			<v-progress-circular indeterminate color="primary" size="52" width="5" />
			<p class="loading-text">{{ loadingMessage }}</p>
		</div>
	</div>
</template>

<style scoped>
.project-loading {
	min-height: calc(100vh - 64px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
	background: #fef7ff;
}

.loading-card {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	background: #fff;
	border: 1px solid #eadcf4;
	border-radius: 14px;
	padding: 28px 32px;
	box-shadow: 0 8px 24px rgba(41, 19, 63, 0.08);
}

.loading-text {
	margin: 0;
	color: #4f3a61;
	font-weight: 500;
}
</style>
