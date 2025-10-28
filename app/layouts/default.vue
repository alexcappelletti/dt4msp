<template>
	<div class="flex flex-col w-full h-screen bg-amber-700">
	  	<p>Some default layout content shared across all pages</p>
    	<slot />
  	</div>
</template>

<script setup lang="ts">
import Header from '@/components/header.vue'
import Footer from '@/components/footer.vue'
</script>

<style scoped lang="scss">
</style>