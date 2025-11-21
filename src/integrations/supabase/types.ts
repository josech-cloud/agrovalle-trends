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
      classification_feedback: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          new_impact_level: Database["public"]["Enums"]["impact_level"] | null
          new_reliability_level:
            | Database["public"]["Enums"]["reliability_level"]
            | null
          new_sentiment_label:
            | Database["public"]["Enums"]["sentiment_type"]
            | null
          news_id: string
          old_impact_level: Database["public"]["Enums"]["impact_level"] | null
          old_reliability_level:
            | Database["public"]["Enums"]["reliability_level"]
            | null
          old_sentiment_label:
            | Database["public"]["Enums"]["sentiment_type"]
            | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          new_impact_level?: Database["public"]["Enums"]["impact_level"] | null
          new_reliability_level?:
            | Database["public"]["Enums"]["reliability_level"]
            | null
          new_sentiment_label?:
            | Database["public"]["Enums"]["sentiment_type"]
            | null
          news_id: string
          old_impact_level?: Database["public"]["Enums"]["impact_level"] | null
          old_reliability_level?:
            | Database["public"]["Enums"]["reliability_level"]
            | null
          old_sentiment_label?:
            | Database["public"]["Enums"]["sentiment_type"]
            | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          new_impact_level?: Database["public"]["Enums"]["impact_level"] | null
          new_reliability_level?:
            | Database["public"]["Enums"]["reliability_level"]
            | null
          new_sentiment_label?:
            | Database["public"]["Enums"]["sentiment_type"]
            | null
          news_id?: string
          old_impact_level?: Database["public"]["Enums"]["impact_level"] | null
          old_reliability_level?:
            | Database["public"]["Enums"]["reliability_level"]
            | null
          old_sentiment_label?:
            | Database["public"]["Enums"]["sentiment_type"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "classification_feedback_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          body: string | null
          classification_explanation: string | null
          classification_version: string | null
          created_at: string
          department: string | null
          id: string
          impact_level: Database["public"]["Enums"]["impact_level"]
          ingested_at: string
          is_top_story: boolean | null
          municipality: string | null
          product_type: string | null
          published_at: string
          reliability_level: Database["public"]["Enums"]["reliability_level"]
          sector: string
          sentiment_label: Database["public"]["Enums"]["sentiment_type"]
          sentiment_score: number
          source_domain: string | null
          source_name: string
          source_type: Database["public"]["Enums"]["source_type"]
          summary: string | null
          title: string
          trend_category: string | null
          url: string | null
        }
        Insert: {
          body?: string | null
          classification_explanation?: string | null
          classification_version?: string | null
          created_at?: string
          department?: string | null
          id?: string
          impact_level: Database["public"]["Enums"]["impact_level"]
          ingested_at?: string
          is_top_story?: boolean | null
          municipality?: string | null
          product_type?: string | null
          published_at: string
          reliability_level: Database["public"]["Enums"]["reliability_level"]
          sector: string
          sentiment_label: Database["public"]["Enums"]["sentiment_type"]
          sentiment_score: number
          source_domain?: string | null
          source_name: string
          source_type: Database["public"]["Enums"]["source_type"]
          summary?: string | null
          title: string
          trend_category?: string | null
          url?: string | null
        }
        Update: {
          body?: string | null
          classification_explanation?: string | null
          classification_version?: string | null
          created_at?: string
          department?: string | null
          id?: string
          impact_level?: Database["public"]["Enums"]["impact_level"]
          ingested_at?: string
          is_top_story?: boolean | null
          municipality?: string | null
          product_type?: string | null
          published_at?: string
          reliability_level?: Database["public"]["Enums"]["reliability_level"]
          sector?: string
          sentiment_label?: Database["public"]["Enums"]["sentiment_type"]
          sentiment_score?: number
          source_domain?: string | null
          source_name?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          summary?: string | null
          title?: string
          trend_category?: string | null
          url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      impact_level: "alto" | "medio" | "bajo"
      reliability_level: "alto" | "medio" | "bajo"
      sentiment_type: "positivo" | "neutral" | "negativo"
      source_type:
        | "oficial"
        | "medio_nacional"
        | "medio_regional"
        | "blog"
        | "red_social"
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
      impact_level: ["alto", "medio", "bajo"],
      reliability_level: ["alto", "medio", "bajo"],
      sentiment_type: ["positivo", "neutral", "negativo"],
      source_type: [
        "oficial",
        "medio_nacional",
        "medio_regional",
        "blog",
        "red_social",
      ],
    },
  },
} as const
