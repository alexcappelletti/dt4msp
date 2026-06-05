import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useTabsStore = defineStore('tabs', () => {
	// Tab state per diverse sezioni
	const areaTab = ref<'general' | 'statements' | 'map'>('general');
	const scenarioTab = ref<'general' | 'statements' | 'measures' | 'effects' | 'feedback'>('general');
	const spatialTab = ref<string>('datasets');

	// Resetta i tab (es. al logout)
	const resetTabs = () => {
		areaTab.value = 'general';
		scenarioTab.value = 'general';
		spatialTab.value = 'datasets';
	};

	// Setters con type safety
	const setAreaTab = (tab: 'general' | 'statements' | 'map') => {
		areaTab.value = tab;
	};

	const setScenarioTab = (tab: 'general' | 'statements' | 'measures' | 'effects' | 'feedback') => {
		scenarioTab.value = tab;
	};

	const setSpatialTab = (tab: string) => {
		spatialTab.value = tab;
	};

	return {
		areaTab,
		scenarioTab,
		spatialTab,
		resetTabs,
		setAreaTab,
		setScenarioTab,
		setSpatialTab,
	};
});
