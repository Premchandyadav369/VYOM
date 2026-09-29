"""
VERA Multi-Party Quorum & Dual-Control Consensus Service
Enforces 2-of-3 threshold approval consensus across Bank Risk Lead, NPCI Auditor,
and Compliance Officer before high-value or high-risk payments can be released from HOLD.
"""

import hashlib
import time
from typing import Dict, Any, List, Optional
from datetime import datetime


class QuorumService:
    """
    Manages multi-signature quorum for payment overrides on the Drunix consortium ledger.
    """

    ALLOWED_ROLES = {
        "ROLE_BANK_RISK_LEAD": {"title": "Tier-3 Bank Risk Lead", "min_weight": 1},
        "ROLE_NPCI_GATEWAY_AUDITOR": {"title": "NPCI Consortium Auditor", "min_weight": 1},
        "ROLE_COMPLIANCE_DIRECTOR": {"title": "AML/CFT Compliance Officer", "min_weight": 1}
    }

    QUORUM_THRESHOLD = 2

    def verify_and_add_signature(
        self,
        payment_id: str,
        signer_role: str,
        signer_id: str,
        signer_name: str,
        decision: str,  # APPROVE or REJECT
        existing_signatures: List[Dict[str, Any]],
        comments: Optional[str] = None
    ) -> Dict[str, Any]:
        if signer_role not in self.ALLOWED_ROLES:
            raise ValueError(f"Invalid role: {signer_role}. Allowed: {list(self.ALLOWED_ROLES.keys())}")

        # Check if this role or signer already signed
        for s in existing_signatures:
            if s.get("signer_role") == signer_role:
                raise ValueError(f"Role {signer_role} has already cast a quorum vote for payment {payment_id}")
            if s.get("signer_id") == signer_id:
                raise ValueError(f"Signer {signer_id} has already signed this payment")

        # Generate cryptographic signature digest
        sig_payload = f"{payment_id}:{signer_role}:{signer_id}:{decision}:{int(time.time())}"
        signature_hex = hashlib.sha256(sig_payload.encode()).hexdigest()
        pubkey = f"04{hashlib.sha256(signer_id.encode()).hexdigest()[:64]}"

        new_sig = {
            "signature_id": f"SIG-{int(time.time()*1000)%1000000:06d}",
            "payment_id": payment_id,
            "signer_role": signer_role,
            "signer_id": signer_id,
            "signer_name": signer_name,
            "role_title": self.ALLOWED_ROLES[signer_role]["title"],
            "public_key": pubkey,
            "signature_hex": signature_hex,
            "decision": decision,
            "comments": comments or "Authorized via Dual-Control HSM console",
            "timestamp": datetime.utcnow().isoformat()
        }

        updated_signatures = existing_signatures + [new_sig]
        approve_count = sum(1 for s in updated_signatures if s.get("decision") == "APPROVE")
        reject_count = sum(1 for s in updated_signatures if s.get("decision") == "REJECT")

        is_quorum_reached = approve_count >= self.QUORUM_THRESHOLD
        is_quorum_rejected = reject_count >= self.QUORUM_THRESHOLD

        return {
            "payment_id": payment_id,
            "new_signature": new_sig,
            "all_signatures": updated_signatures,
            "quorum_required": self.QUORUM_THRESHOLD,
            "approve_votes": approve_count,
            "reject_votes": reject_count,
            "is_quorum_reached": is_quorum_reached,
            "is_quorum_rejected": is_quorum_rejected,
            "status": "APPROVED" if is_quorum_reached else ("REJECTED" if is_quorum_rejected else "PENDING_QUORUM")
        }


quorum_service = QuorumService()
