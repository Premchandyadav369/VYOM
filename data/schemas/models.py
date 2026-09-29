"""
VERA x DRUNIX Data Schemas & Models
Defines core data structures for Intent-Governed Payment State (IGPS),
Drnix ledger structures, ML features, and API representations.
"""

from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class PaymentStatus(str, Enum):
    PAYMENT_CREATED = "PAYMENT_CREATED"
    INTENT_CAPTURED = "INTENT_CAPTURED"
    INTENT_EVALUATED = "INTENT_EVALUATED"
    RECIPIENT_EVALUATED = "RECIPIENT_EVALUATED"
    RISK_EVALUATED = "RISK_EVALUATED"
    POLICY_DECISION = "POLICY_DECISION"
    VERIFICATION_REQUIRED = "VERIFICATION_REQUIRED"
    VERIFIED = "VERIFIED"
    HOLD = "HOLD"
    RELEASED = "RELEASED"
    REJECTED = "REJECTED"
    ENDORSED = "ENDORSED"
    ORDERED = "ORDERED"
    VALIDATED = "VALIDATED"
    COMMITTED = "COMMITTED"
    SETTLEMENT_REQUESTED = "SETTLEMENT_REQUESTED"
    SETTLED = "SETTLED"


class PolicyDecision(str, Enum):
    ALLOW = "ALLOW"
    VERIFY = "VERIFY"
    HOLD = "HOLD"


class RiskClass(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class ScenarioType(str, Enum):
    NORMAL = "NORMAL"
    NEW_RECIPIENT = "NEW_RECIPIENT"
    WRONG_RECIPIENT = "WRONG_RECIPIENT"
    SOCIAL_ENGINEERING = "SOCIAL_ENGINEERING"
    ACCOUNT_TAKEOVER = "ACCOUNT_TAKEOVER"
    MULE_NETWORK = "MULE_NETWORK"
    HIGH_VALUE_ANOMALY = "HIGH_VALUE_ANOMALY"
    INTENT_MISMATCH = "INTENT_MISMATCH"
    CROSS_BORDER = "CROSS_BORDER"
    TOKENIZED_ASSET_TRANSFER = "TOKENIZED_ASSET_TRANSFER"


class IntentVector(BaseModel):
    purpose: str = Field(..., description="Stated payment purpose (e.g., grocery, rent, laptop purchase)")
    category: str = Field(..., description="Inferred category (e.g., e-commerce, p2p_transfer, investment)")
    expected_amount: float = Field(..., description="Expected amount derived from NLP/context")
    counterparty_name: Optional[str] = Field(None, description="Expected counterparty name")
    counterparty_type: str = Field("unknown", description="merchant, friend, business, unknown")
    relationship: str = Field("unknown", description="friend, family, vendor, regular_merchant, new")
    urgency_level: str = Field("normal", description="normal, urgent, coercive")
    semantic_embedding: Optional[List[float]] = Field(None, description="Vector embedding of intent text")


class IntentAnalysisResult(BaseModel):
    intent_consistency: float = Field(..., ge=0.0, le=1.0)
    semantic_similarity: float = Field(..., ge=0.0, le=1.0)
    amount_consistency: float = Field(..., ge=0.0, le=1.0)
    recipient_consistency: float = Field(..., ge=0.0, le=1.0)
    category_consistency: float = Field(..., ge=0.0, le=1.0)
    temporal_consistency: float = Field(..., ge=0.0, le=1.0)
    urgency_coercion_score: float = Field(0.0, ge=0.0, le=1.0)
    intent_vector: IntentVector
    reason_codes: List[str] = Field(default_factory=list)
    confidence: float = Field(0.95, ge=0.0, le=1.0)


class RecipientGraphFeatures(BaseModel):
    recipient_id: str
    recipient_trust_score: float = Field(..., ge=0.0, le=1.0)
    network_risk_score: float = Field(..., ge=0.0, le=1.0)
    relationship_age_days: int = 0
    prior_tx_count: int = 0
    prior_volume_inr: float = 0.0
    degree_centrality: float = 0.0
    in_degree: int = 0
    out_degree: int = 0
    clustering_coefficient: float = 0.0
    is_mule_cluster_member: bool = False
    mule_cluster_score: float = 0.0
    is_new_recipient: bool = True
    account_age_days: int = 30


class BehavioralRiskFeatures(BaseModel):
    behavior_deviation_score: float = Field(..., ge=0.0, le=1.0)
    amount_z_score: float = 0.0
    typical_amount_median: float = 1500.0
    time_of_day_risk: float = 0.0
    day_of_week_risk: float = 0.0
    velocity_1h_count: int = 1
    velocity_24h_count: int = 3
    is_amount_outlier: bool = False


class ContextRiskFeatures(BaseModel):
    context_risk_score: float = Field(..., ge=0.0, le=1.0)
    device_risk: float = 0.0
    device_id: str
    is_new_device: bool = False
    location: str
    location_risk: float = 0.0
    ip_reputation_score: float = 1.0
    channel: str = "UPI"
    channel_novelty: float = 0.0


class CrossBorderFeatures(BaseModel):
    is_cross_border: bool = False
    origin_country: str = "IN"
    destination_country: str = "IN"
    corridor: Optional[str] = None  # e.g., "IN-SG", "IN-UAE"
    currency_pair: str = "INR/INR"
    fx_rate: float = 1.0
    fx_spread_pct: float = 0.0
    fee_inr: float = 0.0
    estimated_settlement_mins: int = 1
    country_risk_score: float = 0.0
    route_risk_score: float = 0.0
    compliance_status: str = "DOMESTIC_EXEMPT"  # SANCTIONS_CLEARED, PEP_CHECK_PASSED, etc.
    direction: str = "OUTWARD"  # "OUTWARD" (India -> World) or "INWARD" (World -> India)
    source_amount: float = 0.0
    dest_amount: float = 0.0
    source_currency: str = "INR"
    dest_currency: str = "INR"
    tcs_inr: float = 0.0
    firc_number: Optional[str] = None
    settlement_rail: Optional[str] = None


class UnifiedRiskDecision(BaseModel):
    decision_id: str
    payment_id: str
    decision: PolicyDecision
    risk_class: RiskClass
    unified_risk_score: float = Field(..., ge=0.0, le=1.0)
    intent_consistency: float = Field(..., ge=0.0, le=1.0)
    recipient_trust: float = Field(..., ge=0.0, le=1.0)
    behavior_deviation: float = Field(..., ge=0.0, le=1.0)
    context_risk: float = Field(..., ge=0.0, le=1.0)
    network_risk: float = Field(..., ge=0.0, le=1.0)
    cross_border_risk: float = Field(0.0, ge=0.0, le=1.0)
    policy_version: str = "vera-policy-v1"
    safety_friction_score: float = Field(..., description="SFE trade-off balance")
    reason_codes: List[str] = Field(default_factory=list)
    explanation: str
    required_action: Optional[str] = None
    vera_signature: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class DrunixStateTransition(BaseModel):
    from_state: PaymentStatus
    to_state: PaymentStatus
    timestamp: datetime
    authorized_by_msp: str
    tx_id: str
    endorsements: List[Dict[str, str]] = Field(default_factory=list)


class DrunixTransaction(BaseModel):
    tx_id: str
    block_number: int
    channel_id: str = "payments-channel"
    chaincode_name: str = "vera-payment-state"
    function_name: str
    args: Dict[str, Any]
    initiator_msp: str
    proposal_hash: str
    rw_set: Dict[str, Any]
    endorsements: List[Dict[str, str]]
    stateless_validation_status: str = "VALID"
    mvcc_validation_status: str = "VALID"
    commit_status: str = "COMMITTED"
    transient_keydb_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    drunix_mode: str = "SIMULATOR"  # or REAL


class DrunixBlock(BaseModel):
    block_number: int
    current_block_hash: str
    previous_block_hash: str
    channel_id: str = "payments-channel"
    tx_count: int
    transactions: List[DrunixTransaction] = Field(default_factory=list)
    merkle_root: str
    orderer_identity: str = "OrdererMSP.orderer.example.com"
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaymentIntentSubmission(BaseModel):
    stated_intent: str
    channel: str = "UPI"
    device_id: Optional[str] = "dev_default_01"
    location: Optional[str] = "Mumbai, IN"
    user_context: Optional[Dict[str, Any]] = None


class PaymentCreateRequest(BaseModel):
    sender_id: str
    recipient_id: str
    amount: float
    currency: str = "INR"
    stated_intent: Optional[str] = None
    channel: str = "UPI"
    merchant_id: Optional[str] = None
    category: Optional[str] = "p2p_transfer"
    device_id: Optional[str] = "dev_user_01"
    location: Optional[str] = "Bangalore, IN"
    destination_country: Optional[str] = "IN"
    is_cross_border: bool = False


class PaymentRecord(BaseModel):
    payment_id: str
    sender_id: str
    recipient_id: str
    merchant_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    stated_intent: Optional[str] = None
    intent_hash: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PAYMENT_CREATED
    risk_decision: Optional[UnifiedRiskDecision] = None
    drunix_tx_id: Optional[str] = None
    drunix_block_number: Optional[int] = None
    state_history: List[DrunixStateTransition] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TokenizedReceivableAsset(BaseModel):
    asset_id: str
    invoice_number: str
    face_value_inr: float
    discounted_value_inr: float
    original_owner_id: str
    current_owner_id: str
    debtor_id: str
    due_date: str
    verification_status: str = "VERIFIED"
    tokenized_at: datetime = Field(default_factory=datetime.utcnow)
    drunix_tx_id: str
    collateral_status: str = "UNENCUMBERED"
    transfer_history: List[Dict[str, Any]] = Field(default_factory=list)
