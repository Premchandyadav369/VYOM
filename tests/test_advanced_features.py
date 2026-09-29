"""
VERA Advanced Features Test Suite
Covers:
1. ISO 20022 pacs.008.001.08 XML and UPI 2.0 Wire Forensics
2. Cryptographic SHA-256 Merkle Inclusion Proofs
3. Zero-Knowledge Intent Proofs (zk-SNARK simulation)
4. Coercion, Telecom Telemetry & Digital Arrest Scams
5. Multi-Party Dual-Control Quorum Overrides (2-of-3 threshold)
6. Regulatory FIU-IND SAR / STR Dossier Compilation
7. Programmable CBDC (e-Rupee) & Project Nexus Cross-Border Clearing
8. Drunix Byzantine Fault Injection & Chaos Sandbox
"""

import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.iso20022_service import iso20022_service
from services.crypto.merkle_zk import MerkleTree, zk_engine
from services.coercion_engine import coercion_engine
from services.quorum_service import quorum_service
from services.sar_service import sar_service
from services.cbdc_nexus_service import cbdc_nexus_service
from services.chaos_engine import chaos_engine


def test_iso20022_and_upi_wire_generation():
    payment = {
        "payment_id": "PAY-TEST-001",
        "sender_id": "rohit@okaxis",
        "recipient_id": "blinkit@axisbank",
        "amount": 1450.0,
        "currency": "INR",
        "stated_intent": "Grocery delivery order"
    }
    xml_str = iso20022_service.generate_pacs008_xml(payment)
    assert "<Document" in xml_str
    assert "pacs.008.001.08" in xml_str
    assert "<EndToEndId>PAY-TEST-001</EndToEndId>" in xml_str
    assert "<Ustrd>Grocery delivery order</Ustrd>" in xml_str

    wire_json = iso20022_service.generate_upi_wire_json(payment)
    assert wire_json["Head"]["ver"] == "2.0"
    assert wire_json["Amount"]["value"] == "1450.00"

    # Test discrepancy flagging on coercive/scam transaction
    scam_payment = {
        "payment_id": "PAY-SCAM-002",
        "sender_id": "victim@upi",
        "recipient_id": "customs.clearance.hold@scam",
        "amount": 48000.0,
        "stated_intent": "Urgent customs courier parcel clearance fine"
    }
    annotations = iso20022_service.inspect_protocol_discrepancies(scam_payment)
    assert len(annotations) > 0
    assert any(a["code"] == "COERCIVE_IMPERSONATION_TAG" for a in annotations)


def test_merkle_tree_inclusion_proof():
    tx_leaves = [
        "TX-001:1000.0",
        "TX-002:5000.0",
        "TX-003:25000.0",
        "TX-004:95000.0"
    ]
    tree = MerkleTree(tx_leaves)
    assert tree.root is not None
    assert len(tree.root) == 64

    # Extract proof for leaf index 2
    target_idx = 2
    proof = tree.get_proof(target_idx)
    assert len(proof) > 0

    # Cryptographically verify inclusion against root
    is_valid = MerkleTree.verify_proof(tree.leaves[target_idx], proof, tree.root)
    assert is_valid is True

    # Tampered leaf must fail verification
    is_tampered_valid = MerkleTree.verify_proof("deadbeef" * 8, proof, tree.root)
    assert is_tampered_valid is False


def test_zero_knowledge_intent_proof():
    proof_res = zk_engine.generate_zk_proof(
        payment_id="PAY-ZK-001",
        amount=4500.0,
        stated_intent="Monthly electricity bill",
        category="utility_bill"
    )
    assert proof_res["protocol"] == "Groth16 zk-SNARK / Intent-R1CS"
    assert proof_res["verification_status"] == "VERIFIED_VALID"
    assert len(proof_res["proof"]["pi_a"]) == 2
    assert len(proof_res["public_inputs"]) == 4


def test_coercion_and_digital_arrest_detection():
    # Scenario: User on active 35-minute WhatsApp call, AnyDesk active, typing with panic hesitation
    coercion_res = coercion_engine.evaluate_coercion(
        payment_id="PAY-COERCE-001",
        stated_intent="CBI arrest warrant bail clearance deposit",
        amount=95000.0,
        call_telemetry={
            "active_call_duration_seconds": 2100,
            "call_channel": "WHATSAPP_VOIP",
            "caller_geo_flag": "HIGH_RISK_FOREIGN"
        },
        device_telemetry={
            "remote_access_tool_detected": True,
            "keystroke_hesitation_ms": 3500,
            "clipboard_paste_detected": True
        }
    )
    assert coercion_res["coercion_level"] == "CRITICAL"
    assert coercion_res["coercion_risk_score"] >= 0.80
    assert "ACTIVE_REMOTE_DESKTOP_TOOL_DETECTED" in coercion_res["flags"]
    assert "BENEFICIARY_CLIPBOARD_INJECTION" in coercion_res["flags"]
    assert coercion_res["recommended_intervention"] == "IMMEDIATE_CALL_DISCONNECT_AND_MANDATORY_HOLD"


def test_multi_party_quorum_consensus():
    payment_id = "PAY-QUORUM-001"
    existing = []

    # 1. Bank Risk Lead signs
    r1 = quorum_service.verify_and_add_signature(
        payment_id=payment_id,
        signer_role="ROLE_BANK_RISK_LEAD",
        signer_id="lead.sharma@bank",
        signer_name="R. Sharma",
        decision="APPROVE",
        existing_signatures=existing
    )
    assert r1["approve_votes"] == 1
    assert r1["is_quorum_reached"] is False
    assert r1["status"] == "PENDING_QUORUM"

    # Duplicate signature by same role must be rejected
    with pytest.raises(ValueError):
        quorum_service.verify_and_add_signature(
            payment_id=payment_id,
            signer_role="ROLE_BANK_RISK_LEAD",
            signer_id="other.person@bank",
            signer_name="Other Person",
            decision="APPROVE",
            existing_signatures=r1["all_signatures"]
        )

    # 2. NPCI Gateway Auditor signs -> Threshold (2) reached
    r2 = quorum_service.verify_and_add_signature(
        payment_id=payment_id,
        signer_role="ROLE_NPCI_GATEWAY_AUDITOR",
        signer_id="auditor.verma@npci",
        signer_name="V. Verma",
        decision="APPROVE",
        existing_signatures=r1["all_signatures"]
    )
    assert r2["approve_votes"] == 2
    assert r2["is_quorum_reached"] is True
    assert r2["status"] == "APPROVED"


def test_sar_regulatory_dossier_compilation():
    payment = {
        "payment_id": "PAY-STR-001",
        "sender_id": "victim@upi",
        "recipient_id": "customs.clearance.hold@scam",
        "amount": 45000.0,
        "currency": "INR",
        "risk_score": 0.88,
        "reason_codes": ["INTENT_MISMATCH", "HIGH_RISK_MULE"],
        "stated_intent": "Urgent customs fee payment",
        "drunix_block_number": 12,
        "drunix_tx_id": "TX-TEST-STR"
    }
    dossier = sar_service.generate_fiu_dossier(payment, investigator_notes="Confirmed syndicate ring.")
    assert "FIU-IND-STR" in dossier["sar_metadata"]["fiu_reference_id"]
    assert dossier["sar_metadata"]["governing_law"] == "Prevention of Money Laundering Act (PMLA), 2002 (India)"
    assert dossier["regulatory_declaration"]["digital_seal_sha256"] is not None


def test_programmable_cbdc_and_nexus():
    # 1. Mint voucher
    token = cbdc_nexus_service.mint_programmable_token(
        beneficiary_id="farmer.singh@sbi",
        amount_e_inr=10000.0,
        purpose_code="AGRI_FERTILIZER_SUBSIDY"
    )
    assert token["status"] == "ACTIVE"
    assert "5169" in token["allowed_mcc_list"]

    # 2. Attempt invalid redemption (MCC 5812 - Restaurant)
    fail_res = cbdc_nexus_service.validate_and_redeem_token(
        token_id=token["token_id"],
        token_spec=token,
        merchant_id="hotel@bank",
        merchant_mcc="5812",
        transaction_amount=2000.0
    )
    assert fail_res["success"] is False
    assert fail_res["rejection_code"] == "PURPOSE_MCC_MISMATCH"

    # 3. Valid redemption (MCC 5169 - Fertilizer)
    ok_res = cbdc_nexus_service.validate_and_redeem_token(
        token_id=token["token_id"],
        token_spec=token,
        merchant_id="agro_corp@sbi",
        merchant_mcc="5169",
        transaction_amount=4000.0
    )
    assert ok_res["success"] is True
    assert ok_res["remaining_balance"] == 6000.0

    # 4. Project Nexus Cross-Border clearing
    nexus_res = cbdc_nexus_service.execute_nexus_clearing(
        corridor="IN-SG",
        source_amount_inr=25000.0,
        sender_id="sender@bank",
        recipient_id="receiver@dbs"
    )
    assert nexus_res["status"] == "SETTLED_INSTANT"
    assert nexus_res["dest_currency"] == "SGD"


def test_chaos_byzantine_fault_injection():
    # Test leader drop fault
    res = chaos_engine.execute_fault_injection("RAFT_LEADER_DROP")
    assert res["status"] == "COMPLETED_SUCCESSFULLY"
    assert res["consensus_safety"] == "100.0% PRESERVED"
    assert len(res["trace_logs"]) > 0

    # Test Byzantine endorsement tamper
    res_byz = chaos_engine.execute_fault_injection("BYZANTINE_ENDORSEMENT_CORRUPTION")
    assert res_byz["expected_outcome"] == "PROPOSAL_REJECTED_CONSENSUS_SAFE"
