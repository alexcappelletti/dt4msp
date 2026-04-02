<script setup lang="ts">
import type { Feedback } from '#/shared/types/msp-project';
import { computed, ref } from 'vue';

const props = defineProps<{
	initialData: Partial<Feedback>;
}>();

const emit = defineEmits<{
	(e: 'save', feedback: Partial<Feedback>): void;
	(e: 'cancel'): void;
}>();

type EditorStatus = 'open' | 'closed';

const formData = ref({
	date: props.initialData.createdAt
		? new Date(props.initialData.createdAt).toISOString().slice(0, 10)
		: new Date().toISOString().slice(0, 10),
	name: props.initialData.author ?? '',
	description: props.initialData.comment ?? '',
	statusComment: props.initialData.comment ?? '',
	rating: props.initialData.rating ?? 3,
	status: props.initialData.status === 'resolved' ? 'closed' : 'open' as EditorStatus,
	uploadName: '',
});

const fileInputRef = ref<HTMLInputElement | null>(null);

const canSave = computed(() =>
	formData.value.name.trim().length > 0 &&
	(formData.value.description.trim().length > 0 || formData.value.statusComment.trim().length > 0),
);

const saveForm = () => {
	if (!canSave.value) return;

	const nextComment = formData.value.statusComment.trim() || formData.value.description.trim();
	emit('save', {
		...props.initialData,
		author: formData.value.name.trim(),
		comment: nextComment,
		createdAt: new Date(formData.value.date),
		updatedAt: new Date(),
		rating: formData.value.rating,
		status: formData.value.status === 'open' ? 'new' : 'resolved',
	});
};

const cancelForm = () => emit('cancel');

const onFileSelect = (event: Event) => {
	const target = event.target as HTMLInputElement;
	const first = target.files?.[0];
	formData.value.uploadName = first?.name ?? '';
};

const triggerFilePicker = () => fileInputRef.value?.click();
</script>

<template>
	<v-card class="pa-4 feedback-editor" flat>
		<v-toolbar color="background" flat>
			<v-btn icon @click="cancelForm">
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>

			<v-toolbar-title class="font-weight-bold">Feedback</v-toolbar-title>
			<v-spacer />
			<v-btn icon>
				<v-icon>mdi-star-outline</v-icon>
			</v-btn>
			<v-btn icon @click="saveForm" :disabled="!canSave">
				<v-icon color="primary">mdi-content-save</v-icon>
			</v-btn>
		</v-toolbar>

		<v-card-text>
			<v-form>
				<v-row>
					<v-col cols="12" md="4">
						<v-text-field v-model="formData.date" label="Date" type="date" variant="outlined"
							hint="MM/DD/YYYY" persistent-hint />
					</v-col>
					<v-col cols="12" md="8">
						<v-text-field v-model="formData.name" label="Name" variant="outlined" clearable
							hint="Supporting text of the feedback" persistent-hint />
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-textarea v-model="formData.description" label="Description" variant="outlined" rows="6"
							clearable hint="Statement description (narrative or driver)" persistent-hint />
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-label>Upload image</v-label>
						<div class="upload-box mt-2">
							<v-icon size="46" color="grey-lighten-1">mdi-image-plus</v-icon>
							<p class="text-caption mt-2 mb-2">Choose a file or drag & drop it here</p>
							<v-btn variant="tonal" size="small" @click="triggerFilePicker">Choose file</v-btn>
							<input ref="fileInputRef" class="d-none" type="file" accept="image/*"
								@change="onFileSelect" />
							<p v-if="formData.uploadName" class="text-caption mt-2">{{ formData.uploadName }}</p>
						</div>
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-btn block size="large" color="primary" variant="tonal" class="text-none">
							<v-icon start>mdi-plus</v-icon>
							Add table
						</v-btn>
					</v-col>
				</v-row>

				<v-row class="mt-2">
					<v-col cols="12" md="4">
						<v-label>Status</v-label>
						<v-chip-group v-model="formData.status" mandatory selected-class="text-primary" class="mt-2">
							<v-chip value="open" variant="tonal">Open</v-chip>
							<v-chip value="closed" variant="outlined">Closed</v-chip>
						</v-chip-group>
					</v-col>
					<v-col cols="12" md="8">
						<v-slider v-model="formData.rating" label="Rating" min="1" max="5" step="1" thumb-label
							color="primary" />
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-text-field v-model="formData.statusComment" label="Comment" variant="outlined" clearable
							hint="Comments on the feedback state" persistent-hint />
					</v-col>
				</v-row>
			</v-form>
		</v-card-text>
	</v-card>
</template>

<style scoped>
.feedback-editor {
	max-width: 980px;
}

.upload-box {
	min-height: 150px;
	border: 1px dashed rgba(0, 0, 0, 0.35);
	border-radius: 10px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 16px;
}
</style>
