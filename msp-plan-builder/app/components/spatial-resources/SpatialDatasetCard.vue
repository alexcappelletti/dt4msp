<script setup lang="ts">
import type { DatasetListItem } from "#/shared/types/geonodeTypes";

const props = defineProps<{
	item: DatasetListItem;
	group: "general" | "specific";
	descriptionExpanded: boolean;
}>();

const emit = defineEmits<{
	select: [pk: string];
	toggleDescription: [pk: string];
}>();

const selectDataset = () => {
	emit("select", props.item.pk);
};

const toggleDescription = () => {
	emit("toggleDescription", props.item.pk);
};
</script>

<template>
	<v-card
		class="dataset-card"
		:class="{
			'dataset-card-general': group === 'general',
			'dataset-card-specific': group === 'specific',
		}"
		@click="selectDataset"
	>
		<div class="card-image-wrapper">
			<v-img
				:src="item.thumbnail_url"
				:alt="item.title"
				height="180"
				cover
				class="bg-grey-2"
			>
				<template #placeholder>
					<div
						class="d-flex align-center justify-center h-100 bg-grey-3"
					>
						<v-icon size="48" color="grey-5">mdi-image-off</v-icon>
					</div>
				</template>
			</v-img>
		</div>

		<v-card-item class="card-content">
			<v-card-title class="text-subtitle2 font-weight-bold line-clamp-2">
				{{ item.title }}
			</v-card-title>

			<v-card-subtitle
				v-if="item.abstract"
				:class="[
					'text-caption mt-2',
					{ 'line-clamp-2': !descriptionExpanded },
				]"
			>
				{{ item.abstract }}
			</v-card-subtitle>

			<v-btn
				v-if="item.abstract"
				icon
				size="x-small"
				variant="text"
				class="px-0 mt-1"
				@click.stop="toggleDescription"
			>
				<v-icon size="16">
					{{ descriptionExpanded ? "mdi-chevron-up" : "mdi-chevron-down" }}
				</v-icon>
			</v-btn>

			<div class="card-footer mt-3 pt-3 border-t">
				<div class="card-meta-row">
					<div
						class="text-caption text-grey d-flex gap-2 flex-wrap align-center"
					>
						<span class="d-flex align-center gap-1">
							{{ item.pk || "undef" }}

							<v-icon size="12">mdi-account</v-icon>
							{{ item.owner_username }}
						</span>
						<v-btn
							v-if="item.canVisualize"
							icon="mdi-arrow-right"
							size="x-small"
							variant="tonal"
							class="card-visualize-btn"
							@click.stop="selectDataset"
						/>
					</div>
				</div>
			</div>
		</v-card-item>
	</v-card>
</template>

<style scoped lang="scss">
	@use "sass:color";

	$dark-rose-color: color.scale($main-rose-color, $lightness: -1.7%);
	$light-rose-color: color.scale($main-rose-color, $lightness: 3%);

	.dataset-card {
		width: 100%;
		max-width: 320px;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			box-shadow 0.18s ease,
			border-color 0.18s ease;
		border: 2px solid transparent;
		overflow: hidden;
		background-color: white;

		&:hover {
			box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
			transform: translateY(-2px);
		}
	}

	.dataset-card-general {
		background-color: $light-rose-color;
	}

	.dataset-card-specific {
		background-color: $dark-rose-color;
	}

	.card-image-wrapper {
		position: relative;
		overflow: hidden;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.card-content {
		padding: 1rem;
	}

	.card-footer {
		border-color: rgba(0, 0, 0, 0.08);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: stretch;
	}

	.card-meta-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.card-visualize-btn {
		inline-size: 2rem;
		block-size: 2rem;
		min-inline-size: 2rem;
		background-color: rgba(255, 255, 255, 0.55);
		color: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: normal;
		max-height: calc(2 * 1.2rem);
		transition: max-height 0.3s ease;
	}

	.border-t {
		border-top: 1px solid currentColor;
	}
</style>
