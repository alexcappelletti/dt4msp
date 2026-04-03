<script setup lang="ts">
import type { Feedback } from '#/shared/types/msp-project';
import { computed, ref } from 'vue';

type FeedbackFilter = 'all' | 'opened' | 'closed';

const props = defineProps<{
	feedbacks: Feedback[];
}>();

const emit = defineEmits<{
	(e: 'edit:feedback', feedback: Feedback): void;
	(e: 'delete:feedback', feedback: Feedback): void;
	(e: 'clone:feedback', feedback: Feedback): void;
}>();

const currentFilter = ref<FeedbackFilter>('all');

function feedbackLabel(feedback: Feedback): string {
	return feedback.status === 'resolved' ? 'Chiuso' : 'Aperto';
}

function isOpenedFeedback(feedback: Feedback): boolean {
	return feedback.status === 'new' || feedback.status === 'reviewed';
}

function formatDate(value: Date): string {
	return new Date(value).toLocaleDateString('it-IT');
}

function feedbackTitle(feedback: Feedback): string {
	const source = feedback.title?.trim() ?? '';
	if (!source) return 'Feedback';
	return source.length > 36 ? `${source.slice(0, 36)}...` : source;
}

const filteredFeedbacks = computed(() => {
	if (currentFilter.value === 'opened') {
		return props.feedbacks.filter((item) => isOpenedFeedback(item));
	}

	if (currentFilter.value === 'closed') {
		return props.feedbacks.filter((item) => !isOpenedFeedback(item));
	}

	return props.feedbacks;
});

const menuItems = (feedback: Feedback) => [
	{ title: 'Clone', icon: 'mdi-content-copy', action: () => emit('clone:feedback', feedback) },
	{ title: 'Delete', icon: 'mdi-delete-outline', action: () => emit('delete:feedback', feedback) },
];
</script>

<template>
	<section class="feedback-list-container">
		<div class="filters-container mb-4 d-flex align-center">
			<span class="text-caption mr-4">Filtri:</span>
			<v-chip-group mandatory selected-class="text-primary" v-model="currentFilter">
				<v-chip value="opened">Aperti</v-chip>
				<v-chip value="closed">Chiusi</v-chip>
				<v-chip value="all">Tutti</v-chip>
			</v-chip-group>

				
			<v-btn icon="mdi-filter-variant" variant="text" size="small" />
		</div>

		<div v-if="filteredFeedbacks.length > 0" class="feedback-grid">
			<v-card v-for="feedback in filteredFeedbacks" :key="feedback.id" class="feedback-card hover-effect"
				@click="emit('edit:feedback', feedback)">
				<v-card-item>
					<template #prepend>
						<v-avatar size="32" color="primary" variant="tonal">
							<span class="white--text">{{ 'C' }}</span>
						</v-avatar>
					</template>
					<div class="feedback-head">
						<span class="text-subtitle-1  ">
							<strong>{{ feedbackTitle(feedback) }}</strong>
						</span>
						<span class="text-caption text-medium-emphasis">{{ feedback.author }} [{{ formatDate(feedback.createdAt) }}]</span>
					</div>
					<template #append>
						<v-menu>
							<template #activator="{ props: menuProps }">
								<v-btn v-bind="menuProps" icon variant="text" size="small" @click.stop>
									<v-icon>mdi-dots-vertical</v-icon>
								</v-btn>
							</template>
							<v-list density="compact">
								<v-list-item v-for="item in menuItems(feedback)" :key="item.title"
									@click.stop="item.action()">
									<template #prepend>
										<v-icon :icon="item.icon" />
									</template>
									<v-list-item-title>{{ item.title }}</v-list-item-title>
								</v-list-item>
							</v-list>
						</v-menu>
					</template>
				</v-card-item>

				<v-card-text>
					<p class="status-line mt-2 mb-1">{{ feedbackLabel(feedback) }}</p> 
					<p class="font-weight-bold mb-1">Commento</p>
					<p class="text-medium-emphasis mb-3">{{ feedback.comment }}</p>
					<p class="font-weight-bold">Descrizione</p>
					<p class="text-medium-emphasis text-caption">Valutazione {{ feedback.rating }}/5. {{ feedback.updatedAt ? `Ultimo aggiornamento
						${formatDate(feedback.updatedAt)}.` : 'Nessun aggiornamento registrato.' }}
					</p>
				</v-card-text>
			</v-card>
		</div>

		<v-alert v-else type="info" variant="tonal">
			Nessun commento trovato con i filtri correnti.
		</v-alert>
	</section>
</template>

<style scoped>
.feedback-list-container {
	width: 100%;
	padding: 16px 20px 24px;
}

.filters-row {
	display: flex;
	align-items: center;
	gap: 12px;
	margin-bottom: 14px;
}

.filters-title {
	font-size: 0.875rem;
	font-weight: 600;
}

.filters-actions {
	display: flex;
	gap: 8px;
	flex-wrap: wrap;
}

.is-active {
	border-color: rgb(var(--v-theme-primary));
}

.feedback-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
	gap: 16px;
}

.feedback-card {
	border-radius: 10px;
	border: 1px solid rgba(126, 92, 172, 0.2);
	background-color: #ffffff;
	min-height: 190px;
}

.feedback-head {
	display: flex;
	flex-direction: column;
	gap: 2px;
	min-width: 0;
}

.feedback-title-line {
	display: block;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}


.status-line {
	font-weight: 600;
}

</style>
