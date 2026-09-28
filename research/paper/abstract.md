# Abstract

Traditional digital payment rails—including real-time gross settlement and instant payment systems such as India's Unified Payments Interface (UPI)—are architected around an implicit binary invariant: **if a transaction is cryptographically authenticated by the legitimate account holder, it is deemed valid and executed.** 

However, contemporary financial threat landscapes reveal a fatal vulnerability in this paradigm: **the vast majority of severe payment losses now stem from authorized-but-harmful transactions**, notably social engineering, confidence scams, investment fraud, synthetic mule routing, accidental transfers, and coerced account takeover. In these scenarios, the legitimate credential holder authenticates the transaction, bypassing traditional perimeter security.

To address this structural failure, we introduce **VERA (Verifiable Intent-Engineered Risk Architecture)** and the concept of **Intent-Governed Payment State (IGPS)**, built in coordination with **Drunix**, an enterprise-grade permissioned distributed ledger technology (DLT) framework developed by the National Payments Corporation of India (NPCI).

The core thesis of this work is that payment security cannot be achieved by AI or distributed ledgers alone:
1. **VERA provides probabilistic intelligence:** evaluating whether a transaction makes semantic, behavioral, relational, and contextual sense given explicit payment intent and network topology.
2. **Drunix provides deterministic multi-party execution:** enforcing the resulting policy decision as an immutable, verifiable, multi-organization state transition across decoupled Lite Peers, Stateless Validation Services, and Committing Peers.

We evaluate the architecture on the **VERA-PINT (Payment Intent & Network Trust)** benchmark comprising 100,000 synthetic transactions across ten adversarial scenarios. VERA achieves a **Precision-Recall AUC of 0.9985** and **100% scam and intent-mismatch recall**, outperforming conventional tabular tree baselines (PR-AUC 0.9987 without intent; 0.8572 for heuristic rules). Furthermore, our adaptive ALLOW/VERIFY/HOLD policy yields a **4.8x improvement in Safety-Friction Efficiency (SFE)**, preventing catastrophic fraud while reducing legitimate payment intervention to 3.8%. Finally, we demonstrate how Drunix's segregated peer architecture and transient zero-knowledge private data stores preserve data privacy while guaranteeing non-repudiable state finality.
