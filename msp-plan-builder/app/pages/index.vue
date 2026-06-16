<script setup lang="ts">
const router = useRouter();
const { user, authenticated, refresh, loginWithGoogle, logout } = useAuth();
const mspDataProvider = useMspDataProvider();
const authError = ref<string | null>(null);
const isReady = ref(false);
const isEntering = ref(false);

onMounted(async () => {
	await refresh();
	try {
		const data = await $fetch<{ message: string | null }>('/api/auth/error');
		authError.value = data.message;
	} catch {
		authError.value = null;
		console.log("error at auth error check")
	} finally {
		isReady.value = true;
	}
});

const enterApp = async () => {
	isEntering.value = true;
	try {
		// const project = await mspDataProvider.fetchProject('prj-2026-001');
		// const areaId = project?.areaOfInterest?.id;
		// if (!areaId) return;
		// await router.push(`/areas/${areaId}`);
		await router.push('/index-debug');
	} catch (err){
		console.error('Errore durante il caricamento del progetto.' +JSON.stringify(err));
		// Se il progetto non e caricato, non forziamo route fallback.
	} finally {
		isEntering.value = false;
	}
};

definePageMeta({ layout: 'login' });
useHead({ title: 'Accesso' });
</script>

<template>
	<div v-if="isReady" class="login-page">
		<div class="login-card">
			<h1 class="login-title">MSP Plan Builder</h1>
			<p class="login-subtitle">Accedi con il tuo account Google per iniziare.</p>
			<v-alert v-if="authError" type="error" variant="tonal" density="comfortable" class="tw:mb-4">
				{{ authError }}
			</v-alert>

			<div v-if="authenticated" class="auth-box">
				<p class="welcome">Ciao, {{ user?.name || user?.email }}</p>
				<div class="actions">
					<v-btn color="primary" variant="flat" :loading="isEntering" :disabled="isEntering"
						@click="enterApp">
						Entra nell'app
					</v-btn>
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
	<div v-else class="boot-placeholder"></div>
</template>

<style scoped>
.login-page {
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

.boot-placeholder {
	min-height: 100vh;
	background: #fef7ff;
}
</style>
