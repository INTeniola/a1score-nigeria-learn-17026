import { useState, type FormEvent, type ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2, ArrowLeft, Key, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { validateEmail, validatePassword, validatePasswordMatch, generateStrongPassword, DEFAULT_PASSWORD_REQUIREMENTS } from "@/lib/auth-validation";
import type { SignInFormData, SignUpFormData, UserType } from "@/types/auth";
import { toast } from "sonner";

/**
 * Location state type for navigation
 */
interface LocationState {
  userType?: UserType;
  redirectTo?: string;
}

/**
 * Authentication page component
 * Handles sign in, sign up, and guest authentication
 */
const AuthPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  const locationState = location.state as LocationState | null;

  const [signInData, setSignInData] = useState<SignInFormData>({
    email: "",
    password: ""
  });

  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    userType: "student" // Default to student, can be changed later
  });

  /**
   * Handle sign in form submission
   */
  const handleSignIn = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    // Validate email
    const emailValidation = validateEmail(signInData.email);
    if (!emailValidation.isValid) {
      setFieldErrors({ email: emailValidation.error || 'Invalid email' });
      setIsLoading(false);
      return;
    }

    try {
      const { user, error } = await signIn(signInData);

      if (error) {
        setError(error.message);
      } else if (user) {
        // Get user type from profile or default to student
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .maybeSingle();
        
        const userType = profile?.user_type || user.user_metadata?.user_type || 'student';
        const redirectTo = locationState?.redirectTo || `/dashboard/${userType}`;
        navigate(redirectTo);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle sign up form submission
   */
  const handleSignUp = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setFieldErrors({});

    // Validate email
    const emailValidation = validateEmail(signUpData.email);
    if (!emailValidation.isValid) {
      setFieldErrors({ email: emailValidation.error || 'Invalid email' });
      setIsLoading(false);
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(signUpData.password);
    if (!passwordValidation.isValid) {
      setFieldErrors({ password: passwordValidation.errors[0] || 'Invalid password' });
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (!validatePasswordMatch(signUpData.password, signUpData.confirmPassword)) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    // Validate display name
    if (signUpData.displayName.trim().length < 2) {
      setFieldErrors({ displayName: "Display name must be at least 2 characters" });
      setIsLoading(false);
      return;
    }

    try {
      const { user, error, emailConfirmationRequired } = await signUp(signUpData);

      if (error) {
        setError(error.message);
      } else if (user) {
        if (emailConfirmationRequired) {
          setSuccess("Account created successfully! Check your email for the confirmation link.");
        } else {
          // User is automatically signed in
          const redirectTo = locationState?.redirectTo || `/dashboard/${signUpData.userType}`;
          navigate(redirectTo);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle guest sign in (anonymous authentication)
   */
  const handleGuestSignIn = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Create a profile for the guest user with the selected user type
        const userType = locationState?.userType || 'student';
        
        await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: `Guest ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
            user_type: userType
          });
        
        const redirectTo = locationState?.redirectTo || `/dashboard/${userType}`;
        navigate(redirectTo);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle input change for sign in form
   */
  const handleSignInChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    const field = id.replace('signin-', '') as keyof SignInFormData;
    setSignInData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Handle input change for sign up form
   */
  const handleSignUpChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { id, value } = e.target;
    const field = id.replace('signup-', '') as keyof SignUpFormData;
    setSignUpData(prev => ({ ...prev, [field]: value }));
    
    // Update password strength indicator
    if (field === 'password') {
      const validation = validatePassword(value);
      setPasswordStrength(validation.strength);
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Generate and fill a strong password
   */
  const handleGeneratePassword = (): void => {
    const newPassword = generateStrongPassword();
    setSignUpData(prev => ({ 
      ...prev, 
      password: newPassword,
      confirmPassword: newPassword 
    }));
    setPasswordStrength('strong');
    setShowPassword(true);
    setShowConfirmPassword(true);
    toast.success('Strong password generated!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Back to Home Link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>

        <Card className="w-full">
        <CardHeader className="text-center space-y-4">
          {/* Clickable Logo */}
          <div 
            className="flex justify-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <img 
              src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
              alt="A1Score Logo" 
              className="h-16 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to A1Score</CardTitle>
          <p className="text-muted-foreground">Join the student community platform</p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signInData.email}
                    onChange={handleSignInChange}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'signin-email-error' : undefined}
                    required
                  />
                  {fieldErrors.email && (
                    <p id="signin-email-error" className="text-sm text-destructive mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={handleSignInChange}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'signin-password-error' : undefined}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {fieldErrors.password && (
                    <p id="signin-password-error" className="text-sm text-destructive mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-displayName">Full Name</Label>
                  <Input
                    id="signup-displayName"
                    type="text"
                    placeholder="Enter your full name"
                    value={signUpData.displayName}
                    onChange={handleSignUpChange}
                    required
                  />
                  {fieldErrors.displayName && (
                    <p className="text-sm text-destructive mt-1">
                      {fieldErrors.displayName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
                    required
                  />
                  {fieldErrors.email && (
                    <p id="signup-email-error" className="text-sm text-destructive mt-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signup-password">Password</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGeneratePassword}
                      className="h-auto py-1 px-2 text-xs"
                    >
                      <Key className="h-3 w-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={signUpData.password}
                      onChange={handleSignUpChange}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-1 ${signUpData.password.length >= DEFAULT_PASSWORD_REQUIREMENTS.minLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {signUpData.password.length >= DEFAULT_PASSWORD_REQUIREMENTS.minLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>At least {DEFAULT_PASSWORD_REQUIREMENTS.minLength} characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(signUpData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {/[A-Z]/.test(signUpData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[a-z]/.test(signUpData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {/[a-z]/.test(signUpData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(signUpData.password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {/[0-9]/.test(signUpData.password) ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      <span>One number</span>
                    </div>
                  </div>
                  
                  {/* Password Strength */}
                  {signUpData.password && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Strength:</span>
                        <span className={`font-medium ${
                          passwordStrength === 'strong' ? 'text-green-600' :
                          passwordStrength === 'medium' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                        </span>
                      </div>
                      <div className="h-1 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${
                          passwordStrength === 'strong' ? 'w-full bg-green-600' :
                          passwordStrength === 'medium' ? 'w-2/3 bg-yellow-600' :
                          'w-1/3 bg-red-600'
                        }`} />
                      </div>
                    </div>
                  )}
                  
                  {fieldErrors.password && (
                    <p id="signup-password-error" className="text-sm text-destructive mt-1">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpChange}
                      aria-invalid={!!fieldErrors.confirmPassword}
                      aria-describedby={fieldErrors.confirmPassword ? 'signup-confirm-error' : undefined}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p id="signup-confirm-error" className="text-sm text-destructive mt-1">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                  {signUpData.confirmPassword && signUpData.password === signUpData.confirmPassword && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Passwords match
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  We'll personalize your experience in the next step
                </p>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={handleGuestSignIn}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue as Guest
          </Button>

          {error && (
            <Alert className="mt-4 border-destructive">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 border-green-500">
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AuthPage;