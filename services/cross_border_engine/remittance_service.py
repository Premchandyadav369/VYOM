"""
VYOM Cross-Border Remittance Engine
Evaluates bidirectional international payment corridors across 195 sovereign nations (ISO 3166-1).
Supports OUTWARD remittances (India -> World) under RBI LRS & TCS rules,
and INWARD remittances (World -> India) over Project Nexus / NPCI Drunix DLT with instant FIRC generation.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
import hashlib
import time
from data.schemas.models import CrossBorderFeatures
from services.cross_border_engine.global_countries import GLOBAL_COUNTRIES, GLOBAL_COUNTRIES_BY_CODE


class CrossBorderEngine:
    """Manages cross-border payment risk, FX corridor routing, and compliance states across 195 sovereign nations."""

    # Top featured corridors for rapid selection
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

    # FATF Blacklist / High-Risk Jurisdictions subject to mandatory OFAC / UN sanctions block
    HIGH_RISK_COUNTRIES = {"IR", "KP", "SY", "RU", "CU", "MM"}

    def __init__(self):
        self.all_countries = GLOBAL_COUNTRIES
        self.countries_by_code = GLOBAL_COUNTRIES_BY_CODE

    def list_all_countries(self) -> List[Dict[str, Any]]:
        """Returns the full catalog of 195 sovereign countries with live FX & rail metadata."""
        return self.all_countries

    def list_supported_corridors(self) -> List[Dict[str, Any]]:
        """Returns metadata for key cross-border corridors."""
        return [
            {"code": k, **v} for k, v in self.CORRIDORS.items()
        ]

    def evaluate_cross_border(
        self,
        amount_inr: float,
        dest_country: str,
        corridor_code: Optional[str] = None,
        recipient_id: Optional[str] = None,
        direction: str = "OUTWARD",
        origin_country: str = "IN"
    ) -> CrossBorderFeatures:
        """
        Evaluates FX rates, routing safety, LRS/TCS compliance, and settlement latency
        for bidirectional international remittances across 195 sovereign nations.
        """
        dir_clean = direction.upper() if direction else "OUTWARD"
        
        # Determine the target foreign country code
        if dir_clean == "INWARD":
            foreign_code = origin_country.upper() if origin_country and origin_country.upper() != "IN" else dest_country.upper()
            if foreign_code == "IN":
                foreign_code = "US"  # Fallback foreign source
            origin_c = foreign_code
            dest_c = "IN"
        else:
            foreign_code = dest_country.upper() if dest_country and dest_country.upper() != "IN" else "US"
            origin_c = "IN"
            dest_c = foreign_code

        # Check Sanctions / FATF Blacklist
        is_sanctioned = foreign_code in self.HIGH_RISK_COUNTRIES
        country_meta = self.countries_by_code.get(foreign_code)
        if country_meta and country_meta.get("sanctioned", False):
            is_sanctioned = True

        if is_sanctioned:
            corridor_label = f"{origin_c}-{dest_c}"
            cur_pair = f"INR/{foreign_code}" if dir_clean == "OUTWARD" else f"{foreign_code}/INR"
            return CrossBorderFeatures(
                is_cross_border=True,
                origin_country=origin_c,
                destination_country=dest_c,
                corridor=corridor_label,
                currency_pair=cur_pair,
                fx_rate=0.0,
                fx_spread_pct=0.0,
                fee_inr=0.0,
                estimated_settlement_mins=0,
                country_risk_score=0.99,
                route_risk_score=0.99,
                compliance_status="SANCTIONS_BLOCKED_OFAC_FATF",
                direction=dir_clean,
                source_amount=amount_inr,
                dest_amount=0.0,
                source_currency="INR" if dir_clean == "OUTWARD" else (country_meta.get("currency", "USD") if country_meta else "USD"),
                dest_currency=country_meta.get("currency", "USD") if dir_clean == "OUTWARD" and country_meta else "INR",
                tcs_inr=0.0,
                firc_number=None,
                settlement_rail="BLOCKED_BY_SANCTIONS_FIREWALL"
            )

        # Lookup country metadata with default fallback
        if not country_meta:
            country_meta = {
                "code": foreign_code,
                "name": f"Nation ({foreign_code})",
                "currency": "USD",
                "flag": "🌐",
                "base_fx_rate": 0.0120,
                "fx_spread_pct": 1.50,
                "flat_fee_inr": 200.0,
                "avg_settlement_mins": 15,
                "country_risk": 0.08,
                "rail": "SWIFT GPI / Project Nexus",
                "regime": "INTERNATIONAL_CORRESPONDENT",
                "sanctioned": False
            }

        foreign_currency = country_meta.get("currency", "USD")
        base_rate = country_meta.get("base_fx_rate", 0.0120)
        spread = country_meta.get("fx_spread_pct", 1.20)
        country_risk = country_meta.get("country_risk", 0.06)
        settlement_rail = country_meta.get("rail", "Project Nexus / Drunix DLT")

        # Bidirectional Calculation
        if dir_clean == "INWARD":
            # Foreign Currency -> INR
            corridor_label = f"{foreign_code}-IN"
            cur_pair = f"{foreign_currency}/INR"
            source_amount = float(amount_inr)
            # 1 Unit of Foreign Currency to INR
            fx_rate = round(1.0 / max(1e-6, base_rate), 4)
            # Destination amount in INR
            dest_amount = round(source_amount * fx_rate * (1.0 - (spread / 100.0)), 2)
            fee_inr = round(country_meta.get("flat_fee_inr", 100.0), 2)
            tcs_inr = 0.0  # Inward foreign remittance is 0% TCS under FEMA
            
            # Instant Foreign Inward Remittance Certificate (FIRC)
            firc_hash = hashlib.sha256(f"FIRC-{foreign_code}-{source_amount}-{time.time()}".encode()).hexdigest()[:10].upper()
            firc_number = f"FIRC-2026-{foreign_code}-{firc_hash}"
            compliance_status = "INWARD_FIRC_ISSUED_SETTLED"
            est_mins = max(1, min(5, country_meta.get("avg_settlement_mins", 3)))
            route_risk = round(min(0.99, country_risk + 0.03), 3)

            return CrossBorderFeatures(
                is_cross_border=True,
                origin_country=foreign_code,
                destination_country="IN",
                corridor=corridor_label,
                currency_pair=cur_pair,
                fx_rate=fx_rate,
                fx_spread_pct=spread,
                fee_inr=fee_inr,
                estimated_settlement_mins=est_mins,
                country_risk_score=country_risk,
                route_risk_score=route_risk,
                compliance_status=compliance_status,
                direction="INWARD",
                source_amount=source_amount,
                dest_amount=dest_amount,
                source_currency=foreign_currency,
                dest_currency="INR",
                tcs_inr=tcs_inr,
                firc_number=firc_number,
                settlement_rail=f"Project Nexus / Drunix DLT ({settlement_rail})"
            )
        else:
            # OUTWARD: INR -> Foreign Currency
            corridor_label = f"IN-{foreign_code}"
            cur_pair = f"INR/{foreign_currency}"
            source_amount = float(amount_inr)
            fx_rate = base_rate
            dest_amount = round(source_amount * fx_rate * (1.0 - (spread / 100.0)), 2)
            fee_inr = round(country_meta.get("flat_fee_inr", 150.0) + (source_amount * (spread / 100.0)), 2)

            # RBI Liberalised Remittance Scheme (LRS) & Tax Collected at Source (TCS):
            # Threshold: INR 7,00,000 (~7 Lakhs) per financial year.
            # 20% TCS applies on the amount exceeding ₹7,00,000 for standard remittances.
            if source_amount > 700000.0:
                tcs_inr = round((source_amount - 700000.0) * 0.20, 2)
                compliance_status = "LRS_TCS_AUDIT_REQUIRED"
                additional_route_risk = 0.22
            elif source_amount > 200000.0:
                tcs_inr = 0.0
                compliance_status = "EDD_DOCUMENTATION_VERIFIED"
                additional_route_risk = 0.08
            else:
                tcs_inr = 0.0
                compliance_status = "STANDARD_REMITTANCE_CLEARED"
                additional_route_risk = 0.0

            route_risk = round(min(0.99, country_risk + additional_route_risk + 0.04), 3)
            est_mins = country_meta.get("avg_settlement_mins", 10)

            return CrossBorderFeatures(
                is_cross_border=True,
                origin_country="IN",
                destination_country=foreign_code,
                corridor=corridor_label,
                currency_pair=cur_pair,
                fx_rate=fx_rate,
                fx_spread_pct=spread,
                fee_inr=fee_inr,
                estimated_settlement_mins=est_mins,
                country_risk_score=country_risk,
                route_risk_score=route_risk,
                compliance_status=compliance_status,
                direction="OUTWARD",
                source_amount=source_amount,
                dest_amount=dest_amount,
                source_currency="INR",
                dest_currency=foreign_currency,
                tcs_inr=tcs_inr,
                firc_number=None,
                settlement_rail=f"Drunix Nexus Gateway ({settlement_rail})"
            )
