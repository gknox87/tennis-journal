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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      improvement_points: {
        Row: {
          created_at: string | null
          id: string
          is_completed: boolean | null
          point: string
          source_match_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          point: string
          source_match_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          point?: string
          source_match_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "improvement_points_source_match_id_fkey"
            columns: ["source_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          coach_notes: string | null
          court_type: string | null
          created_at: string
          date: string
          final_set_tiebreak: boolean | null
          id: string
          is_win: boolean
          notes: string | null
          opponent_id: string | null
          score: string
          sport_id: string | null
          user_id: string | null
        }
        Insert: {
          coach_notes?: string | null
          court_type?: string | null
          created_at?: string
          date: string
          final_set_tiebreak?: boolean | null
          id?: string
          is_win?: boolean
          notes?: string | null
          opponent_id?: string | null
          score: string
          sport_id?: string | null
          user_id?: string | null
        }
        Update: {
          coach_notes?: string | null
          court_type?: string | null
          created_at?: string
          date?: string
          final_set_tiebreak?: boolean | null
          id?: string
          is_win?: boolean
          notes?: string | null
          opponent_id?: string | null
          score?: string
          sport_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "opponents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_catalogue"
            referencedColumns: ["id"]
          },
        ]
      }
      opponents: {
        Row: {
          created_at: string
          id: string
          is_key_opponent: boolean | null
          name: string
          notes: string | null
          sport_id: string | null
          strengths: string | null
          tactics: string[] | null
          tendencies: string | null
          user_id: string | null
          weaknesses: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_key_opponent?: boolean | null
          name: string
          notes?: string | null
          sport_id?: string | null
          strengths?: string | null
          tactics?: string[] | null
          tendencies?: string | null
          user_id?: string | null
          weaknesses?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_key_opponent?: boolean | null
          name?: string
          notes?: string | null
          sport_id?: string | null
          strengths?: string | null
          tactics?: string[] | null
          tendencies?: string | null
          user_id?: string | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opponents_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opponents_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_catalogue"
            referencedColumns: ["id"]
          },
        ]
      }
      player_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          image_url: string | null
          sport_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          sport_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          image_url?: string | null
          sport_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_notes_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_notes_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_catalogue"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          club: string | null
          full_name: string | null
          id: string
          performance_goal: string | null
          preferred_surface: string | null
          primary_sport_id: string | null
          ranking: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          club?: string | null
          full_name?: string | null
          id: string
          performance_goal?: string | null
          preferred_surface?: string | null
          primary_sport_id?: string | null
          ranking?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          club?: string | null
          full_name?: string | null
          id?: string
          performance_goal?: string | null
          preferred_surface?: string | null
          primary_sport_id?: string | null
          ranking?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_primary_sport_id_fkey"
            columns: ["primary_sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_primary_sport_id_fkey"
            columns: ["primary_sport_id"]
            isOneToOne: false
            referencedRelation: "sports_catalogue"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_events: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          sport_id: string | null
          start_time: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          sport_id?: string | null
          start_time: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          sport_id?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_events_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_events_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_catalogue"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          accent_colour: string | null
          ai_context: Json | null
          category: string | null
          created_at: string | null
          icon_url: string | null
          id: string
          is_individual: boolean | null
          is_published: boolean | null
          name: string
          popularity: number | null
          primary_colour: string | null
          scoring_format: Json | null
          short_name: string | null
          slug: string
          subcategory: string | null
          terminology: Json | null
        }
        Insert: {
          accent_colour?: string | null
          ai_context?: Json | null
          category?: string | null
          created_at?: string | null
          icon_url?: string | null
          id: string
          is_individual?: boolean | null
          is_published?: boolean | null
          name: string
          popularity?: number | null
          primary_colour?: string | null
          scoring_format?: Json | null
          short_name?: string | null
          slug: string
          subcategory?: string | null
          terminology?: Json | null
        }
        Update: {
          accent_colour?: string | null
          ai_context?: Json | null
          category?: string | null
          created_at?: string | null
          icon_url?: string | null
          id?: string
          is_individual?: boolean | null
          is_published?: boolean | null
          name?: string
          popularity?: number | null
          primary_colour?: string | null
          scoring_format?: Json | null
          short_name?: string | null
          slug?: string
          subcategory?: string | null
          terminology?: Json | null
        }
        Relationships: []
      }
      training_notes: {
        Row: {
          coach_name: string | null
          created_at: string
          id: string
          sport_id: string | null
          training_date: string
          training_time: string | null
          updated_at: string
          user_id: string
          what_didnt_feel_good: string | null
          what_felt_good: string | null
          what_worked_on: string | null
        }
        Insert: {
          coach_name?: string | null
          created_at?: string
          id?: string
          sport_id?: string | null
          training_date?: string
          training_time?: string | null
          updated_at?: string
          user_id: string
          what_didnt_feel_good?: string | null
          what_felt_good?: string | null
          what_worked_on?: string | null
        }
        Update: {
          coach_name?: string | null
          created_at?: string
          id?: string
          sport_id?: string | null
          training_date?: string
          training_time?: string | null
          updated_at?: string
          user_id?: string
          what_didnt_feel_good?: string | null
          what_felt_good?: string | null
          what_worked_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_notes_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_notes_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_catalogue"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      sports_catalogue: {
        Row: {
          accent_colour: string | null
          ai_context: Json | null
          category: string | null
          icon_url: string | null
          id: string | null
          is_individual: boolean | null
          name: string | null
          popularity: number | null
          primary_colour: string | null
          scoring_format: Json | null
          short_name: string | null
          slug: string | null
          subcategory: string | null
          terminology: Json | null
        }
        Insert: {
          accent_colour?: string | null
          ai_context?: Json | null
          category?: string | null
          icon_url?: string | null
          id?: string | null
          is_individual?: boolean | null
          name?: string | null
          popularity?: number | null
          primary_colour?: string | null
          scoring_format?: Json | null
          short_name?: string | null
          slug?: string | null
          subcategory?: string | null
          terminology?: Json | null
        }
        Update: {
          accent_colour?: string | null
          ai_context?: Json | null
          category?: string | null
          icon_url?: string | null
          id?: string | null
          is_individual?: boolean | null
          name?: string | null
          popularity?: number | null
          primary_colour?: string | null
          scoring_format?: Json | null
          short_name?: string | null
          slug?: string | null
          subcategory?: string | null
          terminology?: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_or_create_opponent: {
        Args: { p_name: string; p_user_id: string }
        Returns: string
      }
      get_popular_sports: {
        Args: { p_limit?: number }
        Returns: {
          accent_colour: string
          category: string
          icon_url: string
          id: string
          name: string
          primary_colour: string
          short_name: string
          slug: string
        }[]
      }
      get_sports_by_category: {
        Args: { p_category?: string }
        Returns: {
          accent_colour: string
          ai_context: Json
          category: string
          icon_url: string
          id: string
          is_individual: boolean
          name: string
          popularity: number
          primary_colour: string
          scoring_format: Json
          short_name: string
          slug: string
          subcategory: string
          terminology: Json
        }[]
      }
    }
    Enums: {
      session_type: "training" | "recovery" | "match"
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
      session_type: ["training", "recovery", "match"],
    },
  },
} as const
