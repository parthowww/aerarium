// AuraFlow Frontend Controller
const API_BASE = '/api';

let subscriptions = [];
let leaks = [];
let cashflow = {};

// DOM Elements
const subscriptionsTableBody = document.getElementById('subscriptions-table-body');
const leaksListContainer = document.getElementById('leaks-list-container');
const leaksCardWrapper = document.getElementById('leaks-card-wrapper');
const metricMonthly = document.getElementById('metric-monthly');
const metricAnnualized = document.getElementById('metric-annualized');
const metricRunway = document.getElementById('metric-runway');
const metricReserves = document.getElementById('metric-reserves');
const metricLeaks = document.getElementById('metric-leaks');
const metricLeaksCount = document.getElementById('metric-leaks-count');
const metricToolsCount = document.getElementById('metric-tools-count');
const runwayText = document.getElementById('runway-text');

const toggleAddSubBtn = document.getElementById('toggle-add-sub-btn');
const addSubDrawer = document.getElementById('add-sub-drawer');
const addSubForm = document.getElementById('add-sub-form');
const cancelAddSubBtn = document.getElementById('cancel-add-sub-btn');

document.addEventListener('DOMContentLoaded', () => {
  fetchCashflowSummary();
  fetchSubscriptions();
  fetchLeaks();
  setupEventListeners();

  if (window.lucide) {
    lucide.createIcons();
  }
});

function setupEventListeners() {
  toggleAddSubBtn.addEventListener('click', () => {
    addSubDrawer.classList.toggle('open');
    if (addSubDrawer.classList.contains('open')) {
      document.getElementById('sub-name').focus();
    }
  });

  cancelAddSubBtn.addEventListener('click', () => {
    addSubDrawer.classList.remove('open');
    addSubForm.reset();
  });

  addSubForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('sub-name').value.trim();
    const vendor = document.getElementById('sub-vendor').value.trim();
    const cost = parseFloat(document.getElementById('sub-cost').value);
    const category = document.getElementById('sub-category').value;

    if (!name || isNaN(cost)) return;

    try {
      const res = await fetch(`${API_BASE}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, vendor, cost, category })
      });
      const data = await res.json();
      if (data.success) {
        addSubDrawer.classList.remove('open');
        addSubForm.reset();
        await fetchSubscriptions();
        await fetchCashflowSummary();
      }
    } catch (err) {
      console.error('Failed to create subscription:', err);
    }
  });

  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

async function fetchCashflowSummary() {
  try {
    const res = await fetch(`${API_BASE}/cashflow/summary`);
    const json = await res.json();
    if (json.success) {
      cashflow = json.data;
      metricMonthly.textContent = `$${cashflow.monthly_recurring_spend.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      metricAnnualized.textContent = `$${cashflow.annualized_spend.toLocaleString()}/yr run-rate`;
      metricRunway.textContent = `${cashflow.runway_months} Mo`;
      metricReserves.textContent = `$${(cashflow.cash_reserves / 1000).toFixed(0)}k in cash reserves`;
      metricLeaks.textContent = `$${cashflow.total_savings_identified.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      metricLeaksCount.textContent = `${cashflow.active_leaks_count} immediate actions`;
      metricToolsCount.textContent = `${cashflow.active_subscriptions} Active`;
      runwayText.textContent = `${cashflow.runway_months} Mo Runway`;
    }
  } catch (err) {
    console.error('Failed to fetch cashflow summary:', err);
  }
}

async function fetchSubscriptions() {
  try {
    const res = await fetch(`${API_BASE}/subscriptions`);
    const json = await res.json();
    if (json.success) {
      subscriptions = json.data;
      renderSubscriptions();
    }
  } catch (err) {
    subscriptionsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #EF4444; padding: 2rem;">Failed to connect to backend service.</td></tr>`;
  }
}

function renderSubscriptions() {
  if (subscriptions.length === 0) {
    subscriptionsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No subscriptions recorded. Add one above.</td></tr>`;
    return;
  }

  subscriptionsTableBody.innerHTML = subscriptions.map(sub => {
    const isActive = sub.status === 'active';
    const hasLeak = sub.active_leaks_count > 0;

    return `
      <tr id="sub-row-${sub.id}">
        <td>
          <div style="font-weight: 600; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
            ${escapeHtml(sub.name)}
            ${hasLeak ? `<span style="background: #FEF3C7; color: #B45309; font-size: 0.65rem; padding: 0.15rem 0.45rem; border-radius: 9999px; font-weight: 700;">LEAK</span>` : ''}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(sub.vendor)}</div>
        </td>
        <td>
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 600; color: var(--text-muted);">${sub.category}</span>
        </td>
        <td>
          <span style="font-weight: 600; color: var(--primary);">$${sub.cost.toFixed(2)}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">/mo</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="flex: 1; max-width: 60px; height: 5px; background: #E2E8F0; border-radius: 9999px; overflow: hidden;">
              <div style="width: ${sub.usage_score}%; height: 100%; background: ${sub.usage_score < 50 ? '#EF4444' : '#10B981'};"></div>
            </div>
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">${sub.usage_score}%</span>
          </div>
        </td>
        <td>
          <span style="font-size: 0.85rem; color: var(--text-muted);">${sub.next_billing_date}</span>
        </td>
        <td style="text-align: right;">
          <button onclick="toggleSubscriptionStatus(${sub.id})" class="${isActive ? 'pill-active' : 'pill-paused'}" style="border: none; cursor: pointer;">
            ${isActive ? 'Active' : 'Paused'}
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

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
    leaksCardWrapper.style.display = 'none';
    return;
  }
  leaksCardWrapper.style.display = 'flex';

  leaksListContainer.innerHTML = leaks.map(leak => `
    <div class="leak-item">
      <div>
        <div style="font-size: 0.9rem; font-weight: 600; color: #78350F;">
          ${escapeHtml(leak.subscription_name)} — <span style="font-weight: 700; color: #B45309;">Save $${leak.potential_savings.toFixed(2)}/mo</span>
        </div>
        <div style="font-size: 0.8rem; color: #92400E; margin-top: 0.2rem;">
          ${escapeHtml(leak.reason)}
        </div>
      </div>
      <div>
        <button onclick="resolveLeak(${leak.id})" class="btn-reclaim">
          Claim Savings
        </button>
      </div>
    </div>
  `).join('');
}

async function toggleSubscriptionStatus(id) {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/${id}/toggle`, { method: 'PATCH' });
    const json = await res.json();
    if (json.success) {
      await fetchSubscriptions();
      await fetchCashflowSummary();
    }
  } catch (err) {
    console.error('Toggle failed:', err);
  }
}

async function resolveLeak(id) {
  try {
    const res = await fetch(`${API_BASE}/leaks/${id}/resolve`, { method: 'PATCH' });
    const json = await res.json();
    if (json.success) {
      await fetchLeaks();
      await fetchCashflowSummary();
    }
  } catch (err) {
    console.error('Resolve leak failed:', err);
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
