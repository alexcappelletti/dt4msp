import type { H3Event } from 'h3';

export async function withRedisClient<T>(event: H3Event, run: (client: any) => Promise<T>): Promise<T> {
	const config = useRuntimeConfig(event);
	const redisUrl = String(config.redisUrl || '');
	if (!redisUrl) {
		throw createError({ statusCode: 500, statusMessage: 'Redis non configurato (REDIS_URL mancante)' });
	}

	const redisModule = await import('redis').catch(() => null);
	if (!redisModule?.createClient) {
		throw createError({ statusCode: 500, statusMessage: "Package 'redis' non installato" });
	}

	const client = redisModule.createClient({ url: redisUrl });
	try {
		await client.connect();
		if (!client.isOpen) {
			throw createError({ statusCode: 500, statusMessage: 'Client Redis non disponibile' });
		}
		return await run(client);
	} catch (error: any) {
		const message = error?.message ? String(error.message) : String(error);
		throw createError({
			statusCode: error?.statusCode || 500,
			statusMessage: `Errore Redis: ${message}`,
		});
	} finally {
		try { await client.quit(); } catch {}
	}
}
