import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import {
  FileText,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Lock,
  Download,
  Plus,
  X,
} from 'lucide-react';

export const DrawingReleaseModule: React.FC = () => {
  const {
    drawings,
    createDrawingRecord,
    releaseDrawingRevision,
    permissions,
    activeProject,
  } = useERP();

  const [selectedDrawingId, setSelectedDrawingId] = useState<string>(drawings[0]?.id || '');
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [approverName] = useState('Ananya Sharma (Project Manager)');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newDrawingNo, setNewDrawingNo] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newRevision, setNewRevision] = useState('Rev A');
  const [releaseOnUpload, setReleaseOnUpload] = useState(false);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const selectedDrawing =
    drawings.find((d) => d.id === selectedDrawingId) || drawings[0] || null;

  const handleRelease = (drawingId: string) => {
    releaseDrawingRevision(
      drawingId,
      approverName,
      approvalRemarks || 'Approved for manufacturing release.'
    );
    setApprovalRemarks('');
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrawingNo.trim()) return;
    const created = createDrawingRecord({
      drawingNo: newDrawingNo,
      title: newTitle,
      revision: newRevision,
      releaseImmediately: releaseOnUpload,
    });
    setSelectedDrawingId(created.id);
    setNewDrawingNo('');
    setNewTitle('');
    setNewRevision('Rev A');
    setReleaseOnUpload(false);
    setIsUploadModalOpen(false);
  };

  const handleDownloadSpec = () => {
    if (!selectedDrawing) return;
    const content = [
      `STECH FABRICATION OS — CONTROLLED DRAWING RECORD`,
      `Drawing No: ${selectedDrawing.drawingNo}`,
      `Revision: ${selectedDrawing.revision}`,
      `Title: ${selectedDrawing.title}`,
      `Status: ${selectedDrawing.status.toUpperCase()}`,
      `Uploaded By: ${selectedDrawing.uploadedBy} (${selectedDrawing.uploadedAt})`,
      `Released By: ${selectedDrawing.releasedBy || 'Pending Release'}`,
      `Approval Remarks: ${selectedDrawing.approvalRemarks || '—'}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDrawing.drawingNo}-${selectedDrawing.revision}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadToast(`Downloaded spec sheet for ${selectedDrawing.drawingNo} (${selectedDrawing.revision})`);
    setTimeout(() => setDownloadToast(null), 3500);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-mono">
              Engineering Gateway
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Project: {activeProject?.code} ({activeProject?.name})
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Drawing Release & Revision Control
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register engineering drawings, review revisions, and release approved baselines to unlock shopfloor cutting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {permissions.canReleaseDrawings ? (
            <span className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authorized to Release Drawings (PM)</span>
            </span>
          ) : (
            <span className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Read-Only Release (Switch to PM to Release)</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Drawing</span>
          </button>
        </div>
      </div>

      {/* 2. Main Content Split: Drawing Register (Left) & Drawing Details / Approver Gate (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Drawing Register List */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
              Drawing Register ({drawings.length})
            </h2>
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              + Register
            </button>
          </div>

          <div className="space-y-2">
            {drawings.map((dwg) => {
              const isSelected = selectedDrawing?.id === dwg.id;
              const isReleased = dwg.status === 'released';

              return (
                <div
                  key={dwg.id}
                  onClick={() => setSelectedDrawingId(dwg.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold font-mono text-xs text-slate-900 dark:text-slate-100">
                      {dwg.drawingNo}
                    </span>
                    <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {dwg.revision}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mb-2">
                    {dwg.title}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">By: {dwg.uploadedBy.split(' ')[0]}</span>
                    {isReleased ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>RELEASED</span>
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>UNDER REVIEW</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Active Drawing Detail & Release Sign-off */}
        {selectedDrawing && (
          <div className="lg:col-span-2 space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                      {selectedDrawing.drawingNo}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold">
                      {selectedDrawing.revision}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        selectedDrawing.status === 'released'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {selectedDrawing.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {selectedDrawing.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadSpec}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Spec</span>
                  </button>
                </div>
              </div>

              {downloadToast && (
                <div className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{downloadToast}</span>
                </div>
              )}

              {/* Drawing Metadata Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">UPLOADED BY</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDrawing.uploadedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">UPLOAD TIMESTAMP</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDrawing.uploadedAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">RELEASED BY</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedDrawing.releasedBy || 'Pending Release'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">RELEASE DATE</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedDrawing.releasedAt || '—'}
                  </span>
                </div>
              </div>

              {/* Drawing Preview Mockup / Blueprint Viewer */}
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950 p-6 text-center overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
                <div className="relative z-10 flex flex-col items-center justify-center py-6 text-slate-400">
                  <FileText className="w-12 h-12 text-blue-400/80 mb-2" />
                  <div className="text-sm font-mono font-bold text-slate-200">
                    {selectedDrawing.drawingNo} · {selectedDrawing.revision}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    {selectedDrawing.title} · Controlled Manufacturing Baseline
                  </p>
                  <div className="flex items-center gap-3 mt-4 text-[11px] font-mono text-slate-400">
                    <span>File: DXF / STEP / PDF</span>
                    <span>·</span>
                    <span>Scale: 1:10 Full GA</span>
                    <span>·</span>
                    <span className="text-emerald-400 font-bold">SHA-256 Validated</span>
                  </div>
                </div>
              </div>

              {/* Engineering Release Approval Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono flex items-center justify-between">
                  <span>Manufacturing Release Sign-Off</span>
                  <span className="text-slate-400 text-[10px]">Rule: Required before Cutting</span>
                </h4>

                {selectedDrawing.status === 'released' ? (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Released for Production by {selectedDrawing.releasedBy}</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{selectedDrawing.approvalRemarks}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500">
                      Releasing this drawing locks revision <strong>{selectedDrawing.revision}</strong> for floor fabrication.
                    </p>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Approver Remarks
                      </label>
                      <input
                        type="text"
                        value={approvalRemarks}
                        onChange={(e) => setApprovalRemarks(e.target.value)}
                        placeholder="e.g. Approved for cutting and weld prep."
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">
                        Approver: {approverName}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRelease(selectedDrawing.id)}
                        disabled={!permissions.canReleaseDrawings}
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve & Release Drawing</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Drawing Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Register New Engineering Drawing
                </h3>
                <p className="text-xs text-slate-500">
                  Add a CAD revision to the vault for work order linking.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Drawing Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAB-SKID-20T-002"
                    value={newDrawingNo}
                    onChange={(e) => setNewDrawingNo(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Revision
                  </label>
                  <input
                    type="text"
                    value={newRevision}
                    onChange={(e) => setNewRevision(e.target.value)}
                    className="w-full px-3 py-2 font-mono rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Drawing Title / Specification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Base Frame Welding GA"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {permissions.canReleaseDrawings && (
                <label className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={releaseOnUpload}
                    onChange={(e) => setReleaseOnUpload(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-emerald-800 dark:text-emerald-300">
                    Approve & Release immediately for production
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Drawing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
