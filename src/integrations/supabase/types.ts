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
      access_links: {
        Row: {
          created_at: string
          expires_at: string
          game: string
          id: string
          revoked: boolean
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          game: string
          id?: string
          revoked?: boolean
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          game?: string
          id?: string
          revoked?: boolean
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      cards: {
        Row: {
          current_rank: string
          days: string
          description: string | null
          glow: string
          id: string
          matches: string
          medals: number
          name: string
          players: number
          price: number
          rarity: string
          sort_order: number
          success: number
          support: string
          target_rank: string
        }
        Insert: {
          current_rank: string
          days: string
          description?: string | null
          glow: string
          id: string
          matches: string
          medals?: number
          name: string
          players?: number
          price: number
          rarity: string
          sort_order?: number
          success?: number
          support: string
          target_rank: string
        }
        Update: {
          current_rank?: string
          days?: string
          description?: string | null
          glow?: string
          id?: string
          matches?: string
          medals?: number
          name?: string
          players?: number
          price?: number
          rarity?: string
          sort_order?: number
          success?: number
          support?: string
          target_rank?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "live_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      coffee_gifts: {
        Row: {
          amount: number
          created_at: string
          id: string
          message: string | null
          recipient_id: string
          sender_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          message?: string | null
          recipient_id: string
          sender_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          message?: string | null
          recipient_id?: string
          sender_id?: string | null
        }
        Relationships: []
      }
      contract_progress: {
        Row: {
          contract_id: string
          created_at: string
          current_rank: string
          id: string
          matches: number
          medals: number
          note: string | null
          percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          current_rank?: string
          id?: string
          matches?: number
          medals?: number
          note?: string | null
          percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          current_rank?: string
          id?: string
          matches?: number
          medals?: number
          note?: string | null
          percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_progress_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          commission_rate: number
          created_at: string
          ends_at: string | null
          id: string
          kind: string
          order_id: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          kind: string
          order_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          ends_at?: string | null
          id?: string
          kind?: string
          order_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          hue: string
          id: string
          label_en: string
          label_pt: string
          starts_at: string | null
          when_en: string
          when_pt: string
        }
        Insert: {
          created_at?: string
          hue: string
          id?: string
          label_en: string
          label_pt: string
          starts_at?: string | null
          when_en: string
          when_pt: string
        }
        Update: {
          created_at?: string
          hue?: string
          id?: string
          label_en?: string
          label_pt?: string
          starts_at?: string | null
          when_en?: string
          when_pt?: string
        }
        Relationships: []
      }
      friends: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string | null
          rank: string
          tag: string
          xp: number
          xp_max: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id?: string | null
          rank: string
          tag: string
          xp?: number
          xp_max?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string | null
          rank?: string
          tag?: string
          xp?: number
          xp_max?: number
        }
        Relationships: []
      }
      highlights: {
        Row: {
          created_at: string
          duration: string
          game: string
          hue: string
          id: string
          insights: Json | null
          is_public: boolean
          kda: string
          map: string
          match_date: string
          tags: string[]
          timeline: Json | null
          title_en: string
          title_pt: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          duration: string
          game: string
          hue: string
          id?: string
          insights?: Json | null
          is_public?: boolean
          kda: string
          map: string
          match_date: string
          tags?: string[]
          timeline?: Json | null
          title_en: string
          title_pt: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          duration?: string
          game?: string
          hue?: string
          id?: string
          insights?: Json | null
          is_public?: boolean
          kda?: string
          map?: string
          match_date?: string
          tags?: string[]
          timeline?: Json | null
          title_en?: string
          title_pt?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      live_rooms: {
        Row: {
          ended_at: string | null
          game: string
          id: string
          is_live: boolean
          provider: string
          provider_room_id: string | null
          provider_url: string | null
          started_at: string
          title: string
          user_id: string
          viewer_count: number
        }
        Insert: {
          ended_at?: string | null
          game: string
          id?: string
          is_live?: boolean
          provider?: string
          provider_room_id?: string | null
          provider_url?: string | null
          started_at?: string
          title: string
          user_id: string
          viewer_count?: number
        }
        Update: {
          ended_at?: string | null
          game?: string
          id?: string
          is_live?: boolean
          provider?: string
          provider_room_id?: string | null
          provider_url?: string | null
          started_at?: string
          title?: string
          user_id?: string
          viewer_count?: number
        }
        Relationships: []
      }
      missions: {
        Row: {
          cycle: string
          id: string
          label_en: string
          label_pt: string
          sort_order: number
          total: number
          xp: number
        }
        Insert: {
          cycle: string
          id?: string
          label_en: string
          label_pt: string
          sort_order?: number
          total?: number
          xp?: number
        }
        Update: {
          cycle?: string
          id?: string
          label_en?: string
          label_pt?: string
          sort_order?: number
          total?: number
          xp?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body_en: string
          body_pt: string
          created_at: string
          id: string
          kind: string
          metadata: Json | null
          read: boolean
          title_en: string
          title_pt: string
          user_id: string
        }
        Insert: {
          body_en: string
          body_pt: string
          created_at?: string
          id?: string
          kind: string
          metadata?: Json | null
          read?: boolean
          title_en: string
          title_pt: string
          user_id: string
        }
        Update: {
          body_en?: string
          body_pt?: string
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json | null
          read?: boolean
          title_en?: string
          title_pt?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          card_id: string
          completed_at: string | null
          created_at: string
          id: string
          mode: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mode?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mode?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_intents: {
        Row: {
          amount: number
          card_id: string
          commission: number
          created_at: string
          id: string
          method: string
          mode: string
          order_id: string | null
          reference: string
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          card_id: string
          commission?: number
          created_at?: string
          id?: string
          method?: string
          mode?: string
          order_id?: string | null
          reference: string
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          card_id?: string
          commission?: number
          created_at?: string
          id?: string
          method?: string
          mode?: string
          order_id?: string | null
          reference?: string
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_intents_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_intents_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payout_requests: {
        Row: {
          amount: number
          created_at: string
          destination: string
          id: string
          method: string
          note: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          destination: string
          id?: string
          method: string
          note?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          destination?: string
          id?: string
          method?: string
          note?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accent: string
          active_card_id: string | null
          avatar_url: string | null
          banner_url: string | null
          bio: string
          created_at: string
          id: string
          mode: string
          name: string
          title: string
          updated_at: string
        }
        Insert: {
          accent?: string
          active_card_id?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string
          created_at?: string
          id: string
          mode?: string
          name?: string
          title?: string
          updated_at?: string
        }
        Update: {
          accent?: string
          active_card_id?: string | null
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string
          created_at?: string
          id?: string
          mode?: string
          name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      stats: {
        Row: {
          accuracy: number
          heroes: number
          hours: number
          id: string
          kd: number
          mvps: number
          trend: number[]
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          accuracy?: number
          heroes?: number
          hours?: number
          id?: string
          kd?: number
          mvps?: number
          trend?: number[]
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          accuracy?: number
          heroes?: number
          hours?: number
          id?: string
          kd?: number
          mvps?: number
          trend?: number[]
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      user_mission_progress: {
        Row: {
          claimed: boolean
          completed: boolean
          created_at: string
          id: string
          mission_id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          claimed?: boolean
          completed?: boolean
          created_at?: string
          id?: string
          mission_id: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          claimed?: boolean
          completed?: boolean
          created_at?: string
          id?: string
          mission_id?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mission_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
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
          role?: Database["public"]["Enums"]["app_role"]
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          kind: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          kind: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          kind?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          coffee_count: number
          created_at: string
          id: string
          pending: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          coffee_count?: number
          created_at?: string
          id?: string
          pending?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          coffee_count?: number
          created_at?: string
          id?: string
          pending?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_wallet_delta: {
        Args: {
          _amount: number
          _coffee_delta?: number
          _description: string
          _kind: string
          _metadata?: Json
          _pending_delta?: number
          _user_id: string
        }
        Returns: number
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
