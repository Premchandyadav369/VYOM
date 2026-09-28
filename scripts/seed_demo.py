"""
VERA x DRUNIX Demo Seeder
Seeds the SQLite/PostgreSQL database with realistic payments across all 10 scenarios,
executes Drunix blockchain transactions, creates tokenized receivables, and populates
audit logs for an instant high-density judging experience.
"""

import os
import sys
import time
import random
import hashlib
from datetime import datetime, timedelta

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from data.database import (
    init_db, SessionLocal, DBPayment, DBDrunixTransaction, DBDrunixBlock,
    DBTokenizedAsset, DBRemittance, DBAuditLog
)
from services.intent_engine.intent_service import IntentEngine
from services.risk_engine.behavioral_engine import BehavioralEngine
from services.graph_engine.trust_graph import TrustGraphEngine
from services.risk_engine.risk_fusion import RiskFusionEngine
from services.policy_engine.adaptive_policy import AdaptivePolicyEngine
from services.cross_border_engine.remittance_service import CrossBorderEngine
from services.drunix_adapter.adapter import DrunixAdapter
from data.schemas.models import ContextRiskFeatures, PolicyDecision


def seed_demo_data():
    print("[*] Initializing VERA x DRUNIX database...")
    init_db()
    db = SessionLocal()

    # Clear existing demo data to avoid primary key collisions on repeated runs
    db.query(DBPayment).delete()
    db.query(DBDrunixTransaction).delete()
    db.query(DBDrunixBlock).delete()
    db.query(DBTokenizedAsset).delete()
    db.query(DBRemittance).delete()
    db.query(DBAuditLog).delete()
    db.commit()

    intent_eng = IntentEngine()
    beh_eng = BehavioralEngine()
    graph_eng = TrustGraphEngine()
    fusion_eng = RiskFusionEngine()
    policy_eng = AdaptivePolicyEngine()
    cb_eng = CrossBorderEngine()
    drunix = DrunixAdapter(mode="SIMULATOR")

    demo_scenarios = [
        # 1. Normal Grocery Payment
        {
            "pid": "PAY-001001",
            "sender": "USR_00012",
            "recipient": "MERCH_0001",
            "merchant_id": "MERCH_0001",
            "amount": 1450.0,
            "category": "food_beverage",
            "intent": "Ordering lunch delivery from regular restaurant",
            "is_merchant": True,
            "device": "DEV_00012",
            "loc": "Mumbai, IN"
        },
        # 2. Normal Friend Split
        {
            "pid": "PAY-001002",
            "sender": "USR_00012",
            "recipient": "REC_00160",
            "merchant_id": None,
            "amount": 850.0,
            "category": "p2p_split",
            "intent": "Dinner split to Arjun Sharma for weekend meal",
            "is_merchant": False,
            "device": "DEV_00012",
            "loc": "Mumbai, IN"
        },
        # 3. New Recipient Repair Services
        {
            "pid": "PAY-001003",
            "sender": "USR_00015",
            "recipient": "REC_00210",
            "merchant_id": None,
            "amount": 4200.0,
            "category": "home_services",
            "intent": "Carpentry repair labor charges payment to Mahesh",
            "is_merchant": False,
            "device": "DEV_00015",
            "loc": "Bangalore, IN"
        },
        # 4. Intent Mismatch (Major Demo Case)
        {
            "pid": "PAY-001004",
            "sender": "USR_00088",
            "recipient": "REC_00320",
            "merchant_id": None,
            "amount": 50000.0,
            "category": "personal_transfer",
            "intent": "Paying Rs 5,000 for groceries",
            "is_merchant": False,
            "device": "DEV_00088",
            "loc": "Bangalore, IN"
        },
        # 5. Social Engineering Scam
        {
            "pid": "PAY-001005",
            "sender": "USR_00045",
            "recipient": "REC_00085",
            "merchant_id": None,
            "amount": 65000.0,
            "category": "suspicious_investment",
            "intent": "Guaranteed 25% daily returns crypto investment deposit urgently required within 10 minutes",
            "is_merchant": False,
            "device": "DEV_00045",
            "loc": "Delhi, IN"
        },
        # 6. Mule Network Fan-In Layering
        {
            "pid": "PAY-001006",
            "sender": "USR_00033",
            "recipient": "REC_00010",
            "merchant_id": None,
            "amount": 49000.0,
            "category": "mule_layering",
            "intent": "Freelance consulting fee clearance invoice",
            "is_merchant": False,
            "device": "DEV_00033",
            "loc": "Pune, IN"
        },
        # 7. Account Takeover (ATO)
        {
            "pid": "PAY-001007",
            "sender": "USR_00099",
            "recipient": "REC_00092",
            "merchant_id": None,
            "amount": 95000.0,
            "category": "account_drain",
            "intent": "Urgent immediate bank balance transfer",
            "is_merchant": False,
            "device": "DEV_ROGUE_9912",
            "loc": "Lagos, NG"
        },
        # 8. High Value Electronics Purchase
        {
            "pid": "PAY-001008",
            "sender": "USR_00021",
            "recipient": "MERCH_0011",
            "merchant_id": "MERCH_0011",
            "amount": 48500.0,
            "category": "electronics",
            "intent": "Buying office monitor and laptop accessories from Croma",
            "is_merchant": True,
            "device": "DEV_00021",
            "loc": "Hyderabad, IN"
        },
        # 9. Cross-Border India -> Singapore
        {
            "pid": "PAY-001009",
            "sender": "USR_00055",
            "recipient": "REC_SG_UNIV_99",
            "merchant_id": None,
            "amount": 75000.0,
            "category": "international_education",
            "intent": "Tuition fees remittance to Singapore University",
            "is_merchant": False,
            "device": "DEV_00055",
            "loc": "Chennai, IN",
            "is_cross_border": True,
            "corridor": "IN-SG"
        },
        # 10. Cross-Border India -> UAE
        {
            "pid": "PAY-001010",
            "sender": "USR_00072",
            "recipient": "REC_UAE_EXCHANGE_4",
            "merchant_id": None,
            "amount": 120000.0,
            "category": "cross_border_trade",
            "intent": "Commercial supplier payment for textile trade goods to Dubai",
            "is_merchant": False,
            "device": "DEV_00072",
            "loc": "Surat, IN",
            "is_cross_border": True,
            "corridor": "IN-UAE"
        }
    ]

    print(f"[*] Processing {len(demo_scenarios)} demo scenarios on VERA and Drunix...")

    for sc in demo_scenarios:
        pid = sc["pid"]
        amt = sc["amount"]
        intent_hash = hashlib.sha256(sc["intent"].encode()).hexdigest()

        # 1. Drunix CreatePayment
        tx_create, b_create = drunix.execute_transaction_lifecycle(
            function_name="CreatePayment",
            args={
                "payment_id": pid,
                "sender_id": sc["sender"],
                "recipient_id": sc["recipient"],
                "amount": amt,
                "currency": "INR",
                "intent_hash": intent_hash
            }
        )

        # 2. VERA Intelligence
        intent_res = intent_eng.evaluate_intent_mismatch(
            stated_intent=sc["intent"],
            actual_amount=amt,
            actual_recipient_name=sc["recipient"],
            actual_category=sc["category"],
            is_merchant=sc["is_merchant"]
        )

        beh_res = beh_eng.evaluate_behavior(
            user_id=sc["sender"],
            amount=amt,
            hour_of_day=14 if "Lagos" not in sc["loc"] else 3,
            day_of_week=2,
            user_median_amount=2500.0,
            user_amount_std=800.0
        )

        graph_res = graph_eng.evaluate_recipient_trust(
            sender_id=sc["sender"],
            recipient_id=sc["recipient"],
            amount=amt,
            is_known_merchant=sc["is_merchant"]
        )

        ctx_res = ContextRiskFeatures(
            context_risk_score=0.85 if "ROGUE" in sc["device"] else 0.12,
            device_id=sc["device"],
            location=sc["loc"]
        )

        cb_res = None
        if sc.get("is_cross_border"):
            cb_res = cb_eng.evaluate_cross_border(
                amount_inr=amt,
                dest_country=sc["corridor"].split("-")[1],
                corridor_code=sc["corridor"]
            )

        risk_score, reason_codes, breakdown = fusion_eng.compute_unified_risk(
            intent_res=intent_res,
            graph_feats=graph_res,
            behavior_feats=beh_res,
            context_feats=ctx_res,
            cross_border_feats=cb_res
        )

        decision = policy_eng.evaluate_policy(
            payment_id=pid,
            unified_risk=risk_score,
            intent_consistency=intent_res.intent_consistency,
            recipient_trust=graph_res.recipient_trust_score,
            behavior_deviation=beh_res.behavior_deviation_score,
            context_risk=ctx_res.context_risk_score,
            network_risk=graph_res.network_risk_score,
            cross_border_risk=cb_res.route_risk_score if cb_res else 0.0,
            reason_codes=reason_codes,
            amount=amt,
            is_known_recipient=not graph_res.is_new_recipient
        )

        # 3. Drunix SubmitRiskDecision
        tx_dec, b_dec = drunix.execute_transaction_lifecycle(
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

        final_st = "ALLOWED"
        if decision.decision == PolicyDecision.VERIFY:
            final_st = "VERIFY_REQUIRED"
        elif decision.decision == PolicyDecision.HOLD:
            final_st = "HOLD"
        else:
            # ALLOW -> Auto-commit and settle
            drunix.execute_transaction_lifecycle(function_name="CommitPayment", args={"payment_id": pid})
            drunix.execute_transaction_lifecycle(function_name="MarkSettled", args={"payment_id": pid, "settlement_ref": f"UPI_SETTLE_{pid}"})
            final_st = "SETTLED"

        # Record payment in DB
        db_p = DBPayment(
            payment_id=pid,
            sender_id=sc["sender"],
            recipient_id=sc["recipient"],
            merchant_id=sc.get("merchant_id"),
            amount=amt,
            currency="INR",
            stated_intent=sc["intent"],
            intent_hash=intent_hash,
            status=final_st,
            decision=decision.decision.value,
            risk_class=decision.risk_class.value,
            risk_score=decision.unified_risk_score,
            intent_consistency=intent_res.intent_consistency,
            recipient_trust=graph_res.recipient_trust_score,
            behavior_deviation=beh_res.behavior_deviation_score,
            network_risk=graph_res.network_risk_score,
            context_risk=ctx_res.context_risk_score,
            reason_codes=decision.reason_codes,
            risk_details={
                "breakdown": breakdown,
                "intent_vector": intent_res.intent_vector.model_dump(),
                "explanation": decision.explanation,
                "required_action": decision.required_action,
                "vera_signature": decision.vera_signature
            },
            drunix_tx_id=tx_dec.tx_id,
            drunix_block_number=b_dec.block_number,
            state_history=[
                {"state": "PAYMENT_CREATED", "tx_id": tx_create.tx_id, "block": b_create.block_number},
                {"state": decision.decision.value, "tx_id": tx_dec.tx_id, "block": b_dec.block_number}
            ],
            created_at=datetime.utcnow() - timedelta(minutes=random.randint(5, 120))
        )
        db.add(db_p)

        # Cross border record
        if sc.get("is_cross_border"):
            db_remit = DBRemittance(
                remittance_id=f"REMIT-{pid}",
                payment_id=pid,
                corridor=sc["corridor"],
                sender_country="IN",
                receiver_country=sc["corridor"].split("-")[1],
                source_amount=amt,
                source_currency="INR",
                fx_rate=cb_res.fx_rate,
                dest_amount=round(amt * cb_res.fx_rate, 2),
                dest_currency=cb_res.currency_pair.split("/")[1],
                route_risk_score=cb_res.route_risk_score,
                compliance_status=cb_res.compliance_status,
                drunix_tx_id=tx_dec.tx_id,
                settlement_state="PENDING" if final_st != "SETTLED" else "SETTLED"
            )
            db.add(db_remit)

        # Audit log
        db_audit = DBAuditLog(
            event_type="PAYMENT_PROCESSED",
            actor_id=sc["sender"],
            resource_id=pid,
            ip_address=sc["loc"],
            details={"decision": decision.decision.value, "risk": decision.unified_risk_score, "tx_id": tx_dec.tx_id}
        )
        db.add(db_audit)

    # 4. Tokenized Receivable Asset Seed
    print("[*] Seeding Tokenized Receivable Assets on Drunix...")
    assets = [
        ("ASSET-INV-2026-001", "INV-2026-8812", 100000.0, 96500.0, "MERCH_0011", "INSTITUTION_FACTORING_CORP_1", "ENTERPRISE_CORP_B", "2026-11-30"),
        ("ASSET-INV-2026-002", "INV-2026-9043", 250000.0, 241000.0, "MERCH_0005", "MERCH_0005", "GLOBAL_RETAIL_LTD", "2026-12-15")
    ]
    for aid, inv_no, fv, dv, orig_owner, curr_owner, debtor, due in assets:
        tx_a, b_a = drunix.execute_transaction_lifecycle(
            function_name="CreateTokenizedAsset",
            args={
                "asset_id": aid,
                "invoice_number": inv_no,
                "face_value_inr": fv,
                "discounted_value_inr": dv,
                "original_owner_id": orig_owner,
                "debtor_id": debtor,
                "due_date": due
            }
        )
        db_a = DBTokenizedAsset(
            asset_id=aid,
            invoice_number=inv_no,
            face_value_inr=fv,
            discounted_value_inr=dv,
            original_owner_id=orig_owner,
            current_owner_id=curr_owner,
            debtor_id=debtor,
            due_date=due,
            verification_status="VERIFIED_RECEIVABLE",
            drunix_tx_id=tx_a.tx_id,
            collateral_status="UNENCUMBERED"
        )
        db.add(db_a)

    # Persist Drunix Transactions and Blocks to SQLite/Postgres for Explorer persistence
    print("[*] Persisting Drunix Blocks and Transactions to State Database...")
    for b in drunix.blocks:
        db_b = DBDrunixBlock(
            block_number=b.block_number,
            current_block_hash=b.current_block_hash,
            previous_block_hash=b.previous_block_hash,
            channel_id=b.channel_id,
            tx_count=b.tx_count,
            merkle_root=b.merkle_root,
            orderer_identity=b.orderer_identity,
            timestamp=b.timestamp
        )
        db.add(db_b)

    for tx in drunix.transactions.values():
        db_tx = DBDrunixTransaction(
            tx_id=tx.tx_id,
            block_number=tx.block_number,
            channel_id=tx.channel_id,
            chaincode_name=tx.chaincode_name,
            function_name=tx.function_name,
            args=tx.args,
            initiator_msp=tx.initiator_msp,
            proposal_hash=tx.proposal_hash,
            rw_set=tx.rw_set,
            endorsements=tx.endorsements,
            stateless_validation_status=tx.stateless_validation_status,
            mvcc_validation_status=tx.mvcc_validation_status,
            commit_status=tx.commit_status,
            transient_keydb_hash=tx.transient_keydb_hash,
            drunix_mode=tx.drunix_mode,
            created_at=tx.created_at
        )
        db.add(db_tx)

    db.commit()
    db.close()
    print("[SUCCESS] Database successfully seeded with 10 scenarios, Drunix blocks, tokenized assets, and audit logs!")


if __name__ == "__main__":
    seed_demo_data()
