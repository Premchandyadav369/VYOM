"""
VERA-PINT Synthetic Ecosystem & Benchmark Generator
Payment Intent & Network Trust Benchmark
Generates synthetic users, merchants, recipients, institutions, and
ground-truth labeled transaction scenarios with deterministic seed (42).
"""

import random
import hashlib
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
import numpy as np
from data.schemas.models import ScenarioType


class SyntheticEcosystemGenerator:
    """Generates synthetic banking network entities and transactions."""

    def __init__(self, seed: int = 42):
        self.seed = seed
        random.seed(seed)
        np.random.seed(seed)

        self.users: List[Dict[str, Any]] = []
        self.merchants: List[Dict[str, Any]] = []
        self.recipients: List[Dict[str, Any]] = []
        self.institutions: List[str] = [
            "HDFC_BANK_MSP", "SBI_MSP", "ICICI_MSP", "AXIS_MSP",
            "NPCI_OPERATOR_MSP", "REMITTANCE_PARTNER_MSP", "FINTECH_PSP_MSP"
        ]

        self.mule_cluster_recipients: set = set()
        self.known_fraud_recipients: set = set()
        self._initialize_entities()

    def _initialize_entities(self, n_users: int = 1000, n_merchants: int = 200, n_recipients: int = 2000):
        """Initializes simulated entity profiles."""
        # 1. Merchants
        merchant_names = [
            ("Swiggy Foods", "food_beverage", 450.0),
            ("Zomato Orders", "food_beverage", 520.0),
            ("Blinkit Quick", "groceries", 850.0),
            ("BigBasket Retail", "groceries", 1800.0),
            ("Amazon India", "e-commerce", 2400.0),
            ("Flipkart Internet", "e-commerce", 3100.0),
            ("Uber India", "mobility", 380.0),
            ("Ola Cabs", "mobility", 420.0),
            ("Tata Power Utility", "utilities", 2200.0),
            ("Airtel Postpaid", "telecom", 799.0),
            ("Croma Electronics", "electronics", 28000.0),
            ("Reliance Digital", "electronics", 35000.0),
            ("Apollo Pharmacy", "healthcare", 650.0),
            ("CultFit Health", "fitness", 12500.0),
            ("Decathlon Sports", "retail", 4200.0),
        ]

        for i in range(n_merchants):
            base = merchant_names[i % len(merchant_names)]
            mid = f"MERCH_{i+1:04d}"
            self.merchants.append({
                "merchant_id": mid,
                "name": f"{base[0]} #{i+1}",
                "category": base[1],
                "avg_ticket_size": base[2],
                "trust_score": round(random.uniform(0.85, 0.99), 3),
                "is_verified": True,
                "created_days_ago": random.randint(300, 1500)
            })

        # 2. Recipients (P2P accounts, businesses, mules)
        first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Reyansh", "Muhammad", "Sai", "Arnav", "Ayaan",
                       "Krishna", "Ishaan", "Shaurya", "Atharva", "Advik", "Pranav", "Advaith", "Aaryan", "Dhruv", "Kabir",
                       "Ananya", "Diya", "Isha", "Aditi", "Pooja", "Priya", "Sneha", "Kavya", "Tanvi", "Meera"]
        last_names = ["Sharma", "Verma", "Patel", "Yadav", "Singh", "Kumar", "Gupta", "Reddy", "Nair", "Iyer",
                      "Chopra", "Joshi", "Bose", "Mehta", "Bhat", "Rao", "Das", "Mukherjee", "Kapoor", "Agarwal"]

        for i in range(n_recipients):
            rid = f"REC_{i+1:05d}"
            fname = first_names[i % len(first_names)]
            lname = last_names[(i // len(first_names)) % len(last_names)]
            vpa = f"{fname.lower()}.{lname.lower()}{i+1}@okaxis"
            
            # Determine if this recipient is part of a mule network
            is_mule = (i < 80)
            is_fraud = (80 <= i < 150)
            if is_mule:
                self.mule_cluster_recipients.add(rid)
            if is_fraud:
                self.known_fraud_recipients.add(rid)

            self.recipients.append({
                "recipient_id": rid,
                "name": f"{fname} {lname}",
                "vpa": vpa,
                "account_age_days": random.randint(1, 20) if is_mule else random.randint(45, 1200),
                "is_mule": is_mule,
                "is_known_fraud": is_fraud,
                "reputation_score": round(random.uniform(0.1, 0.3) if (is_mule or is_fraud) else random.uniform(0.65, 0.95), 3),
                "institution": random.choice(self.institutions)
            })

        # 3. Users (Consumers initiating payments)
        cities = ["Mumbai", "Bangalore", "Delhi", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur"]
        for i in range(n_users):
            uid = f"USR_{i+1:05d}"
            fname = first_names[(i + 5) % len(first_names)]
            lname = last_names[(i + 7) % len(last_names)]
            median_tx = random.choice([800, 1500, 2500, 5000, 12000])
            home_city = random.choice(cities)

            # Assign preferred merchants & known recipients
            frequent_merchants = [m["merchant_id"] for m in random.sample(self.merchants, k=min(6, len(self.merchants)))]
            trusted_p2p = [r["recipient_id"] for r in random.sample(self.recipients[150:], k=min(10, len(self.recipients)-150))]

            self.users.append({
                "user_id": uid,
                "name": f"{fname} {lname}",
                "home_city": home_city,
                "device_id": f"DEV_{hashlib.md5(uid.encode()).hexdigest()[:10]}",
                "median_amount": median_tx,
                "amount_std": median_tx * 0.4,
                "frequent_merchants": frequent_merchants,
                "trusted_p2p": trusted_p2p,
                "account_age_days": random.randint(180, 1500),
                "risk_tolerance": random.choice(["conservative", "standard", "flexible"])
            })

    def generate_benchmark_dataset(self, num_samples: int = 5000) -> List[Dict[str, Any]]:
        """
        Generates ground-truth labeled benchmark dataset across 10 realistic scenarios.
        Balanced across legitimate, accidental, scam, ATO, mule, and cross-border payments.
        """
        transactions = []
        base_time = datetime(2026, 9, 1, 9, 0, 0)

        # Scenario distribution
        scenario_distribution = [
            (ScenarioType.NORMAL, 0.50),
            (ScenarioType.NEW_RECIPIENT, 0.12),
            (ScenarioType.WRONG_RECIPIENT, 0.05),
            (ScenarioType.SOCIAL_ENGINEERING, 0.08),
            (ScenarioType.ACCOUNT_TAKEOVER, 0.05),
            (ScenarioType.MULE_NETWORK, 0.05),
            (ScenarioType.HIGH_VALUE_ANOMALY, 0.04),
            (ScenarioType.INTENT_MISMATCH, 0.05),
            (ScenarioType.CROSS_BORDER, 0.04),
            (ScenarioType.TOKENIZED_ASSET_TRANSFER, 0.02)
        ]

        scenarios_weighted = []
        for sc, weight in scenario_distribution:
            scenarios_weighted.extend([sc] * int(weight * 100))

        for idx in range(num_samples):
            scenario = random.choice(scenarios_weighted)
            user = random.choice(self.users)
            tx_id = f"PAY-{idx+1:06d}"
            tx_time = base_time + timedelta(minutes=idx * 7 + random.randint(0, 180))

            tx = self._generate_scenario_transaction(tx_id, user, scenario, tx_time)
            transactions.append(tx)

        return transactions

    def _generate_scenario_transaction(
        self, tx_id: str, user: Dict[str, Any], scenario: ScenarioType, tx_time: datetime
    ) -> Dict[str, Any]:
        """Synthesizes a transaction matching a specific scenario profile."""
        uid = user["user_id"]
        med_amt = user["median_amount"]
        dev_id = user["device_id"]
        loc = user["home_city"]

        is_cross_border = False
        dest_country = "IN"
        currency = "INR"
        corridor = None
        merchant_id = None

        if scenario == ScenarioType.NORMAL:
            # Regular merchant or trusted friend
            if random.random() < 0.65:
                mid = random.choice(user["frequent_merchants"])
                m = next(m for m in self.merchants if m["merchant_id"] == mid)
                merchant_id = mid
                recipient_id = mid
                amount = round(max(50.0, np.random.normal(m["avg_ticket_size"], m["avg_ticket_size"] * 0.2)), 2)
                stated_intent = f"Paying {m['name']} for regular {m['category']}"
                actual_category = m["category"]
                recipient_trust = m["trust_score"]
                is_new_recipient = False
            else:
                recipient_id = random.choice(user["trusted_p2p"])
                r = next(r for r in self.recipients if r["recipient_id"] == recipient_id)
                amount = round(max(100.0, np.random.normal(med_amt, user["amount_std"])), 2)
                stated_intent = f"Dinner split payment to {r['name']}"
                actual_category = "p2p_split"
                recipient_trust = round(random.uniform(0.85, 0.96), 3)
                is_new_recipient = False

            intent_consistency = round(random.uniform(0.88, 0.99), 3)
            behavior_deviation = round(random.uniform(0.05, 0.25), 3)
            network_risk = round(random.uniform(0.05, 0.20), 3)
            context_risk = round(random.uniform(0.05, 0.18), 3)
            risk_label = 0  # Legitimate
            expected_decision = "ALLOW"

        elif scenario == ScenarioType.NEW_RECIPIENT:
            # First-time friend or small service provider, normal ticket size
            candidate_recipients = [r for r in self.recipients[150:] if r["recipient_id"] not in user["trusted_p2p"]]
            r = random.choice(candidate_recipients)
            recipient_id = r["recipient_id"]
            amount = round(max(200.0, np.random.normal(med_amt * 1.2, user["amount_std"])), 2)
            stated_intent = f"Transfer to {r['name']} for carpentry repair work"
            actual_category = "home_services"
            recipient_trust = round(random.uniform(0.55, 0.75), 3)
            is_new_recipient = True
            intent_consistency = round(random.uniform(0.75, 0.90), 3)
            behavior_deviation = round(random.uniform(0.25, 0.45), 3)
            network_risk = round(random.uniform(0.20, 0.35), 3)
            context_risk = round(random.uniform(0.15, 0.30), 3)
            risk_label = 0  # Legitimate, but warrants modest verification if amount high
            expected_decision = "ALLOW" if amount < 5000 else "VERIFY"

        elif scenario == ScenarioType.WRONG_RECIPIENT:
            # Accidental mistyped VPA
            wrong_rec = random.choice(self.recipients[200:])
            recipient_id = wrong_rec["recipient_id"]
            amount = round(max(500.0, np.random.normal(med_amt * 2.0, user["amount_std"])), 2)
            stated_intent = f"Monthly maintenance dues payment to apartment RWA"
            actual_category = "personal_transfer"
            recipient_trust = round(random.uniform(0.35, 0.55), 3)
            is_new_recipient = True
            intent_consistency = round(random.uniform(0.35, 0.55), 3)
            behavior_deviation = round(random.uniform(0.40, 0.65), 3)
            network_risk = round(random.uniform(0.30, 0.50), 3)
            context_risk = round(random.uniform(0.20, 0.40), 3)
            risk_label = 1  # Accidental harm
            expected_decision = "VERIFY"

        elif scenario == ScenarioType.SOCIAL_ENGINEERING:
            # Investment scam, fake tech support, lottery
            fraud_rec = random.choice(list(self.known_fraud_recipients) or [self.recipients[85]["recipient_id"]])
            recipient_id = fraud_rec
            amount = round(random.uniform(25000.0, 150000.0), 2)
            stated_intent = "Guaranteed 25% daily returns crypto investment deposit urgently required"
            actual_category = "suspicious_investment"
            recipient_trust = round(random.uniform(0.05, 0.25), 3)
            is_new_recipient = True
            intent_consistency = round(random.uniform(0.15, 0.40), 3)
            behavior_deviation = round(random.uniform(0.75, 0.98), 3)
            network_risk = round(random.uniform(0.80, 0.98), 3)
            context_risk = round(random.uniform(0.50, 0.85), 3)
            risk_label = 1  # Scam
            expected_decision = "HOLD"

        elif scenario == ScenarioType.ACCOUNT_TAKEOVER:
            # ATO: New device, late night 3 AM, foreign IP/city, draining account
            dev_id = f"DEV_ROGUE_{random.randint(1000, 9999)}"
            loc = "Lagos, NG" if random.random() < 0.5 else "Unknown_VPN_Exit"
            fraud_rec = random.choice(list(self.known_fraud_recipients) or [self.recipients[90]["recipient_id"]])
            recipient_id = fraud_rec
            amount = round(random.uniform(40000.0, 200000.0), 2)
            stated_intent = "Immediate money transfer"
            actual_category = "account_drain"
            recipient_trust = round(random.uniform(0.05, 0.20), 3)
            is_new_recipient = True
            intent_consistency = round(random.uniform(0.20, 0.45), 3)
            behavior_deviation = round(random.uniform(0.85, 0.99), 3)
            network_risk = round(random.uniform(0.75, 0.95), 3)
            context_risk = round(random.uniform(0.85, 0.99), 3)
            risk_label = 1  # Fraud ATO
            expected_decision = "HOLD"

        elif scenario == ScenarioType.MULE_NETWORK:
            # Mule cluster: Rapid pass-through, high degree centrality, low account age
            mule_rec = random.choice(list(self.mule_cluster_recipients) or [self.recipients[10]["recipient_id"]])
            recipient_id = mule_rec
            amount = round(random.uniform(15000.0, 49000.0), 2)
            stated_intent = "Freelance consulting fee invoice clearance"
            actual_category = "mule_layering"
            recipient_trust = round(random.uniform(0.10, 0.30), 3)
            is_new_recipient = True
            intent_consistency = round(random.uniform(0.40, 0.60), 3)
            behavior_deviation = round(random.uniform(0.60, 0.85), 3)
            network_risk = round(random.uniform(0.85, 0.99), 3)
            context_risk = round(random.uniform(0.40, 0.65), 3)
            risk_label = 1  # Mule fraud
            expected_decision = "HOLD"

        elif scenario == ScenarioType.HIGH_VALUE_ANOMALY:
            # Legitimate user making an unusually large purchase (e.g., jewelry or hospital)
            mid = random.choice([m["merchant_id"] for m in self.merchants if m["avg_ticket_size"] > 10000] or [self.merchants[0]["merchant_id"]])
            m = next(m for m in self.merchants if m["merchant_id"] == mid)
            merchant_id = mid
            recipient_id = mid
            amount = round(random.uniform(60000.0, 180000.0), 2)
            stated_intent = f"Buying wedding jewelry gift from {m['name']}"
            actual_category = "high_value_retail"
            recipient_trust = m["trust_score"]
            is_new_recipient = False
            intent_consistency = round(random.uniform(0.80, 0.95), 3)
            behavior_deviation = round(random.uniform(0.70, 0.88), 3)
            network_risk = round(random.uniform(0.10, 0.25), 3)
            context_risk = round(random.uniform(0.20, 0.35), 3)
            risk_label = 0  # Legitimate but high value
            expected_decision = "VERIFY"

        elif scenario == ScenarioType.INTENT_MISMATCH:
            # User states small groceries, actual payment is 50,000 INR to an unknown personal account
            unknown_rec = random.choice(self.recipients[300:])
            recipient_id = unknown_rec["recipient_id"]
            amount = round(random.uniform(45000.0, 95000.0), 2)
            stated_intent = "Paying Rs 500 for daily vegetables and grocery shopping"
            actual_category = "personal_transfer_large"
            recipient_trust = round(random.uniform(0.30, 0.50), 3)
            is_new_recipient = True
            # Crucial: Intent consistency is severely low!
            intent_consistency = round(random.uniform(0.10, 0.35), 3)
            behavior_deviation = round(random.uniform(0.75, 0.92), 3)
            network_risk = round(random.uniform(0.50, 0.75), 3)
            context_risk = round(random.uniform(0.40, 0.65), 3)
            risk_label = 1  # Harmful mismatch / manipulation
            expected_decision = "VERIFY"

        elif scenario == ScenarioType.CROSS_BORDER:
            # India to Singapore (SG), UAE, UK, US
            is_cross_border = True
            corridor = random.choice(["IN-SG", "IN-UAE", "IN-UK", "IN-US"])
            dest_map = {"IN-SG": ("SG", "SGD", 0.016), "IN-UAE": ("AE", "AED", 0.044), "IN-UK": ("GB", "GBP", 0.0094), "IN-US": ("US", "USD", 0.012)}
            dest_country, currency, fx = dest_map[corridor]
            recipient_id = f"REC_GLOBAL_{random.randint(100, 999)}"
            amount = round(random.uniform(20000.0, 150000.0), 2)
            stated_intent = f"Remittance payment to university tuition fees in {dest_country}"
            actual_category = "international_education"
            recipient_trust = round(random.uniform(0.70, 0.90), 3)
            is_new_recipient = True
            intent_consistency = round(random.uniform(0.75, 0.92), 3)
            behavior_deviation = round(random.uniform(0.45, 0.70), 3)
            network_risk = round(random.uniform(0.30, 0.55), 3)
            context_risk = round(random.uniform(0.35, 0.60), 3)
            risk_label = 0 if random.random() < 0.85 else 1
            expected_decision = "VERIFY" if risk_label == 0 else "HOLD"

        elif scenario == ScenarioType.TOKENIZED_ASSET_TRANSFER:
            # Tokenized Invoice Receivable transfer
            merchant_id = random.choice(user["frequent_merchants"])
            recipient_id = f"INSTITUTION_FACTORING_CORP_{random.randint(1, 5)}"
            amount = 100000.0
            stated_intent = "Transferring discounted invoice receivable #INV-2026-981 to factoring partner"
            actual_category = "tokenized_receivable"
            recipient_trust = 0.98
            is_new_recipient = False
            intent_consistency = 0.96
            behavior_deviation = 0.20
            network_risk = 0.05
            context_risk = 0.10
            risk_label = 0
            expected_decision = "ALLOW"

        # Calculate composite risk score using weighted fusion formula
        # w1(1 - IntentConsistency) + w2(BehaviorDev) + w3(1 - RecipientTrust) + w4(ContextRisk) + w5(NetworkRisk)
        w1, w2, w3, w4, w5 = 0.28, 0.22, 0.20, 0.15, 0.15
        intent_mismatch_component = (1.0 - intent_consistency)
        recipient_risk_component = (1.0 - recipient_trust)
        
        composite_risk = (
            w1 * intent_mismatch_component +
            w2 * behavior_deviation +
            w3 * recipient_risk_component +
            w4 * context_risk +
            w5 * network_risk
        )
        composite_risk = round(float(np.clip(composite_risk, 0.0, 1.0)), 4)

        intent_hash = hashlib.sha256(stated_intent.encode()).hexdigest()

        return {
            "transaction_id": tx_id,
            "user_id": uid,
            "recipient_id": recipient_id,
            "merchant_id": merchant_id,
            "amount": amount,
            "currency": currency,
            "timestamp": tx_time.isoformat(),
            "channel": "UPI" if not is_cross_border else "CROSS_BORDER_REMITTANCE",
            "location": loc,
            "device": dev_id,
            "stated_intent": stated_intent,
            "intent_hash": intent_hash,
            "actual_category": actual_category,
            "relationship_age_days": 0 if is_new_recipient else random.randint(30, 450),
            "recipient_trust": recipient_trust,
            "is_new_recipient": is_new_recipient,
            "behavior_deviation": behavior_deviation,
            "intent_consistency": intent_consistency,
            "network_risk": network_risk,
            "context_risk": context_risk,
            "is_cross_border": is_cross_border,
            "corridor": corridor,
            "destination_country": dest_country,
            "composite_risk": composite_risk,
            "risk_label": risk_label,
            "scenario_label": scenario.value,
            "expected_decision": expected_decision
        }
