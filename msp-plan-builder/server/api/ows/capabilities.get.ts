import { createError, defineEventHandler, getQuery } from 'h3';
import { fetchOwsCapabilities } from '../../utils/owsCapabilities';
import { parseOwsCapabilities } from '../../utils/parseOwsCapabilities';

export default defineEventHandler(async (event) => {
	const query = getQuery(event);
	const server = query.endpoint || query.server || query.url;
	const timeoutMs = useRuntimeConfig(event).owsTimeoutMs;

	if (!server || typeof server !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Parametro server mancante o non valido.',
		});
	}

	const capabilities = await fetchOwsCapabilities({
		server,
		query: Object.fromEntries(
			Object.entries(query).map(([key, value]) => [
				key,
				Array.isArray(value) ? value.map(String) : value === undefined ? undefined : String(value),
			]),
		),
		timeoutMs,
	});

	try {
		return {
			server,
			capabilitiesUrl: capabilities.url,
			...parseOwsCapabilities(capabilities.body),
		};
	} catch (error) {
		throw createError({
			statusCode: 502,
			statusMessage: `Impossibile fare il parsing delle capabilities: ${(error as Error).message}`,
		});
	}
});
