export default defineNuxtRouteMiddleware(async (to) => {
	const publicPaths = new Set(['/']);
	if (publicPaths.has(to.path)) {
		return;
	}

	try {
		const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined;
		const result = await $fetch<{ authenticated: boolean }>('/api/auth/me', {
			headers,
		});

		if (!result.authenticated) {
			return navigateTo('/');
		}
	} catch {
		return navigateTo('/');
	}
});
