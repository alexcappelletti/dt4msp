import type { Project, Scenario, Theme, Measure, Statement } from '@/models/scenario';
import { populateScenario, populateTheme, populateMeasure } from '@/models/scenario';


/**
 * Crea un mock completo di Geostory per i test, ambientato nel Canale di Sicilia.
 */
export function createSicilyChannelMockGeostory(): Geostory {

	// --- SEZIONE 1: INTRODUZIONE (1 Elemento, 1 Item) ---

	const itemMare: StoryItem = populateStoryItem({
		id: "item-mare-uuid",
		title: "Il Contesto Marino",
		text: "Il Canale di Sicilia è un'area strategica per la biodiversità marina e le rotte commerciali.",
		author: "Ricercatore ISMEA",
		visual: { type: 'map', config: { center: [36.5, 13.0], zoom: 7 } } as any,
		structure: 'text_only',
		style: updateItemStyle({ textAlignment: 'center' }),
	});

	const elementIntro: StoryElement = populateStoryElement({
		id: "el-intro-uuid",
		order: 1, // Ordine della sezione
		sectionID: "sezione-introduzione",
		sectionTitle: "Introduzione Geografica",
		storyItems: [itemMare], // Un solo item
	});


	// --- SEZIONE 2: ANALISI DEI DATI (2 Elementi, 1 Item ciascuno) ---

	const itemPesca: StoryItem = populateStoryItem({
		id: "item-pesca-uuid",
		title: "Attività di Pesca e Impatti",
		text: "Analisi delle principali zone di pesca del Gambero Rosso e l'impatto delle misure di conservazione.",
		tags: ["pesca", "economia", "dati"],
		visual: { type: 'map', config: { layer: 'zone_pesca_sicilia' } } as any,
		structure: 'visual_right',
		style: updateItemStyle({ visualPos: 'right' }),
	});

	const itemEcologia: StoryItem = populateStoryItem({
		id: "item-ecologia-uuid",
		title: "Ecosistemi Vulnerabili",
		text: "Focalizzazione sulle praterie di Posidonia e le aree marine protette.",
		tags: ["ambiente", "biodiversità"],
		visual: { type: 'map', config: { layer: 'aree_protette' } } as any,
		structure: 'visual_left',
		style: updateItemStyle({ visualPos: 'left' }),
	});

	const elementPesca: StoryElement = populateStoryElement({
		id: "el-pesca-uuid",
		order: 2, // Ordine della sezione
		sectionID: "sezione-temi",
		sectionTitle: "Temi Principali e Dati",
		storyItems: [itemPesca], // Un solo item
	});

	const elementEcologia: StoryElement = populateStoryElement({
		id: "el-ecologia-uuid",
		// Stesso order della sezione precedente, la funzione groupBy ordinerà per order
		order: 2,
		sectionID: "sezione-temi",
		sectionTitle: "Temi Principali e Dati",
		storyItems: [itemEcologia], // Un solo item
	});


	// --- SEZIONE 3: IMPATTI SOCIALI (3 Elementi, 1 Item ciascuno) ---

	const itemMigrazioni: StoryItem = populateStoryItem({
		id: "item-migrazioni-uuid",
		title: "Flussi Migratori",
		text: "Una panoramica degli aspetti socio-economici e delle rotte migratorie che attraversano il canale.",
		structure: 'text_only',
		style: updateItemStyle({}),
	});

	const itemCommercio: StoryItem = populateStoryItem({
		id: "item-commercio-uuid",
		title: "Rotte Commerciali",
		text: "L'importanza economica del canale per il traffico marittimo globale.",
		structure: 'text_only',
		style: updateItemStyle({}),
	});

	const itemCultura: StoryItem = populateStoryItem({
		id: "item-cultura-uuid",
		title: "Eredità Culturale",
		text: "Breve storia delle civiltà che hanno navigato queste acque.",
		structure: 'text_only',
		style: updateItemStyle({}),
	});

	const elementMigrazioni: StoryElement = populateStoryElement({
		id: "el-migra-uuid",
		order: 3, // Ordine della sezione
		sectionID: "sezione-impatti",
		sectionTitle: "Impatti Socio-Culturali",
		storyItems: [itemMigrazioni],
	});

	const elementCommercio: StoryElement = populateStoryElement({
		id: "el-comm-uuid",
		order: 3,
		sectionID: "sezione-impatti",
		storyItems: [itemCommercio],
	});

	const elementCultura: StoryElement = populateStoryElement({
		id: "el-cultura-uuid",
		order: 3,
		sectionID: "sezione-impatti",
		storyItems: [itemCultura],
	});


	// --- 4. Popola la Geostory ---

	const mockGeostory: Geostory = populateGeostory({
		id: "geostory-canale-sicilia-uuid",
		title: "Geostoria: Dinamiche Socio-Ambientali del Canale di Sicilia",
		author: "Osservatorio Mediterraneo",
		topic: "Geopolitica e Ambiente",
		scenario: "Stato Attuale 2024",
		language: "ita",
		exportType: "pdf",
		// Passiamo tutti gli elementi, populateGeostory li raggrupperà e ordinerà automaticamente.
		elements: [
			elementIntro,
			elementPesca,
			elementEcologia,
			elementMigrazioni,
			elementCommercio,
			elementCultura
		],
	});

	return mockGeostory;
}