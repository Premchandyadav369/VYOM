"""
VERA Digital Arrest, Acoustic Telemetry & Coercion Intelligence Engine
Analyzes active telecom call duration, VoIP channels, screen-sharing remote access
tools, clipboard pasting, and biometric typing hesitation to detect social coercion scams.
"""

from typing import Dict, Any, List
from datetime import datetime


class CoercionEngine:
    """
    Evaluates real-time ambient phone call state, remote access tools,
    and user input entropy to flag Digital Arrest and syndicate extortion.
    """

    CRITICAL_COERCION_PHRASES = [
        "cbi", "narcotics", "customs", "arrest warrant", "digital arrest",
        "do not disconnect", "supreme court", "money laundering investigation",
        "penal code", "surrender funds", "clearance deposit", "mule account",
        "rbi verification account", "police clearance", "courier parcel seized"
    ]

    def evaluate_coercion(
        self,
        payment_id: str,
        stated_intent: str,
        amount: float,
        call_telemetry: Dict[str, Any] = None,
        device_telemetry: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        call = call_telemetry or {}
        device = device_telemetry or {}

        call_duration_sec = int(call.get("active_call_duration_seconds", 0))
        call_channel = call.get("call_channel", "NONE")  # WHATSAPP_VOIP, TELEGRAM, PSTN, SKYPE, NONE
        caller_geo = call.get("caller_geo_flag", "NORMAL")  # HIGH_RISK_FOREIGN, SPOOFED_VOIP, NORMAL
        remote_tool = bool(device.get("remote_access_tool_detected", False))  # AnyDesk / TeamViewer
        hesitation_ms = int(device.get("keystroke_hesitation_ms", 450))
        pasted_beneficiary = bool(device.get("clipboard_paste_detected", False))

        # 1. NLP Urgency & Coercion scoring
        clean_intent = (stated_intent or "").lower()
        matched_triggers = [p for p in self.CRITICAL_COERCION_PHRASES if p in clean_intent]
        urgency_score = min(len(matched_triggers) * 0.35, 1.0)

        # 2. Telecom & Ambient Call Risk
        call_risk = 0.0
        flags = []

        if call_duration_sec > 600:  # Active call > 10 mins
            call_risk += 0.35
            flags.append(f"EXTENDED_ACTIVE_CALL_{call_duration_sec // 60}MINS")
        elif call_duration_sec > 180:  # Active call > 3 mins
            call_risk += 0.20
            flags.append("CONCURRENT_ACTIVE_CALL_DURING_TRANSFER")

        if call_channel in ["WHATSAPP_VOIP", "TELEGRAM", "SKYPE"] and call_duration_sec > 60:
            call_risk += 0.25
            flags.append(f"UNSECURED_VOIP_CALL_CHANNEL_{call_channel}")

        if caller_geo in ["HIGH_RISK_FOREIGN", "SPOOFED_VOIP"]:
            call_risk += 0.30
            flags.append("CALLER_GEO_ANOMALY_FOREIGN_PROXY")

        # 3. Remote Access & RAT detection (AnyDesk / TeamViewer)
        if remote_tool:
            call_risk += 0.45
            flags.append("ACTIVE_REMOTE_DESKTOP_TOOL_DETECTED")

        # 4. Biometric Typing Hesitation & Clipboard Injection
        if pasted_beneficiary:
            flags.append("BENEFICIARY_CLIPBOARD_INJECTION")
            call_risk += 0.15

        if hesitation_ms > 2500:  # Severe hesitation before PIN confirmation
            flags.append(f"ANOMALOUS_KEYSTROKE_HESITATION_{hesitation_ms}MS")
            call_risk += 0.20

        # Unified Coercion Risk
        total_coercion_score = min(1.0, round(
            (urgency_score * 0.40) +
            (call_risk * 0.45) +
            (0.15 if (remote_tool or pasted_beneficiary) else 0.0),
            3
        ))

        if total_coercion_score >= 0.70:
            coercion_level = "CRITICAL"
            recommended_intervention = "IMMEDIATE_CALL_DISCONNECT_AND_MANDATORY_HOLD"
        elif total_coercion_score >= 0.40:
            coercion_level = "HIGH"
            recommended_intervention = "INTERACTIVE_VOICE_OUT_OF_BAND_VERIFICATION"
        elif total_coercion_score >= 0.20:
            coercion_level = "MEDIUM"
            recommended_intervention = "STEP_UP_DEVICE_CHALLENGE"
        else:
            coercion_level = "LOW"
            recommended_intervention = "STANDARD_MONITORING"

        return {
            "payment_id": payment_id,
            "coercion_risk_score": total_coercion_score,
            "coercion_level": coercion_level,
            "matched_phrases": matched_triggers,
            "telecom_signals": {
                "call_channel": call_channel,
                "call_duration_seconds": call_duration_sec,
                "caller_geo_flag": caller_geo
            },
            "device_signals": {
                "remote_access_tool_detected": remote_tool,
                "keystroke_hesitation_ms": hesitation_ms,
                "clipboard_paste_detected": pasted_beneficiary
            },
            "flags": flags,
            "recommended_intervention": recommended_intervention,
            "digital_arrest_probability": min(1.0, round(total_coercion_score * 1.15, 2)) if matched_triggers else 0.05,
            "evaluated_at": datetime.utcnow().isoformat()
        }


coercion_engine = CoercionEngine()
