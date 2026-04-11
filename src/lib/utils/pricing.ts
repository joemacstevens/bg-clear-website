/**
 * Pricing computation utilities.
 * Mirrors the SQL logic in the product_pricing view.
 */

export function computeBgCost(vendorCost: number, marginReservePct: number): number {
	return Math.round(vendorCost * (1 + marginReservePct / 100) * 100) / 100;
}

export function computeTargetPrice(bgCost: number, markupToTargetPct: number): number {
	return Math.round(bgCost * (1 + markupToTargetPct / 100) * 100) / 100;
}

export function computeSuggestedPrice(targetPrice: number, suggestedPremiumPct: number): number {
	return Math.round(targetPrice * (1 + suggestedPremiumPct / 100) * 100) / 100;
}

export function computeCommission(
	unitPrice: number,
	bgCost: number,
	targetPrice: number,
	commissionAtTargetPct: number,
	commissionAboveTargetPct: number
): number {
	const markupDollars = Math.max(0, Math.min(unitPrice, targetPrice) - bgCost);
	const aboveTargetDollars = Math.max(0, unitPrice - targetPrice);
	return Math.round(
		(markupDollars * commissionAtTargetPct / 100 +
		aboveTargetDollars * commissionAboveTargetPct / 100) * 100
	) / 100;
}

export function isPriceBelowTarget(unitPrice: number, targetPrice: number): boolean {
	return unitPrice < targetPrice;
}

export function isPriceBelowBgCost(unitPrice: number, bgCost: number): boolean {
	return unitPrice <= bgCost;
}

export function priceGuardrailLevel(
	unitPrice: number,
	bgCost: number,
	targetPrice: number,
	suggestedPrice: number
): 'suggested' | 'above-target' | 'at-target' | 'below-target' | 'below-cost' {
	if (unitPrice >= suggestedPrice) return 'suggested';
	if (unitPrice > targetPrice) return 'above-target';
	if (unitPrice === targetPrice) return 'at-target';
	if (unitPrice > bgCost) return 'below-target';
	return 'below-cost';
}
