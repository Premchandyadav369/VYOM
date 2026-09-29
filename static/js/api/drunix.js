/**
 * Drunix DLT Infrastructure API
 */

const API_BASE = window.location.origin.includes('8000') || window.location.origin.includes('3000')
  ? ''
  : 'http://127.0.0.1:8000';

export async function fetchNetworkHealth() {
  const res = await fetch(`${API_BASE}/drunix/network`);
  if (!res.ok) throw new Error('Failed to fetch network health');
  return res.json();
}

export async function fetchBlocks(limit = 25) {
  const res = await fetch(`${API_BASE}/drunix/blocks?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch blocks');
  return res.json();
}

export async function fetchTransactions(limit = 30) {
  const res = await fetch(`${API_BASE}/drunix/transactions?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}
