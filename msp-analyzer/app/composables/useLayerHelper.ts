import { merge } from 'lodash';
import type {Layer} from '#/shared/types/gn-layer'



export const useLayerHelper = () =>{


	const buildWfsGetFeatureParams = (
		l: Layer,
		options?: {
			cqlFilter?: string;
			maxFeatures?: number;
			srsName?: string;
			outputFormat?: string;
   		}	
	): Record<string, string>  =>{
		const defaultOptions = {
			outputFormat: 'application/json',
			srsName: 'EPSG:3857',
			maxFeatures: 50,
		};
		const merged = {...defaultOptions, ...options}

		const params: Record<string, string> = {
			version: '2.0.0',
			service: 'WFS',
			request: 'GetFeature',
			typename: `${l.workspace}:${l.name}`,
			outputFormat: merged.outputFormat,
			srsName: merged.srsName,
			maxFeatures: String(merged.maxFeatures),
		}
		if (merged.cqlFilter) {
     		params['cql_filter'] = merged.cqlFilter;
    	}

		return params
	}


	return {
		buildWfsGetFeatureParams
	}


}