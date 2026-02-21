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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ad_banners: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          badge_icon: string | null
          badge_name: string
          earned_at: string
          id: string
          milestone_id: string
          user_id: string
        }
        Insert: {
          badge_icon?: string | null
          badge_name: string
          earned_at?: string
          id?: string
          milestone_id: string
          user_id: string
        }
        Update: {
          badge_icon?: string | null
          badge_name?: string
          earned_at?: string
          id?: string
          milestone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          message: string
          replied_at: string | null
          replied_by: string | null
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message?: string
          replied_at?: string | null
          replied_by?: string | null
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      milestone_details: {
        Row: {
          created_at: string
          events: string | null
          hero_names: string[] | null
          hero_urls: string[] | null
          id: string
          image_captions: string[] | null
          image_urls: string[] | null
          landmark_names: string[] | null
          landmark_urls: string[] | null
          milestone_id: string
          results: string | null
          significance: string | null
          source_references: string | null
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          events?: string | null
          hero_names?: string[] | null
          hero_urls?: string[] | null
          id?: string
          image_captions?: string[] | null
          image_urls?: string[] | null
          landmark_names?: string[] | null
          landmark_urls?: string[] | null
          milestone_id: string
          results?: string | null
          significance?: string | null
          source_references?: string | null
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          events?: string | null
          hero_names?: string[] | null
          hero_urls?: string[] | null
          id?: string
          image_captions?: string[] | null
          image_urls?: string[] | null
          landmark_names?: string[] | null
          landmark_urls?: string[] | null
          milestone_id?: string
          results?: string | null
          significance?: string | null
          source_references?: string | null
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_details_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: true
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          created_at: string
          id: string
          period_id: string
          period_title: string
          phase_id: string
          phase_title: string
          sort_order: number
          title: string
          year: string | null
        }
        Insert: {
          created_at?: string
          id: string
          period_id: string
          period_title: string
          phase_id: string
          phase_title: string
          sort_order?: number
          title: string
          year?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          period_id?: string
          period_title?: string
          phase_id?: string
          phase_title?: string
          sort_order?: number
          title?: string
          year?: string | null
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          setting_key: string
          setting_value: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key: string
          setting_value: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          setting_key?: string
          setting_value?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      premium_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          note: string | null
          plan_type: string
          proof_image_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          note?: string | null
          plan_type?: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          note?: string | null
          plan_type?: string
          proof_image_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_premium: boolean
          premium_expires_at: string | null
          total_points: number
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean
          premium_expires_at?: string | null
          total_points?: number
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_premium?: boolean
          premium_expires_at?: string | null
          total_points?: number
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json | null
          created_at: string
          double_points_used: boolean
          hearts_lost: number
          id: string
          milestone_id: string
          points_earned: number
          quiz_score: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          double_points_used?: boolean
          hearts_lost?: number
          id?: string
          milestone_id: string
          points_earned?: number
          quiz_score: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          double_points_used?: boolean
          hearts_lost?: number
          id?: string
          milestone_id?: string
          points_earned?: number
          quiz_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          correct_answer: number
          created_at: string
          id: string
          image_url: string | null
          milestone_id: string
          options: Json
          question: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          id?: string
          image_url?: string | null
          milestone_id: string
          options?: Json
          question: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          id?: string
          image_url?: string | null
          milestone_id?: string
          options?: Json
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          points_spent: number
          reward_id: string
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          points_spent: number
          reward_id: string
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          points_spent?: number
          reward_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          points_cost: number
          reward_type: string
          stock: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          points_cost: number
          reward_type?: string
          stock?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          points_cost?: number
          reward_type?: string
          stock?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_daily_limits: {
        Row: {
          created_at: string
          date: string
          double_points_used: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          double_points_used?: number
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          double_points_used?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_hearts: {
        Row: {
          created_at: string
          hearts_remaining: number
          id: string
          last_reset_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hearts_remaining?: number
          id?: string
          last_reset_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hearts_remaining?: number
          id?: string
          last_reset_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          attempts_count: number
          best_score: number | null
          completed_at: string | null
          created_at: string
          id: string
          is_completed: boolean
          milestone_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempts_count?: number
          best_score?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          milestone_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempts_count?: number
          best_score?: number | null
          completed_at?: string | null
          created_at?: string
          id?: string
          is_completed?: boolean
          milestone_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_double_points: { Args: { p_attempt_id: string }; Returns: Json }
      auto_expire_premium: { Args: never; Returns: number }
      check_username_exists: { Args: { p_username: string }; Returns: boolean }
      get_email_by_username: { Args: { p_username: string }; Returns: string }
      get_hearts: {
        Args: never
        Returns: {
          hearts_remaining: number
          is_premium: boolean
        }[]
      }
      get_leaderboard: {
        Args: never
        Returns: {
          display_name: string
          is_premium: boolean
          total_points: number
        }[]
      }
      get_quiz_questions: {
        Args: { p_milestone_id: string }
        Returns: {
          id: string
          image_url: string
          milestone_id: string
          options: Json
          question: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      submit_quiz:
        | {
            Args: { p_answers: number[]; p_milestone_id: string }
            Returns: Json
          }
        | {
            Args: {
              p_answers: number[]
              p_milestone_id: string
              p_question_ids?: string[]
            }
            Returns: Json
          }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
