# VYOM × DRUNIX — CHAMPIONSHIP PITCH SLIDES OUTLINE

### Drunix Hackathon (In collaboration with Citi & India Blockchain Forum)
**Challenge Code:** CHL-7007 | **Track:** Build the Future of Payments in India | **Prize:** ₹175,000

---

## Slide 1: Title Slide (The Brand & Vision)
* **Visual Headline:** VYOM × DRUNIX
* **Subtitle:** The Intent Firewall for Digital Payments
* **Tagline:** Intent-Governed Payment State (IGPS) Architecture Powered by NPCI Drunix DLT
* **Hackathon Challenge:** Challenge Code: CHL-7007 | India Blockchain Forum & Citi Track
* **Visual Elements:** High-contrast dark fintech UI screenshot showing live transaction inspection drawer, Drunix peer topology, and cryptographic proof verification badge.

---

## Slide 2: The Macro Crisis (The Authentication Fallacy)
* **Headline:** India's ₹1,200+ Crore Authorized Push Payment Paradox
* **The Problem:** 
  $$\text{Authentication}(u, k) = 1 \centernot\implies \text{Intent}(u, T) = 1$$
  * Modern payment rails (UPI, IMPS, RTGS) process 14 Billion transactions/month.
  * 85% of catastrophic fraud losses are **authorized by genuine users** under psychological coercion.
* **The Epidemic:**
  * **Digital Arrest Scams:** Victims extorted on multi-hour video calls impersonating CBI/ED.
  * **Mule Account Syndicates:** Layering ₹10 Lakhs through 20 accounts in 90 seconds.
  * **Current Reality:** Once MPIN is entered, the money is gone forever.

---

## Slide 3: The Breakthrough (Intent-Governed Payment State)
* **Headline:** Moving from Atomic Debits to Cryptographic Intent Governance
* **The Paradigm Shift:**
  * Introducing **IGPS**: Payments do not settle blindly. They transition through verifiable states governed by multi-modal intelligence and Drunix consortium consensus.
* **The 3-Tier Policy Verdict:**
  * `ALLOW` ➔ Instant Drunix block commit & UPI settlement (<50ms).
  * `VERIFY` ➔ Biometric / Hardware FIDO2 confirmation or Step-Up challenge.
  * `HOLD` ➔ On-chain 4-hour escrow, 2-of-3 Quorum multi-sig override, automated FIU-IND SAR dossier generation.

---

## Slide 4: Problem Statement 1 — Real-Time Payments
* **Headline:** Sub-50ms Intent Firewall, ISO 20022 & ZK Verification
* **Key Innovations:**
  * **ISO 20022 pacs.008.001.08 Wire Inspector:** Parses remittance info and agent routing codes; flags semantic mismatches between stated narrative and clearing accounts.
  * **SHA-256 Merkle Audit Tree:** Logarithmic $O(\log N)$ inclusion proofs for dispute resolution without leaking batch transaction contents.
  * **Groth16 Zero-Knowledge Intent Proofs:** BN254 elliptic curve proofs verifying intent validity without disclosing account balances or personal identifiers.

---

## Slide 5: Problem Statement 2 — Real Asset Tokenization
* **Headline:** Institutional TReDS Trade Receivables on Drunix (ERC-3643)
* **The Opportunity:** ₹30 Lakh Crore trapped in unpaid MSME invoices.
* **VYOM × Citi Treasury Solution:**
  * On-chain tokenization of corporate trade receivables from AAA buyers (e.g., Tata Motors, L&T).
  * Fractional tranches allow institutional liquidity providers (Citi Treasury, NBFCs) to fund MSMEs at competitive yields.
  * Drunix smart contract enforces an automated cashflow waterfall upon buyer maturity, eliminating double-pledging.

---

## Slide 6: Problem Statement 3 — Cross-Border Remittances
* **Headline:** BIS Project Nexus Gateway & Citi Nostro/Vostro Liquidity
* **The Opportunity:** $125 Billion annual inbound remittance corridor to India.
* **Key Innovations:**
  * **Project Nexus Multi-Lateral Settlement:** Direct corridor clearing between NPCI UPI / e-INR and Singapore (PayNow), UAE (Jaywan), and Thailand (PromptPay).
  * **Citi Wholesale Liquidity Engine:** Real-time Nostro/Vostro balance monitoring and corridor rebalancing in under 2 seconds.
  * **Automated RBI LRS Engine:** Sub-10ms validation of $250k annual limits and Tax Collected at Source (TCS) bracket calculations.

---

## Slide 7: Problem Statement 4 — Financial Inclusion
* **Headline:** Purpose-Bound Programmable CBDC (e-Rupee) Vouchers
* **The Opportunity:** ₹3.5 Lakh Crore in Direct Benefit Transfers (DBT) plagued by diversion and leakages.
* **Key Innovations:**
  * **PM-KISAN Fertilizer Vouchers:** Cryptographically restricted on Drunix to MCC `5169` (Chemicals & Fertilizer) at registered Krishi Kendra terminals.
  * **Ayushman Bharat Healthcare Vouchers:** Restricted to MCC `8062` (Hospitals & Medical Services).
  * **On-Chain Enforcement:** Any attempt to divert funds to unauthorized merchants or cash withdrawals is rejected at Drunix consensus time.

---

## Slide 8: Problem Statement 5 — Innovative Fintech Ideas
* **Headline:** Telecom Coercion Forensics, 2-of-3 Quorum & FIDO2 HSM
* **Key Innovations:**
  * **Digital Arrest Forensics Engine:** Sensor telemetry detecting active WhatsApp/Skype VoIP calls (>15m) and remote screen sharing software (AnyDesk, TeamViewer) during transaction execution.
  * **2-of-3 Dual-Control Quorum Override:** Multi-sig threshold consensus requiring 2 of 3 signatures (Originating Bank + NPCI Switch + Compliance) to release escrowed funds.
  * **Hardware-Grade FIDO2 HSM Signing:** WebAuthn hardware token attestation for tier-3 security operations overrides.

---

## Slide 9: Technical Rigor, Consortium Topology & Chaos Resilience
* **Headline:** Enterprise Resilience: 8,400+ TPS, 19/19 Tests, Zero Double-Spends
* **Consortium Topology:**
  * 4 Live Nodes: NPCI Raft Orderer, Citi Bank Peer, HDFC Bank Peer, ICICI Bank Peer.
* **Byzantine Fault Injection (Chaos Engine):**
  * Survives simulated Raft leader drops and 3/2 split-brain network partitions with sub-250ms re-election.
* **Zero Dependency Architecture:**
  * Pure HTML5/CSS/Vanilla JS frontend (Zero Node.js runtime risk).
  * Complete RESTful backend with 50+ endpoints and automated OpenAPI docs.

---

## Slide 10: Strategic Impact for Citi & NPCI & 12-Month Roadmap
* **Value to NPCI:** Eliminates Authorized Push Payment fraud on UPI; scales Drunix consortium throughput; operationalizes programmable e-Rupee.
* **Value to Citi:** Establishes Citi as the primary institutional clearing house for Project Nexus cross-border corridors; opens high-yield TReDS tokenized RWA tranches.
* **12-Month Production Roadmap:**
  * **Q4 2026:** Pilot sandbox with NPCI Drunix Testnet & Citi Institutional Clients.
  * **Q1 2027:** Live integration on Singapore-India (PayNow-UPI) Nexus corridor.
  * **Q2 2027:** Full TReDS corporate invoice tokenization roll-out with MSME Ministry.
* **Call to Action:** *"Together with Citi and NPCI, let us build the future of tamper-proof, intent-aware payments in India."*
