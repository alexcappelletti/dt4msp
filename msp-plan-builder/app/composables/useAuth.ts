interface AuthUser {
	sub: string;
	email: string;
	role?: 'admin' | 'editor' | 'viewer';
	name?: string;
	picture?: string;
}

interface MeResponse {
	authenticated: boolean;
	user: AuthUser | null;
}

export const useAuth = () => {
	const user = useState<AuthUser | null>('auth_user', () => null);
	const authenticated = computed(() => !!user.value);

	const refresh = async () => {
		try {
			const data = await $fetch<MeResponse>('/api/auth/me');
			user.value = data.user;
		} catch {
			user.value = null;
		}
	};

	const loginWithGoogle = () => {
		if (import.meta.client) {
			const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
			window.location.href = `/api/auth/google/login?returnTo=${encodeURIComponent(returnTo)}`;
		}
	};

	const logout = async () => {
		await $fetch('/api/auth/logout', { method: 'POST' });
		user.value = null;
		if (import.meta.client) {
			await navigateTo('/');
		}
	};

	return {
		user,
		authenticated,
		refresh,
		loginWithGoogle,
		logout,
	};
};
