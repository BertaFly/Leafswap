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
      care_logs: {
        Row: {
          id: string
          logged_at: string | null
          notes: string | null
          photo_url: string | null
          plant_id: string
          type: Database["public"]["Enums"]["care_log_type"]
        }
        Insert: {
          id?: string
          logged_at?: string | null
          notes?: string | null
          photo_url?: string | null
          plant_id: string
          type: Database["public"]["Enums"]["care_log_type"]
        }
        Update: {
          id?: string
          logged_at?: string | null
          notes?: string | null
          photo_url?: string | null
          plant_id?: string
          type?: Database["public"]["Enums"]["care_log_type"]
        }
        Relationships: [
          {
            foreignKeyName: "care_logs_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          participant_1: string
          participant_2: string
          post_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1: string
          participant_2: string
          post_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          participant_1?: string
          participant_2?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_participant_1_fkey"
            columns: ["participant_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_participant_2_fkey"
            columns: ["participant_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          acquired_at: string | null
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          nickname: string | null
          owner_id: string
          photo_urls: string[] | null
          scientific_name: string | null
          source_swap_id: string | null
          species: string
        }
        Insert: {
          acquired_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          nickname?: string | null
          owner_id: string
          photo_urls?: string[] | null
          scientific_name?: string | null
          source_swap_id?: string | null
          species: string
        }
        Update: {
          acquired_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          nickname?: string | null
          owner_id?: string
          photo_urls?: string[] | null
          scientific_name?: string | null
          source_swap_id?: string | null
          species?: string
        }
        Relationships: [
          {
            foreignKeyName: "plants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plants_source_swap_id_fkey"
            columns: ["source_swap_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
      }
      post_plants: {
        Row: {
          id: string
          plant_id: string | null
          post_id: string
          role: Database["public"]["Enums"]["post_plant_role"]
          species_name: string | null
        }
        Insert: {
          id?: string
          plant_id?: string | null
          post_id: string
          role: Database["public"]["Enums"]["post_plant_role"]
          species_name?: string | null
        }
        Update: {
          id?: string
          plant_id?: string | null
          post_id?: string
          role?: Database["public"]["Enums"]["post_plant_role"]
          species_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_plants_plant_id_fkey"
            columns: ["plant_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_plants_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          created_at: string | null
          description: string | null
          id: string
          status: Database["public"]["Enums"]["post_status"] | null
          title: string
          type: Database["public"]["Enums"]["post_type"]
        }
        Insert: {
          author_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          title: string
          type: Database["public"]["Enums"]["post_type"]
        }
        Update: {
          author_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["post_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["post_type"]
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          avg_rating: number | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          id: string
          location: string | null
          swap_count: number | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          location?: string | null
          swap_count?: number | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          location?: string | null
          swap_count?: number | null
          username?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          score: number
          source_user_id: string
          swap_id: string
          target_user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          score: number
          source_user_id: string
          swap_id: string
          target_user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          score?: number
          source_user_id?: string
          swap_id?: string
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_source_user_id_fkey"
            columns: ["source_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      swap_requested_plants: {
        Row: {
          post_plant_id: string
          swap_id: string
        }
        Insert: {
          post_plant_id: string
          swap_id: string
        }
        Update: {
          post_plant_id?: string
          swap_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "swap_requested_plants_post_plant_id_fkey"
            columns: ["post_plant_id"]
            isOneToOne: false
            referencedRelation: "post_plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_requested_plants_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: false
            referencedRelation: "swaps"
            referencedColumns: ["id"]
          },
        ]
      }
      swaps: {
        Row: {
          completed_at: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          initiator_id: string
          offer_note: string | null
          post_id: string
          receiver_id: string
          status: Database["public"]["Enums"]["swap_status"] | null
        }
        Insert: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          initiator_id: string
          offer_note?: string | null
          post_id: string
          receiver_id: string
          status?: Database["public"]["Enums"]["swap_status"] | null
        }
        Update: {
          completed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          initiator_id?: string
          offer_note?: string | null
          post_id?: string
          receiver_id?: string
          status?: Database["public"]["Enums"]["swap_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "swaps_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swaps_initiator_id_fkey"
            columns: ["initiator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swaps_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swaps_receiver_id_fkey"
            columns: ["receiver_id"]
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
      [_ in never]: never
    }
    Enums: {
      care_log_type:
        | "watering"
        | "fertilising"
        | "repotting"
        | "pruning"
        | "misting"
        | "other"
      post_plant_role: "offered" | "sought"
      post_status: "active" | "completed" | "cancelled"
      post_type: "offering_swap" | "seeking" | "giveaway"
      swap_status: "pending" | "agreed" | "completed" | "cancelled"
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
      care_log_type: [
        "watering",
        "fertilising",
        "repotting",
        "pruning",
        "misting",
        "other",
      ],
      post_plant_role: ["offered", "sought"],
      post_status: ["active", "completed", "cancelled"],
      post_type: ["offering_swap", "seeking", "giveaway"],
      swap_status: ["pending", "agreed", "completed", "cancelled"],
    },
  },
} as const
