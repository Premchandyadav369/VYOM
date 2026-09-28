"""
VERA Cross-Border Remittance Engine
Evaluates international payment corridors (India -> SG, UAE, UK, US),
calculates FX spreads, route risk, compliance screening states, and settlement latencies.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from data.schemas.models import CrossBorderFeatures


class CrossBorderEngine:
    """Manages cross-border payment risk, FX corridor routing, and compliance states."""

    CORRIDORS = {
        "IN-SG": {
            "name": "India - Singapore (UPI-PayNow Linkage)",
            "dest_country": "SG",
            "currency": "SGD",
            "base_fx_rate": 0.0162,  # 1 INR = ~0.0162 SGD
            "fx_spread_pct": 0.85,
            "flat_fee_inr": 75.0,
            "avg_settlement_mins": 2,
            "country_risk": 0.05,
            "route_risk": 0.08,
            "compliance_regime": "UPI_PAYNOW_BILATERAL_FAST"
        },
        "IN-UAE": {
            "name": "India - UAE (IPP-AANI / Jaywan Linkage)",
            "dest_country": "AE",
            "currency": "AED",
            "base_fx_rate": 0.0441,  # 1 INR = ~0.0441 AED
            "fx_spread_pct": 1.10,
            "flat_fee_inr": 120.0,
            "avg_settlement_mins": 5,
            "country_risk": 0.12,
            "route_risk": 0.14,
            "compliance_regime": "CBUAE_NPCI_BILATERAL"
        },
        "IN-UK": {
            "name": "India - United Kingdom (Faster Payments)",
            "dest_country": "GB",
            "currency": "GBP",
            "base_fx_rate": 0.0094,  # 1 INR = ~0.0094 GBP
            "fx_spread_pct": 1.45,
            "flat_fee_inr": 250.0,
            "avg_settlement_mins": 15,
            "country_risk": 0.08,
            "route_risk": 0.18,
            "compliance_regime": "FCA_RBI_CORRESPONDENT"
        },
        "IN-US": {
            "name": "India - United States (FedNow / ACH Link)",
            "dest_country": "US",
            "currency": "USD",
            "base_fx_rate": 0.0120,  # 1 INR = ~0.0120 USD
            "fx_spread_pct": 1.60,
            "flat_fee_inr": 350.0,
            "avg_settlement_mins": 45,
            "country_risk": 0.06,
            "route_risk": 0.22,
            "compliance_regime": "FINCEN_RBI_REMITTANCE"
        }
    }

    HIGH_RISK_COUNTRIES = {"IR", "KP", "SY", "RU", "MM"}

    def evaluate_cross_border(
        self,
        amount_inr: float,
        dest_country: str,
        corridor_code: Optional[str] = None,
        recipient_id: Optional[str] = None
    ) -> CrossBorderFeatures:
        """Evaluates FX rates, routing safety, and compliance risk for international transactions."""
        dest_upper = dest_country.upper()

        # Sanctions check
        if dest_upper in self.HIGH_RISK_COUNTRIES:
            return CrossBorderFeatures(
                is_cross_border=True,
                origin_country="IN",
                destination_country=dest_upper,
                corridor=f"IN-{dest_upper}",
                currency_pair=f"INR/{dest_upper}",
                fx_rate=0.0,
                fx_spread_pct=0.0,
                fee_inr=0.0,
                estimated_settlement_mins=0,
                country_risk_score=0.99,
                route_risk_score=0.99,
                compliance_status="SANCTIONS_BLOCKED_OFAC_FATF"
            )

        # Match corridor
        matched_key = corridor_code if corridor_code in self.CORRIDORS else None
        if not matched_key:
            for k, cfg in self.CORRIDORS.items():
                if cfg["dest_country"] == dest_upper:
                    matched_key = k
                    break

        if not matched_key:
            matched_key = "IN-US"  # Default international corridor

        cfg = self.CORRIDORS[matched_key]
        dest_currency = cfg["currency"]
        fx_rate = cfg["base_fx_rate"]
        spread = cfg["fx_spread_pct"]
        fee = cfg["flat_fee_inr"] + (amount_inr * (spread / 100.0))

        # Size-based compliance tier
        if amount_inr > 700000.0:  # RBI LRS TCS threshold (7 Lakhs INR)
            compliance_status = "LRS_TCS_AUDIT_REQUIRED"
            additional_route_risk = 0.25
        elif amount_inr > 200000.0:
            compliance_status = "EDD_DOCUMENTATION_VERIFIED"
            additional_route_risk = 0.10
        else:
            compliance_status = "STANDARD_REMITTANCE_CLEARED"
            additional_route_risk = 0.0

        total_route_risk = min(0.99, cfg["route_risk"] + additional_route_risk)

        return CrossBorderFeatures(
            is_cross_border=True,
            origin_country="IN",
            destination_country=cfg["dest_country"],
            corridor=matched_key,
            currency_pair=f"INR/{dest_currency}",
            fx_rate=fx_rate,
            fx_spread_pct=spread,
            fee_inr=round(fee, 2),
            estimated_settlement_mins=cfg["avg_settlement_mins"],
            country_risk_score=cfg["country_risk"],
            route_risk_score=round(total_route_risk, 3),
            compliance_status=compliance_status
        )

    def list_supported_corridors(self) -> List[Dict[str, Any]]:
        """Returns metadata for all available cross-border remittance corridors."""
        return [
            {"code": k, **v} for k, v in self.CORRIDORS.items()
        ]
