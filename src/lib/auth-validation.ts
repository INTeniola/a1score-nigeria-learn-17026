import { z } from 'zod';
import type { EmailValidationResult, PasswordValidationResult, PasswordRequirements } from '@/types/auth';

/**
 * Default password requirements
 */
export const DEFAULT_PASSWORD_REQUIREMENTS: PasswordRequirements = {
  minLength: 6,
  requireUppercase: false,
  requireLowercase: false,
  requireNumber: false,
  requireSpecialChar: false,
};

/**
 * Zod schema for email validation
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .toLowerCase()
  .trim();

/**
 * Zod schema for password validation
 */
export const passwordSchema = z
  .string()
  .min(DEFAULT_PASSWORD_REQUIREMENTS.minLength, `Password must be at least ${DEFAULT_PASSWORD_REQUIREMENTS.minLength} characters`);

/**
 * Zod schema for display name validation
 */
export const displayNameSchema = z
  .string()
  .min(2, 'Display name must be at least 2 characters')
  .max(50, 'Display name must be less than 50 characters')
  .trim();

/**
 * Zod schema for sign in form
 */
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Zod schema for sign up form
 */
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: displayNameSchema,
  userType: z.enum(['student', 'teacher', 'parent', 'admin']),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Validate email address
 */
export function validateEmail(email: string): EmailValidationResult {
  try {
    emailSchema.parse(email);
    return { isValid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        error: error.errors[0]?.message || 'Invalid email',
      };
    }
    return { isValid: false, error: 'Invalid email' };
  }
}

/**
 * Calculate password strength
 */
function calculatePasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

/**
 * Validate password with detailed feedback
 */
export function validatePassword(
  password: string,
  requirements: PasswordRequirements = DEFAULT_PASSWORD_REQUIREMENTS
): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < requirements.minLength) {
    errors.push(`Password must be at least ${requirements.minLength} characters`);
  }

  if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requirements.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requirements.requireSpecialChar && !/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  const strength = calculatePasswordStrength(password);

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .slice(0, 500); // Limit length
}

/**
 * Check if email domain is valid (basic check)
 */
export function isValidEmailDomain(email: string): boolean {
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  // Check for common typos in popular domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const suspiciousDomains = ['gmial.com', 'gmai.com', 'yahooo.com'];
  
  return !suspiciousDomains.includes(domain.toLowerCase());
}

/**
 * Validate confirm password matches password
 */
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && password.length > 0;
}
