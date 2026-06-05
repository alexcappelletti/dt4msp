<script setup lang="ts">
	const props = withDefaults(
		defineProps<{
			loading?: boolean;
			detailOpen?: boolean;
		}>(),
		{
			loading: false,
			detailOpen: false,
		},
	);
</script>

<template>
	<section
		:class="[
			{
				'has-detail': $slots.detail,
				'detail-open': $slots.detail && props.detailOpen,
			},
		]"
		class="box-outline list-detail-layout"
	>
		<div class="list-column box-inner">
			<div v-if="$slots.header" class="list-header">
				<slot name="header" />
			</div>
			<div v-if="$slots.filters" class="list-filters">
				<slot name="filters" />
			</div>
			<v-progress-linear
				v-if="props.loading"
				indeterminate
				color="primary"
				class="list-loading"
			/>
			<div class="list-body"><slot name="list" /></div>
		</div>

		<div class="detail-column box-right" v-if="$slots.detail">
			<div class="detail-main"><slot name="detail" /></div>
			<div class="detail-support" v-if="$slots.supporting">
				<slot name="supporting" />
			</div>
		</div>
	</section>
</template>

<style scoped lang="scss">
	.list-detail-layout {
		width: 100%;
		height: 100%;
		min-height: 0;
		display: grid;
		grid-template-columns: 1fr;
		gap: 12px;
	}

	.box-outline {
		border: 1px solid #3490dc; /* bordo blu */
		padding: 6px; /* spazio interno */
		border-radius: 8px; /* angoli leggermente arrotondati */
	}
	.box-inner {
		border: 1px solid #e3342f; /* bordo rosso */
		padding: 2px; /* spazio interno */
	}
	.box-right {
		border: 1px solid #38c172; /* bordo verde */
		padding: 2px; /* spazio interno */
	}
	.list-detail-layout.has-detail.detail-open {
		grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
	}

	.detail-column {
		display: none;
	}

	.list-detail-layout.has-detail.detail-open .detail-column {
		display: flex;
	}

	.list-column,
	.detail-column {
		min-width: 0;
		min-height: 0;
		display: flex;
		flex-direction: column;
		padding: 12px;
		gap: 12px;
	}

	.list-body {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
	}
	.detail-main {
		flex: 1 1 auto;
		min-height: 0;
		overflow-y: auto;
	}
	.detail-support {
		flex: 0 0 auto;
		border-top: 1px solid rgba(0, 0, 0, 0.06);
		padding-top: 8px;
	}

	@media (max-width: 960px) {
		.list-detail-layout.has-detail.detail-open {
			grid-template-columns: 1fr;
		}
	}
</style>
