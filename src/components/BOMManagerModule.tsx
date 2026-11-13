import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { BOMItem } from '../types/erp';
import { ListTree, Plus, FileText, CheckCircle2, AlertTriangle, Layers, X } from 'lucide-react';

export const BOMManagerModule: React.FC = () => {
  const { activeProject, createBOMRecord, setCurrentTab } = useERP();

  const [isCreateBOMModalOpen, setIsCreateBOMModalOpen] = useState(false);
  const [selectedRevision, setSelectedRevision] = useState<'Rev A' | 'Rev B' | 'Rev C'>('Rev B');

  // Form states for Create BOM
  const [partNo, setPartNo] = useState('PLT-25-IS2062');
  const [description, setDescription] = useState('Plate 25 mm Base Flange');
  const [materialGrade, setMaterialGrade] = useState('IS 2062 E350');
  const [dimension, setDimension] = useState('12000 × 2500 × 25 mm');
  const [uom, setUom] = useState<BOMItem['uom']>('kg');
  const [qtyPerUnit, setQtyPerUnit] = useState(4200);
  const [processLossPercent, setProcessLossPercent] = useState(6.33);
  const [operationTarget, setOperationTarget] = useState('cutting');
  const [heatTracking, setHeatTracking] = useState(true);
  const [batchTracking, setBatchTracking] = useState(true);

  if (!activeProject) return null;

  const handleCreateBOM = (e: React.FormEvent) => {
    e.preventDefault();
    createBOMRecord(activeProject.id, {
      partNo,
      description,
      materialGrade,
      dimension,
      uom,
      qtyPerUnit,
      processLossPercent,
      heatTrackingRequired: heatTracking,
      batchTrackingRequired: batchTracking,
      operationTarget,
    });
    setIsCreateBOMModalOpen(false);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* Title Bar matching screenshot 5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-mono">
            FABRICATION WORKSPACE
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            BOM / Material Requirement
          </h2>
          <p className="text-xs text-slate-500">
            Released drawing → BOM → which material and how much quantity is required for each work order.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Download PDF
          </button>
          <button
            onClick={() => setIsCreateBOMModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create BOM</span>
          </button>
        </div>
      </div>

      {/* Revision Selectors Bar */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono">
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">BOM Register</span>
          <span className="text-[11px] text-slate-400">
            Draft → Review → Approve → Released. Released BOMs are locked; changes create a new revision.
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(['Rev A', 'Rev B', 'Rev C'] as const).map((rev) => (
            <button
              key={rev}
              onClick={() => setSelectedRevision(rev)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                selectedRevision === rev
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {rev}
            </button>
          ))}
        </div>
      </div>

      {/* BOM Detail Cards matching screenshot 4 */}
      <div className="space-y-4">
        {activeProject.bomItems.map((bom) => (
          <div
            key={bom.id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
          >
            {/* Top Line */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                  BOM-{activeProject.code}-{bom.partNo} · {selectedRevision}
                </span>
                <span className="text-xs text-slate-500 font-mono block">
                  Drawing: {activeProject.drawingNumber} · {activeProject.drawingRevision}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Released
              </span>
            </div>

            {/* Header info strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">PRODUCT / ASSEMBLY</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeProject.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">PROJECT / CUSTOMER</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeProject.client}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">BATCH RUN</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeProject.totalBatchQuantity} Nos.</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">HEAT TRACKING</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {bom.heatTrackingRequired ? 'Required ✓' : 'Standard'}
                </span>
              </div>
            </div>

            {/* Material Details Grid */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono mb-2">
                MATERIAL DETAILS
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] block">MATERIAL / COMPONENT</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{bom.description}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] block">MATERIAL GRADE</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{bom.materialGrade}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] block">SPECIFICATION / SIZE</span>
                  <span className="text-slate-700 dark:text-slate-300">{bom.dimension}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] block">QTY PER UNIT</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{bom.qtyPerUnit} {bom.uom}</span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] block">GROSS REQUIREMENT</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{bom.grossRequirement} {bom.uom}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] block">PROCESS LOSS %</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{bom.processLossPercent}%</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] block">NET REQUIREMENT</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{bom.netRequirement} {bom.uom}</span>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/40">
                  <span className="text-slate-400 text-[10px] block">TARGET OPERATION</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{bom.operationTarget}</span>
                </div>
              </div>
            </div>

            {/* Stock Availability Footer matching screenshot 4 */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 text-[10px] block">CURRENT STOCK</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{bom.currentStock} {bom.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">RESERVED STOCK</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{bom.reservedStock} {bom.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">AVAILABLE STOCK</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{bom.availableStock} {bom.uom}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">ALLOCATED HEAT NO</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{bom.allocatedHeatNo || 'Pending'}</span>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentTab('material_mrp')}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0 font-mono"
                >
                  Check Material Availability / Run MRP
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create BOM Modal matching screenshot 3 */}
      {isCreateBOMModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Create BOM
                </h3>
                <p className="text-xs text-slate-500">
                  Drawing Released → Create BOM → Add materials → Save (Draft) → Review → Approve → Release.
                </p>
              </div>
              <button
                onClick={() => setIsCreateBOMModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBOM} className="p-5 space-y-4 text-xs font-mono">
              {/* 1. Drawing Select */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  1. Drawing Select
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">DRAWING NO / REVISION</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{activeProject.drawingNumber} · {activeProject.drawingRevision}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">PRODUCT / ASSEMBLY</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{activeProject.name}</span>
                  </div>
                </div>
              </div>

              {/* 2. BOM Basic */}
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  2. BOM Basic
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">BOM NO</span>
                    <span className="text-slate-700 dark:text-slate-300">Auto generated</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">BOM REVISION</span>
                    <span className="font-bold">Rev A</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">STATUS</span>
                    <span className="font-bold text-amber-600">Draft</span>
                  </div>
                </div>
              </div>

              {/* 3. Add Material */}
              <div className="space-y-3">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  3. Add Material / Component
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Part / Item Code</label>
                    <input
                      type="text"
                      value={partNo}
                      onChange={(e) => setPartNo(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Material Grade</label>
                    <input
                      type="text"
                      value={materialGrade}
                      onChange={(e) => setMaterialGrade(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Specification / Size</label>
                    <input
                      type="text"
                      value={dimension}
                      onChange={(e) => setDimension(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">UOM</label>
                    <select
                      value={uom}
                      onChange={(e) => setUom(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="kg">kg</option>
                      <option value="Nos">Nos</option>
                      <option value="m">m</option>
                      <option value="sheets">sheets</option>
                      <option value="liters">liters</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Qty Per Unit</label>
                    <input
                      type="number"
                      value={qtyPerUnit}
                      onChange={(e) => setQtyPerUnit(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Process Loss %</label>
                    <input
                      type="number"
                      value={processLossPercent}
                      onChange={(e) => setProcessLossPercent(parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-0.5">Target Operation</label>
                    <select
                      value={operationTarget}
                      onChange={(e) => setOperationTarget(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                    >
                      <option value="cutting">Cutting & Drilling</option>
                      <option value="fitup">Fit-up</option>
                      <option value="welding">Welding</option>
                      <option value="machining">Machining</option>
                      <option value="painting">Painting</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={heatTracking}
                      onChange={(e) => setHeatTracking(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Heat Tracking Required</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={batchTracking}
                      onChange={(e) => setBatchTracking(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Batch Tracking</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateBOMModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  Save BOM (Draft)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
