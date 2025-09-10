<template>
	<div class="layout">
		<!-- Drawer TOC -->
		<aside class="drawer">
			<h1>{{ geostory.title }}</h1>
			<ul>
				<li v-for="(item, idx) in toc" :key="item.element.id">
					<strong 
						@click="goAtElement(item.element)" 
						class="toc-item"
						:class="{active: item.element.sectionTitle === currentElement?.sectionTitle}">{{ item.title }}</strong>
				</li>
			</ul>
		</aside>

		<!-- Contenuto principale -->
		<main class="content">
			<div class="geostory" :style="backgroundStyle">
				<div class="text-box">
					<div v-if="currentElement && storyItem">
						<h2>{{ storyItem.title }}</h2>
						<p>{{ storyItem.text }}</p>
						<p class="meta">
							Autore: {{ geostory.author }} | {{ formatDate(geostory.timestamp) }}
						</p>
					</div>
				</div>
			</div>

			<div class="pager">
				<button class="material-btn" @click="prev" :disabled="index === 0">← Indietro</button>
				<span>Pagina {{ index + 1 }} di {{ geostory.elements.length }}</span>
				<button class="material-btn" @click="next" :disabled="index === geostory.elements.length - 1">Avanti
					→</button>
			</div>
		</main>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Geostory, StoryElement, StoryItem, defaultGeostory } from '@/models/geostory'
import { useGeostoryStore } from '@/stores/geostoryStore'
const geostory = useGeostoryStore().selectedStory || defaultGeostory
const scenario = useGeostoryStore().scenario

const index = ref(0)
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
  tocStructure.sort((a, b) => a.title.localeCompare(b.title));
  return tocStructure;
});

function goAtElement(element: StoryElement) {
	const foundIndex = geostory.elements.findIndex((el) =>
		el.id === element.id 
	);
	if (foundIndex !== -1) {
		index.value = foundIndex;
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

<style scoped lang="scss">
.layout {
  display: flex;
  flex-direction: row;
}

.drawer {
  width: 300px;
  padding: 1rem;
  background-color: #f0f0f0;
  border-right: 1px solid #ddd;
  height: 100vh;
  overflow-y: auto;

  h1 {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    margin-bottom: 1rem;
    line-height: 1.2;
    word-wrap: break-word;
    hyphens: auto;
  }

  ul {
    list-style: none;
    padding-left: 0;

    li {
      margin-bottom: 0.5rem;

      .toc-item {
        display: block;
        cursor: pointer;
        padding: 0.3rem 0.5rem;
        border-radius: 6px;
        transition: background-color 0.2s ease;
        color: #000000;

        &:hover {
          background-color: #e0e0e0;
        }

        &.active {
          background-color: #dcdcdc;
          font-weight: bold;
        }
      }
    }
  }
}

.content {
  flex: 1;
  padding: 2rem;
}

.geostory {
  height: 26rem;
  width: 100%;
  padding: 2rem;
  color: rgb(8, 8, 8);
  position: relative;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.text-box {
  background-color: rgba(255, 255, 255, 0.85);
  padding: 2rem;
  border-radius: 12px;
  max-width: 800px;
  margin: 0 auto;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
}

.pager {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.material-btn {
  background-color: #6200ee;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover:not(:disabled) {
    background-color: #3700b3;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  &:disabled {
    background-color: #ccc;
    color: #666;
    cursor: not-allowed;
    box-shadow: none;
  }
}

.meta {
  font-size: 0.9rem;
  color: #666;
}
</style>