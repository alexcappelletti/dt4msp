import { describe, expect, it } from 'vitest';
import { isProjectVersionMatch } from '../../server/utils/projectVersioning';

type TestProject = {
	id: string;
	updatedAt: string;
	payload: {
		scenarioDescription: string;
	};
};

class InMemoryProjectRepository {
	private project: TestProject;

	constructor(initial: TestProject) {
		this.project = initial;
	}

	read(): TestProject {
		return JSON.parse(JSON.stringify(this.project)) as TestProject;
	}

	write(expectedUpdatedAt: string, mutator: (project: TestProject) => TestProject): TestProject {
		if (!isProjectVersionMatch(expectedUpdatedAt, this.project.updatedAt)) {
			throw new Error('409_CONFLICT');
		}

		const next = mutator(this.read());
		this.project = {
			...next,
			updatedAt: new Date(Date.parse(this.project.updatedAt) + 1).toISOString(),
		};
		return this.read();
	}
}

describe('Project concurrency strategy', () => {
	it('accetta la scrittura se la versione coincide', () => {
		const repo = new InMemoryProjectRepository({
			id: 'prj-1',
			updatedAt: new Date('2026-05-11T10:00:00.000Z').toISOString(),
			payload: { scenarioDescription: 'base' },
		});

		const current = repo.read();
		const updated = repo.write(current.updatedAt, (project) => ({
			...project,
			payload: { scenarioDescription: 'changed by user A' },
		}));

		expect(updated.payload.scenarioDescription).toBe('changed by user A');
		expect(updated.updatedAt).not.toBe(current.updatedAt);
	});

	it('rifiuta la seconda scrittura concorrente con versione stale (simulazione A/B)', () => {
		const repo = new InMemoryProjectRepository({
			id: 'prj-1',
			updatedAt: new Date('2026-05-11T10:00:00.000Z').toISOString(),
			payload: { scenarioDescription: 'base' },
		});

		// A e B leggono la stessa versione iniziale
		const snapshotA = repo.read();
		const snapshotB = repo.read();
		expect(snapshotA.updatedAt).toBe(snapshotB.updatedAt);

		// A salva con successo
		const updatedByA = repo.write(snapshotA.updatedAt, (project) => ({
			...project,
			payload: { scenarioDescription: 'edit from A' },
		}));
		expect(updatedByA.payload.scenarioDescription).toBe('edit from A');

		// B prova a salvare su versione vecchia: deve fallire con conflitto
		expect(() => {
			repo.write(snapshotB.updatedAt, (project) => ({
				...project,
				payload: { scenarioDescription: 'edit from B (stale)' },
			}));
		}).toThrowError('409_CONFLICT');

		// Stato finale resta quello di A
		const finalState = repo.read();
		expect(finalState.payload.scenarioDescription).toBe('edit from A');
	});

	it('con project mockato aggiorna solo una parte di scenario e rifiuta update stale concorrente', () => {
		type MockScenario = {
			id: string;
			name: string;
			generalDescription: string;
			objectives: string;
		};

		type MockProject = {
			id: string;
			updatedAt: string;
			areaOfInterest: {
				scenarios: MockScenario[];
			};
		};

		class InMemoryScenarioProjectRepo {
			private project: MockProject;

			constructor(initial: MockProject) {
				this.project = initial;
			}

			read(): MockProject {
				return JSON.parse(JSON.stringify(this.project)) as MockProject;
			}

			updateScenarioPart(
				expectedUpdatedAt: string,
				scenarioId: string,
				patch: Partial<Pick<MockScenario, 'generalDescription' | 'objectives'>>,
			): MockProject {
				if (!isProjectVersionMatch(expectedUpdatedAt, this.project.updatedAt)) {
					throw new Error('409_CONFLICT');
				}

				const current = this.read();
				const idx = current.areaOfInterest.scenarios.findIndex((s) => s.id === scenarioId);
				if (idx < 0) throw new Error('SCENARIO_NOT_FOUND');

				const prev = current.areaOfInterest.scenarios[idx]!;
				current.areaOfInterest.scenarios[idx] = { ...prev, ...patch };
				current.updatedAt = new Date(Date.parse(this.project.updatedAt) + 1).toISOString();
				this.project = current;
				return this.read();
			}
		}

		const repo = new InMemoryScenarioProjectRepo({
			id: 'prj-1',
			updatedAt: new Date('2026-05-11T10:00:00.000Z').toISOString(),
			areaOfInterest: {
				scenarios: [
					{
						id: 'sc-1',
						name: 'Scenario 1',
						generalDescription: 'desc v1',
						objectives: 'obj v1',
					},
				],
			},
		});

		const snapshotA = repo.read();
		const snapshotB = repo.read();

		const updatedByA = repo.updateScenarioPart(
			snapshotA.updatedAt,
			'sc-1',
			{ generalDescription: 'desc updated by A' },
		);

		expect(updatedByA.areaOfInterest.scenarios[0]?.generalDescription).toBe('desc updated by A');
		expect(updatedByA.areaOfInterest.scenarios[0]?.objectives).toBe('obj v1');

		expect(() =>
			repo.updateScenarioPart(
				snapshotB.updatedAt,
				'sc-1',
				{ objectives: 'obj updated by B (stale)' },
			),
		).toThrowError('409_CONFLICT');

		const finalProject = repo.read();
		expect(finalProject.areaOfInterest.scenarios[0]?.generalDescription).toBe('desc updated by A');
		expect(finalProject.areaOfInterest.scenarios[0]?.objectives).toBe('obj v1');
	});
});
