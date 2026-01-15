import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { StoryElement } from '@/models/geostory'

export function useVisibleStoryElement(
	elements: Ref<StoryElement[]>,
	containerRef: Ref<HTMLElement | null>,
	elementRefs: Ref<Record<string, Element | null>>,
	externalIndex?: Ref<number> // opzionale: per sincronizzare con index esterno
) {
	const activeElementId = ref<string | null>(null)

	const activeIndex = computed(() =>
		elements.value.findIndex(el => el.id === activeElementId.value)
	)

	const activeElement = computed(() =>
		elements.value.find(el => el.id === activeElementId.value) ?? null
	)

	let observer: IntersectionObserver | null = null

	function observeVisibility() {
		if (!containerRef.value) return

		observer = new IntersectionObserver(
			(entries) => {
				// Filtriamo solo gli elementi che stanno entrando o sono già stabili
				const visibleEntry = entries
					.filter((e) => e.isIntersecting)
					// Ordiniamo per ratio di intersezione decrescente per prendere il più visibile
					.sort(
						(a, b) => b.intersectionRatio - a.intersectionRatio,
					)[0];
				if (visibleEntry) {
					const id = visibleEntry.target.getAttribute('data-id');
					if (id && id !== activeElementId.value) {
						activeElementId.value = id;
					}
				}
			},
			{
				root: containerRef.value,
				// Usa una soglia più bassa (0.2 o 0.3) invece di 0.5 per catturare l'elemento
				// anche se lo snap lo muove velocemente.
				threshold: [0.2, 0.5, 0.8],
				// Fondamentale: riduci il margine d'area per forzare il trigger al centro
				rootMargin: '-25% 0px -25% 0px',
			},
		);

		for (const el of Object.values(elementRefs.value)) {
			if (el) observer.observe(el)
		}
	}

	function scrollTo(id: string) {
		nextTick(() => {
			const el = elementRefs.value[id]
			const container = containerRef.value
			if (el && container) {
				el.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'nearest'
				})
			}
		})
	}

	function isVisible(id: string): boolean {
		return activeElementId.value === id
	}

	// 🔁 Watch per sincronizzare index esterno (se fornito)
	watch(
		() => Object.keys(elementRefs.value).length,
		(count) => {
			if (count > 0) {
				if (observer) observer.disconnect();
				observeVisibility();
			}
		},
		{ flush: 'post' },
	);

	onMounted(() => {
		nextTick(observeVisibility)
	})

	onBeforeUnmount(() => {
		if (observer) observer.disconnect()
	})

	return {
		activeElementId,
		activeElement,
		activeIndex,
		scrollTo,
		isVisible
	}
}