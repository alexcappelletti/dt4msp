import { createError } from 'h3';

const SERVER_QUERY_KEYS = new Set(['server', 'endpoint', 'url']);
const DEFAULT_OWS_SERVICE = 'WFS';
const DEFAULT_OWS_VERSION = '2.0.0';
const DEFAULT_OWS_REQUEST = 'GetCapabilities';

function normalizeTimeout(timeoutMs: unknown): number {
	const parsedTimeout = Number(timeoutMs);
	if (!Number.isFinite(parsedTimeout) || parsedTimeout <= 0) {
		return 15000;
	}

	return parsedTimeout;
}

function buildCapabilitiesUrl(
	server: string,
	query: Record<string, string | string[] | undefined>,
): URL {
	let upstreamUrl: URL;

	try {
		upstreamUrl = new URL(server);
	} catch {
		throw createError({
			statusCode: 400,
			statusMessage: 'Parametro server non valido.',
		});
	}

	for (const [key, rawValue] of Object.entries(query)) {
		if (SERVER_QUERY_KEYS.has(key.toLowerCase()) || rawValue === undefined) {
			continue;
		}

		upstreamUrl.searchParams.delete(key);

		if (Array.isArray(rawValue)) {
			rawValue.forEach((value) => {
				upstreamUrl.searchParams.append(key, value);
			});
		} else {
			upstreamUrl.searchParams.set(key, rawValue);
		}
	}

	if (!upstreamUrl.searchParams.has('service')) {
		upstreamUrl.searchParams.set('service', DEFAULT_OWS_SERVICE);
	}

	if (!upstreamUrl.searchParams.has('version')) {
		upstreamUrl.searchParams.set('version', DEFAULT_OWS_VERSION);
	}

	if (!upstreamUrl.searchParams.has('request')) {
		upstreamUrl.searchParams.set('request', DEFAULT_OWS_REQUEST);
	}

	return upstreamUrl;
}

export async function fetchOwsCapabilities(options: {
	server: string;
	query?: Record<string, string | string[] | undefined>;
	timeoutMs?: unknown;
}) {
	const upstreamUrl = buildCapabilitiesUrl(options.server, options.query ?? {});
	const timeoutMs = normalizeTimeout(options.timeoutMs);
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(upstreamUrl.toString(), {
			method: 'GET',
			signal: controller.signal,
			headers: {
				accept: 'application/xml, text/xml;q=0.9, */*;q=0.8',
			},
		});

		if (!response.ok) {
			throw createError({
				statusCode: response.status,
				statusMessage: `Errore upstream OWS: ${response.status} ${response.statusText}`,
			});
		}

		return {
			url: upstreamUrl.toString(),
			contentType: response.headers.get('content-type') ?? 'application/xml',
			body: await response.text(),
		};
	} catch (error) {
		if ((error as Error).name === 'AbortError') {
			throw createError({
				statusCode: 504,
				statusMessage: `Timeout richiesta OWS dopo ${timeoutMs}ms`,
			});
		}

		if ((error as { statusCode?: number }).statusCode) {
			throw error;
		}

		throw createError({
			statusCode: 502,
			statusMessage: 'Errore nel recupero delle capabilities dal server OWS.',
		});
	} finally {
		clearTimeout(timeout);
	}
}
