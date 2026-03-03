import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Custom validator to prevent past due dates
 * Returns error 'pastDue' if the date is in the past
 */
export function noPastDueValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    // Allow empty values - required validation handles that separately
    if (!value) {
      return null;
    }

    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { pastDue: true };
    }

    return null;
  };
}

/**
 * Custom validator for minimum length on title
 */
export function minLengthValidator(minLength: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value || typeof value !== 'string') {
      return null;
    }

    if (value.length < minLength) {
      return { minLength: { requiredLength: minLength, actualLength: value.length } };
    }

    return null;
  };
}

/**
 * Custom validator for title - must not be empty and at least 3 characters
 */
export function taskTitleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value || typeof value !== 'string') {
      return { required: true };
    }

    const trimmedValue = value.trim();
    
    if (trimmedValue.length === 0) {
      return { required: true };
    }

    if (trimmedValue.length < 3) {
      return { minLength: { requiredLength: 3, actualLength: trimmedValue.length } };
    }

    return null;
  };
}
