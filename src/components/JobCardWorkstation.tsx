import React, { useEffect, useRef, useState } from 'react';
import { useERP } from '../context/ERPContext';
import { JobCardOperation, ProofMedia } from '../types/erp';
import {
  Play,
  Pause,
  CheckCircle2,
  RotateCcw,
  User,
  Wrench,
  Layers,
  FileCheck2,
  ChevronRight,
  ChevronLeft,
  Upload,
  Camera,
  ShieldCheck,
  Save,
} from 'lucide-react';

interface JobCardWorkstationProps {
  onOpenReworkModal: (fromStageId: string) => void;
  onOpenQCModal: (stageId: string) => void;
  onOpenTraveler: () => void;
}

export const JobCardWorkstation: React.FC<JobCardWorkstationProps> = ({
  onOpenReworkModal,
  onOpenQCModal,
  onOpenTraveler,
}) => {
  const {
    activeJobCard,
    activeStageId,
    setActiveStageId,
    workflowStages,
    machines,
    operators,
    startOperation,
    pauseOperation,
    updateStageQuantities,
    assignOperatorAndMachine,
    completeReworkExecution,
    addProofToOperation,
  } = useERP();

  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scrapKg, setScrapKg] = useState<number>(0);
  const [proofCaption, setProofCaption] = useState<string>('');
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [reworkHours, setReworkHours] = useState<number>(3.5);
  const [repairNotes, setRepairNotes] = useState<string>(
    'Gouged out joint J-02 defect with carbon arc, ground clean, clamped with ceramic backup bar, and deposited multi-pass re-weld per WPS R-02.'
  );

  const activeOp: JobCardOperation | undefined = activeJobCard
    ? activeJobCard.operations.find(
        (o) => o.stageId === (activeStageId || activeJobCard.currentStageId)
      ) || activeJobCard.operations[0]
    : undefined;

  useEffect(() => {
    if (activeOp) {
      setScrapKg(activeOp.scrapWeightKg ?? 0);
    }
  }, [activeJobCard?.id, activeOp?.stageId, activeOp?.scrapWeightKg]);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3500);
  };

  if (!activeJobCard || !activeOp) {
    return (
      <div className="p-8 text-center text-slate-500">
        No active Job Card selected. Select a project or job card from the top bar.
      </div>
    );
  }

  const currentIdx = activeJobCard.operations.findIndex((o) => o.stageId === activeOp.stageId);
  const prevOp = currentIdx > 0 ? activeJobCard.operations[currentIdx - 1] : null;
  const nextOp = currentIdx < activeJobCard.operations.length - 1 ? activeJobCard.operations[currentIdx + 1] : null;
  const stageConfig = workflowStages.find((s) => s.id === activeOp.stageId);

  const canAdvancePiece =
    activeOp.quantities.completed < activeJobCard.totalQuantity &&
    (activeOp.quantities.inProgress > 0 || activeOp.quantities.pending > 0);

  // Format timer
  const formatStopwatch = (op: JobCardOperation) => {
    if (!op.isRunning || !op.timerStartedAt) return null;
    const totalSecs = Math.floor(Math.max(0, (Date.now() - op.timerStartedAt) / 1000));
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Check for incoming rework tickets targeting this station
  const incomingReworkTicket = activeJobCard.reworkTickets.find(
    (t) => t.toStageId === activeOp.stageId && t.status === 'open'
  );

  const handleAdvanceOnePiece = () => {
    if (!canAdvancePiece) return;
    const newCompleted = Math.min(activeJobCard.totalQuantity, activeOp.quantities.completed + 1);
    const updatePayload =
      activeOp.quantities.inProgress > 0
        ? {
            completed: newCompleted,
            inProgress: Math.max(0, activeOp.quantities.inProgress - 1),
          }
        : {
            completed: newCompleted,
            pending: Math.max(0, activeOp.quantities.pending - 1),
          };

    updateStageQuantities(
      activeJobCard.id,
      activeOp.stageId,
      updatePayload,
      scrapKg
    );
    showToast(`Marked 1 piece completed at ${activeOp.stageName} (${newCompleted}/${activeJobCard.totalQuantity}).`);
  };

  const handleSaveScrapOnly = () => {
    updateStageQuantities(activeJobCard.id, activeOp.stageId, {}, scrapKg);
    showToast(`Saved ${scrapKg} kg scrap weight on ${activeOp.stageName}.`);
  };

  const buildTimestamp = () => new Date().toISOString().substring(0, 16).replace('T', ' ');

  const handleAttachProofSim = () => {
    const sampleProofs: Record<string, ProofMedia> = {
      cutting: {
        id: `prf_${Date.now()}`,
        entityType: 'job_card',
        entityId: activeJobCard.id,
        stageId: 'cutting',
        type: 'image',
        url: '/public/assets/aistudio/image_7b8a5e34.png',
        caption: proofCaption.trim() || `CNC profiling completed with scrap (${scrapKg} kg) recorded. Cut tolerance verified ±0.8mm.`,
        uploadedBy: activeOp.operator.name,
        uploadedAt: buildTimestamp(),
        fileSize: '3.4 MB',
      },
      fitup: {
        id: `prf_${Date.now()}`,
        entityType: 'job_card',
        entityId: activeJobCard.id,
        stageId: 'fitup',
        type: 'image',
        url: '/public/assets/aistudio/image_75b0e7a9.png',
        caption: proofCaption.trim() || 'Jig bed alignment and root gap check confirmed within WPS specifications.',
        uploadedBy: activeOp.operator.name,
        uploadedAt: buildTimestamp(),
        fileSize: '2.9 MB',
      },
      welding: {
        id: `prf_${Date.now()}`,
        entityType: 'job_card',
        entityId: activeJobCard.id,
        stageId: 'welding',
        type: 'image',
        url: '/public/assets/aistudio/image_75b0e7a9.png',
        caption: proofCaption.trim() || 'Robotic tandem cell high-strength seam welding completed with pre-heat verified.',
        uploadedBy: activeOp.operator.name,
        uploadedAt: buildTimestamp(),
        fileSize: '4.1 MB',
      },
    };

    const defaultProof = sampleProofs[activeOp.stageId] || {
      id: `prf_${Date.now()}`,
      entityType: 'job_card',
      entityId: activeJobCard.id,
      stageId: activeOp.stageId,
      type: 'image',
      url: '/public/assets/aistudio/image_7b8a5e34.png',
      caption: proofCaption.trim() || `Workstation execution proof for ${activeOp.stageName} on ${activeJobCard.partNo}.`,
      uploadedBy: activeOp.operator.name,
      uploadedAt: buildTimestamp(),
      fileSize: '3.1 MB',
    };

    addProofToOperation(activeJobCard.id, activeOp.stageId, defaultProof);
    setProofCaption('');
    showToast(`Attached proof photo to ${activeOp.stageName}.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      const proof: ProofMedia = {
        id: `prf_${Date.now()}`,
        entityType: 'job_card',
        entityId: activeJobCard.id,
        stageId: activeOp.stageId,
        type: 'image',
        url: dataUrl,
        caption: proofCaption.trim() || `${file.name} · ${activeOp.stageName} verification photo`,
        uploadedBy: activeOp.operator.name,
        uploadedAt: buildTimestamp(),
        fileSize: `${Math.max(0.1, Math.round((file.size / 1048576) * 10) / 10)} MB`,
      };
      addProofToOperation(activeJobCard.id, activeOp.stageId, proof);
      setProofCaption('');
      showToast(`Uploaded ${file.name} to ${activeOp.stageName}.`);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-6xl mx-auto">
      {/* 1. Clean Top Header: Step Name, Part Name, and Order Quantity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 mb-1">
            <span className="font-bold text-amber-600 dark:text-amber-400">
              STEP {currentIdx + 1} OF {activeJobCard.operations.length}
            </span>
            <span>·</span>
            <span>Job: {activeJobCard.jobCardNo}</span>
            <span>·</span>
            <span>Batch: <strong>{activeJobCard.totalQuantity} Pieces</strong></span>
            <span>·</span>
            <span>Logged: <strong>{activeOp.actualHours}h</strong> / {activeOp.plannedHours}h</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {activeOp.stageName} · <span className="font-medium text-slate-600 dark:text-slate-400">{activeJobCard.partNo}</span>
          </h2>
          <p className="text-xs text-slate-500">{activeJobCard.description}</p>
        </div>

        {/* Stopwatch & Step Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          {prevOp && (
            <button
              type="button"
              onClick={() => setActiveStageId(prevOp.stageId)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
              title={`Previous: ${prevOp.stageName}`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{prevOp.stageName.split(' ')[0]}</span>
            </button>
          )}

          {/* Simple Timer Button */}
          {!activeOp.isRunning ? (
            <button
              type="button"
              onClick={() => startOperation(activeJobCard.id, activeOp.stageId)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Work</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => pauseOperation(activeJobCard.id, activeOp.stageId)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors font-mono cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5 fill-white" />
              <span>Pause ({formatStopwatch(activeOp) || 'Working'})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenQCModal(activeOp.stageId)}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
            title="Inspect this stage at QC Station"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="hidden md:inline">QC Gate</span>
          </button>

          <button
            type="button"
            onClick={onOpenTraveler}
            className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            title="Open Job Traveler Sheet"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Traveler</span>
          </button>

          {nextOp && (
            <button
              type="button"
              onClick={() => setActiveStageId(nextOp.stageId)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
              title={`Next: ${nextOp.stageName}`}
            >
              <span className="hidden sm:inline">{nextOp.stageName.split(' ')[0]}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {statusToast && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusToast}</span>
        </div>
      )}

      {/* 2. REWORK ALERT & REPAIR EXECUTION BOX (If QC returned an affected piece to this station) */}
      {incomingReworkTicket && (
        <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border-2 border-purple-400 dark:border-purple-800 space-y-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-purple-900 dark:text-purple-200 uppercase font-mono tracking-wide">
                QC Inspection Defect Found → Corrective Work Assigned to this Station
              </div>
              <p className="text-sm font-semibold text-purple-950 dark:text-purple-100 mt-0.5">
                Defect: {incomingReworkTicket.defectDetails}
              </p>
              <p className="text-xs text-purple-800 dark:text-purple-300 mt-0.5">
                Corrective WPS Action: <strong>{incomingReworkTicket.correctiveAction}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-purple-200 dark:border-purple-900/60 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">
                Hours Spent on Repair
              </label>
              <input
                type="number"
                step="0.5"
                value={reworkHours}
                onChange={(e) => setReworkHours(parseFloat(e.target.value) || 1)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-600 dark:text-slate-400 text-[11px] mb-1">
                Repair Notes / Actions Taken
              </label>
              <input
                type="text"
                value={repairNotes}
                onChange={(e) => setRepairNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-700 text-slate-900 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={() => {
                completeReworkExecution(activeJobCard.id, incomingReworkTicket.id, reworkHours, repairNotes);
                showToast(`Corrective rework completed (${reworkHours} hrs). Component queued for re-inspection.`);
              }}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-700 hover:bg-purple-600 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Complete Rework & Submit to QC for Re-Inspection</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. 4-Stage Quantity WIP Counter Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Completed */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            Done (Completed)
          </span>
          <div className="text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 my-1">
            {activeOp.quantities.completed}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">conforming units</span>
        </div>

        {/* Working */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            In-Progress
          </span>
          <div className="text-3xl font-bold font-mono text-blue-600 dark:text-blue-400 my-1">
            {activeOp.quantities.inProgress}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">active on machine</span>
        </div>

        {/* Pending */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Pending Queue
          </span>
          <div className="text-3xl font-bold font-mono text-slate-700 dark:text-slate-300 my-1">
            {activeOp.quantities.pending}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">awaiting this gate</span>
        </div>

        {/* Rework */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-xs">
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide">
            Rework / Fix
          </span>
          <div className="text-3xl font-bold font-mono text-purple-700 dark:text-purple-300 my-1">
            {activeOp.quantities.rework}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">returned from QC</span>
        </div>
      </div>

      {/* 4. Primary Working Controls & Scrap Metal Recording */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Main Action 1: + 1 Piece Done */}
            <button
              type="button"
              disabled={!canAdvancePiece}
              onClick={handleAdvanceOnePiece}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {activeOp.quantities.completed >= activeJobCard.totalQuantity
                  ? 'Stage Completed ✓'
                  : 'Mark 1 Piece Done (+1)'}
              </span>
            </button>

            {/* Main Action 2: Send Back for Rework */}
            <button
              type="button"
              onClick={() => onOpenReworkModal(activeOp.stageId)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Report Fitment Defect / Send Back</span>
            </button>
          </div>

          {/* Scrap Metal Weight (saved independently or alongside piece completion) */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-500">Captured Scrap:</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={scrapKg}
              onChange={(e) => setScrapKg(parseFloat(e.target.value) || 0)}
              className="w-20 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold"
            />
            <span className="text-slate-500">kg</span>
            <button
              type="button"
              onClick={handleSaveScrapOnly}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold transition-colors cursor-pointer"
              title="Save scrap weight to this stage"
            >
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Proof Capture & Workstation Photographic Evidence Section */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-500" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
              Workstation Proof Capture & Visual Verification ({activeOp.proofs?.length || 0})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={proofCaption}
              onChange={(e) => setProofCaption(e.target.value)}
              placeholder="Optional proof note / measurement..."
              className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono w-56 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Photo</span>
            </button>
            <button
              type="button"
              onClick={handleAttachProofSim}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>+ Attach Workstation Photo Proof</span>
            </button>
          </div>
        </div>

        {/* Existing Proof Gallery */}
        {activeOp.proofs && activeOp.proofs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {activeOp.proofs.map((prf) => (
              <div
                key={prf.id}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3"
              >
                <img
                  src={prf.url}
                  alt={prf.caption}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-300 dark:border-slate-700 shrink-0"
                />
                <div className="flex-1 min-w-0 text-xs">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {prf.caption}
                  </p>
                  <div className="mt-1 text-[11px] font-mono text-slate-500 flex items-center justify-between gap-2">
                    <span className="truncate">By: {prf.uploadedBy}</span>
                    <span className="shrink-0">{prf.uploadedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 font-mono">
            No proof photo attached yet for this operation. Upload a photo or tap '+ Attach Workstation Photo Proof'.
          </div>
        )}
      </div>

      {/* 6. Station Details: Operator, Machine, Material & Stage Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Operator */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            <User className="w-3.5 h-3.5" />
            <span>Assigned Operator</span>
          </div>
          <select
            value={activeOp.operator.id}
            onChange={(e) => {
              assignOperatorAndMachine(activeJobCard.id, activeOp.stageId, e.target.value, activeOp.machine.id);
              showToast('Assigned operator updated.');
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
          >
            {operators.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name} ({op.department})
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-500">
            Shift: <strong>{activeOp.operator.shift}</strong>
          </div>
        </div>

        {/* Machine */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5" />
            <span>Machine / Work Bay</span>
          </div>
          <select
            value={activeOp.machine.id}
            onChange={(e) => {
              assignOperatorAndMachine(activeJobCard.id, activeOp.stageId, activeOp.operator.id, e.target.value);
              showToast('Assigned machine updated.');
            }}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.workCenter})
              </option>
            ))}
          </select>
          <div className="text-[11px] text-slate-500">
            Work Center: <strong>{activeOp.machine.workCenter}</strong>
          </div>
        </div>

        {/* Material & Stage Parameters */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>Material & Stage Specs</span>
          </div>
          <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 font-mono text-xs space-y-0.5">
            <div>Grade: <strong className="text-slate-900 dark:text-slate-100">{activeOp.material.grade}</strong></div>
            <div>Heat No: <strong className="text-blue-600 dark:text-blue-400">{activeOp.material.heatNumber}</strong></div>
            <div className="text-[11px] text-slate-500">Size: {activeOp.material.dimension}</div>
          </div>
          {stageConfig && stageConfig.customFields.length > 0 && (
            <div className="pt-1 space-y-1 text-[11px] font-mono">
              {stageConfig.customFields.map((cf) => (
                <div key={cf.id} className="flex items-center justify-between gap-2 text-slate-600 dark:text-slate-400">
                  <span className="truncate">{cf.label}:</span>
                  <strong className="text-slate-900 dark:text-slate-200 shrink-0">
                    {String(cf.defaultValue ?? '—')} {cf.unit || ''}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
