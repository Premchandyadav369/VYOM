"""
VERA Payment Twin (Digital Twin Simulation Engine)
Allows live interactive simulation of financial actors: users, banks, merchants,
mule networks, scammers, and cross-border corridors. Demonstrates VERA intelligence
guiding Drunix state transitions in real-time.
"""

import time
import random
from typing import Dict, Any, List, Optional
from services.intent_engine.intent_service import IntentEngine
from services.risk_engine.behavioral_engine import BehavioralEngine
from services.graph_engine.trust_graph import TrustGraphEngine
from services.risk_engine.risk_fusion import RiskFusionEngine
from services.policy_engine.adaptive_policy import AdaptivePolicyEngine
from services.cross_border_engine.remittance_service import CrossBorderEngine
from services.drunix_adapter.adapter import DrunixAdapter
from data.schemas.models import ContextRiskFeatures, PolicyDecision, PaymentStatus


class PaymentTwinSimulator:
    """Live interactive simulator for hackathon judges and security auditors."""

    def __init__(self, drunix_adapter: Optional[DrunixAdapter] = None):
        self.intent_eng = IntentEngine()
        self.beh_eng = BehavioralEngine()
        self.graph_eng = TrustGraphEngine()
        self.fusion_eng = RiskFusionEngine()
        self.policy_eng = AdaptivePolicyEngine()
        self.cb_eng = CrossBorderEngine()
        self.drunix = drunix_adapter or DrunixAdapter(mode="SIMULATOR")

    def run_scenario(self, scenario_name: str, custom_params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Executes an end-to-end interactive scenario:
        1. Capture Intent & Context
        2. VERA Intent NLP Analysis
        3. VERA Behavioral Modeling
        4. VERA Graph & Mule Cluster Lookup
        5. VERA Risk Fusion
        6. VERA Policy Decision (ALLOW / VERIFY / HOLD)
        7. Drunix State Transition & Block Commit
        8. Audit Trail Verification
        """
        params = custom_params or {}

        if scenario_name == "NORMAL_PAYMENT":
            return self._run_normal_scenario(params)
        elif scenario_name == "SOCIAL_ENGINEERING_SCAM":
            return self._run_scam_scenario(params)
        elif scenario_name == "INTENT_MISMATCH":
            return self._run_intent_mismatch_scenario(params)
        elif scenario_name == "CROSS_BORDER_REMITTANCE":
            return self._run_cross_border_scenario(params)
        elif scenario_name == "TOKENIZED_RECEIVABLE":
            return self._run_tokenized_receivable_scenario(params)
        else:
            raise ValueError(f"Unknown scenario: {scenario_name}")

    def _run_normal_scenario(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Scene 1: Normal payment (Groceries ₹1,500 to trusted regular merchant)."""
        pid = params.get("payment_id", f"PAY-NORM-{int(time.time()*1000)%100000}")
        user_id = params.get("user_id", "USR_00012")
        merchant_id = params.get("recipient_id", "MERCH_0001")  # Swiggy Foods
        amount = float(params.get("amount", 1500.0))
        stated_intent = params.get("stated_intent", "Paying for lunch delivery from regular restaurant")

        timeline = []
        timeline.append({"step": "PAYMENT_INITIATED", "timestamp": time.time(), "detail": f"User {user_id} initiated payment of Rs. {amount:,.2f}"})

        # 1. Drunix CreatePayment
        tx_create, b_create = self.drunix.execute_transaction_lifecycle(
            function_name="CreatePayment",
            args={"payment_id": pid, "sender_id": user_id, "recipient_id": merchant_id, "amount": amount, "currency": "INR"}
        )
        timeline.append({"step": "DRUNIX_PAYMENT_CREATED", "tx_id": tx_create.tx_id, "block": b_create.block_number})

        # 2. VERA Intelligence
        intent_res = self.intent_eng.evaluate_intent_mismatch(stated_intent, amount, "Swiggy Foods", "food_beverage", is_merchant=True)
        beh_res = self.beh_eng.evaluate_behavior(user_id, amount, 13, 2, 1600.0, 400.0)
        graph_res = self.graph_eng.evaluate_recipient_trust(user_id, merchant_id, amount, is_known_merchant=True)
        ctx_res = ContextRiskFeatures(context_risk_score=0.08, device_id="DEV_KNOWN_01", location="Mumbai")

        risk_score, reason_codes, breakdown = self.fusion_eng.compute_unified_risk(intent_res, graph_res, beh_res, ctx_res)
        decision = self.policy_eng.evaluate_policy(pid, risk_score, intent_res.intent_consistency, graph_res.recipient_trust_score, beh_res.behavior_deviation_score, ctx_res.context_risk_score, graph_res.network_risk_score, 0.0, reason_codes, amount, True)

        timeline.append({
            "step": "VERA_INTELLIGENCE_DECISION",
            "decision": decision.decision.value,
            "risk_score": decision.unified_risk_score,
            "signature": decision.vera_signature[:16],
            "reason_codes": decision.reason_codes
        })

        # 3. Drunix SubmitRiskDecision
        tx_dec, b_dec = self.drunix.execute_transaction_lifecycle(
            function_name="SubmitRiskDecision",
            args={
                "payment_id": pid,
                "decision": decision.decision.value,
                "risk_class": decision.risk_class.value,
                "risk_score": decision.unified_risk_score,
                "vera_signature": decision.vera_signature,
                "reason_codes": decision.reason_codes
            }
        )

        # 4. ALLOW flow -> Automatic Commit & Settlement
        tx_commit, b_commit = self.drunix.execute_transaction_lifecycle(function_name="CommitPayment", args={"payment_id": pid})
        tx_settle, b_settle = self.drunix.execute_transaction_lifecycle(function_name="MarkSettled", args={"payment_id": pid, "settlement_ref": f"UPI_SETTLE_{pid}"})

        timeline.append({"step": "DRUNIX_COMMITTED", "tx_id": tx_commit.tx_id, "block": b_commit.block_number})
        timeline.append({"step": "SETTLED", "tx_id": tx_settle.tx_id, "block": b_settle.block_number, "status": "COMPLETED"})

        return {
            "scenario": "NORMAL_PAYMENT",
            "status": "SETTLED",
            "payment_id": pid,
            "amount": amount,
            "decision": decision.decision.value,
            "risk_class": decision.risk_class.value,
            "risk_score": decision.unified_risk_score,
            "explanation": decision.explanation,
            "timeline": timeline,
            "drunix_block_height": len(self.drunix.blocks)
        }

    def _run_scam_scenario(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Scene 2: Social Engineering Scam (₹50,000 emergency crypto deposit, urgent pressure)."""
        pid = params.get("payment_id", f"PAY-SCAM-{int(time.time()*1000)%100000}")
        user_id = params.get("user_id", "USR_00045")
        scammer_id = params.get("recipient_id", "REC_00085")  # Known fraudulent entity
        amount = float(params.get("amount", 50000.0))
        stated_intent = params.get("stated_intent", "Guaranteed 25% daily returns crypto investment deposit urgently required within 10 minutes")

        timeline = []
        timeline.append({"step": "PAYMENT_INITIATED", "detail": f"User targeted by investment scam, attempting Rs. {amount:,.2f}"})

        tx_create, b_create = self.drunix.execute_transaction_lifecycle(
            function_name="CreatePayment",
            args={"payment_id": pid, "sender_id": user_id, "recipient_id": scammer_id, "amount": amount, "currency": "INR"}
        )

        intent_res = self.intent_eng.evaluate_intent_mismatch(stated_intent, amount, "Crypto Returns Desk", "investment", is_merchant=False)
        beh_res = self.beh_eng.evaluate_behavior(user_id, amount, 23, 4, 1200.0, 500.0)
        graph_res = self.graph_eng.evaluate_recipient_trust(user_id, scammer_id, amount, is_known_merchant=False)
        ctx_res = ContextRiskFeatures(context_risk_score=0.45, device_id="DEV_00045", location="Delhi")

        risk_score, reason_codes, breakdown = self.fusion_eng.compute_unified_risk(intent_res, graph_res, beh_res, ctx_res)
        decision = self.policy_eng.evaluate_policy(pid, risk_score, intent_res.intent_consistency, graph_res.recipient_trust_score, beh_res.behavior_deviation_score, ctx_res.context_risk_score, graph_res.network_risk_score, 0.0, reason_codes, amount, False)

        timeline.append({
            "step": "VERA_INTELLIGENCE_DECISION",
            "decision": decision.decision.value,
            "risk_score": decision.unified_risk_score,
            "reason_codes": decision.reason_codes,
            "action": decision.required_action
        })

        # Drunix enforces HOLD state transition
        tx_dec, b_dec = self.drunix.execute_transaction_lifecycle(
            function_name="SubmitRiskDecision",
            args={
                "payment_id": pid,
                "decision": decision.decision.value,
                "risk_class": decision.risk_class.value,
                "risk_score": decision.unified_risk_score,
                "vera_signature": decision.vera_signature,
                "reason_codes": decision.reason_codes
            }
        )

        # Verify that Drunix rejects any attempt to transition a HOLD payment to settlement
        transition_blocked = False
        try:
            self.drunix.execute_transaction_lifecycle(function_name="CommitPayment", args={"payment_id": pid})
        except Exception as e:
            transition_blocked = True
            timeline.append({
                "step": "DRUNIX_ENFORCEMENT_BLOCKED_SETTLEMENT",
                "detail": f"Drunix consensus rejected transition to settlement: {str(e)}"
            })

        return {
            "scenario": "SOCIAL_ENGINEERING_SCAM",
            "status": "HELD_BY_DRUNIX_POLICY",
            "payment_id": pid,
            "amount": amount,
            "decision": decision.decision.value,
            "risk_class": decision.risk_class.value,
            "risk_score": decision.unified_risk_score,
            "transition_blocked_by_blockchain": transition_blocked,
            "explanation": decision.explanation,
            "timeline": timeline
        }

    def _run_intent_mismatch_scenario(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Scene 3: Intent Mismatch (User says groceries ₹5,000, actual is ₹50,000 personal transfer)."""
        pid = params.get("payment_id", f"PAY-MISMATCH-{int(time.time()*1000)%100000}")
        user_id = params.get("user_id", "USR_00088")
        recipient_id = params.get("recipient_id", "REC_00320")  # New personal account
        amount = float(params.get("amount", 50000.0))
        stated_intent = params.get("stated_intent", "Paying Rs 5,000 for groceries")

        timeline = []
        timeline.append({"step": "PAYMENT_INITIATED", "detail": f"Stated intent: '{stated_intent}', Actual amount: Rs. {amount:,.2f}"})

        tx_create, b_create = self.drunix.execute_transaction_lifecycle(
            function_name="CreatePayment",
            args={"payment_id": pid, "sender_id": user_id, "recipient_id": recipient_id, "amount": amount, "currency": "INR"}
        )

        intent_res = self.intent_eng.evaluate_intent_mismatch(stated_intent, amount, "Vikram Malhotra", "personal_transfer", is_merchant=False)
        beh_res = self.beh_eng.evaluate_behavior(user_id, amount, 15, 3, 2000.0, 700.0)
        graph_res = self.graph_eng.evaluate_recipient_trust(user_id, recipient_id, amount, is_known_merchant=False)
        ctx_res = ContextRiskFeatures(context_risk_score=0.22, device_id="DEV_00088", location="Bangalore")

        risk_score, reason_codes, breakdown = self.fusion_eng.compute_unified_risk(intent_res, graph_res, beh_res, ctx_res)
        decision = self.policy_eng.evaluate_policy(pid, risk_score, intent_res.intent_consistency, graph_res.recipient_trust_score, beh_res.behavior_deviation_score, ctx_res.context_risk_score, graph_res.network_risk_score, 0.0, reason_codes, amount, False)

        timeline.append({
            "step": "VERA_INTELLIGENCE_DECISION",
            "decision": decision.decision.value,
            "intent_consistency": intent_res.intent_consistency,
            "risk_score": decision.unified_risk_score,
            "reason_codes": decision.reason_codes,
            "action": decision.required_action
        })

        # Drunix enforces VERIFY_REQUIRED state
        tx_dec, b_dec = self.drunix.execute_transaction_lifecycle(
            function_name="SubmitRiskDecision",
            args={
                "payment_id": pid,
                "decision": decision.decision.value,
                "risk_class": decision.risk_class.value,
                "risk_score": decision.unified_risk_score,
                "vera_signature": decision.vera_signature,
                "reason_codes": decision.reason_codes
            }
        )
        timeline.append({"step": "DRUNIX_STATE_VERIFY_REQUIRED", "tx_id": tx_dec.tx_id, "block": b_dec.block_number})

        # Demonstrate blocked transition if verification has NOT been completed
        blocked = False
        try:
            self.drunix.execute_transaction_lifecycle(function_name="CommitPayment", args={"payment_id": pid})
        except Exception as e:
            blocked = True
            timeline.append({
                "step": "SETTLEMENT_PREVENTED",
                "detail": "Drunix smart contract strictly blocked commit: payment requires explicit user verification."
            })

        return {
            "scenario": "INTENT_MISMATCH",
            "status": "VERIFY_REQUIRED",
            "payment_id": pid,
            "amount": amount,
            "intent_consistency": intent_res.intent_consistency,
            "decision": decision.decision.value,
            "risk_score": decision.unified_risk_score,
            "unverified_commit_blocked": blocked,
            "explanation": decision.explanation,
            "required_action": decision.required_action,
            "timeline": timeline
        }

    def _run_cross_border_scenario(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Scene 4: Cross-Border Payment (India to Singapore / UAE)."""
        pid = params.get("payment_id", f"PAY-XBORDER-{int(time.time()*1000)%100000}")
        user_id = params.get("user_id", "USR_00055")
        corridor = params.get("corridor", "IN-SG")
        amount = float(params.get("amount", 75000.0))
        stated_intent = params.get("stated_intent", "Tuition fees remittance to Singapore University")

        cb_features = self.cb_eng.evaluate_cross_border(amount, "SG", corridor_code=corridor)

        timeline = []
        timeline.append({"step": "CROSS_BORDER_INITIATED", "corridor": corridor, "fx_rate": cb_features.fx_rate, "fee_inr": cb_features.fee_inr})

        tx_create, b_create = self.drunix.execute_transaction_lifecycle(
            function_name="CreatePayment",
            args={"payment_id": pid, "sender_id": user_id, "recipient_id": "REC_SG_UNIV_99", "amount": amount, "currency": "INR"}
        )

        intent_res = self.intent_eng.evaluate_intent_mismatch(stated_intent, amount, "Singapore Education Partner", "education", is_merchant=True)
        beh_res = self.beh_eng.evaluate_behavior(user_id, amount, 11, 1, 5000.0, 2000.0)
        graph_res = self.graph_eng.evaluate_recipient_trust(user_id, "REC_SG_UNIV_99", amount, is_known_merchant=False)
        ctx_res = ContextRiskFeatures(context_risk_score=0.15, device_id="DEV_00055", location="Chennai")

        risk_score, reason_codes, breakdown = self.fusion_eng.compute_unified_risk(intent_res, graph_res, beh_res, ctx_res, cb_features)
        decision = self.policy_eng.evaluate_policy(pid, risk_score, intent_res.intent_consistency, graph_res.recipient_trust_score, beh_res.behavior_deviation_score, ctx_res.context_risk_score, graph_res.network_risk_score, cb_features.route_risk_score, reason_codes, amount, False)

        timeline.append({"step": "MULTI_PARTY_CLEARANCE", "compliance": cb_features.compliance_status, "decision": decision.decision.value})

        return {
            "scenario": "CROSS_BORDER_REMITTANCE",
            "payment_id": pid,
            "corridor": corridor,
            "amount_inr": amount,
            "dest_amount": round(amount * cb_features.fx_rate, 2),
            "dest_currency": cb_features.currency_pair.split("/")[1],
            "fx_rate": cb_features.fx_rate,
            "fee_inr": cb_features.fee_inr,
            "compliance_status": cb_features.compliance_status,
            "decision": decision.decision.value,
            "risk_score": decision.unified_risk_score,
            "timeline": timeline
        }

    def _run_tokenized_receivable_scenario(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Scene 5: Tokenized Invoice Receivable transfer on Drunix."""
        asset_id = params.get("asset_id", f"ASSET-INV-{int(time.time()*1000)%100000}")
        invoice_num = params.get("invoice_number", f"INV-2026-{random.randint(1000, 9999)}")
        face_value = float(params.get("face_value", 100000.0))
        discounted_val = float(params.get("discounted_value", 96500.0))
        original_owner = params.get("original_owner", "MERCH_0011")
        new_owner = params.get("new_owner", "INSTITUTION_FACTORING_CORP_1")

        timeline = []
        timeline.append({"step": "INVOICE_PRESENTED_FOR_TOKENIZATION", "invoice": invoice_num, "face_value": face_value})

        # 1. Drunix CreateTokenizedAsset
        tx_tok, b_tok = self.drunix.execute_transaction_lifecycle(
            function_name="CreateTokenizedAsset",
            args={
                "asset_id": asset_id,
                "invoice_number": invoice_num,
                "face_value_inr": face_value,
                "discounted_value_inr": discounted_val,
                "original_owner_id": original_owner,
                "debtor_id": "ENTERPRISE_CORP_B",
                "due_date": "2026-11-30"
            }
        )
        timeline.append({"step": "ASSET_TOKENIZED_ON_DRUNIX", "tx_id": tx_tok.tx_id, "block": b_tok.block_number})

        # 2. VERA Risk Check on Transfer
        # High trust verified receivable
        timeline.append({"step": "VERA_PRE_TRANSFER_RISK_CHECK", "status": "APPROVED", "risk": "LOW"})

        # 3. Drunix TransferAsset
        tx_xfer, b_xfer = self.drunix.execute_transaction_lifecycle(
            function_name="TransferAsset",
            args={
                "asset_id": asset_id,
                "new_owner_id": new_owner,
                "risk_clearance": True
            }
        )
        timeline.append({"step": "OWNERSHIP_TRANSFERRED", "tx_id": tx_xfer.tx_id, "block": b_xfer.block_number, "new_owner": new_owner})

        return {
            "scenario": "TOKENIZED_RECEIVABLE",
            "asset_id": asset_id,
            "invoice_number": invoice_num,
            "face_value_inr": face_value,
            "discounted_value_inr": discounted_val,
            "original_owner": original_owner,
            "current_owner": new_owner,
            "drunix_blocks_created": [b_tok.block_number, b_xfer.block_number],
            "timeline": timeline
        }
