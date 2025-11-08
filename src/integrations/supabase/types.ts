export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
        ]
      }
      scheduled_events: {
        Row: {
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          start_time: string
          title: string
          sport_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          session_type: Database["public"]["Enums"]["session_type"]
          start_time: string
          title: string
          sport_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          session_type?: Database["public"]["Enums"]["session_type"]
          start_time?: string
          title?: string
          sport_id?: string | null
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
        ]
      }
      training_notes: {
        Row: {
          coach_name: string | null
          created_at: string
          id: string
          training_date: string
          training_time: string | null
          updated_at: string
          user_id: string
          what_didnt_feel_good: string | null
          what_felt_good: string | null
          what_worked_on: string | null
          sport_id: string | null
        }
        Insert: {
          coach_name?: string | null
          created_at?: string
          id?: string
          training_date?: string
          training_time?: string | null
          updated_at?: string
          user_id: string
          what_didnt_feel_good?: string | null
          what_felt_good?: string | null
          what_worked_on?: string | null
          sport_id?: string | null
        }
        Update: {
          coach_name?: string | null
          created_at?: string
          id?: string
          training_date?: string
          training_time?: string | null
          updated_at?: string
          user_id?: string
          what_didnt_feel_good?: string | null
          what_felt_good?: string | null
          what_worked_on?: string | null
          sport_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_notes_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
        ]
      }
      sports: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          short_name: string
          category: string
          scoring_format: Json
          icon_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          short_name?: string
          category?: string
          scoring_format?: Json
          icon_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string
          short_name?: string
          category?: string
          scoring_format?: Json
          icon_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_opponent: {
        Args: { p_name: string; p_user_id: string }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
