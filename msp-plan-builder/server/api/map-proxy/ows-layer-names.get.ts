import { defineEventHandler } from 'h3';
import { DOMParser } from 'xmldom';



export default defineEventHandler(async (event) => {

	const wfsBaseUrl = useRuntimeConfig(event).wfsBaseUrl;
	const capabilitiesUrl = `${wfsBaseUrl}?SERVICE=WFS&version=1.3.0&request=GetCapabilities`;

	if (!wfsBaseUrl) {
		throw createError({
			statusCode: 500,
			statusMessage: "WFS_BASE_URL non configurato",
		});
	}


	try {
		// 1. Richiedi il documento XML GetCapabilities direttamente da GeoServer (server-to-server)
		const xmlText: string = await $fetch(capabilitiesUrl, {
			method: 'GET',
			headers: {
				'Accept': 'text/xml'
			}
		});

		// 2. Analizza il testo XML per estrarre i nomi dei layer
		const featureTypes = extractFeatureTypesFromXml(xmlText);

		// 3. Restituisci i dati come JSON pulito al client Nuxt
		return {
			serverUrl: wfsBaseUrl,
			count: featureTypes.length,
			layers: featureTypes,
			service: 'WFS'
		};

	} catch (error) {
		console.error("Errore nel recupero dei layer da GeoServer:", error);
		throw createError({
			statusCode: 500,
			statusMessage: 'Impossibile recuperare i layer da GeoServer',
		});
	}
});

function extractFeatureTypesFromXml(xmlString: string): string[] {
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlString, "text/xml");
	const featureTypeNames: string[] = [];
	const featureTypes = xmlDoc.getElementsByTagName('FeatureType');

	// Iterazione compatibile con NodeList
	for (let i = 0; i < featureTypes.length; i++) {
		const node = featureTypes[i];

		// Cerca il nodo <Name> all'interno di <FeatureType>
		const nameNodeList = node.getElementsByTagName('Name');

		// nameNodeList[0] accede al primo (e unico) elemento <Name>
		if (nameNodeList.length > 0 && nameNodeList[0].textContent) {
			featureTypeNames.push(nameNodeList[0].textContent);
		}
	}

	// Gestione degli errori (opzionale, ma utile)
	const errorNodes = xmlDoc.getElementsByTagName('parsererror');
	if (errorNodes.length > 0) {
		console.error("GeoServer XML Parsing Error:", errorNodes[0].textContent);
		// Puoi decidere se lanciare un errore o continuare ignorando i warning
		// throw new Error(`XML Parsing Error: ${errorNodes[0].textContent}`);
	}

	return featureTypeNames;
}