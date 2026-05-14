import { withRedisClient } from '#/server/utils/redisClient';
import { ensureMongoConnection } from '#/server/utils/mongoClient';

export default defineEventHandler(async (event) => {
	let redisOk = false;
	let redisMessage = '';
	let mongoOk = false;
	let mongoConnected = false;
	let mongoExists = false;
	let mongoMessage = '';
	let mongoDbName = '';

	try {
		const pong = await withRedisClient(event, async (client) => client.ping());
		redisOk = typeof pong === 'string' && pong.toUpperCase() === 'PONG';
		redisMessage = String(pong || '');
	} catch (error: any) {
		redisOk = false;
		redisMessage = error?.statusMessage || error?.message || 'Redis unreachable';
	}

	try {
		const mongoose = await ensureMongoConnection(event);
		mongoConnected = mongoose.connection.readyState === 1;
		mongoDbName = String(mongoose.connection.db?.databaseName || '');

		if (mongoConnected && mongoose.connection.db) {
			const admin = mongoose.connection.db.admin();
			const databases = await admin.listDatabases();
			const dbList = Array.isArray(databases?.databases) ? databases.databases : [];
			mongoExists = dbList.some((db) => db?.name === mongoDbName);
			mongoOk = mongoConnected && mongoExists;
			mongoMessage = mongoOk
				? 'MongoDB reachable and database found'
				: 'MongoDB connected but database not found';
		} else {
			mongoOk = false;
			mongoMessage = 'MongoDB not connected';
		}
	} catch (error: any) {
		mongoOk = false;
		mongoConnected = false;
		mongoExists = false;
		mongoMessage = error?.statusMessage || error?.message || 'MongoDB unreachable';
	}

	return {
		ok: redisOk && mongoOk,
		service: 'msp-plan-builder',
		timestamp: new Date().toISOString(),
		redis: {
			ok: redisOk,
			message: redisMessage,
		},
		mongodb: {
			ok: mongoOk,
			connected: mongoConnected,
			dbName: mongoDbName,
			exists: mongoExists,
			message: mongoMessage,
		},
	};
});
