<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			loading?: boolean;
			detailOpen?: boolean;
		}>(),
		{
			loading: false,
			detailOpen: true,
		},
	);
</script>

<template>
	<section
		:class="[
			'card-list-layout',
			{
				'has-detail': $slots.detail,
				'detail-open': $slots.detail && props.detailOpen,
			},
		]"
	>
		<div class="card-list-layout__sidebar">
			<div v-if="$slots.header" class="card-list-layout__header">
				<slot name="header" />
			</div>

			<div v-if="$slots.filters" class="card-list-layout__filters">
				<slot name="filters" />
			</div>

			<v-progress-linear
				v-if="props.loading"
				indeterminate
				color="primary"
				class="card-list-layout__loading"
			/>

			<div class="card-list-layout__list">
				<slot name="list" />
			</div>
		</div>

		<div v-if="$slots.detail" class="card-list-layout__detail">
			<slot name="detail" />
		</div>
	</section>
</template>

<style scoped lang="scss">
	.card-list-layout {
		width: 100%;
		height: 100%;
		min-height: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	.card-list-layout.has-detail.detail-open {
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
	}

	.card-list-layout.has-detail:not(.detail-open) {
		/* collapse detail column when not open */
		grid-template-columns: 1fr 0px;
	}

	.card-list-layout__sidebar,
	.card-list-layout__detail {
		min-width: 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
		padding: 12px;
		gap: 12px;
		transition:
			width 0.18s ease,
			opacity 0.18s ease;
		overflow: hidden;
	}

	.card-list-layout__header,
	.card-list-layout__filters {
		flex: 0 0 auto;
	}

	.card-list-layout__loading {
		margin: 8px 0;
	}

	.card-list-layout__list {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
	}

	// @media (max-width: 960px) {
	// 	.card-list-layout {
	// 		grid-template-columns: 1fr;
	// 	}
	// }
</style>
