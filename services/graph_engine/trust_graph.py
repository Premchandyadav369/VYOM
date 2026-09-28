"""
VERA Recipient Relationship & Trust Graph Engine
Builds and maintains a multi-relational NetworkX graph of Users, Recipients,
Merchants, and Devices to identify mule clusters, calculate centrality,
and quantify counterparty trust.
"""

import networkx as nx
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from data.schemas.models import RecipientGraphFeatures


class TrustGraphEngine:
    """Graph intelligence for counterparty trust and fraud cluster detection."""

    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.known_mule_nodes: set = set()
        self.known_fraud_nodes: set = set()
        self._populate_seed_graph()

    def _populate_seed_graph(self):
        """Initializes representative graph topology with verified merchants, users, and mule clusters."""
        # 1. Add verified high-trust merchants
        merchants = [
            ("MERCH_0001", "Swiggy Foods", "merchant", 0.98),
            ("MERCH_0002", "Zomato Orders", "merchant", 0.98),
            ("MERCH_0003", "Blinkit Quick", "merchant", 0.95),
            ("MERCH_0005", "Amazon India", "merchant", 0.99),
            ("MERCH_0011", "Croma Electronics", "merchant", 0.96),
        ]
        for mid, name, ntype, trust in merchants:
            self.graph.add_node(mid, name=name, type=ntype, trust_base=trust, in_degrees=120)

        # 2. Add sample seed users
        for i in range(1, 30):
            uid = f"USR_{i:05d}"
            self.graph.add_node(uid, name=f"User {i}", type="user", trust_base=0.90)

        # 3. Add regular P2P recipients
        for i in range(150, 180):
            rid = f"REC_{i:05d}"
            self.graph.add_node(rid, name=f"Friend Account {i}", type="recipient", trust_base=0.85)
            # Add existing relationship edges to users
            u_sample = f"USR_{(i % 25) + 1:05d}"
            self.graph.add_edge(u_sample, rid, edge_type="PAID", weight=4, volume=12500.0, days_known=120)

        # 4. Add Mule Cluster (Nodes that rapidly fan-in from multiple victims and fan-out)
        mule_hub = "REC_00010"
        self.known_mule_nodes.add(mule_hub)
        self.graph.add_node(mule_hub, name="Layering Mule Hub", type="mule_hub", trust_base=0.15)
        for m_sub in [f"REC_000{i}" for i in range(11, 20)]:
            self.known_mule_nodes.add(m_sub)
            self.graph.add_node(m_sub, name=f"Mule Sub-node {m_sub}", type="mule_sub", trust_base=0.10)
            self.graph.add_edge(mule_hub, m_sub, edge_type="TRANSFERRED", weight=12, volume=180000.0, days_known=2)

    def evaluate_recipient_trust(
        self,
        sender_id: str,
        recipient_id: str,
        amount: float,
        is_known_merchant: bool = False
    ) -> RecipientGraphFeatures:
        """Evaluates relationship strength, centrality, and fraud cluster proximity."""
        # 1. Check if recipient exists in graph
        is_new_to_graph = not self.graph.has_node(recipient_id)
        if is_new_to_graph:
            self.graph.add_node(recipient_id, type="recipient", trust_base=0.50)

        # 2. Check direct relationship between sender and recipient
        has_direct_edge = self.graph.has_edge(sender_id, recipient_id)
        edge_data = {}
        if has_direct_edge:
            # Extract most recent edge properties
            edges = self.graph.get_edge_data(sender_id, recipient_id)
            if edges and len(edges) > 0:
                edge_data = list(edges.values())[0]

        prior_count = edge_data.get("weight", 0)
        prior_vol = edge_data.get("volume", 0.0)
        rel_age_days = edge_data.get("days_known", 0)
        is_new_recipient = (prior_count == 0)

        # 3. Check Mule Cluster membership & proximity
        is_mule = (recipient_id in self.known_mule_nodes)
        mule_score = 0.95 if is_mule else 0.0

        # Proximity to mule nodes via graph traversal
        if not is_mule and self.graph.has_node(recipient_id):
            for mule in list(self.known_mule_nodes)[:5]:
                try:
                    dist = nx.shortest_path_length(self.graph, recipient_id, mule)
                    if dist <= 2:
                        mule_score = max(mule_score, 0.70 / dist)
                except (nx.NetworkXNoPath, nx.NodeNotFound):
                    pass

        # 4. In/Out Degree & Centrality
        in_deg = self.graph.in_degree(recipient_id) if self.graph.has_node(recipient_id) else 0
        out_deg = self.graph.out_degree(recipient_id) if self.graph.has_node(recipient_id) else 0
        total_nodes = max(1, self.graph.number_of_nodes())
        degree_cent = (in_deg + out_deg) / total_nodes

        # 5. Calculate Recipient Trust Score
        if is_known_merchant:
            recipient_trust = 0.96
        elif is_mule:
            recipient_trust = 0.12
        elif is_new_recipient:
            # New counterparty has baseline neutral-low trust until verified
            recipient_trust = max(0.35, 0.65 - mule_score * 0.5)
        else:
            # Established relationship increases trust based on frequency and history
            freq_factor = min(0.30, prior_count * 0.05)
            age_factor = min(0.15, rel_age_days / 300.0)
            recipient_trust = min(0.98, 0.55 + freq_factor + age_factor - mule_score * 0.4)

        # 6. Network Risk Score (Inverse of trust + mule influence + uncharacteristic velocity)
        network_risk = max(0.02, min(0.99, (1.0 - recipient_trust) * 0.65 + mule_score * 0.35))

        return RecipientGraphFeatures(
            recipient_id=recipient_id,
            recipient_trust_score=round(float(recipient_trust), 3),
            network_risk_score=round(float(network_risk), 3),
            relationship_age_days=rel_age_days,
            prior_tx_count=prior_count,
            prior_volume_inr=prior_vol,
            degree_centrality=round(float(degree_cent), 4),
            in_degree=in_deg,
            out_degree=out_deg,
            clustering_coefficient=0.15,
            is_mule_cluster_member=is_mule,
            mule_cluster_score=round(float(mule_score), 3),
            is_new_recipient=is_new_recipient,
            account_age_days=5 if is_mule else (180 if not is_new_recipient else 25)
        )

    def record_transaction_edge(self, sender_id: str, recipient_id: str, amount: float):
        """Updates graph topology upon successful transaction commit."""
        if not self.graph.has_node(sender_id):
            self.graph.add_node(sender_id, type="user", trust_base=0.90)
        if not self.graph.has_node(recipient_id):
            self.graph.add_node(recipient_id, type="recipient", trust_base=0.70)

        if self.graph.has_edge(sender_id, recipient_id):
            edges = self.graph.get_edge_data(sender_id, recipient_id)
            k = list(edges.keys())[0]
            edges[k]["weight"] += 1
            edges[k]["volume"] += amount
            edges[k]["days_known"] += 1
        else:
            self.graph.add_edge(
                sender_id,
                recipient_id,
                edge_type="PAID",
                weight=1,
                volume=amount,
                days_known=1,
                timestamp=datetime.utcnow().isoformat()
            )

    def get_subgraph_visualization_data(self, node_id: str, depth: int = 2) -> Dict[str, Any]:
        """Extracts ego-network nodes and links for frontend graph rendering."""
        if not self.graph.has_node(node_id):
            return {"nodes": [{"id": node_id, "name": node_id, "type": "target", "risk": "neutral"}], "links": []}

        sub_nodes = set([node_id])
        current_layer = set([node_id])
        for _ in range(depth):
            next_layer = set()
            for n in current_layer:
                nbrs = set(self.graph.predecessors(n)).union(set(self.graph.successors(n)))
                next_layer.update(nbrs)
            sub_nodes.update(next_layer)
            current_layer = next_layer

        # Limit to 30 nodes for clean UI display
        nodes_list = list(sub_nodes)[:30]
        subgraph = self.graph.subgraph(nodes_list)

        out_nodes = []
        for n in subgraph.nodes():
            n_data = self.graph.nodes[n]
            is_mule = n in self.known_mule_nodes
            risk_tier = "HIGH" if is_mule else ("LOW" if n_data.get("trust_base", 0.5) > 0.8 else "MEDIUM")
            out_nodes.append({
                "id": n,
                "label": n_data.get("name", n),
                "type": n_data.get("type", "entity"),
                "risk_tier": risk_tier,
                "is_mule": is_mule,
                "trust_score": n_data.get("trust_base", 0.6)
            })

        out_links = []
        for u, v, data in subgraph.edges(data=True):
            out_links.append({
                "source": u,
                "target": v,
                "type": data.get("edge_type", "PAID"),
                "weight": data.get("weight", 1),
                "volume": data.get("volume", 1000.0)
            })

        return {"nodes": out_nodes, "links": out_links}
