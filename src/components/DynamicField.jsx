/**
 * Dynamic Field Renderer
 * Renders any field type based on FieldDefinition
 * Supports all field types with validation
 *
 * NOTE: Uses MUI v9 `slotProps` API (InputProps / InputLabelProps / inputProps
 * were removed in v9 and would otherwise leak onto the DOM).
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

  const helpText = error || field.helpText || field.description;

  // Props valid on a MUI TextField
  const textFieldProps = {
    disabled,
    error: Boolean(error),
    helperText: helpText,
    fullWidth: true,
  };

  // Props valid on a MUI FormControl (no helperText/placeholder)
  const formControlProps = {
    disabled,
    error: Boolean(error),
    fullWidth: true,
    required: field.required,
  };

  const unitAdornment = field.unit
    ? { endAdornment: <Box sx={{ ml: 1, color: 'text.secondary' }}>{field.unit}</Box> }
    : undefined;

  // Render based on field type
  switch (field.type) {
    case 'text':
    case 'email':
    case 'url':
      return (
        <TextField
          {...textFieldProps}
          label={field.label}
          type={field.type}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          slotProps={{ input: unitAdornment }}
        />
      );

    case 'textarea':
      return (
        <TextField
          {...textFieldProps}
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
          {...textFieldProps}
          label={field.label}
          type="number"
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? null : parseFloat(e.target.value);
            handleChange(val);
          }}
          placeholder={field.placeholder}
          required={field.required}
          slotProps={{
            htmlInput: {
              min: field.validation?.min,
              max: field.validation?.max,
              step: 'any'
            },
            input: unitAdornment
          }}
        />
      );

    case 'date':
      return (
        <TextField
          {...textFieldProps}
          label={field.label}
          type="date"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );

    case 'datetime':
      return (
        <TextField
          {...textFieldProps}
          label={field.label}
          type="datetime-local"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );

    case 'time':
      return (
        <TextField
          {...textFieldProps}
          label={field.label}
          type="time"
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          required={field.required}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      );

    case 'select':
      return (
        <FormControl {...formControlProps}>
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
          {helpText && (
            <FormHelperText error={Boolean(error)}>
              {helpText}
            </FormHelperText>
          )}
        </FormControl>
      );

    case 'multiselect':
      return (
        <FormControl {...formControlProps}>
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
          {helpText && (
            <FormHelperText error={Boolean(error)}>
              {helpText}
            </FormHelperText>
          )}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControl {...formControlProps}>
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
          {helpText && (
            <FormHelperText error={Boolean(error)}>
              {helpText}
            </FormHelperText>
          )}
        </FormControl>
      );

    default:
      return (
        <TextField
          {...textFieldProps}
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
