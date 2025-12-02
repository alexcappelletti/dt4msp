import { defineEventHandler } from 'h3';
import { DOMParser } from 'xmldom';

const GEOSERVER_BASE_URL = "https://geoplatform.tools4msp.eu/geoserver/wfs/get";

export default defineEventHandler(async (event) => {


	const capabilitiesUrl = `${GEOSERVER_BASE_URL}?SERVICE=WFS&version=1.3.0&request=GetCapabilities`;

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
			serverUrl: GEOSERVER_BASE_URL,
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