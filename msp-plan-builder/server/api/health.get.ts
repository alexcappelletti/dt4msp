import { withRedisClient } from '#/server/utils/redisClient';

export default defineEventHandler(async (event) => {
	let redisOk = false;
	let redisMessage = '';

	try {
		const pong = await withRedisClient(event, async (client) => client.ping());
		redisOk = typeof pong === 'string' && pong.toUpperCase() === 'PONG';
		redisMessage = String(pong || '');
	} catch (error: any) {
		redisOk = false;
		redisMessage = error?.statusMessage || error?.message || 'Redis unreachable';
	}

	return {
		ok: redisOk,
		service: 'msp-plan-builder',
		timestamp: new Date().toISOString(),
		redis: {
			ok: redisOk,
			message: redisMessage,
		},
	};
});
