/**
 * Risk Analysis View
 * Matching Section 18 specification.
 */

import { state } from '../state.js';

export function renderRisk(container) {
  const p = state.selectedPayment || (state.payments && state.payments.length > 0 ? state.payments[0] : null);

  const intentVal = p ? (1 - (p.intent_consistency || 0.85)).toFixed(2) : '0.64';
  const behaviorVal = p && p.behavior_deviation != null ? p.behavior_deviation.toFixed(2) : '0.82';
  const recipientVal = p && p.recipient_trust != null ? (1 - p.recipient_trust).toFixed(2) : '0.48';
  const contextVal = p && p.context_risk != null ? p.context_risk.toFixed(2) : '0.22';
  const networkVal = p && p.network_risk != null ? p.network_risk.toFixed(2) : '0.71';

  const decision = p ? p.decision : 'VERIFY';
  const reasons = p && p.reason_codes && p.reason_codes.length > 0
    ? p.reason_codes.join(' + ')
    : 'New recipient + unusual amount + intent mismatch';

  container.innerHTML = `
    <div style="max-width: 800px; display:flex; flex-direction:column; gap:20px;">
      <div style="border-bottom:1px solid var(--border); padding-bottom:10px;">
        <div class="uppercase-label">RISK DECOMPOSITION</div>
        <h1 class="text-h1 mono" style="margin-top:2px;">
          ${p ? `Evaluation for ${p.payment_id}` : 'Risk Model Decomposition'}
        </h1>
      </div>

      <!-- Risk Components Panel -->
      <div style="border: 1px solid var(--border); background-color: var(--surface); border-radius: var(--radius-sm); padding: 16px;">
        <div class="uppercase-label" style="margin-bottom:14px;">RISK COMPONENT BREAKDOWN</div>

        <div style="display:flex; flex-direction:column; gap:10px; font-family:var(--font-mono); font-size:11px;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="width:180px; color:var(--text-secondary);">Intent mismatch</span>
            <div style="flex:1; height:6px; background:var(--surface-3); border-radius:1px; overflow:hidden; margin: 0 16px;">
              <div style="height:100%; width:${intentVal * 100}%; background:var(--blue);"></div>
            </div>
            <span class="tabular-nums" style="width:40px; text-align:right; color:var(--text); font-weight:600;">${intentVal}</span>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="width:180px; color:var(--text-secondary);">Behavior anomaly</span>
            <div style="flex:1; height:6px; background:var(--surface-3); border-radius:1px; overflow:hidden; margin: 0 16px;">
              <div style="height:100%; width:${behaviorVal * 100}%; background:var(--amber);"></div>
            </div>
            <span class="tabular-nums" style="width:40px; text-align:right; color:var(--text); font-weight:600;">${behaviorVal}</span>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="width:180px; color:var(--text-secondary);">Recipient risk</span>
            <div style="flex:1; height:6px; background:var(--surface-3); border-radius:1px; overflow:hidden; margin: 0 16px;">
              <div style="height:100%; width:${recipientVal * 100}%; background:var(--green);"></div>
            </div>
            <span class="tabular-nums" style="width:40px; text-align:right; color:var(--text); font-weight:600;">${recipientVal}</span>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="width:180px; color:var(--text-secondary);">Context risk</span>
            <div style="flex:1; height:6px; background:var(--surface-3); border-radius:1px; overflow:hidden; margin: 0 16px;">
              <div style="height:100%; width:${contextVal * 100}%; background:var(--text-dim);"></div>
            </div>
            <span class="tabular-nums" style="width:40px; text-align:right; color:var(--text); font-weight:600;">${contextVal}</span>
          </div>

          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="width:180px; color:var(--text-secondary);">Network risk</span>
            <div style="flex:1; height:6px; background:var(--surface-3); border-radius:1px; overflow:hidden; margin: 0 16px;">
              <div style="height:100%; width:${networkVal * 100}%; background:var(--red);"></div>
            </div>
            <span class="tabular-nums" style="width:40px; text-align:right; color:var(--text); font-weight:600;">${networkVal}</span>
          </div>
        </div>
      </div>

      <!-- Decision & Policy Panel -->
      <div style="border: 1px solid var(--border); background-color: var(--surface); border-radius: var(--radius-sm); padding: 16px; font-family:var(--font-mono); font-size:11px;">
        <div class="uppercase-label" style="margin-bottom:10px;">POLICY OUTCOME</div>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div>
            <span class="text-meta">DECISION:</span>
            <span class="badge ${decision === 'ALLOW' ? 'badge-allow' : (decision === 'VERIFY' ? 'badge-verify' : 'badge-hold')}" style="margin-left:8px;">
              ${decision}
            </span>
          </div>
          <div class="text-meta">Policy Version: P-2026-09</div>
        </div>

        <div style="background:var(--surface-2); border:1px solid var(--border); padding:10px; border-radius:var(--radius-sm); margin-bottom:10px;">
          <span class="text-meta" style="display:block; margin-bottom:4px;">REASON CODES</span>
          <span style="color:var(--text); font-weight:600;">${reasons}</span>
        </div>

        <div class="text-meta" style="color:var(--text-dim); line-height:1.5;">
          Formula: UnifiedRisk = 0.28×IntentMismatch + 0.22×BehaviorAnomaly + 0.20×RecipientRisk + 0.15×MuleRisk + 0.15×ContextRisk.
        </div>
      </div>
    </div>
  `;
}
