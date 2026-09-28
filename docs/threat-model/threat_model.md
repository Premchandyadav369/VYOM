# VERA × DRUNIX Comprehensive Threat Model & Security Architecture

## 1. Executive Summary
Traditional digital payment authentication asks only one question: *"Did the credential holder authorize this transaction?"* In contrast, **Intent-Governed Payment State (IGPS)** treats payments as multi-stage policy transitions governed by off-chain probabilistic risk intelligence (VERA) and enforced by an on-chain permissioned distributed ledger (NPCI Drunix).

This document establishes the security perimeter, threat matrix (T1–T12), trust boundaries, and residual risks for VERA × DRUNIX.

---

## 2. Threat Analysis Matrix (T1 – T12)

| Threat ID | Threat Name | Attack Surface | Mitigation Strategy | Residual Risk |
|---|---|---|---|---|
| **T1** | **Social Engineering Scams** | User initiates authorized payment under deception or coercion (investment scams, fake customer support, urgent tax penalty). | **VERA Intent Engine & NLP Coercion Detection:** Analyzes stated payment purpose, detects urgency/pressure keywords, flags new/unfamiliar counterparty, requires targeted friction (`VERIFY` / `HOLD`). | Attacker coaches user to input deceptive intent keywords (countered by recipient graph anomaly check). |
| **T2** | **Account Takeover (ATO)** | Compromised session token, stolen device, or SIM swap allows unauthorized access to initiate transfers. | **Behavioral & Context Risk Engine:** Isolation Forest flags abnormal hours (2 AM – 5 AM), unexpected IP/device novelty, sudden velocity bursts. Triggers biometric secondary authorization. | Slow-draining low-value transactions from familiar device over extended period. |
| **T3** | **Recipient Spoofing / Look-alike VPAs** | Attacker registers look-alike Virtual Payment Address (e.g. `swiggy.support@bank` instead of verified merchant VPA). | **Recipient Graph & Merchant Verification:** VERA checks VPA against verified merchant registry. Distinguishes personal accounts from commercial entities. Low recipient trust triggers `VERIFY`. | Accidental payment to newly created legitimate personal account with genuine name collision. |
| **T4** | **Mule Networks & Layering** | Scammers route proceeds through rapid pass-through mule chains to evade static account blacklists. | **Trust Graph Engine & Centrality Scoring:** Identifies fan-in/fan-out graph topology, low account tenure, high betweenness centrality, and mule cluster proximity. | Brand-new dormant sleeper accounts activated for single one-off transactions. |
| **T5** | **Adversarial Model Manipulation** | Fraudster constructs adversarial intent descriptions designed to deceive NLP semantic classifiers into predicting high consistency. | **Multi-Modal Risk Fusion:** Intent is not evaluated in isolation. Fusion weights intent (28%) with behavior (22%), recipient trust (20%), network risk (15%), and context (15%). Even if NLP is bypassed, graph/behavior triggers intervention. | Novel zero-day fraud typology with completely normal transaction parameters. |
| **T6** | **API Replay Attacks** | Man-in-the-middle captures legitimate payment API requests and replays them to drain funds. | **Cryptographic Nonces & Timestamp Skew Windows:** Every request mandates unique UUIDv4 nonce and RFC3339 timestamp with 300-second maximum skew. Duplicate nonces immediately rejected. | Clocks out-of-sync by >5 minutes (mitigated via NTP synchronization). |
| **T7** | **Ledger State Tampering** | Malicious participant attempts to rewrite historical payment state or alter committed records. | **Drunix Raft Consensus & Merkle State Integrity:** Blocks are cryptographically linked using SHA-256 block hashes and Merkle root proofs across committing peers. Historical state is immutable. | Collusion of >50% of Raft ordering consensus nodes across independent institutions (near impossible in permissioned consortium). |
| **T8** | **Unauthorized Organization State Transition** | Rogue institution or compromised bank peer attempts to unilaterally commit settlement state without counterparty verification. | **Stateless Validation Service (VSCC) & Multi-MSP Endorsement Policies:** Drunix smart contract enforces multi-party endorsement (e.g. `Org1MSP` + `Org2MSP` + `ComplianceMSP`). Transactions lacking required signatures are rejected by VSCC. | Compromise of multiple participating organization private keys simultaneously. |
| **T9** | **Compromised VERA Service** | Attacker compromises an internal VERA intelligence worker node to force `ALLOW` decisions. | **Cryptographic Decision Signing & Versioned Policy Attestation:** Every VERA decision requires HMAC/Ed25519 signature verified by chaincode before Drunix accepts state transition. Unauthorized signature changes reject the block. | Compromise of master VERA signing key (mitigated via HSM / KMS hardware enclave isolation). |
| **T10** | **Malicious Insider** | Bank database administrator attempts to manually edit payment status directly in database. | **DLT Shared Truth vs Local DB:** Database is merely a query cache of the Drunix blockchain state. Any discrepancy between local DB and Drunix peer state is flagged during MVCC read-write validation. | Insider with physical root access to peer node disk (detected via gossip block height auditing). |
| **T11** | **Data Leakage & PII Exposure on Ledger** | Sensitive user transaction descriptions, biometric data, or private profiles exposed to consortium ledger. | **KeyDB Transient Store & Zero-Knowledge Hashes:** Only cryptographic hashes (`intent_hash`, `vera_signature`, `decision`) reach the distributed ledger. Raw conversational text and device telemetry remain in ephemeral KeyDB transient storage. | Hash correlation if salt space is insufficiently random (prevented via high-entropy salt). |
| **T12** | **Distributed Denial of Service (DDoS)** | Flooding VERA intelligence endpoint or Drunix Lite Peers with invalid high-frequency transaction proposals. | **Idempotency Tracking, Rate Limiting & Stateless Validation:** Stateless Validation Service (VSCC) scales horizontally independently of peer nodes. Idempotency cache deduplicates redundant requests at reverse proxy. | Volumetric pipe saturation at external ISP level. |

---

## 3. Trust Boundaries & Separation of Concerns

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 CLIENT APPLICATION                      │
                  └────────────────────────────┬────────────────────────────┘
                                               │ [HTTPS / JWT Authenticated]
                                               ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ TRUST BOUNDARY 1: VERA OFF-CHAIN INTELLIGENCE PLANE                                       │
│                                                                                           │
│  • Ephemeral Feature Store & PII Isolation                                                │
│  • Intent NLP & Semantic Similarity Engine                                                │
│  • Recipient Trust Graph & Mule Proximity Traversal                                       │
│  • Multi-Modal Risk Fusion (Interpretable Linear + XGBoost)                               │
│  • Adaptive Policy Engine (Safety-Friction Optimization)                                  │
│  • Cryptographic Decision Signer (HMAC-SHA256 / Ed25519)                                   │
└──────────────────────────────────────────────┬────────────────────────────────────────────┘
                                               │ [Signed Policy Decision & Nonce]
                                               ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ TRUST BOUNDARY 2: DRUNIX ON-CHAIN EXECUTION PLANE                                         │
│                                                                                           │
│  • Lite Peers (LP): Simulation & Endorsement Gathering                                    │
│  • KeyDB Transient Store: Private data exchange without on-chain leakage                 │
│  • Raft Orderers: Deterministic block sequencing & batching                              │
│  • Stateless Validation Service (VSCC): Cryptographic policy & endorsement verification   │
│  • Committing Peers (CP): MVCC conflict resolution & SQL State DB updates                 │
│  • Chaincode Invariants: Strict IGPS State Transition Validation                          │
└──────────────────────────────────────────────┬────────────────────────────────────────────┘
                                               │ [Finality Commit Event]
                                               ▼
                  ┌─────────────────────────────────────────────────────────┐
                  │              SETTLEMENT & RAILS (UPI / FX)              │
                  └─────────────────────────────────────────────────────────┘
```
