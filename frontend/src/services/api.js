const BASE_URL = import.meta.env.VITE_API_URL || '';

export const api = {
  async fetchMetrics() {
    const res = await fetch(`${BASE_URL}/api/metrics`);
    if (!res.ok) throw new Error(`Metrics fetch failed: ${res.statusText}`);
    return res.json();
  },

  async fetchFailures({ status = 'all', filterByType = 'all', limit = 100 } = {}) {
    const params = new URLSearchParams({
      status,
      filter_by_type: filterByType,
      limit: limit.toString()
    });
    const res = await fetch(`${BASE_URL}/api/failures?${params}`);
    if (!res.ok) throw new Error(`Failures fetch failed: ${res.statusText}`);
    return res.json();
  },

  async detectFailures(payload = { days: 7, min_amount: 0, filter_by_type: 'all' }) {
    const res = await fetch(`${BASE_URL}/api/detect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Detection request failed: ${res.statusText}`);
    return res.json();
  },

  async diagnoseFailure(failureId) {
    const res = await fetch(`${BASE_URL}/api/diagnose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ failure_id: failureId })
    });
    if (!res.ok) throw new Error(`Diagnosis request failed: ${res.statusText}`);
    return res.json();
  },

  async interveneFailure(failureId) {
    const res = await fetch(`${BASE_URL}/api/intervene`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ failure_id: failureId })
    });
    if (!res.ok) throw new Error(`Intervention request failed: ${res.statusText}`);
    return res.json();
  },

  async executeIntervention(interventionId) {
    const res = await fetch(`${BASE_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intervention_id: interventionId })
    });
    if (!res.ok) throw new Error(`Execution request failed: ${res.statusText}`);
    return res.json();
  },

  async fetchAuditTrail(failureId) {
    const res = await fetch(`${BASE_URL}/api/audit-trail/${failureId}`);
    if (!res.ok) throw new Error(`Audit trail fetch failed: ${res.statusText}`);
    return res.json();
  },

  async runBatchPipeline(options = { limit: 100 }) {
    const res = await fetch(`${BASE_URL}/api/batch-run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options)
    });
    if (!res.ok) throw new Error(`Batch pipeline failed: ${res.statusText}`);
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch(`${BASE_URL}/api/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Reset failed: ${res.statusText}`);
    return res.json();
  }
};
