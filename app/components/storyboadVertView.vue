<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

import { Geostory, Section, StoryElement, StoryItem } from '@/models/geostory'
import { useGeostoryStore } from '@/stores/geostoryStore'
import { useVisibleStoryElement } from '@/composables/trackingStoryElement'
import type { MapVisual } from '~/models/visual'

import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
import MapViewer from '@/components/mapViewer.vue'


const index = ref(0)
const currentSection = ref<string | null>(null)
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
	<v-responsive class="border rounded" >
	<!-- pseudo navigation -->
	<v-slide-group 
		v-model="currentSection"
		class="m-10 px-4"
		mandatory

		selected-class="bg-black">
		<v-slide-group-item
			v-for="(item, idx) in toc"
			:key="item.element.id"
			:value="item.element.sectionID"
			v-slot="{ isSelected, selectedClass}"
			class="m-4">
			<v-btn
				:color="isSelected ? 'primary' : undefined"
				@click="scrollTo(item.element.id)">
				{{ item.title || 'Sezione' }}
			</v-btn>
		</v-slide-group-item>	

	</v-slide-group>
	<!-- <div class="z-20 bg-white/80 mt-1 backdrop-blur-sm px-4 flex flex-wrap gap-2  m-5"> -->
		<!-- <button
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
			
		</button>
	</div> -->

	</v-responsive>
</template>
<!--
	
-->

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