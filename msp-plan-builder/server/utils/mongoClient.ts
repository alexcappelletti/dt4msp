import type { H3Event } from "h3";
import mongoose from "mongoose";

let connectPromise: Promise<typeof mongoose> | null = null;

export async function ensureMongoConnection(event: H3Event): Promise<typeof mongoose> {
	const config = useRuntimeConfig(event);
	const mongoUrl = String((config as any).mongoUrl || "").trim();
	const mongoDbName = String((config as any).mongoDbName || "db_4msp").trim() || "db_4msp";
	if (!mongoUrl) {
		throw createError({
			statusCode: 500,
			statusMessage: "MongoDB non configurato (PERSISTENT_DB_URI mancante)",
		});
	}

	if (mongoose.connection.readyState === 1) {
		const currentDbName = String(mongoose.connection.db?.databaseName || "").trim();
		if (!currentDbName || currentDbName === mongoDbName) {
			return mongoose;
		}
		await mongoose.disconnect();
		connectPromise = null;
	}

	if (!connectPromise) {
		connectPromise = mongoose.connect(mongoUrl, {
			serverSelectionTimeoutMS: 10000,
			dbName: mongoDbName,
		}).catch((error) => {
			connectPromise = null;
			throw error;
		});
	}

	try {
		await connectPromise;
		return mongoose;
	} catch (error: any) {
		const message = error?.message ? String(error.message) : String(error);
		throw createError({
			statusCode: 500,
			statusMessage: `Errore MongoDB: ${message}`,
		});
	}
}
