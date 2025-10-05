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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      course_imports: {
        Row: {
          course_id: string
          id: string
          import_source: string
          imported_at: string
          imported_by: string | null
          metadata: Json | null
          source_id: string | null
        }
        Insert: {
          course_id: string
          id?: string
          import_source: string
          imported_at?: string
          imported_by?: string | null
          metadata?: Json | null
          source_id?: string | null
        }
        Update: {
          course_id?: string
          id?: string
          import_source?: string
          imported_at?: string
          imported_by?: string | null
          metadata?: Json | null
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_imports_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_tees: {
        Row: {
          course_id: string
          created_at: string
          id: string
          rating: number | null
          slope: number | null
          tee_color: string | null
          tee_name: string
          total_yardage: number | null
          updated_at: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          rating?: number | null
          slope?: number | null
          tee_color?: string | null
          tee_name: string
          total_yardage?: number | null
          updated_at?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          rating?: number | null
          slope?: number | null
          tee_color?: string | null
          tee_name?: string
          total_yardage?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_tees_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          holes: number
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          par: number
          rating: number | null
          slope: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          holes?: number
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          par: number
          rating?: number | null
          slope?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          holes?: number
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          par?: number
          rating?: number | null
          slope?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          added_at: string
          group_id: string
          handicap: number | null
          id: string
          profile_id: string
        }
        Insert: {
          added_at?: string
          group_id: string
          handicap?: number | null
          id?: string
          profile_id: string
        }
        Update: {
          added_at?: string
          group_id?: string
          handicap?: number | null
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "player_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hole_scores: {
        Row: {
          created_at: string
          fairway_hit: boolean | null
          green_in_regulation: boolean | null
          hole_number: number
          id: string
          penalties: number | null
          putts: number | null
          round_id: string
          strokes: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          fairway_hit?: boolean | null
          green_in_regulation?: boolean | null
          hole_number: number
          id?: string
          penalties?: number | null
          putts?: number | null
          round_id: string
          strokes: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          fairway_hit?: boolean | null
          green_in_regulation?: boolean | null
          hole_number?: number
          id?: string
          penalties?: number | null
          putts?: number | null
          round_id?: string
          strokes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hole_scores_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      hole_tees: {
        Row: {
          created_at: string
          hole_id: string
          id: string
          tee_id: string
          yardage: number
        }
        Insert: {
          created_at?: string
          hole_id: string
          id?: string
          tee_id: string
          yardage: number
        }
        Update: {
          created_at?: string
          hole_id?: string
          id?: string
          tee_id?: string
          yardage?: number
        }
        Relationships: [
          {
            foreignKeyName: "hole_tees_hole_id_fkey"
            columns: ["hole_id"]
            isOneToOne: false
            referencedRelation: "holes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hole_tees_tee_id_fkey"
            columns: ["tee_id"]
            isOneToOne: false
            referencedRelation: "course_tees"
            referencedColumns: ["id"]
          },
        ]
      }
      holes: {
        Row: {
          course_id: string
          created_at: string
          green_latitude: number | null
          green_longitude: number | null
          handicap: number | null
          hole_number: number
          id: string
          par: number
          tee_id: string | null
          tee_latitude: number | null
          tee_longitude: number | null
          yardage: number | null
        }
        Insert: {
          course_id: string
          created_at?: string
          green_latitude?: number | null
          green_longitude?: number | null
          handicap?: number | null
          hole_number: number
          id?: string
          par: number
          tee_id?: string | null
          tee_latitude?: number | null
          tee_longitude?: number | null
          yardage?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string
          green_latitude?: number | null
          green_longitude?: number | null
          handicap?: number | null
          hole_number?: number
          id?: string
          par?: number
          tee_id?: string | null
          tee_latitude?: number | null
          tee_longitude?: number | null
          yardage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "holes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holes_tee_id_fkey"
            columns: ["tee_id"]
            isOneToOne: false
            referencedRelation: "course_tees"
            referencedColumns: ["id"]
          },
        ]
      }
      player_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      press_bets: {
        Row: {
          amount: number
          bet_type: string
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          hole_number: number | null
          id: string
          initiator_id: string
          location_lat: number | null
          location_lng: number | null
          status: string
          target_id: string
          tournament_id: string
          winner_id: string | null
        }
        Insert: {
          amount?: number
          bet_type: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          hole_number?: number | null
          id?: string
          initiator_id: string
          location_lat?: number | null
          location_lng?: number | null
          status?: string
          target_id: string
          tournament_id: string
          winner_id?: string | null
        }
        Update: {
          amount?: number
          bet_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          hole_number?: number | null
          id?: string
          initiator_id?: string
          location_lat?: number | null
          location_lng?: number | null
          status?: string
          target_id?: string
          tournament_id?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "press_bets_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string | null
          handicap: number | null
          home_course: string | null
          id: string
          last_name: string | null
          nickname: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          handicap?: number | null
          home_course?: string | null
          id: string
          last_name?: string | null
          nickname?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          handicap?: number | null
          home_course?: string | null
          id?: string
          last_name?: string | null
          nickname?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rounds: {
        Row: {
          completed_at: string | null
          course_id: string | null
          created_at: string
          fairways_hit: number | null
          greens_in_regulation: number | null
          id: string
          notes: string | null
          started_at: string
          total_putts: number | null
          total_score: number | null
          updated_at: string
          user_id: string
          weather: string | null
        }
        Insert: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          fairways_hit?: number | null
          greens_in_regulation?: number | null
          id?: string
          notes?: string | null
          started_at?: string
          total_putts?: number | null
          total_score?: number | null
          updated_at?: string
          user_id: string
          weather?: string | null
        }
        Update: {
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          fairways_hit?: number | null
          greens_in_regulation?: number | null
          id?: string
          notes?: string | null
          started_at?: string
          total_putts?: number | null
          total_score?: number | null
          updated_at?: string
          user_id?: string
          weather?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rounds_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      shots: {
        Row: {
          accuracy: string | null
          club: string | null
          created_at: string
          distance_yards: number | null
          hole_number: number
          id: string
          latitude: number
          longitude: number
          notes: string | null
          photo_url: string | null
          round_id: string
          shot_number: number
          shot_type: string | null
          timestamp: string
        }
        Insert: {
          accuracy?: string | null
          club?: string | null
          created_at?: string
          distance_yards?: number | null
          hole_number: number
          id?: string
          latitude: number
          longitude: number
          notes?: string | null
          photo_url?: string | null
          round_id: string
          shot_number: number
          shot_type?: string | null
          timestamp?: string
        }
        Update: {
          accuracy?: string | null
          club?: string | null
          created_at?: string
          distance_yards?: number | null
          hole_number?: number
          id?: string
          latitude?: number
          longitude?: number
          notes?: string | null
          photo_url?: string | null
          round_id?: string
          shot_number?: number
          shot_type?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "shots_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      side_game_results: {
        Row: {
          amount: number
          created_at: string
          game_type: string
          hole_number: number
          id: string
          metadata: Json | null
          tournament_id: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          game_type: string
          hole_number: number
          id?: string
          metadata?: Json | null
          tournament_id: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          game_type?: string
          hole_number?: number
          id?: string
          metadata?: Json | null
          tournament_id?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "side_game_results_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "side_game_results_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      skins_tracking: {
        Row: {
          created_at: string
          hole_number: number
          id: string
          is_carried_over: boolean | null
          pot_amount: number
          tournament_id: string
          winner_id: string | null
          winning_score: number | null
        }
        Insert: {
          created_at?: string
          hole_number: number
          id?: string
          is_carried_over?: boolean | null
          pot_amount?: number
          tournament_id: string
          winner_id?: string | null
          winning_score?: number | null
        }
        Update: {
          created_at?: string
          hole_number?: number
          id?: string
          is_carried_over?: boolean | null
          pot_amount?: number
          tournament_id?: string
          winner_id?: string | null
          winning_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skins_tracking_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "skins_tracking_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      snake_tracking: {
        Row: {
          amount: number
          created_at: string
          current_holder_id: string | null
          id: string
          is_final: boolean | null
          last_hole_updated: number | null
          snake_type: string
          tournament_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          current_holder_id?: string | null
          id?: string
          is_final?: boolean | null
          last_hole_updated?: number | null
          snake_type: string
          tournament_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          current_holder_id?: string | null
          id?: string
          is_final?: boolean | null
          last_hole_updated?: number | null
          snake_type?: string
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "snake_tracking_current_holder_id_fkey"
            columns: ["current_holder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "snake_tracking_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          message_type: string
          metadata: Json | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          message_type?: string
          metadata?: Json | null
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          message_type?: string
          metadata?: Json | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_messages_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          entry_paid: boolean | null
          handicap: number | null
          id: string
          joined_at: string
          status: string
          team_id: string | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          entry_paid?: boolean | null
          handicap?: number | null
          id?: string
          joined_at?: string
          status?: string
          team_id?: string | null
          tournament_id: string
          user_id: string
        }
        Update: {
          entry_paid?: boolean | null
          handicap?: number | null
          id?: string
          joined_at?: string
          status?: string
          team_id?: string | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_rounds: {
        Row: {
          created_at: string
          id: string
          round_id: string
          team_id: string | null
          tournament_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          round_id: string
          team_id?: string | null
          tournament_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          round_id?: string
          team_id?: string | null
          tournament_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rounds_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "tournament_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rounds_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_teams: {
        Row: {
          created_at: string
          id: string
          name: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_teams_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          course_id: string | null
          created_at: string
          created_by: string
          description: string | null
          end_time: string | null
          entry_fee: number | null
          game_type: string
          id: string
          max_players: number | null
          name: string
          prize_pool: number | null
          rules: Json | null
          settings: Json | null
          start_time: string | null
          status: string
          updated_at: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_time?: string | null
          entry_fee?: number | null
          game_type?: string
          id?: string
          max_players?: number | null
          name: string
          prize_pool?: number | null
          rules?: Json | null
          settings?: Json | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          course_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_time?: string | null
          entry_fee?: number | null
          game_type?: string
          id?: string
          max_players?: number | null
          name?: string
          prize_pool?: number | null
          rules?: Json | null
          settings?: Json | null
          start_time?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_course_favorites: {
        Row: {
          course_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_course_favorites_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      wolf_game_state: {
        Row: {
          amount: number
          created_at: string
          hole_number: number
          hole_result: string | null
          id: string
          is_lone_wolf: boolean | null
          partner_id: string | null
          tournament_id: string
          wolf_player_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          hole_number: number
          hole_result?: string | null
          id?: string
          is_lone_wolf?: boolean | null
          partner_id?: string | null
          tournament_id: string
          wolf_player_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          hole_number?: number
          hole_result?: string | null
          id?: string
          is_lone_wolf?: boolean | null
          partner_id?: string | null
          tournament_id?: string
          wolf_player_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wolf_game_state_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wolf_game_state_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wolf_game_state_wolf_player_id_fkey"
            columns: ["wolf_player_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_user_in_tournament: {
        Args: { tournament_id: string }
        Returns: boolean
      }
      get_display_name: {
        Args: { profile_row: Database["public"]["Tables"]["profiles"]["Row"] }
        Returns: string
      }
      search_profiles_for_tournament: {
        Args: { search_query?: string }
        Returns: {
          avatar_url: string
          first_name: string
          handicap: number
          id: string
          last_name: string
          nickname: string
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
