"""
VERA Behavioral Anomaly Engine
Models user transaction behavior using statistical distributions, velocity metrics,
and Isolation Forest anomaly detection to compute BehaviorDeviationScore.
"""

import math
from typing import Dict, Any, List, Optional
import numpy as np
from sklearn.ensemble import IsolationForest
from data.schemas.models import BehavioralRiskFeatures


class BehavioralEngine:
    """Detects deviations from historical user behavior."""

    def __init__(self):
        # Pre-fit a reference Isolation Forest on representative normal banking telemetry
        self.iso_forest = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42
        )
        self._fit_reference_model()

    def _fit_reference_model(self):
        """Fits reference Isolation Forest on normalized behavioral features."""
        # Features: [amount_ratio_to_median, hour_sin, hour_cos, velocity_1h, day_of_week]
        np.random.seed(42)
        n_samples = 1500
        amount_ratios = np.random.lognormal(mean=0.0, sigma=0.4, size=n_samples)
        hours = np.random.choice(range(8, 22), size=n_samples)
        hour_sin = np.sin(2 * np.pi * hours / 24.0)
        hour_cos = np.cos(2 * np.pi * hours / 24.0)
        velocities = np.random.poisson(lam=1.5, size=n_samples)
        days = np.random.choice(range(7), size=n_samples)

        X = np.column_stack([amount_ratios, hour_sin, hour_cos, velocities, days])
        self.iso_forest.fit(X)

    def evaluate_behavior(
        self,
        user_id: str,
        amount: float,
        hour_of_day: int,
        day_of_week: int,
        user_median_amount: float = 1500.0,
        user_amount_std: float = 600.0,
        velocity_1h: int = 1,
        velocity_24h: int = 3
    ) -> BehavioralRiskFeatures:
        """Computes statistical and ML behavioral deviation features."""
        # 1. Statistical amount Z-score and ratio
        ratio = amount / max(1.0, user_median_amount)
        z_score = (amount - user_median_amount) / max(1.0, user_amount_std)
        is_amount_outlier = ratio > 4.0 or z_score > 3.5

        # 2. Time of day risk (Late night hours: 1 AM to 5 AM carry elevated anomaly risk)
        if 1 <= hour_of_day <= 5:
            time_of_day_risk = 0.85
        elif 22 <= hour_of_day or hour_of_day == 0:
            time_of_day_risk = 0.40
        else:
            time_of_day_risk = 0.05

        # 3. Velocity risk
        velocity_risk = min(1.0, (velocity_1h - 1) * 0.25 + (velocity_24h - 3) * 0.05)
        velocity_risk = max(0.0, velocity_risk)

        # 4. Isolation Forest inference
        hour_sin = np.sin(2 * np.pi * hour_of_day / 24.0)
        hour_cos = np.cos(2 * np.pi * hour_of_day / 24.0)
        x_sample = np.array([[ratio, hour_sin, hour_cos, velocity_1h, day_of_week]])
        
        # decision_function yields negative for anomalies, positive for normal
        raw_score = self.iso_forest.decision_function(x_sample)[0]
        # Normalize to [0.0, 1.0] where 1.0 is highest deviation
        iso_deviation = float(np.clip(0.5 - raw_score * 2.0, 0.0, 1.0))

        # 5. Composite Behavior Deviation Score
        amount_penalty = min(1.0, max(0.0, (ratio - 1.0) * 0.2)) if ratio > 1.0 else 0.05
        composite_deviation = (
            0.40 * amount_penalty +
            0.25 * iso_deviation +
            0.20 * time_of_day_risk +
            0.15 * velocity_risk
        )
        composite_deviation = round(float(np.clip(composite_deviation, 0.02, 0.99)), 3)

        return BehavioralRiskFeatures(
            behavior_deviation_score=composite_deviation,
            amount_z_score=round(z_score, 2),
            typical_amount_median=user_median_amount,
            time_of_day_risk=round(time_of_day_risk, 2),
            day_of_week_risk=0.05,
            velocity_1h_count=velocity_1h,
            velocity_24h_count=velocity_24h,
            is_amount_outlier=is_amount_outlier
        )
