<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGeostoryStore } from '@/stores/geostoryStore'


const store = useGeostoryStore()
const activeTab = ref<'Scenario' | 'Geostoria' | 'Query builder'>('Scenario')
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
const hasContents = computed(() => {
	return store.scenario !== null || store.selectedStory !== null;
});
const items = computed(() => {
  const tabs = [
    { title: 'Scenario', details: scenarioDetails.value },
    { title: 'Geostoria', details: storyDetails.value },
    { title: 'Query builder', details: null }
  ];
  return tabs;
});

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
	<v-container>
		
		<v-tabs v-model="activeTab" background-color="primary" fixed-tabs class="vtabs-local">
		  <v-tab v-for="item in items" :key="item.title" :value="item.title">{{ item.title }}</v-tab>
		</v-tabs>

		<v-tabs-window v-model="activeTab">
		  <v-tabs-window-item v-for="item in items" :key="item.title" :value="item.title">
				<v-card flat>
					<v-card-text>
						<!-- Mostriamo i dettagli della scheda selezionata -->
						<div v-if="activeTab === 'Scenario' && item.details">
							<div v-for="(value, key) in item.details" :key="key" class="details">
								<p class="">{{key }}:</p> <div class="text-ux2">{{ value || "--" }}</div>
							</div>
						</div>
						<div v-else-if="activeTab=== 'Geostoria' && item.details">
							<div v-for="(value, key) in item.details" :key="key" class="details">
								<p class="">{{key }}:</p> <div class="text-ux2">{{ value || "--" }}</div>
							</div>
						</div>
						<div v-else-if="activeTab === 'Query builder' && hasContents">
							<command-preview />
						</div>
						<div v-else>
							Nessun dettaglio disponibile per la scheda selezionata.
						</div>
					</v-card-text>
				</v-card>
			</v-tabs-window-item>
		</v-tabs-window>
  </v-container>

</template>


<style scoped>
@reference "@/assets/css/tailwind.css";
.vtabs-local{
	@apply text-2xl font-roboto text-ux1;
}
.details {
	@apply flex flex-row gap-4 py-1.5 text-xl;
	
}

.v-card-text {
  min-height: 100px;
}
</style>
