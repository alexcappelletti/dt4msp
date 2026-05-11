import { createPage, setup, $fetch } from '@nuxt/test-utils/e2e';
import { describe, expect, it, beforeAll} from 'vitest';

describe('Remote update toast (E2E)', async () => {
	process.env.MSP_E2E_AUTH_BYPASS = 'true';
	const testProjectId = 'prj-2026-e2e-remote-toast';

	await setup({
		host: 'http://localhost:3000',
		browser: true,
		setupTimeout: 20000,
	});

	beforeAll(async () => {
		await $fetch('/api/msp-project/seed', {
			method: 'POST',
			body: { command: 'clean' },
		});
		await $fetch('/api/msp-project/seed', {
			method: 'POST',
			body: { command: 'fill', projectId: testProjectId },
		});

	});

	it('mostra il toast quando arriva un evento di aggiornamento remoto', async () => {
		
		const scenarios = await $fetch<Array<{ id: string }>>('/api/msp-project/scenarios', {
			method: 'GET',
			query: { projectId: testProjectId },
		});
		expect(Array.isArray(scenarios)).toBe(true);
		expect((scenarios ?? []).length).toBeGreaterThan(0);
		const scenarioId = scenarios[0]!.id;

		const pageA = await createPage(`/scenarios/${scenarioId}?projectId=${encodeURIComponent(testProjectId)}`);

		try {
			expect(pageA.url()).toContain(`/scenarios/${scenarioId}`);
			await pageA.evaluate((projectId) => {
				const channel = new BroadcastChannel('msp-project-sync');
				channel.postMessage({ type: 'project-mutated', projectId, at: Date.now() });
				channel.close();
			}, testProjectId);

			const remoteToastA = pageA.getByTestId('remote-update-toast');
			await remoteToastA.waitFor({ state: 'visible', timeout: 4000 });
			await expect(remoteToastA).toContainText('Aggiornamento remoto');
		} finally {
			await pageA.close();
		}
	});
});
