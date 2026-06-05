import { ProjectModel } from "#/server/models/mongodbProjectSchemas";
import { ensureMongoConnection } from "#/server/utils/mongoClient";
import { isProjectVersionMatch, normalizeUpdatedAt } from "#/server/utils/projectVersioning";
import type { AreaOfInterest, Feedback, OptionalData, Project, Scenario } from "#/shared/types/msp-project";
import type { H3Event } from "h3";

function toDate(value: unknown): Date {
	if (value instanceof Date) return value;
	if (typeof value === "string" || typeof value === "number") return new Date(value);
	return new Date();
}

function toPlain<T>(value: T): T {
	try {
		return structuredClone(value);
	} catch {
		return JSON.parse(JSON.stringify(value)) as T;
	}
}

function normalizeImageUrl(value: unknown): string | undefined {
	if (!value) return undefined;
	if (value instanceof URL) return value.toString();
	return String(value);
}

function dehydrateAreaOfInterest(areaOfInterest: AreaOfInterest): AreaOfInterest {
	const othersSource = areaOfInterest.others as unknown;
	const othersObject = othersSource instanceof Map
		? Object.fromEntries(othersSource.entries())
		: (othersSource || {});

	return {
		...areaOfInterest,
		others: othersObject as unknown as Map<string, OptionalData>,
		statements: Array.isArray(areaOfInterest.statements)
			? areaOfInterest.statements.map((statement) => ({
				...statement,
				imageUrl: normalizeImageUrl(statement.imageUrl),
			}))
			: areaOfInterest.statements,
		scenarios: Array.isArray(areaOfInterest.scenarios)
			? areaOfInterest.scenarios.map(dehydrateScenario)
			: [],
	};
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
		statements: Array.isArray(areaOfInterest.statements)
			? areaOfInterest.statements.map((statement) => ({
				...statement,
				imageUrl: normalizeImageUrl(statement.imageUrl),
			}))
			: areaOfInterest.statements,
	};
}

function dehydrateScenario(scenario: Scenario): Scenario {
	return {
		...scenario,
		statements: Array.isArray(scenario.statements)
			? scenario.statements.map((statement) => ({
				...statement,
				imageUrl: normalizeImageUrl(statement.imageUrl),
			}))
			: scenario.statements,
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

function dehydrateProject(project: Project): Project {
	const plainProject = toPlain(project);
	const areaScenarios = Array.isArray(plainProject.areaOfInterest?.scenarios)
		? plainProject.areaOfInterest.scenarios.map(dehydrateScenario)
		: [];

	return {
		...plainProject,
		scenarios: [],
		areaOfInterest: {
			...dehydrateAreaOfInterest(plainProject.areaOfInterest),
			scenarios: areaScenarios,
		},
		createdAt: toDate(plainProject.createdAt),
		updatedAt: toDate(plainProject.updatedAt),
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
		scenarios: [],
	};
}

async function readProjectOrThrow(projectId: string): Promise<{ project: Project; version: number }> {
	const doc = await ProjectModel.findOne({ projectId }).lean();
	if (!doc?.project) {
		throw createError({ statusCode: 404, statusMessage: `Dato non trovato in data-layer: ${projectId}` });
	}
	return {
		project: hydrateProject(doc.project as Project),
		version: Number(doc.version || 1),
	};
}

export async function getProjectFromMongo(event: H3Event, projectId: string): Promise<Project> {
	await ensureMongoConnection(event);
	const current = await readProjectOrThrow(projectId);
	return current.project;
}

export async function getScenarioFromMongo(event: H3Event, projectId: string, scenarioId: string): Promise<Scenario> {
	const project = await getProjectFromMongo(event, projectId);
	const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
		? project.areaOfInterest.scenarios
		: [];
	const scenario = areaScenarios.find((item) => item.id === scenarioId);
	if (!scenario) {
		throw createError({ statusCode: 404, statusMessage: `Scenario non trovato: ${scenarioId}` });
	}
	return hydrateScenario(scenario);
}

export async function listScenariosFromMongo(event: H3Event, projectId: string): Promise<Scenario[]> {
	const project = await getProjectFromMongo(event, projectId);
	const areaScenarios = Array.isArray(project.areaOfInterest?.scenarios)
		? project.areaOfInterest.scenarios
		: [];
	return areaScenarios.map(hydrateScenario);
}

export async function saveProjectToMongo(event: H3Event, project: Project): Promise<Project> {
	await ensureMongoConnection(event);
	const now = new Date();
	const next = dehydrateProject(project);
	next.updatedAt = toDate(next.updatedAt);
	next.createdAt = toDate(next.createdAt);

	await ProjectModel.findOneAndUpdate(
		{ projectId: project.id },
		{
			$set: { project: next, updatedAt: now },
			$setOnInsert: { createdAt: next.createdAt || now, version: 1, projectId: project.id },
		},
		{ upsert: true, new: true },
	);
	return hydrateProject(next);
}

export async function updateProjectWithLockMongo(
	event: H3Event,
	projectId: string,
	options: { expectedUpdatedAt?: string | null } | undefined,
	mutate: (current: Project) => Promise<Project> | Project,
): Promise<Project> {
	await ensureMongoConnection(event);
	const expectedUpdatedAt = options?.expectedUpdatedAt?.trim();
	const maxRetries = 8;

	for (let attempt = 0; attempt < maxRetries; attempt += 1) {
		const current = await readProjectOrThrow(projectId);
		if (expectedUpdatedAt) {
			const currentUpdatedAt = normalizeUpdatedAt(toDate(current.project.updatedAt));
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

		const next = await mutate(current.project);
		const nextDehydrated = dehydrateProject(next);
		nextDehydrated.id = current.project.id;
		nextDehydrated.updatedAt = new Date();
		nextDehydrated.createdAt = toDate(current.project.createdAt);

		const result = await ProjectModel.updateOne(
			{ projectId, version: current.version },
			{
				$set: {
					project: nextDehydrated,
					updatedAt: new Date(),
				},
				$inc: { version: 1 },
			},
		);

		if (result.modifiedCount === 1) {
			return hydrateProject(nextDehydrated);
		}
	}

	throw createError({
		statusCode: 409,
		statusMessage: `Project ${projectId} is busy, retry later`,
	});
}

export async function saveAreaToMongo(
	event: H3Event,
	projectId: string,
	area: AreaOfInterest,
	options?: { expectedUpdatedAt?: string | null },
): Promise<AreaOfInterest> {
	await updateProjectWithLockMongo(event, projectId, options, async (project) => ({
		...project,
		areaOfInterest: area,
		updatedAt: new Date(),
	}));
	return hydrateAreaOfInterest(area);
}

export async function saveScenarioToMongo(
	event: H3Event,
	projectId: string,
	scenario: Scenario,
	options?: { expectedUpdatedAt?: string | null },
): Promise<Scenario> {
	await updateProjectWithLockMongo(event, projectId, options, async (project) => {
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

export async function deleteScenarioFromMongo(
	event: H3Event,
	projectId: string,
	scenarioId: string,
	options?: { expectedUpdatedAt?: string | null },
): Promise<{ deleted: boolean }> {
	let deleted = false;
	await updateProjectWithLockMongo(event, projectId, options, async (project) => {
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

export async function clearAllProjectsFromMongo(event: H3Event): Promise<{ deletedCount: number; deletedKeys: string[] }> {
	await ensureMongoConnection(event);
	const docs = await ProjectModel.find({}, { projectId: 1, _id: 0 }).lean();
	const deletedKeys = docs.map((doc) => String(doc.projectId));
	const result = await ProjectModel.deleteMany({});
	return {
		deletedCount: Number(result.deletedCount || 0),
		deletedKeys,
	};
}

export async function clearProjectFromMongo(
	event: H3Event,
	projectId: string,
): Promise<{ deletedCount: number; deletedKeys: string[] }> {
	await ensureMongoConnection(event);
	const result = await ProjectModel.deleteOne({ projectId });
	return {
		deletedCount: Number(result.deletedCount || 0),
		deletedKeys: Number(result.deletedCount || 0) > 0 ? [projectId] : [],
	};
}

