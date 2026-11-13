import React, { useState, useEffect } from 'react';
import { useERP } from '../context/ERPContext';
import { AssemblyLevel } from '../types/erp';
import { X, Plus, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose }) => {
  const {
    createNewFabricationJob,
    createDrawingRecord,
    activeProject,
    workflowTemplates,
    drawings,
    permissions,
    setCurrentTab,
  } = useERP();

  const [partNo, setPartNo] = useState('');
  const [description, setDescription] = useState('');
  const [plannedQuantity, setPlannedQuantity] = useState(1);
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [dueDate, setDueDate] = useState('2026-11-30');
  const [templateId, setTemplateId] = useState(workflowTemplates[0]?.id || '');
  const [assemblyLevel, setAssemblyLevel] = useState<AssemblyLevel>('sub_assembly');

  // Drawing selection vs inline creation
  const [drawingMode, setDrawingMode] = useState<'existing' | 'new'>('existing');
  const [selectedDrawingId, setSelectedDrawingId] = useState<string>(drawings[0]?.id || '');
  const [newDrawingNo, setNewDrawingNo] = useState('');
  const [newDrawingTitle, setNewDrawingTitle] = useState('');
  const [newDrawingRev, setNewDrawingRev] = useState('Rev A');
  const [releaseNewDrawing, setReleaseNewDrawing] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (drawings.length === 0) {
        setDrawingMode('new');
      } else if (!drawings.some((d) => d.id === selectedDrawingId)) {
        setSelectedDrawingId(drawings[0].id);
      }
      if (!templateId && workflowTemplates[0]) {
        setTemplateId(workflowTemplates[0].id);
      }
    }
  }, [isOpen, drawings, selectedDrawingId, workflowTemplates, templateId]);

  if (!isOpen) return null;

  const selectedExistingDrawing = drawings.find((d) => d.id === selectedDrawingId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partNo.trim()) return;

    let finalDrawingRef = activeProject?.drawingNumber || 'DWG-STD-2026';

    if (drawingMode === 'new') {
      if (!newDrawingNo.trim()) return;
      const createdDwg = createDrawingRecord({
        drawingNo: newDrawingNo.trim(),
        title: newDrawingTitle.trim() || `${partNo.trim()} Fabrication Drawing`,
        revision: newDrawingRev.trim() || 'Rev A',
        releaseImmediately: releaseNewDrawing,
      });
      finalDrawingRef = `${createdDwg.drawingNo} ${createdDwg.revision}`;
    } else if (selectedExistingDrawing) {
      finalDrawingRef = `${selectedExistingDrawing.drawingNo} ${selectedExistingDrawing.revision}`;
    }

    createNewFabricationJob({
      partNo: partNo.trim(),
      description: description.trim() || 'Custom fabrication part assembly',
      plannedQuantity: Math.max(1, plannedQuantity),
      priority,
      dueDate,
      drawingRef: finalDrawingRef,
      templateId: templateId || undefined,
      assemblyLevel,
    });

    setPartNo('');
    setDescription('');
    setPlannedQuantity(1);
    setPriority('normal');
    setNewDrawingNo('');
    setNewDrawingTitle('');
    setNewDrawingRev('Rev A');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg max-h-[90vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              New Work Order
            </h3>
            <p className="text-xs text-slate-500">
              Select or register a drawing, assign a route snapshot, and launch to the floor.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Part number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. BCM-SF-003"
                value={partNo}
                onChange={(e) => setPartNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assembly Level
              </label>
              <select
                value={assemblyLevel}
                onChange={(e) => setAssemblyLevel(e.target.value as AssemblyLevel)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              >
                <option value="sub_assembly">Sub-Assembly</option>
                <option value="main_assembly">Main Assembly</option>
                <option value="master_assembly">Master Assembly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Part description
            </label>
            <input
              type="text"
              placeholder="e.g. Side frame assembly"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Drawing Selection or Inline Registration */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Engineering Drawing</span>
              </label>
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-900 p-0.5 rounded-lg text-[11px] font-mono">
                <button
                  type="button"
                  disabled={drawings.length === 0}
                  onClick={() => setDrawingMode('existing')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer disabled:opacity-40 ${
                    drawingMode === 'existing'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Select Existing ({drawings.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDrawingMode('new')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    drawingMode === 'new'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  + Add New Drawing
                </button>
              </div>
            </div>

            {drawingMode === 'existing' ? (
              <div className="space-y-2">
                <select
                  value={selectedDrawingId}
                  onChange={(e) => setSelectedDrawingId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {drawings.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.drawingNo} ({d.revision}) — {d.title} [{d.status === 'released' ? 'RELEASED' : 'UNDER REVIEW'}]
                    </option>
                  ))}
                </select>

                {selectedExistingDrawing && selectedExistingDrawing.status !== 'released' ? (
                  <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Under Review — must be released before cutting.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentTab('drawing_release');
                        onClose();
                      }}
                      className="font-mono font-bold underline shrink-0 cursor-pointer"
                    >
                      Open Drawing Gate
                    </button>
                  </div>
                ) : selectedExistingDrawing ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Drawing Released · Ready for immediate production</span>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      required={drawingMode === 'new'}
                      placeholder="Drawing No (e.g. DWG-SKID-002)"
                      value={newDrawingNo}
                      onChange={(e) => setNewDrawingNo(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Rev A"
                      value={newDrawingRev}
                      onChange={(e) => setNewDrawingRev(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Drawing Title (e.g. Pump Skid Base Frame GA)"
                  value={newDrawingTitle}
                  onChange={(e) => setNewDrawingTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {permissions.canReleaseDrawings ? (
                  <label className="flex items-center gap-2 text-[11px] text-emerald-700 dark:text-emerald-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={releaseNewDrawing}
                      onChange={(e) => setReleaseNewDrawing(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Release drawing immediately (PM Sign-off)</span>
                  </label>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Saves as Under Review in Drawing Register for PM approval.
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Production Route Template
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            >
              {workflowTemplates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} ({tmpl.stages.length} stages)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Qty (Nos)
              </label>
              <input
                type="number"
                min="1"
                value={plannedQuantity}
                onChange={(e) => setPlannedQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Work Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
