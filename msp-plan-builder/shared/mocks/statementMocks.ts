import type { Statement } from '#/shared/types/msp-project';
import { populateStatement } from '#/shared/types/msp-project';
import {
	mockThemeEnergy,
	mockThemeEnvProt,
	mockThemeFishing,
	mockThemeLandscape,
	mockThemeRenewables,
	mockThemeResearch,
	mockThemeSecurity,
	mockThemeTourism,
	mockThemeTransport,
} from './themeMocks';

export const statementMocks: Statement[] = [
	populateStatement({
		id: 'st-001',
		shortName: 'Tutela Posidonia',
		longName: 'Misure per la tutela delle praterie di Posidonia',
		description: 'Definizione di aree di ancoraggio controllato e boe ecologiche.',
		sectorThemes: [mockThemeEnvProt],
	}),
	populateStatement({
		id: 'st-002',
		shortName: 'Corridoi marittimi',
		longName: 'Razionalizzazione dei corridoi di traffico marittimo',
		description: 'Riduzione dei conflitti con aree sensibili e pesca artigianale.',
		sectorThemes: [mockThemeTransport],
	}),
	populateStatement({
		id: 'st-003',
		shortName: 'Pesca sostenibile',
		longName: 'Piano per pesca sostenibile e zone di ripopolamento',
		description: 'Introduzione di finestre temporali e aree di nursery protette.',
		sectorThemes: [mockThemeFishing],
	}),
	populateStatement({
		id: 'st-004',
		shortName: 'Eolico offshore',
		longName: 'Aree idonee per impianti eolici offshore',
		description: 'Individuazione di aree compatibili con vincoli ambientali e rotte navali.',
		sectorThemes: [mockThemeRenewables, mockThemeEnvProt],
	}),
	populateStatement({
		id: 'st-005',
		shortName: 'Turismo costiero',
		longName: 'Gestione sostenibile del turismo costiero e nautico',
		description: 'Regole per ridurre la pressione antropica nelle stagioni ad alta frequentazione.',
		sectorThemes: [mockThemeTourism, mockThemeLandscape],
	}),
	populateStatement({
		id: 'st-006',
		shortName: 'Ricerca marina',
		longName: 'Programma permanente di monitoraggio e ricerca marina',
		description: 'Raccolta dati su biodiversita, qualita delle acque e impatti cumulativi.',
		sectorThemes: [mockThemeResearch],
	}),
	populateStatement({
		id: 'st-007',
		shortName: 'Sicurezza navigazione',
		longName: 'Rafforzamento della sicurezza della navigazione',
		description: 'Adozione di corridoi preferenziali e protocolli di segnalazione in aree critiche.',
		sectorThemes: [mockThemeSecurity, mockThemeTransport],
	}),
	populateStatement({
		id: 'st-008',
		shortName: 'Riduzione emissioni',
		longName: 'Piano per la riduzione delle emissioni del traffico marittimo',
		description: 'Misure su fuel piu puliti e ottimizzazione delle rotte per abbattere CO2.',
		sectorThemes: [mockThemeEnergy, mockThemeTransport],
	}),
];
