import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { EthicsProvider } from '@/contexts/EthicsContext';
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { BackToTop } from "@/components/layout/BackToTop";
import { OnboardingWrapper } from "@/components/onboarding/OnboardingWrapper";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAuth } from "./hooks/useAuth";
import { lazy, Suspense } from "react";
import { FullPageSkeleton } from "@/components/ui/loading-skeleton";

// Lazy load pages for better bundle splitting
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AuthPage = lazy(() => import("./components/auth/AuthPage"));
const UserTypeSelector = lazy(() => import("./components/auth/UserTypeSelector"));
const ForTeachers = lazy(() => import("./pages/ForTeachers"));
const ForParents = lazy(() => import("./pages/ForParents"));
const ForInstitutions = lazy(() => import("./pages/ForInstitutions"));
const JoinWaitlist = lazy(() => import("./pages/JoinWaitlist"));
const StayUpdated = lazy(() => import("./pages/StayUpdated"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <FullPageSkeleton />;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <>
      <OnboardingWrapper />
      {children}
    </>
  );
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <FullPageSkeleton />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EthicsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <BackToTop />
              <Suspense fallback={<FullPageSkeleton />}>
                <Routes>
                <Route path="/select-role" element={<UserTypeSelector />} />
                <Route path="/auth" element={
                  <PublicRoute>
                    <AuthPage />
                  </PublicRoute>
                } />
                <Route path="/" element={<Index />} />
                <Route path="/for-teachers" element={<ForTeachers />} />
                <Route path="/for-parents" element={<ForParents />} />
                <Route path="/for-institutions" element={<ForInstitutions />} />
                <Route path="/join-waitlist" element={<JoinWaitlist />} />
                <Route path="/stay-updated" element={<StayUpdated />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/student/formula-reference" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/student/progress-tracker" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/student/study-goals" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/student/study-timer" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </EthicsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
