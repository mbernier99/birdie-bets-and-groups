export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
