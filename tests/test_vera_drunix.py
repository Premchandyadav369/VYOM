"""
VERA x DRUNIX Comprehensive Test Suite
Covers:
1. Unit Tests (Intent extraction, Behavioral deviations, Trust Graph, Risk Fusion, Policy Engine)
2. Blockchain Invariant Tests (Drunix valid/invalid state transitions, Unauthorized transitions)
3. Integration Tests (VERA Intelligence -> Drunix Adapter)
4. End-to-End Tests (Payment creation -> Risk decision -> Secondary verification -> Final settlement)
"""

import pytest
import os
import sys

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.intent_engine.intent_service import IntentEngine
from services.risk_engine.behavioral_engine import BehavioralEngine
from services.graph_engine.trust_graph import TrustGraphEngine
from services.risk_engine.risk_fusion import RiskFusionEngine
from services.policy_engine.adaptive_policy import AdaptivePolicyEngine
from services.drunix_adapter.adapter import DrunixAdapter
from blockchain.chaincode.vera_payment_state.chaincode import DrunixChaincodeError
from data.schemas.models import ContextRiskFeatures, PolicyDecision


# ==============================================================================
# 1. UNIT TESTS: VERA INTELLIGENCE ENGINES
# ==============================================================================

def test_intent_engine_normal_match():
    engine = IntentEngine()
    res = engine.evaluate_intent_mismatch(
        stated_intent="Dinner delivery food from Swiggy",
        actual_amount=1200.0,
        actual_recipient_name="Swiggy Foods",
        actual_category="food_beverage",
        is_merchant=True
    )
    assert res.intent_consistency >= 0.85
    assert "INTENT_MISMATCH" not in res.reason_codes


def test_intent_engine_mismatch_detection():
    engine = IntentEngine()
    res = engine.evaluate_intent_mismatch(
        stated_intent="Paying Rs 5,000 for groceries",
        actual_amount=50000.0,
        actual_recipient_name="Personal Account X",
        actual_category="personal_transfer",
        is_merchant=False
    )
    assert res.intent_consistency < 0.50
    assert "INTENT_MISMATCH" in res.reason_codes
    assert "AMOUNT_DEVIATION_FROM_INTENT" in res.reason_codes


def test_behavioral_engine_outlier():
    engine = BehavioralEngine()
    # Test large night-time transaction (3 AM, 80,000 INR vs 1,500 median)
    res = engine.evaluate_behavior(
        user_id="USR_0001",
        amount=80000.0,
        hour_of_day=3,
        day_of_week=2,
        user_median_amount=1500.0,
        user_amount_std=500.0,
        velocity_1h=4
    )
    assert res.behavior_deviation_score > 0.60
    assert res.is_amount_outlier is True


def test_trust_graph_mule_cluster():
    engine = TrustGraphEngine()
    res = engine.evaluate_recipient_trust(
        sender_id="USR_0001",
        recipient_id="REC_00010",  # Seeded mule hub node
        amount=25000.0
    )
    assert res.is_mule_cluster_member is True
    assert res.network_risk_score > 0.70
    assert res.recipient_trust_score < 0.30


def test_policy_engine_allow_verify_hold():
    engine = AdaptivePolicyEngine()
    
    # 1. Low risk -> ALLOW
    dec_allow = engine.evaluate_policy(
        payment_id="PAY-T1", unified_risk=0.15, intent_consistency=0.95,
        recipient_trust=0.90, behavior_deviation=0.10, context_risk=0.08,
        network_risk=0.05, cross_border_risk=0.0, reason_codes=[],
        amount=1200.0, is_known_recipient=True
    )
    assert dec_allow.decision == PolicyDecision.ALLOW

    # 2. Medium risk -> VERIFY
    dec_verify = engine.evaluate_policy(
        payment_id="PAY-T2", unified_risk=0.48, intent_consistency=0.40,
        recipient_trust=0.60, behavior_deviation=0.50, context_risk=0.20,
        network_risk=0.30, cross_border_risk=0.0, reason_codes=["INTENT_MISMATCH"],
        amount=25000.0, is_known_recipient=False
    )
    assert dec_verify.decision == PolicyDecision.VERIFY
    assert dec_verify.required_action is not None

    # 3. High risk -> HOLD
    dec_hold = engine.evaluate_policy(
        payment_id="PAY-T3", unified_risk=0.88, intent_consistency=0.20,
        recipient_trust=0.10, behavior_deviation=0.85, context_risk=0.70,
        network_risk=0.90, cross_border_risk=0.0, reason_codes=["MULE_NETWORK_CLUSTER_DETECTED"],
        amount=95000.0, is_known_recipient=False
    )
    assert dec_hold.decision == PolicyDecision.HOLD


# ==============================================================================
# 2. BLOCKCHAIN INVARIANT TESTS: DRUNIX DLT
# ==============================================================================

def test_drunix_valid_lifecycle():
    drunix = DrunixAdapter(mode="SIMULATOR")
    pid = "PAY-TEST-VALID-01"

    # Step 1: Create
    tx1, b1 = drunix.execute_transaction_lifecycle("CreatePayment", {
        "payment_id": pid, "sender_id": "U1", "recipient_id": "R1", "amount": 1000.0, "currency": "INR"
    })
    assert b1.block_number == 1
    assert tx1.commit_status == "COMMITTED"

    # Step 2: Policy ALLOW
    tx2, b2 = drunix.execute_transaction_lifecycle("SubmitRiskDecision", {
        "payment_id": pid, "decision": "ALLOW", "risk_class": "LOW", "risk_score": 0.1,
        "vera_signature": "valid_sig", "reason_codes": []
    })
    assert b2.block_number == 2

    # Step 3: Commit
    tx3, b3 = drunix.execute_transaction_lifecycle("CommitPayment", {"payment_id": pid})
    assert tx3.commit_status == "COMMITTED"

    # Step 4: Settle
    tx4, b4 = drunix.execute_transaction_lifecycle("MarkSettled", {"payment_id": pid})
    assert tx4.commit_status == "COMMITTED"
    assert drunix.chaincode.get_state(f"PAYMENT_{pid}")["status"] == "SETTLED"


def test_drunix_invalid_state_transition_rejection():
    drunix = DrunixAdapter(mode="SIMULATOR")
    pid = "PAY-TEST-INVALID-02"

    drunix.execute_transaction_lifecycle("CreatePayment", {
        "payment_id": pid, "sender_id": "U1", "recipient_id": "R1", "amount": 50000.0, "currency": "INR"
    })
    # Set to HOLD
    drunix.execute_transaction_lifecycle("SubmitRiskDecision", {
        "payment_id": pid, "decision": "HOLD", "risk_class": "HIGH", "risk_score": 0.9,
        "vera_signature": "valid_sig", "reason_codes": ["SCAM"]
    })

    # Chaincode invariant: Cannot jump directly from HOLD to SETTLED without RELEASE
    with pytest.raises(DrunixChaincodeError) as exc_info:
        drunix.execute_transaction_lifecycle("CommitPayment", {"payment_id": pid})
    assert "Cannot commit unverified or held payment" in str(exc_info.value)


def test_drunix_unauthorized_org_rejection():
    drunix = DrunixAdapter(mode="SIMULATOR")
    pid = "PAY-TEST-UNAUTH-03"

    drunix.execute_transaction_lifecycle("CreatePayment", {
        "payment_id": pid, "sender_id": "U1", "recipient_id": "R1", "amount": 1000.0, "currency": "INR"
    })

    # Attempt transition with unauthorized rogue organization MSP
    with pytest.raises(DrunixChaincodeError) as exc_info:
        drunix.execute_transaction_lifecycle(
            function_name="SubmitRiskDecision",
            args={"payment_id": pid, "decision": "ALLOW", "risk_class": "LOW", "risk_score": 0.1, "vera_signature": "sig", "reason_codes": []},
            inject_failure="UNAUTHORIZED_ORG"
        )
    assert "Stateless Validation Service" in str(exc_info.value) or "Missing endorsement" in str(exc_info.value)


# ==============================================================================
# 3. END-TO-END PIPELINE INTEGRATION TEST
# ==============================================================================

def test_full_e2e_intent_mismatch_verification_flow():
    intent_eng = IntentEngine()
    beh_eng = BehavioralEngine()
    graph_eng = TrustGraphEngine()
    fusion_eng = RiskFusionEngine()
    policy_eng = AdaptivePolicyEngine()
    drunix = DrunixAdapter(mode="SIMULATOR")

    pid = "PAY-E2E-001"
    amount = 50000.0
    intent_text = "Paying Rs 5,000 for groceries"

    # 1. Blockchain Create
    drunix.execute_transaction_lifecycle("CreatePayment", {
        "payment_id": pid, "sender_id": "USR_001", "recipient_id": "REC_999", "amount": amount, "currency": "INR"
    })

    # 2. VERA Intelligence
    intent_res = intent_eng.evaluate_intent_mismatch(intent_text, amount, "Unknown Recipient", "personal_transfer", False)
    beh_res = beh_eng.evaluate_behavior("USR_001", amount, 14, 2, 2000.0, 500.0)
    graph_res = graph_eng.evaluate_recipient_trust("USR_001", "REC_999", amount, False)
    ctx_res = ContextRiskFeatures(context_risk_score=0.2, device_id="DEV_01", location="Mumbai")
    risk_score, reason_codes, _ = fusion_eng.compute_unified_risk(intent_res, graph_res, beh_res, ctx_res)
    decision = policy_eng.evaluate_policy(pid, risk_score, intent_res.intent_consistency, graph_res.recipient_trust_score, beh_res.behavior_deviation_score, ctx_res.context_risk_score, graph_res.network_risk_score, 0.0, reason_codes, amount, False)

    assert decision.decision == PolicyDecision.VERIFY

    # 3. Drunix Submit Decision -> State: VERIFY_REQUIRED
    drunix.execute_transaction_lifecycle("SubmitRiskDecision", {
        "payment_id": pid, "decision": "VERIFY", "risk_class": "MEDIUM", "risk_score": risk_score,
        "vera_signature": decision.vera_signature, "reason_codes": decision.reason_codes
    })

    # 4. Attempt premature commit should fail
    with pytest.raises(DrunixChaincodeError):
        drunix.execute_transaction_lifecycle("CommitPayment", {"payment_id": pid})

    # 5. User completes secondary verification
    drunix.execute_transaction_lifecycle("VerifyPayment", {"payment_id": pid})

    # 6. Commit and Settle now succeed
    drunix.execute_transaction_lifecycle("CommitPayment", {"payment_id": pid})
    drunix.execute_transaction_lifecycle("MarkSettled", {"payment_id": pid})

    final_state = drunix.chaincode.get_state(f"PAYMENT_{pid}")
    assert final_state["status"] == "SETTLED"


def test_api_approve_and_hold_endpoints():
    from fastapi.testclient import TestClient
    from apps.api.main import app

    client = TestClient(app)

    # 1. Create a payment that triggers VERIFY or HOLD
    create_res = client.post("/payments", json={
        "sender_id": "test.user@upi",
        "recipient_id": "customs.clearance.hold@scam",
        "amount": 45000.0,
        "stated_intent": "Urgent customs fine payment",
        "category": "courier_customs_fine"
    })
    assert create_res.status_code == 201
    pid = create_res.json()["payment_id"]

    # 2. Test manual hold endpoint
    hold_res = client.post(f"/payments/{pid}/hold")
    assert hold_res.status_code == 200
    assert hold_res.json()["status"] == "HOLD"
    assert hold_res.json()["decision"] == "HOLD"

    # 3. Test operator approve override
    approve_res = client.post(f"/payments/{pid}/approve")
    assert approve_res.status_code == 200
    assert approve_res.json()["status"] == "SETTLED"
    assert approve_res.json()["decision"] == "ALLOW"
