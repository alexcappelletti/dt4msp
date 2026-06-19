<script setup lang="ts">
const props = defineProps<{
	title: string;
	embedUrl?: string | null;
	fullHeight?: boolean;
}>();

const normalizedEmbedUrl = computed(() => {
	const value = props.embedUrl?.trim();
	if (!value) return "";

	try {
		const parsed = new URL(value);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
			return "";
		}
		return parsed.toString();
	} catch {
		return "";
	}
});
</script>

<template>
		<section class="map-embed-preview" :class="{ 'map-embed-preview--full-height': props.fullHeight }">
			<div class="map-embed-preview__header">
				
			</div>

			<div
				v-if="normalizedEmbedUrl"
				class="map-embed-preview__frame-wrap"
				:class="{ 'map-embed-preview__frame-wrap--full-height': props.fullHeight }"
			>
				<iframe
					:src="normalizedEmbedUrl"
					:title="`Embed ${title}`"
					class="map-embed-preview__frame"
					:class="{ 'map-embed-preview__frame--full-height': props.fullHeight }"
					loading="lazy"
					referrerpolicy="strict-origin-when-cross-origin"
					allowfullscreen
			/>
		</div>

		<div v-else class="map-embed-preview__empty">
			Nessun `embed_url` disponibile per questa mappa.
		</div>
	</section>
</template>

<style scoped lang="scss">
.map-embed-preview {
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
	padding: 0.15rem 0;
	grid-column: 1 / -1;
}

.map-embed-preview--full-height {
	height: 100%;
	min-height: 0;
}

.map-embed-preview__header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	flex-wrap: wrap;

	h3 {
		margin: 0;
		font-size: 0.98rem;
		color: #1f2937;
	}
}

.map-embed-preview__current {
	display: flex;
	align-items: center;
	min-width: 0;
}


.map-embed-preview__frame-wrap {
	overflow: hidden;
	border-radius: 16px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	background: rgba(255, 255, 255, 0.8);
}

.map-embed-preview__frame-wrap--full-height {
	flex: 1 1 auto;
	min-height: 0;
}

.map-embed-preview__frame {
	display: block;
	width: 100%;
	height: min(68vh, 640px);
	border: 0;
	background: #fff;
}

.map-embed-preview__frame--full-height {
	height: 100%;
	min-height: 0;
}

.map-embed-preview__empty {
	padding: 0.25rem 0;
	color: rgba(0, 0, 0, 0.58);
	font-size: 0.92rem;
}
</style>
