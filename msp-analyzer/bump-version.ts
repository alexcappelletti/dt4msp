import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const packageJsonPath = resolve(process.cwd(), 'package.json');

try {
	const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
	const currentVersion = pkg.version;

	// Splitta la versione (es. 1.0.5 -> [1, 0, 5])
	const parts = currentVersion.split('.').map(Number);

	if (parts.length === 3) {
		parts[2]++; // Incrementa l'ultimo numero (patch)
		pkg.version = parts.join('.');

		writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
		console.log(
			`✅ Versione incrementata: ${currentVersion} -> ${pkg.version}`,
		);
	} else {
		console.error('❌ Formato versione nel package.json non valido.');
		process.exit(1);
	}
} catch (error) {
	console.error("❌ Errore durante l'aggiornamento della versione:", error);
	process.exit(1);
}
