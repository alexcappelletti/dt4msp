import { createError, defineEventHandler, readBody } from 'h3';
import { fetchOwsCapabilities } from '../../utils/owsCapabilities';
import { parseOwsCapabilities } from '../../utils/parseOwsCapabilities';

interface CapabilitiesRequestBody {
	server?: string;
	endpoint?: string;
	url?: string;
	service?: string;
	version?: string;
	request?: string;
	params?: Record<string, string | string[] | number | boolean | undefined>;
}

export default defineEventHandler(async (event) => {
	const body = await readBody<CapabilitiesRequestBody>(event);
	const server = body?.endpoint || body?.server || body?.url;
	const timeoutMs = useRuntimeConfig(event).owsTimeoutMs;

	if (!server || typeof server !== 'string') {
		throw createError({
			statusCode: 400,
			statusMessage: 'Parametro server mancante o non valido.',
		});
	}

	const query: Record<string, string | string[] | undefined> = {};

	if (body?.service) {
		query.service = String(body.service);
	}

	if (body?.version) {
		query.version = String(body.version);
	}

	if (body?.request) {
		query.request = String(body.request);
	}

	if (body?.params) {
		for (const [key, value] of Object.entries(body.params)) {
			if (value === undefined) {
				query[key] = undefined;
				continue;
			}

			query[key] = Array.isArray(value) ? value.map(String) : String(value);
		}
	}

	const capabilities = await fetchOwsCapabilities({
		server,
		query,
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
