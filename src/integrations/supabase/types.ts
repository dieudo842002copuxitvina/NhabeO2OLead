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
      ai_rules: {
        Row: {
          banner: Json
          config: Json
          created_at: string
          created_by: string | null
          id: string
          name: string
          region: string | null
          rule_type: string
          status: string
          updated_at: string
        }
        Insert: {
          banner?: Json
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          region?: string | null
          rule_type: string
          status?: string
          updated_at?: string
        }
        Update: {
          banner?: Json
          config?: Json
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          region?: string | null
          rule_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      bom_templates: {
        Row: {
          active: boolean
          area_basis_ha: number
          created_at: string
          crop_key: string
          crop_label: string
          id: string
          items: Json
          notes: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          area_basis_ha?: number
          created_at?: string
          crop_key: string
          crop_label: string
          id?: string
          items?: Json
          notes?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          area_basis_ha?: number
          created_at?: string
          crop_key?: string
          crop_label?: string
          id?: string
          items?: Json
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      calculator_leads: {
        Row: {
          area_m2: number
          created_at: string
          crop: string
          customer_name: string
          customer_phone: string
          customer_province: string | null
          dealer_id: string | null
          id: string
          notes: string | null
          nozzle_count: number
          pipe_meters: number
          pump_hp: number
          slope: string
          spacing: string
          status: string
          status_history: Json
          total_cost: number
          user_id: string | null
          water_source: string
        }
        Insert: {
          area_m2: number
          created_at?: string
          crop: string
          customer_name: string
          customer_phone: string
          customer_province?: string | null
          dealer_id?: string | null
          id?: string
          notes?: string | null
          nozzle_count: number
          pipe_meters: number
          pump_hp: number
          slope: string
          spacing: string
          status?: string
          status_history?: Json
          total_cost: number
          user_id?: string | null
          water_source: string
        }
        Update: {
          area_m2?: number
          created_at?: string
          crop?: string
          customer_name?: string
          customer_phone?: string
          customer_province?: string | null
          dealer_id?: string | null
          id?: string
          notes?: string | null
          nozzle_count?: number
          pipe_meters?: number
          pump_hp?: number
          slope?: string
          spacing?: string
          status?: string
          status_history?: Json
          total_cost?: number
          user_id?: string | null
          water_source?: string
        }
        Relationships: []
      }
      calculator_params: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          label: string
          unit: string | null
          updated_at: string
          value: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          label: string
          unit?: string | null
          updated_at?: string
          value: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          label?: string
          unit?: string | null
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      cms_articles: {
        Row: {
          author_id: string | null
          body: string
          category: string
          cover_image: string | null
          created_at: string
          crop_tags: string[]
          excerpt: string | null
          featured: boolean
          id: string
          published_at: string | null
          related_product_ids: string[]
          slug: string
          status: string
          tags: string[]
          terrain_tags: string[]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          body?: string
          category?: string
          cover_image?: string | null
          created_at?: string
          crop_tags?: string[]
          excerpt?: string | null
          featured?: boolean
          id?: string
          published_at?: string | null
          related_product_ids?: string[]
          slug: string
          status?: string
          tags?: string[]
          terrain_tags?: string[]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          body?: string
          category?: string
          cover_image?: string | null
          created_at?: string
          crop_tags?: string[]
          excerpt?: string | null
          featured?: boolean
          id?: string
          published_at?: string | null
          related_product_ids?: string[]
          slug?: string
          status?: string
          tags?: string[]
          terrain_tags?: string[]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      cms_case_studies: {
        Row: {
          area_ha: number | null
          body: string
          cover_image: string | null
          created_at: string
          crop: string | null
          customer_name: string | null
          dealer_name: string | null
          district: string | null
          featured: boolean
          gallery: string[]
          id: string
          installer_name: string | null
          province: string | null
          published_at: string | null
          related_product_ids: string[]
          slug: string
          status: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          area_ha?: number | null
          body?: string
          cover_image?: string | null
          created_at?: string
          crop?: string | null
          customer_name?: string | null
          dealer_name?: string | null
          district?: string | null
          featured?: boolean
          gallery?: string[]
          id?: string
          installer_name?: string | null
          province?: string | null
          published_at?: string | null
          related_product_ids?: string[]
          slug: string
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          area_ha?: number | null
          body?: string
          cover_image?: string | null
          created_at?: string
          crop?: string | null
          customer_name?: string | null
          dealer_name?: string | null
          district?: string | null
          featured?: boolean
          gallery?: string[]
          id?: string
          installer_name?: string | null
          province?: string | null
          published_at?: string | null
          related_product_ids?: string[]
          slug?: string
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      crop_tags: {
        Row: {
          active: boolean
          created_at: string
          icon: string | null
          id: string
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          created_at: string
          crop_key: string
          crop_label: string
          id: string
          price_vnd: number
          province: string
          recorded_at: string
          source: string | null
          unit: string
        }
        Insert: {
          created_at?: string
          crop_key: string
          crop_label: string
          id?: string
          price_vnd: number
          province?: string
          recorded_at?: string
          source?: string | null
          unit?: string
        }
        Update: {
          created_at?: string
          crop_key?: string
          crop_label?: string
          id?: string
          price_vnd?: number
          province?: string
          recorded_at?: string
          source?: string | null
          unit?: string
        }
        Relationships: []
      }
      product_specialty_groups: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          attributes: Json
          price: number
          category: string
          created_at: string
          created_by: string | null
          crop_tags: string[]
          description: string | null
          id: string
          image: string | null
          media: Json
          name: string
          slug: string
          specialty_group_key: string | null
          stock: number
          tags: string[]
          terrain_tags: string[]
          unit: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          active?: boolean
          attributes?: Json
          price?: number
          category: string
          created_at?: string
          created_by?: string | null
          crop_tags?: string[]
          description?: string | null
          id?: string
          image?: string | null
          media?: Json
          name: string
          slug: string
          specialty_group_key?: string | null
          stock?: number
          tags?: string[]
          terrain_tags?: string[]
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          active?: boolean
          attributes?: Json
          price?: number
          category?: string
          created_at?: string
          created_by?: string | null
          crop_tags?: string[]
          description?: string | null
          id?: string
          image?: string | null
          media?: Json
          name?: string
          slug?: string
          specialty_group_key?: string | null
          stock?: number
          tags?: string[]
          terrain_tags?: string[]
          unit?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_specialty_group_key_fkey"
            columns: ["specialty_group_key"]
            isOneToOne: false
            referencedRelation: "product_specialty_groups"
            referencedColumns: ["key"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      terrain_tags: {
        Row: {
          active: boolean
          created_at: string
          icon: string | null
          id: string
          key: string
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          key: string
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          icon?: string | null
          id?: string
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          created_at: string
          event_id: string
          event_name: string
          fb_status: string | null
          id: string
          ip_address: string | null
          payload: Json
          referrer: string | null
          session_id: string | null
          tiktok_status: string | null
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_id: string
          event_name: string
          fb_status?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json
          referrer?: string | null
          session_id?: string | null
          tiktok_status?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_id?: string
          event_name?: string
          fb_status?: string | null
          id?: string
          ip_address?: string | null
          payload?: Json
          referrer?: string | null
          session_id?: string | null
          tiktok_status?: string | null
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      invitations: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          role: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          role: string
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          role?: string
          status?: string
          token?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_admin_notify_recipients: {
        Args: never
        Returns: {
          display_name: string
          email: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "dealer"
        | "technician"
        | "customer"
        | "bi_viewer"
        | "ai_editor"
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
      app_role: [
        "admin",
        "dealer",
        "technician",
        "customer",
        "bi_viewer",
        "ai_editor",
      ],
    },
  },
} as const
