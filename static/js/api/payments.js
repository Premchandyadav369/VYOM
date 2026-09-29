/**
 * Payments API Module
 */

const API_BASE = window.location.origin.includes('8000') || window.location.origin.includes('3000')
  ? ''
  : 'http://127.0.0.1:8000';

export async function fetchPayments(limit = 40) {
  const res = await fetch(`${API_BASE}/payments?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

export async function fetchPaymentById(paymentId) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}`);
  if (!res.ok) throw new Error(`Payment ${paymentId} not found`);
  return res.json();
}

export async function createPayment(payload) {
  const res = await fetch(`${API_BASE}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create payment');
  return res.json();
}

export async function approvePayment(paymentId) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Approval failed');
  return res.json();
}

export async function holdPayment(paymentId) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/hold`, { method: 'POST' });
  if (!res.ok) throw new Error('Hold failed');
  return res.json();
}

export async function verifyPayment(paymentId) {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/verify`, { method: 'POST' });
  if (!res.ok) throw new Error('Verification failed');
  return res.json();
}

export async function batchImportPayments(payments) {
  const res = await fetch(`${API_BASE}/payments/batch-import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payments })
  });
  if (!res.ok) throw new Error('Batch import failed');
  return res.json();
}

export async function fetchOverview() {
  const res = await fetch(`${API_BASE}/analytics/overview`);
  if (!res.ok) throw new Error('Failed to fetch overview analytics');
  return res.json();
}
