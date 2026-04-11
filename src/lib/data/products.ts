export interface Product {
	slug: string;
	name: string;
	manufacturer: string;
	category: string;
	description: string;
	features: string[];
	pdacApproved: boolean;
	medicareEligible: boolean;
	hcpcsCode: string;
}

export interface Category {
	title: string;
	description: string;
}

export const categories: Record<string, Category> = {
	'health-monitoring': {
		title: 'Health Monitoring & Management',
		description:
			'FDA-compliant monitoring devices for chronic care management, telehealth, and patient vitals tracking.'
	},
	'mobility-safety': {
		title: 'Mobility & Safety Equipment',
		description:
			'Durable mobility aids and bathroom safety products built for daily use in clinical and home environments.'
	},
	'specialized-support': {
		title: 'Specialized Medical Support',
		description:
			'Respiratory therapy, sleep therapy, wound care, and hospital-grade support equipment for complex patient needs.'
	}
};

export const products: Product[] = [
	// ── Health Monitoring & Management ──────────────────────────────
	{
		slug: 'digital-blood-pressure-monitor',
		name: 'Digital Blood Pressure Monitor',
		manufacturer: 'Omron Healthcare',
		category: 'health-monitoring',
		description:
			'Clinical-grade upper-arm blood pressure monitor with Bluetooth connectivity for remote patient monitoring. Validated for accuracy against mercury sphygmomanometers and designed for both home and clinical use.',
		features: [
			'Clinically validated IntelliSense technology for accurate readings',
			'Bluetooth LE connectivity for RPM data transmission',
			'Irregular heartbeat detection with on-screen alert',
			'Wide-range cuff fits arms 9" to 17" circumference',
			'Stores up to 200 readings with date and time stamps',
			'FDA 510(k) cleared for clinical and home use'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'A4670'
	},
	{
		slug: 'wireless-glucometer-kit',
		name: 'Wireless Glucometer Kit',
		manufacturer: 'Roche Diagnostics',
		category: 'health-monitoring',
		description:
			'Complete blood glucose monitoring system with wireless data transfer and companion app integration. Requires minimal blood sample volume and delivers results in under 5 seconds.',
		features: [
			'Requires only 0.6 µL blood sample for accurate reading',
			'Results displayed in under 5 seconds',
			'Wireless sync to smartphone app and cloud portal',
			'Pre- and post-meal marker for trend tracking',
			'Strip ejector for hygienic, no-touch disposal',
			'Includes carrying case, lancing device, and 50 test strips'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E0607'
	},
	{
		slug: 'fingertip-pulse-oximeter',
		name: 'Fingertip Pulse Oximeter',
		manufacturer: 'Nonin Medical',
		category: 'health-monitoring',
		description:
			'Medical-grade fingertip pulse oximeter delivering accurate SpO2 and pulse rate readings. Engineered for patients with low perfusion and darker skin tones with proven clinical accuracy.',
		features: [
			'PureSAT signal processing for low-perfusion accuracy',
			'Clinically tested across diverse skin tones',
			'Bright dual-color OLED display with multi-view orientation',
			'10-second averaging for real-time SpO2 and pulse rate',
			'Over 6,000 readings on two AAA batteries',
			'Compact design with lanyard attachment point'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E0445'
	},
	{
		slug: 'rpm-telehealth-gateway',
		name: 'RPM Telehealth Gateway',
		manufacturer: 'Biobeat',
		category: 'health-monitoring',
		description:
			'Cellular-enabled hub that aggregates vitals from multiple monitoring devices and transmits data to provider dashboards. Designed for remote patient monitoring programs requiring real-time alerts.',
		features: [
			'Built-in 4G LTE cellular — no patient Wi-Fi needed',
			'Pairs with up to 8 Bluetooth peripherals simultaneously',
			'Real-time data push to EMR-integrated dashboards',
			'Configurable clinical alert thresholds per patient',
			'HIPAA-compliant end-to-end data encryption'
		],
		pdacApproved: false,
		medicareEligible: true,
		hcpcsCode: 'E2101'
	},
	{
		slug: 'infrared-thermometer-pro',
		name: 'Infrared Thermometer Pro',
		manufacturer: 'Braun',
		category: 'health-monitoring',
		description:
			'Professional no-touch infrared thermometer with instant readings and color-coded fever guidance. Ideal for high-volume screening in clinical environments.',
		features: [
			'No-contact forehead measurement from 1–2 inches',
			'Readings in under 2 seconds with audible confirmation',
			'Color-coded LCD: green (normal), yellow (elevated), red (fever)',
			'Memory stores last 30 readings with timestamps',
			'Silent mode for sleeping patients'
		],
		pdacApproved: true,
		medicareEligible: false,
		hcpcsCode: 'A4932'
	},
	{
		slug: 'continuous-glucose-monitor',
		name: 'Continuous Glucose Monitor',
		manufacturer: 'Dexcom',
		category: 'health-monitoring',
		description:
			'Real-time continuous glucose monitoring system with 10-day sensor wear and smartphone integration. Provides trend arrows, customizable alerts, and shareable data for care teams.',
		features: [
			'Real-time glucose readings every 5 minutes',
			'10-day sensor wear with single-button applicator',
			'Customizable high/low glucose alerts',
			'Trend arrows showing glucose direction and velocity',
			'Share data with up to 10 followers in real time',
			'Compatible with insulin pump integration systems'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E2103'
	},

	// ── Mobility & Safety Equipment ────────────────────────────────
	{
		slug: 'folding-rollator-walker',
		name: 'Folding Rollator Walker',
		manufacturer: 'Drive Medical',
		category: 'mobility-safety',
		description:
			'Four-wheel rollator with padded seat, ergonomic hand brakes, and one-hand fold mechanism. Built from lightweight aluminum for both indoor and outdoor use.',
		features: [
			'Lightweight aluminum frame weighing only 15 lbs',
			'Padded flip-up seat with integrated backrest',
			'Loop-lock ergonomic hand brakes on both handles',
			'One-hand side-fold mechanism for compact storage',
			'8-inch casters with front swivel for maneuverability',
			'Under-seat zippered storage pouch included'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'K0001'
	},
	{
		slug: 'lightweight-transport-wheelchair',
		name: 'Lightweight Transport Wheelchair',
		manufacturer: 'Invacare',
		category: 'mobility-safety',
		description:
			'Ultra-light companion-pushed wheelchair with swing-away footrests and fold-flat design. Weighs under 20 lbs for easy transport and storage in vehicles.',
		features: [
			'Weighs just 19 lbs with aluminum frame construction',
			'Swing-away, detachable footrests for easy transfers',
			'Fold-flat design fits in car trunks and closets',
			'Padded nylon upholstery — breathable and easy to clean',
			'Companion-push handles with rear wheel locks',
			'Supports up to 300 lbs with reinforced crossbrace'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'K0004'
	},
	{
		slug: 'adjustable-quad-cane',
		name: 'Adjustable Quad Cane',
		manufacturer: 'Hugo Mobility',
		category: 'mobility-safety',
		description:
			'Four-point base walking cane with height-adjustable shaft and cushioned grip. Provides superior stability on flat surfaces and stands upright when released.',
		features: [
			'Four-point base provides freestanding stability',
			'Height adjustable from 29" to 38" in 1-inch increments',
			'Cushioned ergonomic grip reduces hand fatigue',
			'Small footprint base fits on stairs and narrow paths',
			'Non-skid rubber tips on all four feet'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E0105'
	},
	{
		slug: 'hydraulic-patient-lift',
		name: 'Hydraulic Patient Lift',
		manufacturer: 'Hoyer',
		category: 'mobility-safety',
		description:
			'Manual hydraulic lift for safe patient transfers between bed, chair, and wheelchair. Features a wide base and 6-point spreader bar for secure, dignified repositioning.',
		features: [
			'400 lb weight capacity with reinforced hydraulic cylinder',
			'Adjustable-width base clears beds, chairs, and toilets',
			'6-point cradle spreader bar for sling compatibility',
			'Low-effort hydraulic pump with gradual lowering valve',
			'Dual rear-locking casters for transport and positioning',
			'Powder-coated steel frame resists corrosion'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E0630'
	},
	{
		slug: 'shower-transfer-bench',
		name: 'Shower Transfer Bench',
		manufacturer: 'Medline',
		category: 'mobility-safety',
		description:
			'Rust-proof aluminum shower bench spanning tub walls for safe seated transfers. Tool-free assembly with adjustable legs and non-slip seat surface.',
		features: [
			'Spans tub wall for stable slide-over transfers',
			'Blow-molded seat with drainage holes and non-slip texture',
			'Adjustable leg height from 17.5" to 22.5"',
			'Tool-free snap-button assembly in under 5 minutes',
			'Suction-cup feet grip tub and floor surfaces',
			'Supports up to 350 lbs'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E0247'
	},
	{
		slug: 'bed-assist-rail',
		name: 'Bed Assist Rail',
		manufacturer: 'Stander',
		category: 'mobility-safety',
		description:
			'Height-adjustable bed rail with ergonomic grip handle for support when getting in and out of bed. Fits between mattress and box spring with no tools required.',
		features: [
			'Slides between mattress and box spring — no tools needed',
			'Ergonomic foam-padded handle with 4 grip positions',
			'Height adjustable to match mattress thickness',
			'Safety strap anchors rail to bed frame for stability',
			'Supports up to 300 lbs of downward and lateral force'
		],
		pdacApproved: true,
		medicareEligible: false,
		hcpcsCode: 'E0310'
	},

	// ── Specialized Medical Support ────────────────────────────────
	{
		slug: 'compressor-nebulizer-system',
		name: 'Compressor Nebulizer System',
		manufacturer: 'Philips Respironics',
		category: 'specialized-support',
		description:
			'Tabletop compressor nebulizer delivering consistent particle size for effective deep-lung medication delivery. Quiet operation and durable motor designed for daily respiratory therapy.',
		features: [
			'SideStream nebulizer produces optimal 1–5 µm particle size',
			'Quiet operation at under 55 dBA for patient comfort',
			'Durable piston compressor rated for 5+ years of daily use',
			'Includes adult and pediatric masks plus mouthpiece',
			'5-year manufacturer warranty on compressor motor',
			'Easy-clean dishwasher-safe nebulizer cup'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E0570'
	},
	{
		slug: 'cpap-machine-with-humidifier',
		name: 'CPAP Machine with Humidifier',
		manufacturer: 'ResMed',
		category: 'specialized-support',
		description:
			'Auto-adjusting CPAP device with integrated heated humidifier and expiratory pressure relief. Tracks therapy data wirelessly and adjusts pressure breath-by-breath.',
		features: [
			'AutoSet algorithm adjusts pressure breath-by-breath',
			'Integrated HumidAir heated humidifier reduces dryness',
			'EPR expiratory pressure relief at 3 comfort levels',
			'Built-in cellular modem uploads nightly therapy data',
			'Whisper-quiet 26 dBA motor for undisturbed sleep',
			'SmartStart auto on/off when mask is donned or doffed'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E0601'
	},
	{
		slug: 'semi-electric-hospital-bed',
		name: 'Semi-Electric Hospital Bed',
		manufacturer: 'Invacare',
		category: 'specialized-support',
		description:
			'Full-length semi-electric hospital bed with powered head and foot adjustment via hand pendant. Manual-crank height adjustment and locking casters for home care environments.',
		features: [
			'Electric head and foot positioning via wired hand pendant',
			'Manual crank for bed height adjustment (7"–26" range)',
			'Universal mattress deck accepts standard hospital mattresses',
			'Four locking casters for safe repositioning',
			'Weight capacity of 450 lbs with reinforced steel frame',
			'Includes full-length side rails and IV pole socket'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E0260'
	},
	{
		slug: 'negative-pressure-wound-therapy',
		name: 'Negative Pressure Wound Therapy',
		manufacturer: 'KCI Medical',
		category: 'specialized-support',
		description:
			'Portable negative pressure wound therapy system promoting granulation tissue formation in chronic and acute wounds. Battery-operated for patient mobility with adjustable pressure settings.',
		features: [
			'Adjustable pressure from -25 to -200 mmHg',
			'Continuous and intermittent therapy modes',
			'Rechargeable battery lasts up to 18 hours per charge',
			'Compact 2.2 lb design for ambulatory patients',
			'TRAC pad technology for secure, leak-resistant seal',
			'Disposable canister with gel solidifier for easy handling'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E2402'
	},
	{
		slug: 'graduated-compression-stockings',
		name: 'Graduated Compression Stockings',
		manufacturer: 'Jobst',
		category: 'specialized-support',
		description:
			'Medical-grade graduated compression hosiery for venous insufficiency, lymphedema management, and DVT prevention. Available in multiple compression levels and sizes.',
		features: [
			'Graduated compression from ankle to thigh for venous return',
			'Available in 15–20, 20–30, and 30–40 mmHg levels',
			'Moisture-wicking fabric blend for all-day comfort',
			'Reinforced toe and heel zones for durability',
			'Silicone-dot top band prevents rolling and slippage'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'A6531'
	},
	{
		slug: 'bipap-auto-machine',
		name: 'BiPAP Auto Machine',
		manufacturer: 'Philips Respironics',
		category: 'specialized-support',
		description:
			'Bilevel positive airway pressure device with auto-adjusting inspiratory and expiratory pressures. Designed for patients requiring higher therapy pressures or those who cannot tolerate standard CPAP.',
		features: [
			'Auto-adjusting IPAP and EPAP for bilevel therapy',
			'Bi-Flex comfort technology eases pressure transitions',
			'Integrated heated humidifier with climate control',
			'Encore compliance data tracking with SD card and cellular',
			'Ramp feature gradually increases pressure at sleep onset',
			'Compatible with all standard heated and non-heated tubing'
		],
		pdacApproved: true,
		medicareEligible: true,
		hcpcsCode: 'E0471'
	}
];

/** Get all products belonging to a category slug */
export function getProductsByCategory(categorySlug: string): Product[] {
	return products.filter((p) => p.category === categorySlug);
}

/** Find a single product by its slug */
export function getProductBySlug(slug: string): Product | undefined {
	return products.find((p) => p.slug === slug);
}

/** Get related products (same category, excluding the given product) */
export function getRelatedProducts(product: Product, limit = 3): Product[] {
	return products
		.filter((p) => p.category === product.category && p.slug !== product.slug)
		.slice(0, limit);
}
