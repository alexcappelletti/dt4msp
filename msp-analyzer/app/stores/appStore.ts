import { error } from "happy-dom/lib/PropertySymbol.js";
import { defineStore } from "pinia";

export const useAppStore = defineStore('appStore', ()=>{
	const error = ref<string|null> (null)
	const title = ref<string>('MSP-Analyzer')
	const drawerOpen = ref(false);

	function setError(err: string|null){
		if (err) {
			error.value = err;
		}
	}
	const getError = computed(() => error.value)
	const appTitle = computed(()=> title.value)


	return {
		getError,
		setError,
		appTitle,
		drawerOpen,
	}

})