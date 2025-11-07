import { describe, expect, it } from "vitest";
import { Impact, MapLayer, Scenario, Theme } from "../../app/models/scenario";
import { readFileSync, writeFileSync } from 'fs'

describe("fixture on json rapresentations of data", () => {
	
	const getMapLayer = (name:string) =>{
		return new MapLayer({
				name:name,
				id: "sample",
				type: "map",
				url: "tinyurl/sample",
				description: "--",
				layerName: name,
				legendUrl: "",
		})

	}


	const impacts: Array<Impact> = [
				new Impact({
					"impactName": "Incremento del traffico marittimo",
					"impactOnTheme": "Incremento del traffico marittimo",
					"description": "Proiezioni di aumento della densità di traffico per diverse categorie di navi (CAR +30%, CON +53%, PAS +26%, TGC +38%, RRO +33%), basate su studi EMSA (2024) e letteratura di settore (EMSA-EEA 2021, Piano del Mare 2023, Report SRM 2022)",
					"layersInvolved": [
						getMapLayer("routedensity_allavg"), 
						getMapLayer("layer_trafficoPSSAPrevisione")]
				}),
				new Impact({
					"impactName": "Misure di mitigazione",
					"impactOnTheme": "Misure di mitigazione",
					"description": "Implementazione di interventi per ridurre l’impatto del traffico, tra cui limiti di velocità (10 nodi in area CCH), riduzione della rumorosità, miglioramento della gestione delle acque di zavorra (BWM), e uso di combustibili a basse emissioni.",
					"layersInvolved": [
						getMapLayer("layer_speed10nodi")]
				}),
				new Impact({
					"impactOnTheme":"Sviluppo porti sostenibili",
					"impactName": "Sviluppo porti sostenibili",
					"description": "Elettrificazione delle banchine, disponibilità di combustibili alternativi, gestione dei rifiuti e acque residue (sea water scrubber), in linea con obiettivi di sostenibilità.",
					
				}),
				new Impact({
					"impactName": "Traffico correlato a eolico offshore",
					"impactOnTheme": "Traffico correlato a eolico offshore",
					"description": "Incremento modesto del traffico a corto raggio per costruzione/manutenzione di campi eolici (es. area OW1, OW2, OW4), con potenziali impatti su rotte esistenti.",
					"layersInvolved": [
						getMapLayer("layer_OWFs")]
				}),
				new Impact({
					"impactName": "Isola energetica",
					"impactOnTheme": "Isola energetica",
					
					"description": "Hub per combustibili alternativi (idrogeno, metanolo, elettrico) che riduce pressioni costiere e impone limiti di velocità (10 nodi), con benefici ambientali (rumore, collisioni con megafauna).",
					"layersInvolved": [
						getMapLayer("layer_speed10nodi")]
				}),
				new Impact({
					"impactName": "Regolamentazione e sicurezza",
					"impactOnTheme": "Regolamentazione e sicurezza",
					"description": "Necessità di approfondire sostenibilità economica e sicurezza nel corridoio NW-SE, con possibili misure aggiuntive come Traffic Separation Schemes (TSS)",
					"layersInvolved": [
						getMapLayer("layer_corridoioNW-SE")]
				})
			]

	const themes = [
		new Theme({
			"id": "Energia - Oil&Gas",
			"theme_id": "BD_oil/gas",
			"type": "secondario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({
			"id": "Sicurezza e sorveglianza",
			"theme_id": "BD_sicurezza",
			"type": "secondario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({
			"id": "Acquacoltura",
			"theme_id": "BD_H2o",
			"type": "primario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({"id": "Difesa costiera",
			"theme_id": "BD_difesa",
			"type": "primario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({"id": "Energia",
			"theme_id": "BD_energia1",
			"type": "primario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({"id": "Paesaggio e patrimonio culturale",
			"theme_id": "BD_paesaggio",
			"type": "primario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({"id": "Pesca",
			"theme_id": "BD_pesca",
			"type": "primario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({"id": "Protezione ambientale",
			"theme_id": "BD_ambiente",
			"type": "primario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({"id": "Ricerca & Innovazione",
			"theme_id": "BD_innovazione",
			"type": "primario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({"id": "Trasporto Marittimo",
			"theme_id": "BD_trasporto",
			"type": "primario",
			description: "",
			geospatialResources:[],
			impacts:impacts
		}),
		new Theme({"id": "Turismo Costiero e Marittimo",
			"theme_id": "BD_turismo",
			"type": "primario",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({"id": "Energia rinnovabile",
			"theme_id": "Energia1",
			"type": "NA",
			description: "",
			geospatialResources:[],
			impacts:[]
		}),
		new Theme({"id": "Turismo",
			"theme_id": "Turismo",
			"type": "NA",
			description: "",
			geospatialResources:[],
			impacts:[]
		})
	]

	const scenario = new Scenario({
		"id": "scenarioSoS_bd",
		"name": "Blue Development",
		"generalDescription": "Economia blu sostenibile basata su soluzioni innovative/tecnologie verdi",
		"narrative": "obiettivi di conservazione e azioni per fvorire sviluppo sostenibile di economa blu (focus settori innovativi, utilizzo di NBS, teconologie per diminuire impatti antropici)",
		"temporalScope": "2040 - probabile orizzonte di più lungo periodo (causa settori trasporto marittimo, pesca, soluzioni/tecnologie adottate)",
		"maps": ["geonodeMap_1", "geonodeMap_2", "geoSOS"],
		"datasets": ["dataset_bd1", "dataset_bd2", "MF_SoS"],
		"extendedAspects": "valutazione_preliminare, norme",
		"availableThemes": themes,
		"definedGeostories": [],
		objectives: ""
		
	})

	it("should save scenario on file", () => {
		expect(Object.values(scenario.topics).length).toBe(13)
		expect(scenario.topics["BD_trasporto"]).toBeDefined()
		const outfile = "./out/scenario.json"
		writeFileSync(outfile, JSON.stringify(scenario, null, 2), 'utf-8')
		const expected: Scenario = JSON.parse(readFileSync(outfile, 'utf-8'))
		expect(expected.id).toBe(scenario.id)
		expect(Object.values(expected.temi).length).toBe(13)

	})



})