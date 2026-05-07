import type { H3Event } from 'h3';
import { withRedisClient } from '#/server/utils/redisClient';

export type AuthRole = 'admin' | 'editor' | 'viewer';

export interface AuthzPolicy {
	allowedEmails: Set<string>;
	allowedDomains: Set<string>;
	adminEmails: Set<string>;
	userRoles: Record<string, AuthRole>;
	mode: 'configured' | 'restricted';
	defaultRole: AuthRole;
}

function normalizeRole(role: string | null | undefined): AuthRole {
	if (role === 'admin' || role === 'editor' || role === 'viewer') return role;
	return 'viewer';
}

function toLowerSet(input: unknown): Set<string> {
	if (!Array.isArray(input)) return new Set();
	return new Set(input.map((x) => String(x).trim().toLowerCase()).filter(Boolean));
}

function parseHashToRoleMap(input: unknown): Record<string, AuthRole> {
	if (!input) return {};

	if (Array.isArray(input)) {
		const map: Record<string, AuthRole> = {};
		for (let i = 0; i < input.length; i += 2) {
			const email = String(input[i] ?? '').trim().toLowerCase();
			const role = normalizeRole(String(input[i + 1] ?? ''));
			if (email) map[email] = role;
		}
		return map;
	}

	if (typeof input === 'object') {
		const map: Record<string, AuthRole> = {};
		for (const [email, role] of Object.entries(input as Record<string, unknown>)) {
			const normalizedEmail = email.trim().toLowerCase();
			if (normalizedEmail) map[normalizedEmail] = normalizeRole(String(role));
		}
		return map;
	}

	return {};
}

export async function getAuthzPolicyFromRedis(event: H3Event): Promise<AuthzPolicy> {
	const config = useRuntimeConfig(event);
	const prefix = String(config.authzRedisPrefix || 'msp:auth');
	return withRedisClient(event, async (client) => {
		const [allowedEmailsRaw, allowedDomainsRaw, adminEmailsRaw, userRolesRaw, modeRaw, defaultRoleRaw] = await Promise.all([
			client.sMembers(`${prefix}:allowed_emails`),
			client.sMembers(`${prefix}:allowed_domains`),
			client.sMembers(`${prefix}:admin_emails`),
			client.hGetAll(`${prefix}:user_roles`),
			client.get(`${prefix}:mode`),
			client.get(`${prefix}:default_role`),
		]);

		const mode = String(modeRaw || 'configured').trim().toLowerCase() === 'restricted' ? 'restricted' : 'configured';

		return {
			allowedEmails: toLowerSet(allowedEmailsRaw),
			allowedDomains: toLowerSet(allowedDomainsRaw),
			adminEmails: toLowerSet(adminEmailsRaw),
			userRoles: parseHashToRoleMap(userRolesRaw),
			mode,
			defaultRole: normalizeRole(defaultRoleRaw),
		};
	});
}
