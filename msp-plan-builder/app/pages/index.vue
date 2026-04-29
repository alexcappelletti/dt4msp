<script setup lang="ts">
const router = useRouter();
const { user, authenticated, refresh, loginWithGoogle, logout } = useAuth();

onMounted(async () => {
	await refresh();
});

const enterApp = async () => {
	await router.push('/areas/1');
};

useHead({ title: 'Accesso' });
</script>

<template>
	<div class="login-page">
		<div class="login-card">
			<h1 class="login-title">MSP Plan Builder</h1>
			<p class="login-subtitle">Accedi con il tuo account Google per iniziare.</p>

			<div v-if="authenticated" class="auth-box">
				<p class="welcome">Benvenuto, {{ user?.name || user?.email }}</p>
				<div class="actions">
					<v-btn color="primary" variant="flat" @click="enterApp">Entra nell'app</v-btn>
					<v-btn variant="tonal" @click="logout">Logout</v-btn>
				</div>
			</div>

			<div v-else class="auth-box">
				<v-btn color="primary" size="large" variant="flat" @click="loginWithGoogle">
					Login con Google
				</v-btn>
			</div>
		</div>
	</div>
</template>

<style scoped>
.login-page {
	min-height: calc(100vh - 64px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
}

.login-card {
	width: 100%;
	max-width: 560px;
	background: #fff;
	border: 1px solid #e8deef;
	border-radius: 16px;
	padding: 32px;
	box-shadow: 0 10px 24px rgba(41, 19, 63, 0.08);
}

.login-title {
	margin: 0;
	font-size: 1.9rem;
	font-weight: 700;
	color: #2f1846;
}

.login-subtitle {
	margin: 8px 0 24px;
	color: #5a4b67;
}

.auth-box {
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.welcome {
	margin: 0;
	font-weight: 500;
	color: #3a2c49;
}

.actions {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}
</style>
