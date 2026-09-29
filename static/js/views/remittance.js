/**
 * VYOM × DRUNIX Global Sovereign Remittance Console
 * Supports 195 Sovereign Jurisdictions (ISO 3166-1) with Bidirectional Atomic Settlement.
 * Enforces RBI LRS ($250k cap & 20% TCS threshold) for Outward Remittances,
 * and Project Nexus / Instant FIRC issuance for Inward Remittances.
 */

import { fetchRemittanceCountries, evaluateRemittance, executeRemittance, fetchRemittanceHistory } from '../api/simulation.js';

export async function renderRemittance(container) {
  container.innerHTML = `
    <div style="display:flex; justify-content:center; align-items:center; min-height:300px; color:var(--text-secondary); font-family:var(--font-mono); font-size:12px;">
      <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
        <iconify-icon icon="line-md:loading-loop" width="28" style="color:var(--accent-red);"></iconify-icon>
        <span>INITIALIZING 195 SOVEREIGN CORRIDORS OVER PROJECT NEXUS...</span>
      </div>
    </div>
  `;

  let countries = [];
  let history = [];
  try {
    const [cRes, hRes] = await Promise.all([
      fetchRemittanceCountries(),
      fetchRemittanceHistory()
    ]);
    countries = Array.isArray(cRes) ? cRes : [];
    history = Array.isArray(hRes) ? hRes : [];
  } catch (err) {
    console.error('Failed to load remittance data:', err);
  }

  // Fallback if network issue
  if (countries.length === 0) {
    countries = [
      { code: 'SG', name: 'Singapore', currency: 'SGD', flag: '🇸🇬', base_fx_rate: 0.0162, fx_spread_pct: 0.85, flat_fee_inr: 75, avg_settlement_mins: 2, rail: 'UPI-PayNow Linkage (MAS)', sanctioned: false },
      { code: 'US', name: 'United States', currency: 'USD', flag: '🇺🇸', base_fx_rate: 0.0120, fx_spread_pct: 1.10, flat_fee_inr: 250, avg_settlement_mins: 5, rail: 'FedNow / Nexus Pilot', sanctioned: false },
      { code: 'AE', name: 'United Arab Emirates', currency: 'AED', flag: '🇦🇪', base_fx_rate: 0.0441, fx_spread_pct: 0.95, flat_fee_inr: 100, avg_settlement_mins: 3, rail: 'IPP-AANI / Jaywan (CBUAE)', sanctioned: false },
      { code: 'GB', name: 'United Kingdom', currency: 'GBP', flag: '🇬🇧', base_fx_rate: 0.0094, fx_spread_pct: 1.20, flat_fee_inr: 200, avg_settlement_mins: 8, rail: 'Faster Payments / Nexus', sanctioned: false }
    ];
  }

  // Active state
  let currentDirection = 'OUTWARD'; // 'OUTWARD' (IN -> World) or 'INWARD' (World -> IN)
  let selectedCountryCode = 'SG';
  let sendAmount = 250000; // default in INR or foreign units
  let senderId = 'citi_treasury_in';
  let recipientId = 'dbs_corp_sg_910';
  let purpose = 'Trade Services & Software Export';
  let evalState = null;
  let lastExecutedTx = null;
  let searchTerm = '';

  function getSelectedCountry() {
    return countries.find(c => c.code === selectedCountryCode) || countries[0];
  }

  async function runEvaluation() {
    const country = getSelectedCountry();
    try {
      const payload = {
        amount_inr: sendAmount,
        destination_country: currentDirection === 'OUTWARD' ? country.code : 'IN',
        origin_country: currentDirection === 'OUTWARD' ? 'IN' : country.code,
        direction: currentDirection
      };
      evalState = await evaluateRemittance(payload);
    } catch (e) {
      console.warn('Evaluation failed:', e);
    }
  }

  // Initial evaluation
  await runEvaluation();

  function renderView() {
    const country = getSelectedCountry();
    const isOutward = currentDirection === 'OUTWARD';
    const filteredCountries = countries.filter(c => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term) || c.currency.toLowerCase().includes(term);
    });

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:20px; max-width:1440px; margin:0 auto; padding-bottom:40px;">
        
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom:1px solid var(--border); padding-bottom:14px; flex-wrap:wrap; gap:12px;">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
              <span class="badge" style="background:rgba(239,35,60,0.15); border:1px solid rgba(239,35,60,0.3); color:var(--accent-red); font-family:var(--font-mono); font-size:10px; font-weight:700; letter-spacing:0.08em;">
                PROJECT NEXUS × NPCI DRUNIX DLT
              </span>
              <span class="badge badge-allow" style="font-size:10px;">
                <iconify-icon icon="solar:check-circle-bold" inline></iconify-icon> 195 SOVEREIGN NATIONS CONNECTED
              </span>
            </div>
            <h1 class="text-h1 mono" style="font-size:24px; font-weight:800; letter-spacing:-0.03em; color:#fff;">
              Global Sovereign Remittance Corridor
            </h1>
            <p style="color:var(--text-secondary); font-size:13px; margin:4px 0 0 0;">
              Atomic Delivery-versus-Payment (PvP) cross-border settlements with automated RBI LRS/TCS compliance and sub-second ISO 20022 clearing.
            </p>
          </div>

          <!-- Quick Stats Banner -->
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <div style="background:var(--surface); border:1px solid var(--border); padding:8px 14px; border-radius:var(--radius-sm); font-family:var(--font-mono); text-align:right;">
              <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Coverage</div>
              <div style="font-size:15px; font-weight:700; color:#fff;">195 ISO-3166-1</div>
            </div>
            <div style="background:var(--surface); border:1px solid var(--border); padding:8px 14px; border-radius:var(--radius-sm); font-family:var(--font-mono); text-align:right;">
              <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Clearing Rail</div>
              <div style="font-size:15px; font-weight:700; color:var(--accent-red);">Project Nexus PvP</div>
            </div>
            <div style="background:var(--surface); border:1px solid var(--border); padding:8px 14px; border-radius:var(--radius-sm); font-family:var(--font-mono); text-align:right;">
              <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase;">Avg Settlement</div>
              <div style="font-size:15px; font-weight:700; color:var(--green);">< 2.4s Atomic</div>
            </div>
          </div>
        </div>

        <!-- Direction Switcher Tabs -->
        <div style="display:flex; gap:12px; border-bottom:1px solid var(--border); padding-bottom:12px;">
          <button id="btn-dir-outward" class="btn ${isOutward ? 'btn-primary' : 'btn-secondary'}" style="flex:1; justify-content:center; padding:12px; font-size:13px; font-family:var(--font-mono); font-weight:700; gap:8px; border-radius:var(--radius-sm);">
            <iconify-icon icon="solar:arrow-up-right-bold" width="18"></iconify-icon>
            OUTWARD REMITTANCE: INDIA (INR) ➔ WORLD (190+ NATIONS)
            <span style="font-size:10px; opacity:0.8; font-weight:400; margin-left:6px;">[RBI LRS & 20% TCS Rule]</span>
          </button>
          <button id="btn-dir-inward" class="btn ${!isOutward ? 'btn-primary' : 'btn-secondary'}" style="flex:1; justify-content:center; padding:12px; font-size:13px; font-family:var(--font-mono); font-weight:700; gap:8px; border-radius:var(--radius-sm);">
            <iconify-icon icon="solar:arrow-down-left-bold" width="18"></iconify-icon>
            INWARD REMITTANCE: WORLD (190+ NATIONS) ➔ INDIA (INR)
            <span style="font-size:10px; opacity:0.8; font-weight:400; margin-left:6px;">[0% TCS + Instant FIRC]</span>
          </button>
        </div>

        <!-- Main Workspace Grid -->
        <div style="display:grid; grid-template-columns: 1.15fr 0.85fr; gap:20px; align-items:start;">
          
          <!-- LEFT: Interactive Corridor Configuration -->
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:20px; display:flex; flex-direction:column; gap:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px;">
              <div style="font-family:var(--font-mono); font-size:12px; font-weight:700; color:var(--accent-red); display:flex; align-items:center; gap:6px;">
                <iconify-icon icon="solar:globus-bold" width="16"></iconify-icon>
                ${isOutward ? 'OUTWARD BILATERAL ROUTE CONFIGURATION' : 'INWARD CROSS-BORDER RECEPTACLE'}
              </div>
              <span class="badge" style="font-size:10px; background:rgba(255,255,255,0.05); color:var(--text-secondary);">
                Active: ${isOutward ? `INR ➔ ${country.currency}` : `${country.currency} ➔ INR`}
              </span>
            </div>

            <!-- Country Search & Selection -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label class="text-meta" style="font-size:11px; font-weight:600; color:var(--text-secondary);">
                  ${isOutward ? 'Select Destination Nation (195 Sovereign States)' : 'Select Remitting Origin Nation (195 Sovereign States)'}
                </label>
                <span style="font-family:var(--font-mono); font-size:10px; color:var(--text-muted);">${filteredCountries.length} countries matching</span>
              </div>
              
              <div style="display:flex; gap:8px; margin-bottom:8px;">
                <div style="position:relative; flex:1;">
                  <input type="text" id="remit-search-country" class="input" placeholder="Type country name, currency or ISO code..." value="${searchTerm}" style="padding-left:32px; font-size:12px;" />
                  <iconify-icon icon="solar:magnifer-linear" width="16" style="position:absolute; left:10px; top:10px; color:var(--text-muted);"></iconify-icon>
                </div>
              </div>

              <!-- Country Select Dropdown -->
              <select id="remit-country-select" class="input" style="font-family:var(--font-mono); font-size:12px; padding:9px 12px; background:#12141a; color:#fff; border-color:var(--border);">
                ${filteredCountries.map(c => `
                  <option value="${c.code}" ${c.code === selectedCountryCode ? 'selected' : ''}>
                    ${c.flag || '🌐'} ${c.name} (${c.currency}) — Rail: ${c.rail} ${c.sanctioned ? '⚠️ [SANCTIONED]' : ''}
                  </option>
                `).join('')}
              </select>

              <!-- Quick Popular Country Chips -->
              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                ${['SG', 'US', 'AE', 'GB', 'DE', 'AU', 'JP', 'CA', 'CH', 'SA'].map(code => {
                  const cItem = countries.find(x => x.code === code);
                  if (!cItem) return '';
                  const isActive = code === selectedCountryCode;
                  return `
                    <button class="country-chip btn btn-secondary" data-code="${code}" style="padding:4px 8px; font-size:11px; font-family:var(--font-mono); border-color:${isActive ? 'var(--accent-red)' : 'var(--border)'}; background:${isActive ? 'rgba(239,35,60,0.15)' : 'var(--surface)'}; color:${isActive ? '#fff' : 'var(--text-secondary)'};">
                      ${cItem.flag} ${cItem.code}
                    </button>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- Amount Input & Presets -->
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <label class="text-meta" style="font-size:11px; font-weight:600; color:var(--text-secondary);">
                  ${isOutward ? 'Send Amount (INR - Indian Rupees)' : `Send Amount (${country.currency} - ${country.name})`}
                </label>
                ${isOutward ? `
                  <span style="font-family:var(--font-mono); font-size:10px; color:${sendAmount > 700000 ? 'var(--yellow)' : 'var(--green)'};">
                    ${sendAmount > 700000 ? '⚠️ Exceeds ₹7L (20% TCS applies on excess)' : '✓ Sub-₹7L (0% TCS Exempt)'}
                  </span>
                ` : `
                  <span style="font-family:var(--font-mono); font-size:10px; color:var(--green);">
                    ✓ Foreign Inward Remittance (0% TCS + Instant FIRC)
                  </span>
                `}
              </div>

              <div style="position:relative;">
                <input type="number" id="remit-amount-input" class="input mono" value="${sendAmount}" style="font-size:18px; font-weight:700; padding:10px 14px; color:#fff;" />
                <span style="position:absolute; right:14px; top:12px; font-family:var(--font-mono); font-size:13px; font-weight:700; color:var(--accent-red);">
                  ${isOutward ? 'INR' : country.currency}
                </span>
              </div>

              <!-- Quick Amount Preset Chips -->
              <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                ${isOutward ? [
                  { label: '₹50,000', val: 50000 },
                  { label: '₹2,50,000', val: 250000 },
                  { label: '₹7,00,000 (TCS Cap)', val: 700000 },
                  { label: '₹12,00,000 (High-Vol)', val: 1200000 }
                ] : [
                  { label: `1,000 ${country.currency}`, val: 1000 },
                  { label: `5,000 ${country.currency}`, val: 5000 },
                  { label: `10,000 ${country.currency}`, val: 10000 },
                  { label: `50,000 ${country.currency}`, val: 50000 }
                ]}.map(p => `
                  <button class="amount-preset-chip btn btn-secondary" data-val="${p.val}" style="padding:4px 9px; font-size:10px; font-family:var(--font-mono);">
                    ${p.label}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Sender & Recipient IDs -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
              <div>
                <label class="text-meta" style="font-size:11px; margin-bottom:4px; display:block;">Sender Identity (MSP / VPA)</label>
                <input type="text" id="remit-sender-id" class="input mono" value="${senderId}" style="font-size:12px;" />
              </div>
              <div>
                <label class="text-meta" style="font-size:11px; margin-bottom:4px; display:block;">Recipient Identity (IBAN / Account)</label>
                <input type="text" id="remit-recipient-id" class="input mono" value="${recipientId}" style="font-size:12px;" />
              </div>
            </div>

            <!-- Purpose Dropdown -->
            <div>
              <label class="text-meta" style="font-size:11px; margin-bottom:4px; display:block;">Remittance Purpose (RBI FEMA Category)</label>
              <select id="remit-purpose-select" class="input" style="font-size:12px; font-family:var(--font-mono);">
                <option value="Trade Services & Software Export" ${purpose.includes('Trade') ? 'selected' : ''}>S0102 - Trade Invoicing & Software Export</option>
                <option value="Family Maintenance & Living Expenses">S0014 - Family Maintenance & Dependent Remittance</option>
                <option value="Higher Education & Tuition">S0305 - Higher Education & University Fees</option>
                <option value="Medical Treatment Abroad">S0401 - Overseas Medical Treatment</option>
                <option value="Direct Capital Investment (LRS)">S0001 - Overseas Portfolio Investment (LRS)</option>
              </select>
            </div>

            <!-- Primary Execution Button -->
            <div style="margin-top:6px;">
              <button id="btn-execute-remit" class="shiny-cta" style="width:100%; justify-content:center; padding:14px; font-size:13px; font-family:var(--font-mono); font-weight:800; text-transform:uppercase; letter-spacing:0.05em; border-radius:var(--radius-sm); gap:8px;">
                <iconify-icon icon="solar:flash-bold" width="18"></iconify-icon>
                DISPATCH ATOMIC REMITTANCE OVER DRUNIX DLT
              </button>
            </div>
          </div>

          <!-- RIGHT: Real-Time FX, Compliance & Execution Proof Terminal -->
          <div style="display:flex; flex-direction:column; gap:16px;">
            
            <!-- FX & Rate Engine Card -->
            <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:20px; font-family:var(--font-mono);">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:14px;">
                <div style="font-size:11px; font-weight:700; color:var(--text-secondary); text-transform:uppercase; display:flex; align-items:center; gap:6px;">
                  <iconify-icon icon="solar:calculator-minimalistic-bold" width="16" style="color:var(--accent-red);"></iconify-icon>
                  LIVE FX & LIQUIDITY MATRIX
                </div>
                <span class="badge ${evalState?.compliance_status?.includes('BLOCKED') ? 'badge-block' : 'badge-allow'}" style="font-size:10px;">
                  ${evalState?.compliance_status?.includes('BLOCKED') ? 'CORRIDOR BLOCKED' : 'RATE LOCKED (PVP)'}
                </span>
              </div>

              <!-- Main Amount Display -->
              <div style="background:rgba(0,0,0,0.4); border:1px solid var(--border); border-radius:var(--radius-sm); padding:16px; margin-bottom:16px; text-align:center;">
                <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">
                  ${isOutward ? `Beneficiary Receives in ${country.name}` : 'Beneficiary Receives in India'}
                </div>
                <div style="font-size:26px; font-weight:800; color:var(--green); letter-spacing:-0.02em;">
                  ${isOutward 
                    ? `${country.currency} ${Number(evalState?.dest_amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                    : `₹ ${Number(evalState?.dest_amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                  }
                </div>
                <div style="font-size:11px; color:var(--text-secondary); margin-top:4px;">
                  Effective Net Rate: 1 ${evalState?.source_currency} = ${evalState?.fx_rate} ${evalState?.dest_currency} (Spread: ${evalState?.fx_spread_pct}%)
                </div>
              </div>

              <!-- Key Metrics Breakdown -->
              <div style="display:flex; flex-direction:column; gap:8px; font-size:11px;">
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">SETTLEMENT CORRIDOR</span>
                  <span class="drawer-val" style="color:#fff;">${evalState?.corridor || `${isOutward ? 'IN' : country.code}-${isOutward ? country.code : 'IN'}`}</span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">SETTLEMENT RAIL</span>
                  <span class="drawer-val" style="color:var(--accent-red); font-weight:600;">${evalState?.settlement_rail || country.rail}</span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">NETWORK CLEARING FEE</span>
                  <span class="drawer-val" style="color:#fff;">₹${evalState?.fee_inr || country.flat_fee_inr}</span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">RBI LRS / TCS APPLIED</span>
                  <span class="drawer-val" style="color:${(evalState?.tcs_inr || 0) > 0 ? 'var(--yellow)' : 'var(--green)'}; font-weight:700;">
                    ${(evalState?.tcs_inr || 0) > 0 ? `₹${Number(evalState.tcs_inr).toLocaleString('en-IN')} (20% Surcharge)` : '₹0.00 (Exempt)'}
                  </span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">FOREIGN INWARD CERT (FIRC)</span>
                  <span class="drawer-val" style="color:var(--text-secondary); font-size:10px;">
                    ${evalState?.firc_number ? `<span style="color:var(--green); font-weight:700;">${evalState.firc_number}</span>` : 'N/A (Outward Flow)'}
                  </span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">CORRIDOR ROUTE RISK</span>
                  <span class="drawer-val" style="color:var(--green); font-weight:700;">
                    ${evalState?.route_risk_score || '0.08'} (Safe / Clear)
                  </span>
                </div>
                <div class="drawer-keyvalue-row">
                  <span class="drawer-key">SETTLEMENT LATENCY</span>
                  <span class="drawer-val" style="color:var(--green);">
                    ~${evalState?.estimated_settlement_mins || 2} Mins (Atomic Finality)
                  </span>
                </div>
              </div>
            </div>

            <!-- Execution Proof or Security Status -->
            ${lastExecutedTx ? `
              <div style="background:rgba(239,35,60,0.06); border:1px solid rgba(239,35,60,0.3); border-radius:var(--radius-sm); padding:16px; font-family:var(--font-mono);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                  <span style="font-size:11px; font-weight:700; color:var(--accent-red); display:flex; align-items:center; gap:6px;">
                    <iconify-icon icon="solar:verified-check-bold" width="16"></iconify-icon>
                    DRUNIX DLT SETTLEMENT RECEIPT
                  </span>
                  <span class="badge badge-allow" style="font-size:10px;">COMMITTED</span>
                </div>

                <div style="display:flex; flex-direction:column; gap:6px; font-size:11px;">
                  <div class="drawer-keyvalue-row">
                    <span class="drawer-key">REMITTANCE ID</span>
                    <span class="drawer-val" style="color:#fff; font-weight:700;">${lastExecutedTx.remittance_id}</span>
                  </div>
                  <div class="drawer-keyvalue-row">
                    <span class="drawer-key">DRUNIX TX ID</span>
                    <span class="drawer-val" style="color:var(--accent-red); font-size:10px;">${lastExecutedTx.drunix_settlement?.tx_id}</span>
                  </div>
                  <div class="drawer-keyvalue-row">
                    <span class="drawer-key">BLOCK NUMBER</span>
                    <span class="drawer-val" style="color:#fff;">#${lastExecutedTx.drunix_settlement?.block_number}</span>
                  </div>
                  <div class="drawer-keyvalue-row">
                    <span class="drawer-key">MERKLE ROOT</span>
                    <span class="drawer-val" style="color:var(--text-muted); font-size:9px;">${(lastExecutedTx.drunix_settlement?.merkle_root || '').slice(0, 24)}...</span>
                  </div>
                  ${lastExecutedTx.compliance?.firc_certificate ? `
                    <div class="drawer-keyvalue-row">
                      <span class="drawer-key">FIRC CERTIFICATE</span>
                      <span class="drawer-val" style="color:var(--green); font-weight:700;">${lastExecutedTx.compliance.firc_certificate}</span>
                    </div>
                  ` : ''}
                </div>

                <!-- ISO 20022 Toggle Snippet -->
                <div style="margin-top:12px; border-top:1px solid var(--border); padding-top:10px;">
                  <div style="font-size:10px; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px; display:flex; justify-content:space-between;">
                    <span>ISO 20022 pacs.008.001.10 Wire</span>
                    <span style="color:var(--green);">Validated</span>
                  </div>
                  <pre style="background:#0a0b0e; border:1px solid var(--border); padding:8px; border-radius:3px; font-size:9px; color:var(--text-secondary); max-height:100px; overflow-y:auto; margin:0;">${lastExecutedTx.iso20022_wire_pacs008 ? escapeHtml(lastExecutedTx.iso20022_wire_pacs008) : 'ISO 20022 payload generated'}</pre>
                </div>
              </div>
            ` : `
              <div style="background:var(--surface); border:1px dashed var(--border); border-radius:var(--radius-sm); padding:20px; text-align:center; font-family:var(--font-mono); color:var(--text-muted); font-size:11px;">
                <iconify-icon icon="solar:shield-check-linear" width="32" style="color:var(--text-secondary); margin-bottom:6px;"></iconify-icon>
                <div>READY TO COMMIT ATOMIC SETTLEMENT</div>
                <div style="font-size:10px; margin-top:2px; color:var(--text-muted);">Transactions commit immediately to NPCI Drunix DLT with Merkle inclusion proof.</div>
              </div>
            `}
          </div>
        </div>

        <!-- Global Sovereign Settlement Audit Stream Table -->
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-sm); padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div>
              <div class="uppercase-label">GLOBAL CLEARING AUDIT TRAIL</div>
              <h2 class="text-h2 mono" style="font-size:16px; margin:2px 0 0 0; color:#fff;">
                Cross-Border Remittance Execution Stream
              </h2>
            </div>
            <span class="badge" style="font-family:var(--font-mono); font-size:10px; background:rgba(255,255,255,0.05); color:var(--text-secondary);">
              Showing Latest Sovereign Dispatches
            </span>
          </div>

          <div style="overflow-x:auto;">
            <table class="table mono" style="font-size:11px; width:100%;">
              <thead>
                <tr>
                  <th>REMITTANCE ID</th>
                  <th>CORRIDOR</th>
                  <th>DIRECTION</th>
                  <th>SOURCE VALUE</th>
                  <th>DESTINATION VALUE</th>
                  <th>FX RATE</th>
                  <th>COMPLIANCE STATUS</th>
                  <th>DRUNIX TX ID</th>
                  <th>STATE</th>
                </tr>
              </thead>
              <tbody>
                ${history.length > 0 ? history.map(item => `
                  <tr>
                    <td style="font-weight:700; color:#fff;">${item.remittance_id}</td>
                    <td>
                      <span style="font-weight:600; color:var(--accent-red);">${item.corridor}</span>
                    </td>
                    <td>
                      <span class="badge" style="font-size:9px; background:rgba(255,255,255,0.06);">
                        ${item.sender_country === 'IN' ? 'OUTWARD' : 'INWARD'}
                      </span>
                    </td>
                    <td style="color:#fff;">${item.source_amount} ${item.source_currency}</td>
                    <td style="color:var(--green); font-weight:700;">${item.dest_amount} ${item.dest_currency}</td>
                    <td>${item.fx_rate}</td>
                    <td>
                      <span class="badge ${item.compliance_status?.includes('BLOCKED') ? 'badge-block' : 'badge-allow'}" style="font-size:9px;">
                        ${item.compliance_status}
                      </span>
                    </td>
                    <td style="color:var(--text-muted); font-size:10px;">
                      ${item.drunix_tx_id ? item.drunix_tx_id.slice(0, 16) + '...' : 'PENDING'}
                    </td>
                    <td>
                      <span class="badge badge-allow" style="font-size:9px;">${item.settlement_state || 'SETTLED'}</span>
                    </td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="9" style="text-align:center; color:var(--text-muted); padding:20px;">
                      No historical remittances recorded yet. Dispatch a cross-border settlement above.
                    </td>
                  </tr>
                `}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Attach Event Listeners
    setupEvents();
  }

  function setupEvents() {
    // Direction Toggles
    document.getElementById('btn-dir-outward')?.addEventListener('click', async () => {
      currentDirection = 'OUTWARD';
      senderId = 'citi_treasury_in';
      recipientId = 'dbs_corp_sg_910';
      sendAmount = 250000;
      await runEvaluation();
      renderView();
    });

    document.getElementById('btn-dir-inward')?.addEventListener('click', async () => {
      currentDirection = 'INWARD';
      senderId = 'us_multinational_corp';
      recipientId = 'in_msme_vendor_3819';
      sendAmount = 5000;
      await runEvaluation();
      renderView();
    });

    // Country Search Filter
    document.getElementById('remit-search-country')?.addEventListener('input', (e) => {
      searchTerm = e.target.value;
      const select = document.getElementById('remit-country-select');
      if (select) {
        const filtered = countries.filter(c => {
          if (!searchTerm) return true;
          const term = searchTerm.toLowerCase();
          return c.name.toLowerCase().includes(term) || c.code.toLowerCase().includes(term) || c.currency.toLowerCase().includes(term);
        });
        select.innerHTML = filtered.map(c => `
          <option value="${c.code}" ${c.code === selectedCountryCode ? 'selected' : ''}>
            ${c.flag || '🌐'} ${c.name} (${c.currency}) — Rail: ${c.rail} ${c.sanctioned ? '⚠️ [SANCTIONED]' : ''}
          </option>
        `).join('');
      }
    });

    // Country Dropdown Change
    document.getElementById('remit-country-select')?.addEventListener('change', async (e) => {
      selectedCountryCode = e.target.value;
      await runEvaluation();
      renderView();
    });

    // Country Preset Chips
    document.querySelectorAll('.country-chip').forEach(btn => {
      btn.addEventListener('click', async () => {
        selectedCountryCode = btn.getAttribute('data-code');
        await runEvaluation();
        renderView();
      });
    });

    // Amount Change
    document.getElementById('remit-amount-input')?.addEventListener('input', async (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0) {
        sendAmount = val;
        await runEvaluation();
        renderView();
      }
    });

    // Amount Preset Chips
    document.querySelectorAll('.amount-preset-chip').forEach(btn => {
      btn.addEventListener('click', async () => {
        const val = parseFloat(btn.getAttribute('data-val'));
        if (!isNaN(val)) {
          sendAmount = val;
          await runEvaluation();
          renderView();
        }
      });
    });

    // Sender & Recipient & Purpose
    document.getElementById('remit-sender-id')?.addEventListener('change', (e) => {
      senderId = e.target.value;
    });
    document.getElementById('remit-recipient-id')?.addEventListener('change', (e) => {
      recipientId = e.target.value;
    });
    document.getElementById('remit-purpose-select')?.addEventListener('change', (e) => {
      purpose = e.target.value;
    });

    // Execute Remittance Button
    document.getElementById('btn-execute-remit')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-execute-remit');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<iconify-icon icon="line-md:loading-loop" width="18" inline></iconify-icon> COMMITTING TO DRUNIX DLT...`;
      }

      try {
        const country = getSelectedCountry();
        const payload = {
          amount: sendAmount,
          origin_country: currentDirection === 'OUTWARD' ? 'IN' : country.code,
          destination_country: currentDirection === 'OUTWARD' ? country.code : 'IN',
          direction: currentDirection,
          sender_id: senderId,
          recipient_id: recipientId,
          purpose: purpose
        };

        const res = await executeRemittance(payload);
        lastExecutedTx = res;
        
        // Refresh history
        try {
          history = await fetchRemittanceHistory();
        } catch (_) {}

        renderView();
      } catch (err) {
        alert(`Remittance Blocked or Failed: ${err.message}`);
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<iconify-icon icon="solar:flash-bold" width="18"></iconify-icon> DISPATCH ATOMIC REMITTANCE OVER DRUNIX DLT`;
        }
      }
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  renderView();
}
