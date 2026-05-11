<script setup lang="ts">
const projectStore = useProjectStore();
</script>

<template>
	<div
		v-if="projectStore.hasRemoteUpdateNotice"
		data-testid="remote-update-toast"
		class="remote-update-toast"
		role="status"
	>
		<span>{{ projectStore.remoteUpdateMessage || 'Aggiornamento remoto rilevato.' }}</span>
		<button type="button" data-testid="remote-update-toast-close" @click="projectStore.clearRemoteUpdateNotice()">
			Chiudi
		</button>
	</div>
</template>

<style scoped>
.remote-update-toast {
	position: fixed;
	bottom: 16px;
	right: 16px;
	z-index: 3000;
	background: #fff3cd;
	color: #664d03;
	border: 1px solid #ffecb5;
	border-radius: 8px;
	padding: 10px 12px;
	display: flex;
	gap: 12px;
	align-items: center;
}
</style>
