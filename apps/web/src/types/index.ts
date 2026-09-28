export type PolicyDecision = 'ALLOW' | 'VERIFY' | 'HOLD';
export type RiskClass = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PaymentItem {
  payment_id: string;
  sender_id: string;
  recipient_id: string;
  merchant_id?: string;
  amount: number;
  currency: string;
  stated_intent?: string;
  status: string;
  decision?: PolicyDecision;
  risk_class?: RiskClass;
  risk_score?: number;
  intent_consistency?: number;
  recipient_trust?: number;
  behavior_deviation?: number;
  network_risk?: number;
  context_risk?: number;
  reason_codes?: string[];
  risk_details?: any;
  drunix_tx_id?: string;
  drunix_block_number?: number;
  state_history?: any[];
  on_chain_drunix_record?: any;
  created_at: string;
  updated_at?: string;
}

export interface DrunixBlock {
  block_number: number;
  current_block_hash: string;
  previous_block_hash: string;
  channel_id: string;
  tx_count: number;
  transactions?: DrunixTransaction[];
  merkle_root: string;
  orderer_identity: string;
  timestamp: string;
}

export interface DrunixTransaction {
  tx_id: string;
  block_number: number;
  channel_id: string;
  chaincode_name: string;
  function_name: string;
  args: Record<string, any>;
  initiator_msp: string;
  proposal_hash: string;
  rw_set: {
    reads: Record<string, any>;
    writes: Record<string, any>;
  };
  endorsements: Array<{
    msp_id: string;
    signature: string;
    endorser_peer: string;
  }>;
  stateless_validation_status: string;
  mvcc_validation_status: string;
  commit_status: string;
  transient_keydb_hash?: string;
  created_at: string;
  drunix_mode: string;
}

export interface NetworkHealth {
  mode: string;
  channel: string;
  chaincode: string;
  block_height: number;
  total_transactions: number;
  transient_private_records: number;
  components: Array<{
    name: string;
    type: string;
    status: string;
    port: number;
  }>;
  organizations: Array<{
    msp: string;
    name: string;
    role: string;
  }>;
}

export interface TokenizedAsset {
  asset_id: string;
  invoice_number: string;
  face_value_inr: number;
  discounted_value_inr: number;
  original_owner_id?: string;
  current_owner_id: string;
  debtor_id: string;
  due_date: string;
  verification_status?: string;
  drunix_tx_id: string;
}

export interface RemittanceCorridor {
  code: string;
  name: string;
  dest_country: string;
  currency: string;
  base_fx_rate: number;
  fx_spread_pct: number;
  flat_fee_inr: number;
  avg_settlement_mins: number;
  country_risk: number;
  route_risk: number;
  compliance_regime: string;
}

export interface ModelMetric {
  model: string;
  pr_auc: number;
  roc_auc?: number;
  precision?: number;
  recall: number;
  f1?: number;
  fpr: number;
  fnr?: number;
  scam_recall: number;
  intent_mismatch_recall: number;
  latency_ms: number;
  sfe_score: number;
}

export interface Hypothesis {
  id: string;
  hypothesis: string;
  status: string;
  evidence: string;
  p_value: string;
}
