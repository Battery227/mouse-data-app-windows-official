/**
 * Export utilities for various formats (JSON, CSV, Excel)
 * Handles exporting experiment data in multiple formats
 */

import { AppState, Experiment, HousingUnit, Subject, Event, ExperimentTemplate } from '../schema/types';

// ============================================================================
// JSON Export
// ============================================================================

export interface JsonExportData {
  version: string;
  exportedAt: string;
  experiments: Experiment[];
  housingUnits: HousingUnit[];
  subjects: Subject[];
  events: Event[];
  templates?: ExperimentTemplate[];
}

export function exportToJson(
  state: AppState,
  options: {
    includeTemplates?: boolean;
    experimentIds?: string[];
  } = {}
): string {
  const { includeTemplates = false, experimentIds } = options;

  // Filter data if specific experiments requested
  let experiments = state.experiments;
  let housingUnits = state.housingUnits;
  let subjects = state.subjects;
  let events = state.events;

  if (experimentIds && experimentIds.length > 0) {
    experiments = experiments.filter(e => experimentIds.includes(e.id));
    const expIds = new Set(experimentIds);
    housingUnits = housingUnits.filter(h => expIds.has(h.experimentId));
    subjects = subjects.filter(s => expIds.has(s.experimentId));
    events = events.filter(e => expIds.has(e.experimentId));
  }

  const exportData: JsonExportData = {
    version: '2.0.0',
    exportedAt: new Date().toISOString(),
    experiments,
    housingUnits,
    subjects,
    events,
  };

  if (includeTemplates) {
    exportData.templates = state.templates;
  }

  return JSON.stringify(exportData, null, 2);
}

export function downloadJson(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// CSV Export
// ============================================================================

export function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function arrayToCSV(headers: string[], rows: any[][]): string {
  const csvHeaders = headers.map(escapeCSV).join(',');
  const csvRows = rows.map(row => row.map(escapeCSV).join(','));
  return [csvHeaders, ...csvRows].join('\n');
}

export function exportSubjectsToCSV(
  subjects: Subject[],
  housingUnits: HousingUnit[],
  experiments: Experiment[],
  template: ExperimentTemplate
): string {
  const housingUnitMap = new Map(housingUnits.map(h => [h.id, h]));
  const experimentMap = new Map(experiments.map(e => [e.id, e]));

  // Build headers dynamically based on custom fields
  const headers = [
    'Subject ID',
    'Housing Unit',
    'Experiment',
    'Status',
    'Created At',
    ...template.species.defaultFields.map(f => f.label),
  ];

  const rows = subjects.map(subject => {
    const housingUnit = housingUnitMap.get(subject.housingUnitId);
    const experiment = experimentMap.get(subject.experimentId);
    
    const baseData = [
      subject.subjectId,
      housingUnit?.name || '',
      experiment?.name || '',
      subject.status,
      subject.createdAt,
    ];

    // Add custom field values
    const customFieldValues = template.species.defaultFields.map(field => 
      subject.customFieldValues[field.id] || ''
    );

    return [...baseData, ...customFieldValues];
  });

  return arrayToCSV(headers, rows);
}

export function exportEventsToCSV(
  events: Event[],
  subjects: Subject[],
  template: ExperimentTemplate
): string {
  const subjectMap = new Map(subjects.map(s => [s.id, s]));
  const eventTypeMap = new Map(template.eventTypes.map(et => [et.id, et]));

  const headers = [
    'Event ID',
    'Subject ID',
    'Event Type',
    'Date/Time',
    'Performed By',
    'Notes',
    'Field Data',
  ];

  const rows = events.map(event => {
    const subject = subjectMap.get(event.subjectId);
    const eventType = eventTypeMap.get(event.eventTypeId);
    
    // Serialize field values
    const fieldData = JSON.stringify(event.fieldValues);

    return [
      event.id,
      subject?.subjectId || event.subjectId,
      eventType?.name || event.eventTypeId,
      event.datetime,
      event.performedBy || '',
      event.notes || '',
      fieldData,
    ];
  });

  return arrayToCSV(headers, rows);
}

export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================================
// Summary Statistics Export
// ============================================================================

export interface ExperimentSummary {
  experimentName: string;
  totalSubjects: number;
  activeSubjects: number;
  deceasedSubjects: number;
  totalEvents: number;
  eventsByType: Record<string, number>;
  dateRange: {
    start: string;
    end: string;
  };
}

export function generateExperimentSummary(
  experiment: Experiment,
  subjects: Subject[],
  events: Event[],
  template: ExperimentTemplate
): ExperimentSummary {
  const expSubjects = subjects.filter(s => s.experimentId === experiment.id);
  const expEvents = events.filter(e => e.experimentId === experiment.id);

  const eventsByType: Record<string, number> = {};
  for (const event of expEvents) {
    const eventType = template.eventTypes.find(et => et.id === event.eventTypeId);
    const typeName = eventType?.name || event.eventTypeId;
    eventsByType[typeName] = (eventsByType[typeName] || 0) + 1;
  }

  // Find date range
  const dates = expEvents.map(e => new Date(e.datetime).getTime()).filter(d => !isNaN(d));
  const startDate = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : experiment.startDate;
  const endDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : new Date().toISOString();

  return {
    experimentName: experiment.name,
    totalSubjects: expSubjects.length,
    activeSubjects: expSubjects.filter(s => s.status === 'active').length,
    deceasedSubjects: expSubjects.filter(s => s.status === 'deceased').length,
    totalEvents: expEvents.length,
    eventsByType,
    dateRange: {
      start: startDate,
      end: endDate,
    },
  };
}

export function exportSummaryToCSV(summaries: ExperimentSummary[]): string {
  const headers = [
    'Experiment',
    'Total Subjects',
    'Active',
    'Deceased',
    'Total Events',
    'Start Date',
    'End Date',
  ];

  const rows = summaries.map(summary => [
    summary.experimentName,
    summary.totalSubjects,
    summary.activeSubjects,
    summary.deceasedSubjects,
    summary.totalEvents,
    summary.dateRange.start,
    summary.dateRange.end,
  ]);

  return arrayToCSV(headers, rows);
}

// ============================================================================
// Batch Export
// ============================================================================

export interface BatchExportOptions {
  format: 'json' | 'csv';
  includeSubjects: boolean;
  includeEvents: boolean;
  includeSummary: boolean;
  experimentIds?: string[];
}

export async function batchExport(
  state: AppState,
  options: BatchExportOptions
): Promise<{ filename: string; data: string }[]> {
  const files: { filename: string; data: string }[] = [];
  const timestamp = new Date().toISOString().split('T')[0];

  if (options.format === 'json') {
    const jsonData = exportToJson(state, {
      experimentIds: options.experimentIds,
      includeTemplates: true,
    });
    files.push({
      filename: `invivo-export-${timestamp}.json`,
      data: jsonData,
    });
  } else {
    // CSV exports - one file per data type
    const experiments = options.experimentIds
      ? state.experiments.filter(e => options.experimentIds!.includes(e.id))
      : state.experiments;

    for (const experiment of experiments) {
      const template = state.templates.find(t => t.id === experiment.templateId);
      if (!template) continue;

      const expSubjects = state.subjects.filter(s => s.experimentId === experiment.id);
      const expEvents = state.events.filter(e => e.experimentId === experiment.id);
      const expHousingUnits = state.housingUnits.filter(h => h.experimentId === experiment.id);

      const safeExpName = experiment.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();

      if (options.includeSubjects) {
        const subjectsCSV = exportSubjectsToCSV(expSubjects, expHousingUnits, [experiment], template);
        files.push({
          filename: `${safeExpName}_subjects_${timestamp}.csv`,
          data: subjectsCSV,
        });
      }

      if (options.includeEvents) {
        const eventsCSV = exportEventsToCSV(expEvents, expSubjects, template);
        files.push({
          filename: `${safeExpName}_events_${timestamp}.csv`,
          data: eventsCSV,
        });
      }

      if (options.includeSummary) {
        const summary = generateExperimentSummary(experiment, expSubjects, expEvents, template);
        const summaryCSV = exportSummaryToCSV([summary]);
        files.push({
          filename: `${safeExpName}_summary_${timestamp}.csv`,
          data: summaryCSV,
        });
      }
    }
  }

  return files;
}

// ============================================================================
// Download Multiple Files
// ============================================================================

export function downloadMultipleFiles(files: { filename: string; data: string }[]): void {
  files.forEach((file, index) => {
    setTimeout(() => {
      if (file.filename.endsWith('.json')) {
        downloadJson(file.data, file.filename);
      } else {
        downloadCSV(file.data, file.filename);
      }
    }, index * 100); // Stagger downloads slightly
  });
}

// ============================================================================
// Import from JSON
// ============================================================================

export interface ImportValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data?: JsonExportData;
}

export function validateImportData(jsonString: string): ImportValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  let data: any;
  try {
    data = JSON.parse(jsonString);
  } catch (e) {
    return {
      valid: false,
      errors: ['Invalid JSON format'],
      warnings: [],
    };
  }

  // Check required fields
  if (!data.version) {
    warnings.push('No version information found');
  }

  if (!Array.isArray(data.experiments)) {
    errors.push('Missing or invalid experiments array');
  }

  if (!Array.isArray(data.subjects)) {
    errors.push('Missing or invalid subjects array');
  }

  if (!Array.isArray(data.events)) {
    errors.push('Missing or invalid events array');
  }

  if (!Array.isArray(data.housingUnits)) {
    errors.push('Missing or invalid housingUnits array');
  }

  // Check for ID conflicts (would need access to current state)
  // This is a simplified check
  const experimentIds = new Set(data.experiments?.map((e: any) => e.id) || []);
  if (experimentIds.size !== data.experiments?.length) {
    warnings.push('Duplicate experiment IDs detected');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    data: errors.length === 0 ? data : undefined,
  };
}

// Made with Bob
