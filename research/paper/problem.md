# Problem Formulation & Research Question

## 1. The Vulnerability of Authorized Payments
In traditional digital retail payments, authentication mechanisms verify whether the cryptographic credential holder authorized the request:
$$\text{Auth}(u, k) \to \{0, 1\}$$
where $u$ is the identity of the account holder and $k$ represents an authentication factor (e.g., MPIN, biometric fingerprint, SMS OTP). If $\text{Auth}(u, k) = 1$, the underlying rail immediately issues a debit instruction.

However, in modern social-engineering schemes:
- In **pig-butchering and Ponzi schemes**, victims willingly transfer life savings to fraudulent entities under emotional or financial deception.
- In **impersonation attacks**, fraudsters pose as law enforcement, tax officials, or bank executives, commanding urgent fund movement.
- In **accidental transfers**, users enter mistyped VPAs or phone numbers, routing funds to unintended strangers without an escrow recourse mechanism.

In all such cases:
$$\text{Auth}(u, k) = 1, \quad \text{yet} \quad \text{Harm}(T) = \text{Catastrophic}$$

## 2. Research Problem Statement
Can explicit payment-intent modeling combined with relationship-aware risk intelligence reduce authorized-but-harmful payments while minimizing unnecessary friction, and can a permissioned DLT enforce the resulting decision as a verifiable multi-party payment state transition?

## 3. Complementary Roles of AI and DLT
We explicitly reject the naive anti-pattern of placing machine learning models on a distributed ledger. Machine learning models are inherently non-deterministic, computationally expensive, and privacy-invasive. 

Conversely, centralized AI risk engines suffer from a trust bottleneck: a centralized bank server can unilaterally manipulate fraud flags, delay payments arbitrarily, or alter audit logs.

Therefore, our architecture establishes a strict separation of concerns:
- **VERA (Off-Chain AI):** Computes multi-modal intent and relationship risk.
- **Drunix (On-Chain DLT):** Enforces deterministic state transitions, multi-party consensus, and non-repudiable policy compliance across participating institutions.
