export function generateUUID(): string {
	// crypto.randomUUID() è disponibile nell'ambiente globale (window/global)
	// Assicurati che il tuo ambiente TypeScript sia configurato per le librerie DOM o Node appropriate.
	if (typeof crypto !== 'undefined' && crypto.randomUUID) {
		return crypto.randomUUID();
	} else {
		// Fallback o gestione di ambienti molto vecchi (vedi Opzione 2)
		console.error("crypto.randomUUID is not supported in this environment.");
		return 'fallback-id-' + Math.random().toString(36).substr(2, 9);
	}
}