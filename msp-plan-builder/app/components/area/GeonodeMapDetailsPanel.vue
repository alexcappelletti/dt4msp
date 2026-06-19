<script setup lang="ts">
import type { BoundingBoxPolygon, GeonodeMap } from '#/shared/types/geonodeTypes';
import MapEmbedPreview from './MapEmbedPreview.vue';

const props = defineProps<{
	map: GeonodeMap;
	associatedMapPk?: string | null;
}>();

const emit = defineEmits<{
	(e: 'associate'): void;
	(e: 'close'): void;
}>();

const isAssociated = computed(() => String(props.associatedMapPk || '') === String(props.map.pk));

const formatMapDate = (value?: string | null) => {
	if (!value) return '-';
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) return '-';
	return new Intl.DateTimeFormat('it-IT', {
		day: '2-digit',
		month: 'short',
		year: 'numeric',
	}).format(parsed);
};

const stripMapHtml = (value?: string | null) => {
	if (!value) return 'Nessuna descrizione disponibile.';
	const cleaned = value.replace(/<[^>]*>/g, '').trim();
	return cleaned || 'Nessuna descrizione disponibile.';
};

const getBoundingBoxExtents = (polygon?: BoundingBoxPolygon | null) => {
	const ring = polygon?.coordinates?.[0];
	if (!ring?.length) return null;

	const xs = ring.map(([x]) => x).filter((value) => Number.isFinite(value));
	const ys = ring.map(([, y]) => y).filter((value) => Number.isFinite(value));
	if (!xs.length || !ys.length) return null;

	return {
		minX: Math.min(...xs),
		maxX: Math.max(...xs),
		minY: Math.min(...ys),
		maxY: Math.max(...ys),
	};
};

const formatNumber = (value: number, maximumFractionDigits = 2) =>
	new Intl.NumberFormat('it-IT', {
		maximumFractionDigits,
	}).format(value);

const roundTo = (value: number, decimals = 2) => {
	const factor = 10 ** decimals;
	return Math.round(value * factor) / factor;
};

const isGlobalExtent = (extents: ReturnType<typeof getBoundingBoxExtents>) => {
	if (!extents) return false;

	const minX = roundTo(extents.minX);
	const maxX = roundTo(extents.maxX);
	const minY = roundTo(extents.minY);
	const maxY = roundTo(extents.maxY);
	const width = roundTo(Math.abs(maxX - minX));
	const height = roundTo(Math.abs(maxY - minY));
	const maxAbs = Math.max(
		Math.abs(minX),
		Math.abs(maxX),
		Math.abs(minY),
		Math.abs(maxY),
	);

	const isLatLonGlobal = width >= 359.9
		&& height >= 170
		&& maxAbs <= 180.1;
	const isWebMercatorGlobal = width >= 40_000_000 && height >= 39_000_000;

	return isLatLonGlobal || isWebMercatorGlobal;
};

const formatArea = (polygon?: BoundingBoxPolygon | null) => {
	const extents = getBoundingBoxExtents(polygon);
	if (!extents) return '-';
	if (isGlobalExtent(extents)) return 'Estensione globale';

	const width = Math.abs(extents.maxX - extents.minX);
	const height = Math.abs(extents.maxY - extents.minY);
	const area = width * height;

	if (!Number.isFinite(area) || area <= 0) return '-';

	const isLikelyDegrees = Math.max(
		Math.abs(extents.minX),
		Math.abs(extents.maxX),
		Math.abs(extents.minY),
		Math.abs(extents.maxY),
	) <= 180;

	if (isLikelyDegrees) {
		return `${formatNumber(area, 4)} deg²`;
	}

	if (area >= 1_000_000) {
		return `${formatNumber(area / 1_000_000)} km²`;
	}

	return `${formatNumber(area)} m²`;
};

const formatCenter = (polygon?: BoundingBoxPolygon | null) => {
	const extents = getBoundingBoxExtents(polygon);
	if (!extents) return '-';
	if (isGlobalExtent(extents)) return 'Centro non significativo';

	const centerX = (extents.minX + extents.maxX) / 2;
	const centerY = (extents.minY + extents.maxY) / 2;

	if (!Number.isFinite(centerX) || !Number.isFinite(centerY)) return '-';

	const latitude = `${formatNumber(Math.abs(centerY), 4)}° ${centerY >= 0 ? 'N' : 'S'}`;
	const longitude = `${formatNumber(Math.abs(centerX), 4)}° ${centerX >= 0 ? 'E' : 'O'}`;

	return `${latitude}, ${longitude}`;
};
</script>

<template>
	<section class="map-details-window tw:h-full tw:w-full">
		<header class="map-details-window__header">
			<div >
				<p class="map-details-window__eyebrow">Dettagli mappa</p>
				<h2>{{ props.map.title }}</h2>
				<p>{{ stripMapHtml(props.map.abstract) }}</p>
			</div>
			<div class="map-details-window__actions">
				<v-btn
					v-if="!isAssociated"
					color="primary"
					variant="flat"
					prepend-icon="mdi-map-plus"
					@click="emit('associate')"
				>
					Associa all'area
				</v-btn>
				<v-btn variant="text" prepend-icon="mdi-close" @click="emit('close')">
					Chiudi dettagli
				</v-btn>
			</div>
		</header>

		<div
			class="tw:grid tw:h-full tw:w-full tw:grid-rows-[25%_1fr] tw:gap-5"
		>
			<div class="tw:flex tw:flex-row tw:gap-5">
				<div class="tw:flex tw:items-stretch tw:w-100 ">
					<v-img
						v-if="props.map.thumbnail_url"
						:src="props.map.thumbnail_url"
						:alt="props.map.title"
						cover
						class="tw:content-stretch tw:w-full tw:h-full"
					>
						<template #placeholder>
							<div class="map-details-window__thumbnail-placeholder">no image</div>
						</template>
					</v-img>
					<div v-else class="tw:bg-gray-200 
						tw:border tw:border-gray-300 
						tw:rounded-lg
						tw:self-center
						tw:h-full tw:w-full
						tw:justify-center ">
						no image
					</div>
				</div>

				<div class="map-details-window__info">
					<dl class="map-details-window__meta-grid">
						<div class="map-details-window__meta-card">
							<dt>Owner</dt>
							<dd>{{ props.map.owner_username || '-' }}</dd>
						</div>
						<div class="map-details-window__meta-card">
							<dt>Creata</dt>
							<dd>{{ formatMapDate(props.map.created) }}</dd>
						</div>
						<div class="map-details-window__meta-card">
							<dt>Aggiornata</dt>
							<dd>{{ formatMapDate(props.map.last_updated) }}</dd>
						</div>
						<div class="map-details-window__meta-card">
							<dt>Visite</dt>
							<dd>{{ props.map.popular_count || '0' }}</dd>
						</div>
						<div class="map-details-window__meta-card">
							<dt>Condivisioni</dt>
							<dd>{{ props.map.share_count || '0' }}</dd>
						</div>
						<div class="map-details-window__meta-card">
							<dt>Proiezione</dt>
							<dd>{{ props.map.projection || '-' }}</dd>
						</div>
					</dl>

					<div class="map-details-window__section">
						
						<dl class="map-details-window__meta-grid">
							<div 
								v-if="props.map.bbox_polygon"
								class="map-details-window__meta-card">
								<dt>Area</dt>
								<dd>{{ formatArea(props.map.bbox_polygon)}}</dd>
							</div>
							<div 
								v-if="props.map.ll_bbox_polygon"
								class="map-details-window__meta-card">
								<dt>Centro</dt>
								<dd>{{ formatCenter(props.map.ll_bbox_polygon) }}</dd>
							</div>
							<div 
								v-if="props.map.zoom !== undefined && props.map.zoom !== null" 
								class="map-details-window__meta-card">
								<dt>Zoom</dt>
								<dd>{{ props.map.zoom ?? '-' }}</dd>
							</div>
							<div class="map-details-window__meta-card"
								v-if="props.map.language">
								<dt>Lingua</dt>
								<dd>{{ props.map.language || '-' }}</dd>
							</div>
						</dl>
					</div>

					<div class="map-details-window__links">
						<v-btn
							v-if="props.map.detail_url"
							:href="props.map.detail_url"
							target="_blank"
							rel="noopener noreferrer"
							variant="outlined"
							prepend-icon="mdi-open-in-new"
						>
							Apri su GeoNode
						</v-btn>
					</div>
				</div>
			</div>

			<div class="map-details-window__preview">
				<MapEmbedPreview
					:title="props.map.title"
					:embed-url="props.map.embed_url"
				/>
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">
.map-details-window {
	position: absolute;
	inset: 0;
	z-index: 5;
	display: flex;
	flex-direction: column;
	gap: 20px;
	padding: 20px;
	background:
		linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(254, 247, 255, 0.98));
}

.map-details-window__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
}


.map-details-window__eyebrow {
	margin: 0 0 0.45rem !important;
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: rgba(0, 0, 0, 0.45) !important;
}

.map-details-window__actions {
	display: flex;
	align-items: center;
	gap: 0.75rem;
}

.map-details-window__body {
	min-height: 0;
}

.map-details-window__summary {
	min-width: 0;
	min-height: 0;
	display: grid;
	grid-template-columns: minmax(200px, 0.7fr) minmax(0, 1.3fr);
	gap: 16px 20px;
	align-items: start;
	overflow: hidden;
}

.map-details-window__preview {
	min-width: 0;
	min-height: 0;
}

.map-details-window__visual,
.map-details-window__info {
	min-width: 0;
}

.map-details-window__info {
	display: grid;
	grid-template-rows: auto auto auto auto;
	gap: 12px;
	align-content: start;
	min-height: 0;
}

.map-details-window__thumbnail {

	border-radius: 16px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	background: linear-gradient(135deg, #edf2f7 0%, #dbe5ef 100%);
	overflow: hidden;
}

.map-details-window__thumbnail-placeholder {
	display: flex;
	align-items: center;
	justify-content: center;
	max-width: 100%;
	min-height: 160px;
	border-radius: 10px;
	border: 1px solid rgba(0, 0, 0, 0.08);
	background: linear-gradient(135deg, #edf2f7 0%, #dbe5ef 100%);
	color: rgba(0, 0, 0, 0.45);
}

.map-details-window__thumbnail-placeholder--empty {
	// aspect-ratio: 16 / 10;
}

.map-details-window__meta-grid {
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

.map-details-window__meta-card {
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

.map-details-window__section {
	padding: 0.15rem 0;

	h3 {
		margin: 0 0 0.35rem;
		font-size: 0.88rem;
		color: #1f2937;
	}

	p {
		margin: 0;
		line-height: 1.45;
		font-size: 0.88rem;
		color: rgba(0, 0, 0, 0.7);
		display: -webkit-box;
		-webkit-line-clamp: 5;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
}

.map-details-window__facts {
	margin: 0;
	padding-left: 1rem;
	display: grid;
	gap: 0.25rem;
	font-size: 0.88rem;
	color: rgba(0, 0, 0, 0.7);
}

.map-details-window__links {
	display: flex;
	justify-content: flex-start;
}

@media (max-width: 960px) {
	.map-details-window__summary {
		grid-template-columns: 1fr;
	}

	.map-details-window__meta-grid {
		grid-auto-columns: minmax(120px, 1fr);
	}
}
</style>
