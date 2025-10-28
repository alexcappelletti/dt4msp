<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGeostoryStore } from '@/stores/geostoryStore'

const store = useGeostoryStore()
const activeTab = ref<'scenario' | 'story' | 'query'>('scenario')
const queryInput = ref('')
const queryResult = ref<string | null>(null)

const scenarioDetails = computed(() => {
	const s = store.scenario
	if (!s) return null
	return {
		Nome: s.name,
		Temi: s.temi?.length,
		Mappe: s.maps?.length,
		Dataset: s.datasets?.length,
		Obiettivi: s.objectives?.length,
		AspettiEstesi: s.extendedAspects?.length,
	}
})

const storyDetails = computed(() => {
	const g = store.selectedStory
	if (!g) return null
	return {
		Titolo: g.title,
		Elementi: g.elements?.length,
		Autore: g.author,
		Data: g.timestamp,
		Descrizione: "some description.....",
	}
})

function runQuery() {
	try {
		const parsed = JSON.parse(queryInput.value)
		queryResult.value = `✅ Query valida:\n${JSON.stringify(parsed, null, 2)}`
	} catch (err) {
		queryResult.value = `❌ Errore di parsing: ${err}`
	}
}
</script>

<template>
	<div class="w-full mx-auto bg-gray-200 dark:bg-neutral-900 rounded-xl p-6">
		<!-- Tab Buttons -->
		<div class="flex gap-4 border-b pb-2 text-sm font-medium">
			<button
				@click="activeTab = 'scenario'"
				:class="activeTab === 'scenario' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
				class="px-4 py-2"
			>
				Scenario
			</button>
			<button
				@click="activeTab = 'story'"
				:class="activeTab === 'story' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
				class="px-4 py-2"
			>
				Geostoria
			</button>
			<button
				@click="activeTab = 'query'"
				:class="activeTab === 'query' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'"
				class="px-4 py-2"
			>
				Test Query JSON
			</button>
		</div>

		<!-- Tab Panels -->
		<div v-if="activeTab === 'scenario'" class="mt-6">
			<h2 class="text-xl font-semibold mb-4">Dettagli Scenario</h2>
			<div v-if="scenarioDetails" class="grid grid-cols-2 gap-4">
				<div v-for="(value, key) in scenarioDetails" :key="key">
					<strong>{{ key }}:</strong> {{ value }}
				</div>
			</div>
			<p v-else class="text-gray-500">Nessuno scenario caricato.</p>
		</div>

		<div v-if="activeTab === 'story'" class="mt-6">
			<h2 class="text-xl font-semibold mb-4">Dettagli Geostoria</h2>
			<div v-if="storyDetails" class="grid grid-cols-2 gap-4">
				<div v-for="(value, key) in storyDetails" :key="key">
					<strong>{{ key }}:</strong> {{ value }}
				</div>
			</div>
			<p v-else class="text-gray-500">Nessuna geostoria caricata.</p>
		</div>

		<div v-if="activeTab === 'query'" class="mt-6">
			<h2 class="text-xl font-semibold mb-4">Testa Comandi JSON</h2>
			<textarea
				v-model="queryInput"
				placeholder='{"action": "zoom", "target": "map1"}'
				class="w-full h-32 p-2 border rounded font-mono text-sm"
			/>
			<button @click="runQuery" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500">
				Esegui
			</button>
			<pre v-if="queryResult" class="mt-4 bg-gray-100 p-4 rounded text-sm whitespace-pre-wrap">
				{{ queryResult }}
			</pre>
		</div>
	</div>
</template>
