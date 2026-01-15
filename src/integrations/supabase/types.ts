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
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          recipes_data: Json | null
          role: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          recipes_data?: Json | null
          role: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          recipes_data?: Json | null
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          has_completed_onboarding: boolean
          id: string
          is_pro: boolean
          name: string | null
          preferences: Json | null
          updated_at: string
          weekly_usage_count: number
          weekly_usage_reset_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          has_completed_onboarding?: boolean
          id: string
          is_pro?: boolean
          name?: string | null
          preferences?: Json | null
          updated_at?: string
          weekly_usage_count?: number
          weekly_usage_reset_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          has_completed_onboarding?: boolean
          id?: string
          is_pro?: boolean
          name?: string | null
          preferences?: Json | null
          updated_at?: string
          weekly_usage_count?: number
          weekly_usage_reset_at?: string
        }
        Relationships: []
      }
      recipe_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string
          description: string | null
          difficulty: string
          id: string
          image_url: string | null
          ingredients: Json
          is_manual: boolean | null
          prep_time_minutes: number
          servings: number
          source_ingredients: string[] | null
          steps: string[]
          tags: string[] | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          image_url?: string | null
          ingredients?: Json
          is_manual?: boolean | null
          prep_time_minutes?: number
          servings?: number
          source_ingredients?: string[] | null
          steps?: string[]
          tags?: string[] | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          difficulty?: string
          id?: string
          image_url?: string | null
          ingredients?: Json
          is_manual?: boolean | null
          prep_time_minutes?: number
          servings?: number
          source_ingredients?: string[] | null
          steps?: string[]
          tags?: string[] | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      saved_recipes: {
        Row: {
          created_at: string
          folder_id: string | null
          id: string
          recipe_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          folder_id?: string | null
          id?: string
          recipe_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          folder_id?: string | null
          id?: string
          recipe_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_recipes_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "recipe_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_recipes_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_list_items: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_purchased: boolean
          name: string
          purchased_at: string | null
          quantity: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_purchased?: boolean
          name: string
          purchased_at?: string | null
          quantity?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_purchased?: boolean
          name?: string
          purchased_at?: string | null
          quantity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sponsored_content: {
        Row: {
          clicks: number
          created_at: string
          cta_text: string
          cta_url: string
          description: string | null
          end_date: string | null
          id: string
          image_url: string | null
          impressions: number
          is_active: boolean
          placement: string
          priority: number
          sponsor_name: string
          start_date: string | null
          title: string
        }
        Insert: {
          clicks?: number
          created_at?: string
          cta_text: string
          cta_url: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          placement: string
          priority?: number
          sponsor_name: string
          start_date?: string | null
          title: string
        }
        Update: {
          clicks?: number
          created_at?: string
          cta_text?: string
          cta_url?: string
          description?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          placement?: string
          priority?: number
          sponsor_name?: string
          start_date?: string | null
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_sponsored_clicks: {
        Args: { content_id: string }
        Returns: undefined
      }
      increment_sponsored_impressions: {
        Args: { content_id: string }
        Returns: undefined
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
