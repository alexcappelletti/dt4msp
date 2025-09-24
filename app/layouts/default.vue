<template>
	<div class="flex flex-col w-full h-screen">
		<Header />
		<main class="flex-1 min-h-[70vh] p-8">
			<slot />
		</main>
		<Footer />
	</div>
</template>

<script setup lang="ts">
import Header from '@/components/header.vue'
import Footer from '@/components/footer.vue'
</script>

<style scoped lang="scss">
</style>