# System Architecture & DLT Co-Design

## 1. Segregated Peer Roles in NPCI Drunix
Unlike monolithic public blockchains or vanilla Hyperledger Fabric where peers perform both endorsement and commit validations, **Drunix decouples peer responsibilities**:

```
                    ┌────────────────────────────┐
                    │     CLIENT APPLICATION     │
                    └─────────────┬──────────────┘
                                  │
                   1. Proposal    │   2. Signed Endorsement
                                  ▼
                    ┌────────────────────────────┐
                    │      LITE PEER (LP)        │
                    │   Stateless Simulation     │
                    │   Transient Store (KeyDB)  │
                    └─────────────┬──────────────┘
                                  │
                                  │ 3. Submit Transaction
                                  ▼
                    ┌────────────────────────────┐
                    │       RAFT ORDERER         │
                    │   Block Cutting & Batching │
                    └─────────────┬──────────────┘
                                  │
                                  │ 4. Block Distribution
                                  ▼
┌─────────────────────────────────┴────────────────────────────────┐
│                     COMMITTING PEER (CP)                         │
│                                                                  │
│  ┌─────────────────────────────┐    ┌──────────────────────────┐ │
│  │ STATELESS VALIDATION (VSCC) │    │      MVCC ENGINE         │ │
│  │ Endorsement policy check    │    │ Read/Write Conflict Det. │ │
│  └─────────────────────────────┘    └──────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────┐    ┌──────────────────────────┐ │
│  │     BLOCK LEDGER FILE       │    │     SQL STATE DB         │ │
│  │ Cryptographic Block Hashes  │    │ YugabyteDB / PostgreSQL  │ │
│  └─────────────────────────────┘    └──────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

1. **Lite Peer (LP):** Executes `vera-payment-state` chaincode simulation statelessly. Reads from SQL StateDB and stores ephemeral private intent details in a KeyDB transient cache. Generates signed endorsements without maintaining local ledger blocks.
2. **Stateless Validation Service (VSCC):** Decoupled microservice that validates endorsement signatures against organization policies in parallel.
3. **Committing Peer (CP):** Performs block sanity checks, coordinates with VSCC, verifies Multi-Version Concurrency Control (MVCC) invariants, and commits state updates directly into the relational SQL ledger database.

## 2. Private Data Preservation
The distributed ledger stores only:
- $h_{\text{intent}} = \mathcal{H}(I)$
- $\sigma_{\text{VERA}} = \text{Sign}_{k_V}(T_{\text{id}} \parallel D \parallel \mathcal{R} \parallel v_p)$
- Policy decision $D \in \{\text{ALLOW}, \text{VERIFY}, \text{HOLD}\}$
- Workflow status $\mathcal{S}$

No PII, raw voice recordings, conversational transcripts, or device fingerprints ever touch the distributed ledger state.
