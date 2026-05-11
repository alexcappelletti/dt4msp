import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ProjectRemoteUpdateToast from '../../app/components/project/ProjectRemoteUpdateToast.vue';
import { useProjectStore } from '../../app/stores/projectStore';

describe('ProjectRemoteUpdateToast UI', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});

	it('mostra il toast quando c è una modifica remota', async () => {
		const store = useProjectStore();
		store.hasRemoteUpdateNotice = true;
		store.remoteUpdateMessage = 'Aggiornamento remoto rilevato.';

		const wrapper = mount(ProjectRemoteUpdateToast);
		expect(wrapper.find('[data-testid="remote-update-toast"]').exists()).toBe(true);
		expect(wrapper.text()).toContain('Aggiornamento remoto rilevato.');
	});

	it('nasconde il toast quando l utente chiude', async () => {
		const store = useProjectStore();
		store.hasRemoteUpdateNotice = true;
		store.remoteUpdateMessage = 'Aggiornamento remoto rilevato.';

		const wrapper = mount(ProjectRemoteUpdateToast);
		await wrapper.get('[data-testid="remote-update-toast-close"]').trigger('click');

		expect(store.hasRemoteUpdateNotice).toBe(false);
		expect(wrapper.find('[data-testid="remote-update-toast"]').exists()).toBe(false);
	});
});
