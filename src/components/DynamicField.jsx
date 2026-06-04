/**
 * Dynamic Field Renderer
 * Renders any field type based on FieldDefinition
 * Supports all field types with validation
 */

import React from 'react';
import {
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  Chip,
  Box,
  OutlinedInput
} from '@mui/material';

/**
 * Render a single field based on its definition
 */
export default function DynamicField({ 
  field, 
  value, 
  onChange, 
  error,
  disabled = false,
  allValues = {} // For conditional fields
}) {
  // Check if field should be visible (conditional logic)
  if (field.conditional) {
    const conditionValue = allValues[field.conditional.field];
    if (conditionValue !== field.conditional.value) {
      return null; // Hide field
    }
  }

  const handleChange = (newValue) => {
    onChange(field.id, newValue);
  };

  const commonProps = {
    disabled,
    error: Boolean(error),
    helperText: error || field.helpText || field.description,
    fullWidth: true,
  };

  // Render based on field type
  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <TextField
          {...commonProps}
          label={field.label}
          type={field.type}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          InputProps={{
            endAdornment: field.unit ? <Box sx={{ ml: 1, color: 'text.secondary' }}>{field.unit}</Box> : null
          }}
        />
      );

    case 'textarea':
      return (
        <TextField
          {...commonProps}
          label={field.label}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          multiline
          minRows={3}
          maxRows={8}
        />
      );

    case 'number':
      return (
        <TextField
          {...commonProps}
          label={field.label}
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? null : parseFloat(e.target.value);
            handleChange(val);
          }}
          placeholder={field.placeholder}
          required={field.required}
          inputProps={{
            min: field.validation?.min,
            max: field.validation?.max,
            step: 'any'
          }}
          InputProps={{
            endAdornment: field.unit ? <Box sx={{ ml: 1, color: 'text.secondary' }}>{field.unit}</Box> : null
          }}
        />
      );

    case 'date':
      return (
        <TextField
          {...commonProps}
          label={field.label}
          type="date"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'datetime':
      return (
        <TextField
          {...commonProps}
          label={field.label}
          type="datetime-local"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'time':
      return (
        <TextField
          {...commonProps}
          label={field.label}
          type="time"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'select':
      return (
        <FormControl {...commonProps} required={field.required}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            label={field.label}
          >
            {!field.required && <MenuItem value=""><em>None</em></MenuItem>}
            {(field.options || []).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error || field.helpText) && (
            <FormHelperText error={Boolean(error)}>
              {error || field.helpText}
            </FormHelperText>
          )}
        </FormControl>
      );

    case 'multiselect':
      return (
        <FormControl {...commonProps} required={field.required}>
          <InputLabel>{field.label}</InputLabel>
          <Select
            multiple
            value={value || []}
            onChange={(e) => handleChange(e.target.value)}
            input={<OutlinedInput label={field.label} />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val) => {
                  const option = field.options?.find(o => o.value === val);
                  return <Chip key={val} label={option?.label || val} size="small" />;
                })}
              </Box>
            )}
          >
            {(field.options || []).map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {(error || field.helpText) && (
            <FormHelperText error={Boolean(error)}>
              {error || field.helpText}
            </FormHelperText>
          )}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControl {...commonProps}>
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => handleChange(e.target.checked)}
                disabled={disabled}
              />
            }
            label={field.label}
          />
          {(error || field.helpText) && (
            <FormHelperText error={Boolean(error)}>
              {error || field.helpText}
            </FormHelperText>
          )}
        </FormControl>
      );

    default:
      return (
        <TextField
          {...commonProps}
          label={field.label}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          helperText={`Unsupported field type: ${field.type}`}
        />
      );
  }
}

/**
 * Render multiple fields as a form
 */
export function DynamicForm({ 
  fields, 
  values, 
  onChange, 
  errors = {},
  disabled = false 
}) {
  const handleFieldChange = (fieldId, value) => {
    onChange({ ...values, [fieldId]: value });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {fields.map((field) => (
        <DynamicField
          key={field.id}
          field={field}
          value={values[field.id]}
          onChange={handleFieldChange}
          error={errors[field.id]}
          disabled={disabled}
          allValues={values}
        />
      ))}
    </Box>
  );
}

// Made with Bob
