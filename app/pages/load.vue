<script setup lang="ts">
definePageMeta({
  layout: false,
})

import CommandPreview from '@/components/commandPreview.vue'
import LocalDataLoader from '@/components/LocalDataLoader.vue'
</script>

<template>
    <NuxtLayout name="main-layout">
      <template #left>
        <LocalDataLoader class="w-full h-full min-h-[200px]" />
      </template>
      <template #right>
        <CommandPreview class="w-full min-h-[200px]  bg-gray-50" />
      </template>
    </NuxtLayout >
</template>


