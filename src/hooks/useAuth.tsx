import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { 
  AuthContextType, 
  SignInFormData, 
  SignUpFormData, 
  AuthResponse, 
  SignUpResponse,
  UserProfile 
} from '@/types/auth';

/**
 * Internal auth context type with proper typing
 */
interface InternalAuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (data: SignInFormData) => Promise<AuthResponse>;
  signUp: (data: SignUpFormData) => Promise<SignUpResponse>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<InternalAuthContextType | undefined>(undefined);

/**
 * Hook to access authentication context
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = (): InternalAuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication provider component
 * Manages user authentication state and provides auth methods
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetch user profile from database
   */
  const fetchProfile = useCallback(async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data as UserProfile);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  }, []);

  /**
   * Refresh user profile data
   */
  const refreshProfile = useCallback(async (): Promise<void> => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Defer profile fetching to avoid blocking auth state changes
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /**
   * Sign in with email and password
   */
  const signIn = useCallback(async (data: SignInFormData): Promise<AuthResponse> => {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { user: null, session: null, error };
      }

      return {
        user: authData.user,
        session: authData.session,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
      };
    }
  }, []);

  /**
   * Sign up with email and password
   */
  const signUp = useCallback(async (data: SignUpFormData): Promise<SignUpResponse> => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard/${data.userType}`;

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: data.displayName,
            user_type: data.userType,
          },
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error,
          emailConfirmationRequired: false,
        };
      }

      // Check if email confirmation is required
      const emailConfirmationRequired = authData.session === null && authData.user !== null;

      return {
        user: authData.user,
        session: authData.session,
        error: null,
        emailConfirmationRequired,
      };
    } catch (error) {
      return {
        user: null,
        session: null,
        error: error as AuthError,
        emailConfirmationRequired: false,
      };
    }
  }, []);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setProfile(null);
  }, []);

  const value: InternalAuthContextType = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};