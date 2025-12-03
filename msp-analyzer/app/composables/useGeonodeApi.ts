import type {Layer} from '#/shared/types/gn-layer'

export const useGeonodeApi = ()=>{
	const getAllAvailableLayers = async (searchText?: string): Promise<Array<Layer>> => {
		const layers: Array<Layer> = await $fetch<Array<Layer>>('/api/geonode/all-layers',{
			method: 'GET',
			query: {
				searchText: searchText
			}


		})
		return layers

	}
	const getLayer = async(pk: string): Promise<Layer> =>{
		return await $fetch<Layer>('/api/geonode/layer', {
			method: 'GET',
			query: {
				pk: pk
			},

		})
	}

	return {
		getAllAvailableLayers,
		getLayer,
		
	}
}