/**
 * Enhanced Export Component
 * Supports multiple formats (JSON, CSV) with advanced options
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Stack,
  Typography,
  Alert,
  Box,
  Chip,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { 
  exportToJson, 
  downloadJson, 
  downloadCSV,
  batchExport,
  downloadMultipleFiles,
  exportSubjectsToCSV,
  exportEventsToCSV,
  exportSummaryToCSV,
  generateExperimentSummary
} from '../core/export/exportUtils';

export default function EnhancedExport({ 
  open, 
  onClose, 
  state,
  experiments = [],
  templates = []
}) {
  const [format, setFormat] = useState('json');
  const [includeSubjects, setIncludeSubjects] = useState(true);
  const [includeEvents, setIncludeEvents] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeTemplates, setIncludeTemplates] = useState(false);
  const [selectedExperiments, setSelectedExperiments] = useState([]);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const timestamp = new Date().toISOString().split('T')[0];

      if (format === 'json') {
        // JSON export
        const jsonData = exportToJson(state, {
          includeTemplates,
          experimentIds: selectedExperiments.length > 0 ? selectedExperiments : undefined
        });
        downloadJson(jsonData, `invivo-export-${timestamp}.json`);
      } else {
        // CSV batch export
        const files = await batchExport(state, {
          format: 'csv',
          includeSubjects,
          includeEvents,
          includeSummary,
          experimentIds: selectedExperiments.length > 0 ? selectedExperiments : undefined
        });
        downloadMultipleFiles(files);
      }

      // Show success message
      setTimeout(() => {
        onClose();
        setExporting(false);
      }, 500);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed: ' + error.message);
      setExporting(false);
    }
  };

  const toggleExperiment = (expId) => {
    setSelectedExperiments(prev => 
      prev.includes(expId) 
        ? prev.filter(id => id !== expId)
        : [...prev, expId]
    );
  };

  const selectAllExperiments = () => {
    setSelectedExperiments(experiments.map(e => e.id));
  };

  const clearSelection = () => {
    setSelectedExperiments([]);
  };

  const estimatedFiles = format === 'csv' 
    ? (includeSubjects ? 1 : 0) + (includeEvents ? 1 : 0) + (includeSummary ? 1 : 0)
    : 1;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Export Data</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Format Selection */}
          <FormControl>
            <FormLabel>Export Format</FormLabel>
            <RadioGroup value={format} onChange={(e) => setFormat(e.target.value)}>
              <FormControlLabel 
                value="json" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body2">JSON</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Complete data with full structure (recommended for backup)
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="csv" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body2">CSV</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tabular format for analysis in Excel, R, Python
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          <Divider />

          {/* JSON Options */}
          {format === 'json' && (
            <FormControl>
              <FormLabel>Include</FormLabel>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={includeTemplates}
                    onChange={(e) => setIncludeTemplates(e.target.checked)}
                  />
                }
                label="Templates (for sharing with colleagues)"
              />
            </FormControl>
          )}

          {/* CSV Options */}
          {format === 'csv' && (
            <FormControl>
              <FormLabel>Export Data Types</FormLabel>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={includeSubjects}
                    onChange={(e) => setIncludeSubjects(e.target.checked)}
                  />
                }
                label="Subjects"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={includeEvents}
                    onChange={(e) => setIncludeEvents(e.target.checked)}
                  />
                }
                label="Events"
              />
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={includeSummary}
                    onChange={(e) => setIncludeSummary(e.target.checked)}
                  />
                }
                label="Summary Statistics"
              />
            </FormControl>
          )}

          <Divider />

          {/* Experiment Selection */}
          {experiments.length > 0 && (
            <FormControl>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <FormLabel>Experiments</FormLabel>
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={selectAllExperiments}>
                    Select All
                  </Button>
                  <Button size="small" onClick={clearSelection}>
                    Clear
                  </Button>
                </Stack>
              </Stack>
              
              {selectedExperiments.length === 0 && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  No experiments selected - will export all data
                </Alert>
              )}

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {experiments.map(exp => (
                  <Chip
                    key={exp.id}
                    label={exp.name}
                    onClick={() => toggleExperiment(exp.id)}
                    color={selectedExperiments.includes(exp.id) ? 'primary' : 'default'}
                    variant={selectedExperiments.includes(exp.id) ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            </FormControl>
          )}

          {/* Export Info */}
          <Alert severity="info">
            <Typography variant="body2">
              {format === 'json' 
                ? 'Will download 1 JSON file with complete data'
                : `Will download ${estimatedFiles} CSV file(s)`
              }
            </Typography>
            {selectedExperiments.length > 0 && (
              <Typography variant="caption">
                Exporting {selectedExperiments.length} experiment(s)
              </Typography>
            )}
          </Alert>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={exporting}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={exporting || (format === 'csv' && !includeSubjects && !includeEvents && !includeSummary)}
        >
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
