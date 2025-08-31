export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string
          is_premium?: boolean
          is_admin?: boolean
        }
        Insert: {
          id: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string
          is_premium?: boolean
          is_admin?: boolean
        }
        Update: {
          id?: string
          updated_at?: string
          username?: string
          full_name?: string
          avatar_url?: string
          is_premium?: boolean
          is_admin?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          id: number
          stripe_secret_key?: string
          stripe_webhook_secret?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: number
          stripe_secret_key?: string
          stripe_webhook_secret?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          stripe_secret_key?: string
          stripe_webhook_secret?: string
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          stripe_session_id?: string
          amount?: number
          status?: string
          payment_method?: string
          created_at?: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_session_id?: string
          amount?: number
          status?: string
          payment_method?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_session_id?: string
          amount?: number
          status?: string
          payment_method?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
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
  }
}
