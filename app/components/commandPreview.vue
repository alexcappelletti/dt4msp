<script setup lang="ts">
import { ref, computed } from 'vue'
import _ from 'lodash'
import { parseTextWithCommands } from '@/models/commandPayload' // Assicurati che il path sia corretto
import { useGeostoryStore } from '~/stores/geostoryStore'
import type { Scenario } from '~/models/scenario'
import { Geostory } from '~/models/geostory'

const input = ref('')
const store = useGeostoryStore()
const scenario = store.scenario || {} as Scenario;
const geostory = store.selectedStory || {} as Geostory;

const context = {
	[scenario?.id ?? 'defaultScenario']: scenario,
	[geostory?.id ?? 'defaultGeostory']: geostory	
}

const examples = [
	{
		label: 'Descrizione generale dello scenario',
		value: `{ "command": "text", "path": "${[scenario?.id ?? 'defaultScenario']}.generalDescription"}`
	},
	{
		label: 'Nome scenario',
		value: `{ "command": "text", "path": "${[scenario?.id ?? 'defaultScenario']}.name", "params": ["bold"] }`
	},
	{
		label: 'Narrativa dello scenario',
		value: `{ "command": "text", "path": "${[scenario?.id ?? 'defaultScenario']}.narrative" }`
	},
	{
		label: 'Obiettivi dello scenario',
		value: `{ "command": "text", "path": "${[scenario?.id ?? 'defaultScenario']}.objectives" }`
	},
	{
		label: 'Descrizione di un tema',
		value: `Tra i temi disponibili, il { "command": "text", "path": "${[scenario?.id ?? 'defaultScenario']}.temi.BD_turismo.description" }...`
	},
	{
		label: 'Lista dei dataset',
		value: `Lista dei dataset disponibili: { "command": "list", "path": "${[scenario?.id ?? 'defaultScenario']}.datasets" }`
	},
	{
	label: 'Titolo della geostoria selezionata',
	value: `Geostoria { "command": "text", "params": ["bold"], "path": "${[geostory?.id ?? 'defaultGeostory']}.title" }`
	}
	
]



const output = computed(() => parseTextWithCommands(context, input.value))




</script>

<template>
	<div class="space-y-2">
	<strong class="block">Esempi query predefinite</strong>
	<ul class="space-y-1">
		<li v-for="example in examples" :key="example.label">
			<button
				class="text-ux2 hover:underline text-sm"
				@click="input = example.value"
			>
				{{ example.label }}
			</button>
		</li>
	</ul>
</div>

	<div class="p-4 max-w-xl mx-auto space-y-4">
	<label for="commandInput" class="block font-semibold">Inserisci comando:</label>
		<textarea
			id="commandInput"
			v-model="input"
			rows="4"
			class="w-full border rounded p-2 font-mono"
			placeholder='Scenario 3: Blue Development (BD): {"command":"text", "path": "scenarioSoS_bd.general_description", "params":["bold"]}'
		></textarea>

		<div class="bg-gray-100 p-4 rounded">
			<strong>Risultato:</strong>
			<div class="mt-2 whitespace-pre-wrap prose max-v-none" v-html="output"</div>
		</div>
	</div>
</template>

<style scoped>
textarea {
	font-size: 0.9rem;
}
</style>