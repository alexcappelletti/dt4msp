<script setup lang="ts">
import { ref, computed } from 'vue'
import _ from 'lodash'
import { parseTextWithCommands } from '@/models/commandPayload' // Assicurati che il path sia corretto
import { useGeostoryStore } from '~/stores/geostoryStore'
import type { Scenario } from '~/models/scenario'
import { Geostory } from '~/models/geostory'

const input = ref('')
const store = useGeostoryStore()
const scenario = ref(store.scenario || {} as Scenario);
const geostory = ref(store.selectedStory || {} as Geostory);

const context = ref<Record<string, any>>({
	[scenario.value?.id ?? 'defaultScenario']: scenario,
	[geostory.value?.id ?? 'defaultGeostory']: geostory	
})

// 🔁 Watch per aggiornare context quando cambia lo scenario
watch(() => store.scenario,
  (newScenario) => {
    scenario.value = newScenario || {} as Scenario
    context.value = {
      [newScenario?.id ?? 'defaultScenario']: newScenario
    }
  },
  { immediate: true }
)

// 🔁 Watch per aggiornare context quando cambia la geostoria
watch(
  () => store.selectedStory,
  (newStory) => {
	geostory.value = newStory || {} as Geostory
    context.value = {
	  [scenario.value?.id ?? 'defaultScenario']: scenario.value,		
      [newStory?.id ?? 'defaultGeostory']: newStory
    }
  },
  { immediate: true }
)



const examples = [
	{
		label: 'Descrizione generale dello scenario',
		value: '{ "command": "text", "path": "${0}.generalDescription"}'
	},
	{
		label: 'Nome scenario',
		value: '{ "command": "text", "path": "${0}.name", "params": ["bold"] }'
	},
	{
		label: 'Narrativa dello scenario',
		value: '{ "command": "text", "path": "${0}.narrative" }'
	},
	{
		label: 'Obiettivi dello scenario',
		value: '{ "command": "text", "path": "${0}.objectives" }'
	},
	{
		label: 'Descrizione di un tema',
		value: 'Tra i temi disponibili, il { "command": "text", "path": "${0}.temi.BD_turismo.description" }'
	},
	{
		label: 'Lista dei dataset',
		value: 'Lista dei dataset disponibili: { "command": "list", "path": "${0}.datasets" }'
	},
	{
	label: 'Titolo della geostoria selezionata',
	value: 'Geostoria { "command": "text", "params": ["bold"], "path": "${0}.title" }'
	}
	
]



const output = computed(() => parseTextWithCommands(context.value, input.value))

function setInput(template: string, id: string){
	input.value = template.replace('${0}', id)
}



</script>

<template>
	<div class="p-4 min-w-0 mx-auto mb-6 text-xl">
		<h1 class="font-bold mb-4">Anteprima Comandi</h1>
		<p class="mb-4">Inserisci un comando JSON nel campo sottostante per vedere il risultato basato sui dati correnti dello scenario e della geostoria.</p>
		<textarea
				id="commandInput"
				v-model="input"
				rows="4"
				class="w-full border rounded p-2 font-mono text-3xl "
				placeholder='Scenario 3: Blue Development (BD): {"command":"text", "path": "scenarioSoS_bd.general_description", "params":["bold"]}'
			></textarea>
		<div class="mt-6">
			<div class="space-y-2 pb-4">
			<strong class="block font-semibold">Esempi query predefinite</strong>
			<ul class="space-y-1">
				<li v-for="example in examples" :key="example.label">
					<button
						class="text-ux2 text-xl hover:underline"
						@click="setInput(example.value, scenario?.id || 'defaultScenario')"
					>
						{{ example.label }}
					</button>
				</li>
			</ul>
		</div>

			<div class=" pt-8 rounded">
				<p>Rendered:</p>
				<div class="text-3xl mt-2 whitespace-pre-wrap prose max-v-none bg-gray-300 p-8" v-html="output"</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
textarea {
	font-size: 0.9rem;
}
</style>