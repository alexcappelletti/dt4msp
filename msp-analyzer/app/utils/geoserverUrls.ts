export function normalizeUrl(rawUrl: string): string {
	try {
		const urlObj = new URL(rawUrl);
		// Combina solo l'origine (protocollo + hostname + porta) e il pathname (il percorso)
		return urlObj.origin + urlObj.pathname;
	} catch (error) {
		// In caso di URL non valido, restituisce l'input originale o gestisce l'errore
		console.warn(`normalize invalid url : ${rawUrl}`);
		return "";
	}
}

export async function verifyOwsService(url: string): Promise<boolean> {
	// 1. Validazione sintattica di base dell'URL
  try {
		new URL(url);
	} catch (error) {
		console.error("L'URL fornito non è valido:", error);
		return false;
	}

	// Aggiunge i parametri standard per una richiesta GetCapabilities
	const capabilitiesUrl = new URL(url);
	// I servizi OWS rispondono spesso a richieste senza parametri specificando SERVICE=WMS/WFS/ ecc.
	// Un approccio più robusto è tentare una richiesta generica o specifica per ottenere il documento capabilities.
	// Aggiungiamo un parametro comune per aumentare le probabilità di successo.
	if (!capabilitiesUrl.searchParams.has('request')) {
		capabilitiesUrl.searchParams.set('request', 'GetCapabilities');
	}

	try {
		// 2. Verifica la contattabilità e ottiene la risposta
		// È preferibile utilizzare { mode: 'cors' } nel browser, se supportato dal server.
		// Per un'applicazione frontend, se il server non supporta CORS, questa richiesta fallirà.
		const response = await fetch(capabilitiesUrl.toString());

		// Verifica lo stato HTTP
		if (!response.ok) {
			console.error(`Errore HTTP: ${response.status} ${response.statusText}`);
			return false;
		}

		// 3. Analizza il contenuto della risposta (presumibilmente XML)
		const responseText = await response.text();
		// I documenti capabilities OGC sono XML e contengono tag specifici
		// come <WMS_Capabilities>, <WFS_Capabilities> o <ows:ServiceType>.
		// Cerchiamo stringhe che indichino un servizio OGC valido.
		const isOws =
			responseText.includes('<WMS_Capabilities') ||
			responseText.includes('<WFS_Capabilities') ||
			responseText.includes('<ows:ServiceType') ||
			responseText.toLowerCase().includes('servicetype'); // Controllo case-insensitive

		if (isOws) {
			console.log("L'URL punta a un server OWS valido.");
			return true;
		} else {
			console.log("L'URL è contattabile, ma non sembra essere un server OWS valido.");
			return false;
		}

	} catch (error) {
		// Gestione di errori di rete (DNS fallito, server irraggiungibile, CORS bloccato, ecc.)
		console.error("Errore durante il tentativo di connessione o fetch:", error);
		return false;
	}
}
