import { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * User type that can access the platform
 */
export type UserType = 'student' | 'teacher' | 'parent' | 'admin';

/**
 * Authentication form data for sign in
 */
export interface SignInFormData {
  email: string;
  password: string;
}

/**
 * Authentication form data for sign up
 */
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  userType: UserType;
}

/**
 * User metadata stored in auth.users.raw_user_meta_data
 */
export interface UserMetadata {
  display_name?: string;
  user_type?: UserType;
  full_name?: string;
  avatar_url?: string;
}

/**
 * Authentication response type
 */
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Sign up response with email confirmation requirement
 */
export interface SignUpResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
  emailConfirmationRequired: boolean;
}

/**
 * User profile from the profiles table
 */
export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  user_type: UserType | null;
  academic_level: string | null;
  teaching_subject: string | null;
  institution: string | null;
  child_school: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Authentication context type
 */
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (data: SignInFormData) => Promise<AuthResponse>;
  signUp: (data: SignUpFormData) => Promise<SignUpResponse>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/**
 * Auth state change event types
 */
export type AuthChangeEvent =
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'USER_UPDATED'
  | 'PASSWORD_RECOVERY'
  | 'TOKEN_REFRESHED';

/**
 * Password validation requirements
 */
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

/**
 * Email validation result
 */
export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Password validation result
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Protected route props
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: UserType | UserType[];
  fallbackPath?: string;
}

/**
 * Auth modal props
 */
export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  redirectPath?: string;
  userType?: UserType;
}

/**
 * User type selector props
 */
export interface UserTypeSelectorProps {
  onSelect?: (userType: UserType) => void;
  onClose?: () => void;
  preselectedType?: UserType;
}

/**
 * User type configuration
 */
export interface UserTypeConfig {
  type: UserType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  features: string[];
}
