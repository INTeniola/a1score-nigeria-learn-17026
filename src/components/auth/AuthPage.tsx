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
      <div className="w-full max-w-sm md:max-w-md space-y-4 md:space-y-6">
        {/* Back to Home Link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors group min-h-11"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </button>

        <Card className="w-full">
        <CardHeader className="text-center space-y-3 md:space-y-4 p-4 md:p-6">
          {/* Clickable Logo */}
          <div 
            className="flex justify-center cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
          >
            <img 
              src="/lovable-uploads/cd2e80a3-ae02-4d77-b4b6-84f985045e4e.png" 
              alt="A1Score Logo" 
              className="h-12 md:h-16 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-xl md:text-2xl font-bold leading-relaxed">Welcome to A1Score</CardTitle>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">Join the student community platform</p>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-11 md:h-10">
              <TabsTrigger value="signin" className="text-sm md:text-base">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-sm md:text-base">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="text-sm md:text-base leading-relaxed">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signInData.email}
                    onChange={handleSignInChange}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'signin-email-error' : undefined}
                    className="h-12 md:h-10 text-base md:text-sm p-3 md:p-2"
                    required
                  />
                  {fieldErrors.email && (
                    <p id="signin-email-error" className="text-xs md:text-sm text-destructive mt-1 leading-relaxed">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="text-sm md:text-base leading-relaxed">Password</Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={signInData.password}
                      onChange={handleSignInChange}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'signin-password-error' : undefined}
                      className="h-12 md:h-10 text-base md:text-sm p-3 md:p-2 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent min-h-11 min-w-11"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {fieldErrors.password && (
                    <p id="signin-password-error" className="text-xs md:text-sm text-destructive mt-1 leading-relaxed">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full min-h-12 md:min-h-11 text-base md:text-sm" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 md:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signup-displayName" className="text-sm md:text-base leading-relaxed">Full Name</Label>
                  <Input
                    id="signup-displayName"
                    type="text"
                    placeholder="Enter your full name"
                    value={signUpData.displayName}
                    onChange={handleSignUpChange}
                    className="h-12 md:h-10 text-base md:text-sm p-3 md:p-2"
                    required
                  />
                  {fieldErrors.displayName && (
                    <p className="text-xs md:text-sm text-destructive mt-1 leading-relaxed">
                      {fieldErrors.displayName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm md:text-base leading-relaxed">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}
                    className="h-12 md:h-10 text-base md:text-sm p-3 md:p-2"
                    required
                  />
                  {fieldErrors.email && (
                    <p id="signup-email-error" className="text-xs md:text-sm text-destructive mt-1 leading-relaxed">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signup-password" className="text-sm md:text-base leading-relaxed">Password</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleGeneratePassword}
                      className="h-auto py-1 px-2 text-[10px] md:text-xs min-h-8"
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
                      className="h-12 md:h-10 text-base md:text-sm p-3 md:p-2 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent min-h-11 min-w-11"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {/* Password Requirements */}
                  <div className="space-y-1 text-[10px] md:text-xs">
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
                      <div className="flex items-center justify-between text-[10px] md:text-xs">
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
                    <p id="signup-password-error" className="text-xs md:text-sm text-destructive mt-1 leading-relaxed">
                      {fieldErrors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirmPassword" className="text-sm md:text-base leading-relaxed">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={signUpData.confirmPassword}
                      onChange={handleSignUpChange}
                      aria-invalid={!!fieldErrors.confirmPassword}
                      aria-describedby={fieldErrors.confirmPassword ? 'signup-confirm-error' : undefined}
                      className="h-12 md:h-10 text-base md:text-sm p-3 md:p-2 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent min-h-11 min-w-11"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p id="signup-confirm-error" className="text-xs md:text-sm text-destructive mt-1 leading-relaxed">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                  {signUpData.confirmPassword && signUpData.password === signUpData.confirmPassword && (
                    <p className="text-xs md:text-sm text-green-600 flex items-center gap-1 leading-relaxed">
                      <Check className="h-3 w-3" />
                      Passwords match
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full min-h-12 md:min-h-11 text-base md:text-sm" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
                <p className="text-xs md:text-sm text-center text-muted-foreground leading-relaxed">
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
            className="w-full mt-4 min-h-12 md:min-h-11 text-base md:text-sm" 
            onClick={handleGuestSignIn}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Continue as Guest
          </Button>

          {error && (
            <Alert className="mt-4 border-destructive">
              <AlertDescription className="text-xs md:text-sm text-destructive leading-relaxed">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mt-4 border-green-500">
              <AlertDescription className="text-xs md:text-sm text-green-700 leading-relaxed">{success}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AuthPage;