<script setup lang="ts">
const props = withDefaults(defineProps<{
	title?: string;
	subtitle?: string;
	loading?: boolean;
	compact?: boolean;
}>(), {
	title: '',
	subtitle: '',
	loading: false,
	compact: false,
});
</script>

<template>
	<section class="form-layout" :class="{ 'form-layout--compact': props.compact }">
		<header v-if="$slots.header || props.title || props.subtitle || $slots.actions" class="form-layout__header">
			<div class="form-layout__title-wrap">
				<slot name="header">
					<h2 v-if="props.title" class="form-layout__title">{{ props.title }}</h2>
					<p v-if="props.subtitle" class="form-layout__subtitle">{{ props.subtitle }}</p>
				</slot>
			</div>
			<div v-if="$slots.actions" class="form-layout__actions">
				<slot name="actions" />
			</div>
		</header>

		<v-progress-linear v-if="props.loading" indeterminate color="primary" class="form-layout__loading" />

		<div class="form-layout__body">
			<slot />
		</div>
	</section>
</template>

<style scoped lang="scss">
.form-layout {
	width: 100%;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 16px;
	padding: 16px;
	border-radius: 0;
	
	
}

.form-layout--compact {
	gap: 12px;
	padding: 12px;
}

.form-layout__header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 12px;
	flex-wrap: wrap;
}

.form-layout__title-wrap {
	min-width: 0;
}

.form-layout__title {
	margin: 0;
	font-size: 1.125rem;
	line-height: 1.3;
	font-weight: 600;
	color: #0f172a;
}

.form-layout__subtitle {
	margin: 4px 0 0;
	font-size: 0.9rem;
	color: #475569;
}

.form-layout__actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.form-layout__loading {
	margin: -4px 0 0;
}

.form-layout__body {
	min-width: 0;
}
</style>
