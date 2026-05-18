<script setup lang="ts">
const props = withDefaults(defineProps<{
	loading?: boolean;
}>(), {
	loading: false,
});
</script>

<template>
	<section class="map-list-layout">
		<div class="map-list-layout__left">
			<header v-if="$slots.header" class="map-list-layout__header ">
				<slot name="header" />
			</header>

			<div v-if="$slots.filters" class="map-list-layout__filters">
				<slot name="filters" />
			</div>

			<v-progress-linear v-if="props.loading" indeterminate color="primary" class="map-list-layout__loading" />

			<div class="map-list-layout__list">
				<slot name="list" />
			</div>
		</div>

		<div class="map-list-layout__right">
			<slot name="detail">
				<div class="map-list-layout__placeholder"></div>
			</slot>
		</div>
	</section>
</template>

<style scoped lang="scss">
.map-list-layout {
	width: 100%;
	height: 100%;
	min-height: 0;
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
	gap: 12px;
}

.map-list-layout__left,
.map-list-layout__right {
	min-width: 0;
	min-height: 0;
	padding: 6px;
	display: flex;
	flex-direction: column;
}

.map-list-layout__left {
	margin-left: 12px;
}

.map-list-layout__header,
.map-list-layout__filters {
	flex: 0 0 auto;
}

.map-list-layout__loading {
	margin: 8px 0;
}

.map-list-layout__list {
	flex: 1 1 auto;
	min-height: 0;
	overflow-y: auto;
	overflow-x: hidden;
}

.map-list-layout__placeholder {
	flex: 1 1 auto;
	min-height: 0;
	border: 1px dashed #da77da;
	background: #f8fafc;
}

@media (max-width: 960px) {
	.map-list-layout {
		grid-template-columns: 1fr;
	}
}
</style>
