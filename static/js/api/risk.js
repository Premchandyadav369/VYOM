/**
 * Risk & Policy Rules API
 */

const API_BASE = window.location.origin.includes('8000') || window.location.origin.includes('3000')
  ? ''
  : 'http://127.0.0.1:8000';

export async function fetchPolicyRules() {
  const res = await fetch(`${API_BASE}/policy/rules`);
  if (!res.ok) throw new Error('Failed to fetch policy rules');
  return res.json();
}

export async function togglePolicyRule(ruleId) {
  const res = await fetch(`${API_BASE}/policy/rules/${ruleId}/toggle`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to toggle rule ${ruleId}`);
  return res.json();
}

export async function fetchGraphTopology() {
  const res = await fetch(`${API_BASE}/graph/network/ALL`);
  if (!res.ok) throw new Error('Failed to fetch graph network');
  return res.json();
}

export async function fetchThreatModel() {
  const res = await fetch(`${API_BASE}/security/threat-model`);
  if (!res.ok) throw new Error('Failed to fetch threat model');
  return res.json();
}

export async function fetchAuditLogs(limit = 25) {
  const res = await fetch(`${API_BASE}/security/audit-logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}
