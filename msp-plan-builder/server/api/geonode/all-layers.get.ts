export default defineEventHandler(async (event) => {
	// Retrocompatibility endpoint: delega a /api/geonode/maps
	return await $fetch('/api/geonode/maps', {
		method: 'GET',
		query: getQuery(event),
	});
});
