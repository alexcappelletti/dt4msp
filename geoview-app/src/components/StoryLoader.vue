<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'

const showtable = ref(false);
const headers = ref<string[]>([]);
const tableData = ref<Array<Array<string | number>>>([]);
const sheetNames = ref<string[]>([]);
const selectedSheet = ref<string>('');
const workbookRef = ref<XLSX.WorkBook | null>(null);
type DescriptionItem = {
    title: string;
    text: string;
};

const descriptions = ref<DescriptionItem[]>([]);



function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) { return }
    const reader = new FileReader()
    reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        workbookRef.value = workbook;
        sheetNames.value = workbook.SheetNames;
        selectedSheet.value = workbook.SheetNames[0];
        loadSheet(); // Load first sheet by default

    }

    reader.readAsArrayBuffer(file)
}

async function loadDefaultFile(): Promise<void> {
    const response = await fetch('/sample-geostory.xlsx');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);
    const workbook = XLSX.read(data, { type: 'array' });

    workbookRef.value = workbook;
    sheetNames.value = workbook.SheetNames;
    selectedSheet.value = workbook.SheetNames[1];
    loadSheet();
};



function loadSheet() {
    if (!workbookRef.value || !selectedSheet.value) return;

    const worksheet = workbookRef.value.Sheets[selectedSheet.value];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    headers.value = jsonData[0] as string[];
    tableData.value = jsonData.slice(1) as Array<Array<string | number>>;
    getTitle();
    findDescriptions();
};
const title = ref<string>('');
const intro = ref<string>('Questa è una mappa Leaflet che mostra dati WFS (GeoJSON) dal GeoServer demo.');
function getTitle() {
    title.value = '';
    if (!workbookRef.value || !selectedSheet.value) return;
    if (selectedSheet.value !== 'NEWstory_SP') {return;}
    const sectionIndex = headers.value.indexOf('section_id');
    const itemDescIdx = headers.value.indexOf('item_description');
    const descriptionIndex = headers.value.indexOf('data');
    if (sectionIndex !== -1 && itemDescIdx !== -1) {
        const introductions = tableData.value.filter((row) => row[sectionIndex] === 'introduction')
            .map((row) => ({
                label: row[itemDescIdx], 
                value: row[descriptionIndex]
            }));
        title.value = String(introductions?.[0]?.value || '--title not found--');
        intro.value = String(introductions?.[1]?.value || 'Nessuna introduzione trovata');
    }
}
function findDescriptions() {
    descriptions.value = [];
    // Se il foglio è "NEWstory_SP", filtra le descrizioni
    if (selectedSheet.value === 'NEWstory_SP') {
        const sectionIndex = headers.value.indexOf('section_id');
        const dataIndex = headers.value.indexOf('data');
        const titleIndex = headers.value.indexOf('item_description');
        if (sectionIndex !== -1 && dataIndex !== -1 && titleIndex !== -1) {
            descriptions.value = tableData.value
                .filter((row) => row[sectionIndex] === 'description')
                .map((row) => ({
                    title: String(row[titleIndex]),
                    text: String(row[dataIndex])
                }));
        }


    }
}

</script>

<template>
    <v-container class="pa-4">
        <v-row align="center" justify="space-between">
            <v-col cols="auto">
                <v-btn @click="loadDefaultFile" color="primary" prepend-icon="mdi-folder-open">
                    Load sample
                </v-btn>
            </v-col>
            <v-col cols="auto">
                <v-switch v-model="showtable" label="Visualizza struttura" color="primary" hide-details />
            </v-col>
        </v-row>

        <v-row v-if="tableData.length && showtable" class="mt-4">
            <v-col cols="12">
                <v-select v-if="sheetNames.length" v-model="selectedSheet" :items="sheetNames" label="Seleziona foglio"
                    @change="loadSheet" outlined dense color="primary" />
            </v-col>

            <v-col cols="12">
                <v-card outlined>
                    <v-table>
                        <thead>
                            <tr>
                                <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(row, rowIndex) in tableData" :key="rowIndex">
                                <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-col>
        </v-row>
       <v-row v-if="descriptions.length" class="mt-6">
            <v-col cols="12">
                <h1 class="text-h6 mb-4">{{title}}</h1>
                <h3 class="text-h5 mb>4">{{intro}}</h3>
                <v-card v-for="(item, index) in descriptions" :key="index" class="mb-4 pa-4" outlined>
                    <v-row align="baseline">
                        <v-col cols="4" class="font-weight-bold text-body-1">
                            {{ item.title }}
                        </v-col>
                        <v-col cols="8" class="text-body-2">
                            {{ item.text }}
                        </v-col>
                    </v-row>
                </v-card>
            </v-col>
        </v-row>
    </v-container>

</template>

<style lang="scss" scoped>
@use "@/assets/styles/variables.scss" as *;

.description-section {
    margin-top: $spacing-lg;

    h3 {

        font-family: $font-family;
        font-size: $font-size-large;
        margin-bottom: $spacing-md;
        color: $color-accent;
        background-color: $color-secondary;
    }

    .description-block {
        display: flex;
        font-family: $font-family;
        font-size: $font-size-base;
        text-align: justify;
        line-height: $line-height-base;
        margin-bottom: $spacing-md;
        background-color: $color-highlight;
        padding: $spacing-md;
        border-left: 4px solid $color-primary;
        border-radius: $border-radius;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        color: $color-dark-text;

        .description-title {
            width: 30%;
            font-weight: bold;
            font-size: $font-size-medium;
            font-family: $font-family;
            padding-right: $spacing-md;


        }

        .description-text {
            font-size: $font-size-base;
            text-align: justify;
            line-height: $line-height-base;
            width: 70%;
            font-family: $font-family;
        }

    }
}


.test-block {
    background-color: $block-bg-red;
    font-size: 2rem;
    padding: 1rem;
}

.excel-reader {
    font-family: sans-serif;
    padding: 1rem;
}

.toolbar {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    margin-top: $spacing-md;
    margin-bottom: $spacing-sm;

    .v-btn {
        font-family: $font-family;
    }

    .v-switch {
        margin-left: auto;
    }
}

.table-toggle {
    margin-top: $spacing-md;
    margin-bottom: $spacing-sm;
}

table {
    border-collapse: collapse;
    margin-top: 1rem;
}

th,
td {
    border: 1px solid #ccc;
    padding: 0.5rem;
}
</style>
