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
      admin_gifts: {
        Row: {
          claimed_at: string | null
          created_at: string
          id: string
          item_id: string | null
          kind: string
          note: string | null
          qty: number
          recipient_user_id: string | null
          recipient_username: string
          sender: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          kind: string
          note?: string | null
          qty: number
          recipient_user_id?: string | null
          recipient_username: string
          sender?: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          kind?: string
          note?: string | null
          qty?: number
          recipient_user_id?: string | null
          recipient_username?: string
          sender?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          challenger_id: string
          challenger_name: string
          challenger_pet: Json
          created_at: string
          id: string
          opponent_id: string
          opponent_name: string
          opponent_pet: Json | null
          stake_pet: boolean
          status: string
          winner_id: string | null
        }
        Insert: {
          challenger_id: string
          challenger_name: string
          challenger_pet: Json
          created_at?: string
          id?: string
          opponent_id: string
          opponent_name: string
          opponent_pet?: Json | null
          stake_pet?: boolean
          status?: string
          winner_id?: string | null
        }
        Update: {
          challenger_id?: string
          challenger_name?: string
          challenger_pet?: Json
          created_at?: string
          id?: string
          opponent_id?: string
          opponent_name?: string
          opponent_pet?: Json | null
          stake_pet?: boolean
          status?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      game_saves: {
        Row: {
          data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      group_legendary_state: {
        Row: {
          captured_at: string
          captured_by: string | null
          captured_name: string | null
          map_id: string
          party_id: string | null
          spawn_id: string
          species: string
        }
        Insert: {
          captured_at?: string
          captured_by?: string | null
          captured_name?: string | null
          map_id: string
          party_id?: string | null
          spawn_id: string
          species: string
        }
        Update: {
          captured_at?: string
          captured_by?: string | null
          captured_name?: string | null
          map_id?: string
          party_id?: string | null
          spawn_id?: string
          species?: string
        }
        Relationships: []
      }
      guild_invites: {
        Row: {
          created_at: string
          from_user_id: string
          from_username: string
          guild_id: string
          guild_name: string
          id: string
          status: string
          to_user_id: string | null
          to_username: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          from_username: string
          guild_id: string
          guild_name: string
          id?: string
          status?: string
          to_user_id?: string | null
          to_username: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          from_username?: string
          guild_id?: string
          guild_name?: string
          id?: string
          status?: string
          to_user_id?: string | null
          to_username?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_invites_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          joined_at: string
          leader_species: string | null
          level: number
          role: string
          user_id: string
          username: string
        }
        Insert: {
          guild_id: string
          joined_at?: string
          leader_species?: string | null
          level?: number
          role?: string
          user_id: string
          username: string
        }
        Update: {
          guild_id?: string
          joined_at?: string
          leader_species?: string | null
          level?: number
          role?: string
          user_id?: string
          username?: string
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
          element: string
          founder_id: string
          id: string
          level: number
          name: string
          total_donated: number
          treasury_crystal: number
          treasury_gold: number
          treasury_ruby: number
          vice_leader_id: string | null
          xp: number
        }
        Insert: {
          created_at?: string
          element: string
          founder_id: string
          id?: string
          level?: number
          name: string
          total_donated?: number
          treasury_crystal?: number
          treasury_gold?: number
          treasury_ruby?: number
          vice_leader_id?: string | null
          xp?: number
        }
        Update: {
          created_at?: string
          element?: string
          founder_id?: string
          id?: string
          level?: number
          name?: string
          total_donated?: number
          treasury_crystal?: number
          treasury_gold?: number
          treasury_ruby?: number
          vice_leader_id?: string | null
          xp?: number
        }
        Relationships: []
      }
      market_listings: {
        Row: {
          buyer_id: string | null
          created_at: string
          currency: string
          id: string
          item_id: string | null
          kind: string
          pet_data: Json | null
          price: number
          qty: number | null
          seller_id: string
          seller_name: string
          sold_at: string | null
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          item_id?: string | null
          kind: string
          pet_data?: Json | null
          price?: number
          qty?: number | null
          seller_id: string
          seller_name: string
          sold_at?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          currency?: string
          id?: string
          item_id?: string | null
          kind?: string
          pet_data?: Json | null
          price?: number
          qty?: number | null
          seller_id?: string
          seller_name?: string
          sold_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      parties: {
        Row: {
          created_at: string
          id: string
          leader_id: string
          leader_name: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          leader_id: string
          leader_name: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          leader_id?: string
          leader_name?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      party_invites: {
        Row: {
          created_at: string
          from_id: string
          from_name: string
          id: string
          party_id: string
          party_name: string
          status: string
          target_id: string
          target_name: string
        }
        Insert: {
          created_at?: string
          from_id: string
          from_name: string
          id?: string
          party_id: string
          party_name: string
          status?: string
          target_id: string
          target_name: string
        }
        Update: {
          created_at?: string
          from_id?: string
          from_name?: string
          id?: string
          party_id?: string
          party_name?: string
          status?: string
          target_id?: string
          target_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_invites_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      party_members: {
        Row: {
          joined_at: string
          last_seen: string
          level: number
          map_id: string | null
          party_id: string
          player_id: string
          player_name: string
        }
        Insert: {
          joined_at?: string
          last_seen?: string
          level?: number
          map_id?: string | null
          party_id: string
          player_id: string
          player_name: string
        }
        Update: {
          joined_at?: string
          last_seen?: string
          level?: number
          map_id?: string | null
          party_id?: string
          player_id?: string
          player_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_members_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          craft_points: number
          dir: string
          guild_name: string | null
          id: string
          leader_rarity: string | null
          leader_species: string | null
          level: number
          map: string
          name: string
          trainer_level: number
          updated_at: string
          x: number
          y: number
        }
        Insert: {
          craft_points?: number
          dir?: string
          guild_name?: string | null
          id: string
          leader_rarity?: string | null
          leader_species?: string | null
          level?: number
          map: string
          name: string
          trainer_level?: number
          updated_at?: string
          x?: number
          y?: number
        }
        Update: {
          craft_points?: number
          dir?: string
          guild_name?: string | null
          id?: string
          leader_rarity?: string | null
          leader_species?: string | null
          level?: number
          map?: string
          name?: string
          trainer_level?: number
          updated_at?: string
          x?: number
          y?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          gold: number
          id: string
          last_login: string
          level: number
          ruby: number
          username: string | null
        }
        Insert: {
          created_at?: string
          gold?: number
          id: string
          last_login?: string
          level?: number
          ruby?: number
          username?: string | null
        }
        Update: {
          created_at?: string
          gold?: number
          id?: string
          last_login?: string
          level?: number
          ruby?: number
          username?: string | null
        }
        Relationships: []
      }
      ranked_history: {
        Row: {
          craft_points: number
          ended_at: string
          guild_name: string | null
          id: string
          rank: number
          score: number
          season_id: string
          trainer_level: number
          user_id: string
          username: string
        }
        Insert: {
          craft_points: number
          ended_at: string
          guild_name?: string | null
          id?: string
          rank: number
          score: number
          season_id: string
          trainer_level: number
          user_id: string
          username: string
        }
        Update: {
          craft_points?: number
          ended_at?: string
          guild_name?: string | null
          id?: string
          rank?: number
          score?: number
          season_id?: string
          trainer_level?: number
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      ranked_leaderboard: {
        Row: {
          craft_points: number
          guild_name: string | null
          score: number | null
          season_id: string
          trainer_level: number
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          craft_points?: number
          guild_name?: string | null
          score?: number | null
          season_id: string
          trainer_level?: number
          updated_at?: string
          user_id: string
          username: string
        }
        Update: {
          craft_points?: number
          guild_name?: string | null
          score?: number | null
          season_id?: string
          trainer_level?: number
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranked_leaderboard_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "ranked_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      ranked_seasons: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_current: boolean
          started_at: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_current?: boolean
          started_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_current?: boolean
          started_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      record_ranked_score: {
        Args: { _craft_points: number; _guild_name?: string; _level: number }
        Returns: undefined
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
