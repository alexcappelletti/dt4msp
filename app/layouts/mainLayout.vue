<script setup lang="ts">
import Header from '@/components/header.vue'

// import Header from '@/components/header.vue'
</script>


<template>
	<Header/>
	<div class="flex flex-row w-full h-screen bg-gray-400">
			<nav class="min-w-2/12 bg-gray-200 flex flex-col " >
				<slot name="navigation" >
					<p class="text-red-500">⚠️ Slot "navigation" non ricevuto</p>
				</slot>
			</nav>
			<div class="basic-1/2 grow bg-gray-100">
				<slot name="body">
					<p class="">⚠️ Slot "body" non ricevuto</p>
				</slot>	
			</div>
	</div>
</template>
<style scoped lang="scss">
</style>