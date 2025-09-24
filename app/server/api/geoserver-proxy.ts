export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const wfsUrl = query.wfs;
	if (!wfsUrl || typeof wfsUrl !== 'string') {
		throw createError({ statusCode: 400, statusMessage: 'Missing or invalid "wfs" query parameter' });
	}

	try {
		const response = await fetch(wfsUrl);
		const contentType = response.headers.get('content-type') || 'application/json';
		const data = await response.text(); // usa text per gestire anche XML
		setHeader(event, 'Content-Type', contentType);
		return data;
	} catch (err) {
		throw createError({ statusCode: 502, statusMessage: 'Failed to fetch WFS data' });
	}
});
