<script setup lang="ts">
defineProps<{
	leftClass?: string
	rightClass?: string
}>()
</script>

<template>
	<div class="grid grid-cols-1 md:grid-cols-2 w-screen h-screen min-w-0 overflow-hidden">
		<!-- Colonna sinistra -->
		<div :class="['w-full h-full', leftClass]">
			<slot name="left" />
		</div>

		<!-- Colonna destra -->
		<div :class="['w-full h-full min-w-0 overflow-hidden', rightClass]">
			<slot name="right" />
		</div>
	</div>
</template>