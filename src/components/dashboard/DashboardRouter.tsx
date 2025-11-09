import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StudentDashboard from "@/components/student/StudentDashboard";
import TeacherDashboard from "@/components/teacher/TeacherDashboard";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ParentDashboard from "@/components/parent/ParentDashboard";
import ProfileSetup from "@/components/profile/ProfileSetup";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/user";

type StudentUser = { type: 'student'; name: string; level?: string };
type TeacherUser = { type: 'teacher'; name: string };
type AdminUser = { type: 'admin'; name: string; institution: string };
type ParentUser = { type: 'parent'; name: string };

type User = StudentUser | TeacherUser | AdminUser | ParentUser;

const DashboardRouter = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // Fetch user profile when user is authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setProfileLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          if (!error && data) {
            setUserProfile(data);
          } else {
            // No profile found, create one from user metadata
            const userType = user.user_metadata?.user_type || 'student';
            const displayName = user.user_metadata?.display_name || user.email?.split('@')[0];
            
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                user_id: user.id,
                display_name: displayName,
                user_type: userType
              });
            
            if (!insertError) {
              setUserProfile({
                user_id: user.id,
                display_name: displayName,
                user_type: userType
              });
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      setUserProfile(null);
      // Clear all user-specific localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('onboarding-') || key.startsWith('profile-')) {
          localStorage.removeItem(key);
        }
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };


  const handleProfileSetupComplete = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profile.fullName,
          bio: profile.preferences?.privacy?.showProfile ? 'A1Score user' : null,
          school: profile.institution,
          user_type: profile.userType,
          ...profile
        });
      
      if (!error) {
        setShowProfileSetup(false);
        // Refetch profile to get updated data
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Show loading while fetching profile or if user exists but profile is null
  if (profileLoading || (user && !userProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Show dashboard based on user type or route
  if (user && userProfile) {
    const userType = userProfile.user_type || 'student';
    const userData = {
      type: userType,
      name: userProfile.display_name || user.email?.split('@')[0] || 'User',
      ...(userType === 'admin' && { institution: userProfile.school || 'Guest Institution' })
    };

    // Handle specific dashboard routes
    const dashboardType = location.pathname.split('/dashboard/')[1] || userType;

    let DashboardComponent;
    switch (dashboardType) {
      case 'student':
        DashboardComponent = <StudentDashboard user={userData as StudentUser} onLogout={handleLogout} />;
        break;
      case 'teacher':
        DashboardComponent = <TeacherDashboard user={userData as TeacherUser} onLogout={handleLogout} />;
        break;
      case 'admin':
        DashboardComponent = <AdminDashboard user={userData as AdminUser} onLogout={handleLogout} />;
        break;
      case 'parent':
        DashboardComponent = <ParentDashboard user={userData as ParentUser} onLogout={handleLogout} />;
        break;
      default:
        DashboardComponent = <StudentDashboard user={userData as StudentUser} onLogout={handleLogout} />;
    }

    return (
      <>
        {DashboardComponent}

        {/* Profile Setup */}
        {showProfileSetup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <ProfileSetup
                user={{
                  userType: (userProfile?.user_type as any) || 'student',
                  fullName: userProfile?.display_name || user.email?.split('@')[0] || '',
                }}
                onComplete={handleProfileSetupComplete}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback - should not reach here if auth is working properly
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p>Setting up your profile...</p>
      </div>
    </div>
  );
};

export default DashboardRouter;