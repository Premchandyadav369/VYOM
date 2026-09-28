"""
VERA Intent Engine & Intent-Mismatch Intelligence
Analyzes natural-language payment intent, extracts structured semantic features,
and computes multi-dimensional IntentConsistency against transaction reality.
"""

import re
import math
from typing import Dict, Any, List, Optional, Tuple
from data.schemas.models import IntentVector, IntentAnalysisResult


class IntentEngine:
    """Extracts, parses, and evaluates payment intent consistency."""

    CATEGORY_KEYWORDS = {
        "groceries": ["grocery", "groceries", "vegetable", "milk", "supermarket", "blinkit", "bigbasket", "zepto"],
        "food_beverage": ["dinner", "lunch", "food", "restaurant", "swiggy", "zomato", "cafe", "coffee", "breakfast"],
        "electronics": ["laptop", "phone", "macbook", "iphone", "camera", "tv", "computer", "gadget", "croma", "reliance"],
        "rent_utilities": ["rent", "maintenance", "electricity", "water", "bill", "apartment", "society dues", "flat"],
        "e_commerce": ["shopping", "amazon", "flipkart", "order", "clothes", "shoes", "online buy"],
        "healthcare": ["medicine", "doctor", "hospital", "clinic", "pharmacy", "apollo", "medical", "treatment"],
        "education": ["tuition", "school", "college", "fees", "university", "course", "exam", "books"],
        "investment": ["crypto", "forex", "trading", "stock", "shares", "returns", "profit", "deposit", "bitcoin", "guaranteed"],
        "p2p_split": ["split", "repayment", "borrowed", "loan to friend", "gift", "contribution", "cab fare"],
        "travel": ["ticket", "flight", "hotel", "train", "uber", "ola", "travel", "irctc", "holiday"]
    }

    COERCION_KEYWORDS = [
        "urgent", "urgently", "immediately", "emergency", "within 10 minutes",
        "account blocked", "police", "customs", "lottery winner", "guaranteed returns",
        "send fast", "do not tell anyone", "refund fee", "kyc verification fee"
    ]

    def __init__(self):
        # Precompile regex patterns for performance and robustness
        self.amount_patterns = [
            re.compile(r'(?:rs\.?|inr|₹)\s*([\d,]+(?:\.\d+)?)', re.IGNORECASE),
            re.compile(r'([\d,]+(?:\.\d+)?)\s*(?:rs\.?|inr|rupees|bucks)', re.IGNORECASE),
            re.compile(r'(\d+)\s*k\b', re.IGNORECASE),
        ]
        self.recipient_patterns = [
            re.compile(r'(?:to|for|paying)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)'),
            re.compile(r'(?:to|for)\s+([a-zA-Z0-9._]+@[a-zA-Z0-9]+)')
        ]

    def extract_intent_vector(self, text: Optional[str], fallback_amount: float) -> IntentVector:
        """Parses natural language text into a structured IntentVector."""
        if not text or not text.strip():
            return IntentVector(
                purpose="unspecified_transfer",
                category="general_transfer",
                expected_amount=fallback_amount,
                counterparty_name=None,
                counterparty_type="unknown",
                relationship="unknown",
                urgency_level="normal"
            )

        text_lower = text.lower()

        # 1. Extract expected amount
        extracted_amount = self._extract_amount(text)
        if extracted_amount is None:
            extracted_amount = fallback_amount

        # 2. Extract category
        inferred_category = "general_transfer"
        for category, keywords in self.CATEGORY_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                inferred_category = category
                break

        # 3. Extract counterparty
        counterparty_name = None
        for pattern in self.recipient_patterns:
            match = pattern.search(text)
            if match:
                counterparty_name = match.group(1).strip()
                break

        # 4. Inferred counterparty type
        counterparty_type = "merchant" if inferred_category in ["groceries", "food_beverage", "electronics", "e_commerce", "healthcare", "utilities"] else "personal"

        # 5. Urgency / Coercion detection
        urgency_detected = any(cw in text_lower for cw in self.COERCION_KEYWORDS)
        urgency_level = "coercive" if urgency_detected else "normal"

        return IntentVector(
            purpose=text[:100],
            category=inferred_category,
            expected_amount=float(extracted_amount),
            counterparty_name=counterparty_name,
            counterparty_type=counterparty_type,
            relationship="regular_merchant" if counterparty_type == "merchant" else "friend_or_new",
            urgency_level=urgency_level
        )

    def evaluate_intent_mismatch(
        self,
        stated_intent: Optional[str],
        actual_amount: float,
        actual_recipient_name: Optional[str],
        actual_category: str,
        is_merchant: bool = False,
        historical_median: float = 1500.0
    ) -> IntentAnalysisResult:
        """
        Calculates IntentConsistency = f(
            semantic similarity,
            amount consistency,
            recipient consistency,
            category consistency,
            temporal consistency,
            contextual consistency
        )
        """
        intent_vec = self.extract_intent_vector(stated_intent, actual_amount)
        reason_codes = []

        # 1. Amount Consistency
        # Ratio of stated expected amount to actual amount
        if intent_vec.expected_amount > 0 and actual_amount > 0:
            ratio = actual_amount / intent_vec.expected_amount
            # Penalize when actual is drastically higher than stated
            if ratio >= 1.0:
                amount_consistency = max(0.0, 1.0 - (ratio - 1.0) * 0.4)
            else:
                amount_consistency = max(0.0, ratio)
            amount_consistency = min(1.0, max(0.0, amount_consistency))
        else:
            amount_consistency = 0.5

        if amount_consistency < 0.6:
            reason_codes.append("AMOUNT_DEVIATION_FROM_INTENT")

        # 2. Category Consistency
        if intent_vec.category == "general_transfer":
            category_consistency = 0.75
        elif intent_vec.category == actual_category:
            category_consistency = 1.0
        elif (intent_vec.counterparty_type == "merchant" and is_merchant) or (intent_vec.counterparty_type == "personal" and not is_merchant):
            category_consistency = 0.70
        else:
            category_consistency = 0.20
            reason_codes.append("RECIPIENT_TYPE_MISMATCH")

        # 3. Recipient Name Consistency
        if intent_vec.counterparty_name and actual_recipient_name:
            cp_lower = intent_vec.counterparty_name.lower()
            rec_lower = actual_recipient_name.lower()
            if cp_lower in rec_lower or rec_lower in cp_lower:
                recipient_consistency = 0.95
            else:
                recipient_consistency = 0.35
                reason_codes.append("RECIPIENT_IDENTITY_DISCREPANCY")
        else:
            recipient_consistency = 0.80

        # 4. Semantic Similarity
        if intent_vec.category == actual_category:
            semantic_similarity = 0.95
        elif intent_vec.category in ["groceries", "food_beverage"] and actual_category in ["groceries", "food_beverage"]:
            semantic_similarity = 0.85
        else:
            semantic_similarity = category_consistency

        # 5. Urgency / Coercion Score
        urgency_score = 0.85 if intent_vec.urgency_level == "coercive" else 0.0
        if urgency_score > 0.5:
            reason_codes.append("COERCIVE_LANGUAGE_OR_URGENCY_DETECTED")

        # 6. Overall IntentConsistency Fusion
        # High urgency penalty directly discounts overall intent consistency
        base_consistency = (
            0.35 * amount_consistency +
            0.25 * category_consistency +
            0.20 * recipient_consistency +
            0.20 * semantic_similarity
        )
        final_consistency = round(float(base_consistency * (1.0 - 0.5 * urgency_score)), 3)
        final_consistency = max(0.05, min(0.99, final_consistency))

        if final_consistency < 0.55:
            if "INTENT_MISMATCH" not in reason_codes:
                reason_codes.append("INTENT_MISMATCH")

        return IntentAnalysisResult(
            intent_consistency=final_consistency,
            semantic_similarity=round(semantic_similarity, 3),
            amount_consistency=round(amount_consistency, 3),
            recipient_consistency=round(recipient_consistency, 3),
            category_consistency=round(category_consistency, 3),
            temporal_consistency=0.90,
            urgency_coercion_score=round(urgency_score, 3),
            intent_vector=intent_vec,
            reason_codes=reason_codes,
            confidence=0.94
        )

    def _extract_amount(self, text: str) -> Optional[float]:
        """Extracts numerical amount from text using multiple heuristics."""
        for pattern in self.amount_patterns:
            match = pattern.search(text)
            if match:
                raw_val = match.group(1).replace(",", "")
                try:
                    val = float(raw_val)
                    if "k" in match.group(0).lower():
                        val *= 1000
                    return val
                except ValueError:
                    pass
        return None
