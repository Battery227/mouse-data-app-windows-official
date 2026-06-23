/**
 * Experiment Setup Wizard
 * 
 * Runs when creating a new experiment to configure:
 * - Basic experiment info
 * - Subject fields needed
 * - Event types to track
 * - Timeline/schedule
 * 
 * This replaces the generic "template" concept with per-experiment customization
 */

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Stack,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  Divider,
  FormHelperText
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Yes/No' },
  { value: 'textarea', label: 'Long Text' }
];

const EVENT_CATEGORIES = [
  { value: 'injection', label: 'Injection/Drug' },
  { value: 'test', label: 'Test/Assay' },
  { value: 'care', label: 'Care/Monitoring' },
  { value: 'death', label: 'Death/Endpoint' },
  { value: 'note', label: 'Note/Observation' }
];

export default function ExperimentSetupWizard({ open, onClose, onSave, editingExperiment = null }) {
  const [activeStep, setActiveStep] = useState(0);
  
  // Step 1: Basic Info
  const [experimentName, setExperimentName] = useState(editingExperiment?.name || '');
  const [experimentDescription, setExperimentDescription] = useState(editingExperiment?.description || '');
  const [speciesName, setSpeciesName] = useState(editingExperiment?.config?.speciesName || 'Subject');
  
  // Step 2: Cohorts & Groups (with per-group timelines)
  const [cohorts, setCohorts] = useState(editingExperiment?.config?.cohorts || [
    { id: 'cohort1', name: 'Cohort A', description: '', groups: [
      { id: 'g1', name: 'Group 1', description: '', timeline: [] }
    ]}
  ]);
  const [editingCohort, setEditingCohort] = useState(null);
  const [cohortDialogOpen, setCohortDialogOpen] = useState(false);
  const [editingGroupTimeline, setEditingGroupTimeline] = useState(null); // { cohortIdx, groupIdx }
  const [timelineDialogOpen, setTimelineDialogOpen] = useState(false);
  
  // Step 3: Subject Fields
  const [subjectFields, setSubjectFields] = useState(editingExperiment?.config?.subjectFields || [
    { id: 'id', name: 'id', label: 'ID', type: 'text', required: true, placeholder: 'e.g., M001, A1' }
  ]);
  const [editingField, setEditingField] = useState(null);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  
  // Step 4: Event Types
  const [eventTypes, setEventTypes] = useState(editingExperiment?.config?.eventTypes || []);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  
  // Timeline event being edited
  const [editingTimelineEvent, setEditingTimelineEvent] = useState(null);

  const steps = ['Basic Info', 'Cohorts & Groups', 'Subject Fields', 'Event Types'];

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return experimentName.trim().length > 0;
      case 1:
        return cohorts.length > 0 && cohorts.every(c => c.name && c.groups.length > 0);
      case 2:
        return subjectFields.length > 0 && subjectFields.every(f => f.label && f.name);
      case 3:
        return true; // Event types are optional
      default:
        return false;
    }
  };

  const getValidationMessage = () => {
    switch (activeStep) {
      case 0:
        if (!experimentName.trim()) return 'Experiment name is required';
        return '';
      case 1:
        if (cohorts.length === 0) return 'At least one cohort is required';
        if (!cohorts.every(c => c.groups.length > 0)) return 'Each cohort must have at least one group';
        return '';
      case 2:
        if (subjectFields.length === 0) return 'At least one subject field is required';
        if (!subjectFields.every(f => f.label && f.name)) return 'All fields must have a label and name';
        return '';
      default:
        return '';
    }
  };

  const handleNext = () => {
    if (!isStepValid()) {
      return; // Button will be disabled, no need for alert
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSave = () => {
    if (!experimentName.trim()) {
      alert('Experiment name is required');
      return;
    }

    const experimentConfig = {
      name: experimentName,
      description: experimentDescription,
      config: {
        speciesName,
        cohorts,
        subjectFields,
        eventTypes
      },
      createdAt: editingExperiment?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(experimentConfig);
    onClose();
  };

  // Field management
  const handleAddField = () => {
    setEditingField({ id: `field_${Date.now()}`, name: '', label: '', type: 'text', required: false });
    setFieldDialogOpen(true);
  };

  const handleEditField = (field) => {
    setEditingField({ ...field });
    setFieldDialogOpen(true);
  };

  const handleSaveField = () => {
    if (!editingField.label || !editingField.name) {
      alert('Field label and name are required');
      return;
    }

    if (subjectFields.find(f => f.id === editingField.id)) {
      setSubjectFields(subjectFields.map(f => f.id === editingField.id ? editingField : f));
    } else {
      setSubjectFields([...subjectFields, editingField]);
    }
    setFieldDialogOpen(false);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId) => {
    if (fieldId === 'id') {
      alert('Cannot delete the ID field');
      return;
    }
    setSubjectFields(subjectFields.filter(f => f.id !== fieldId));
  };

  // Event type management
  const handleAddEventType = () => {
    setEditingEvent({ id: `event_${Date.now()}`, category: 'test', name: '', description: '' });
    setEventDialogOpen(true);
  };

  const handleEditEventType = (event) => {
    setEditingEvent({ ...event });
    setEventDialogOpen(true);
  };

  const handleSaveEventType = () => {
    if (!editingEvent.name) {
      alert('Event name is required');
      return;
    }

    if (eventTypes.find(e => e.id === editingEvent.id)) {
      setEventTypes(eventTypes.map(e => e.id === editingEvent.id ? editingEvent : e));
    } else {
      setEventTypes([...eventTypes, editingEvent]);
    }
    setEventDialogOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEventType = (eventId) => {
    setEventTypes(eventTypes.filter(e => e.id !== eventId));
  };

  // Timeline management (per group)
  const handleOpenGroupTimeline = (cohortIdx, groupIdx) => {
    setEditingGroupTimeline({ cohortIdx, groupIdx });
    setTimelineDialogOpen(true);
  };

  const handleAddTimelineEvent = () => {
    setEditingTimelineEvent({ id: `tl_${Date.now()}`, day: 0, category: 'test', name: '', description: '' });
  };

  const handleEditTimelineEvent = (event) => {
    setEditingTimelineEvent({ ...event });
  };

  const handleSaveTimelineEvent = () => {
    if (!editingTimelineEvent.name || editingTimelineEvent.day === '') {
      alert('Day and event name are required');
      return;
    }

    const { cohortIdx, groupIdx } = editingGroupTimeline;
    const newCohorts = [...cohorts];
    const timeline = newCohorts[cohortIdx].groups[groupIdx].timeline || [];
    
    const eventIndex = timeline.findIndex(e => e.id === editingTimelineEvent.id);
    if (eventIndex >= 0) {
      timeline[eventIndex] = editingTimelineEvent;
    } else {
      timeline.push(editingTimelineEvent);
    }
    
    timeline.sort((a, b) => a.day - b.day);
    newCohorts[cohortIdx].groups[groupIdx].timeline = timeline;
    setCohorts(newCohorts);
    setEditingTimelineEvent(null);
  };

  const handleDeleteTimelineEvent = (eventId) => {
    const { cohortIdx, groupIdx } = editingGroupTimeline;
    const newCohorts = [...cohorts];
    newCohorts[cohortIdx].groups[groupIdx].timeline =
      (newCohorts[cohortIdx].groups[groupIdx].timeline || []).filter(e => e.id !== eventId);
    setCohorts(newCohorts);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingExperiment ? 'Edit Experiment Setup' : 'New Experiment Setup'}
        </DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ mt: 2, mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Basic Info */}
          {activeStep === 0 && (
            <Stack spacing={3}>
              <Alert severity="info">
                Set up your experiment. You can edit this later if things change.
              </Alert>

              <TextField
                label="Experiment Name"
                value={experimentName}
                onChange={(e) => setExperimentName(e.target.value)}
                required
                fullWidth
                placeholder="e.g., Alzheimer's Drug Study 2024"
                error={!experimentName.trim()}
                helperText={!experimentName.trim() ? 'Required' : ''}
              />

              <TextField
                label="Description"
                value={experimentDescription}
                onChange={(e) => setExperimentDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                placeholder="Brief description of your experiment..."
              />

              <TextField
                label="What are you studying?"
                value={speciesName}
                onChange={(e) => setSpeciesName(e.target.value)}
                fullWidth
                placeholder="e.g., Mice, Rats, Zebrafish, Flies, Cells"
                helperText="This will be used throughout the app (e.g., 'Add Mouse' or 'Add Zebrafish')"
              />
            </Stack>
          )}

          {/* Step 1: Cohorts & Groups */}
          {activeStep === 1 && (
            <Stack spacing={2}>
              <Alert severity="info">
                Define cohorts and groups for your experiment. Each cohort can have multiple groups with different treatments or timelines.
              </Alert>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  const newCohort = {
                    id: `cohort_${Date.now()}`,
                    name: `Cohort ${cohorts.length + 1}`,
                    description: '',
                    groups: [{ id: `g1_${Date.now()}`, name: 'Group 1', description: '' }]
                  };
                  setCohorts([...cohorts, newCohort]);
                }}
                fullWidth
              >
                Add Cohort
              </Button>

              <List>
                {cohorts.map((cohort, cohortIdx) => (
                  <ListItem
                    key={cohort.id}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2, flexDirection: 'column', alignItems: 'stretch' }}
                  >
                    <Stack spacing={1} sx={{ width: '100%' }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField
                          label="Cohort Name"
                          value={cohort.name}
                          onChange={(e) => {
                            const newCohorts = [...cohorts];
                            newCohorts[cohortIdx].name = e.target.value;
                            setCohorts(newCohorts);
                          }}
                          size="small"
                          sx={{ flex: 1 }}
                        />
                        <IconButton
                          onClick={() => setCohorts(cohorts.filter((_, i) => i !== cohortIdx))}
                          disabled={cohorts.length === 1}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                      
                      <TextField
                        label="Description"
                        value={cohort.description}
                        onChange={(e) => {
                          const newCohorts = [...cohorts];
                          newCohorts[cohortIdx].description = e.target.value;
                          setCohorts(newCohorts);
                        }}
                        size="small"
                        multiline
                        rows={2}
                        placeholder="e.g., Virus injection 21 days before drug"
                      />

                      <Divider />
                      <Typography variant="subtitle2">Groups in {cohort.name}:</Typography>
                      
                      {cohort.groups.map((group, groupIdx) => (
                        <Box key={group.id} sx={{ pl: 2, mb: 1 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TextField
                              label="Group Name"
                              value={group.name}
                              onChange={(e) => {
                                const newCohorts = [...cohorts];
                                newCohorts[cohortIdx].groups[groupIdx].name = e.target.value;
                                setCohorts(newCohorts);
                              }}
                              size="small"
                              sx={{ flex: 1 }}
                            />
                            <TextField
                              label="Description"
                              value={group.description}
                              onChange={(e) => {
                                const newCohorts = [...cohorts];
                                newCohorts[cohortIdx].groups[groupIdx].description = e.target.value;
                                setCohorts(newCohorts);
                              }}
                              size="small"
                              sx={{ flex: 2 }}
                              placeholder="e.g., Test at day 7"
                            />
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => handleOpenGroupTimeline(cohortIdx, groupIdx)}
                              sx={{ minWidth: 100 }}
                            >
                              Timeline ({group.timeline?.length || 0})
                            </Button>
                            <IconButton
                              onClick={() => {
                                const newCohorts = [...cohorts];
                                newCohorts[cohortIdx].groups = newCohorts[cohortIdx].groups.filter((_, i) => i !== groupIdx);
                                setCohorts(newCohorts);
                              }}
                              disabled={cohort.groups.length === 1}
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Box>
                      ))}
                      
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          const newCohorts = [...cohorts];
                          newCohorts[cohortIdx].groups.push({
                            id: `g${cohort.groups.length + 1}_${Date.now()}`,
                            name: `Group ${cohort.groups.length + 1}`,
                            description: '',
                            timeline: []
                          });
                          setCohorts(newCohorts);
                        }}
                        sx={{ alignSelf: 'flex-start', ml: 2 }}
                      >
                        Add Group to {cohort.name}
                      </Button>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </Stack>
          )}

          {/* Step 2: Subject Fields */}
          {activeStep === 2 && (
            <Stack spacing={2}>
              <Alert severity="info">
                Define what information you need to track for each {speciesName.toLowerCase() || 'subject'}.
              </Alert>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddField}
                fullWidth
              >
                Add Field
              </Button>

              <List>
                {subjectFields.map((field) => (
                  <ListItem
                    key={field.id}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
                  >
                    <ListItemText
                      primary={field.label}
                      secondary={`Type: ${field.type}${field.required ? ' (Required)' : ''}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleEditField(field)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        onClick={() => handleDeleteField(field.id)} 
                        size="small"
                        disabled={field.id === 'id'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {subjectFields.length === 0 && (
                <Typography color="text.secondary" align="center">
                  No fields defined. Click "Add Field" to start.
                </Typography>
              )}
            </Stack>
          )}

          {/* Step 3: Event Types */}
          {activeStep === 3 && (
            <Stack spacing={2}>
              <Alert severity="info">
                Define what types of events you'll track (optional). You can always add events later.
              </Alert>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddEventType}
                fullWidth
              >
                Add Event Type
              </Button>

              <List>
                {eventTypes.map((event) => (
                  <ListItem
                    key={event.id}
                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
                  >
                    <ListItemText
                      primary={event.name}
                      secondary={`Category: ${event.category}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton onClick={() => handleEditEventType(event)} size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteEventType(event.id)} size="small">
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>

              {eventTypes.length === 0 && (
                <Typography color="text.secondary" align="center">
                  No event types defined. You can add them later if needed.
                </Typography>
              )}
            </Stack>
          )}

        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          {activeStep > 0 && <Button onClick={handleBack}>Back</Button>}
          {activeStep < steps.length - 1 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!isStepValid() && getValidationMessage() && (
                <Typography variant="caption" color="error" sx={{ mr: 1 }}>
                  {getValidationMessage()}
                </Typography>
              )}
              <Button onClick={handleNext} variant="contained" disabled={!isStepValid()}>
                Next
              </Button>
            </Box>
          ) : (
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={!experimentName.trim()}
            >
              {editingExperiment ? 'Save Changes' : 'Create Experiment'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Field Edit Dialog */}
      <Dialog open={fieldDialogOpen} onClose={() => setFieldDialogOpen(false)}>
        <DialogTitle>{editingField?.id && subjectFields.find(f => f.id === editingField.id) ? 'Edit' : 'Add'} Field</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 400 }}>
            <TextField
              label="Field Label"
              value={editingField?.label || ''}
              onChange={(e) => setEditingField({ ...editingField, label: e.target.value, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
              required
              fullWidth
              placeholder="e.g., Genotype, Sex, Date of Birth"
            />

            <FormControl fullWidth>
              <InputLabel>Field Type</InputLabel>
              <Select
                value={editingField?.type || 'text'}
                onChange={(e) => setEditingField({ ...editingField, type: e.target.value })}
                label="Field Type"
              >
                {FIELD_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Placeholder"
              value={editingField?.placeholder || ''}
              onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
              fullWidth
              placeholder="e.g., WT, Het, Hom"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveField} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Event Type Edit Dialog */}
      <Dialog open={eventDialogOpen} onClose={() => setEventDialogOpen(false)}>
        <DialogTitle>{editingEvent?.id && eventTypes.find(e => e.id === editingEvent.id) ? 'Edit' : 'Add'} Event Type</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 400 }}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={editingEvent?.category || 'test'}
                onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
                label="Category"
              >
                {EVENT_CATEGORIES.map(cat => (
                  <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Event Name"
              value={editingEvent?.name || ''}
              onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
              required
              fullWidth
              placeholder="e.g., RotaRod Test, Drug A Injection"
            />

            <TextField
              label="Description"
              value={editingEvent?.description || ''}
              onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEventDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEventType} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Group Timeline Dialog */}
      <Dialog open={timelineDialogOpen} onClose={() => setTimelineDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingGroupTimeline && cohorts[editingGroupTimeline.cohortIdx]?.groups[editingGroupTimeline.groupIdx] &&
            `Timeline for ${cohorts[editingGroupTimeline.cohortIdx].groups[editingGroupTimeline.groupIdx].name}`
          }
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Define the timeline for this group. Each subject in this group will follow this schedule starting from their individual start date.
            </Alert>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddTimelineEvent}
              fullWidth
            >
              Add Timeline Event
            </Button>

            {editingGroupTimeline && (
              <List>
                {(cohorts[editingGroupTimeline.cohortIdx]?.groups[editingGroupTimeline.groupIdx]?.timeline || [])
                  .sort((a, b) => a.day - b.day)
                  .map((event) => (
                    <ListItem
                      key={event.id}
                      sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
                    >
                      <ListItemText
                        primary={`Day ${event.day}: ${event.name}`}
                        secondary={event.description || event.category}
                      />
                      <ListItemSecondaryAction>
                        <IconButton onClick={() => handleEditTimelineEvent(event)} size="small">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteTimelineEvent(event.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
              </List>
            )}

            {editingGroupTimeline &&
             (!cohorts[editingGroupTimeline.cohortIdx]?.groups[editingGroupTimeline.groupIdx]?.timeline?.length) && (
              <Typography color="text.secondary" align="center">
                No timeline events defined for this group yet.
              </Typography>
            )}

            {/* Inline event editor */}
            {editingTimelineEvent && (
              <Box sx={{ p: 2, border: '2px solid', borderColor: 'primary.main', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  {editingTimelineEvent.id.startsWith('tl_') ? 'New' : 'Edit'} Timeline Event
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Day"
                    type="number"
                    value={editingTimelineEvent.day ?? ''}
                    onChange={(e) => setEditingTimelineEvent({ ...editingTimelineEvent, day: parseInt(e.target.value) })}
                    required
                    fullWidth
                    helperText="Day number relative to subject start date (e.g., -7, 0, 7, 14, 21). Negative days = before start."
                  />

                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={editingTimelineEvent.category || 'test'}
                      onChange={(e) => setEditingTimelineEvent({ ...editingTimelineEvent, category: e.target.value })}
                      label="Category"
                    >
                      {EVENT_CATEGORIES.map(cat => (
                        <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="Event Name"
                    value={editingTimelineEvent.name || ''}
                    onChange={(e) => setEditingTimelineEvent({ ...editingTimelineEvent, name: e.target.value })}
                    required
                    fullWidth
                    placeholder="e.g., Drug Injection, Behavioral Testing"
                  />

                  <TextField
                    label="Description"
                    value={editingTimelineEvent.description || ''}
                    onChange={(e) => setEditingTimelineEvent({ ...editingTimelineEvent, description: e.target.value })}
                    multiline
                    rows={2}
                    fullWidth
                  />

                  <Stack direction="row" spacing={1}>
                    <Button onClick={handleSaveTimelineEvent} variant="contained" fullWidth>
                      Save Event
                    </Button>
                    <Button onClick={() => setEditingTimelineEvent(null)} variant="outlined" fullWidth>
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimelineDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Made with Bob
