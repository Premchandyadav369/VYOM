# Methodology & Formal Formulation

## 1. Intent-Governed Payment State (IGPS)
We formulate digital payments as a finite state automaton governed by multi-modal risk intelligence and multi-party cryptographic endorsement:
$$\mathcal{M} = \langle \mathcal{S}, \Sigma, \delta, s_0, \mathcal{F} \rangle$$
where the state space $\mathcal{S}$ includes:
$$\mathcal{S} = \{ \text{CREATED}, \text{INTENT\_CAPTURED}, \text{EVALUATING}, \text{VERIFY\_REQUIRED}, \text{ALLOWED}, \text{HOLD}, \text{RELEASED}, \text{COMMITTED}, \text{SETTLED}, \text{REJECTED} \}$$

## 2. Intent Modeling & Semantic Consistency
Given a transaction $T = \langle u, r, a, t, c \rangle$ where $u$ is sender, $r$ is recipient, $a$ is amount, $t$ is timestamp, and $c$ is channel, the user provides natural language intent $I$.

The Intent Engine extracts an Intent Vector $\mathbf{v}_I$:
$$\mathbf{v}_I = \langle \text{purpose}, \text{category}, a_{\text{expected}}, r_{\text{expected}}, \text{urgency} \rangle$$

The Intent Consistency function $C(I, T) \in [0, 1]$ is computed as:
$$C(I, T) = \left( w_a \cdot S_{\text{amount}}(a, a_{\text{expected}}) + w_c \cdot S_{\text{category}}(c_{\text{actual}}, c_{\text{inferred}}) + w_r \cdot S_{\text{recipient}}(r, r_{\text{expected}}) \right) \times (1 - \alpha \cdot U_{\text{urgency}})$$

## 3. Recipient Trust Graph
The payment ecosystem is represented as a directed multigraph $G = (V, E)$ where nodes $V$ represent users, merchants, and accounts, and edges $E$ denote historical fund transfers with attributes $\langle \text{count}, \text{volume}, \text{tenure} \rangle$.

Counterparty Trust $\tau(u, r) \in [0, 1]$ and Network Risk $\eta(r) \in [0, 1]$ are formulated as:
$$\tau(u, r) = \beta_0 + \beta_1 \log(1 + N_{u \to r}) + \beta_2 \frac{t_{\text{rel}}}{365} - \gamma \cdot \text{MuleClusterProximity}(r)$$
$$\eta(r) = \max_{m \in \mathcal{M}_{\text{mule}}} \frac{1}{\text{dist}(r, m)}$$

## 4. Multi-Modal Risk Fusion
The Unified Risk Score $\mathcal{R}(T)$ is computed via an interpretable linear projection:
$$\mathcal{R}(T) = w_1 (1 - C(I, T)) + w_2 \mathcal{D}_{\text{behavior}}(T) + w_3 (1 - \tau(u, r)) + w_4 \eta(r) + w_5 \mathcal{C}_{\text{context}}(T)$$
subject to $\sum w_i = 1$. Non-linear synergy amplification is applied when both intent mismatch and mule proximity exceed critical thresholds.

## 5. Safety-Friction Efficiency (SFE)
Rather than optimizing raw classification accuracy, we evaluate the system along the Pareto frontier of Safety vs User Friction:
$$\text{SFE} = \frac{\mathbb{E}[\text{Harm Prevented}]}{\mathbb{E}[\text{Legitimate Friction}] + \epsilon} = \frac{\sum_{T \in \text{Malicious}} \mathbb{I}(\text{Decision}(T) \in \{\text{VERIFY}, \text{HOLD}\}) \cdot \text{Value}(T)}{\sum_{T \in \text{Legitimate}} \mathbb{I}(\text{Decision}(T) \in \{\text{VERIFY}, \text{HOLD}\}) \cdot \text{Cost}_{\text{friction}}}$$
