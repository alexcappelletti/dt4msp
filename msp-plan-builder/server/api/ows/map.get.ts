import { createError, defineEventHandler, getQuery, setHeader, setResponseStatus } from "h3";

function normalizeBaseUrl(baseUrl: string): URL {
	try {
		return new URL(baseUrl);
	} catch {
		throw createError({
			statusCode: 500,
			statusMessage: "OWS_BASE_URL non valido",
		});
	}
}

function normalizeTimeout(timeoutMs: number): number {
	if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
		return 15000;
	}

	return timeoutMs;
}

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig(event);
	const owsBaseUrl = config.owsBaseUrl;
	const owsTimeoutMs = normalizeTimeout(config.owsTimeoutMs);

	if (!owsBaseUrl) {
		throw createError({
			statusCode: 500,
			statusMessage: "OWS_BASE_URL non configurato",
		});
	}

	const upstreamUrl = normalizeBaseUrl(owsBaseUrl);
	const incomingQuery = getQuery(event);

	for (const [key, rawValue] of Object.entries(incomingQuery)) {
		if (Array.isArray(rawValue)) {
			rawValue.forEach((value) => {
				upstreamUrl.searchParams.append(key, String(value));
			});
		} else if (rawValue !== undefined) {
			upstreamUrl.searchParams.set(key, String(rawValue));
		}
	}

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), owsTimeoutMs);

	let upstreamResponse: Response;
	try {
		upstreamResponse = await fetch(upstreamUrl.toString(), {
			method: "GET",
			signal: controller.signal,
			headers: {
				accept: "*/*",
			},
		});
	} catch (error) {
		if ((error as Error).name === "AbortError") {
			throw createError({
				statusCode: 504,
				statusMessage: `Timeout richiesta OWS dopo ${owsTimeoutMs}ms`,
			});
		}

		throw createError({
			statusCode: 502,
			statusMessage: "Errore nella richiesta al servizio OWS",
		});
	} finally {
		clearTimeout(timeout);
	}

	const contentType = upstreamResponse.headers.get("content-type") ?? "application/octet-stream";
	setResponseStatus(event, upstreamResponse.status, upstreamResponse.statusText);
	setHeader(event, "content-type", contentType);

	const cacheControl = upstreamResponse.headers.get("cache-control");
	if (cacheControl) {
		setHeader(event, "cache-control", cacheControl);
	}

	const expires = upstreamResponse.headers.get("expires");
	if (expires) {
		setHeader(event, "expires", expires);
	}

	const lastModified = upstreamResponse.headers.get("last-modified");
	if (lastModified) {
		setHeader(event, "last-modified", lastModified);
	}

	if (contentType.includes("application/json")) {
		return await upstreamResponse.json();
	}

	if (
		contentType.includes("application/xml") ||
		contentType.includes("text/xml") ||
		contentType.includes("application/vnd.ogc.se_xml")
	) {
		return await upstreamResponse.text();
	}

	const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
	return buffer;
});
