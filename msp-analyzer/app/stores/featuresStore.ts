import type { LayerSpecification } from 'maplibre-gl'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {Layer} from '#/shared/types/gn-layer'
import { useLayerHelper } from '@/composables/useLayerHelper'


export const useMapElementsStore = defineStore('mapElements', ()=>{
	const features = ref<GeoJSON.FeatureCollection |null>(null)
	const layer = ref<Layer|null>(null)
	const styles = ref<LayerSpecification[]>([])
	

	function setMapElements(l: Layer, fc: GeoJSON.FeatureCollection, st: LayerSpecification[]){
		layer.value = l;
		styles.value = st;	
		features.value = fc;
	}

	const loadedFeatures = computed(() => {
		return features.value ;
	})
	const featCounts = computed(() => {
		return features.value ? features.value.features.length : 0;
	})
	const canHaveFeatures = computed(() => {
		if (layer.value === null) return false;
		const {ogcTypes} = useLayerHelper();
		const types = ogcTypes(layer.value);
		return types.some(t => t === "wfs" || t === "geojson");;
	})

	return {
		loadedFeatures,
		setMapElements,
		featCounts,	
		canHaveFeatures
	}
})