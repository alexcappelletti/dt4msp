<script setup lang="ts">
definePageMeta({
	layout: 'login-layout'
});
import { ref } from 'vue'

const email = ref('')
const password = ref('')

const handleLogin = () => {
	// Qui puoi aggiungere la logica di autenticazione
	console.log('Email:', email.value)
	console.log('Password:', password.value)
}

</script>
<template>
	<div class="min-h-screen flex items-center justify-center bg-slate-500">
		<form class="login-form w-full max-w-md p-8 bg-slate-300 rounded shadow space-y-6">
			<h2 class="text-2xl font-bold text-center text-primary mb-4">Accedi</h2>
			<input type="email" placeholder="Email" class="p-2 border w-full rounded mb-4" />
			<input type="password" placeholder="Password" class="p-2 border w-full rounded mb-6" />
			<button class="bg-primary py-2 px-4 rounded w-full hover:bg-slate-500 text-white">Login</button>
		</form>
	</div>
</template>

<style lang="scss" scoped>
.login-form {
	border: 1px solid #ddd;
	padding: 2rem;
	border-radius: 8px;
}
</style>