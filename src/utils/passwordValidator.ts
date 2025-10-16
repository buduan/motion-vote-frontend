/**
 * Password validation utilities matching backend requirements
 * Backend requirements from backend/src/schemas/user.py:
 * - Register: min_length=8, must contain letters and numbers
 * - Forgot Password: min_length=6
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate password for registration (strict requirements)
 * Requirements: 8+ characters, contains letters and numbers
 */
export function validateRegisterPassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, warnings };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Password must contain at least one letter (a-z or A-Z)');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Warnings for better security
  if (!/[A-Z]/.test(password)) {
    warnings.push('Password should contain uppercase letters for better security');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    warnings.push('Password should contain special characters for better security');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate password for password reset (relaxed requirements)
 * Requirements: 6+ characters
 */
export function validateResetPassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors, warnings };
  }

  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Recommendations for better security
  if (password.length < 8) {
    warnings.push('Consider using a password with at least 8 characters');
  }

  if (!/[a-zA-Z]/.test(password)) {
    warnings.push('Password should contain letters for better security');
  }

  if (!/[0-9]/.test(password)) {
    warnings.push('Password should contain numbers for better security');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get password strength indicator (0-5)
 * 0: Very weak, 5: Very strong
 */
export function getPasswordStrength(password: string): number {
  if (!password) return 0;

  let strength = 0;

  // Length
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (hasLower) strength++;
  if (hasUpper && hasNumber) strength++;
  if (hasSpecial) strength++;

  return Math.min(strength, 5);
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(strength: number): string {
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  return labels[strength] || 'Very Weak';
}

/**
 * Get password strength color (for UI)
 */
export function getPasswordStrengthColor(strength: number): string {
  const colors = ['error', 'warning', 'warning', 'info', 'success', 'success'];
  return colors[strength] || 'error';
}
