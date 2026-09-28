import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
  Database,
  RefreshCw,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

const SAMPLE_DATASET = [
  {
    sender_id: "arun.verma@okhdfcbank",
    recipient_id: "delhi-airport-customs-hold@ybl",
    amount: 54000,
    category: "courier_customs_fine",
    stated_intent: "Urgent penalty payment demanded by customs inspector to release international courier parcel containing foreign currency",
    threat: "CRITICAL"
  },
  {
    sender_id: "sunita.sharma@sbi",
    recipient_id: "cbi-cyber-cell-deposit@icici",
    amount: 210000,
    category: "legal_security_deposit",
    stated_intent: "Immediate digital arrest security deposit to court escrow account under supervision of Mumbai police officer",
    threat: "CRITICAL"
  },
  {
    sender_id: "rohit.mehta@axisbank",
    recipient_id: "bses-urgent-bill-pay@paytm",
    amount: 9800,
    category: "utility_bill",
    stated_intent: "Payment for overdue electric meter bill to avoid technician disconnecting power supply at 8 PM",
    threat: "HIGH"
  },
  {
    sender_id: "deepak.gupta@okaxis",
    recipient_id: "blinkit-commerce@axisbank",
    amount: 760,
    category: "groceries",
    stated_intent: "Morning vegetables and milk purchase from Blinkit order #BL-89410",
    threat: "SAFE"
  },
  {
    sender_id: "kavita.patel@okhdfcbank",
    recipient_id: "landlord.suresh@icici",
    amount: 32000,
    category: "rent",
    stated_intent: "Monthly rent for 3BHK flat #501 for October 2026",
    threat: "SAFE"
  },
  {
    sender_id: "manish.tiwari@paytm",
    recipient_id: "telegram-vip-investment@ybl",
    amount: 45000,
    category: "crypto_arbitrage",
    stated_intent: "Guaranteed 400% profit task investment deposit on Telegram crypto group with daily payout",
    threat: "CRITICAL"
  },
  {
    sender_id: "ananya.sen@sbi",
    recipient_id: "swiggy-orders@icici",
    amount: 420,
    category: "food_delivery",
    stated_intent: "Lunch order delivery payment for Swiggy order #SW-3321",
    threat: "SAFE"
  },
  {
    sender_id: "rahul.deshmukh@okhdfcbank",
    recipient_id: "apollo-pharmacy@hdfcbank",
    amount: 1450,
    category: "healthcare",
    stated_intent: "Prescription blood pressure medication purchase at Apollo Pharmacy Koramangala",
    threat: "SAFE"
  },
  {
    sender_id: "vikram.singh@icici",
    recipient_id: "mule-escrow-hub-09@paytm",
    amount: 180000,
    category: "p2p_transfer",
    stated_intent: "Urgent loan clearance transfer requested by caller who threatened bank account freeze within 30 minutes",
    threat: "CRITICAL"
  },
  {
    sender_id: "sneha.kulkarni@sbi",
    recipient_id: "jio-telecom-prepaid@axisbank",
    amount: 399,
    category: "telecom",
    stated_intent: "Monthly 5G prepaid unlimited data recharge for mobile 9820011223",
    threat: "SAFE"
  }
];

export const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [dataRows, setDataRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [importing, setImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importSummary, setImportSummary] = useState<any>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvText: string) => {
    try {
      const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) return;

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
      const parsed: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(p => p.trim().replace(/['"]/g, ''));
        if (parts.length >= 3) {
          const row: any = {
            sender_id: parts[0] || "usr.imported@okhdfcbank",
            recipient_id: parts[1] || "unknown.merchant@ybl",
            amount: parseFloat(parts[2]) || 1000,
            category: parts[3] || "general_transfer",
            stated_intent: parts[4] || "Payment import from user bank statement"
          };
          parsed.push(row);
        }
      }
      setDataRows(parsed);
      setImportSummary(null);
    } catch (err) {
      console.error("CSV parse error:", err);
      alert("Failed to parse CSV file. Please verify format.");
    }
  };

  const loadSampleDataset = () => {
    setFileName("indian_upi_scam_and_legitimate_dataset.csv");
    setDataRows(SAMPLE_DATASET);
    setImportSummary(null);
  };

  const runBatchImport = async () => {
    if (dataRows.length === 0) return;

    setImporting(true);
    setImportProgress(20);

    try {
      setImportProgress(40);
      const res = await api.batchImportPayments(dataRows);
      setImportProgress(100);
      setImportSummary(res);
      onImportComplete();
    } catch (err: any) {
      console.error(err);
      alert("Batch import failed: " + (err.message || "Network error"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0c0e17] border border-[#1e2336] rounded-xl shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#1b2030] flex items-center justify-between bg-[#0e111c]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 border border-[#10b981]/40 flex items-center justify-center text-[#10b981]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Bring Your Own Data (BYOD) Statement Importer
              </h3>
              <p className="text-xs text-[#8b949e]">
                Upload CSV bank statement or load real Indian UPI payment records into VERA's live pipeline
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#1a1f2e] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Controls & Actions */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Dropzone */}
            <div className="p-6 border-2 border-dashed border-[#22283a] hover:border-[#3b82f6] rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#101322] relative group">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-8 h-8 text-[#60a5fa] mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-semibold text-white">Drag & drop your CSV bank statement here</div>
              <p className="text-[11px] text-[#6b7280] mt-1">PhonePe, GPay, Paytm, HDFC, SBI exports</p>
              {fileName && (
                <div className="mt-2 text-[11px] font-mono text-[#10b981] bg-[#064e3b]/30 px-2 py-0.5 rounded border border-[#059669]/40">
                  {fileName} ({dataRows.length} rows loaded)
                </div>
              )}
            </div>

            {/* Instant Sample Dataset Button */}
            <div className="p-6 rounded-xl bg-[#111422] border border-[#1d2334] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">Indian UPI Real-World Benchmark Dataset</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#1e3a8a] text-[#93c5fd]">
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  10 curated Indian payment cases containing genuine daily utility & grocery bills alongside digital arrest, customs courier fines, and task scams.
                </p>
              </div>
              <button
                onClick={loadSampleDataset}
                className="mt-4 px-3 py-2 rounded-lg bg-[#192238] hover:bg-[#202b48] border border-[#2b3756] text-xs font-medium text-[#93c5fd] flex items-center justify-center gap-2 transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Load Curated UPI Dataset</span>
              </button>
            </div>
          </div>

          {/* Data Preview Table */}
          {dataRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Loaded Records ({dataRows.length} Payments)
                </span>
                <span className="text-[11px] text-[#6b7280] font-mono">
                  Ready for multi-modal evaluation & Drunix commit
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-lg border border-[#1e2336] bg-[#0c0e17]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#121524] text-[10px] font-mono text-[#8b949e] uppercase border-b border-[#1e2336] sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Sender VPA</th>
                      <th className="py-2 px-3">Recipient VPA</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Stated Intent / Narrative</th>
                      <th className="py-2 px-3">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181d2c] font-mono text-[11px]">
                    {dataRows.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#111422] transition-colors">
                        <td className="py-2 px-3 text-[#9ca3af] truncate max-w-[140px]">{r.sender_id}</td>
                        <td className="py-2 px-3 text-white truncate max-w-[150px]">{r.recipient_id}</td>
                        <td className="py-2 px-3 text-[#60a5fa] font-bold">₹{Number(r.amount).toLocaleString('en-IN')}</td>
                        <td className="py-2 px-3 text-[#c9d1d9] truncate max-w-[260px]">{r.stated_intent}</td>
                        <td className="py-2 px-3 text-[#6b7280] uppercase text-[10px]">{r.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Ingestion Trigger & Progress */}
              <div className="pt-2 flex flex-col gap-3">
                {importing && (
                  <div className="w-full space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-[#60a5fa]">
                      <span>Processing multi-modal intelligence & mining Drunix blocks...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#1b2032] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#2563eb] to-[#3b82f6] transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {importSummary && (
                  <div className="p-4 rounded-lg bg-[#0d121f] border border-[#1f2940] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        <span>Batch Ingestion Completed Successfully</span>
                      </div>
                      <div className="text-xs text-[#8b949e] mt-1 font-mono">
                        Imported {importSummary.imported_count} transactions (Total Volume: ₹{Number(importSummary.total_volume_inr).toLocaleString('en-IN')})
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-1 rounded bg-[#064e3b] text-[#34d399] font-bold">
                        {importSummary.summary.allowed} ALLOWED
                      </span>
                      <span className="px-2 py-1 rounded bg-[#78350f] text-[#fbbf24] font-bold">
                        {importSummary.summary.verified} VERIFIED
                      </span>
                      <span className="px-2 py-1 rounded bg-[#7f1d1d] text-[#f87171] font-bold">
                        {importSummary.summary.held} HELD
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md bg-[#161a29] hover:bg-[#1f253a] text-xs font-medium text-[#c9d1d9] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={runBatchImport}
                    disabled={importing || dataRows.length === 0}
                    className="px-5 py-2 rounded-md bg-[#2563eb] hover:bg-[#1d4ed8] disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-2 shadow-md shadow-blue-900/30 transition-colors"
                  >
                    {importing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Batch Ingesting...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Run VERA Intent Batch Ingestion ({dataRows.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
