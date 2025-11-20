import { describe, expect, it } from "vitest";
import { Measure, MapLayer, Scenario, Theme, Effect, populateScenario, populateTheme, populateMeasure } from "../../app/models/scenario";
import { readFileSync, writeFileSync } from 'fs'

describe("fixture on json rapresentations of scenario", () => {
	
	const getMapLayer = (name:string) =>{
		return {
				id: "layer_"+name,
				name:"sample",
				type: "map",
				url: "tinyurl/sample",
				description: "--",
				layerName: name,
				legendUrl: "",
		}as MapLayer

	}


	const measures: Array<Measure> = [
				{
					name: "Incremento del traffico marittimo",
					impact: "Incremento del traffico marittimo",
					description: "Proiezioni di aumento della densità di traffico per diverse categorie di navi (CAR +30%, CON +53%, PAS +26%, TGC +38%, RRO +33%), basate su studi EMSA (2024) e letteratura di settore (EMSA-EEA 2021, Piano del Mare 2023, Report SRM 2022)",
					geospatialResources: [
						getMapLayer("routedensity_allavg"), 
						getMapLayer("layer_trafficoPSSAPrevisione")]
				} as Measure,
				{
					name: "Misure di mitigazione",
					impact: "Misure di mitigazione",
					description: "Implementazione di interventi per ridurre l'impatto del traffico, tra cui limiti di velocità (10 nodi in area CCH), riduzione della rumorosità, miglioramento della gestione delle acque di zavorra (BWM), e uso di combustibili a basse emissioni.",
					geospatialResources: [
						getMapLayer("layer_speed10nodi")]
				} as Measure,
				{
					name: "Sviluppo porti sostenibili",
					impact:"Sviluppo porti sostenibili",
					description: "Elettrificazione delle banchine, disponibilità di combustibili alternativi, gestione dei rifiuti e acque residue (sea water scrubber), in linea con obiettivi di sostenibilità.",
					geospatialResources: [
						getMapLayer("layer_portiSostenibili")]	
				} as Measure,
				{
					name: "Traffico correlato a eolico offshore",
					impact: "Traffico correlato a eolico offshore",
					description: "Incremento modesto del traffico a corto raggio per costruzione/manutenzione di campi eolici (es. area OW1, OW2, OW4), con potenziali impatti su rotte esistenti.",
					geospatialResources: [
						getMapLayer("layer_OWFs")]
				} as Measure,
				{
					name: "Isola energetica",
					impact: "Isola energetica",
					description: "Hub per combustibili alternativi (idrogeno, metanolo, elettrico) che riduce pressioni costiere e impone limiti di velocità (10 nodi), con benefici ambientali (rumore, collisioni con megafauna).",
					geospatialResources: [
						getMapLayer("layer_speed10nodi")]
				} as Measure,
				{
					name: "Regolamentazione e sicurezza",
					impact: "Regolamentazione e sicurezza",
					description: "Necessità di approfondire sostenibilità economica e sicurezza nel corridoio NW-SE, con possibili misure aggiuntive come Traffic Separation Schemes (TSS)",
					geospatialResources: [
						getMapLayer("layer_corridoioNW-SE")]
				} as Measure
			]
	measures.map((m, idx) => populateMeasure(m))


	const themes = [
		{
			name:"Energia - Oil&Gas",
			indexName: "BD_oil/gas",
			type: "secondario",
			description: "",
			geospatialResources:[],
		}as Theme,
		{	
			name:"Sicurezza e sorveglianza",
			indexName: "BD_sicurezza",
			type: "secondario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}as Theme,
		{
			name:"Acquacoltura",
			indexName: "BD_H2o",
			type: "primario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}as Theme,
		{
			name:"Difesa costiera",
			indexName: "BD_difesa",
			type: "primario",
			description: "",
			geospatialResources:[],
		
		}as Theme,
		{	
			name:"Energia",
			indexName: "BD_energia1",
			type: "primario",
			description: "",
			geospatialResources:[],
		}as Theme,
		{
			name:"Paesaggio e patrimonio culturale",
			indexName: "BD_paesaggio",
			type: "primario",
			description: "",
			geospatialResources:[],
		}as Theme,
		{
			name:"Pesca",
			indexName: "BD_pesca",
			type: "primario",
			description: "",
			geospatialResources:[],
		}as Theme,
		{	name:"Protezione ambientale",
			indexName: "BD_ambiente",
			type: "primario",
			description: "",
			geospatialResources:[],
			
		}as Theme,
		{
			name:"Ricerca & Innovazione",
			indexName: "BD_innovazione",
			type: "primario",
			description: "",
			geospatialResources:[],
			
		}as Theme,
		{
			name:"Trasporto Marittimo",
			indexName: "BD_trasporto",
			type: "primario",
			description: "",
			geospatialResources:[],
		}as Theme,
		{
			name:"Turismo Costiero e Marittimo",
			indexName: "BD_turismo",
			type: "primario",
			description: "",
			geospatialResources:[],
			
		}as Theme,
		{
			name:"Energia rinnovabile",
			indexName: "Energia1",
			type: "NA",
			description: "",
			geospatialResources:[],
		}as Theme,
		{
			name:"Turismo",
			indexName: "Turismo",
			type: "NA",
			description: "",
			geospatialResources:[],
			
		}as Theme
	]
	themes.map((t, idx) => populateTheme(t))

	const effects: Array<Effect> = [
		{
			name: "Riduzione emissioni inquinanti",	
			impact: "Riduzione emissioni inquinanti",
			description: "Diminuzione delle emissioni di CO2, NOx, SOx e particolato grazie all'adozione di combustibili alternativi e tecnologie verdi nei trasporti marittimi e nelle operazioni portuali.",
			geospatialResources: [
				getMapLayer("layer_emissioniRidotte")],
			referenceThemes: [themes[9], themes[4]],  //Trasporto Marittimo, Energia rinnovabile
			affectedMeasures: [measures[0], measures[2]] //Incremento del traffico marittimo, Sviluppo porti sostenibili
		} as Effect,
	]


	const scenario = {
		id:"scenarioSoS_bd",
		name: "Blue Development",
		generalDescription: "Economia blu sostenibile basata su soluzioni innovative/tecnologie verdi",
		narrative: "obiettivi di conservazione e azioni per fvorire sviluppo sostenibile di economa blu (focus settori innovativi, utilizzo di NBS, teconologie per diminuire impatti antropici)",
		temporalScope: "2040 - probabile orizzonte di più lungo periodo (causa settori trasporto marittimo, pesca, soluzioni/tecnologie adottate)",
		maps: ["geonodeMap_1", "geonodeMap_2", "geoSOS"],
		datasets: ["dataset_bd1", "dataset_bd2", "MF_SoS"],
		topics: {},
		availableThemes: themes,
		measures: measures,
		effects: effects,
		definedGeostories: [] as Geostory[],
		primaryThemes: themes.filter(t => t.type === "primario"),
		secondaryThemes: themes.filter(t => t.type === "secondario"),
		objectives: ""
	} as Scenario

	it ("should check default scenario", () => {
		const emptyScenario: Scenario = populateScenario({} as Partial<Scenario>)
		expect(emptyScenario.id).toBeDefined()
		expect(emptyScenario.name).toBe("")
		expect(emptyScenario.generalDescription).toBe("metti una descrizione generale qui")
		expect(emptyScenario.narrative).toBe("metti descr narrativa qui")
		expect(emptyScenario.temporalScope).toBe("")
		expect(emptyScenario.spatialResources.length).toBe(0)
		expect(emptyScenario.datasets.length).toBe(0)
		
		expect(Object.keys(emptyScenario.topics).length).toBe(0)
		expect(emptyScenario.definedGeostories.length).toBe(0)
		expect(emptyScenario.availableThemes.length).toBe(0)
		expect(emptyScenario.objectives).toBe("")
	})

	it("should populate scenario", () => {
		expect(themes.length).toBe(13)
		const testing = populateScenario({...scenario} as Partial<Scenario>)
		expect(testing.availableThemes?.length).toBe(13)
		expect(testing.topics["BD_trasporto"]).toBeDefined()
		expect(testing.availableThemes?.length).toBe(13)
		expect(testing.primaryThemes?.length).toBe(9)


	})

	it.skip("should load scenario from json file", () => {
		const infile = "./tests/fixtures/scenario_bd.json"
		const data: Scenario = JSON.parse(readFileSync(infile, 'utf-8'))
		expect(data).toBeDefined()
		expect(data.id).toBe("scenarioSoS_bd")
		expect(data.name).toBe("Blue Development")
		expect(data.generalDescription).toBe("Economia blu sostenibile basata su soluzioni innovative/tecnologie verdi")
		expect(data.narrative).toBe("obiettivi di conservazione e azioni per fvorire sviluppo sostenibile di economa blu (focus settori innovativi, utilizzo di NBS, teconologie per diminuire impatti antropici)")
		expect(data.temporalScope).toBe("2040 - probabile orizzonte di più lungo periodo (causa settori trasporto marittimo, pesca, soluzioni/tecnologie adottate)")
		expect(data.availableThemes?.length).toBe(13)
		expect(data.topics["BD_trasporto"]).toBeDefined()
		expect(data.availableThemes?.length).toBe(13)
		expect(data.primaryThemes?.length).toBe(9)
	})


	it("should save scenario on file", () => {
		expect(themes.length).toBe(13)
		const testing = populateScenario({...scenario, availableThemes: themes} as Partial<Scenario>)
		expect(testing.availableThemes?.length).toBe(13)
		expect(testing.topics["BD_trasporto"]).toBeDefined()
		const outfile = "./tests/fixtures/out_scenario_bd.json"
		writeFileSync(outfile, JSON.stringify(testing, null, 2), 'utf-8')
		const expected: Scenario = JSON.parse(readFileSync(outfile, 'utf-8'))
		expect(expected.id).toBe(testing.id)
		expect(expected.availableThemes?.length).toBe(13)

	})



})