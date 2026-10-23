// Aerarium Treasury Application Controller
const API_BASE = '/api';

// Check Auth
const token = localStorage.getItem('aerarium_token');
const userStr = localStorage.getItem('aerarium_user');

if (!token) {
  window.location.href = '/login';
}

let currentUser = {};
try {
  currentUser = JSON.parse(userStr) || {};
} catch (e) {
  currentUser = { name: 'Elena Rostova', company: 'Helios Robotics & AI' };
}

// State
let treasury = {};
let subscriptions = [];
let leaks = [];

// DOM Elements
const userDisplayName = document.getElementById('user-display-name');
const userDisplayCompany = document.getElementById('user-display-company');
const btnSignout = document.getElementById('btn-signout');

const kpiRunwayMonths = document.getElementById('kpi-runway-months');
const kpiRunwayDays = document.getElementById('kpi-runway-days');
const kpiMonthlySpend = document.getElementById('kpi-monthly-spend');
const kpiAnnualRunrate = document.getElementById('kpi-annual-runrate');
const kpiCashBank = document.getElementById('kpi-cash-bank');
const kpiLeaksTotal = document.getElementById('kpi-leaks-total');
const kpiLeaksCount = document.getElementById('kpi-leaks-count');

const leakDiagnosticSection = document.getElementById('leak-diagnostic-section');
const leaksContainer = document.getElementById('leaks-container');
const subscriptionsTableBody = document.getElementById('subscriptions-table-body');

const btnToggleAdd = document.getElementById('btn-toggle-add');
const addDrawer = document.getElementById('add-drawer');
const btnCancelAdd = document.getElementById('btn-cancel-add');
const addToolForm = document.getElementById('add-tool-form');
const btnExportAudit = document.getElementById('btn-export-audit');

document.addEventListener('DOMContentLoaded', () => {
  if (userDisplayName && currentUser.name) {
    userDisplayName.textContent = currentUser.name;
    userDisplayCompany.textContent = `${currentUser.company || 'Enterprise'} • ${currentUser.role || 'CFO'}`;
  }

  fetchTreasurySummary();
  fetchSubscriptions();
  fetchLeaks();
  setupEventListeners();

  if (window.lucide) {
    lucide.createIcons();
  }
});

function setupEventListeners() {
  btnSignout.addEventListener('click', () => {
    localStorage.removeItem('aerarium_token');
    localStorage.removeItem('aerarium_user');
    window.location.href = '/';
  });

  btnToggleAdd.addEventListener('click', () => {
    addDrawer.classList.toggle('open');
    if (addDrawer.classList.contains('open')) {
      document.getElementById('tool-name').focus();
    }
  });

  btnCancelAdd.addEventListener('click', () => {
    addDrawer.classList.remove('open');
    addToolForm.reset();
  });

  addToolForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('tool-name').value.trim();
    const vendor = document.getElementById('tool-vendor').value.trim();
    const cost = parseFloat(document.getElementById('tool-cost').value);
    const category = document.getElementById('tool-category').value;
    const seats_purchased = parseInt(document.getElementById('tool-seats-purchased').value) || 1;
    const seats_active = parseInt(document.getElementById('tool-seats-active').value) || 1;

    if (!name || isNaN(cost)) return;

    try {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, vendor, cost, category, seats_purchased, seats_active })
      });
      const data = await res.json();
      if (data.success) {
        addDrawer.classList.remove('open');
        addToolForm.reset();
        await fetchSubscriptions();
        await fetchLeaks();
        await fetchTreasurySummary();
      }
    } catch (err) {
      alert('Error recording subscription contract');
    }
  });

  // Export Board Audit
  btnExportAudit.addEventListener('click', () => {
    if (!treasury.cash_in_bank) return;

    const summaryText = [
      `# AERARIUM TREASURY & RUNWAY AUDIT`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Company: ${currentUser.company || 'Company'}`,
      `Auditor: ${currentUser.name || 'CFO'}`,
      ``,
      `## 1. Capital Runway Overview`,
      `- Liquid Cash in Bank: $${treasury.cash_in_bank.toLocaleString()}`,
      `- Gross Monthly Burn: $${treasury.gross_monthly_burn.toLocaleString()}/mo`,
      `- SaaS Software Spend: $${treasury.saas_monthly_burn.toLocaleString()}/mo (${Math.round((treasury.saas_monthly_burn / treasury.gross_monthly_burn) * 100)}% of total burn)`,
      `- Current Survival Runway: ${treasury.runway_months} Months (${treasury.runway_days} Days)`,
      ``,
      `## 2. Reclaimable Software Waste`,
      `- Active Spend Leaks: ${treasury.active_leaks_count} flagged items`,
      `- Immediate Reclaimable Value: $${treasury.identified_savings.toLocaleString()}/mo ($${Math.round(treasury.identified_savings * 12).toLocaleString()}/yr)`,
      `- Projected Runway After Reclamation: +${(treasury.identified_savings / (treasury.net_monthly_burn || 1) * 30.4).toFixed(0)} Days of additional runway`,
      ``,
      `Generated by Aerarium Sovereign Treasury Engine.`
    ].join('\n');

    navigator.clipboard.writeText(summaryText);
    alert('✅ Board Audit copied to clipboard in clean Markdown format! Ready to paste into Slack, Notion, or pitch decks.');
  });
}

// Fetch Treasury Summary
async function fetchTreasurySummary() {
  try {
    const res = await fetch(`${API_BASE}/treasury/summary`);
    const json = await res.json();
    if (json.success) {
      treasury = json.data;

      kpiRunwayMonths.textContent = `${treasury.runway_months} Mo`;
      kpiRunwayDays.textContent = `~${treasury.runway_days} Days of capital buffer`;
      kpiMonthlySpend.textContent = `$${treasury.saas_monthly_burn.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      kpiAnnualRunrate.textContent = `$${treasury.annualized_saas_burn.toLocaleString()}/yr run-rate`;
      kpiCashBank.textContent = `$${treasury.cash_in_bank.toLocaleString()}`;
      kpiLeaksTotal.textContent = `$${treasury.identified_savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo`;
      kpiLeaksCount.textContent = `${treasury.active_leaks_count} immediate savings actions`;
    }
  } catch (err) {
    console.error('Failed to load treasury summary:', err);
  }
}

// Fetch Subscriptions
async function fetchSubscriptions() {
  try {
    const res = await fetch(`${API_BASE}/subscriptions`);
    const json = await res.json();
    if (json.success) {
      subscriptions = json.data;
      renderSubscriptions();
    }
  } catch (err) {
    subscriptionsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #EF4444; padding: 2rem;">Failed to load subscriptions.</td></tr>`;
  }
}

function renderSubscriptions() {
  if (subscriptions.length === 0) {
    subscriptionsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">No subscriptions recorded yet.</td></tr>`;
    return;
  }

  subscriptionsTableBody.innerHTML = subscriptions.map(sub => {
    const isActive = sub.status === 'active';
    const hasLeak = sub.active_leaks_count > 0;
    const utilization = sub.usage_pct || 100;
    const utilColor = utilization < 50 ? '#EF4444' : (utilization < 75 ? '#F59E0B' : '#10B981');

    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: white; display: flex; align-items: center; gap: 0.5rem;">
            ${escapeHtml(sub.name)}
            ${hasLeak ? `<span style="background: rgba(245, 158, 11, 0.2); border: 1px solid rgba(245, 158, 11, 0.4); color: #F59E0B; font-size: 0.65rem; padding: 0.15rem 0.5rem; border-radius: 9999px; font-weight: 800;">LEAK FLAGGED</span>` : ''}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.2rem;">${escapeHtml(sub.vendor)}</div>
        </td>
        <td>
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em;">
            ${sub.category}
          </span>
        </td>
        <td>
          <span style="font-family: var(--font-mono); font-weight: 700; color: white;">
            $${sub.cost.toFixed(2)}
          </span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">/mo</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="flex: 1; max-width: 70px; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 9999px; overflow: hidden;">
              <div style="width: ${utilization}%; height: 100%; background: ${utilColor};"></div>
            </div>
            <span style="font-size: 0.75rem; font-family: var(--font-mono); font-weight: 700; color: ${utilColor};">
              ${sub.seats_active}/${sub.seats_purchased} (${utilization}%)
            </span>
          </div>
        </td>
        <td>
          <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">
            ${sub.next_billing_date}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem;">
            <button onclick="toggleSubscriptionStatus(${sub.id})" class="${isActive ? 'pill-active' : 'pill-paused'}">
              ${isActive ? 'Active' : 'Paused'}
            </button>
            <button onclick="deleteSubscription(${sub.id})" style="background: transparent; border: none; color: #64748B; cursor: pointer; padding: 0.35rem;" title="Delete Contract">
              <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

// Toggle Subscription
async function toggleSubscriptionStatus(id) {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/${id}/toggle`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      await fetchSubscriptions();
      await fetchLeaks();
      await fetchTreasurySummary();
    }
  } catch (err) {
    console.error('Toggle status failed:', err);
  }
}

// Delete Subscription
async function deleteSubscription(id) {
  if (!confirm('Remove this subscription from your treasury tracking?')) return;

  try {
    const res = await fetch(`${API_BASE}/subscriptions/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      await fetchSubscriptions();
      await fetchLeaks();
      await fetchTreasurySummary();
    }
  } catch (err) {
    alert('Failed to delete subscription');
  }
}

// Fetch Leaks
async function fetchLeaks() {
  try {
    const res = await fetch(`${API_BASE}/leaks`);
    const json = await res.json();
    if (json.success) {
      leaks = json.data;
      renderLeaks();
    }
  } catch (err) {
    console.error('Failed to load leaks:', err);
  }
}

function renderLeaks() {
  if (leaks.length === 0) {
    leakDiagnosticSection.style.display = 'none';
    return;
  }
  leakDiagnosticSection.style.display = 'block';

  leaksContainer.innerHTML = leaks.map(leak => `
    <div class="leak-row">
      <div>
        <div style="font-weight: 700; color: white; font-size: 0.95rem;">
          ${escapeHtml(leak.subscription_name)} — <span style="color: #F59E0B; font-family: var(--font-mono);">Save $${leak.potential_savings.toFixed(2)}/mo</span>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.5;">
          ${escapeHtml(leak.reason)}
        </p>
      </div>

      <div>
        <button onclick="claimSavings(${leak.id})" class="btn-reclaim">
          Claim Savings (Downgrade)
        </button>
      </div>
    </div>
  `).join('');
}

// Claim Savings
async function claimSavings(leakId) {
  try {
    const res = await fetch(`${API_BASE}/leaks/${leakId}/resolve`, { method: 'PATCH' });
    const data = await res.json();
    if (data.success) {
      await fetchLeaks();
      await fetchSubscriptions();
      await fetchTreasurySummary();
    }
  } catch (err) {
    console.error('Failed to claim savings:', err);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}
