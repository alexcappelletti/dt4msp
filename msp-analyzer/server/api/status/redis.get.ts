// server/api/status/redis.get.ts
import { Redis } from 'ioredis';

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig();

	if (!config.redisUrl) {
		return { status: 'error', message: 'REDIS_URL non configurata' };
	}

	let redis: Redis | undefined;
	try {
		// Tenta la connessione. ioredis gestisce automaticamente il parsing dell'URL
		redis = new Redis(config.redisUrl);

		// Invia un comando semplice per verificare la latenza/connessione
		const reply = await redis.ping();

		if (reply === 'PONG') {
			return { status: 'success', message: 'Connessione Redis OK' };
		} else {
			return { status: 'error', message: `Risposta inattesa: ${reply}` };
		}

	} catch (error: any) {
		console.error('Errore di connessione Redis:', error);
		// In caso di errore, restituisce un errore HTTP 500
		return createError({
			statusCode: 500,
			statusMessage: `Connessione Redis fallita: ${error.message}`,
		});
	} finally {
		// Assicurati di chiudere la connessione dopo il test
		if (redis) {
			await redis.quit();
		}
	}
});
