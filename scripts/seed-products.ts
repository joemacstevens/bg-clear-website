/**
 * Seed script — run with: npx tsx scripts/seed-products.ts
 * Populates the BG Clear product catalog from seed-products.json
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
	console.error('Missing env vars: PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
	console.error('Get the service role key from Supabase Dashboard > Settings > API');
	process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

interface SeedProduct {
	name: string;
	category: string;
	description: string;
	vendor: string;
	vendor_sku: string;
	vendor_cost: number;
	image_url: string | null;
	specs: Record<string, string>;
}

async function seed() {
	const seedPath = resolve(__dirname, '../src/lib/data/seed-products.json');
	const raw = readFileSync(seedPath, 'utf-8');
	const products: SeedProduct[] = JSON.parse(raw);

	console.log(`Seeding ${products.length} products...`);

	// Clear existing products
	const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
	if (deleteError) console.warn('Could not clear products:', deleteError.message);

	// Insert products
	const rows = products.map((p, i) => ({
		name: p.name,
		description: p.description,
		category: p.category,
		sku: `BGC-${String(i + 1).padStart(4, '0')}`,
		vendor_name: p.vendor,
		vendor_sku: p.vendor_sku,
		vendor_cost: p.vendor_cost,
		image_url: p.image_url,
		specs: p.specs,
		is_active: true,
		is_featured: i % 5 === 0 // Feature every 5th product
	}));

	const { data, error } = await supabase.from('products').insert(rows).select('id, name');

	if (error) {
		console.error('Seed error:', error.message);
		process.exit(1);
	}

	console.log(`Successfully seeded ${data.length} products:`);
	data.forEach((p) => console.log(`  - ${p.name}`));
}

seed();
