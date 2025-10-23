<script lang="ts" setup>
import twoColGridLayout from '~/layouts/twoColGridLayout.vue';
import LocalDataLoader from '@/components/LocalDataLoader.vue'
import CommandPreview from '@/components/commandPreview.vue'

</script>

<template>
    <two-col-grid-layout left-class="px-4" right-class="px-4 bg-gray-50">
        <template #left>
            <LocalDataLoader class="w-full h-full min-h-[200px]" />
        </template>
        <template #right>
            <CommandPreview class="w-full min-h-[200px] bg-gray-50" />
        </template>

    </two-col-grid-layout>
</template>