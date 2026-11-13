import React, { useState } from 'react';
import { useERP } from '../context/ERPContext';
import { CustomFieldDefinition, WorkflowStageConfig } from '../types/erp';
import {
  Sliders,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Package,
  Layers,
  ArrowDown,
  ArrowUp,
  Settings2,
  FileText,
  Copy,
  Sparkles,
} from 'lucide-react';

export const WorkflowConfigurator: React.FC = () => {
  const {
    workflowStages,
    workflowTemplates,
    applyTemplateToSubAssembly,
    jobCards,
    updateWorkflowStage,
    addWorkflowStage,
    deleteWorkflowStage,
    addCustomFieldToStage,
  } = useERP();

  const [activeTab, setActiveTab] = useState<'templates' | 'stages'>('templates');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tmpl_std_fab');
  const [selectedSubAssemblyId, setSelectedSubAssemblyId] = useState<string>('jc_boom_01');
  const [selectedStageId, setSelectedStageId] = useState<string>(workflowStages[2]?.id || 'cutting');
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);

  // New Step form states
  const [newStepName, setNewStepName] = useState('CNC Plate Bending & Press Brake');
  const [newStepSublabel, setNewStepSublabel] = useState('Hydraulic CNC folding & angle verification');
  const [newStepCategory, setNewStepCategory] = useState<WorkflowStageConfig['category']>('fabrication');
  const [newStepRequiresQC, setNewStepRequiresQC] = useState(true);
  const [newStepRequiresHeat, setNewStepRequiresHeat] = useState(false);

  // New Custom Field form states
  const [fieldLabel, setFieldLabel] = useState('Preheat Temperature');
  const [fieldType, setFieldType] = useState<CustomFieldDefinition['type']>('number');
  const [fieldUnit, setFieldUnit] = useState('°C');
  const [fieldRequired, setFieldRequired] = useState(true);
  const [fieldDefaultVal, setFieldDefaultVal] = useState('120');

  const activeStage = workflowStages.find((s) => s.id === selectedStageId) || workflowStages[0];
  const activeTemplate = workflowTemplates.find((t) => t.id === selectedTemplateId) || workflowTemplates[0];

  const handleCreateStep = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `custom_${Date.now().toString().slice(-4)}`;
    const newStage: WorkflowStageConfig = {
      id: newId,
      name: newStepName,
      sublabel: newStepSublabel,
      sequence: workflowStages.length + 1,
      category: newStepCategory,
      iconName: 'Wrench',
      departmentCode: 'FAB',
      isStandard: false,
      mandatory: true,
      canSkip: true,
      proofRequired: true,
      requiresQCApproval: newStepRequiresQC,
      requiresHeatTracking: newStepRequiresHeat,
      requiresAllQuantitiesCompleted: false,
      allowSplitBatchMove: true,
      isReworkDestinationAllowed: true,
      customFields: [],
    };
    addWorkflowStage(newStage);
    setSelectedStageId(newId);
    setIsAddStepModalOpen(false);
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStage) return;

    const newField: CustomFieldDefinition = {
      id: `cf_${Date.now().toString().slice(-4)}`,
      label: fieldLabel,
      type: fieldType,
      unit: fieldUnit || undefined,
      required: fieldRequired,
      defaultValue: fieldType === 'number' ? parseFloat(fieldDefaultVal) || 0 : fieldDefaultVal,
    };

    addCustomFieldToStage(activeStage.id, newField);
    setIsAddFieldModalOpen(false);
    setFieldLabel('');
    setFieldUnit('');
  };

  const handleApplyTemplate = () => {
    applyTemplateToSubAssembly(selectedSubAssemblyId, selectedTemplateId);
    alert(`Snapshot of template '${activeTemplate.name}' assigned to sub-assembly. Local route can now be customized without altering the global template.`);
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
              WORKFLOW & ROUTE ENGINE
            </span>
            <span className="text-xs text-slate-500 font-mono">Template Snapshotting</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Workflow Templates & Route Configurator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Create reusable templates. When applied to a sub-assembly, the system creates a route snapshot. Project-specific changes modify the snapshot only, not the master template.
          </p>
        </div>

        {/* View Switcher between Reusable Templates and Stage Rules */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Reusable Templates ({workflowTemplates.length})
          </button>
          <button
            onClick={() => setActiveTab('stages')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'stages'
                ? 'bg-purple-600 text-white font-bold shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Stage Rules & Custom Fields
          </button>
        </div>
      </div>

      {/* TAB 1: REUSABLE TEMPLATES & ROUTE SNAPSHOTTING */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {workflowTemplates.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setSelectedTemplateId(tmpl.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300">
                        {tmpl.code}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        v{tmpl.version}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 mb-3">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">{tmpl.stages.length} Stages</span>
                    {isSelected && <span className="text-purple-600 font-bold">ACTIVE ✓</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Snapshot Assignment Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Copy className="w-4 h-4 text-purple-600" />
                  <span>Assign Route Snapshot to Sub-Assembly</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applies a frozen snapshot of <strong>{activeTemplate.name}</strong> to the chosen item. Future edits to this job card will not mutate the global template.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedSubAssemblyId}
                  onChange={(e) => setSelectedSubAssemblyId(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                >
                  {jobCards.filter((j) => j.assemblyLevel === 'sub_assembly').map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.partNo} · {j.description}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleApplyTemplate}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-700 hover:bg-purple-600 text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Route Snapshot</span>
                </button>
              </div>
            </div>

            {/* Stages Sequence in this Template */}
            <div className="space-y-2">
              <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider block">
                Sequence of Operations in {activeTemplate.name} ({activeTemplate.stages.length} Gates)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {activeTemplate.stages.map((stg, i) => (
                  <div
                    key={stg.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 text-xs flex items-center gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">{stg.name}</div>
                      <div className="text-[10px] text-slate-400 truncate font-mono">Dept: {stg.departmentCode}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE STAGE RULES & CUSTOM FIELDS */}
      {activeTab === 'stages' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Step Sequence List */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider font-mono">
                Active Stages ({workflowStages.length})
              </span>
              <button
                onClick={() => setIsAddStepModalOpen(true)}
                className="text-xs text-purple-600 font-bold hover:underline cursor-pointer"
              >
                + New Stage
              </button>
            </div>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
              {workflowStages.map((stage, idx) => {
                const isSelected = stage.id === selectedStageId;
                return (
                  <div
                    key={stage.id}
                    onClick={() => setSelectedStageId(stage.id)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-400 dark:border-purple-600 ring-1 ring-purple-400'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-mono text-[10px] font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block truncate">
                          {stage.name}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block font-mono">
                          Dept: {stage.departmentCode} · {stage.customFields.length} field(s)
                        </span>
                      </div>
                    </div>

                    {!stage.isStandard && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Remove custom step "${stage.name}"?`)) {
                            deleteWorkflowStage(stage.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-red-500 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 2 Cols: Step Rules, Transition Logic & Custom Fields */}
          <div className="lg:col-span-2 space-y-6">
            {activeStage ? (
              <>
                {/* Condition Logic Card */}
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Step Rules & Transition Logic: {activeStage.name}
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        Define conditions required when parts move into, through, or back from this operation.
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                      DEPT: {activeStage.departmentCode}
                    </span>
                  </div>

                  {/* Condition Toggles Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    {/* Rule 1: Mandatory QC Gate */}
                    <label className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={activeStage.requiresQCApproval}
                        onChange={(e) =>
                          updateWorkflowStage(activeStage.id, { requiresQCApproval: e.target.checked })
                        }
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          Mandatory QC Sign-Off
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Blocks downstream stages until an inspector passes inspection.
                        </span>
                      </div>
                    </label>

                    {/* Rule 2: Proof Photo Required */}
                    <label className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={activeStage.proofRequired}
                        onChange={(e) =>
                          updateWorkflowStage(activeStage.id, { proofRequired: e.target.checked })
                        }
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          Proof Photo Required
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Requires operator to attach photo evidence before advancing.
                        </span>
                      </div>
                    </label>

                    {/* Rule 3: Allow Skip */}
                    <label className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={activeStage.canSkip}
                        onChange={(e) =>
                          updateWorkflowStage(activeStage.id, { canSkip: e.target.checked })
                        }
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          Allow Authorized Skip
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Stage can be skipped with justification logged into audit trail.
                        </span>
                      </div>
                    </label>

                    {/* Rule 4: Rework Destination Allowed */}
                    <label className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <input
                        type="checkbox"
                        checked={activeStage.isReworkDestinationAllowed}
                        onChange={(e) =>
                          updateWorkflowStage(activeStage.id, { isReworkDestinationAllowed: e.target.checked })
                        }
                        className="mt-0.5 rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">
                          Rework Fallback Target
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          QC can route failed parts back here for corrective repair.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Custom Form Fields Card */}
                <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        Custom Form Fields for {activeStage.name}
                      </span>
                      <span className="text-xs text-slate-500 block mt-0.5">
                        These inputs appear on the operator console during job execution.
                      </span>
                    </div>

                    <button
                      onClick={() => setIsAddFieldModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-700 hover:bg-purple-800 text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add Field</span>
                    </button>
                  </div>

                  {activeStage.customFields.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 font-mono rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
                      No custom fields defined for this stage. Tap '+ Add Field' to create one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {activeStage.customFields.map((field) => (
                        <div
                          key={field.id}
                          className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-mono flex items-start justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-slate-100 block">
                              {field.label}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              Type: {field.type} {field.unit ? `(${field.unit})` : ''} · Default: {String(field.defaultValue)}
                            </span>
                          </div>
                          {field.required && (
                            <span className="text-[10px] text-red-500 font-bold uppercase">
                              Req *
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Add Step Modal */}
      {isAddStepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Add New Production Step
            </h3>

            <form onSubmit={handleCreateStep} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Step Name</label>
                <input
                  type="text"
                  required
                  value={newStepName}
                  onChange={(e) => setNewStepName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Sublabel / Instructions</label>
                <input
                  type="text"
                  required
                  value={newStepSublabel}
                  onChange={(e) => setNewStepSublabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddStepModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Create Step
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Field Modal */}
      {isAddFieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Add Custom Field to "{activeStage?.name}"
            </h3>

            <form onSubmit={handleAddField} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Field Name / Label</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Preheat Temperature"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Field Type</label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="text">Text Input</option>
                    <option value="number">Numeric Value</option>
                    <option value="boolean">Checkbox / Boolean</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Unit (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. °C, mm, Nm, µm"
                    value={fieldUnit}
                    onChange={(e) => setFieldUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1">Default Value</label>
                <input
                  type="text"
                  value={fieldDefaultVal}
                  onChange={(e) => setFieldDefaultVal(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddFieldModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white font-semibold"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
