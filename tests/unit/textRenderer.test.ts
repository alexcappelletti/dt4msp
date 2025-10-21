import { describe, it, expect } from "vitest"
import Handlebars from "handlebars"

import { Impact, Scenario, Theme } from "@/models/scenario"
import { StoryItem } from "@/models/geostory"


describe('Geostory template rendering', () => {
	it('should render geostory text using scenario data', () => {
		const impact = new Impact({
			id: 'imp001',
			name: 'Impatto Ambientale',
			impactOnTheme: 'Ambiente',
			description: 'Descrizione dell\'impatto ambientale.',
			type: 'Ambientale',
			layersInvolved: ['layer1', 'layer2']
		});

		
		// 👤 Scenario di esempio
		const scenario = new Scenario({
			id: 'sc001',
			name: 'Trentino Verde',
			generalDescription: 'Un progetto ambientale per la regione.',
			narrative: 'La storia del cambiamento climatico locale.',
			temporalScope: '2020–2030',
			maps: ['map1', 'map2'],
			datasets: ['dataset1', 'dataset2'],
			extendedAspects: 'Aspetti ecologici e sociali.',
			availableThemes: [
				new Theme(
					{ description: 'Tema 1', geospatialResources: [], id: 't1', impacts: [impact], theme_id: 'Ambiente', type: 'Ecologia' }),
				new Theme(	
					{ description: 'Ambiente e biodiversità', 
						geospatialResources: [], 
						id: 't2', impacts: [impact], theme_id: 'Società', type: 'Sociale' }),
				new Theme(
					{description: 'Energia rinnovabile', 
						geospatialResources: [], 
						id: 't3', 
						impacts: [impact], 
						theme_id: 'Economia', type: 'Economico' })
			],
			definedGeostories: [],
			objectives: 'Promuovere la sostenibilità e la consapevolezza ambientale',

		})

		const testStoryItem = new StoryItem({
			id: 'story_test_001',
			title: 'Benvenuto nel progetto',
			text: `{{name}} Obiettivo: {{generalDescription}}`,
			//text: `{{name}} Obiettivo: {{objectives}} e {{themeAt availableThemes 1 "description"}}`,
			author: 'alex',
			visual: null, // oppure un oggetto Visual mock se vuoi testare anche quello
			structure: 'intro',
			comments: 'StoryItem di test per rendering template',
			tags: ['test', 'template', 'handlebars'],
			mapActions: ['zoomToRegion', 'highlightTheme']
		})


		// 🧠 Rendering del testo
		const compiled = Handlebars.compile(testStoryItem.text)
		Handlebars.registerHelper('themeAt', function (themes, index, field) {
			return themes?.[index]?.[field] || '';
		})

		const result = compiled(scenario)

		// ✅ Verifica
		expect(result).toBe(
			`Trentino Verde Obiettivo: ${scenario.generalDescription}`
		)
	})
})
