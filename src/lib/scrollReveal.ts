export type RevealOptions = {
	rootMargin?: string;
	threshold?: number;
	visibleClass?: string;
};

export function revealOnScroll(node: HTMLElement, opts: RevealOptions = {}) {
	const visibleClass = opts.visibleClass ?? 'is-visible';
	const rootMargin = opts.rootMargin ?? '0px 0px -10% 0px';
	const threshold = opts.threshold ?? 0.15;

	if (typeof window === 'undefined') return { destroy() {} };

	const prefersReducedMotion =
		window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	if (prefersReducedMotion) {
		node.classList.add(visibleClass);
		return { destroy() {} };
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					(node as HTMLElement).classList.add(visibleClass);
					io.unobserve(e.target);
				}
			}
		},
		{ root: null, rootMargin, threshold }
	);

	io.observe(node);

	return {
		destroy() {
			io.disconnect();
		}
	};
}
