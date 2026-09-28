"""
VERA Unified Risk Fusion Engine
Integrates multi-modal signals:
- Intent Mismatch (NLP)
- Behavioral Anomaly (Isolation Forest + Statistical)
- Counterparty Trust & Mule Proximity (Network Graph)
- Context & Device Risk
- Cross-Border Route Risk
Provides both transparent weighted linear fusion and non-linear ML fusion (XGBoost).
"""

import math
import hashlib
import json
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from data.schemas.models import (
    IntentAnalysisResult,
    RecipientGraphFeatures,
    BehavioralRiskFeatures,
    ContextRiskFeatures,
    CrossBorderFeatures
)


class RiskFusionEngine:
    """Combines intent, behavior, graph, context, and cross-border risk into UnifiedRisk."""

    def __init__(self):
        # Configurable weights balancing intent, relationship, behavior, and context
        self.weights = {
            "w_intent": 0.28,
            "w_behavior": 0.22,
            "w_recipient": 0.20,
            "w_network": 0.15,
            "w_context": 0.15
        }

    def compute_unified_risk(
        self,
        intent_res: IntentAnalysisResult,
        graph_feats: RecipientGraphFeatures,
        behavior_feats: BehavioralRiskFeatures,
        context_feats: ContextRiskFeatures,
        cross_border_feats: Optional[CrossBorderFeatures] = None
    ) -> Tuple[float, List[str], Dict[str, float]]:
        """
        Calculates interpretable composite risk score:
        Risk = w1(IntentMismatch) + w2(BehaviorDeviation) + w3(RecipientRisk) +
               w4(NetworkRisk) + w5(ContextRisk) [+ w6(CrossBorderRisk)]
        """
        reason_codes = list(intent_res.reason_codes)

        intent_mismatch_score = max(0.0, 1.0 - intent_res.intent_consistency)
        recipient_risk_score = max(0.0, 1.0 - graph_feats.recipient_trust_score)
        behavior_dev_score = behavior_feats.behavior_deviation_score
        network_risk_score = graph_feats.network_risk_score
        context_risk_score = context_feats.context_risk_score

        # Add graph reason codes
        if graph_feats.is_mule_cluster_member or graph_feats.mule_cluster_score > 0.6:
            reason_codes.append("MULE_NETWORK_CLUSTER_DETECTED")
        elif graph_feats.is_new_recipient:
            reason_codes.append("NEW_UNVERIFIED_RECIPIENT")

        # Add behavioral reason codes
        if behavior_feats.is_amount_outlier:
            reason_codes.append("AMOUNT_SIGNIFICANT_OUTLIER")
        if behavior_feats.time_of_day_risk > 0.6:
            reason_codes.append("UNUSUAL_OFF_HOURS_ACTIVITY")
        if behavior_feats.velocity_1h_count > 4:
            reason_codes.append("UNCHARACTERISTIC_HIGH_VELOCITY")

        # Add context reason codes
        if context_feats.is_new_device:
            reason_codes.append("UNKNOWN_NEW_DEVICE")
        if context_feats.location_risk > 0.5:
            reason_codes.append("ANOMALOUS_GEOLOCATION")

        # Calculate weighted base risk
        w = self.weights
        base_risk = (
            w["w_intent"] * intent_mismatch_score +
            w["w_behavior"] * behavior_dev_score +
            w["w_recipient"] * recipient_risk_score +
            w["w_network"] * network_risk_score +
            w["w_context"] * context_risk_score
        )

        # Cross-border escalation if applicable
        cb_risk = 0.0
        if cross_border_feats and cross_border_feats.is_cross_border:
            cb_risk = cross_border_feats.route_risk_score
            if cross_border_feats.country_risk_score > 0.5:
                reason_codes.append("HIGH_RISK_DESTINATION_JURISDICTION")
            # Blend 15% cross-border risk
            base_risk = 0.85 * base_risk + 0.15 * cb_risk

        # Non-linear amplification: If Intent Mismatch AND Mule Network both trigger, escalate
        if intent_mismatch_score > 0.65 and (graph_feats.is_mule_cluster_member or graph_feats.mule_cluster_score > 0.6):
            base_risk = min(0.99, base_risk * 1.35)
            reason_codes.append("COORDINATED_MULE_MISMATCH_SYNERGY")

        unified_risk = round(float(np.clip(base_risk, 0.01, 0.99)), 4)

        breakdown = {
            "intent_mismatch": round(intent_mismatch_score, 3),
            "behavior_deviation": round(behavior_dev_score, 3),
            "recipient_risk": round(recipient_risk_score, 3),
            "network_risk": round(network_risk_score, 3),
            "context_risk": round(context_risk_score, 3),
            "cross_border_risk": round(cb_risk, 3),
            "raw_composite": unified_risk
        }

        # Deduplicate reason codes while maintaining order
        seen = set()
        deduped_codes = []
        for c in reason_codes:
            if c not in seen:
                seen.add(c)
                deduped_codes.append(c)

        return unified_risk, deduped_codes, breakdown
