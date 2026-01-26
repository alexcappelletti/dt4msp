<!-- components/areas/StatementForm.vue -->
<script setup lang="ts">
import type { Statement } from '#/shared/types/msp-project';
import { useMspDataProvider } from '#imports';
import { ref } from 'vue';

const props = defineProps<{
	initialData: Partial<Statement>;
}>();


const mpsDataProvider = useMspDataProvider();
const availableThemes = ref<Theme[]>([]);
const themesLoading = ref(true);

const fetchThemes = async () => {
	try {
		availableThemes.value = await mpsDataProvider.fetchAvailableThemes();
	} catch (e) {
		console.error("Error fetching themes", e);
	} finally {
		themesLoading.value = false;
	}
};


const isSectorSpecific = computed(() => {
	// Ritorna true se sectorThemes è un array (anche vuoto),
	// false se è undefined o null
	return !!props.initialData.sectorThemes
});

const formTitle = computed(() => {
	const action = props.initialData?.id ? 'Modifica' : 'Nuovo';
	const type = isSectorSpecific.value ? 'Sector-specific' : 'General';
	return `${action} Statement ${type}`;
});

const themeColor = computed(() => isSectorSpecific.value ? 'secondary' : 'primary');

fetchThemes();

const emit = defineEmits(['save', 'cancel']);

const formData = ref<Partial<Statement>>({ ...props.initialData });
const canSave = computed(() => formData.value.shortName?.trim() && formData.value.longName?.trim());

const saveForm = () => {
	if (canSave.value) {
		emit('save', formData.value);
	}
};

const cancelForm = () => {
	emit('cancel');
};


</script>
<template>
	<v-card flat>
		<!-- Toolbar con Titolo Dinamico -->
		<v-toolbar color="background" flat>
			<v-btn icon @click="cancelForm">
				<v-icon>mdi-arrow-left</v-icon>
			</v-btn>

			<v-toolbar-title class="font-weight-bold">
				<v-chip size="small" :color="isSectorSpecific ? 'secondary' : 'primary'" variant="flat" class="mr-2">
					{{ isSectorSpecific ? 'S' : 'G' }}
				</v-chip>
				{{ isSectorSpecific ? 'Sector-specific' : 'General' }} statement
			</v-toolbar-title>

			<v-spacer></v-spacer>

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
					<v-col cols="12" md="6">
						<v-text-field v-model="formData.shortName" label="Short name" variant="outlined" clearable
							hint="Title of the statement" persistent-hint></v-text-field>
					</v-col>
					<v-col cols="12" md="6">
						<v-text-field v-model="formData.longName" label="Long name" variant="outlined" clearable
							hint="Supporting text of the statement" persistent-hint></v-text-field>
					</v-col>
				</v-row>

				<v-row>
					<v-col cols="12">
						<v-textarea v-model="formData.description" label="Description" variant="outlined" rows="4"
							clearable hint="Statement description (narrative or driver)" persistent-hint></v-textarea>
					</v-col>
				</v-row>

				<!-- Area Upload Immagine -->
				<v-row>
					<v-col cols="12">
						<v-label>Upload image</v-label>
						<v-card outlined class="pa-8 mt-1 text-center"
							style="border: 2px dashed #ddd; cursor: pointer;">
							<v-icon size="48" color="grey-lighten-1">mdi-image-plus</v-icon>
							<p class="text-caption mt-2">Choose a file or drag & drop it here</p>
							<v-btn variant="tonal" class="mt-2" size="small">Choose file</v-btn>
						</v-card>
					</v-col>
				</v-row>

				<!-- Pulsante Add table -->
				<v-row>
					<v-col cols="12">
						<v-btn block size="large" color="blue-grey-lighten-5" variant="flat" class="text-none">
							<v-icon start>mdi-table-plus</v-icon>
							Add table
						</v-btn>
					</v-col>
				</v-row>

				<!-- NUOVA SEZIONE CHIP (Visible solo per Sector Specific) -->
				<v-expand-transition>
					<v-row v-if="isSectorSpecific">
						<v-col cols="12">
							<v-label>Theme</v-label>

							<!-- 2. Mostra un loader finché i temi non sono caricati -->
							<v-progress-linear v-if="themesLoading" indeterminate color="primary"
								class="mt-2"></v-progress-linear>

							<!-- 3. Mostra le chip solo quando i temi sono pronti -->
							<v-chip-group v-else v-model="formData.sectorThemes" column multiple
								selected-class="text-primary">
								<v-chip v-for="theme in availableThemes" :key="theme.id" :value="theme"
									variant="outlined">
									{{ theme.name }}
								</v-chip>
							</v-chip-group>
						</v-col>
					</v-row>
				</v-expand-transition>

			</v-form>
		</v-card-text>
	</v-card>
</template>