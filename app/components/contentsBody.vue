<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

const items = [
	{
		label: 'Account',
		description: 'Make changes to your account here. Click save when you\'re done.',
		icon: 'i-lucide-user',
		slot: 'account' as const
	},
	{
		label: 'Password',
		description: 'Change your password here. After saving, you\'ll be logged out.',
		icon: 'i-lucide-lock',
		slot: 'password' as const
	}
] satisfies TabsItem[]

const state = reactive({
	name: 'Benjamin Canac',
	username: 'benjamincanac',
	currentPassword: '',
	newPassword: '',
	confirmPassword: ''
})
</script>

<template>
	<div> ciao</div>
</template>