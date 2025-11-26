<script setup lang="ts">
import { ref, computed } from 'vue'
import _ from 'lodash'
import { parseTextWithCommands } from '@/models/commandPayload' // Assicurati che il path sia corretto
import { useGeostoryStore } from '~/stores/geostoryStore'
import type { Scenario } from '~/models/scenario'
import type { Geostory } from '~/models/geostory'

const input = ref('')
const store = useGeostoryStore()
const scenario = ref(store.scenario || {} as Scenario);
const geostory = ref(store.selectedStory || {} as Geostory);

const context = ref<Record<string, any>>({
	[scenario.value?.id ?? 'defaultScenario']: scenario,
	[geostory.value?.id ?? 'defaultGeostory']: geostory	
})
onMounted(() => {
  // Inizializza context al montaggio del componente
  context.value = {
	[scenario.value?.id ?? 'defaultScenario']: scenario.value,
	[geostory.value?.id ?? 'defaultGeostory']: geostory.value
  }
  //scenario.value.topics?.DB_Turismo?.description = "Il turismo blu rappresenta un settore in crescita che mira a promuovere attività turistiche sostenibili e responsabili nelle aree costiere e marine. Questo approccio si concentra sulla conservazione dell'ambiente marino, la valorizzazione delle comunità locali e la promozione di pratiche turistiche che minimizzano l'impatto ambientale. Il turismo blu include attività come l'eco-turismo, il turismo subacqueo, le escursioni in barca a basso impatto e la partecipazione a programmi di conservazione marina. L'obiettivo principale è creare un equilibrio tra lo sviluppo turistico e la protezione degli ecosistemi marini, garantendo che le future generazioni possano godere delle bellezze naturali del mare."
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
		value: '{ "command": "text", "path": "${0}.generalDescription"}',
		param: 'scenarioSoS_bd'
	},
	{
		label: 'Nome scenario',
		value: '{ "command": "text", "path": "${0}.name", "params": ["bold"] }',
		param: 'scenarioSoS_bd'
	},
	{
		label: 'Narrativa dello scenario',
		value: '{ "command": "text", "path": "${0}.narrative" }',
		param: 'scenarioSoS_bd'
	},
	{
		label: 'Obiettivi dello scenario',
		value: '{ "command": "text", "path": "${0}.objectives" }',
		param: 'scenarioSoS_bd'
	},
	{
		label: 'Descrizione di un tema',
		value: 'parlando del tema si parla di { "command": "text", "path": "${0}.topics.BD_turismo.description" }',
		param: 'scenarioSoS_bd'
	},
	{
		label: 'Lista dei dataset',
		value: 'Lista dei dataset disponibili: { "command": "list", "path": "${0}.datasets" }',
		param: 'scenarioSoS_bd'
	},
	{
	label: 'Titolo della geostoria selezionata',
	value: 'Geostoria { "command": "text", "params": ["bold"], "path": "${0}.title" }',
	param: 'gs01BD'
	}
	
]



const output = computed(() => parseTextWithCommands(context.value, input.value))

function setInput(template: string, id: string){
	input.value = template.replace('${0}', id)
}
const rules = [
    (value:string) => !!value || 'Required.',
    (value:string) => (value && value.length >= 2) || 'Min 3 characters',
	(value:string) => {
          try {
            if (value) JSON.parse(value); // Tenta il parsing solo se il campo non è vuoto
          } catch (e) {
            return "Sintassi JSON non corretta"; // Restituisce il messaggio di errore se il parsing fallisce
          }
          return true; // Valido se il parsing riesce o se il campo è vuoto (gestito dalla prima regola)
        }
  ]


</script>

<template>
	<div class="p-4 mb-6  tw:text-xl tw:font-roboto">
		<h1 class="tw:font-bold tw:mb-4">Anteprima Comandi</h1>
		<p class="mb-4">Inserisci un comando JSON nel campo sottostante per vedere il risultato basato sui dati correnti dello scenario e della geostoria.</p>
		<div class="tw:grid tw:grid-cols-2 tw:border-1 tw:border-green-300">
			<v-textarea
				class="tw:h-80"
				hide-details="auto"
				clearable no-resize
				variant="outlined"
				:model-value="input"
				placeholder='Scenario 3: Blue Development (BD): {"command":"text", "path": "scenarioSoS_bd.general_description", "params":["bold"]}'
				label="Query"
    		></v-textarea>

			<div class="mt-4 ml-4 tw:flex tw:flex-col tw:gap-4">
				<h2 class="tw:font-semibold">Esempi query predefinite</h2>
				<ul class="tw:flex tw:flex-col tw:space-y-2 tw:gap-2">
					<li v-for="example in examples" :key="example.label" >
						<!-- <div>{{ example.label }}</div> -->
						<v-btn
							class="ex-button"
							variant="outlined"						
							@click="setInput(example.value, example.param)">
							{{ example.label }}
						</v-btn>
					</li>
				</ul>
				
			</div>
    	
		<!-- </div><textarea
				id="commandInput"
				v-model="input"
				rows="4"
				class="w-full border rounded p-2 font-mono text-3xl "
				placeholder='Scenario 3: Blue Development (BD): {"command":"text", "path": "scenarioSoS_bd.general_description", "params":["bold"]}'
			></textarea> -->
		</div>
		<div class=" pt-8 rounded">
				<p>Rendered:</p>
				<div class="rendered-label" v-html="output"</div>
			</div>
	</div>
	<div> COMMAND PREVIEW COMPONENT </div>
</template>

<style scoped>
@reference "@/assets/css/tailwind.css";

.rendered-label{
	@apply tw:mt-2 tw:bg-gray-300 tw:text-3xl
		tw:whitespace-pre-wrap 
		tw:p-2
}
.ex-button{
	@apply tw:border-ux1 tw:text-ux1 
	tw:transition;
	/* background-color: var(--color-debug); */



}


textarea {
	font-size: 0.9rem;
}
</style>