<script setup lang="ts">
import { ref, computed } from 'vue'
import { Geostory, StoryElement, StoryItem, defaultGeostory } from '@/models/geostory'
import { MapVisual } from '~/models/visual';
import { useGeostoryStore } from '@/stores/geostoryStore'

// Importa le icone (esempio con Heroicons)
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import MapViewer from '@/components/mapViewer.vue';

const geostory = useGeostoryStore().selectedStory || defaultGeostory
const scenario = useGeostoryStore().scenario

const index = ref(0)
const showMobileToc = ref(false)

const currentElement = computed(() => geostory?.elements[index.value])
const storyItem = computed(() => {
	const el = currentElement.value
	if (el === undefined || el.storyItems?.length <= 0) { return undefined }
	return el.storyItems[0]
})




const backgroundStyle = computed(() => {
	const url = storyItem.value?.visual?.getUrl()
	return url ? {
		backgroundImage: `url('${url}')`,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat'
	} : {}
})

const toc = computed(() => {
	const sections = geostory.getSections();
	const tocStructure: { title: string; element: StoryElement }[] = [];
	const insertedTitles = new Set<string>();
	for (const sectionKey of sections.keys()) {
		const section = sections.get(sectionKey);
		if (!section) continue;
		const title = section.getTitle();
		if (!title || insertedTitles.has(title)) continue;
		const firstElement = section.elements[0];
		if (!firstElement) continue;

		tocStructure.push({ title, element: firstElement });
		insertedTitles.add(title);
	}
	//tocStructure.sort((a, b) => a.title.localeCompare(b.title));
	return tocStructure;
});

function goAtElement(element: StoryElement) {
	const foundIndex = geostory.elements.findIndex((el) =>
		el.id === element.id
	);
	if (foundIndex !== -1) {
		index.value = foundIndex;
		showMobileToc.value = false;
	}
}

function next() {
	const len = (geostory?.elements.length || 0) - 1
	if (index.value < len) index.value++
}

function prev() {
	if (index.value > 0) index.value--
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(date)
}
</script>

<template>
	<!-- Componente che si adatta al layout padre (70vh con padding 2rem) -->
	<div class="flex flex-col lg:flex-row h-[calc(70vh)] -m-8 bg-white rounded-lg overflow-hidden shadow-lg">
		
		<!-- Mobile Header - visibile solo su schermi piccoli -->
		<header class="lg:hidden bg-gray-100 border-b border-gray-300 p-4">
			<h1 class="text-lg sm:text-xl font-semibold break-words hyphens-auto">
				{{ geostory.title }}
			</h1>
			<button 
				@click="showMobileToc = !showMobileToc"
				class="nav-button"
			>
				{{ showMobileToc ? 'Nascondi indice' : 'Mostra indice' }}
			</button>
		</header>

		<!-- TOC Drawer/Modal -->
		<aside 
			:class="[
				'bg-gray-100 border-r border-gray-300 overflow-y-auto transition-transform duration-300',
				// Desktop: sempre visibile
				'lg:w-[300px] lg:relative lg:translate-x-0',
				// Mobile: overlay che si apre/chiude
				'lg:block fixed inset-y-0 left-0 z-50 w-80 transform',
				showMobileToc ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
			]"
		>
			<div class="p-4 sm:p-6">
				<!-- Titolo visibile solo su desktop -->
				<h1 class="hidden lg:block text-lg xl:text-xl font-semibold mb-4 break-words hyphens-auto">
					{{ geostory.title }}
				</h1>
				
				<!-- Bottone chiusura per mobile -->
				<button 
					@click="showMobileToc = false"
					class="lg:hidden mb-4 text-gray-600 hover:text-gray-800 text-xl"
				>
					✕ Chiudi
				</button>
				
				<ul class="space-y-2">
					<li v-for="(item, idx) in toc" :key="item.element.id">
						<strong 
							@click="goAtElement(item.element)"
							class="block cursor-pointer px-2 py-2 sm:py-1 rounded transition-colors duration-200 text-sm sm:text-base hover:bg-gray-200" 
							:class="{
								'bg-ux3 text-ux5 font-bold': item.element.sectionID === currentElement?.sectionID
							}"
						>
							{{ item.title }}
						</strong>
					</li>
				</ul>
			</div>
		</aside>

		<!-- Overlay per mobile quando TOC è aperto -->
		<div 
			v-if="showMobileToc" 
			@click="showMobileToc = false"
			class="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
		></div>

		<!-- Contenuto principale -->
		<main class="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col overflow-y-auto">
			<!-- Container principale responsive -->
			<div 
				class="relative w-full text-black bg-cover bg-center bg-no-repeat rounded-lg overflow-hidden flex-1 min-h-0"
				:style="backgroundStyle"
			>
				<!-- Content box responsive -->
				<div class="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-lg max-w-full sm:max-w-2xl lg:max-w-3xl mx-auto shadow-lg h-full flex flex-col justify-center">
					<div v-if="currentElement && storyItem" class="text-center sm:text-left">
						<h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">
							{{ storyItem.title }}
						</h2>
						<p class="mb-3 sm:mb-4 text-sm sm:text-base lg:text-lg leading-relaxed">
							{{ storyItem.text }}
						</p>
						<p class="text-xs sm:text-sm text-gray-600">
							Autore: {{ geostory.author }} | {{ formatDate(geostory.timestamp) }}
						</p>
						<MapViewer
							v-if="storyItem.visual?.format === 'MAP'"
							:visuals="[storyItem.visual as MapVisual]"
							class="mt-4 h-96 rounded-lg overflow-hidden shadow"
							/>

					</div>
				</div>
			</div>

			<!-- Paginazione responsive -->
			<div class="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-4 p-3 sm:p-4 bg-gray-100 rounded-lg shadow-sm flex-shrink-0">
				<button
					class="nav-button2"
					@click="prev" 
					:disabled="index === 0"
				>
					<ChevronLeftIcon class="w-4 h-4 sm:w-5 sm:h-5" />
					<span>Indietro</span>
				</button>
				
				<div class="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-full 
				shadow-sm order-first mt-2 sm:order-none">
					<span class="text-xs sm:text-sm font-medium whitespace-nowrap">
						Pagina {{ index + 1 }} di {{ geostory.elements.length }}
					</span>
				</div>
				
				<button
					class="nav-button2"
					@click="next" 
					:disabled="index === geostory.elements.length - 1"
				>
					<span>Avanti</span>
					<ChevronRightIcon class="w-4 h-4 sm:w-5 sm:h-5" />
				</button>
			</div>
		</main>
	</div>
</template>

<style scoped lang="css">
@reference "@/assets/css/tailwind.css";
.nav-button2 {
  @apply mt-2 px-4 py-2 bg-primary text-ux5 rounded-full text-sm hover:bg-ux1 transition-colors flex items-center gap-x-2;
}
.nav-button{
	@apply mt-2 px-4 py-2 bg-primary text-ux5 rounded-lg text-sm hover:bg-ux1 transition-colors;
}


</style>