import type { Project, Scenario, AreaOfInterest, OptionalData, Feedback } from '#/shared/types/msp-project';
import type { H3Event } from 'h3';
import { withRedisClient } from '#/server/utils/redisClient';

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

export async function saveAreaToRedis(
	event: H3Event,
	projectId: string,
	area: AreaOfInterest,
): Promise<AreaOfInterest> {
	const project = await getProjectFromRedis(event, projectId);
	const nextProject: Project = {
		...project,
		areaOfInterest: area,
		updatedAt: new Date(),
	};
	await saveProjectToRedis(event, nextProject);
	return hydrateAreaOfInterest(area);
}

export async function saveScenarioToRedis(event: H3Event, projectId: string, scenario: Scenario): Promise<Scenario> {
	const project = await getProjectFromRedis(event, projectId);
	const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
		? [...project.areaOfInterest.scenarios]
		: [];

	const upsertById = (items: Scenario[]): Scenario[] => {
		const index = items.findIndex((item) => item.id === scenario.id);
		if (index >= 0) {
			items[index] = scenario;
		} else {
			items.push(scenario);
		}
		return items;
	};

	const nextAreaScenarios = upsertById(areaScenarios);

	const nextProject: Project = {
		...project,
		scenarios: [],
		areaOfInterest: {
			...project.areaOfInterest,
			scenarios: nextAreaScenarios,
		},
		updatedAt: new Date(),
	};
	await saveProjectToRedis(event, nextProject);
	return hydrateScenario(scenario);
}

export async function deleteScenarioFromRedis(event: H3Event, projectId: string, scenarioId: string): Promise<{ deleted: boolean }> {
	const project = await getProjectFromRedis(event, projectId);
	const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
		? project.areaOfInterest.scenarios
		: [];
	const nextAreaScenarios = areaScenarios.filter((scenario) => scenario.id !== scenarioId);
	const deleted = nextAreaScenarios.length !== areaScenarios.length;

	if (!deleted) {
		return { deleted: false };
	}

	const nextProject: Project = {
		...project,
		scenarios: [],
		areaOfInterest: {
			...project.areaOfInterest,
			scenarios: nextAreaScenarios,
		},
		updatedAt: new Date(),
	};
	await saveProjectToRedis(event, nextProject);
	return { deleted: true };
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
