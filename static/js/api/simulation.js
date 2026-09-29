/**
 * Simulation, Research & Assets API
 */

const API_BASE = window.location.origin.includes('8000') || window.location.origin.includes('3000')
  ? ''
  : 'http://127.0.0.1:8000';

export async function fetchSimulationScenarios() {
  const res = await fetch(`${API_BASE}/simulation/scenarios`);
  if (!res.ok) throw new Error('Failed to fetch scenarios');
  return res.json();
}

export async function runSimulationScenario(scenario, params = {}) {
  const res = await fetch(`${API_BASE}/simulation/run-scenario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario, params })
  });
  if (!res.ok) throw new Error('Failed to run simulation scenario');
  return res.json();
}

export async function fetchResearchBaselines() {
  const res = await fetch(`${API_BASE}/research/baselines`);
  if (!res.ok) throw new Error('Failed to fetch baselines');
  return res.json();
}

export async function fetchResearchAblation() {
  const res = await fetch(`${API_BASE}/research/ablation`);
  if (!res.ok) throw new Error('Failed to fetch ablation study');
  return res.json();
}

export async function fetchRemittanceCountries() {
  const res = await fetch(`${API_BASE}/remittance/countries`);
  if (!res.ok) throw new Error('Failed to fetch remittance countries');
  return res.json();
}

export async function fetchRemittanceCorridors() {
  const res = await fetch(`${API_BASE}/remittance/corridors`);
  if (!res.ok) throw new Error('Failed to fetch corridors');
  return res.json();
}

export async function evaluateRemittance(data) {
  const res = await fetch(`${API_BASE}/remittance/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to evaluate remittance');
  return res.json();
}

export async function executeRemittance(data) {
  const res = await fetch(`${API_BASE}/remittance/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to execute cross-border remittance');
  }
  return res.json();
}

export async function fetchRemittanceHistory() {
  const res = await fetch(`${API_BASE}/remittance/history`);
  if (!res.ok) throw new Error('Failed to fetch remittance history');
  return res.json();
}

export async function fetchAssets() {
  const res = await fetch(`${API_BASE}/assets`);
  if (!res.ok) throw new Error('Failed to fetch assets');
  return res.json();
}
