export const useGeoServerApi = () => {

	const fetchOws = async (params: Record<string, string>, formatOptions?: RequestInit) => {
		// La richiesta client-side va al tuo server Nuxt locale
		const queryString = new URLSearchParams(params).toString();
		const requestUrl = `/api/map-proxy/ows-req?${queryString}`;

		try {
			const { data, pending, error } = await useFetch(requestUrl, {
				...formatOptions
			});

			if (error.value) {
				throw new Error(`Proxy API Error: ${error.value.message}`);
			}

			return data.value;

		} catch (err) {
			console.error("Error fetching data via proxy:", err);
			throw err;
		}
	};

	/**
	 * Ottieni Capabilities WFS (ritorna XML stringa)
	 */
	const getWfsCapabilities = async () => {
		const params = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetCapabilities',
		};
		return fetchOws(params);
	};

	const getAllAvailableLayers = async (): Promise<{ serverUrl: string, count: number, layers: string[] }> => {
		// Chiamata diretta all'endpoint API locale di Nuxt
		const response = await $fetch('/api/map-proxy/ows-layers');
		return response;
	};

	const getWfsFeaturesWithCql = async (
		featureType: string,
		cqlFilter?: string, // Reso opzionale
		maxFeatures: number = 50
	) => {
		const params: Record<string, string> = {
			service: 'WFS',
			version: '1.1.0',
			request: 'GetFeature',
			typeName: featureType,
			outputFormat: 'application/json', // Chiede GeoJSON
			maxFeatures: String(maxFeatures),
			srsName: 'EPSG:4326', // Sistema di riferimento
		};

		// Aggiunge il parametro cql_filter SOLO se è fornito
		if (cqlFilter) {
			params['cql_filter'] = cqlFilter;
		}

		// fetchOws userà il proxy server-side e gestirà l'encoding
		return fetchOws(params);
	};

	return {
		// getWfsCapabilities,
		// getWfsFeaturesWithCql,
		getAllAvailableLayers, // <-- Aggiunto
		// ...
	};


};