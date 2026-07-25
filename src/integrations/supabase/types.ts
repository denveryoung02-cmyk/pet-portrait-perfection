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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adventure_pack_assets: {
        Row: {
          asset_type: string
          created_at: string
          id: string
          order_id: string
          primary_generation_id: string
          public_url: string | null
          status: string
          storage_path: string | null
          updated_at: string
        }
        Insert: {
          asset_type: string
          created_at?: string
          id?: string
          order_id: string
          primary_generation_id: string
          public_url?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Update: {
          asset_type?: string
          created_at?: string
          id?: string
          order_id?: string
          primary_generation_id?: string
          public_url?: string | null
          status?: string
          storage_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adventure_pack_assets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adventure_pack_assets_primary_generation_id_fkey"
            columns: ["primary_generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
        ]
      }
      content_jobs: {
        Row: {
          cost: number | null
          created_at: string | null
          error_log: string | null
          final_video_path: string | null
          hashtags: string | null
          id: string
          portrait_path: string | null
          post_description: string | null
          publer_job_id: string | null
          script: string | null
          status: string
          topic: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          cost?: number | null
          created_at?: string | null
          error_log?: string | null
          final_video_path?: string | null
          hashtags?: string | null
          id?: string
          portrait_path?: string | null
          post_description?: string | null
          publer_job_id?: string | null
          script?: string | null
          status?: string
          topic?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          cost?: number | null
          created_at?: string | null
          error_log?: string | null
          final_video_path?: string | null
          hashtags?: string | null
          id?: string
          portrait_path?: string | null
          post_description?: string | null
          publer_job_id?: string | null
          script?: string | null
          status?: string
          topic?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          generation_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generation_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generation_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events: {
        Row: {
          created_at: string
          event: string
          id: string
          properties: Json | null
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          properties?: Json | null
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          properties?: Json | null
        }
        Relationships: []
      }
      generations: {
        Row: {
          art_style: string | null
          clean_path: string | null
          created_at: string
          error: string | null
          generation_params: Json | null
          id: string
          preview_url: string | null
          prompt: string | null
          result_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["generation_status"]
          storage_path: string | null
          theme: string
          updated_at: string
          uploaded_image_id: string | null
          user_id: string
        }
        Insert: {
          art_style?: string | null
          clean_path?: string | null
          created_at?: string
          error?: string | null
          generation_params?: Json | null
          id?: string
          preview_url?: string | null
          prompt?: string | null
          result_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
          storage_path?: string | null
          theme: string
          updated_at?: string
          uploaded_image_id?: string | null
          user_id: string
        }
        Update: {
          art_style?: string | null
          clean_path?: string | null
          created_at?: string
          error?: string | null
          generation_params?: Json | null
          id?: string
          preview_url?: string | null
          prompt?: string | null
          result_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["generation_status"]
          storage_path?: string | null
          theme?: string
          updated_at?: string
          uploaded_image_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_uploaded_image_id_fkey"
            columns: ["uploaded_image_id"]
            isOneToOne: false
            referencedRelation: "uploaded_images"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_profiles: {
        Row: {
          achievement_badge: string | null
          adventure_class: string | null
          adventure_rank: string | null
          certificate_virtue: string | null
          favourite_snack: string | null
          first_viewed_at: string | null
          generated_at: string
          hero_name: string | null
          id: string
          mission_statement: string | null
          order_id: string
          origin_story: string | null
          pack_number: number
          pet_name: string | null
          primary_generation_id: string
          special_ability: string | null
        }
        Insert: {
          achievement_badge?: string | null
          adventure_class?: string | null
          adventure_rank?: string | null
          certificate_virtue?: string | null
          favourite_snack?: string | null
          first_viewed_at?: string | null
          generated_at?: string
          hero_name?: string | null
          id?: string
          mission_statement?: string | null
          order_id: string
          origin_story?: string | null
          pack_number?: number
          pet_name?: string | null
          primary_generation_id: string
          special_ability?: string | null
        }
        Update: {
          achievement_badge?: string | null
          adventure_class?: string | null
          adventure_rank?: string | null
          certificate_virtue?: string | null
          favourite_snack?: string | null
          first_viewed_at?: string | null
          generated_at?: string
          hero_name?: string | null
          id?: string
          mission_statement?: string | null
          order_id?: string
          origin_story?: string | null
          pack_number?: number
          pet_name?: string | null
          primary_generation_id?: string
          special_ability?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_profiles_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_profiles_primary_generation_id_fkey"
            columns: ["primary_generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          generation_id: string | null
          id: string
          options: Json | null
          order_id: string
          product_id: string | null
          quantity: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          generation_id?: string | null
          id?: string
          options?: Json | null
          order_id: string
          product_id?: string | null
          quantity?: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          generation_id?: string | null
          id?: string
          options?: Json | null
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          bundle_email_sent: boolean
          created_at: string
          currency: string
          id: string
          order_type: string
          shipping_address: Json | null
          shipping_cents: number
          status: Database["public"]["Enums"]["order_status"]
          stripe_session_id: string | null
          subtotal_cents: number
          total_cents: number
          tracking_number: string | null
          updated_at: string
          user_id: string
          video_task_id: string | null
          video_url: string | null
          wants_bundle: boolean | null
          wants_video: boolean | null
        }
        Insert: {
          bundle_email_sent?: boolean
          created_at?: string
          currency?: string
          id?: string
          order_type?: string
          shipping_address?: Json | null
          shipping_cents?: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          subtotal_cents?: number
          total_cents?: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
          video_task_id?: string | null
          video_url?: string | null
          wants_bundle?: boolean | null
          wants_video?: boolean | null
        }
        Update: {
          bundle_email_sent?: boolean
          created_at?: string
          currency?: string
          id?: string
          order_type?: string
          shipping_address?: Json | null
          shipping_cents?: number
          status?: Database["public"]["Enums"]["order_status"]
          stripe_session_id?: string | null
          subtotal_cents?: number
          total_cents?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
          video_task_id?: string | null
          video_url?: string | null
          wants_bundle?: boolean | null
          wants_video?: boolean | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_cents: number
          slug: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_cents: number
          slug: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          slug?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          preview_url: string | null
          prompt_template: string | null
          slug: string
          tagline: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          preview_url?: string | null
          prompt_template?: string | null
          slug: string
          tagline?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          preview_url?: string | null
          prompt_template?: string | null
          slug?: string
          tagline?: string | null
        }
        Relationships: []
      }
      uploaded_images: {
        Row: {
          created_at: string
          id: string
          pet_name: string | null
          public_url: string | null
          storage_path: string
          subject_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          pet_name?: string | null
          public_url?: string | null
          storage_path: string
          subject_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          pet_name?: string | null
          public_url?: string | null
          storage_path?: string
          subject_type?: string | null
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
    }
    Enums: {
      app_role: "admin" | "user"
      generation_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "rejected"
      order_status:
        | "pending"
        | "paid"
        | "in_production"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
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
    ? DefaultSchema["CompositeTypes"][CompositeTypeName]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      generation_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "rejected",
      ],
      order_status: [
        "pending",
        "paid",
        "in_production",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
