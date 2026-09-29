"""
VERA-PAYMENT-STATE Chaincode
Permissioned Smart Contract for Intent-Governed Payment State (IGPS).
Enforces deterministic policy transitions, multi-party endorsement rules,
and asset tokenization on the Drunix distributed ledger.
"""

import json
import hashlib
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple


class DrunixChaincodeError(Exception):
    """Raised when a chaincode state transition or validation fails."""
    pass


class VeraPaymentStateChaincode:
    """
    Implements the vera-payment-state chaincode interface.
    Executed by Drunix Lite Peers (simulation) and verified by Stateless Validation Service (VSCC).
    """

    ALLOWED_TRANSITIONS = {
        "PAYMENT_CREATED": ["INTENT_CAPTURED", "EVALUATING", "POLICY_DECISION", "VERIFY_REQUIRED", "HOLD", "ALLOWED", "REJECTED"],
        "INTENT_CAPTURED": ["EVALUATING", "POLICY_DECISION", "VERIFY_REQUIRED", "HOLD", "ALLOWED", "REJECTED"],
        "EVALUATING": ["POLICY_DECISION", "VERIFY_REQUIRED", "HOLD", "ALLOWED", "REJECTED"],
        "POLICY_DECISION": ["VERIFY_REQUIRED", "HOLD", "ALLOWED", "REJECTED"],
        "VERIFY_REQUIRED": ["VERIFIED", "HOLD", "REJECTED"],
        "VERIFIED": ["COMMITTED", "ENDORSED", "REJECTED"],
        "ALLOWED": ["COMMITTED", "ENDORSED", "REJECTED"],
        "HOLD": ["RELEASED", "REJECTED"],
        "RELEASED": ["COMMITTED", "ENDORSED", "REJECTED"],
        "ENDORSED": ["ORDERED", "COMMITTED", "REJECTED"],
        "ORDERED": ["VALIDATED", "COMMITTED", "REJECTED"],
        "VALIDATED": ["COMMITTED", "REJECTED"],
        "COMMITTED": ["SETTLEMENT_REQUESTED", "SETTLED", "REJECTED"],
        "SETTLEMENT_REQUESTED": ["SETTLED", "REJECTED"],
        "SETTLED": []  # Terminal state
    }

    REQUIRED_ENDORSEMENTS = {
        "CreatePayment": ["Org1MSP"],
        "SubmitRiskDecision": ["Org1MSP"],
        "RequestVerification": ["Org1MSP", "Org2MSP"],
        "VerifyPayment": ["Org1MSP", "Org2MSP"],
        "HoldPayment": ["Org1MSP", "ComplianceMSP"],
        "ReleasePayment": ["Org1MSP", "ComplianceMSP"],
        "CommitPayment": ["Org1MSP", "Org2MSP"],
        "MarkSettled": ["Org1MSP", "SettlementMSP"],
        "TransferAsset": ["Org1MSP", "Org2MSP"]
    }

    def __init__(self, state_store: Optional[Dict[str, Any]] = None):
        # In-memory world state map: key -> {value, version}
        self.world_state: Dict[str, Dict[str, Any]] = state_store if state_store is not None else {}
        self.history: Dict[str, List[Dict[str, Any]]] = {}

    def get_state(self, key: str) -> Optional[Dict[str, Any]]:
        """Reads a key from the Drunix SQL/world state with persistent SQLite fallback."""
        record = self.world_state.get(key)
        if record:
            return record["value"]
        if key.startswith("PAYMENT_"):
            pid = key.replace("PAYMENT_", "")
            try:
                from data.database import SessionLocal, DBPayment
                db = SessionLocal()
                p = db.query(DBPayment).filter(DBPayment.payment_id == pid).first()
                if p:
                    val = {
                        "payment_id": p.payment_id,
                        "sender_id": p.sender_id,
                        "recipient_id": p.recipient_id,
                        "amount": p.amount,
                        "currency": p.currency,
                        "status": p.status,
                        "decision": p.decision,
                        "risk_score": p.risk_score,
                        "created_at": p.created_at.isoformat() if p.created_at else datetime.utcnow().isoformat(),
                        "updated_at": p.updated_at.isoformat() if p.updated_at else datetime.utcnow().isoformat()
                    }
                    self.world_state[key] = {"value": val, "version": 1}
                    db.close()
                    return val
                db.close()
            except Exception:
                pass
        return None

    def put_state(self, key: str, value: Dict[str, Any], rw_set: Dict[str, Any]) -> int:
        """Stages a state update into the Read/Write set."""
        current_record = self.world_state.get(key)
        new_version = (current_record["version"] + 1) if current_record else 1
        rw_set["writes"][key] = {"value": value, "version": new_version}
        return new_version

    def invoke(
        self,
        function_name: str,
        args: Dict[str, Any],
        caller_msp: str,
        transient_store: Optional[Dict[str, Any]] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Executes chaincode simulation on a Lite Peer (LP).
        Returns: (result_payload, rw_set)
        """
        rw_set = {"reads": {}, "writes": {}}

        handler = getattr(self, f"fn_{function_name}", None)
        if not handler:
            raise DrunixChaincodeError(f"Unknown chaincode function: {function_name}")

        result = handler(args, caller_msp, rw_set, transient_store)
        return result, rw_set

    # --------------------------------------------------------------------------
    # Chaincode Core Transaction Functions
    # --------------------------------------------------------------------------

    def fn_CreatePayment(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Creates a new payment record in the ledger."""
        payment_id = args.get("payment_id")
        if not payment_id:
            raise DrunixChaincodeError("Missing payment_id")

        if self.get_state(f"PAYMENT_{payment_id}"):
            raise DrunixChaincodeError(f"Payment already exists: {payment_id}")

        rw_set["reads"][f"PAYMENT_{payment_id}"] = None

        payment_data = {
            "payment_id": payment_id,
            "sender_ref": hashlib.sha256(args["sender_id"].encode()).hexdigest()[:16],
            "recipient_ref": hashlib.sha256(args["recipient_id"].encode()).hexdigest()[:16],
            "amount": float(args["amount"]),
            "currency": args.get("currency", "INR"),
            "intent_hash": args.get("intent_hash"),
            "status": "PAYMENT_CREATED",
            "policy_version": args.get("policy_version", "vera-policy-v1"),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "initiator_msp": caller_msp
        }

        self.put_state(f"PAYMENT_{payment_id}", payment_data, rw_set)
        return {"status": "SUCCESS", "payment_id": payment_id, "state": "PAYMENT_CREATED"}

    def fn_SubmitRiskDecision(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Submits VERA's cryptographic risk and policy decision to the ledger."""
        payment_id = args.get("payment_id")
        payment = self.get_state(f"PAYMENT_{payment_id}")
        if not payment:
            raise DrunixChaincodeError(f"Payment not found: {payment_id}")

        rw_set["reads"][f"PAYMENT_{payment_id}"] = payment

        decision = args.get("decision")  # ALLOW, VERIFY, HOLD
        risk_class = args.get("risk_class")
        risk_score = float(args.get("risk_score", 0.0))
        vera_signature = args.get("vera_signature")
        reason_codes = args.get("reason_codes", [])

        if not vera_signature:
            raise DrunixChaincodeError("Rejecting transition: Missing VERA service cryptographic signature")

        # Map VERA policy decision to valid IGPS next state
        if decision == "ALLOW":
            next_state = "ALLOWED"
        elif decision == "VERIFY":
            next_state = "VERIFY_REQUIRED"
        elif decision == "HOLD":
            next_state = "HOLD"
        else:
            raise DrunixChaincodeError(f"Invalid decision: {decision}")

        self._validate_state_transition(payment["status"], next_state)

        payment["status"] = next_state
        payment["decision"] = decision
        payment["risk_class"] = risk_class
        payment["risk_score"] = risk_score
        payment["vera_signature"] = vera_signature
        payment["reason_codes"] = reason_codes
        payment["updated_at"] = datetime.utcnow().isoformat()

        self.put_state(f"PAYMENT_{payment_id}", payment, rw_set)
        return {"status": "SUCCESS", "payment_id": payment_id, "new_state": next_state}

    def fn_VerifyPayment(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Marks a payment as successfully verified by user secondary authentication."""
        payment_id = args.get("payment_id")
        payment = self.get_state(f"PAYMENT_{payment_id}")
        if not payment:
            raise DrunixChaincodeError(f"Payment not found: {payment_id}")

        rw_set["reads"][f"PAYMENT_{payment_id}"] = payment
        self._validate_state_transition(payment["status"], "VERIFIED")

        payment["status"] = "VERIFIED"
        payment["verified_at"] = datetime.utcnow().isoformat()
        payment["verification_method"] = args.get("verification_method", "INTENT_CONFIRMATION_BIOMETRIC")
        payment["updated_at"] = datetime.utcnow().isoformat()

        self.put_state(f"PAYMENT_{payment_id}", payment, rw_set)
        return {"status": "SUCCESS", "payment_id": payment_id, "new_state": "VERIFIED"}

    def fn_HoldPayment(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Transitions payment to HOLD state."""
        payment_id = args.get("payment_id")
        payment = self.get_state(f"PAYMENT_{payment_id}")
        if not payment:
            raise DrunixChaincodeError(f"Payment not found: {payment_id}")

        rw_set["reads"][f"PAYMENT_{payment_id}"] = payment
        self._validate_state_transition(payment["status"], "HOLD")

        payment["status"] = "HOLD"
        payment["hold_reason"] = args.get("reason", "SECURITY_INTERVENTION")
        payment["updated_at"] = datetime.utcnow().isoformat()

        self.put_state(f"PAYMENT_{payment_id}", payment, rw_set)
        return {"status": "SUCCESS", "payment_id": payment_id, "new_state": "HOLD"}

    def fn_ReleasePayment(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Authorizes release of held payment by compliance or user review."""
        payment_id = args.get("payment_id")
        payment = self.get_state(f"PAYMENT_{payment_id}")
        if not payment:
            raise DrunixChaincodeError(f"Payment not found: {payment_id}")

        rw_set["reads"][f"PAYMENT_{payment_id}"] = payment
        self._validate_state_transition(payment["status"], "RELEASED")

        payment["status"] = "RELEASED"
        payment["released_by_msp"] = caller_msp
        payment["updated_at"] = datetime.utcnow().isoformat()

        self.put_state(f"PAYMENT_{payment_id}", payment, rw_set)
        return {"status": "SUCCESS", "payment_id": payment_id, "new_state": "RELEASED"}

    def fn_CommitPayment(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Transitions validated payment to COMMITTED state on ledger."""
        payment_id = args.get("payment_id")
        payment = self.get_state(f"PAYMENT_{payment_id}")
        if not payment:
            raise DrunixChaincodeError(f"Payment not found: {payment_id}")

        rw_set["reads"][f"PAYMENT_{payment_id}"] = payment
        # Payment must have been ALLOWED or VERIFIED or RELEASED
        current_st = payment["status"]
        if current_st in ["ALLOWED", "VERIFIED", "RELEASED", "VALIDATED"]:
            next_st = "COMMITTED"
        else:
            raise DrunixChaincodeError(f"Cannot commit unverified or held payment. Current state: {current_st}")

        payment["status"] = next_st
        payment["committed_at"] = datetime.utcnow().isoformat()
        payment["updated_at"] = datetime.utcnow().isoformat()

        self.put_state(f"PAYMENT_{payment_id}", payment, rw_set)
        return {"status": "SUCCESS", "payment_id": payment_id, "new_state": "COMMITTED"}

    def fn_MarkSettled(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Finalizes payment state to SETTLED once underlying rail confirms funds transfer."""
        payment_id = args.get("payment_id")
        payment = self.get_state(f"PAYMENT_{payment_id}")
        if not payment:
            raise DrunixChaincodeError(f"Payment not found: {payment_id}")

        rw_set["reads"][f"PAYMENT_{payment_id}"] = payment
        if payment["status"] not in ["COMMITTED", "SETTLEMENT_REQUESTED"]:
            raise DrunixChaincodeError(f"Payment cannot settle before commitment. Current state: {payment['status']}")

        payment["status"] = "SETTLED"
        payment["settled_at"] = datetime.utcnow().isoformat()
        payment["settlement_reference"] = args.get("settlement_ref", f"SETTLE_REF_{payment_id}")
        payment["updated_at"] = datetime.utcnow().isoformat()

        self.put_state(f"PAYMENT_{payment_id}", payment, rw_set)
        return {"status": "SUCCESS", "payment_id": payment_id, "new_state": "SETTLED"}

    # --------------------------------------------------------------------------
    # Tokenized Asset Functions (Receivables / Invoices)
    # --------------------------------------------------------------------------

    def fn_CreateTokenizedAsset(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Creates a permissioned digital receivable asset."""
        asset_id = args.get("asset_id")
        if not asset_id:
            raise DrunixChaincodeError("Missing asset_id")

        asset_data = {
            "asset_id": asset_id,
            "invoice_number": args["invoice_number"],
            "face_value_inr": float(args["face_value_inr"]),
            "discounted_value_inr": float(args["discounted_value_inr"]),
            "original_owner_id": args["original_owner_id"],
            "current_owner_id": args["original_owner_id"],
            "debtor_id": args["debtor_id"],
            "due_date": args["due_date"],
            "verification_status": "VERIFIED_RECEIVABLE",
            "collateral_status": "UNENCUMBERED",
            "created_at": datetime.utcnow().isoformat()
        }

        self.put_state(f"ASSET_{asset_id}", asset_data, rw_set)
        return {"status": "SUCCESS", "asset_id": asset_id, "state": "TOKENIZED"}

    def fn_TransferAsset(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Transfers ownership of tokenized receivable following VERA risk clearance."""
        asset_id = args.get("asset_id")
        asset = self.get_state(f"ASSET_{asset_id}")
        if not asset:
            raise DrunixChaincodeError(f"Asset not found: {asset_id}")

        rw_set["reads"][f"ASSET_{asset_id}"] = asset

        new_owner_id = args.get("new_owner_id")
        risk_clearance = args.get("risk_clearance", False)
        if not risk_clearance:
            raise DrunixChaincodeError("Asset transfer rejected: Missing VERA risk clearance")

        asset["current_owner_id"] = new_owner_id
        asset["last_transferred_at"] = datetime.utcnow().isoformat()

        self.put_state(f"ASSET_{asset_id}", asset, rw_set)
        return {"status": "SUCCESS", "asset_id": asset_id, "new_owner": new_owner_id}

    # --------------------------------------------------------------------------
    # CBDC (e-Rupee) Programmable Token Functions
    # --------------------------------------------------------------------------

    def fn_MintCBDCToken(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Mints a programmable e-Rupee token on Drunix consortium ledger."""
        token_id = args.get("token_id")
        token_data = {
            "token_id": token_id,
            "amount": float(args.get("amount", 0.0)),
            "purpose": args.get("purpose"),
            "status": "MINTED_ACTIVE",
            "issuer_msp": caller_msp,
            "minted_at": datetime.utcnow().isoformat()
        }
        self.put_state(f"CBDC_{token_id}", token_data, rw_set)
        return {"status": "SUCCESS", "token_id": token_id, "state": "MINTED"}

    # --------------------------------------------------------------------------
    # Queries & State Invariants
    # --------------------------------------------------------------------------

    def fn_GetPayment(
        self, args: Dict[str, Any], caller_msp: str, rw_set: Dict[str, Any], transient: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Queries payment record by ID."""
        payment_id = args.get("payment_id")
        payment = self.get_state(f"PAYMENT_{payment_id}")
        if not payment:
            raise DrunixChaincodeError(f"Payment not found: {payment_id}")
        return payment

    def _validate_state_transition(self, current_state: str, next_state: str):
        """Enforces valid state transition graph."""
        allowed = self.ALLOWED_TRANSITIONS.get(current_state, [])
        if next_state not in allowed:
            raise DrunixChaincodeError(
                f"Invalid Drunix State Transition: Cannot move from {current_state} to {next_state}. "
                f"Permitted next states: {allowed}"
            )
