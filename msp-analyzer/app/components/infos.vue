<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGeostoryStore } from '@/stores/geostoryStore'
import ScenarioInfoDetails from './scenarioInfoDetails.vue'


const store = useGeostoryStore()
const activeTab = ref<'Scenario' | 'Geostoria' | 'Query builder'>('Scenario')
const queryInput = ref('')
const queryResult = ref<string | null>(null)


const storyDetails = computed(() => {
	const g = store.selectedStory
	if (!g) return null
	return {
		Titolo: g.title,
		"#elementi": g.elements?.length,
		Sezioni: g.sections?.size ?? 0,
		Autore: g.author,
		Data: g.timestamp,
		Descrizione: g.target,
		Elementi: g.elements.map(e => e.storyItems[0]?.title).join(', ')
	}
})
const hasContents = computed(() => {
	return store.scenario !== null || store.selectedStory !== null;
});
const items = computed(() => {
	const tabs = [
		{ title: 'Scenario', details: "ciao" },
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
				<v-card flat class="tw:text-2xl tw:font-roboto">
					<v-card-text>
						<!-- Mostriamo i dettagli della scheda selezionata -->
						<div v-if="activeTab === 'Scenario' && store.scenario">
							<scenario-info-details :scenario="store.scenario" />
						</div>
						<div v-else-if="activeTab === 'Geostoria' && item.details">
							<div v-for="(value, key) in item.details" :key="key" class="details">
								<p class="">{{ key }}:</p>
								<div class="highlight">{{ value || "--" }}</div>
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

.vtabs-local {
	@apply tw:font-roboto tw:text-ux1;
}

.highlight {
	@apply tw:text-ux2
}

.details {
	@apply tw:flex tw:flex-row tw:gap-4 tw:py-1.5 tw:text-xl tw:font-roboto
}

.v-card-text {
	min-height: 100px;
}
</style>
