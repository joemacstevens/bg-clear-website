const currencyFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateFmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('en-US', {
	month: 'short', day: 'numeric', year: 'numeric',
	hour: 'numeric', minute: '2-digit'
});

export function formatCurrency(amount: number): string {
	return currencyFmt.format(amount);
}

export function formatDate(date: string | Date): string {
	return dateFmt.format(typeof date === 'string' ? new Date(date) : date);
}

export function formatDateTime(date: string | Date): string {
	return dateTimeFmt.format(typeof date === 'string' ? new Date(date) : date);
}

export function formatPercentage(value: number, decimals = 0): string {
	return `${value.toFixed(decimals)}%`;
}

export function formatOrderNumber(num: string): string {
	return num.startsWith('BGC-') ? num : `BGC-${num}`;
}
