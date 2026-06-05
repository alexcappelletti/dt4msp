<script setup lang="ts">
	import type { DatasetListItem } from "#/shared/types/geonodeTypes";

	const props = defineProps<{
		layers: DatasetListItem[];
		selectedPk?: string | null;
		loading?: boolean;
	}>();

	const emit = defineEmits<{
		(e: "select", pk: string): void;
	}>();

	const onSelect = (pk: string) => {
		emit("select", pk);
	};

	const formatDate = (dateValue: string) => {
		if (!dateValue) return "-";
		const parsed = new Date(dateValue);
		if (Number.isNaN(parsed.getTime())) return "-";
		return new Intl.DateTimeFormat("it-IT", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}).format(parsed);
	};
</script>

<template>
	<div class="">
		<p
			v-if="props.loading && props.layers.length === 0"
			class="tw:text-sm tw:text-gray-500 tw:mb-3"
		>
			Caricamento lista in corso...
		</p>

		<div
			v-if="props.layers.length > 0"
			class="tw:flex tw:flex-col tw:max-h-[72vh] tw:overflow-y-auto tw:overflow-x-hidden tw:py-2 tw:px-2"
		>
			<p>
				{{
					props.layers.length === 0
						? "Nessun layer trovato"
						: props.layers.length === 1
							? "1 Layer trovato"
							: `${props.layers.length} Layer trovati`
				}}
			</p>
			<button
				v-for="layer in props.layers"
				:key="layer.pk"
				type="button"
				class="tw:w-full tw:text-left tw:p-2 tw:bg-transparent tw:transition"
				:class="
					props.selectedPk === layer.pk
						? 'tw:px-1 selected-item tw:rounded-md'
						: ''
				"
				@click="onSelect(layer.pk)"
			>
				<div class="tw:flex tw:gap-2">
					<div
						class="tw:w-[136px] tw:min-w-[136px] tw:flex tw:justify-center"
					>
						<v-img
							:src="layer.thumbnail_url"
							:alt="layer.title"
							width="128"
							height="128"
							contain
							class="tw:rounded-sm tw:flex-shrink-0 tw:bg-red-200 tw:w-[128px] tw:h-[128px] tw:min-w-[128px] tw:min-h-[128px]"
						>
							<template #placeholder>
								<div
									class="tw:flex tw:items-center tw:justify-center tw:w-full tw:h-full tw:bg-slate-200"
								>
									<span
										class="tw:text-slate-500 tw:font-semibold tw:text-lg"
										>no image</span
									>
								</div>
							</template>
						</v-img>
					</div>

					<div class="tw:min-w-0 tw:flex-1">
						<p
							class="tw:text-[1.05rem] tw:font-semibold tw:text-[#111111] tw:leading-tight tw:mb-1"
						>
							{{ layer.title }}
						</p>

						<p
							v-if="layer.abstract"
							class="tw:text-[0.88rem] tw:text-slate-700 tw:leading-snug tw:line-clamp-2 tw:mb-2"
						>
							{{ layer.abstract }}
						</p>

						<div
							class="tw:flex tw:flex-wrap tw:items-center tw:gap-x-3 tw:gap-y-1 dark-rose-text tw:text-[0.82rem]"
						>
							<span
								class="tw:inline-flex tw:items-center tw:gap-1"
							>
								<v-icon size="14">mdi-account</v-icon
								>{{ layer.owner_username }}
							</span>
							<span
								class="tw:inline-flex tw:items-center tw:gap-1"
							>
								<v-icon size="14"
									>mdi-calendar-month-outline</v-icon
								>{{ formatDate(layer.created) }}
							</span>
							<span
								class="tw:inline-flex tw:items-center tw:gap-1"
							>
								<v-icon size="14">mdi-eye-outline</v-icon
								>{{ layer.popular_count }}
							</span>
							<span
								class="tw:inline-flex tw:items-center tw:gap-1"
							>
								<v-icon size="14">mdi-map-marker-outline</v-icon
								>Visualizza mappa
							</span>
						</div>
					</div>
				</div>
			</button>
		</div>

		<p v-else-if="!props.loading" class="tw:text-sm tw:text-gray-500">
			Nessun layer disponibile.
		</p>
	</div>
</template>

<style lang="scss" scoped>
	.my-list-item {
		background-color: $main-dark-rose-color !important;
		&:hover {
			background-color: #e0e0e0;
		}
	}
	.selected-item {
		border: 1px solid $main-dark-rose-color !important;
		background-color: rgba($main-dark-rose-color, 0.08) !important;
	}
	.selected-item:hover {
		background-color: rgba($main-dark-rose-color, 0.14) !important;
	}
	.dark-rose-text {
		color: $main-super-dark-rose-color !important;
	}
</style>

