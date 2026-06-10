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
      _heartbeat: {
        Row: {
          id: number
          last_beat: string
        }
        Insert: {
          id: number
          last_beat?: string
        }
        Update: {
          id?: number
          last_beat?: string
        }
        Relationships: []
      }
      athlete_patterns: {
        Row: {
          action: string | null
          category: string
          evidence: Json | null
          expires_at: string | null
          generated_at: string
          headline: string
          id: string
          is_dismissed: boolean
          message: string
          pattern_key: string
          severity: string
          sport_id: string | null
          user_id: string
        }
        Insert: {
          action?: string | null
          category: string
          evidence?: Json | null
          expires_at?: string | null
          generated_at?: string
          headline: string
          id?: string
          is_dismissed?: boolean
          message: string
          pattern_key: string
          severity?: string
          sport_id?: string | null
          user_id: string
        }
        Update: {
          action?: string | null
          category?: string
          evidence?: Json | null
          expires_at?: string | null
          generated_at?: string
          headline?: string
          id?: string
          is_dismissed?: boolean
          message?: string
          pattern_key?: string
          severity?: string
          sport_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      coach_player_links: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          coach_id: string
          created_at: string
          id: string
          player_id: string
          requested_at: string
          revoked_at: string | null
          shared_data: Json
          status: Database["public"]["Enums"]["link_status"]
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          coach_id: string
          created_at?: string
          id?: string
          player_id: string
          requested_at?: string
          revoked_at?: string | null
          shared_data?: Json
          status?: Database["public"]["Enums"]["link_status"]
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          coach_id?: string
          created_at?: string
          id?: string
          player_id?: string
          requested_at?: string
          revoked_at?: string | null
          shared_data?: Json
          status?: Database["public"]["Enums"]["link_status"]
        }
        Relationships: [
          {
            foreignKeyName: "coach_player_links_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_player_links_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_player_links_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      guardians: {
        Row: {
          created_at: string
          guardian_id: string
          id: string
          player_id: string
          relationship: string
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          guardian_id: string
          id?: string
          player_id: string
          relationship?: string
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          guardian_id?: string
          id?: string
          player_id?: string
          relationship?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guardians_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guardians_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
      injury_reports: {
        Row: {
          body_part: string
          body_region: Database["public"]["Enums"]["body_region"]
          coach_notified: boolean
          coordinates: Json | null
          created_at: string
          duration: string
          id: string
          impact_on_training: Database["public"]["Enums"]["impact_level"]
          onset_type: Database["public"]["Enums"]["onset_type"]
          pain_level: number
          pain_types: string[]
          photo_urls: string[] | null
          previous_report_id: string | null
          restricted_from_training: boolean
          shared_with_coach: boolean
          sought_medical_attention: boolean
          sport_id: string | null
          treatment_notes: string | null
          trend: Database["public"]["Enums"]["injury_trend"]
          updated_at: string
          user_id: string
        }
        Insert: {
          body_part: string
          body_region: Database["public"]["Enums"]["body_region"]
          coach_notified?: boolean
          coordinates?: Json | null
          created_at?: string
          duration?: string
          id?: string
          impact_on_training?: Database["public"]["Enums"]["impact_level"]
          onset_type?: Database["public"]["Enums"]["onset_type"]
          pain_level: number
          pain_types?: string[]
          photo_urls?: string[] | null
          previous_report_id?: string | null
          restricted_from_training?: boolean
          shared_with_coach?: boolean
          sought_medical_attention?: boolean
          sport_id?: string | null
          treatment_notes?: string | null
          trend?: Database["public"]["Enums"]["injury_trend"]
          updated_at?: string
          user_id: string
        }
        Update: {
          body_part?: string
          body_region?: Database["public"]["Enums"]["body_region"]
          coach_notified?: boolean
          coordinates?: Json | null
          created_at?: string
          duration?: string
          id?: string
          impact_on_training?: Database["public"]["Enums"]["impact_level"]
          onset_type?: Database["public"]["Enums"]["onset_type"]
          pain_level?: number
          pain_types?: string[]
          photo_urls?: string[] | null
          previous_report_id?: string | null
          restricted_from_training?: boolean
          shared_with_coach?: boolean
          sought_medical_attention?: boolean
          sport_id?: string | null
          treatment_notes?: string | null
          trend?: Database["public"]["Enums"]["injury_trend"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "injury_reports_previous_report_id_fkey"
            columns: ["previous_report_id"]
            isOneToOne: false
            referencedRelation: "injury_reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "injury_reports_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "injury_reports_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_catalogue"
            referencedColumns: ["id"]
          },
        ]
      }
      injury_check_ins: {
        Row: {
          check_in_date: string
          created_at: string
          id: string
          injury_report_id: string
          notes: string | null
          pain_level: number | null
          rehab_mood: number
          rtp_confidence: number
          user_id: string
        }
        Insert: {
          check_in_date?: string
          created_at?: string
          id?: string
          injury_report_id: string
          notes?: string | null
          pain_level?: number | null
          rehab_mood: number
          rtp_confidence: number
          user_id: string
        }
        Update: {
          check_in_date?: string
          created_at?: string
          id?: string
          injury_report_id?: string
          notes?: string | null
          pain_level?: number | null
          rehab_mood?: number
          rtp_confidence?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "injury_check_ins_injury_report_id_fkey"
            columns: ["injury_report_id"]
            isOneToOne: false
            referencedRelation: "injury_reports"
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
          post_emotion_tags: string[] | null
          pre_arousal: number | null
          pre_confidence: number | null
          pre_emotion_tags: string[] | null
          pre_nerves: number | null
          process_goal: string | null
          reflection_prompt_level: string | null
          reflection_prompt_used: string | null
          scheduled_event_id: string | null
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
          post_emotion_tags?: string[] | null
          pre_arousal?: number | null
          pre_confidence?: number | null
          pre_emotion_tags?: string[] | null
          pre_nerves?: number | null
          process_goal?: string | null
          reflection_prompt_level?: string | null
          reflection_prompt_used?: string | null
          scheduled_event_id?: string | null
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
          post_emotion_tags?: string[] | null
          pre_arousal?: number | null
          pre_confidence?: number | null
          pre_emotion_tags?: string[] | null
          pre_nerves?: number | null
          process_goal?: string | null
          reflection_prompt_level?: string | null
          reflection_prompt_used?: string | null
          scheduled_event_id?: string | null
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
      period_goals: {
        Row: {
          cadence: string
          completed_at: string | null
          created_at: string
          current_value: number
          description: string | null
          goal_type: string
          id: string
          is_completed: boolean
          metadata: Json
          period_end: string
          period_start: string
          sport_id: string | null
          status: string
          target_value: number
          title: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cadence?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string | null
          goal_type: string
          id?: string
          is_completed?: boolean
          metadata?: Json
          period_end: string
          period_start: string
          sport_id?: string | null
          status?: string
          target_value: number
          title: string
          unit: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cadence?: string
          completed_at?: string | null
          created_at?: string
          current_value?: number
          description?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean
          metadata?: Json
          period_end?: string
          period_start?: string
          sport_id?: string | null
          status?: string
          target_value?: number
          title?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "period_goals_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "period_goals_sport_id_fkey"
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
          date_of_birth: string | null
          full_name: string | null
          id: string
          journaling_preferences: Json | null
          performance_goal: string | null
          preferred_surface: string | null
          primary_sport_id: string | null
          ranking: string | null
          show_menstrual_tracking: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          club?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id: string
          journaling_preferences?: Json | null
          performance_goal?: string | null
          preferred_surface?: string | null
          primary_sport_id?: string | null
          ranking?: string | null
          show_menstrual_tracking?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          club?: string | null
          date_of_birth?: string | null
          full_name?: string | null
          id?: string
          journaling_preferences?: Json | null
          performance_goal?: string | null
          preferred_surface?: string | null
          primary_sport_id?: string | null
          ranking?: string | null
          show_menstrual_tracking?: boolean | null
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
          pre_match_state: Json | null
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
          pre_match_state?: Json | null
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
          pre_match_state?: Json | null
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
      subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["team_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          sport_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          sport_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          sport_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_catalogue"
            referencedColumns: ["id"]
          },
        ]
      }
      training_notes: {
        Row: {
          coach_name: string | null
          created_at: string
          emotion_tags: string[] | null
          enjoyment: number | null
          id: string
          session_arousal: number | null
          session_feel: number | null
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
          emotion_tags?: string[] | null
          enjoyment?: number | null
          id?: string
          session_arousal?: number | null
          session_feel?: number | null
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
          emotion_tags?: string[] | null
          enjoyment?: number | null
          id?: string
          session_arousal?: number | null
          session_feel?: number | null
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
      training_sessions: {
        Row: {
          activity_type: string
          created_at: string
          duration_minutes: number
          id: string
          notes: string | null
          planned_duration: number | null
          rpe: number
          rpe_collected_at: string | null
          session_date: string
          session_end_time: string | null
          session_start_time: string | null
          sport_id: string | null
          sport_specific: string | null
          training_load: number
          training_note_id: string | null
          user_id: string
        }
        Insert: {
          activity_type?: string
          created_at?: string
          duration_minutes: number
          id?: string
          notes?: string | null
          planned_duration?: number | null
          rpe: number
          rpe_collected_at?: string | null
          session_date?: string
          session_end_time?: string | null
          session_start_time?: string | null
          sport_id?: string | null
          sport_specific?: string | null
          training_load: number
          training_note_id?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          planned_duration?: number | null
          rpe?: number
          rpe_collected_at?: string | null
          session_date?: string
          session_end_time?: string | null
          session_start_time?: string | null
          sport_id?: string | null
          sport_specific?: string | null
          training_load?: number
          training_note_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports_catalogue"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_training_note_id_fkey"
            columns: ["training_note_id"]
            isOneToOne: false
            referencedRelation: "training_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          tier: number
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          tier?: number
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          tier?: number
          user_id?: string
        }
        Relationships: []
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
      wellness_entries: {
        Row: {
          appetite: number | null
          created_at: string
          energy: number | null
          entry_date: string
          fatigue: number
          id: string
          menstrual_cycle_day: number | null
          mood: number
          motivation: number
          muscle_soreness: number | null
          notes: string | null
          performance_confidence: number
          sleep_duration_hours: number | null
          sleep_quality: number
          sport_id: string | null
          stress_level: number
          total_wellness_score: number
          user_id: string
        }
        Insert: {
          appetite?: number | null
          created_at?: string
          energy?: number | null
          entry_date?: string
          fatigue: number
          id?: string
          menstrual_cycle_day?: number | null
          mood: number
          motivation: number
          muscle_soreness?: number | null
          notes?: string | null
          performance_confidence: number
          sleep_duration_hours?: number | null
          sleep_quality: number
          sport_id?: string | null
          stress_level: number
          total_wellness_score: number
          user_id: string
        }
        Update: {
          appetite?: number | null
          created_at?: string
          energy?: number | null
          entry_date?: string
          fatigue?: number
          id?: string
          menstrual_cycle_day?: number | null
          mood?: number
          motivation?: number
          muscle_soreness?: number | null
          notes?: string | null
          performance_confidence?: number
          sleep_duration_hours?: number | null
          sleep_quality?: number
          sport_id?: string | null
          stress_level?: number
          total_wellness_score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wellness_entries_sport_id_fkey"
            columns: ["sport_id"]
            isOneToOne: false
            referencedRelation: "sports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wellness_entries_sport_id_fkey"
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
      get_user_plan: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_guardian_of: {
        Args: { _guardian_id: string; _player_id: string }
        Returns: boolean
      }
      is_linked_coach: {
        Args: { _coach_id: string; _player_id: string }
        Returns: boolean
      }
      is_team_member: {
        Args: { _team_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "player" | "coach" | "admin"
      body_region:
        | "head_neck"
        | "shoulder_arm"
        | "elbow_forearm"
        | "wrist_hand"
        | "chest_upper_back"
        | "lower_back"
        | "hip_groin"
        | "thigh"
        | "knee"
        | "lower_leg"
        | "ankle_foot"
      impact_level: "none" | "minor" | "moderate" | "severe" | "unable"
      injury_trend: "improving" | "stable" | "worsening" | "new"
      link_status: "pending" | "approved" | "revoked"
      onset_type: "sudden" | "gradual" | "unknown"
      pain_type:
        | "sharp"
        | "dull"
        | "aching"
        | "burning"
        | "stabbing"
        | "throbbing"
        | "tingling"
        | "stiffness"
      session_type: "training" | "recovery" | "match" | "mental_skills"
      team_role: "coach" | "player" | "assistant_coach"
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
      app_role: ["player", "coach", "admin"],
      body_region: [
        "head_neck",
        "shoulder_arm",
        "elbow_forearm",
        "wrist_hand",
        "chest_upper_back",
        "lower_back",
        "hip_groin",
        "thigh",
        "knee",
        "lower_leg",
        "ankle_foot",
      ],
      impact_level: ["none", "minor", "moderate", "severe", "unable"],
      injury_trend: ["improving", "stable", "worsening", "new"],
      link_status: ["pending", "approved", "revoked"],
      onset_type: ["sudden", "gradual", "unknown"],
      pain_type: [
        "sharp",
        "dull",
        "aching",
        "burning",
        "stabbing",
        "throbbing",
        "tingling",
        "stiffness",
      ],
      session_type: ["training", "recovery", "match", "mental_skills"],
      team_role: ["coach", "player", "assistant_coach"],
    },
  },
} as const
