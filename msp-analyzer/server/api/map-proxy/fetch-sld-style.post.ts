
// import * as sdlParser from 'geostyler-sld-parser'
// import { MapboxStyleParser } from 'geostyler-mapbox-parser'




export default defineEventHandler(async (event) => {
	const body = await readBody(event);
	const sldParams = body.sldStyle;

	if (!sldParams || sldParams.sld_url === undefined) {
		return { error: 'Missing sld_url' };
	}

	try {
		console.log("sld at ", sldParams.sld_url) // Scarica l'XML SLD
		const response = await fetch(sldParams.sld_url);
		const sldText = await response.text();
		return sldText;

	} catch (error) {
		console.error("Server SLD conversion error:", error);
		return { error: 'Failed to convert SLD' };
	}
});