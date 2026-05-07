import type { Statement, Theme } from '#/shared/types/msp-project';
import { populateStatement } from '#/shared/types/msp-project';
import { availableThemesMock } from './mocked';

const byIndexName = (indexName: string): Theme | undefined =>
	availableThemesMock.find((theme) => theme.indexName === indexName);

export const statementMocks: Statement[] = [
	populateStatement({
		id: 'st-001',
		shortName: 'Tutela Posidonia',
		longName: 'Misure per la tutela delle praterie di Posidonia',
		description: 'Definizione di aree di ancoraggio controllato e boe ecologiche.',
		sectorThemes: [byIndexName('env_prot')].filter(Boolean) as Theme[],
	}),
	populateStatement({
		id: 'st-002',
		shortName: 'Corridoi marittimi',
		longName: 'Razionalizzazione dei corridoi di traffico marittimo',
		description: 'Riduzione dei conflitti con aree sensibili e pesca artigianale.',
		sectorThemes: [byIndexName('transport')].filter(Boolean) as Theme[],
	}),
	populateStatement({
		id: 'st-003',
		shortName: 'Pesca sostenibile',
		longName: 'Piano per pesca sostenibile e zone di ripopolamento',
		description: 'Introduzione di finestre temporali e aree di nursery protette.',
		sectorThemes: [byIndexName('fishing')].filter(Boolean) as Theme[],
	}),
	populateStatement({
		id: 'st-004',
		shortName: 'Eolico offshore',
		longName: 'Aree idonee per impianti eolici offshore',
		description: 'Individuazione di aree compatibili con vincoli ambientali e rotte navali.',
		sectorThemes: [byIndexName('renewables'), byIndexName('env_prot')].filter(Boolean) as Theme[],
	}),
	populateStatement({
		id: 'st-005',
		shortName: 'Turismo costiero',
		longName: 'Gestione sostenibile del turismo costiero e nautico',
		description: 'Regole per ridurre la pressione antropica nelle stagioni ad alta frequentazione.',
		sectorThemes: [byIndexName('tourism'), byIndexName('landscape')].filter(Boolean) as Theme[],
	}),
	populateStatement({
		id: 'st-006',
		shortName: 'Ricerca marina',
		longName: 'Programma permanente di monitoraggio e ricerca marina',
		description: 'Raccolta dati su biodiversità, qualità delle acque e impatti cumulativi.',
		sectorThemes: [byIndexName('research')].filter(Boolean) as Theme[],
	}),
	populateStatement({
		id: 'st-007',
		shortName: 'Sicurezza navigazione',
		longName: 'Rafforzamento della sicurezza della navigazione',
		description: 'Adozione di corridoi preferenziali e protocolli di segnalazione in aree critiche.',
		sectorThemes: [byIndexName('security'), byIndexName('transport')].filter(Boolean) as Theme[],
	}),
	populateStatement({
		id: 'st-008',
		shortName: 'Riduzione emissioni',
		longName: 'Piano per la riduzione delle emissioni del traffico marittimo',
		description: 'Misure su fuel più puliti e ottimizzazione delle rotte per abbattere CO2.',
		sectorThemes: [byIndexName('energy'), byIndexName('transport')].filter(Boolean) as Theme[],
	}),
];
