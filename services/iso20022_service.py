"""
VERA ISO 20022 & UPI 2.0 Wire Protocol Inspector Service
Generates pacs.008.001.08 XML payloads and NPCI UPI 2.0 wire dumps with automated
semantic mismatch and tampering detection between narrative and creditor fields.
"""

import time
import hashlib
import xml.dom.minidom
from typing import Dict, Any, List, Optional
from datetime import datetime


class ISO20022Service:
    """
    Simulates real-world SWIFT / NPCI ISO 20022 pacs.008 credit transfers
    and UPI 2.0 wire packet schemas with field annotation and diff detection.
    """

    def generate_pacs008_xml(self, payment_data: Dict[str, Any]) -> str:
        """
        Builds compliant ISO 20022 pacs.008.001.08 XML document.
        """
        pid = payment_data.get("payment_id", "PAY-000000")
        sender = payment_data.get("sender_id", "rohit.sharma@okaxis")
        recipient = payment_data.get("recipient_id", "blinkit@axisbank")
        amount = payment_data.get("amount", 1000.0)
        currency = payment_data.get("currency", "INR")
        stated_intent = payment_data.get("stated_intent", "Merchant purchase goods/services")
        dt_str = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        msg_id = f"NPCI/VERA/{pid}/{int(time.time())}"

        # Clean strings for XML
        clean_intent = (stated_intent or "Direct Transfer").replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>{msg_id}</MsgId>
      <CreDtTm>{dt_str}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys>
          <Prtry>NPCI_UPI_RTGS</Prtry>
        </ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>{pid}</EndToEndId>
        <TxId>TX-UPI-{pid}</TxId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="{currency}">{amount:.2f}</IntrBkSttlmAmt>
      <InstdAmt Ccy="{currency}">{amount:.2f}</InstdAmt>
      <ChrgBr>DEBT</ChrgBr>
      <Dbtr>
        <Nm>{sender}</Nm>
        <Id>
          <OrgId>
            <Othr>
              <Id>UPI-VPA-{sender}</Id>
            </Othr>
          </OrgId>
        </Id>
      </Dbtr>
      <DbtrAgt>
        <FinInstnId>
          <BICFI>UTIBINBBXXX</BICFI>
          <Nm>AXIS BANK LTD</Nm>
        </FinInstnId>
      </DbtrAgt>
      <CdtrAgt>
        <FinInstnId>
          <BICFI>HDFCINBBXXX</BICFI>
          <Nm>HDFC BANK LTD</Nm>
        </FinInstnId>
      </CdtrAgt>
      <Cdtr>
        <Nm>{recipient}</Nm>
        <Id>
          <OrgId>
            <Othr>
              <Id>UPI-VPA-{recipient}</Id>
            </Othr>
          </OrgId>
        </Id>
      </Cdtr>
      <RmtInf>
        <Ustrd>{clean_intent}</Ustrd>
      </RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>"""
        return xml_content

    def generate_upi_wire_json(self, payment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Builds raw NPCI UPI 2.0 ReqPay API wire format payload.
        """
        pid = payment_data.get("payment_id", "PAY-000000")
        sender = payment_data.get("sender_id", "rohit.sharma@okaxis")
        recipient = payment_data.get("recipient_id", "blinkit@axisbank")
        amount = payment_data.get("amount", 1000.0)
        currency = payment_data.get("currency", "INR")
        stated_intent = payment_data.get("stated_intent", "Merchant purchase goods/services")

        tx_ts = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S+05:30")
        wire_hash = hashlib.sha256(f"{pid}|{sender}|{recipient}|{amount}".encode()).hexdigest()

        return {
            "Head": {
                "ver": "2.0",
                "ts": tx_ts,
                "orgId": "NPCI_001",
                "msgId": f"MSG-{pid}-REQ"
            },
            "Txn": {
                "id": f"UPI-{pid}",
                "note": stated_intent,
                "refId": f"REF{int(time.time())}",
                "type": "PAY",
                "custRef": f"CR{pid}",
                "subType": "PAY"
            },
            "Payer": {
                "addr": sender,
                "name": sender.split("@")[0].replace(".", " ").title(),
                "seqNo": "1",
                "type": "PERSON",
                "code": "0000",
                "Device": {
                    "Tag": [
                        {"name": "mobile", "value": "+919876543210"},
                        {"name": "geocode", "value": "19.0760,72.8777"},
                        {"name": "location", "value": "MUMBAI, MAHARASHTRA"},
                        {"name": "ip", "value": "49.36.128.4"}
                    ]
                }
            },
            "Payee": {
                "addr": recipient,
                "name": recipient.split("@")[0].replace(".", " ").title(),
                "seqNo": "1",
                "type": "ENTITY" if ("@" in recipient and not recipient.endswith("upi")) else "PERSON",
                "code": "5411" if "blinkit" in recipient or "grocer" in recipient.lower() else "0000"
            },
            "Amount": {
                "curr": currency,
                "value": f"{amount:.2f}"
            },
            "CryptoSignature": f"SHA256withRSA:{wire_hash[:32]}"
        }

    def inspect_protocol_discrepancies(self, payment_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Inspects ISO 20022 / UPI fields for semantic mismatches, protocol tampering,
        or deceptive structuring.
        """
        annotations = []
        intent = (payment_data.get("stated_intent") or "").lower()
        recipient = (payment_data.get("recipient_id") or "").lower()
        amount = float(payment_data.get("amount", 0.0))

        # Check 1: Remittance Info vs Beneficiary Mismatch
        if "customs" in intent or "courier" in intent or "tax" in intent:
            if "scam" in recipient or "hold" in recipient or "clearance" in recipient or "police" in recipient or "cbi" in recipient:
                annotations.append({
                    "field": "RmtInf.Ustrd <-> Cdtr.Nm",
                    "severity": "CRITICAL",
                    "code": "COERCIVE_IMPERSONATION_TAG",
                    "message": "Narrative mentions state authority/customs while beneficiary VPA points to an unverified private custodial account.",
                    "iso_path": "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/RmtInf/Ustrd",
                    "highlight": True
                })

        # Check 2: High Amount with Informal Narrative
        if amount > 100000 and any(w in intent for w in ["gift", "temp", "test", "urgent", "help"]):
            annotations.append({
                "field": "IntrBkSttlmAmt <-> RmtInf.Ustrd",
                "severity": "HIGH",
                "code": "HIGH_VALUE_INFORMAL_STRUCTURING",
                "message": f"Settlement amount of INR {amount:,.2f} paired with non-standard informal remittance narrative '{intent}'.",
                "iso_path": "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/IntrBkSttlmAmt",
                "highlight": True
            })

        # Check 3: Commercial grocery narrative to non-merchant personal VPA
        if any(w in intent for w in ["grocery", "order", "food", "dinner", "rent"]) and "scam" in recipient:
            annotations.append({
                "field": "Cdtr.Id <-> RmtInf.Ustrd",
                "severity": "HIGH",
                "code": "MCC_MERCHANT_INTENT_DISCORDANCE",
                "message": "Consumer purchase narrative routed to a flagged consumer VPA instead of an authorized merchant aggregator.",
                "iso_path": "/Document/FIToFICstmrCdtTrf/CdtTrfTxInf/Cdtr",
                "highlight": True
            })

        if not annotations:
            annotations.append({
                "field": "pacs.008.001.08 Schema",
                "severity": "INFO",
                "code": "SCHEMA_VALIDATED",
                "message": "No anomalous semantic discrepancies detected between remittance narrative and creditor entity.",
                "iso_path": "/Document/FIToFICstmrCdtTrf",
                "highlight": False
            })

        return annotations

    def generate_raw_hex_dump(self, xml_text: str) -> str:
        """Generates formatted byte hex dump for network packet inspection."""
        raw_bytes = xml_text.encode("utf-8")
        lines = []
        for i in range(0, min(len(raw_bytes), 256), 16):
            chunk = raw_bytes[i:i+16]
            hex_part = " ".join(f"{b:02x}" for b in chunk)
            ascii_part = "".join(chr(b) if 32 <= b <= 126 else "." for b in chunk)
            lines.append(f"{i:04x}   {hex_part:<48}  |{ascii_part}|")
        if len(raw_bytes) > 256:
            lines.append(f"... [{len(raw_bytes) - 256} additional bytes omitted from wire buffer]")
        return "\n".join(lines)


iso20022_service = ISO20022Service()
