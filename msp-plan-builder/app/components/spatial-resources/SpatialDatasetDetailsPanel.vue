<script setup lang="ts">
import type { Dataset, Keyword } from "#/shared/types/geonodeTypes";

const props = defineProps<{
	dataset?: Dataset | null;
	loading?: boolean;
}>();

const emit = defineEmits<{
	(e: "close"): void;
}>();

const getKeywordKey = (keyword: Keyword) => keyword.slug || keyword.name;
const getKeywordLabel = (keyword: Keyword) => keyword.name;
const getSelectedDatasetOwner = (dataset: Dataset) =>
	dataset.owner?.username || "";
const formatItalianDate = (date?: string) =>
	date ? new Date(date).toLocaleDateString("it-IT") : "";
</script>

<template>
	<section class="tw:absolute 
		tw:inset-0 tw:z-6 
		tw:flex tw:flex-col tw:gap-5 tw:p-5 
		tw:bg-gradient-to-b tw:from-white/98 tw:to-[#fef7ff]/98">
		<header class="dataset-details-window__header">
			<div>
				<p class="dataset-details-window__eyebrow">Scheda layer</p>
				<h2>{{ props.dataset?.title || "Dettaglio layer" }}</h2>
			</div>
			<div class="dataset-details-window__actions">
				<v-btn
					variant="text"
					prepend-icon="mdi-close"
					@click="emit('close')"
				>
					Chiudi dettagli
				</v-btn>
			</div>
		</header>

		<div
			v-if="props.loading && !props.dataset"
			class="dataset-details-window__loading"
		>
			<v-progress-circular indeterminate color="primary" />
		</div>

		<div
			v-else-if="props.dataset"
			class="tw:grid tw:grid-cols-[minmax(0,_1fr)_minmax(180px,_20%)] 
				tw:gap-6 
				tw:items-start 
				tw:min-h-0 max-[960px]:tw:grid-cols-1">
			<div class="dataset-details-window__info">
				<p v-if="props.dataset?.abstract" >
					{{ props.dataset.abstract }}
				</p>
				<dl class="dataset-details-window__meta-grid">
					<div
						v-if="getSelectedDatasetOwner(props.dataset)"
						class="dataset-details-window__meta-card"
					>
						<dt>Owner</dt>
						<dd>{{ getSelectedDatasetOwner(props.dataset) }}</dd>
					</div>
					<div
						v-if="props.dataset.created"
						class="dataset-details-window__meta-card"
					>
						<dt>Creata</dt>
						<dd>{{ formatItalianDate(props.dataset.created) }}</dd>
					</div>
					<div class="dataset-details-window__meta-card">
						<dt>Id</dt>
						<dd>{{ props.dataset.pk }}</dd>
					</div>
					<div
						v-if="props.dataset.popular_count"
						class="dataset-details-window__meta-card"
					>
						<dt>Visite</dt>
						<dd>{{ props.dataset.popular_count }}</dd>
					</div>
				</dl>

				<div
					v-if="props.dataset.keywords && props.dataset.keywords.length > 0"
					class="dataset-details-window__section"
				>
					<h3>Keywords</h3>
					<div class="dataset-details-window__keywords">
						<v-chip
							v-for="kw in props.dataset.keywords"
							:key="getKeywordKey(kw)"
							size="small"
							class="dataset-details-window__keyword"
						>
							{{ getKeywordLabel(kw) }}
						</v-chip>
					</div>
				</div>
			</div>

			<div class="dataset-details-window__visual">
				<v-img
					:src="props.dataset.thumbnail_url"
					:alt="props.dataset.title"
					height="320"
					cover
					class="dataset-details-window__image bg-grey-2"
				>
					<template #placeholder>
						<div class="dataset-details-window__image-placeholder">
							<v-icon size="64" color="grey-5">mdi-image-off</v-icon>
						</div>
					</template>
				</v-img>
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">

.dataset-details-window__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
}

.dataset-details-window__eyebrow {
	margin: 0 0 0.45rem !important;
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: rgba(0, 0, 0, 0.45) !important;
}

.dataset-details-window__abstract {
	margin: 0.35rem 0 0;
	max-width: 72ch;
	line-height: 1.5;
	color: rgba(0, 0, 0, 0.72);
}

.dataset-details-window__actions {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.dataset-details-window__loading {
	display: flex;
	align-items: center;
	justify-content: center;
	flex: 1;
	min-height: 320px;
}

.dataset-details-window__image {
	border-radius: 18px;
	overflow: hidden;
}

.dataset-details-window__image-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	background: rgba(0, 0, 0, 0.06);
}

.dataset-details-window__info {
	display: grid;
	gap: 1rem;
	min-width: 0;
}

.dataset-details-window__meta-grid {
	display: grid;
	grid-auto-flow: column;
	grid-auto-columns: minmax(140px, 1fr);
	gap: 10px 12px;
	margin: 0;
	min-width: 0;
	overflow-x: auto;
	overflow-y: hidden;
	padding-bottom: 4px;
}

.dataset-details-window__meta-card {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
	min-width: 0;
	padding: 0.55rem 0.7rem;
	border-radius: 12px;
	background: rgba(255, 255, 255, 0.72);
	border: 1px solid rgba(0, 0, 0, 0.06);

	dt {
		margin: 0;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: rgba(0, 0, 0, 0.45);
	}

	dd {
		margin: 0;
		font-size: 0.96rem;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.82);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.dataset-details-window__section {
	h3 {
		margin: 0 0 0.5rem;
		font-size: 0.88rem;
		color: #1f2937;
	}
}

.dataset-details-window__keywords {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

.dataset-details-window__keyword {
	background-color: rgba(var(--v-theme-primary-rgb), 0.1);
	color: rgb(var(--v-theme-primary));
}

</style>
