<template>
	<div class="layout">
		<Header />
		<main>
			<Map />
			<slot />
		</main>
		<Footer />
	</div>
</template>

<script setup lang="ts">
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
</script>

<style scoped>
.layout {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

main {
	display: flex;
	flex-direction: row;
}
</style>