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
				const visible = entries
					.filter(e => e.isIntersecting)
					.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]

				if (visible) {
					const el = visible.target as HTMLElement
					const id = el.getAttribute('data-id')
					if (id && id !== activeElementId.value) {
						activeElementId.value = id
					}
				}
			},
			{
				root: containerRef.value,
				threshold: [0.5, 0.75, 1.0]
			}
		)

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
	watch(activeElementId, (id) => {
		const idx = elements.value.findIndex(el => el.id === id)
		if (idx !== -1 && externalIndex) {
			externalIndex.value = idx
		}
	})

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