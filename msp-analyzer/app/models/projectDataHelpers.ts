import type { Scenario, Measure, Theme, OptionalData, Project, AreaOfInterest, Statement } from './scenario';

/**
 * Estrae una lista di tutti gli ID delle misure da uno scenario.
 * @param scenario L'oggetto Scenario.
 * @returns Un array di stringhe (ID).
 */
export function getMeasureIds(scenario: Scenario): readonly string[] {
	return scenario.measures.map(m => m.id);
}

/**
 * Trova una misura specifica all'interno di uno scenario tramite il suo ID.
 * @param scenario L'oggetto Scenario.
 * @param measureId L'ID della misura da cercare.
 * @returns La misura trovata o undefined se non esiste.
 */
export function findMeasureById(scenario: Scenario, measureId: string): Measure | undefined {
	// find è un metodo funzionale che cerca il primo elemento che soddisfa la condizione
	return scenario.measures.find(m => m.id === measureId);
}

export function getSpatialMeasures(scenario: Scenario): readonly Measure[] {
	return scenario.measures?.filter(measure => {
		const hasResources = (measure.geospatialResources?.length ?? 0) > 0;
		return hasResources;
	}) && [];
}
export function getNonSpatialMeasures(scenario: Scenario): readonly Measure[] {
	return (scenario.measures?.filter(m => !(m.geospatialResources?.length > 0)) ?? []) as readonly Measure[]
}

type StatementContainer = {
    statements?: ReadonlyArray<Statement>;
};

export function getGeneralStatements(container: StatementContainer): readonly Statement[] {
	const retValue = container.statements?.filter(s => { return !(s.sectorThemes?.length ?? 0 > 0) })
	return retValue ?? [];
}
export function getSectorSpecificStatements(container: StatementContainer): readonly Statement[] {
	const retValue = container.statements?.filter(s => s.sectorThemes?.length ?? 0 > 0)
	return retValue ?? []
}

/**
 * Conta il numero totale di risorse spaziali (spatialResources + geospatialResources nelle misure) in uno scenario.
 * @param scenario L'oggetto Scenario.
 * @returns Il conteggio totale delle risorse.
 */
export function countTotalSpatialResources(scenario: Scenario): number {
	const measureLayerCount = scenario.measures.reduce((count, measure) => {
		// Usa reduce per sommare i layer di tutte le misure
		return count + (measure.geospatialResources?.length || 0);
	}, 0);

	return scenario.spatialResources.length + measureLayerCount;
}

/**
 * Trasforma il Map<string, OptionalData> 'others' di AreaOfInterest in un array di oggetti OptionalData.
 * @param others La mappa 'others' di AreaOfInterest.
 * @returns Un array di OptionalData.
 */
export function convertOthersMapToArray(others: Map<string, OptionalData>): readonly OptionalData[] {
	// Array.from() o l'operatore spread combinato con values() sono approcci funzionali per convertire iterabili
	return Array.from(others.values());
}


/**
 * Verifica se un tema specifico è presente tra i temi 'topics' di uno scenario.
 * @param scenario L'oggetto Scenario.
 * @param indexName Il nome indice del tema da cercare.
 * @returns True se il tema esiste, altrimenti false.
 */
export function hasTopic(scenario: Scenario, indexName: string): boolean {
	// Accedere direttamente alla proprietà tramite l'indice è efficiente
	return scenario.topics.hasOwnProperty(indexName);
}
