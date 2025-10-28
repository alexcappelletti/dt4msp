<script setup lang="ts">
// import Header from '@/components/header.vue'
</script>


<template>
	<div class="flex flex-row w-full h-screen bg-green-400">
			<div class="w-1/2">
				<slot name="commands" />
			</div>
			<div class="basic-1/2 grow">
				<slot name="info"/>
			</div>
	</div>
</template>
<style scoped lang="scss">
</style>