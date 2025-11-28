import { describe, it, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';

// Avvia l'app Nuxt in background per il test e2e
//questi test non richiedono un browser ma richiedono il server Nuxt in esecuzione per cui farli girare in modalitá 
//watch é molto dispedioso
await setup({
	// Non è necessario un ambiente browser (playwright), solo il server
	server: true,
	browser: false,
});

describe('Verifica Connessione Redis', () => {
	it('dovrebbe connettersi a Redis con successo tramite API', async () => {
		// A questo punto, devi assicurarti di avere un database Redis in esecuzione
		// e la variabile d'ambiente REDIS_URL configurata nel tuo ambiente di test locale.

		if (!process.env.REDIS_URL) {
			// Se non puoi testare localmente, salta il test
			console.warn('REDIS_URL non configurata, test Redis saltato.');
			return;
		}

		// Esegue una fetch interna all'endpoint API creato
		const response: {status:string, message: string} = await $fetch('/api/status/redis');

		// Asserzione: ci aspettiamo che la risposta indichi successo
		expect(response.status).toBe('success');
		expect(response.message).toBe('Connessione Redis OK');

	});
	it.skip ('dovrebbe fallire sempre', () => {
		expect(true).toBe('false');
	});

	
});


