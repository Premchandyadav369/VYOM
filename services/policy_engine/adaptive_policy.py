"""
VERA Adaptive Policy Engine
Optimizes the trade-off between Safety and Legitimate User Friction.
Derives ALLOW / VERIFY / HOLD policy decisions, generates human-readable explanations,
and cryptographically signs the decision for Drunix ledger verification.
"""

import hmac
import hashlib
import json
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
from data.schemas.models import (
    PolicyDecision,
    RiskClass,
    UnifiedRiskDecision
)

SIGNING_KEY = os.getenv("VERA_SERVICE_SIGNING_KEY", "vera_ed25519_service_signing_private_key_demo_secret")


class AdaptivePolicyEngine:
    """Evaluates multi-modal risk and applies safety-friction optimized policy thresholds."""

    def __init__(
        self,
        allow_threshold: float = 0.35,
        verify_threshold: float = 0.70,
        policy_version: str = "vera-policy-v1"
    ):
        self.allow_threshold = allow_threshold
        self.verify_threshold = verify_threshold
        self.policy_version = policy_version

    def evaluate_policy(
        self,
        payment_id: str,
        unified_risk: float,
        intent_consistency: float,
        recipient_trust: float,
        behavior_deviation: float,
        context_risk: float,
        network_risk: float,
        cross_border_risk: float,
        reason_codes: List[str],
        amount: float,
        is_known_recipient: bool
    ) -> UnifiedRiskDecision:
        """
        Calculates optimal policy decision:
        - LOW risk -> ALLOW
        - MEDIUM risk -> VERIFY (targeted friction)
        - HIGH risk -> HOLD (intervene and halt execution)
        """
        # Dynamic policy threshold modulation based on amount and novelty
        dynamic_allow = self.allow_threshold
        dynamic_verify = self.verify_threshold

        # High value (> ₹25,000) tightens verification threshold
        if amount > 25000:
            dynamic_allow -= 0.05
            dynamic_verify -= 0.05

        # Very low value (< ₹500) and moderate trust relaxes friction
        if amount < 500 and recipient_trust > 0.6:
            dynamic_allow += 0.10

        # Determine decision
        if unified_risk <= dynamic_allow:
            decision = PolicyDecision.ALLOW
            risk_class = RiskClass.LOW
            required_action = None
        elif unified_risk <= dynamic_verify:
            decision = PolicyDecision.VERIFY
            risk_class = RiskClass.MEDIUM
            if not is_known_recipient:
                required_action = "Confirm recipient identity and payment purpose via secondary authentication"
            elif "AMOUNT_DEVIATION_FROM_INTENT" in reason_codes or "AMOUNT_SIGNIFICANT_OUTLIER" in reason_codes:
                required_action = "Confirm payment amount above your typical transaction threshold"
            else:
                required_action = "Review payment purpose and relationship confirmation"
        else:
            decision = PolicyDecision.HOLD
            risk_class = RiskClass.HIGH
            required_action = "Transaction suspended. Contact your bank or security desk to verify recipient safety."

        # Compute Safety-Friction Efficiency score (SFE metric)
        # Prevents high friction when risk is low; rewards targeted friction when risk is real
        if decision == PolicyDecision.ALLOW:
            friction_cost = 0.02
            harm_prevented = 0.0
        elif decision == PolicyDecision.VERIFY:
            friction_cost = 0.25
            harm_prevented = unified_risk * 0.90
        else:  # HOLD
            friction_cost = 0.85
            harm_prevented = unified_risk * 0.98

        sfe_score = round(harm_prevented / max(0.01, friction_cost), 3)

        # Generate human-readable explanation
        explanation = self._generate_explanation(decision, reason_codes, amount, intent_consistency, recipient_trust)

        # Generate cryptographic signature for Drunix endorsement
        sig_payload = f"{payment_id}:{decision.value}:{risk_class.value}:{unified_risk:.4f}:{self.policy_version}"
        vera_signature = hmac.new(
            SIGNING_KEY.encode(),
            sig_payload.encode(),
            hashlib.sha256
        ).hexdigest()

        decision_id = f"DEC-{hashlib.sha256(sig_payload.encode()).hexdigest()[:12].upper()}"

        return UnifiedRiskDecision(
            decision_id=decision_id,
            payment_id=payment_id,
            decision=decision,
            risk_class=risk_class,
            unified_risk_score=unified_risk,
            intent_consistency=intent_consistency,
            recipient_trust=recipient_trust,
            behavior_deviation=behavior_deviation,
            context_risk=context_risk,
            network_risk=network_risk,
            cross_border_risk=cross_border_risk,
            policy_version=self.policy_version,
            safety_friction_score=sfe_score,
            reason_codes=reason_codes,
            explanation=explanation,
            required_action=required_action,
            vera_signature=vera_signature,
            timestamp=datetime.utcnow()
        )

    def _generate_explanation(
        self,
        decision: PolicyDecision,
        reason_codes: List[str],
        amount: float,
        intent_consistency: float,
        recipient_trust: float
    ) -> str:
        """Constructs plain English explanation suitable for users and compliance audits."""
        if decision == PolicyDecision.ALLOW:
            return "Payment passed all intent verification checks. Recipient, transaction history, and behavioral context are consistent."

        bullet_points = []
        code_descriptions = {
            "NEW_UNVERIFIED_RECIPIENT": "Recipient has never received payments from your account before.",
            "AMOUNT_DEVIATION_FROM_INTENT": f"Payment amount of Rs. {amount:,.2f} deviates significantly from the stated payment purpose.",
            "AMOUNT_SIGNIFICANT_OUTLIER": f"Amount is significantly higher than your historical median payment volume.",
            "RECIPIENT_TYPE_MISMATCH": "Payment purpose implies a business/merchant purchase, but the destination account is classified as personal.",
            "INTENT_MISMATCH": "Discrepancy detected between what you described and the transaction parameters.",
            "MULE_NETWORK_CLUSTER_DETECTED": "Recipient account exhibits structural graph patterns linked to high-velocity mule networks.",
            "COERCIVE_LANGUAGE_OR_URGENCY_DETECTED": "Language in the payment intent indicates potential urgency pressure or social engineering scam.",
            "UNKNOWN_NEW_DEVICE": "Payment initiated from a device that hasn't been used on your account.",
            "ANOMALOUS_GEOLOCATION": "Transaction initiated from a location inconsistent with recent session history.",
            "HIGH_RISK_DESTINATION_JURISDICTION": "Cross-border destination country requires enhanced regulatory due diligence."
        }

        for code in reason_codes:
            if code in code_descriptions:
                bullet_points.append(f"• {code_descriptions[code]}")

        if not bullet_points:
            bullet_points.append("• Transaction context differs from historical baseline behavior.")

        action_phrase = "VERIFY PAYMENT" if decision == PolicyDecision.VERIFY else "PAYMENT HELD FOR PROTECTION"
        return f"{action_phrase}\n\nWhy?\n" + "\n".join(bullet_points)
