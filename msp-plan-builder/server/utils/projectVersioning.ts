export function normalizeUpdatedAt(value: string | Date | null | undefined): string {
	if (!value) return '';
	if (value instanceof Date) return value.toISOString();
	return String(value).trim();
}

export function isProjectVersionMatch(
	expectedUpdatedAt: string | Date | null | undefined,
	currentUpdatedAt: string | Date | null | undefined,
): boolean {
	const expected = normalizeUpdatedAt(expectedUpdatedAt);
	if (!expected) return true;
	const current = normalizeUpdatedAt(currentUpdatedAt);
	return expected === current;
}
