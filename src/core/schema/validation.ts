/**
 * Validation utilities for the flexible schema system
 * Validates data against field definitions and templates
 */

import { FieldDefinition, FieldValidation, ValidationResult } from './types';

/**
 * Validate a single field value against its definition
 */
export function validateField(
  value: any,
  field: FieldDefinition
): { valid: boolean; error?: string } {
  // Check required
  if (field.required && (value === null || value === undefined || value === '')) {
    return { valid: false, error: `${field.label} is required` };
  }

  // If not required and empty, it's valid
  if (!field.required && (value === null || value === undefined || value === '')) {
    return { valid: true };
  }

  // Type-specific validation
  switch (field.type) {
    case 'number':
      return validateNumber(value, field);
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
      return validateText(value, field);
    case 'date':
    case 'datetime':
    case 'time':
      return validateDate(value, field);
    case 'select':
      return validateSelect(value, field);
    case 'multiselect':
      return validateMultiSelect(value, field);
    case 'checkbox':
      return validateCheckbox(value, field);
    default:
      return { valid: true };
  }
}

function validateNumber(value: any, field: FieldDefinition): { valid: boolean; error?: string } {
  const num = typeof value === 'number' ? value : parseFloat(value);
  
  if (isNaN(num)) {
    return { valid: false, error: `${field.label} must be a valid number` };
  }

  const validation = field.validation;
  if (validation) {
    if (validation.min !== undefined && num < validation.min) {
      return { valid: false, error: `${field.label} must be at least ${validation.min}` };
    }
    if (validation.max !== undefined && num > validation.max) {
      return { valid: false, error: `${field.label} must be at most ${validation.max}` };
    }
  }

  return { valid: true };
}

function validateText(value: any, field: FieldDefinition): { valid: boolean; error?: string } {
  const str = String(value);
  const validation = field.validation;

  if (validation) {
    if (validation.minLength !== undefined && str.length < validation.minLength) {
      return { valid: false, error: `${field.label} must be at least ${validation.minLength} characters` };
    }
    if (validation.maxLength !== undefined && str.length > validation.maxLength) {
      return { valid: false, error: `${field.label} must be at most ${validation.maxLength} characters` };
    }
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(str)) {
        return { valid: false, error: `${field.label} format is invalid` };
      }
    }
  }

  // Type-specific validation
  if (field.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(str)) {
      return { valid: false, error: `${field.label} must be a valid email address` };
    }
  }

  if (field.type === 'url') {
    try {
      new URL(str);
    } catch {
      return { valid: false, error: `${field.label} must be a valid URL` };
    }
  }

  return { valid: true };
}

function validateDate(value: any, field: FieldDefinition): { valid: boolean; error?: string } {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${field.label} must be a valid date` };
  }
  return { valid: true };
}

function validateSelect(value: any, field: FieldDefinition): { valid: boolean; error?: string } {
  if (!field.options || field.options.length === 0) {
    return { valid: true };
  }

  const validValues = field.options.map(opt => opt.value);
  if (!validValues.includes(value)) {
    return { valid: false, error: `${field.label} must be one of the available options` };
  }

  return { valid: true };
}

function validateMultiSelect(value: any, field: FieldDefinition): { valid: boolean; error?: string } {
  if (!Array.isArray(value)) {
    return { valid: false, error: `${field.label} must be an array` };
  }

  if (!field.options || field.options.length === 0) {
    return { valid: true };
  }

  const validValues = field.options.map(opt => opt.value);
  const invalidValues = value.filter(v => !validValues.includes(v));
  
  if (invalidValues.length > 0) {
    return { valid: false, error: `${field.label} contains invalid options` };
  }

  return { valid: true };
}

function validateCheckbox(value: any, field: FieldDefinition): { valid: boolean; error?: string } {
  if (typeof value !== 'boolean') {
    return { valid: false, error: `${field.label} must be true or false` };
  }
  return { valid: true };
}

/**
 * Validate multiple fields at once
 */
export function validateFields(
  values: Record<string, any>,
  fields: FieldDefinition[]
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  for (const field of fields) {
    // Check conditional fields
    if (field.conditional) {
      const conditionValue = values[field.conditional.field];
      if (conditionValue !== field.conditional.value) {
        continue; // Skip validation for hidden conditional fields
      }
    }

    const value = values[field.id];
    const result = validateField(value, field);
    
    if (!result.valid && result.error) {
      errors.push({ field: field.id, message: result.error });
    }

    // Custom validation function
    if (field.validation?.custom && value !== null && value !== undefined && value !== '') {
      const customResult = field.validation.custom(value);
      if (customResult !== true) {
        const errorMessage = typeof customResult === 'string' ? customResult : `${field.label} is invalid`;
        errors.push({ field: field.id, message: errorMessage });
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get default values for a set of fields
 */
export function getDefaultValues(fields: FieldDefinition[]): Record<string, any> {
  const defaults: Record<string, any> = {};
  
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      defaults[field.id] = field.defaultValue;
    } else {
      // Set type-appropriate defaults
      switch (field.type) {
        case 'checkbox':
          defaults[field.id] = false;
          break;
        case 'multiselect':
          defaults[field.id] = [];
          break;
        case 'number':
          defaults[field.id] = null;
          break;
        default:
          defaults[field.id] = '';
      }
    }
  }
  
  return defaults;
}

/**
 * Check if a field should be visible based on conditional logic
 */
export function isFieldVisible(
  field: FieldDefinition,
  values: Record<string, any>
): boolean {
  if (!field.conditional) {
    return true;
  }
  
  const conditionValue = values[field.conditional.field];
  return conditionValue === field.conditional.value;
}

/**
 * Filter fields to only show visible ones
 */
export function getVisibleFields(
  fields: FieldDefinition[],
  values: Record<string, any>
): FieldDefinition[] {
  return fields.filter(field => isFieldVisible(field, values));
}

/**
 * Sanitize field values (trim strings, parse numbers, etc.)
 */
export function sanitizeFieldValue(value: any, field: FieldDefinition): any {
  if (value === null || value === undefined) {
    return value;
  }

  switch (field.type) {
    case 'text':
    case 'textarea':
    case 'email':
    case 'url':
      return typeof value === 'string' ? value.trim() : String(value).trim();
    
    case 'number':
      const num = typeof value === 'number' ? value : parseFloat(value);
      return isNaN(num) ? null : num;
    
    case 'checkbox':
      return Boolean(value);
    
    case 'multiselect':
      return Array.isArray(value) ? value : [];
    
    default:
      return value;
  }
}

/**
 * Sanitize all field values in an object
 */
export function sanitizeFieldValues(
  values: Record<string, any>,
  fields: FieldDefinition[]
): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const field of fields) {
    if (values[field.id] !== undefined) {
      sanitized[field.id] = sanitizeFieldValue(values[field.id], field);
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize in one step
 */
export function validateAndSanitize(
  values: Record<string, any>,
  fields: FieldDefinition[]
): { valid: boolean; errors: Array<{ field: string; message: string }>; sanitized: Record<string, any> } {
  const sanitized = sanitizeFieldValues(values, fields);
  const validation = validateFields(sanitized, fields);
  
  return {
    valid: validation.valid,
    errors: validation.errors,
    sanitized
  };
}

// Made with Bob
