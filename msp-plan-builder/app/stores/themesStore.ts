import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Theme } from "#/shared/types/msp-project";
import { useProjectStore } from "#/app/stores/projectStore";

function uniqueThemesById(themes: Theme[]): Theme[] {
	const unique = new Map<string, Theme>();
	for (const theme of themes) {
		if (!theme?.id) continue;
		if (!unique.has(theme.id)) {
			unique.set(theme.id, theme);
		}
	}
	return [...unique.values()];
}

export const useThemesStore = defineStore("themes", () => {
	const projectStore = useProjectStore();
	const predefinedThemes = ref<Theme[]>([]);
	const isThemesLoading = ref(false);
	const themesError = ref<unknown>(null);

	const areaDefinedThemes = computed<Theme[]>(() => {
		const source = projectStore.currentAreaOfInterest?.definedThemes ?? [];
		return Array.isArray(source) ? source : [];
	});

	const hasPredefinedThemes = computed(() => predefinedThemes.value.length > 0);

	async function fetchPredefinedThemes(projectId?: string): Promise<Theme[]> {
		const targetProjectId = projectId ?? projectStore.currentProjectId ?? "prj-2026-001";
		isThemesLoading.value = true;
		themesError.value = null;
		try {
			if (!projectStore.currentProject || projectStore.currentProject.id !== targetProjectId) {
				await projectStore.fetchProject(targetProjectId);
			}
			const nextThemes = uniqueThemesById(areaDefinedThemes.value);
			predefinedThemes.value = nextThemes;
			return nextThemes;
		} catch (error) {
			themesError.value = error;
			throw error;
		} finally {
			isThemesLoading.value = false;
		}
	}

	function setPredefinedThemes(themes: Theme[]) {
		predefinedThemes.value = uniqueThemesById(Array.isArray(themes) ? themes : []);
	}

	function clearThemes() {
		predefinedThemes.value = [];
		themesError.value = null;
	}

	return {
		predefinedThemes,
		areaDefinedThemes,
		hasPredefinedThemes,
		isThemesLoading,
		themesError,
		fetchPredefinedThemes,
		setPredefinedThemes,
		clearThemes,
	};
});
