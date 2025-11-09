export type OnboardingStep = 
  | 'welcome'
  | 'subjects'
  | 'exam_date'
  | 'learning_style'
  | 'explanation_preference'
  | 'first_action'
  | 'completed';

export interface OnboardingProgress {
  id: string;
  user_id: string;
  current_step: OnboardingStep;
  completed_steps: string[];
  session_count: number;
  learning_subjects?: string[];
  exam_date?: string;
  learning_style?: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  explanation_preference?: 'visual' | 'technical' | 'simple';
  has_uploaded_document: boolean;
  has_asked_question: boolean;
  notification_preferences_set: boolean;
  goals_set: boolean;
  onboarding_completed: boolean;
  last_session_at: string;
  created_at: string;
  updated_at: string;
}

export interface LearningStyleQuestion {
  id: string;
  question: string;
  options: {
    value: string;
    label: string;
    style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  }[];
}

export const LEARNING_STYLE_QUESTIONS: LearningStyleQuestion[] = [
  {
    id: '1',
    question: 'When learning something new, I prefer to:',
    options: [
      { value: 'diagrams', label: 'See diagrams and charts', style: 'visual' },
      { value: 'listen', label: 'Listen to explanations', style: 'auditory' },
      { value: 'practice', label: 'Try it hands-on', style: 'kinesthetic' },
      { value: 'read', label: 'Read detailed notes', style: 'reading' },
    ],
  },
  {
    id: '2',
    question: 'I remember things best when:',
    options: [
      { value: 'visualize', label: 'I can visualize them', style: 'visual' },
      { value: 'discuss', label: 'I discuss them', style: 'auditory' },
      { value: 'do', label: 'I do them myself', style: 'kinesthetic' },
      { value: 'write', label: 'I write them down', style: 'reading' },
    ],
  },
  {
    id: '3',
    question: 'In a study session, I:',
    options: [
      { value: 'highlights', label: 'Use color-coded highlights', style: 'visual' },
      { value: 'talk', label: 'Talk through concepts', style: 'auditory' },
      { value: 'models', label: 'Build models or examples', style: 'kinesthetic' },
      { value: 'summaries', label: 'Write summaries', style: 'reading' },
    ],
  },
];

export const POPULAR_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Economics',
  'Government',
  'Literature',
  'Geography',
  'History',
  'Computer Science',
  'Further Mathematics',
  'Agricultural Science',
  'Commerce',
  'Accounting',
  'French',
  'Yoruba',
  'Igbo',
  'Hausa',
  'Christian Religious Studies',
  'Islamic Studies',
  'Technical Drawing',
  'Home Economics',
];
