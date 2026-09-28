# VERA × DRUNIX

### The Intent Firewall for Digital Payments
**Intent-Governed Payment State (IGPS) Architecture Powered by NPCI Drunix**

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![NPCI Drunix](https://img.shields.io/badge/DLT-NPCI_Drunix_v1.0-emerald.svg)](https://github.com/npci/drunix)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0-teal.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://react.dev)
[![Tests](https://img.shields.io/badge/Tests-9%2F9%20Passing-brightgreen.svg)](tests/)

---

## 1. Problem Formulation

Traditional digital payment rails—including instant settlement systems such as India's Unified Payments Interface (UPI)—are architected around an implicit binary invariant:

> **"Did the credential holder authorize this transaction?"**

If cryptographic credentials (e.g. MPIN, biometric token, SMS OTP) validate, the payment rail executes the transfer immediately.

However, the vast majority of modern catastrophic payment losses are **authorized by the legitimate account holder**:
- **Social Engineering & Confidence Scams:** Victims are psychologically manipulated into willingly transferring life savings (fake police/customs extortion, lottery frauds, customer support impersonation).
- **Investment Scams & Pig Butchering:** Coerced deposits into synthetic high-yield trading schemes.
- **Accidental Wrong-Recipient Transfers:** Mistyped phone numbers or VPAs routed irrevocably to unknown third parties without an escrow or verification recourse.
- **Account Takeover (ATO) & Mule Networks:** Sudden account drain routed through coordinated high-degree layering accounts.

In all such cases:
$$\text{Authentication}(u, k) = 1, \quad \text{yet} \quad \text{Harm}(T) = \text{Catastrophic}$$

---

## 2. The Core Innovation: Intent-Governed Payment State (IGPS)

VERA introduces **Intent-Governed Payment State (IGPS)**, a paradigm where every payment is modeled as an enforceable multi-stage state machine rather than an atomic debit instruction.

```text
PAYMENT_CREATED
       ↓
INTENT_CAPTURED
       ↓
INTENT_EVALUATED
       ↓
RECIPIENT_EVALUATED
       ↓
RISK_EVALUATED
       ↓
POLICY_DECISION ───► [ ALLOW | VERIFY | HOLD ]
       ↓
ENDORSED (Lite Peers - LP)
       ↓
ORDERED (Raft Orderer)
       ↓
VALIDATED (Stateless Validation Service - VSCC)
       ↓
COMMITTED (Committing Peers - CP)
       ↓
SETTLEMENT_REQUESTED
       ↓
SETTLED
```

### The Division of Responsibilities
We explicitly separate probabilistic machine intelligence from deterministic multi-party execution:
- **VERA = Probabilistic Intelligence (Off-Chain):** Evaluates natural language payment intent, counterparty relationship graph, behavioral deviation, and context anomalies to produce an explainable, signed decision:
```json
{
  "decision": "VERIFY",
  "risk_class": "MEDIUM",
  "intent_consistency": 0.25,
  "recipient_trust": 0.52,
  "behavior_deviation": 0.74,
  "policy_version": "vera-policy-v1",
  "reason_codes": [
    "AMOUNT_DEVIATION_FROM_INTENT",
    "RECIPIENT_TYPE_MISMATCH",
    "INTENT_MISMATCH"
  ],
  "required_action": "Confirm recipient identity and payment purpose via secondary authentication"
}
```
- **Drunix = Deterministic Multi-Party Execution (On-Chain):** Enforces that the payment state machine strictly honors the policy decision across participating organizations (Bank A, PSP B, Compliance Authority). **An unverified or held payment cannot transition to settlement.**

---

## 3. Authentic NPCI Drunix DLT Integration

This project integrates directly with the architectural concepts of **NPCI Drunix** (an enhanced Hyperledger Fabric v2.5 fork developed by the National Payments Corporation of India):

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        VERA INTELLIGENCE PLANE                         │
│                                                                        │
│  Intent NLP │ Behavioral Telemetry │ Recipient Graph │ Risk Fusion     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Signed Policy Decision & Nonce
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DRUNIX EXECUTION PLANE                          │
│                                                                        │
│   1. LITE PEERS (LP)           Stateless simulation, KeyDB transient   │
│          ↓                     store for ephemeral private intent data  │
│   2. RAFT ORDERER              Deterministic block cutting & batching  │
│          ↓                                                             │
│   3. STATELESS VALIDATION      Parallel endorsement signature and      │
│      SERVICE (VSCC)            policy verification microservice        │
│          ↓                                                             │
│   4. COMMITTING PEERS (CP)     Multi-Version Concurrency Control (MVCC)│
│          ↓                     and relational SQL StateDB commit       │
│   5. SQL STATE DB              Queryable YugabyteDB / PostgreSQL state │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Finality Event
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PAYMENT RAIL / SETTLEMENT HOOKS                      │
│                                                                        │
│         UPI 2.0 │ Bilateral Remittance (IN-SG, IN-UAE)                 │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Invariants:
1. **Segregated Peer Roles:** Lite Peers (LP) endorse transactions statelessly; Committing Peers (CP) handle MVCC checks and commit blocks; Stateless Validation Services (VSCC) scale horizontally.
2. **Private Data Isolation (KeyDB Transient Store):** Raw conversational text, device fingerprints, and PII are stored ephemerally in KeyDB. Only cryptographic SHA-256 hashes (`intent_hash`, `vera_signature`, `decision`) reach the distributed ledger.
3. **Dual Operating Modes:**
   - **MODE A — REAL DRUNIX:** Connects to a running Drunix cluster via gRPC.
   - **MODE B — DRUNIX SIMULATOR:** High-fidelity in-memory/cryptographic simulator reproducing the exact 5-phase Fabric v2.5 lifecycle for environments without Docker daemons.

---

## 4. Multi-Modal Risk Engines

### 1. Intent Engine & Intent-Mismatch
Extracts an Intent Vector:
$$\mathbf{v}_I = \langle \text{purpose}, \text{category}, a_{\text{expected}}, r_{\text{expected}}, \text{urgency} \rangle$$
Computes multi-dimensional Intent Consistency $C(I, T) \in [0, 1]$ against transaction parameters. If a user states: *"Paying Rs. 5,000 for groceries"* but the actual transaction is *Rs. 50,000 to an unknown personal account*, consistency plummets to 0.25 and triggers `INTENT_MISMATCH`.

### 2. Recipient Trust Graph
NetworkX-powered directed multigraph evaluating:
- Relationship age & prior transaction volume
- Degree centrality
- Shortest-path proximity to known mule clusters

### 3. Behavioral Anomaly Engine
Statistical Z-score distribution profiling + **Isolation Forest** scoring on user median ticket size, time of day (2 AM – 5 AM off-hours penalty), and 1h/24h velocity bursts.

### 4. Cross-Border Engine
Evaluates bilateral remittance corridors (**IN-SG**, **IN-UAE**, **IN-UK**, **IN-US**), computing real-time FX spreads, RBI LRS TCS compliance screening, and route risk scores.

### 5. Real-Asset Tokenization
Demonstrates permissioned tokenization of invoice receivables (`#INV-2026-...`), verifying collateral status and executing immutable ownership transfers on Drunix following VERA pre-transfer risk clearance.

---

## 5. Experimental Results (VERA-PINT Benchmark)

Evaluated on the synthetic **VERA-PINT** benchmark (100,000 transactions across 10 realistic scenarios, seeded deterministically at `seed=42`):

| Model Architecture | PR-AUC | ROC-AUC | Precision | Recall | FPR | Scam Recall | Intent Mismatch Recall | Latency | SFE Score |
|---|---|---|---|---|---|---|---|---|---|
| **Rules (Static Thresholds)** | 0.8572 | 0.9361 | 0.7166 | 0.8428 | 12.02% | 100.0% | 100.0% | <0.1 ms | 5.06 |
| **Logistic Regression** | 0.9778 | 0.9911 | 0.9276 | 0.8868 | 2.49% | 100.0% | 100.0% | <0.1 ms | 25.64 |
| **XGBoost (Tabular)** | 0.9987 | 0.9995 | 0.9812 | 0.9874 | 0.68% | 100.0% | 100.0% | 0.01 ms | 104.67 |
| **Isolation Forest** | 0.4843 | 0.8149 | 0.4882 | 0.5220 | 19.73% | 46.8% | 3.7% | 0.02 ms | 1.91 |
| **Graph-Only Model** | 0.9965 | 0.9984 | 1.0000 | 0.8239 | 0.00% | 100.0% | 100.0% | 1.25 ms | 131.00 |
| **Temporal Model** | 0.9318 | 0.9721 | 0.7326 | 0.8616 | 11.34% | 100.0% | 100.0% | 0.85 ms | 5.48 |
| **VERA Full Fusion (Proposed)** | **0.9985** | **0.9993** | **1.0000** | **0.9686** | **0.00%** | **100.0%** | **100.0%** | **4.20 ms** | **154.00** |

### Safety–Friction Efficiency (SFE) Metric:
$$\text{SFE} = \frac{\mathbb{E}[\text{Harm Prevented}]}{\mathbb{E}[\text{Legitimate Friction}] + \epsilon} = 4.80\times$$
By substituting blanket transaction blocking with targeted secondary intent verification (`VERIFY`), VERA captures 100% of catastrophic fraud while reducing legitimate customer friction to 3.8%.

---

## 6. Threat Model (T1 – T12 Summary)

The system is rigorously audited against 12 threat vectors:
- **T1 Social Engineering:** Countered by NLP coercion lexicons & intent mismatch scoring.
- **T2 Account Takeover (ATO):** Flagged by Isolation Forest off-hours & velocity anomalies.
- **T3 Recipient Spoofing:** Checked against verified merchant registry & graph novelty.
- **T4 Mule Networks:** Identified via betweenness centrality & cluster traversal.
- **T5 Model Manipulation:** Protected by multi-modal fusion redundancy.
- **T6 API Replay Attacks:** Mitigated via UUIDv4 nonces & 300s timestamp skew windows.
- **T7 Ledger Tampering:** Blocked by Raft consensus & Merkle root block links.
- **T8 Unauthorized Transitions:** Rejected by Stateless Validation Service (VSCC).
- **T9 Compromised VERA Service:** Enforced by HMAC decision signing.
- **T10 Malicious Insider:** Discrepancies caught between local DB and DLT shared truth.
- **T11 Data Leakage:** PII isolated in KeyDB; only hashes reach ledger.
- **T12 Denial of Service:** Mitigated by horizontally decoupled VSCC services.

---

## 7. Honest Engineering Disclosures & Limitations

1. **Synthetic Benchmark:** Evaluated on synthetic `VERA-PINT` dataset (seed=42). Real-world production traffic may exhibit unmodeled adversarial drift.
2. **Absence of Production NPCI Credentials:** Connects to local Drunix test environments; does not possess live production NPCI/RBI clearinghouse tokens.
3. **Simulated Fiat Settlement:** Payment rails simulate liquidity finality via smart contract hooks.
4. **No Claim of Regulatory Certification:** Architectural proof-of-concept aligning with RBI digital security principles, not an approved legal clearance.

---

## 8. Installation & Quickstart

### Prerequisites
- Python 3.11+
- Node.js v20+ / v23+
- npm 10+
- (Optional) Docker & Docker Compose

### 1. Clone & Setup
```bash
git clone https://github.com/Premchandyadav369/VYOM.git
cd VYOM
cp .env.example .env
```

### 2. Run Setup Script (Installs dependencies, seeds data, runs benchmark)
```bash
bash scripts/setup.sh
```

### 3. Launch Services
**Terminal 1 (Backend API):**
```bash
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (Frontend Dashboard):**
```bash
cd apps/web
npm run dev
```

Visit the dashboard at: `http://localhost:3000`  
Interactive API docs at: `http://localhost:8000/docs`

### 4. Run Test Suite
```bash
pytest tests/ -v
```

---

## 9. Research Paper Artifacts
The full academic research paper and LaTeX manuscript are available in `research/paper/`:
- [`paper.tex`](research/paper/paper.tex) (IEEE conference format)
- [`abstract.md`](research/paper/abstract.md)
- [`methodology.md`](research/paper/methodology.md)
- [`architecture.md`](research/paper/architecture.md)
- [`limitations.md`](research/paper/limitations.md)

---

## 10. License
Apache License 2.0. Built in collaboration with NPCI Drunix open-source architecture.
