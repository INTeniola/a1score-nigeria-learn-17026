export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_response_cache: {
        Row: {
          created_at: string | null
          hit_count: number | null
          id: string
          last_accessed_at: string | null
          model: string
          query_hash: string
          query_text: string
          response_text: string
          tokens_used: number | null
        }
        Insert: {
          created_at?: string | null
          hit_count?: number | null
          id?: string
          last_accessed_at?: string | null
          model: string
          query_hash: string
          query_text: string
          response_text: string
          tokens_used?: number | null
        }
        Update: {
          created_at?: string | null
          hit_count?: number | null
          id?: string
          last_accessed_at?: string | null
          model?: string
          query_hash?: string
          query_text?: string
          response_text?: string
          tokens_used?: number | null
        }
        Relationships: []
      }
      batch_generation_jobs: {
        Row: {
          completed_items: number | null
          content_type: string
          created_at: string | null
          error_message: string | null
          id: string
          params: Json
          result_ids: string[] | null
          status: string | null
          total_items: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_items?: number | null
          content_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          params: Json
          result_ids?: string[] | null
          status?: string | null
          total_items: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_items?: number | null
          content_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          params?: Json
          result_ids?: string[] | null
          status?: string | null
          total_items?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          community_id: string
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          user_id: string
        }
        Insert: {
          community_id: string
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          user_id: string
        }
        Update: {
          community_id?: string
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      content_library: {
        Row: {
          content: Json
          content_type: string
          created_at: string | null
          difficulty: string | null
          exam_format: string | null
          id: string
          is_favorite: boolean | null
          subject: string
          tags: string[] | null
          title: string
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: Json
          content_type: string
          created_at?: string | null
          difficulty?: string | null
          exam_format?: string | null
          id?: string
          is_favorite?: boolean | null
          subject: string
          tags?: string[] | null
          title: string
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string | null
          difficulty?: string | null
          exam_format?: string | null
          id?: string
          is_favorite?: boolean | null
          subject?: string
          tags?: string[] | null
          title?: string
          topic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_history: {
        Row: {
          content: string
          created_at: string | null
          id: string
          model: string | null
          role: string
          session_id: string
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          model?: string | null
          role: string
          session_id: string
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          model?: string | null
          role?: string
          session_id?: string
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: []
      }
      document_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string | null
          document_id: string
          id: string
          metadata: Json | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string | null
          document_id: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string | null
          document_id?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "user_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      home_learning_resources: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          resource_type: string | null
          title: string
          url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          resource_type?: string | null
          title: string
          url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          resource_type?: string | null
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      learning_insights: {
        Row: {
          confidence_score: number | null
          data_points: Json | null
          generated_at: string | null
          id: string
          insight_text: string
          insight_type: string
          is_read: boolean | null
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          data_points?: Json | null
          generated_at?: string | null
          id?: string
          insight_text: string
          insight_type: string
          is_read?: boolean | null
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          data_points?: Json | null
          generated_at?: string | null
          id?: string
          insight_text?: string
          insight_type?: string
          is_read?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      learning_sessions: {
        Row: {
          achievements_unlocked: string[] | null
          ai_questions_asked: number | null
          concepts_covered: string[] | null
          correct_answers: number | null
          distractions_count: number | null
          duration_minutes: number | null
          ended_at: string | null
          id: string
          metadata: Json | null
          performance_score: number | null
          questions_answered: number | null
          session_settings: Json | null
          session_type: string
          started_at: string | null
          subject: string | null
          topic: string | null
          user_id: string
        }
        Insert: {
          achievements_unlocked?: string[] | null
          ai_questions_asked?: number | null
          concepts_covered?: string[] | null
          correct_answers?: number | null
          distractions_count?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          performance_score?: number | null
          questions_answered?: number | null
          session_settings?: Json | null
          session_type: string
          started_at?: string | null
          subject?: string | null
          topic?: string | null
          user_id: string
        }
        Update: {
          achievements_unlocked?: string[] | null
          ai_questions_asked?: number | null
          concepts_covered?: string[] | null
          correct_answers?: number | null
          distractions_count?: number | null
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          performance_score?: number | null
          questions_answered?: number | null
          session_settings?: Json | null
          session_type?: string
          started_at?: string | null
          subject?: string | null
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      message_requests: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          receiver_id: string
          sender_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          receiver_id: string
          sender_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          receiver_id?: string
          sender_id?: string
          status?: string | null
        }
        Relationships: []
      }
      newsletter_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          update_preferences: Json | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          update_preferences?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          update_preferences?: Json | null
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_steps: string[] | null
          created_at: string | null
          current_step: string
          exam_date: string | null
          explanation_preference: string | null
          goals_set: boolean | null
          has_asked_question: boolean | null
          has_uploaded_document: boolean | null
          id: string
          last_session_at: string | null
          learning_style: string | null
          learning_subjects: string[] | null
          notification_preferences_set: boolean | null
          onboarding_completed: boolean | null
          session_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          exam_date?: string | null
          explanation_preference?: string | null
          goals_set?: boolean | null
          has_asked_question?: boolean | null
          has_uploaded_document?: boolean | null
          id?: string
          last_session_at?: string | null
          learning_style?: string | null
          learning_subjects?: string[] | null
          notification_preferences_set?: boolean | null
          onboarding_completed?: boolean | null
          session_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_steps?: string[] | null
          created_at?: string | null
          current_step?: string
          exam_date?: string | null
          explanation_preference?: string | null
          goals_set?: boolean | null
          has_asked_question?: boolean | null
          has_uploaded_document?: boolean | null
          id?: string
          last_session_at?: string | null
          learning_style?: string | null
          learning_subjects?: string[] | null
          notification_preferences_set?: boolean | null
          onboarding_completed?: boolean | null
          session_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      parent_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          parent_id: string
          title: string
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          parent_id: string
          title: string
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          parent_id?: string
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      parent_teacher_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          parent_id: string
          sender_type: string | null
          teacher_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          parent_id: string
          sender_type?: string | null
          teacher_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          parent_id?: string
          sender_type?: string | null
          teacher_id?: string
        }
        Relationships: []
      }
      parental_controls: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string
          settings: Json | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id: string
          settings?: Json | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string
          settings?: Json | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_level: string | null
          avatar_url: string | null
          child_school: string | null
          created_at: string | null
          full_name: string | null
          id: string
          institution: string | null
          teaching_subject: string | null
          updated_at: string | null
          user_id: string
          user_type: string | null
        }
        Insert: {
          academic_level?: string | null
          avatar_url?: string | null
          child_school?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          teaching_subject?: string | null
          updated_at?: string | null
          user_id: string
          user_type?: string | null
        }
        Update: {
          academic_level?: string | null
          avatar_url?: string | null
          child_school?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          institution?: string | null
          teaching_subject?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          completed_at: string | null
          correct_count: number
          difficulty: string | null
          duration_seconds: number | null
          exam_type: string | null
          id: string
          questions_count: number
          quiz_id: string | null
          score: number
          subject: string
          topic: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          correct_count: number
          difficulty?: string | null
          duration_seconds?: number | null
          exam_type?: string | null
          id?: string
          questions_count: number
          quiz_id?: string | null
          score: number
          subject: string
          topic?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          correct_count?: number
          difficulty?: string | null
          duration_seconds?: number | null
          exam_type?: string | null
          id?: string
          questions_count?: number
          quiz_id?: string | null
          score?: number
          subject?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      quiz_questions: {
        Row: {
          correct_answer: string
          created_at: string | null
          difficulty: string | null
          explanation: string | null
          id: string
          options: Json | null
          question_text: string
          question_type: string
          quiz_id: string | null
          topic: string | null
        }
        Insert: {
          correct_answer: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question_text: string
          question_type: string
          quiz_id?: string | null
          topic?: string | null
        }
        Update: {
          correct_answer?: string
          created_at?: string | null
          difficulty?: string | null
          explanation?: string | null
          id?: string
          options?: Json | null
          question_text?: string
          question_type?: string
          quiz_id?: string | null
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          academic_level: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          estimated_duration_minutes: number | null
          id: string
          is_published: boolean | null
          passing_score: number | null
          subject: string
          title: string
          updated_at: string | null
        }
        Insert: {
          academic_level?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          passing_score?: number | null
          subject: string
          title: string
          updated_at?: string | null
        }
        Update: {
          academic_level?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          passing_score?: number | null
          subject?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      spaced_repetition_cards: {
        Row: {
          answer: string
          created_at: string | null
          difficulty: number | null
          ease_factor: number | null
          id: string
          interval_days: number | null
          last_reviewed_at: string | null
          mastery_level: number | null
          metadata: Json | null
          next_review_date: string | null
          question: string
          repetitions: number | null
          source_document_id: string | null
          subject: string
          topic: string
          total_reviews: number | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          difficulty?: number | null
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          last_reviewed_at?: string | null
          mastery_level?: number | null
          metadata?: Json | null
          next_review_date?: string | null
          question: string
          repetitions?: number | null
          source_document_id?: string | null
          subject: string
          topic: string
          total_reviews?: number | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          difficulty?: number | null
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          last_reviewed_at?: string | null
          mastery_level?: number | null
          metadata?: Json | null
          next_review_date?: string | null
          question?: string
          repetitions?: number | null
          source_document_id?: string | null
          subject?: string
          topic?: string
          total_reviews?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spaced_repetition_cards_source_document_id_fkey"
            columns: ["source_document_id"]
            isOneToOne: false
            referencedRelation: "user_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      student_reports: {
        Row: {
          created_at: string | null
          id: string
          parent_id: string
          report_data: Json | null
          student_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          parent_id: string
          report_data?: Json | null
          student_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          parent_id?: string
          report_data?: Json | null
          student_id?: string
        }
        Relationships: []
      }
      study_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          description: string | null
          end_date: string
          goal_type: string
          id: string
          metadata: Json | null
          start_date: string
          status: string | null
          subject: string | null
          target_value: number
          time_period: string
          title: string
          topic: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          end_date: string
          goal_type: string
          id?: string
          metadata?: Json | null
          start_date: string
          status?: string | null
          subject?: string | null
          target_value: number
          time_period: string
          title: string
          topic?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          description?: string | null
          end_date?: string
          goal_type?: string
          id?: string
          metadata?: Json | null
          start_date?: string
          status?: string | null
          subject?: string | null
          target_value?: number
          time_period?: string
          title?: string
          topic?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_type: string
          description: string | null
          earned_at: string | null
          icon: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          description?: string | null
          earned_at?: string | null
          icon?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      user_ai_usage: {
        Row: {
          cost_usd: number | null
          created_at: string | null
          id: string
          requests_count: number | null
          tokens_used: number | null
          updated_at: string | null
          usage_date: string
          user_id: string
        }
        Insert: {
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          requests_count?: number | null
          tokens_used?: number | null
          updated_at?: string | null
          usage_date?: string
          user_id: string
        }
        Update: {
          cost_usd?: number | null
          created_at?: string | null
          id?: string
          requests_count?: number | null
          tokens_used?: number | null
          updated_at?: string | null
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          created_at: string | null
          id: string
          status: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          status?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          status?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          chunks_count: number | null
          created_at: string | null
          error_message: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          processing_metadata: Json | null
          processing_progress: number | null
          retry_count: number | null
          storage_path: string
          updated_at: string | null
          upload_status: string | null
          user_id: string
        }
        Insert: {
          chunks_count?: number | null
          created_at?: string | null
          error_message?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          processing_metadata?: Json | null
          processing_progress?: number | null
          retry_count?: number | null
          storage_path: string
          updated_at?: string | null
          upload_status?: string | null
          user_id: string
        }
        Update: {
          chunks_count?: number | null
          created_at?: string | null
          error_message?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          processing_metadata?: Json | null
          processing_progress?: number | null
          retry_count?: number | null
          storage_path?: string
          updated_at?: string | null
          upload_status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          created_at: string
          email: string
          id: string
          interest_area: string | null
          name: string
          user_type: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          interest_area?: string | null
          name: string
          user_type: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          interest_area?: string | null
          name?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_concept_mastery: {
        Args: { p_subject: string; p_user_id: string }
        Returns: number
      }
      calculate_exam_readiness: {
        Args: { p_exam_date: string; p_subject: string; p_user_id: string }
        Returns: Json
      }
      get_document_stats: {
        Args: { p_user_id: string }
        Returns: {
          completed: number
          failed: number
          processing: number
          total_chunks: number
          total_documents: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
