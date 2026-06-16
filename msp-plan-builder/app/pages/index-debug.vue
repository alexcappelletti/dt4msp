<script setup lang="ts">
type DebugResponse = {
	now: string;
	nodeEnv: string | null;
	requestOrigin: string;
	resolvedGoogleRedirectUri: string;
	configuredGoogleRedirectUri: string | null;
	hasGoogleClientId: boolean;
	hasGoogleClientSecret: boolean;
	hasAuthSecret: boolean;
	hasSessionCookie: boolean;
	hasOAuthStateCookie: boolean;
	authErrorCookie: string | null;
	authenticated: boolean;
	user: {
		sub: string;
		email: string;
		role?: 'admin' | 'editor' | 'viewer';
		name?: string;
		picture?: string;
	} | null;
	authorization: {
		allowed: boolean;
		role: 'admin' | 'editor' | 'viewer' | null;
		reason: string | null;
	} | null;
};

const { loginWithGoogle, logout, refresh } = useAuth();

const debug = ref<DebugResponse | null>(null);
const loading = ref(false);
const loadError = ref<string | null>(null);

const loadDebug = async () => {
	loading.value = true;
	loadError.value = null;
	try {
		await refresh();
		debug.value = await $fetch<DebugResponse>('/api/auth/debug');
	} catch (error: unknown) {
		loadError.value = error instanceof Error ? error.message : String(error);
	} finally {
		loading.value = false;
	}
};

onMounted(loadDebug);

definePageMeta({ layout: 'login' });
useHead({ title: 'Debug Accesso' });
</script>

<template>
	<div class="debug-page">
		<div class="debug-card">
			<div class="debug-header">
				<div>
					<h1 class="debug-title">Debug autenticazione</h1>
					<p class="debug-subtitle">
						Pagina di verifica per il deploy Vercel: login Google, callback OAuth, sessione e autorizzazione.
					</p>
				</div>
				<div class="debug-actions">
					<v-btn color="primary" variant="flat" :loading="loading" :disabled="loading" @click="loadDebug">
						Aggiorna
					</v-btn>
					<v-btn color="primary" variant="tonal" @click="loginWithGoogle">
						Test login Google
					</v-btn>
					<v-btn variant="text" @click="logout">
						Logout
					</v-btn>
				</div>
			</div>

			<v-alert v-if="loadError" type="error" variant="tonal" class="tw:mb-4">
				{{ loadError }}
			</v-alert>

			<div v-if="debug" class="debug-grid">
				<div class="debug-section">
					<h2>Esito rapido</h2>
					<ul class="debug-list">
						<li><strong>Autenticato:</strong> {{ debug.authenticated ? 'si' : 'no' }}</li>
						<li><strong>Autorizzato:</strong> {{ debug.authorization?.allowed ? 'si' : 'no' }}</li>
						<li><strong>Ruolo:</strong> {{ debug.authorization?.role || debug.user?.role || '-' }}</li>
						<li><strong>Errore auth:</strong> {{ debug.authErrorCookie || '-' }}</li>
					</ul>
				</div>

				<div class="debug-section">
					<h2>OAuth e host</h2>
					<ul class="debug-list">
						<li><strong>Origin richiesta:</strong> <code>{{ debug.requestOrigin }}</code></li>
						<li><strong>Redirect risolto:</strong> <code>{{ debug.resolvedGoogleRedirectUri }}</code></li>
						<li><strong>Redirect configurato:</strong> <code>{{ debug.configuredGoogleRedirectUri || '(auto)' }}</code></li>
						<li><strong>NODE_ENV:</strong> <code>{{ debug.nodeEnv || '-' }}</code></li>
						<li><strong>Timestamp:</strong> <code>{{ debug.now }}</code></li>
					</ul>
				</div>

				<div class="debug-section">
					<h2>Cookie e config</h2>
					<ul class="debug-list">
						<li><strong>Cookie sessione:</strong> {{ debug.hasSessionCookie ? 'presente' : 'assente' }}</li>
						<li><strong>Cookie OAuth state:</strong> {{ debug.hasOAuthStateCookie ? 'presente' : 'assente' }}</li>
						<li><strong>GOOGLE_CLIENT_ID:</strong> {{ debug.hasGoogleClientId ? 'ok' : 'manca' }}</li>
						<li><strong>GOOGLE_CLIENT_SECRET:</strong> {{ debug.hasGoogleClientSecret ? 'ok' : 'manca' }}</li>
						<li><strong>AUTH_SECRET:</strong> {{ debug.hasAuthSecret ? 'ok' : 'manca' }}</li>
					</ul>
				</div>

				<div class="debug-section">
					<h2>Utente</h2>
					<pre class="debug-pre">{{ JSON.stringify(debug.user, null, 2) }}</pre>
				</div>

				<div class="debug-section">
					<h2>Autorizzazione</h2>
					<pre class="debug-pre">{{ JSON.stringify(debug.authorization, null, 2) }}</pre>
				</div>

				<div class="debug-section">
					<h2>Come leggerla</h2>
					<ul class="debug-list">
						<li>Se il login Google torna alla home ma qui vedi `Errore auth`, il problema e nel callback o nell'autorizzazione.</li>
						<li>Se `Origin richiesta` e `Redirect risolto` non corrispondono al dominio Vercel reale, il redirect OAuth e configurato male.</li>
						<li>Se sei autenticato ma non autorizzato, controlla le regole Redis per email, dominio e ruolo.</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.debug-page {
	width: 100%;
	display: flex;
	justify-content: center;
	padding: 24px;
}

.debug-card {
	width: 100%;
	max-width: 1100px;
	background: #ffffff;
	border: 1px solid #e8deef;
	border-radius: 18px;
	padding: 28px;
	box-shadow: 0 14px 30px rgba(41, 19, 63, 0.08);
}

.debug-header {
	display: flex;
	justify-content: space-between;
	gap: 16px;
	align-items: flex-start;
	margin-bottom: 20px;
	flex-wrap: wrap;
}

.debug-title {
	margin: 0;
	font-size: 2rem;
	font-weight: 700;
	color: #2f1846;
}

.debug-subtitle {
	margin: 8px 0 0;
	color: #5a4b67;
	max-width: 720px;
}

.debug-actions {
	display: flex;
	gap: 10px;
	flex-wrap: wrap;
}

.debug-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
	gap: 16px;
}

.debug-section {
	border: 1px solid #eee4f5;
	border-radius: 14px;
	padding: 16px;
	background: #fcf9ff;
}

.debug-section h2 {
	margin: 0 0 12px;
	font-size: 1rem;
	color: #3a2c49;
}

.debug-list {
	margin: 0;
	padding-left: 18px;
	color: #4d415a;
}

.debug-list li {
	margin-bottom: 8px;
	word-break: break-word;
}

.debug-pre {
	margin: 0;
	padding: 12px;
	border-radius: 10px;
	background: #24182d;
	color: #f7efff;
	overflow: auto;
	font-size: 0.85rem;
	line-height: 1.45;
}
</style>
