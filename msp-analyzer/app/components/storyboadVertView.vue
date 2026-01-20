<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'

import type { Geostory, Section, StoryElement, StoryItem, StoryItemStyle } from '@/models/geostory'
import { useGeostoryStore } from '@/stores/geostoryStore'
import { useVisibleStoryElement } from '@/composables/trackingStoryElement'
import type { ImageVisual, MapVisual } from '~/models/visual'

import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/vue/24/solid'
import MapViewer from '@/components/mapViewer.vue'

const index = ref(0)
const activeSectionId = ref<string | null>(null);
const geostory = useGeostoryStore().selectedStory
const store = useGeostoryStore()
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
	const sections = geostory?.sections || new Map<string, Section>();
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

// 
function getVerticalAlignmentClass(element: StoryElement): string {
	// Dovrai adattare questo percorso se lo stile non si trova qui esattamente
	const pos = element.storyItems?.[0]?.style?.textAlignment || 'center';

	switch (pos) {
		case 'top':
			return 'tw:justify-start'; // Allinea in alto
		case 'bottom':
			return 'tw:justify-end';   // Allinea in basso
		case 'center':
		default:
			return 'tw:justify-center'; // Allinea al centro
	}
}

function isMapOnLeft(element: StoryElement): boolean {
	const visualPos = element.storyItems?.[0]?.style?.visualPos || 'right';
	return visualPos === 'left';
}



function setAlignment(propName: keyof StoryItemStyle, value: string) {
	if (activeElement.value?.storyItems?.[0]?.style) {
		(activeElement.value.storyItems[0].style as any)[propName] = value;
	}
	else {
		console.warn('Impossibile impostare lo stile: activeElement o i suoi item non sono definiti.');
	}
}

function scrollToPreviousElement() {
	const prev = elements.value[Math.max(0, activeIndex.value - 1)]
	if (prev) { scrollTo(prev.id) }
}

function scrollToNextElement() {
	const next = elements.value[Math.min(elements.value.length - 1, activeIndex.value + 1)]
	if (next) { scrollTo(next.id) }
}

function handleTocClick(sectionId: string, elementId: string) {
	activeSectionId.value = sectionId;
	// Highlight immediato
	scrollTo(elementId); // Esegue lo scroll
}

function getBackgroundStyle(el: StoryElement): any {
	const url = el?.storyItems[0]?.background
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

function close() {
	navigateTo('/')
}
watch(activeElementId, (newId) => {
	if (!newId) return;
	const el = elements.value.find(e => e.id === newId);
	if (el && el.sectionID) {
		// Forza l'aggiornamento del modello reattivo di Vuetify
		activeSectionId.value = el.sectionID;
		index.value = elements.value.indexOf(el);
	}
}, { immediate: true });
// Aggiungi questo per gestire il caricamento iniziale
onMounted(async () => {
	await nextTick();
	if (elements.value.length > 0) {
		// Se c'è un elemento attivo all'inizio, impostiamo la sezione
		const initialEl = elements.value[index.value];
		if (initialEl) activeSectionId.value = initialEl.sectionID;
	}
});
</script>
<template>
	<div class="tw:flex tw:flex-col tw:min-h-screen">

		<!-- HEADER / NAVIGATION -->
		<header
			class="tw:w-full tw:flex 
			tw:items-center tw:p-4 tw:bg-white/80 
			tw:backdrop-blur-md tw:border-b tw:sticky tw:top-0 tw:z-[100] tw:shadow-md">
			
			<v-item-group v-model="activeSectionId" class="tw:flex tw:gap-4 tw:ml-6 tw:align-center" mandatory>
				<!-- Iterazione sulla TOC -->
				<v-item v-for="item in toc" :key="item.element.id" :value="item.element.sectionID">
					<!-- Qui definiamo lo slot che riceve isSelected e toggle -->
					<template v-slot="{ isSelected, toggle }">
						<v-btn :variant="isSelected ? 'flat' : 'text'" :color="isSelected ? 'primary' : 'grey-darken-1'"
							class="tw:rounded-full" :class="{ 'tw:font-bold tw:scale-105': isSelected }"
							@click="handleTocClick(item.element.sectionID, item.element.id)">
							{{ item.title || 'Sezione' }}
						</v-btn>
					</template>
				</v-item>
			</v-item-group>

			<v-btn class="tw:ml-auto tw:mr-6" variant="outlined" icon="mdi-close" @click="close" />
		</header>
		<main class="st-container" ref="containerRef">
			<section v-for="element in elements" :key="element.id" :ref="el => setRef(el, element.id)"
				:data-id="element.id" :class="[
					'st-section',
					element.style === 'parallax-scroll' ? 'is-parallax' : '',
					element.storyItems[0]?.structure === 'page-title' ? 'is-page-title' : '']">
				<template v-if="element.storyItems[0]?.structure === 'page-title'">
					<div class="tw:relative tw:h-full tw:w-full tw:flex tw:items-center tw:justify-center">
						<!-- Visual come sfondo (Full Screen) -->
						<div class="tw:absolute tw:inset-0 tw:z-0">
							<img v-if="element.storyItems[0]?.background"
								:src="element.storyItems[0].background.toString()"
								class="tw:w-full tw:h-full tw:object-cover" />
						</div>

						<!-- Testo centrato con sfocatura localizzata -->
						<article class="page-title-container tw:relative 
							tw:z-10 tw:text-center tw:px-12 tw:py-8 tw:max-w-7xl">
							<h1 class="page-title-hero 
                				tw:font-black tw:text-white tw:uppercase tw:tracking-tighter">
								{{ element.storyItems[0]?.text }}
							</h1>
						</article>
					</div>
				</template>

				<template v-else>
					<div :class="[
						'tw:grid tw:min-h-screen tw:w-full',
						element.storyItems[0]?.visual?.format ? 'tw:md:grid-cols-2' : 'tw:grid-cols-1'
					]">
						<!-- TEXT COMPONENT: Massima larghezza se solo testo, 50% se visual -->
						<article :class="[
							'tw:relative tw:flex tw:flex-col tw:p-12 tw:z-20',
							getVerticalAlignmentClass(element),
							{ 'tw:md:order-2': isMapOnLeft(element) }
						]">
							<div class="tw:max-w-none">
								<h2
									class="tw:mb-6 tw:text-5xl tw:font-black tw:text-ux3 tw:uppercase tw:tracking-tighter">
									{{ element.storyItems[0]?.title }}
								</h2>
								<p
									class="tw:text-gray-800 tw:text-xl tw:leading-relaxed tw:whitespace-pre-line tw:font-medium">
									{{ element.storyItems[0]?.text }}
								</p>
							</div>
						</article>

						<!-- VISUAL COMPONENT: Sticky per effetto parallasse -->
						<aside v-if="element.storyItems[0]?.visual?.format" :class="[
							'tw:relative tw:h-screen tw:top-0 tw:sticky',
							{ 'tw:md:order-1': isMapOnLeft(element) }
						]">
							<div class="tw:absolute tw:inset-0 tw:w-full tw:h-full">
								<MapViewer v-if="element.storyItems[0]?.visual?.format === 'MAP'"
									:visuals="store.mapVisuals" :info="false" class="tw:h-full tw:w-full" />

								<img v-else-if="element.storyItems[0]?.visual?.format === 'IMAGE'"
									:src="(element.storyItems[0].visual as ImageVisual).serviceUrl"
									class="tw:w-full tw:h-full tw:object-cover tw:shadow-2xl tw:rounded-xl" />
							</div>
						</aside>
					</div>
				</template>
			</section>
		</main>
	</div>
</template>

<style lang="scss" scoped>
.st-container {
	height: calc(100vh - 64px);
	/* Altezza header */
	overflow-y: auto;
	scroll-behavior: smooth;
	/* Attiviamo lo snap per un feedback preciso */
	scroll-snap-type: y mandatory;
	background-color: #fff;
	scroll-padding: 2px;
}

.st-section {
	//position: relative;
	min-height: calc(100vh - 64px);
	scroll-snap-align: start;
	scroll-snap-stop: always;
	border-bottom: 1px solid #eee;
	/* Separatore sottile invece del ring */
}

/* Effetto Parallasse: la sezione successiva copre la precedente */
.is-parallax {
	z-index: 1;
}

/* Rimuoviamo il bordo verde (tw:ring-4) che avevi prima */
.selected-element {
	/* Pulito da bordi */
}

/* Stile per il testo quando non c'è il visual (Massima larghezza) */
.tw:grid-cols-1 article {
	max-width: 1200px;
	margin: 0 auto;
}

/* Visual Sticky logic */
aside {
	z-index: 10;
	height: 100vh;
	position: sticky;
	top: 0;
}

/* Miglioriamo la leggibilità del testo sopra le immagini se necessario */
article h2 {
	text-shadow: 0 2px 10px rgba(238, 231, 231, 0.5);
}

.transition-all {
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-btn--active {
	opacity: 1 !important;
	border: 2px solid rgb(var(--v-theme-primary)) !important;
}

/* Forza la visualizzazione del pulsante attivo di Vuetify */
:deep(.v-btn--active) {
	background-color: rgb(var(--v-theme-primary)) !important;
	color: rgb(192, 209, 185) !important;
	opacity: 1 !important;
}
.page-title-hero {
	/* Imposta la dimensione al 10% dell'altezza del viewport */
	font-size: 10vh;

	/* Assicura che l'interlinea sia compatta per font così grandi */
	line-height: 0.9;

	/* Opzionale: aggiungi un limite minimo per schermi molto piccoli (es. mobile) */
	@media (max-width: 768px) {
		font-size: 8vh;
		line-height: 1;
	}
}

/* Se vuoi che il titolo sia perfettamente centrato verticalmente nel viewport 
   (considerando l'header da 64px) */
.is-page-title {
	display: flex;
	align-items: center;
	justify-content: center;
	height: calc(100vh - 64px);
	text-align: center;
	background-color: #d4e2cbee;
}

// .is-page-title h1 {
// 	/* Effetto tipografico moderno */
// 	line-height: 0.85;
// 	word-break: break-word;
// }
// /* Animazione d'entrata fluida per il testo quando diventa attivo */
// .is-page-title article {
// 	opacity: 0;
// 	transform: translateY(30px);
// 	transition: all 1s ease-out;
// }

/* Se usi isVisible(element.id) puoi attivare l'animazione */
.st-section[data-id] article {
	/* Se l'ID corrente è quello attivo, anima */
}

/* Miglioramento per lo Scrollytelling Parallasse */
.is-parallax.is-page-title {
	z-index: 5;
	/* Priorità visiva */
}
/* Supporto per testi lunghi nei titoli copertina */
@media (max-width: 768px) {
	.is-page-title h1 {
		font-size: 4rem !important;
	}
}
</style>
