<script setup lang="ts">
const route = useRoute();
const pageTitle = computed(() => route.meta.title || 'MSP-plan builder');
const { user, authenticated, refresh, loginWithGoogle, logout } = useAuth();

onMounted(async () => {
	await refresh();
});
</script>

<template>
	<v-app-bar app class="app-header" elevation="0">
		<div class="header-title tw:uppercase">
			{{ pageTitle }}
		</div>
		<v-spacer></v-spacer>
		<div class="user-profile">
			<template v-if="authenticated">
				<span class="user-name">{{ user?.name || user?.email }}</span>
				<v-btn size="small" variant="tonal" @click="logout">Logout</v-btn>
			</template>
			<template v-else>
				<v-btn size="small" color="primary" variant="flat" @click="loginWithGoogle">
					Login con Google
				</v-btn>
			</template>
		</div>
	</v-app-bar>
</template>

<style lang="scss" scoped>
.app-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 0 20px;
	height: 60px;
	background-color: $main-rose-color !important;
	border-bottom: 1px solid #e0e0e0;
}

.header-title {
	font-size: 1rem;
	font-weight: 500;
	color: #333333;
}

.user-profile {
	display: flex;
	align-items: center;
	gap: 12px;
}

.user-name {
	font-size: 0.9rem;
	color: #333;
}
</style>
