<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import heroArt from '$lib/assets/hero-distribution.svg';
	import * as THREE from 'three';

	// Brand palette (from logo)
	const COLORS = {
		navy: 0x00385e,
		deepNavy: 0x002b4a,
		gold: 0xd69a1b,
		offWhite: 0xf7f8fa
	};

	type Tile = { label: string };
	const tiles: Tile[] = [
		{ label: 'Blood pressure monitors' },
		{ label: 'Glucometers / diabetes tools' },
		{ label: 'Pulse oximeters' },
		{ label: 'Thermometers' },
		{ label: 'Wheelchairs (manual + transport)' }
	];

	let hostEl: HTMLDivElement | null = null;
	let canvasEl: HTMLCanvasElement | null = null;
	let webglOk = true;

	let reducedMotion = false;

	// Pointer/parallax state
	let targetX = 0;
	let targetY = 0;
	let currentX = 0;
	let currentY = 0;

	function detectWebGL(): boolean {
		try {
			const c = document.createElement('canvas');
			return !!(
				c.getContext('webgl2', { antialias: true }) ||
				c.getContext('webgl', { antialias: true }) ||
				c.getContext('experimental-webgl')
			);
		} catch {
			return false;
		}
	}

	function clamp(n: number, min: number, max: number) {
		return Math.max(min, Math.min(max, n));
	}

	onMount(() => {
		reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;

		if (!detectWebGL()) {
			webglOk = false;
			return;
		}
		if (!hostEl || !canvasEl) return;

		// Scene
		const scene = new THREE.Scene();
		scene.background = new THREE.Color(COLORS.offWhite);
		scene.fog = new THREE.Fog(COLORS.offWhite, 6, 18);

		const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
		camera.position.set(0.0, 1.35, 6.9);
		camera.lookAt(0, 0.7, 0);

		const renderer = new THREE.WebGLRenderer({
			canvas: canvasEl,
			alpha: true,
			antialias: true,
			powerPreference: 'high-performance'
		});
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// Lighting (soft + premium)
		const ambient = new THREE.AmbientLight(0xffffff, 0.7);
		scene.add(ambient);

		const key = new THREE.DirectionalLight(0xffffff, 1.0);
		key.position.set(3.5, 5.5, 4.0);
		key.castShadow = true;
		key.shadow.mapSize.set(1024, 1024);
		key.shadow.camera.near = 0.1;
		key.shadow.camera.far = 30;
		key.shadow.camera.left = -6;
		key.shadow.camera.right = 6;
		key.shadow.camera.top = 6;
		key.shadow.camera.bottom = -6;
		scene.add(key);

		const rim = new THREE.DirectionalLight(COLORS.gold, 0.35);
		rim.position.set(-4.5, 3.0, -6.0);
		scene.add(rim);

		// Ground
		const floorGeo = new THREE.PlaneGeometry(16, 14);
		const floorMat = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			roughness: 0.95,
			metalness: 0.0
		});
		const floor = new THREE.Mesh(floorGeo, floorMat);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -0.35;
		floor.receiveShadow = true;
		scene.add(floor);

		// Back wall
		const wallGeo = new THREE.PlaneGeometry(16, 8);
		const wallMat = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			roughness: 1.0
		});
		const wall = new THREE.Mesh(wallGeo, wallMat);
		wall.position.set(0, 2.1, -5.2);
		wall.receiveShadow = true;
		scene.add(wall);

		// Minimal pillars
		const pillarGeo = new THREE.BoxGeometry(0.22, 3.8, 0.22);
		const pillarMat = new THREE.MeshStandardMaterial({
			color: COLORS.deepNavy,
			roughness: 0.6,
			metalness: 0.05
		});
		const p1 = new THREE.Mesh(pillarGeo, pillarMat);
		p1.position.set(-3.2, 1.45, -2.8);
		p1.castShadow = true;
		p1.receiveShadow = true;
		scene.add(p1);
		const p2 = p1.clone();
		p2.position.set(3.2, 1.45, -2.2);
		scene.add(p2);

		// Cards group
		const cards = new THREE.Group();
		scene.add(cards);

		const cardGeo = new THREE.PlaneGeometry(2.1, 1.25, 1, 1);
		const cardMat = new THREE.MeshStandardMaterial({
			color: 0xffffff,
			roughness: 0.4,
			metalness: 0.02
		});

		const positions = [
			{ x: -2.2, y: 1.25, z: 0.0, r: 0.08 },
			{ x: -1.1, y: 0.95, z: 0.4, r: 0.05 },
			{ x: 0.0, y: 1.15, z: 0.6, r: 0.0 },
			{ x: 1.1, y: 0.95, z: 0.4, r: -0.05 },
			{ x: 2.2, y: 1.25, z: 0.0, r: -0.08 }
		];

		const cardMeshes: THREE.Mesh[] = [];
		for (let i = 0; i < tiles.length; i++) {
			const m = new THREE.Mesh(cardGeo, cardMat.clone());
			m.position.set(positions[i].x, positions[i].y, positions[i].z);
			m.rotation.y = positions[i].r;
			m.castShadow = true;
			m.receiveShadow = true;
			cards.add(m);
			cardMeshes.push(m);

			// subtle navy outline via a second plane slightly behind
			const outline = new THREE.Mesh(
				new THREE.PlaneGeometry(2.14, 1.29),
				new THREE.MeshBasicMaterial({
					color: COLORS.navy,
					transparent: true,
					opacity: 0.08
				})
			);
			outline.position.set(0, 0, -0.01);
			m.add(outline);
		}

		// Gold swoosh (thin arc)
		const swooshGeo = new THREE.TorusGeometry(2.6, 0.03, 12, 120, Math.PI * 0.82);
		const swooshMat = new THREE.MeshStandardMaterial({
			color: COLORS.gold,
			roughness: 0.35,
			metalness: 0.25,
			emissive: new THREE.Color(COLORS.gold),
			emissiveIntensity: 0.05
		});
		const swoosh = new THREE.Mesh(swooshGeo, swooshMat);
		swoosh.position.set(0, 0.75, -0.4);
		swoosh.rotation.set(Math.PI / 2.25, 0, Math.PI);
		swoosh.castShadow = false;
		scene.add(swoosh);

		// Resize handling
		const ro = new ResizeObserver(() => {
			if (!hostEl) return;
			const w = hostEl.clientWidth;
			const h = hostEl.clientHeight;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();

			// cap DPR for mobile perf
			const dpr = clamp(window.devicePixelRatio || 1, 1, 1.5);
			renderer.setPixelRatio(dpr);
			renderer.setSize(w, h, false);
		});
		ro.observe(hostEl);

		function onPointerMove(clientX: number, clientY: number) {
			if (!hostEl) return;
			const r = hostEl.getBoundingClientRect();
			const nx = ((clientX - r.left) / r.width) * 2 - 1;
			const ny = ((clientY - r.top) / r.height) * 2 - 1;
			targetX = clamp(nx, -1, 1);
			targetY = clamp(ny, -1, 1);
		}

		function onMouseMove(e: MouseEvent) {
			onPointerMove(e.clientX, e.clientY);
		}
		function onTouchMove(e: TouchEvent) {
			const t = e.touches?.[0];
			if (t) onPointerMove(t.clientX, t.clientY);
		}

		if (!reducedMotion) {
			hostEl.addEventListener('mousemove', onMouseMove, { passive: true });
			hostEl.addEventListener('touchmove', onTouchMove, { passive: true });
		}

		let raf = 0;
		const clock = new THREE.Clock();

		function render() {
			raf = requestAnimationFrame(render);
			const t = clock.getElapsedTime();

			// smooth pointer (low-pass)
			currentX += (targetX - currentX) * 0.05;
			currentY += (targetY - currentY) * 0.05;

			// camera parallax (subtle)
			camera.position.x = currentX * 0.42;
			camera.position.y = 1.35 + currentY * -0.22;
			camera.lookAt(0, 0.8, 0);

			// gentle idle float
			cards.rotation.y = currentX * 0.08;
			cards.position.y = Math.sin(t * 0.6) * 0.04;
			swoosh.rotation.z = Math.sin(t * 0.35) * 0.03;
			for (let i = 0; i < cardMeshes.length; i++) {
				const m = cardMeshes[i];
				m.position.y = positions[i].y + Math.sin(t * 0.9 + i * 0.8) * 0.06;
				m.rotation.x = Math.sin(t * 0.7 + i * 0.55) * 0.02 + currentY * -0.04;
			}

			renderer.render(scene, camera);
		}

		try {
			if (!reducedMotion) render();
			else renderer.render(scene, camera);
		} catch {
			webglOk = false;
		}

		onDestroy(() => {
			cancelAnimationFrame(raf);
			ro.disconnect();
			hostEl?.removeEventListener('mousemove', onMouseMove);
			hostEl?.removeEventListener('touchmove', onTouchMove);

			// Dispose
			for (const child of scene.children) {
				// noop, we dispose explicit below
			}
			floorGeo.dispose();
			floorMat.dispose();
			wallGeo.dispose();
			wallMat.dispose();
			pillarGeo.dispose();
			pillarMat.dispose();
			cardGeo.dispose();
			cardMeshes.forEach((m) => {
				const mat = m.material as THREE.Material;
				mat.dispose();
			});
			swooshGeo.dispose();
			swooshMat.dispose();
			renderer.dispose();
		});
	});
</script>

<div class="wrap" bind:this={hostEl} aria-hidden="true">
	{#if webglOk}
		<canvas class="canvas" bind:this={canvasEl}></canvas>
		<!-- Overlay labels (keeps text crisp, avoids 3D text complexity) -->
		<div class="labels">
			{#each tiles as t, i}
				<div class="label label-{i}">
					<span class="dot"></span>
					<span class="text">{t.label}</span>
				</div>
			{/each}
		</div>
	{:else}
		<img class="fallback" src={heroArt} alt="" loading="eager" />
	{/if}
</div>

<style>
	.wrap {
		position: relative;
		width: 100%;
		aspect-ratio: 1 / 1;
		min-height: 340px;
		max-height: 520px;
		border-radius: 28px;
		overflow: hidden;
		background:
			radial-gradient(1200px 600px at 80% 10%, rgba(214, 154, 27, 0.14), transparent 55%),
			linear-gradient(180deg, rgba(0, 56, 94, 0.06), rgba(247, 248, 250, 0) 55%);
		box-shadow: 0 28px 70px rgba(0, 0, 0, 0.16);
		border: 1px solid rgba(0, 56, 94, 0.12);
	}

	.canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		display: block;
	}

	.fallback {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 12px;
	}

	.labels {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.label {
		position: absolute;
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 10px 12px;
		border-radius: 999px;
		background: rgba(247, 248, 250, 0.9);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(0, 56, 94, 0.14);
		box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
		color: rgb(0, 43, 74);
		font-size: 13px;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.dot {
		width: 9px;
		height: 9px;
		border-radius: 999px;
		background: rgb(214, 154, 27);
		box-shadow: 0 0 0 4px rgba(214, 154, 27, 0.18);
	}

	/* positions tuned for both desktop + mobile */
	.label-0 { left: 10%; top: 24%; }
	.label-1 { left: 8%; top: 52%; }
	.label-2 { left: 36%; top: 68%; }
	.label-3 { right: 8%; top: 52%; }
	.label-4 { right: 10%; top: 24%; }

	@media (max-width: 900px) {
		.wrap {
			max-height: 560px;
			min-height: 360px;
		}
		.label { font-size: 12.5px; }
		.label-0 { left: 8%; top: 20%; }
		.label-1 { left: 6%; top: 58%; }
		.label-2 { left: 24%; top: 76%; }
		.label-3 { right: 6%; top: 58%; }
		.label-4 { right: 8%; top: 20%; }
	}

	@media (prefers-reduced-motion: reduce) {
		.wrap { scroll-behavior: auto; }
	}
</style>
