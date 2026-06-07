<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	// All categories as parent options (name with a marker for top-level)
	const parentOptions = $derived(
		(data.flat ?? [])
			.slice()
			.sort((a: any, b: any) => a.name.localeCompare(b.name))
			.map((c: any) => ({ id: c.id, name: c.name }))
	);

	function count(id: string): number {
		return data.counts?.[id] ?? 0;
	}
</script>

<svelte:head><title>Categories | BG Clear Admin</title></svelte:head>

<div class="page">
	<div class="head">
		<div>
			<h1>Browse Categories</h1>
			<p class="sub">Manage the storefront category tree. (Separate from pricing categories.)</p>
		</div>
		<a class="back" href="/admin">← Admin</a>
	</div>

	{#if form?.error}<div class="err">{form.error}</div>{/if}

	<section class="add-card">
		<h2>Add category</h2>
		<form method="POST" action="?/create" use:enhance class="add-form">
			<input name="name" placeholder="Category name" required />
			<select name="parent_id">
				<option value="">— Top level —</option>
				{#each parentOptions as p}
					<option value={p.id}>{p.name}</option>
				{/each}
			</select>
			<input name="sort_order" type="number" value="50" min="0" style="width:90px" title="Sort order" />
			<button type="submit">Add</button>
		</form>
	</section>

	<div class="tree">
		{#each data.tree as top (top.id)}
			<div class="top-group">
				<div class="cat-row top">
					{@render row(top)}
				</div>
				{#each top.children as child (child.id)}
					<div class="cat-row child">
						{@render row(child)}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>

{#snippet row(cat: any)}
	<form method="POST" action="?/update" use:enhance class="row-form">
		<input type="hidden" name="id" value={cat.id} />
		<input class="name" name="name" value={cat.name} />
		<span class="cnt">{count(cat.id)} item{count(cat.id) !== 1 ? 's' : ''}</span>
		<label class="parent-lbl">
			Parent
			<select name="parent_id">
				<option value="" selected={!cat.parent_id}>— Top —</option>
				{#each parentOptions as p}
					{#if p.id !== cat.id}
						<option value={p.id} selected={cat.parent_id === p.id}>{p.name}</option>
					{/if}
				{/each}
			</select>
		</label>
		<input class="sort" name="sort_order" type="number" value={cat.sort_order} min="0" title="Sort" />
		<label class="active-lbl">
			<input type="checkbox" name="is_active" checked={cat.is_active} /> active
		</label>
		<button type="submit" class="save">Save</button>
	</form>
	<form method="POST" action="?/remove" use:enhance class="rm-form">
		<input type="hidden" name="id" value={cat.id} />
		<button type="submit" class="rm" title="Delete">✕</button>
	</form>
{/snippet}

<style>
	.page {
		padding-bottom: var(--space-8);
	}
	.head {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--space-4);
	}
	h1 {
		font-family: var(--font-heading);
		font-size: var(--text-h2);
		font-weight: 700;
		color: var(--color-ink);
		margin: 0;
	}
	.sub {
		color: var(--color-muted);
		font-size: var(--text-small);
		margin: var(--space-1) 0 0;
	}
	.back {
		color: var(--color-primary);
		text-decoration: none;
		font-size: var(--text-small);
		font-weight: 600;
	}
	.err {
		background: #fdecea;
		color: #b3261e;
		border: 1px solid #f5c2c0;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		margin-bottom: var(--space-3);
		font-size: var(--text-small);
	}

	.add-card {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--space-3);
		margin-bottom: var(--space-4);
	}
	.add-card h2 {
		font-size: 1rem;
		font-family: var(--font-heading);
		margin: 0 0 var(--space-2);
		color: var(--color-ink);
	}
	.add-form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		align-items: center;
	}
	.add-form input,
	.add-form select,
	.row-form input,
	.row-form select {
		padding: 0.45rem 0.6rem;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		font-size: var(--text-small);
		font-family: var(--font-body);
	}
	.add-form input[name='name'] {
		flex: 1;
		min-width: 180px;
	}
	.add-form button,
	.row-form .save {
		padding: 0.5rem 1rem;
		background: var(--color-primary);
		color: #fff;
		border: none;
		border-radius: var(--radius-sm);
		font-weight: 600;
		font-size: var(--text-small);
		cursor: pointer;
	}

	.top-group {
		margin-bottom: var(--space-3);
	}
	.cat-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.4rem 0.5rem;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		margin-bottom: 0.3rem;
	}
	.cat-row.top {
		border-left: 4px solid var(--color-primary);
		font-weight: 600;
	}
	.cat-row.child {
		margin-left: 1.5rem;
	}
	.row-form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		flex-wrap: wrap;
	}
	.row-form .name {
		flex: 1;
		min-width: 160px;
		font-weight: 600;
	}
	.cnt {
		font-size: 0.7rem;
		color: var(--color-muted);
		white-space: nowrap;
	}
	.parent-lbl,
	.active-lbl {
		font-size: 0.7rem;
		color: var(--color-muted);
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	.row-form .sort {
		width: 64px;
	}
	.rm-form {
		display: inline;
	}
	.rm {
		background: none;
		border: none;
		color: #b3261e;
		font-size: 1rem;
		cursor: pointer;
		padding: 0.3rem 0.5rem;
	}
</style>
