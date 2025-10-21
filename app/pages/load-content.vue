<script lang="ts" setup>
definePageMeta({
	layout: 'default'
});
import LocalDataLoader from '@/components/LocalDataLoader.vue'
import CommandPreview from '@/components/commandPreview.vue'

</script>

<template>
<div class="grid grid-cols-[1fr_0.9fr] w-screen h-screen min-w-0 overflow-hidden border-amber-300">
  <!-- Colonna sinistra: Local Data Loader -->
  <div class="flex items-start justify-start w-full px-4">
    <LocalDataLoader class="flex-grow min-h-[200px]" />
  </div>

  <!-- Colonna destra: Command Preview -->
  <div class="flex items-start justify-start w-full px-4">
    <CommandPreview class="flex-grow min-w-[45vw] min-h-[200px] bg-gray-50" />
  </div>
</div>


</template>