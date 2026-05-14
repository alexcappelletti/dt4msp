import type { H3Event } from 'h3';
import { getAuthzPolicyFromRedis, type AuthRole } from '#/server/utils/authzRedis';

interface AuthorizationResult {
	allowed: boolean;
	role: AuthRole;
	reason?: string;
}

export async function authorizeGoogleUser(event: H3Event, email: string): Promise<AuthorizationResult> {
	const normalizedEmail = email.trim().toLowerCase();
	const domain = normalizedEmail.split('@')[1] || '';

	const policy = await getAuthzPolicyFromRedis(event);
	const hasRules =
		policy.allowedEmails.size > 0 ||
		policy.allowedDomains.size > 0 ||
		policy.adminEmails.size > 0 ||
		Object.keys(policy.userRoles).length > 0;

	const isExplicitlyAllowed =
		policy.allowedEmails.has(normalizedEmail) ||
		policy.allowedDomains.has(domain) ||
		policy.adminEmails.has(normalizedEmail) ||
		Boolean(policy.userRoles[normalizedEmail]);

	if (policy.mode === 'restricted' && !isExplicitlyAllowed) {
		return {
			allowed: false,
			role: policy.defaultRole,
			reason: 'Il tuo account non é abititato ad accedere a questa applicazione',
		};
	}

	if (policy.mode === 'configured' && hasRules && !isExplicitlyAllowed) {
		return {
			allowed: false,
			role: policy.defaultRole,
			reason: 'Il tuo account non é autorizzato ad accedere a questa applicazione',
		};
	}

	const role: AuthRole = policy.adminEmails.has(normalizedEmail)
		? 'admin'
		: policy.userRoles[normalizedEmail] || policy.defaultRole;

	return { allowed: true, role };
}
