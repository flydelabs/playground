export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      apps: {
        Row: {
          creation_date: string
          creator_id: string | null
          creator_name: string | null
          files: Json
          forked_from: number | null
          id: string
          last_updated_date: string
          title: string
          view_count: number
        }
        Insert: {
          creation_date?: string
          creator_id?: string | null
          creator_name?: string | null
          files: Json
          forked_from?: number | null
          id?: string
          last_updated_date?: string
          title: string
          view_count?: number
        }
        Update: {
          creation_date?: string
          creator_id?: string | null
          creator_name?: string | null
          files?: Json
          forked_from?: number | null
          id?: string
          last_updated_date?: string
          title?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "apps_creator_id_fkey"
            columns: ["creator_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
