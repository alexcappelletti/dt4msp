import type {Layer} from '#/shared/types/gn-layer'
import {useLayerHelper} from '@/composables/useLayerHelper'

const {buildWfsGetFeatureParams} = useLayerHelper()


export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const layer: Layer | undefined = body.layer

	if (layer === undefined) {
		return createError({ statusCode: 400, statusMessage: 'Missing layer obj' })

	}
	try {
		const query = buildWfsGetFeatureParams(layer)
		const url = new URL(layer.ows_url);
        Object.keys(query).forEach(key => {
            url.searchParams.append(key, query[key]);
        });
        const response = (await fetch(url.toString())) as Response
		if (!response.ok) {
			console.error(`Errore HTTP: ${response.status} ${response.statusText}`)
			return createError({ statusCode: response.status, statusMessage: response.statusText })
		}
		return response;
	}
	catch (err) {
		console.error("feature request err:", err )
		return createError({
			statusCode: 500,
			statusMessage:
				'Internal Server Error: no features read',
		});

	}

	
});