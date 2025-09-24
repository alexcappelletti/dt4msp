import { defineStore } from 'pinia'
import type { Geostory } from '~/models/geostory'
import type { Scenario, Theme } from '~/models/scenario'

export const useGeostoryStore = defineStore('geostory', ()=>{
	const stories = ref<Array<Geostory>>([])
	const selectedStory = ref<Geostory | null>(null)	
	const scenario = ref<Scenario| (null)>(null)
	const themes = ref<Array<Theme>>([])

	function setStories(sts: Array<any>) {
		stories.value = sts
	}

	function setScenario(s: Scenario) {
		scenario.value = s		
	}
	function setThemes(t: Array<Theme>) {
		themes.value = t	
	}
	
	function selectStory(story: Geostory) {
		selectedStory.value = story
	}
	
	return { 
		stories, 
		selectedStory, 
		scenario,
		themes,
		setStories, 
		selectStory,
		setScenario, 
		setThemes}
})