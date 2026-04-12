<script lang="ts">
  // Self-contained demo guide page — no auth required
</script>

<svelte:head>
  <title>BG Clear — E-Commerce Portal Demo Guide</title>
  <meta name="description" content="Demo guide for Evans & Gina — BG Clear E-Commerce Portal walkthrough with screenshots and test credentials." />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="guide">

  <!-- ═══ HEADER ═══ -->
  <header class="guide-header">
    <div class="header-left">
      <div class="logo-mark">BG</div>
      <div>
        <h1>BG Clear — E-Commerce Portal</h1>
        <p class="header-subtitle">Demo Guide for Evans &amp; Gina</p>
      </div>
    </div>
    <div class="header-right">
      Prepared by Joe Stevens<br />
      April 2026
    </div>
  </header>

  <div class="content">

    <!-- ═══ SECTION 1: WHAT WE BUILT ═══ -->
    <h2 class="section-title">What We Built</h2>
    <div class="intro">
      We've built the e-commerce portal we discussed. It has <strong>three experiences</strong>: one for your pharmacy customers, one for your sales reps, and one for you and Gina to manage everything. Customers can browse your DME catalog, request quotes, and track orders — <strong>but they never see pricing</strong>. Your reps see the full pricing schedule with BG Cost, Target, and Suggested prices, and can build quotes with built-in guardrails. You control the products, pricing rules, users, and approvals from the admin panel.
    </div>

    <!-- ═══ SECTION 2: HOW TO TEST IT ═══ -->
    <h2 class="section-title">How to Test It</h2>
    <p class="section-intro">Log in at <strong><a href="/login" class="site-link">bg-clear-website.vercel.app/login</a></strong> with any of these test accounts:</p>

    <table class="login-table">
      <thead>
        <tr>
          <th>Role</th>
          <th>Email</th>
          <th>Password</th>
          <th>What You'll See</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <span class="role-badge role-customer">Customer</span>
            <span class="role-sub">Pharmacy Buyer</span>
          </td>
          <td><code>customer@demo.com</code></td>
          <td><code>demo1234</code></td>
          <td>Product catalog (no pricing), quote cart, order history</td>
        </tr>
        <tr>
          <td>
            <span class="role-badge role-rep">Sales Rep</span>
          </td>
          <td><code>rep@bgclear.com</code></td>
          <td><code>demo1234</code></td>
          <td>Pricing table, quote builder with guardrails, orders, commissions</td>
        </tr>
        <tr>
          <td>
            <span class="role-badge role-admin">Admin</span>
            <span class="role-sub">Evans &amp; Gina</span>
          </td>
          <td><code>admin@bgclear.com</code></td>
          <td><code>demo1234</code></td>
          <td>Product management, pricing rules, user management, approval queue</td>
        </tr>
      </tbody>
    </table>
    <p class="login-note">💡 Try each login to see the experience from each perspective. Start with Customer, then Rep, then Admin.</p>

    <!-- ═══ SECTION 3: CUSTOMER EXPERIENCE ═══ -->
    <h2 class="section-title">The Customer Experience</h2>
    <p class="section-intro">What your pharmacy customers see when they log in — clean, simple, pricing-free.</p>

    <div class="screenshots-grid two-col">
      <div class="screenshot-card">
        <img src="/demo-guide/01-login.png" alt="Login Page" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Login / Register</div>
          <div class="callout">Customers register with their pharmacy name and contact info. Clean, branded sign-in experience.</div>
        </div>
      </div>
      <div class="screenshot-card">
        <img src="/demo-guide/02-catalog.png" alt="Product Catalog" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Product Catalog</div>
          <div class="callout">37 products across 4 categories with search and filters. <strong>No pricing shown — by design.</strong></div>
        </div>
      </div>
      <div class="screenshot-card">
        <img src="/demo-guide/03-product-detail.png" alt="Product Detail" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Product Detail</div>
          <div class="callout">Customers see full specs, descriptions, and vendor info. They add items to their quote cart from here.</div>
        </div>
      </div>
      <div class="screenshot-card">
        <img src="/demo-guide/04-quote-cart.png" alt="Quote Cart" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Quote Cart</div>
          <div class="callout">They build a quote request and submit it. Your rep gets the request and can start pricing.</div>
        </div>
      </div>
    </div>

    <div class="screenshots-grid two-col" style="margin-top: 20px;">
      <div class="screenshot-card">
        <img src="/demo-guide/05-quote-history.png" alt="Quote History" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Quote History</div>
          <div class="callout">Customers track all their quote requests and see status updates as your rep works them.</div>
        </div>
      </div>
      <div class="screenshot-card">
        <img src="/demo-guide/15-order-history.png" alt="Order History" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Order History</div>
          <div class="callout">Full order tracking with status timeline — from placed to delivered.</div>
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 4: REP EXPERIENCE ═══ -->
    <h2 class="section-title">The Rep Experience</h2>
    <p class="section-intro">What your sales reps see — full pricing visibility, quote building tools, and commission tracking.</p>

    <div class="screenshots-grid two-col">
      <div class="screenshot-card">
        <img src="/demo-guide/06-rep-dashboard.png" alt="Rep Dashboard" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Rep Dashboard</div>
          <div class="callout">Reps see their assigned customers, pending quotes, active orders, and total commission at a glance.</div>
        </div>
      </div>
      <div class="screenshot-card">
        <img src="/demo-guide/07-pricing-table.png" alt="Pricing Table" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Pricing Table</div>
          <div class="callout">Every product with BG Cost, Target Price, Suggested Price, and Commission — auto-calculated from your schedule.</div>
        </div>
      </div>
    </div>

    <!-- MONEY SHOT -->
    <div class="money-shot">
      <div class="money-shot-header">
        ⭐ Quote Builder — The Core Pricing Workflow
      </div>
      <img src="/demo-guide/08-quote-builder.png" alt="Quote Builder with Guardrails" loading="lazy" />
      <div class="money-shot-caption">
        <p class="money-shot-text">
          Reps set prices within <strong>your guardrails</strong>. The system shows BG Cost, Target, and Suggested for each item. Commission updates in real-time as they adjust pricing.
        </p>
        <div class="guardrails">
          <div class="guardrail-item guardrail-green">🟢 <strong>Green</strong><br />At or above Suggested</div>
          <div class="guardrail-item guardrail-amber">🟡 <strong>Amber</strong><br />Between Target &amp; Suggested</div>
          <div class="guardrail-item guardrail-red">🔴 <strong>Red</strong><br />Below Target — needs your approval</div>
          <div class="guardrail-item guardrail-darkred">⛔ <strong>Dark Red</strong><br />At/below BG Cost — no commission</div>
        </div>
      </div>
    </div>

    <div class="screenshots-grid two-col" style="margin-top: 16px;">
      <div class="screenshot-card">
        <img src="/demo-guide/09-rep-orders.png" alt="Rep Orders" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Order Management</div>
          <div class="callout">Reps track orders through the full lifecycle with status filters and commission visibility per order.</div>
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 5: ADMIN EXPERIENCE ═══ -->
    <h2 class="section-title">The Admin Experience</h2>
    <p class="section-intro">Your command center — manage products, pricing, users, and approvals. No developer needed.</p>

    <div class="screenshots-grid two-col">
      <div class="screenshot-card">
        <img src="/demo-guide/10-admin-dashboard.png" alt="Admin Dashboard" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Admin Dashboard</div>
          <div class="callout">At-a-glance metrics: total products, active orders, pending approvals, and revenue. Plus quick links and activity feed.</div>
        </div>
      </div>
      <div class="screenshot-card">
        <img src="/demo-guide/11-product-management.png" alt="Product Management" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Product Management</div>
          <div class="callout">You and Gina can add, edit, and manage products directly. Full pricing visibility including vendor cost.</div>
        </div>
      </div>
      <div class="screenshot-card">
        <img src="/demo-guide/12-pricing-rules.png" alt="Pricing Rules" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Pricing Rules</div>
          <div class="callout">Your exact pricing schedule is built in. Change a percentage and <strong>every product recalculates automatically</strong>.</div>
        </div>
      </div>
      <div class="screenshot-card">
        <img src="/demo-guide/13-user-management.png" alt="User Management" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">User Management</div>
          <div class="callout">Assign reps to customers, change user roles, and manage your entire team from one place.</div>
        </div>
      </div>
    </div>

    <div class="screenshots-grid two-col" style="margin-top: 16px;">
      <div class="screenshot-card">
        <img src="/demo-guide/14-approval-queue.png" alt="Approval Queue" loading="lazy" />
        <div class="screenshot-caption">
          <div class="label">Approval Queue</div>
          <div class="callout">When a rep prices below target, the order lands here for your approval before it moves forward.</div>
        </div>
      </div>
    </div>

    <!-- ═══ SECTION 6: WHAT'S NEXT ═══ -->
    <h2 class="section-title">What's Next</h2>
    <ul class="next-list">
      <li>Real product images — we have placeholder images right now</li>
      <li>Email notifications when quotes come in and orders progress</li>
      <li>Salesforce integration for lead capture on registration</li>
      <li>Real Vive Health product catalog import</li>
      <li>Payment processing if you want customers to pay through the portal</li>
      <li>Mobile-optimized experience for reps in the field</li>
    </ul>

    <!-- ═══ CTA ═══ -->
    <div class="cta-footer">
      <p>
        Try it out and come to Tuesday's meeting with your questions and feedback.<br />
        We'll walk through everything together.
      </p>
    </div>

  </div>
</div>

<style>
  /* ── Reset for this page ── */
  .guide {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: var(--color-text, #1e293b);
    background: var(--color-surface, #ffffff);
    line-height: 1.5;
    font-size: 14px;
    min-height: 100vh;
  }

  /* ── Header ── */
  .guide-header {
    background: linear-gradient(135deg, #0f2744 0%, #1e3a5f 70%, #2a4a6f 100%);
    color: #fff;
    padding: 32px 48px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo-mark {
    width: 48px;
    height: 48px;
    background: #0d9488;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Montserrat', sans-serif;
    font-weight: 800;
    font-size: 20px;
    color: #fff;
    flex-shrink: 0;
  }
  .guide-header h1 {
    font-family: 'Montserrat', sans-serif;
    font-size: 24px;
    font-weight: 700;
    margin: 0;
  }
  .header-subtitle {
    font-size: 14px;
    opacity: 0.8;
    margin-top: 2px;
  }
  .header-right {
    text-align: right;
    font-size: 13px;
    opacity: 0.7;
  }

  /* ── Content ── */
  .content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 36px 48px 48px;
  }

  /* ── Section Titles ── */
  .section-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #1e3a5f;
    margin: 40px 0 12px;
    padding-bottom: 6px;
    border-bottom: 3px solid #0d9488;
    display: inline-block;
  }
  .section-title:first-of-type {
    margin-top: 0;
  }
  .section-intro {
    margin-bottom: 16px;
    font-size: 14px;
    color: #475569;
  }

  /* ── Intro Block ── */
  .intro {
    background: linear-gradient(135deg, #f0f9ff 0%, #ccfbf1 100%);
    border-left: 4px solid #0d9488;
    padding: 20px 24px;
    border-radius: 0 10px 10px 0;
    font-size: 14.5px;
    line-height: 1.7;
    margin-bottom: 28px;
    color: #1e293b;
  }

  /* ── Login Table ── */
  .login-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 8px;
    font-size: 13.5px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  }
  .login-table th {
    background: #1e3a5f;
    color: #fff;
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    font-size: 11.5px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .login-table td {
    padding: 14px 16px;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }
  .login-table tr:last-child td {
    border-bottom: none;
  }
  .login-table tr:nth-child(even) {
    background: #f8fafc;
  }
  .login-table code {
    background: #f1f5f9;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
    color: #1e3a5f;
  }
  .role-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .role-customer { background: #dbeafe; color: #1e40af; }
  .role-rep { background: #fef3c7; color: #92400e; }
  .role-admin { background: #fce7f3; color: #9d174d; }
  .role-sub {
    display: block;
    font-size: 11px;
    color: #64748b;
    margin-top: 4px;
  }
  .login-note {
    font-size: 13px;
    color: #64748b;
    margin-top: 10px;
    font-style: italic;
  }
  .site-link {
    color: #0d9488;
    text-decoration: none;
    font-weight: 600;
  }
  .site-link:hover {
    text-decoration: underline;
  }

  /* ── Screenshots Grid ── */
  .screenshots-grid {
    display: grid;
    gap: 20px;
    margin-top: 16px;
  }
  .screenshots-grid.two-col {
    grid-template-columns: 1fr 1fr;
  }
  .screenshot-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }
  .screenshot-card:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  .screenshot-card img {
    width: 100%;
    display: block;
    border-bottom: 1px solid #e2e8f0;
  }
  .screenshot-caption {
    padding: 12px 16px;
    background: #f8fafc;
  }
  .screenshot-caption .label {
    font-weight: 600;
    font-size: 13px;
    color: #1e3a5f;
    margin-bottom: 4px;
  }
  .screenshot-caption .callout {
    font-size: 12.5px;
    color: #64748b;
    line-height: 1.5;
  }

  /* ── Money Shot ── */
  .money-shot {
    border: 2px solid #0d9488;
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 4px 20px rgba(13, 148, 136, 0.15);
    margin: 20px 0;
  }
  .money-shot-header {
    background: linear-gradient(135deg, #0d9488, #0f766e);
    color: #fff;
    padding: 12px 20px;
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 15px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .money-shot img {
    width: 100%;
    display: block;
  }
  .money-shot-caption {
    padding: 18px 24px;
    background: linear-gradient(to bottom, #f0fdfa, #ffffff);
  }
  .money-shot-text {
    font-size: 13.5px;
    margin-bottom: 14px;
    color: #1e293b;
    line-height: 1.6;
  }
  .guardrails {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }
  .guardrail-item {
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 500;
    text-align: center;
    line-height: 1.4;
  }
  .guardrail-green { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .guardrail-amber { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .guardrail-red { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
  .guardrail-darkred { background: #fecaca; color: #7f1d1d; border: 1px solid #f87171; }

  /* ── What's Next ── */
  .next-list {
    list-style: none;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin: 16px 0;
  }
  .next-list li {
    padding: 14px 18px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    font-size: 13.5px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    transition: background 0.15s ease;
  }
  .next-list li:hover {
    background: #f0fdfa;
  }
  .next-list li::before {
    content: '→';
    color: #0d9488;
    font-weight: 700;
    flex-shrink: 0;
  }

  /* ── CTA Footer ── */
  .cta-footer {
    background: linear-gradient(135deg, #0f2744, #1e3a5f);
    color: #fff;
    padding: 28px 32px;
    border-radius: 14px;
    text-align: center;
    margin-top: 32px;
  }
  .cta-footer p {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.7;
    margin: 0;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .guide-header {
      padding: 24px 20px;
    }
    .content {
      padding: 24px 20px 36px;
    }
    .guide-header h1 {
      font-size: 20px;
    }
    .screenshots-grid.two-col {
      grid-template-columns: 1fr;
    }
    .guardrails {
      grid-template-columns: 1fr 1fr;
    }
    .next-list {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .guardrails {
      grid-template-columns: 1fr;
    }
    .guide-header {
      flex-direction: column;
      text-align: center;
    }
    .header-left {
      flex-direction: column;
    }
    .header-right {
      text-align: center;
    }
  }
</style>
