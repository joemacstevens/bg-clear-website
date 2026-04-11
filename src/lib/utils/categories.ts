import type { ProductCategory } from '$lib/database.types';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
	health_monitoring: 'Health Monitoring & Management',
	mobility_safety: 'Mobility & Safety',
	specialized_support: 'Specialized Medical Support',
	capital_equipment: 'Capital Medical Equipment'
};

export const CATEGORY_SHORT_LABELS: Record<ProductCategory, string> = {
	health_monitoring: 'Health Monitoring',
	mobility_safety: 'Mobility & Safety',
	specialized_support: 'Specialized Support',
	capital_equipment: 'Capital Equipment'
};

export const CATEGORY_COLORS: Record<ProductCategory, string> = {
	health_monitoring: '#0d9488',
	mobility_safety: '#2563eb',
	specialized_support: '#7c3aed',
	capital_equipment: '#b45309'
};

export function categoryLabel(cat: ProductCategory | string, short = false): string {
	return (short ? CATEGORY_SHORT_LABELS : CATEGORY_LABELS)[cat as ProductCategory] ?? cat;
}

export const CATEGORY_LIST: { value: ProductCategory; label: string }[] = [
	{ value: 'health_monitoring', label: 'Health Monitoring & Management' },
	{ value: 'mobility_safety', label: 'Mobility & Safety' },
	{ value: 'specialized_support', label: 'Specialized Medical Support' },
	{ value: 'capital_equipment', label: 'Capital Medical Equipment' }
];
