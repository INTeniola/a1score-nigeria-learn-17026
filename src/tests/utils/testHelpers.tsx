import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EthicsProvider } from '@/contexts/EthicsContext';

// Create a fresh query client for each test
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

interface AllProvidersProps {
  children: React.ReactNode;
}

export const AllProviders = ({ children }: AllProvidersProps) => {
  const queryClient = createTestQueryClient();
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <EthicsProvider>
          {children}
        </EthicsProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
};

// Custom render function that includes all providers
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, { wrapper: AllProviders, ...options });
};

// Mock user data for tests
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
};

export const mockProfile = {
  id: 'profile-123',
  user_id: 'test-user-123',
  full_name: 'Test User',
  user_type: 'student',
  academic_level: 'SS',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Mock conversation data
export const mockConversation = {
  id: 'conv-123',
  user_id: 'test-user-123',
  session_id: 'session-123',
  role: 'user',
  content: 'What is photosynthesis?',
  tokens_used: 10,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock quiz data
export const mockQuiz = {
  id: 'quiz-123',
  title: 'Mathematics Quiz',
  description: 'Test your math skills',
  subject: 'Mathematics',
  difficulty: 'medium',
  is_published: true,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockQuizQuestion = {
  id: 'q-123',
  quiz_id: 'quiz-123',
  question_text: 'What is 2 + 2?',
  question_type: 'multiple_choice',
  options: ['2', '3', '4', '5'],
  correct_answer: '4',
  explanation: 'Basic addition',
  difficulty: 'easy',
};

// Helper to wait for async updates
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

export * from '@testing-library/react';
