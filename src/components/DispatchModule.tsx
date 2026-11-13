import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { Truck, CheckCircle2, ShieldCheck, FileCheck, Package } from 'lucide-react';

export const DispatchModule: React.FC<{ onOpenTraveler: () => void }> = ({ onOpenTraveler }) => {
  const { activeJobCard, activeProject, dispatchJobCard } = useERP();

  const [deliveryNote, setDeliveryNote] = useState(
    'All units crated on export pallets. MTC, NDT radiographic reports, and paint DFT certificates enclosed in dossier.'
  );
  const [transporter, setTransporter] = useState('Apex Heavy Haulage Logistics');
  const [truckNo, setTruckNo] = useState('MH-04-AZ-9941');

  if (!activeJobCard || !activeProject) {
    return <div className="p-8 text-center text-slate-500">No project selected.</div>;
  }

  const isDispatched = activeJobCard.overallStatus === 'completed';

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchJobCard(
      activeJobCard.id,
      `Carrier: ${transporter} (${truckNo}). Notes: ${deliveryNote}`
    );
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              STAGE 10: PRODUCTION COMPLETION & DISPATCH
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Client: {activeProject.client}
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Final Clearance & Dispatch Gate
          </h2>
        </div>

        <button
          onClick={onOpenTraveler}
          className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors font-mono"
        >
          Print Full Quality Dossier
        </button>
      </div>

      {/* Dossier Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compliance checklist */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Pre-Dispatch Quality Clearance Checklist</span>
          </h3>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                1. Mill Test Certificate (MTC) Heat Code Traceability
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED ✓</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                2. Dimensional Tolerance Inspection Report
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASSED ✓</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                3. NDT & Weld Visual Examination Sign-off
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">CLEARED ✓</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60">
              <span className="text-emerald-900 dark:text-emerald-200 font-medium">
                4. Surface Prep Cleanliness & Dry Film Thickness (DFT)
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">ACCEPTED ✓</span>
            </div>
          </div>
        </div>

        {/* Dispatch Action Form */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" />
            <span>Shipping & Consignment Release Note</span>
          </h3>

          {isDispatched ? (
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Job Card Completely Finished & Dispatched</span>
              </div>
              <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                All {activeJobCard.totalQuantity} Units marked as delivered to {activeProject.client}.
              </p>
            </div>
          ) : (
            <form onSubmit={handleDispatch} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Logistics Carrier Name
                </label>
                <input
                  type="text"
                  value={transporter}
                  onChange={(e) => setTransporter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Truck / Container Number
                </label>
                <input
                  type="text"
                  value={truckNo}
                  onChange={(e) => setTruckNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dispatch Notes
                </label>
                <textarea
                  rows={2}
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
              >
                <Truck className="w-4 h-4" />
                <span>Complete Production & Issue Final Dispatch</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
