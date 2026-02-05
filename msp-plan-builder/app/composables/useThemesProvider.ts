import { useScenarioStore } from "@/stores/scenarioStore";
import { computed, onMounted, ref } from "vue";

export function useThemesProvider() {
	const scenarioStore = useScenarioStore();

	// Stato reattivo
	const loading = ref(false);
	const error = ref<Error | null>(null);

	const fetchThemes = async () => {
		loading.value = true;
		error.value = null;
		try {
			// Assumiamo che il metodo nello store sia async
			// Se i temi sono già nello store, usiamo quelli, altrimenti fetch
			if (scenarioStore.availableThemes.length === 0) {
				await scenarioStore.fetchAvailableThemes();
			}
		} catch (e) {
			error.value = e as Error;
			console.error("Errore nel caricamento temi:", e);
		} finally {
			loading.value = false;
		}
	};

	// Opzionale: carica automaticamente al montaggio del componente che lo usa
	onMounted(fetchThemes);

	return {
		availableThemes: computed(() => scenarioStore.availableThemes),
		loading,
		error,
		fetchThemes,
	};
}
