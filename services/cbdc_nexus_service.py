"""
VERA CBDC (e-Rupee) Programmable Token & Project Nexus Clearing Service
Implements purpose-bound programmable smart contracts on Drunix and multilateral
cross-border settlement across India (UPI/CBDC), Singapore (PayNow), UAE (Jaywan), and Thailand (PromptPay).
"""

import time
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta


class CBDCAndNexusService:
    """
    Manages purpose-bound programmable e-Rupee tokens and Project Nexus multilateral clearing.
    """

    SUPPORTED_PURPOSES = {
        "AGRI_FERTILIZER_SUBSIDY": {
            "name": "PM-KISAN Fertilizer Subsidy",
            "allowed_mccs": ["5169", "5261", "5969"],  # Chemicals, Lawn/Garden, Agricultural
            "validity_days": 90,
            "max_voucher_inr": 25000.0
        },
        "HEALTHCARE_AYUSHMAN_BENEFIT": {
            "name": "Ayushman Bharat Hospital Voucher",
            "allowed_mccs": ["8011", "8021", "8062", "8099"],  # Doctors, Dentists, Hospitals, Medical
            "validity_days": 60,
            "max_voucher_inr": 500000.0
        },
        "EDUCATION_SCHOLARSHIP_GRANT": {
            "name": "National Merit Tuition Voucher",
            "allowed_mccs": ["8211", "8220", "8241", "8299"],  # Elementary, Colleges, Vocational, Schools
            "validity_days": 180,
            "max_voucher_inr": 150000.0
        },
        "MSME_RAW_MATERIAL_ESCROW": {
            "name": "TReDS Supplier Invoicing Escrow",
            "allowed_mccs": ["5045", "5085", "5111"],  # Computers, Industrial Supplies, Stationery
            "validity_days": 45,
            "max_voucher_inr": 1000000.0
        }
    }

    NEXUS_RAILS = {
        "IN-SG": {
            "source_rail": "UPI / e-INR",
            "dest_rail": "PayNow (MAS Singapore)",
            "fx_pair": "INR/SGD",
            "fx_rate": 0.0162,
            "nostro_account": "NOSTRO_DBS_SINGAPORE",
            "vostro_balance": 4820000.00,
            "lrs_limit_usd": 250000.0
        },
        "IN-UAE": {
            "source_rail": "UPI / e-INR",
            "dest_rail": "Jaywan / Aani (CBUAE)",
            "fx_pair": "INR/AED",
            "fx_rate": 0.0441,
            "nostro_account": "NOSTRO_FAB_ABU_DHABI",
            "vostro_balance": 7250000.00,
            "lrs_limit_usd": 250000.0
        },
        "IN-TH": {
            "source_rail": "UPI / e-INR",
            "dest_rail": "PromptPay (Bank of Thailand)",
            "fx_pair": "INR/THB",
            "fx_rate": 0.4280,
            "nostro_account": "NOSTRO_BBL_BANGKOK",
            "vostro_balance": 3120000.00,
            "lrs_limit_usd": 250000.0
        }
    }

    def mint_programmable_token(
        self,
        beneficiary_id: str,
        amount_e_inr: float,
        purpose_code: str
    ) -> Dict[str, Any]:
        if purpose_code not in self.SUPPORTED_PURPOSES:
            raise ValueError(f"Unknown purpose code: {purpose_code}. Allowed: {list(self.SUPPORTED_PURPOSES.keys())}")

        purpose_spec = self.SUPPORTED_PURPOSES[purpose_code]
        if amount_e_inr > purpose_spec["max_voucher_inr"]:
            raise ValueError(f"Amount {amount_e_inr} exceeds maximum limit {purpose_spec['max_voucher_inr']} for {purpose_code}")

        token_id = f"CBDC-{purpose_code[:4]}-{int(time.time()*1000)%1000000:06d}"
        expiry = (datetime.utcnow() + timedelta(days=purpose_spec["validity_days"])).strftime("%Y-%m-%d")

        return {
            "token_id": token_id,
            "denomination_e_inr": amount_e_inr,
            "purpose_code": purpose_code,
            "purpose_name": purpose_spec["name"],
            "beneficiary_id": beneficiary_id,
            "allowed_mcc_list": purpose_spec["allowed_mccs"],
            "expiry_date": expiry,
            "status": "ACTIVE",
            "issuing_authority": "RESERVE_BANK_OF_INDIA_CBDC_GATEWAY",
            "contract_hash": hashlib.sha256(f"{token_id}:{purpose_code}:{amount_e_inr}".encode()).hexdigest(),
            "created_at": datetime.utcnow().isoformat()
        }

    def validate_and_redeem_token(
        self,
        token_id: str,
        token_spec: Dict[str, Any],
        merchant_id: str,
        merchant_mcc: str,
        transaction_amount: float
    ) -> Dict[str, Any]:
        allowed_mccs = token_spec.get("allowed_mcc_list", [])
        denom = float(token_spec.get("denomination_e_inr", 0.0))

        if merchant_mcc not in allowed_mccs:
            return {
                "success": False,
                "rejection_code": "PURPOSE_MCC_MISMATCH",
                "error": f"Merchant MCC {merchant_mcc} is not authorized for token purpose {token_spec.get('purpose_code')}. Allowed MCCs: {allowed_mccs}",
                "token_id": token_id
            }

        if transaction_amount > denom:
            return {
                "success": False,
                "rejection_code": "INSUFFICIENT_VOUCHER_BALANCE",
                "error": f"Attempted redemption ₹{transaction_amount:,.2f} exceeds available voucher balance ₹{denom:,.2f}",
                "token_id": token_id
            }

        redeem_tx = f"TX-CBDC-RED-{token_id[-6:]}"
        return {
            "success": True,
            "status": "REDEEMED",
            "token_id": token_id,
            "merchant_id": merchant_id,
            "merchant_mcc": merchant_mcc,
            "redeemed_amount": transaction_amount,
            "remaining_balance": denom - transaction_amount,
            "drunix_settlement_tx": redeem_tx,
            "timestamp": datetime.utcnow().isoformat()
        }

    def execute_nexus_clearing(
        self,
        corridor: str,
        source_amount_inr: float,
        sender_id: str,
        recipient_id: str
    ) -> Dict[str, Any]:
        if corridor not in self.NEXUS_RAILS:
            raise ValueError(f"Corridor {corridor} not supported in Project Nexus clearing.")

        rail = self.NEXUS_RAILS[corridor]
        rate = rail["fx_rate"]
        dest_amount = round(source_amount_inr * rate, 2)
        vostro_bal = rail["vostro_balance"]

        # Check liquidity
        if vostro_bal < dest_amount:
            raise ValueError(f"Insufficient Vostro balance on rail {rail['nostro_account']}. Rebalance required.")

        clearing_ref = f"NEXUS-{corridor.replace('-', '')}-{int(time.time()*1000)%1000000:06d}"

        return {
            "clearing_id": clearing_ref,
            "corridor": corridor,
            "source_rail": rail["source_rail"],
            "dest_rail": rail["dest_rail"],
            "source_amount_inr": source_amount_inr,
            "fx_pair": rail["fx_pair"],
            "applied_fx_rate": rate,
            "dest_amount": dest_amount,
            "dest_currency": rail["fx_pair"].split("/")[1],
            "settlement_time_seconds": 1.8,
            "nostro_account": rail["nostro_account"],
            "vostro_remaining": round(vostro_bal - dest_amount, 2),
            "status": "SETTLED_INSTANT",
            "drunix_anchor_block": 43,
            "timestamp": datetime.utcnow().isoformat()
        }


cbdc_nexus_service = CBDCAndNexusService()
