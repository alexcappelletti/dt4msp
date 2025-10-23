<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

import { Geostory, Section, StoryElement, StoryItem } from '@/models/geostory'
import { useGeostoryStore } from '@/stores/geostoryStore'
import { useVisibleStoryElement } from '@/composables/trackingStoryElement'
import type { MapVisual } from '~/models/visual'

import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
import MapViewer from '@/components/mapViewer.vue'


const index = ref(0)
const geostory = useGeostoryStore().selectedStory
const containerRef = ref<HTMLElement | null>(null)
const elementRefs = ref<Record<string, Element | null>>({})
const elements = computed(() => geostory?.elements ?? new Array<StoryElement>())
const {
	activeElementId,
	activeElement,
	activeIndex,
	scrollTo,
	isVisible
} = useVisibleStoryElement(elements, containerRef, elementRefs, index)


const currentElement = computed(() => geostory?.elements[index.value])
const storyItem = computed(() => {
	const el = currentElement.value
	if (el === undefined || el.storyItems?.length <= 0) { return undefined }
	return el.storyItems[0]
})

const toc = computed(() => {
	const sections = geostory?.getSections() || new Map<string, Section>();
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


function scrollToPreviousElement() {
	const prev = elements.value[Math.max(0, activeIndex.value - 1)]
	if (prev) {scrollTo(prev.id)}
}

function scrollToNextElement() {
	const next = elements.value[Math.min(elements.value.length - 1, activeIndex.value + 1)]
	if (next){ scrollTo(next.id)}
}



function getBackgroundStyle(el:StoryElement): any {
	const url = el?.storyItems[0]?.visual?.getUrl()
	return url ? {
		backgroundImage: `url('${url}')`,
		backgroundSize: 'cover',
		backgroundPosition: 'center',
		backgroundRepeat: 'no-repeat'
	} : {}
}

function setRef(el: Element | ComponentPublicInstance | null, id: string) {
	if (el instanceof HTMLElement) {
		elementRefs.value[id] = el
	}
}
</script>

<template>
	<!-- Breadcrumb -->
	<div class="z-20 bg-white/80 mt-1 
		backdrop-blur-sm px-4 flex flex-wrap gap-2  m-5"
	>
		<button
			v-for="(item, idx) in toc"
			:key="item.element.id"
			@click="scrollTo(item.element.id)"
			:class="[
			'text-sm px-3 py-2 rounded-full whitespace-nowrap transition-colors',
			activeElement?.sectionID === item.element.sectionID
				? 'bg-primary text-white font-semibold'
				: 'bg-ux5 text-ux1 hover:bg-neutral-400 hover:text-white'
			]"
		>
			{{ item.title || 'Sezione' }}
		</button>
	</div>

	<!-- Story Elements here-->
	<div class="relative h-[82vh] snap-y snap-mandatory scroll-p-5
	overflow-y-auto px-4 py-6 bg-white-200" 

	ref="containerRef" >
		<div v-for="(element, idx) in elements"
			:key="element.id"
			:ref="el => setRef(el, element.id)"
			:data-id="element.id"
			:class="['shadow snap-start overflow-hidden m-5 border rounded-2xl border-ux3 element-full-h-02',
				isVisible(element.id) ? 'ring-4 ring-ux1' : 'border-ux3'			
			]

			">
			<div :class="['grid h-full', 
				element.storyItems[0]?.visual?.format === 'MAP' ? 
				'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'

			]">
				<!-- Content Section with Background -->
				<div class="relative flex flex-col justify-center"
				:style="getBackgroundStyle(element)">
					<div class="relative pa-4 m-4 z-10 rounded-2xl bg-black/40 backdrop-blur-sm p-6">
						<h2 class="mb-2  text-white drop-shadow-lg">
							{{element.storyItems[0]?.title}}
						</h2>
						<p class="text-white drop-shadow-md mb-4 mt-5">
							{{element.storyItems[0]?.text}}
						</p>
					</div>
				</div>
				<!-- Visual Section -->

				<MapViewer v-if="element.storyItems[0]?.visual?.format === 'MAP'"
							:visuals="[element.storyItems[0]?.visual as MapVisual]"
							class="h-96 rounded-lg overflow-hidden shadow"
							/>


			 </div>
		</div>
	</div> 
	<!-- Navigation Buttons -->
  	<div class="
		relative bottom-0 left-0 
		w-full flex justify-end gap-4 px-6 -top-7 z-10">
		<button :disabled="index <= 0"
			class="nav-button"
			@click="scrollToPreviousElement">
			<ChevronUpIcon class="w-4 h-4 sm:w-5 sm:h-5" />
		</button>

		<button :disabled="index >= elements.length - 1"
			class="nav-button"
			@click="scrollToNextElement">
				<ChevronDownIcon class="w-4 h-4 sm:w-5 sm:h-5" />
		</button>
	</div>	

</template>


<style lang="css" scoped>
@reference "@/assets/css/tailwind.css";
.element-full-h-02 {
	height: calc(100% - 0.2rem); /* poco meno del contenitore */
}
.element-full-h {
	height: 100%;
}
.img {
    background-image: url("https://design-earth.org/files/gimgs/193_056B8804.jpg");
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
}
.nav-button {
	@apply mt-2 px-4 py-2 bg-primary text-ux5 rounded-lg text-sm hover:bg-ux1 transition-colors;


}
</style>