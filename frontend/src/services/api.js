const BASE_URL = import.meta.env.VITE_API_URL || '';
const BACKEND_DIRECT_URL = 'http://127.0.0.1:8000';

// Resilient fetch with automatic fallback to direct backend URL if proxy fails
async function robustFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    if (res.ok) return res;
    // If not OK, try direct backend port
    console.warn(`Initial fetch to ${endpoint} returned ${res.status}. Retrying directly on ${BACKEND_DIRECT_URL}...`);
    return await fetch(`${BACKEND_DIRECT_URL}${endpoint}`, options);
  } catch (err) {
    console.warn(`Network error on ${endpoint}. Retrying directly on ${BACKEND_DIRECT_URL}...`, err);
    return await fetch(`${BACKEND_DIRECT_URL}${endpoint}`, options);
  }
}

export const api = {
  async fetchMetrics() {
    const res = await robustFetch('/api/metrics');
    if (!res.ok) throw new Error(`Metrics fetch failed: ${res.statusText}`);
    return res.json();
  },

  async fetchFailures({ status = 'all', filterByType = 'all', limit = 100 } = {}) {
    const params = new URLSearchParams({
      status,
      filter_by_type: filterByType,
      limit: limit.toString()
    });
    const res = await robustFetch(`/api/failures?${params}`);
    if (!res.ok) throw new Error(`Failures fetch failed: ${res.statusText}`);
    return res.json();
  },

  async detectFailures(payload = { days: 7, min_amount: 0, filter_by_type: 'all' }) {
    const res = await robustFetch('/api/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Detection request failed: ${res.statusText}`);
    return res.json();
  },

  async diagnoseFailure(failureId) {
    if (!failureId) throw new Error("Missing failureId for diagnosis");
    const res = await robustFetch('/api/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ failure_id: failureId })
    });
    if (!res.ok) {
      const errorDetail = await res.text();
      throw new Error(`Diagnosis request failed (${res.status}): ${errorDetail}`);
    }
    return res.json();
  },

  async interveneFailure(failureId) {
    if (!failureId) throw new Error("Missing failureId for intervention");
    const res = await robustFetch('/api/intervene', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ failure_id: failureId })
    });
    if (!res.ok) {
      const errorDetail = await res.text();
      throw new Error(`Intervention request failed (${res.status}): ${errorDetail}`);
    }
    return res.json();
  },

  async executeIntervention(interventionId) {
    if (!interventionId) throw new Error("Missing interventionId for execution");
    const res = await robustFetch('/api/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intervention_id: interventionId })
    });
    if (!res.ok) {
      const errorDetail = await res.text();
      throw new Error(`Execution request failed (${res.status}): ${errorDetail}`);
    }
    return res.json();
  },

  async fetchAuditTrail(failureId) {
    if (!failureId) throw new Error("Missing failureId for audit trail");
    const res = await robustFetch(`/api/audit-trail/${failureId}`);
    if (!res.ok) throw new Error(`Audit trail fetch failed: ${res.statusText}`);
    return res.json();
  },

  async runBatchPipeline(options = { limit: 100 }) {
    const res = await robustFetch('/api/batch-run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    if (!res.ok) throw new Error(`Batch pipeline failed: ${res.statusText}`);
    return res.json();
  },

  async resetDemoData() {
    const res = await robustFetch('/api/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Reset failed: ${res.statusText}`);
    return res.json();
  }
};
