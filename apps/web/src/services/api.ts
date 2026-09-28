import {
  PaymentItem,
  DrunixBlock,
  DrunixTransaction,
  NetworkHealth,
  TokenizedAsset,
  RemittanceCorridor,
  ModelMetric,
  Hypothesis
} from '../types';

const API_BASE = '/api';

export const api = {
  // Payments
  async getPayments(limit: number = 25): Promise<PaymentItem[]> {
    const res = await fetch(`${API_BASE}/payments?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch payments');
    return res.json();
  },

  async getPayment(id: string): Promise<PaymentItem> {
    const res = await fetch(`${API_BASE}/payments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch payment');
    return res.json();
  },

  async createPayment(data: {
    sender_id: string;
    recipient_id: string;
    amount: number;
    stated_intent?: string;
    merchant_id?: string;
    category?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create payment');
    return res.json();
  },

  async verifyPayment(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/payments/${id}/verify`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to verify payment');
    return res.json();
  },

  // Drunix Explorer
  async getNetworkHealth(): Promise<NetworkHealth> {
    const res = await fetch(`${API_BASE}/drunix/network`);
    if (!res.ok) throw new Error('Failed to fetch Drunix network');
    return res.json();
  },

  async getBlocks(limit: number = 15): Promise<DrunixBlock[]> {
    const res = await fetch(`${API_BASE}/drunix/blocks?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch blocks');
    return res.json();
  },

  async getTransactions(limit: number = 20): Promise<DrunixTransaction[]> {
    const res = await fetch(`${API_BASE}/drunix/transactions?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  // Remittance
  async getCorridors(): Promise<RemittanceCorridor[]> {
    const res = await fetch(`${API_BASE}/remittance/corridors`);
    if (!res.ok) throw new Error('Failed to fetch corridors');
    return res.json();
  },

  async evaluateRemittance(data: { amount_inr: number; destination_country: string; corridor?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/remittance/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to evaluate remittance');
    return res.json();
  },

  // Tokenized Assets
  async getAssets(): Promise<TokenizedAsset[]> {
    const res = await fetch(`${API_BASE}/assets`);
    if (!res.ok) throw new Error('Failed to fetch assets');
    return res.json();
  },

  async tokenizeAsset(data: {
    invoice_number: string;
    face_value_inr: number;
    discounted_value_inr: number;
    original_owner_id: string;
    debtor_id: string;
    due_date: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/assets/tokenize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to tokenize asset');
    return res.json();
  },

  // Simulation Twin
  async getScenarios(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/simulation/scenarios`);
    if (!res.ok) throw new Error('Failed to fetch scenarios');
    return res.json();
  },

  async runScenario(scenario: string, params?: any): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/run-scenario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario, params })
    });
    if (!res.ok) throw new Error('Failed to run scenario');
    return res.json();
  },

  // Research Lab
  async getBaselines(): Promise<ModelMetric[]> {
    const res = await fetch(`${API_BASE}/research/baselines`);
    if (!res.ok) throw new Error('Failed to fetch baselines');
    return res.json();
  },

  async getAblation(): Promise<ModelMetric[]> {
    const res = await fetch(`${API_BASE}/research/ablation`);
    if (!res.ok) throw new Error('Failed to fetch ablation study');
    return res.json();
  },

  async getSfeFrontier(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/research/sfe-frontier`);
    if (!res.ok) throw new Error('Failed to fetch SFE frontier');
    return res.json();
  },

  async getHypotheses(): Promise<Hypothesis[]> {
    const res = await fetch(`${API_BASE}/research/hypotheses`);
    if (!res.ok) throw new Error('Failed to fetch hypotheses');
    return res.json();
  },

  // Analytics & Security
  async getAnalyticsOverview(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to fetch overview');
    return res.json();
  },

  async getThreatModel(): Promise<any> {
    const res = await fetch(`${API_BASE}/security/threat-model`);
    if (!res.ok) throw new Error('Failed to fetch threat model');
    return res.json();
  },

  async getAuditLogs(limit: number = 20): Promise<any[]> {
    const res = await fetch(`${API_BASE}/security/audit-logs?limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Batch Ingestion for BYOD CSV Statements
  async batchImportPayments(payments: any[]): Promise<any> {
    const res = await fetch(`${API_BASE}/payments/batch-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payments })
    });
    if (!res.ok) throw new Error('Failed to batch import payments');
    return res.json();
  },

  // Real-Time NLP Intent Analyzer
  async analyzeIntent(data: {
    stated_intent: string;
    amount: number;
    recipient_name?: string;
    category?: string;
    is_merchant?: boolean;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/intent/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to analyze intent');
    return res.json();
  },

  // Policy Rules
  async getPolicyRules(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/policy/rules`);
    if (!res.ok) throw new Error('Failed to fetch policy rules');
    return res.json();
  },

  async togglePolicyRule(ruleId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/policy/rules/${ruleId}/toggle`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to toggle policy rule');
    return res.json();
  },

  // Graph Topology & Injection
  async getFullGraph(): Promise<{ nodes: any[]; links: any[] }> {
    const res = await fetch(`${API_BASE}/graph/network/ALL`);
    if (!res.ok) throw new Error('Failed to fetch graph network');
    return res.json();
  },

  async injectGraphNode(data: {
    source_id: string;
    target_id: string;
    amount?: number;
    is_mule?: boolean;
    label?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/graph/nodes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to inject graph node');
    return res.json();
  }
};

