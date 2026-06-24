/**
 * Template Builder - Create custom templates through UI
 * Allows users to define their own species, fields, event types, and protocols
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
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { TemplateBuilder as TB, FieldBuilders } from '../core/schema/templateBuilder';

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'textarea', label: 'Long Text' }
];

export default function TemplateBuilderDialog({ open, onClose, onSave }) {
  const [activeStep, setActiveStep] = useState(0);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  // Species config
  const [speciesName, setSpeciesName] = useState('');
  const [speciesPlural, setSpeciesPlural] = useState('');
  const [speciesIcon, setSpeciesIcon] = useState('🔬');
  
  // Housing config
  const [housingName, setHousingName] = useState('');
  const [housingPlural, setHousingPlural] = useState('');
  const [housingCapacity, setHousingCapacity] = useState(5);
  
  // Subject fields
  const [subjectFields, setSubjectFields] = useState([
    { id: 'id', name: 'id', label: 'ID', type: 'text', required: true }
  ]);
  
  // Event types
  const [eventTypes, setEventTypes] = useState([]);
  
  // Protocols
  const [protocols, setProtocols] = useState([]);

  const steps = [
    'Basic Info',
    'Species & Housing',
    'Subject Fields',
    'Event Types',
    'Protocols',
    'Review'
  ];

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleAddSubjectField = () => {
    setSubjectFields([
      ...subjectFields,
      { id: `field${Date.now()}`, name: '', label: '', type: 'text', required: false }
    ]);
  };

  const handleUpdateSubjectField = (index, updates) => {
    const newFields = [...subjectFields];
    newFields[index] = { ...newFields[index], ...updates };
    setSubjectFields(newFields);
  };

  const handleRemoveSubjectField = (index) => {
    setSubjectFields(subjectFields.filter((_, i) => i !== index));
  };

  const handleAddEventType = () => {
    setEventTypes([
      ...eventTypes,
      {
        id: `event${Date.now()}`,
        name: '',
        category: 'custom',
        fields: [],
        allowTrials: false
      }
    ]);
  };

  const handleUpdateEventType = (index, updates) => {
    const newTypes = [...eventTypes];
    newTypes[index] = { ...newTypes[index], ...updates };
    setEventTypes(newTypes);
  };

  const handleRemoveEventType = (index) => {
    setEventTypes(eventTypes.filter((_, i) => i !== index));
  };

  const handleAddEventField = (eventIndex) => {
    const newTypes = [...eventTypes];
    newTypes[eventIndex].fields.push({
      id: `field${Date.now()}`,
      name: '',
      label: '',
      type: 'text',
      required: false
    });
    setEventTypes(newTypes);
  };

  const handleSaveTemplate = () => {
    try {
      const builder = new TB(templateName, templateDescription);
      
      // Set species
      builder.setSpecies({
        name: speciesName,
        pluralName: speciesPlural,
        icon: speciesIcon,
        ageUnits: 'days',
        weightUnit: 'g'
      });
      
      // Add subject fields
      subjectFields.forEach(field => {
        if (field.name && field.label) {
          builder.addSubjectField({
            name: field.name,
            label: field.label,
            type: field.type,
            required: field.required
          });
        }
      });
      
      // Set housing
      builder.setHousingUnit({
        name: housingName,
        pluralName: housingPlural,
        defaultCapacity: housingCapacity
      });
      
      // Add event types
      eventTypes.forEach(event => {
        if (event.name) {
          builder.addEventType({
            name: event.name,
            category: event.category,
            allowTrials: event.allowTrials,
            fields: event.fields.filter(f => f.name && f.label)
          });
        }
      });
      
      // Add protocols
      protocols.forEach(protocol => {
        if (protocol.name) {
          builder.addProtocol({
            name: protocol.name,
            description: protocol.description || '',
            timeline: protocol.timeline || []
          });
        }
      });
      
      const template = builder.build();
      // Mark as custom template
      template.isCustom = true;
      template.id = `custom-${Date.now()}`;
      onSave(template);
      onClose();
    } catch (error) {
      alert('Error creating template: ' + error.message);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Basic Info
        return (
          <Stack spacing={2}>
            <Alert severity="info">
              Create a custom template for your specific research needs. This template will be saved and reusable.
            </Alert>
            <TextField
              label="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
              fullWidth
              placeholder="e.g., My Custom Study"
            />
            <TextField
              label="Description"
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Describe what this template is for..."
            />
          </Stack>
        );

      case 1: // Species & Housing
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>Species Configuration</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Species Name (singular)"
                  value={speciesName}
                  onChange={(e) => setSpeciesName(e.target.value)}
                  required
                  placeholder="e.g., Mouse, Fish, Fly"
                />
                <TextField
                  label="Species Name (plural)"
                  value={speciesPlural}
                  onChange={(e) => setSpeciesPlural(e.target.value)}
                  required
                  placeholder="e.g., Mice, Fish, Flies"
                />
                <TextField
                  label="Icon (emoji)"
                  value={speciesIcon}
                  onChange={(e) => setSpeciesIcon(e.target.value)}
                  placeholder="🔬"
                  helperText="Choose an emoji to represent this species"
                />
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>Housing Configuration</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Housing Unit Name (singular)"
                  value={housingName}
                  onChange={(e) => setHousingName(e.target.value)}
                  required
                  placeholder="e.g., Cage, Tank, Vial"
                />
                <TextField
                  label="Housing Unit Name (plural)"
                  value={housingPlural}
                  onChange={(e) => setHousingPlural(e.target.value)}
                  required
                  placeholder="e.g., Cages, Tanks, Vials"
                />
                <TextField
                  label="Default Capacity"
                  type="number"
                  value={housingCapacity}
                  onChange={(e) => setHousingCapacity(parseInt(e.target.value))}
                  required
                  helperText="How many subjects per housing unit?"
                />
              </Stack>
            </Box>
          </Stack>
        );

      case 2: // Subject Fields
        return (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" gutterBottom>Subject Fields</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Define what information you want to track for each subject
              </Typography>
            </Box>

            <List>
              {subjectFields.map((field, index) => (
                <ListItem key={field.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                  <Stack spacing={1} sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1}>
                      <TextField
                        label="Field Name"
                        value={field.name}
                        onChange={(e) => handleUpdateSubjectField(index, { name: e.target.value })}
                        size="small"
                        sx={{ flex: 1 }}
                        placeholder="e.g., genotype"
                      />
                      <TextField
                        label="Label"
                        value={field.label}
                        onChange={(e) => handleUpdateSubjectField(index, { label: e.target.value })}
                        size="small"
                        sx={{ flex: 1 }}
                        placeholder="e.g., Genotype"
                      />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={field.type}
                          onChange={(e) => handleUpdateSubjectField(index, { type: e.target.value })}
                          label="Type"
                        >
                          {FIELD_TYPES.map(t => (
                            <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <IconButton onClick={() => handleRemoveSubjectField(index)} disabled={index === 0}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </ListItem>
              ))}
            </List>

            <Button startIcon={<AddIcon />} onClick={handleAddSubjectField} variant="outlined">
              Add Field
            </Button>
          </Stack>
        );

      case 3: // Event Types
        return (
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" gutterBottom>Event Types</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Define what actions or observations can be recorded
              </Typography>
            </Box>

            {eventTypes.length === 0 ? (
              <Alert severity="info">
                No event types yet. Add event types like "Injection", "Weight Measurement", "Behavioral Test", etc.
              </Alert>
            ) : (
              <List>
                {eventTypes.map((event, index) => (
                  <ListItem key={event.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 2, flexDirection: 'column', alignItems: 'stretch' }}>
                    <Stack spacing={1} sx={{ width: '100%' }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <TextField
                          label="Event Name"
                          value={event.name}
                          onChange={(e) => handleUpdateEventType(index, { name: e.target.value })}
                          size="small"
                          sx={{ flex: 1 }}
                          placeholder="e.g., Drug Injection"
                        />
                        <IconButton onClick={() => handleRemoveEventType(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                      
                      <Typography variant="caption" color="text.secondary">
                        Fields for this event: {event.fields.length}
                      </Typography>
                      
                      <Button 
                        size="small" 
                        onClick={() => handleAddEventField(index)}
                        startIcon={<AddIcon />}
                      >
                        Add Field to Event
                      </Button>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}

            <Button startIcon={<AddIcon />} onClick={handleAddEventType} variant="outlined">
              Add Event Type
            </Button>
          </Stack>
        );

      case 4: // Protocols
        return (
          <Stack spacing={2}>
            <Alert severity="info">
              Protocols define schedules and timelines. You can add these later through the template builder API.
            </Alert>
            <Typography variant="body2" color="text.secondary">
              For now, you can add protocols programmatically or skip this step.
            </Typography>
          </Stack>
        );

      case 5: // Review
        return (
          <Stack spacing={2}>
            <Alert severity="success">
              Review your template before saving
            </Alert>
            
            <Box>
              <Typography variant="h6">{templateName}</Typography>
              <Typography variant="body2" color="text.secondary">{templateDescription}</Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2">Species: {speciesIcon} {speciesName} ({speciesPlural})</Typography>
              <Typography variant="subtitle2">Housing: {housingName} ({housingPlural}) - Capacity: {housingCapacity}</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2">Subject Fields: {subjectFields.length}</Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                {subjectFields.map(f => (
                  <Chip key={f.id} label={f.label || f.name} size="small" />
                ))}
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2">Event Types: {eventTypes.length}</Typography>
              <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap" }}>
                {eventTypes.map(e => (
                  <Chip key={e.id} label={e.name} size="small" color="primary" />
                ))}
              </Stack>
            </Box>
          </Stack>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Custom Template</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flex: 1 }} />
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleSaveTemplate}
            disabled={!templateName || !speciesName || !housingName}
          >
            Create Template
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Made with Bob
