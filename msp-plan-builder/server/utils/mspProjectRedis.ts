import { isProjectVersionMatch, normalizeUpdatedAt } from '#/server/utils/projectVersioning';
import { withRedisClient } from '#/server/utils/redisClient';
import type { AreaOfInterest, Feedback, OptionalData, Project, Scenario } from '#/shared/types/msp-project';
import type { H3Event } from 'h3';
import { randomUUID } from 'node:crypto';

function getPrefix(event: H3Event): string {
	const config = useRuntimeConfig(event);
	return String((config as any).mspRedisPrefix || 'msp:projects');
}

function getProjectKey(prefix: string, projectId: string): string {
	return `${prefix}:${projectId}:project`;
}

function getProjectPattern(prefix: string): string {
	return `${prefix}:*:project`;
}

function getProjectLockKey(prefix: string, projectId: string): string {
	return `${prefix}:${projectId}:lock`;
}

const PROJECT_LOCK_TTL_MS = 5000;
const PROJECT_LOCK_WAIT_MS = 3000;
const PROJECT_LOCK_RETRY_MS = 120;

function safeJsonParse<T>(raw: string | null, key: string): T {
	if (!raw) {
		throw createError({ statusCode: 404, statusMessage: `Dato non trovato in data-layer: ${key}` });
	}
	try {
		return JSON.parse(raw) as T;
	} catch {
		throw createError({ statusCode: 500, statusMessage: `JSON non valido in data-layer: ${key}` });
	}
}

function toDate(value: unknown): Date {
	if (value instanceof Date) return value;
	if (typeof value === 'string' || typeof value === 'number') return new Date(value);
	return new Date();
}

function hydrateFeedback(feedback: Feedback): Feedback {
	return {
		...feedback,
		createdAt: toDate(feedback.createdAt),
		updatedAt: feedback.updatedAt ? toDate(feedback.updatedAt) : undefined,
	};
}

function hydrateAreaOfInterest(areaOfInterest: AreaOfInterest): AreaOfInterest {
	const othersSource = areaOfInterest.others as unknown;
	const othersMap = othersSource instanceof Map
		? othersSource
		: new Map<string, OptionalData>(Object.entries((othersSource || {}) as Record<string, OptionalData>));

	return {
		...areaOfInterest,
		others: othersMap,
	};
}

function hydrateScenario(scenario: Scenario): Scenario {
	return {
		...scenario,
		feedbacks: Array.isArray(scenario.feedbacks)
			? scenario.feedbacks.map(hydrateFeedback)
			: scenario.feedbacks,
	};
}

function hydrateProject(project: Project): Project {
	const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
		? project.areaOfInterest.scenarios
		: [];
	const hydratedAreaScenarios = areaScenarios.map(hydrateScenario);

	return {
		...project,
		createdAt: toDate(project.createdAt),
		updatedAt: toDate(project.updatedAt),
		areaOfInterest: {
			...hydrateAreaOfInterest(project.areaOfInterest),
			scenarios: hydratedAreaScenarios,
		},
		// Fonte canonica: areaOfInterest.scenarios
		scenarios: [],
	};
}

export async function getProjectFromRedis(event: H3Event, projectId: string): Promise<Project> {
	const prefix = getPrefix(event);
	const key = getProjectKey(prefix, projectId);

	return withRedisClient(event, async (client) => {
		const raw = await client.get(key);
		const project = safeJsonParse<Project>(raw, key);
		return hydrateProject(project);
	});
}

export async function getScenarioFromRedis(event: H3Event, projectId: string, scenarioId: string): Promise<Scenario> {
	const project = await getProjectFromRedis(event, projectId);
	const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
		? project.areaOfInterest.scenarios
		: [];
	const scenario = areaScenarios.find((item) => item.id === scenarioId);
	if (!scenario) {
		throw createError({ statusCode: 404, statusMessage: `Scenario non trovato: ${scenarioId}` });
	}
	return hydrateScenario(scenario);
}

export async function listScenariosFromRedis(event: H3Event, projectId: string): Promise<Scenario[]> {
	const project = await getProjectFromRedis(event, projectId);
	const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
		? project.areaOfInterest.scenarios
		: [];
	return areaScenarios.map(hydrateScenario);
}

export async function saveProjectToRedis(event: H3Event, project: Project): Promise<Project> {
	const prefix = getPrefix(event);
	const projectKey = getProjectKey(prefix, project.id);

	return withRedisClient(event, async (client) => {
		await client.set(projectKey, JSON.stringify(project));
		return hydrateProject(project);
	});
}

async function sleep(ms: number): Promise<void> {
	await new Promise((resolve) => setTimeout(resolve, ms));
}

async function withProjectWriteLock<T>(
	event: H3Event,
	projectId: string,
	run: (ctx: { client: any; prefix: string; projectKey: string }) => Promise<T>,
): Promise<T> {
	const prefix = getPrefix(event);
	const projectKey = getProjectKey(prefix, projectId);
	const lockKey = getProjectLockKey(prefix, projectId);
	const lockToken = randomUUID();

	return withRedisClient(event, async (client) => {
		const deadline = Date.now() + PROJECT_LOCK_WAIT_MS;
		let acquired = false;

		while (Date.now() < deadline) {
			const result = await client.set(lockKey, lockToken, { NX: true, PX: PROJECT_LOCK_TTL_MS });
			if (result === 'OK') {
				acquired = true;
				break;
			}
			await sleep(PROJECT_LOCK_RETRY_MS);
		}

		if (!acquired) {
			throw createError({
				statusCode: 409,
				statusMessage: `Project ${projectId} is busy, retry later`,
			});
		}

		try {
			return await run({ client, prefix, projectKey });
		} finally {
			try {
				const currentToken = await client.get(lockKey);
				if (currentToken === lockToken) {
					await client.del(lockKey);
				}
			} catch { }
		}
	});
}

async function getProjectFromClient(client: any, projectKey: string): Promise<Project> {
	const raw = await client.get(projectKey);
	const project = safeJsonParse<Project>(raw, projectKey);
	return hydrateProject(project);
}

export async function updateProjectWithLockRedis(
	event: H3Event,
	projectId: string,
	options: { expectedUpdatedAt?: string | null } | undefined,
	mutate: (current: Project) => Promise<Project> | Project,
): Promise<Project> {
	return withProjectWriteLock(event, projectId, async ({ client, projectKey }) => {
		const current = await getProjectFromClient(client, projectKey);
		const expectedUpdatedAt = options?.expectedUpdatedAt?.trim();
		if (expectedUpdatedAt) {
			const currentUpdatedAt = normalizeUpdatedAt(toDate(current.updatedAt));
			if (!isProjectVersionMatch(expectedUpdatedAt, currentUpdatedAt)) {
				throw createError({
					statusCode: 409,
					statusMessage: "Project conflict: stale version",
					data: {
						expectedUpdatedAt,
						currentUpdatedAt,
						projectId,
					},
				});
			}
		}
		const next = await mutate(current);
		await client.set(projectKey, JSON.stringify(next));
		return hydrateProject(next);
	});
}

export async function saveAreaToRedis(
	event: H3Event,
	projectId: string,
	area: AreaOfInterest,
	options?: { expectedUpdatedAt?: string | null },
): Promise<AreaOfInterest> {
	await updateProjectWithLockRedis(event, projectId, options, async (project) => ({
		...project,
		areaOfInterest: area,
		updatedAt: new Date(),
	}));
	return hydrateAreaOfInterest(area);
}

export async function saveScenarioToRedis(
	event: H3Event,
	projectId: string,
	scenario: Scenario,
	options?: { expectedUpdatedAt?: string | null },
): Promise<Scenario> {
	await updateProjectWithLockRedis(event, projectId, options, async (project) => {
		const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
			? [...project.areaOfInterest.scenarios]
			: [];

		const index = areaScenarios.findIndex((item) => item.id === scenario.id);
		if (index >= 0) {
			areaScenarios[index] = scenario;
		} else {
			areaScenarios.push(scenario);
		}

		return {
			...project,
			scenarios: [],
			areaOfInterest: {
				...project.areaOfInterest,
				scenarios: areaScenarios,
			},
			updatedAt: new Date(),
		};
	});
	return hydrateScenario(scenario);
}

export async function deleteScenarioFromRedis(
	event: H3Event,
	projectId: string,
	scenarioId: string,
	options?: { expectedUpdatedAt?: string | null },
): Promise<{ deleted: boolean }> {
	let deleted = false;
	await updateProjectWithLockRedis(event, projectId, options, async (project) => {
		const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
			? project.areaOfInterest.scenarios
			: [];
		const nextAreaScenarios = areaScenarios.filter((scenario) => scenario.id !== scenarioId);
		deleted = nextAreaScenarios.length !== areaScenarios.length;
		if (!deleted) {
			return project;
		}
		return {
			...project,
			scenarios: [],
			areaOfInterest: {
				...project.areaOfInterest,
				scenarios: nextAreaScenarios,
			},
			updatedAt: new Date(),
		};
	});
	return { deleted };
}

export async function clearAllProjectsFromRedis(event: H3Event): Promise<{ deletedCount: number; deletedKeys: string[] }> {
	const prefix = getPrefix(event);
	const match = getProjectPattern(prefix);
	const deletedKeys: string[] = [];

	await withRedisClient(event, async (client) => {
		let cursor = '0';
		do {
			const result = await client.scan(cursor, { MATCH: match, COUNT: 200 });
			cursor = result?.cursor ?? '0';
			const keys: string[] = Array.isArray(result?.keys) ? result.keys : [];
			if (keys.length > 0) {
				await client.del(keys);
				deletedKeys.push(...keys);
			}
		} while (cursor !== '0');
	});

	return {
		deletedCount: deletedKeys.length,
		deletedKeys,
	};
}

export async function clearProjectFromRedis(
	event: H3Event,
	projectId: string,
): Promise<{ deletedCount: number; deletedKeys: string[] }> {
	const prefix = getPrefix(event);
	const projectKey = getProjectKey(prefix, projectId);
	const lockKey = getProjectLockKey(prefix, projectId);

	return withRedisClient(event, async (client) => {
		const deletedKeys: string[] = [];
		const existsProject = await client.exists(projectKey);
		if (existsProject) {
			await client.del(projectKey);
			deletedKeys.push(projectKey);
		}

		const existsLock = await client.exists(lockKey);
		if (existsLock) {
			await client.del(lockKey);
			deletedKeys.push(lockKey);
		}

		return {
			deletedCount: deletedKeys.length,
			deletedKeys,
		};
	});
}
