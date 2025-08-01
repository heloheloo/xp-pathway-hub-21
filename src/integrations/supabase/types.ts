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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_tasks: {
        Row: {
          admin_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          month: number
          task_type: string
          title: string
          updated_at: string
          year: number
        }
        Insert: {
          admin_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          month: number
          task_type: string
          title: string
          updated_at?: string
          year: number
        }
        Update: {
          admin_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          month?: number
          task_type?: string
          title?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "admin_tasks_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          admin_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meets: {
        Row: {
          admin_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          group_id: string | null
          id: string
          meet_link: string | null
          meet_type: string
          scheduled_date: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          group_id?: string | null
          id?: string
          meet_link?: string | null
          meet_type: string
          scheduled_date: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          group_id?: string | null
          id?: string
          meet_link?: string | null
          meet_type?: string
          scheduled_date?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "meets_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meets_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          created_at_profile: string | null
          email: string | null
          group_id: string | null
          id: string
          level: number | null
          role: string
          status: string | null
          updated_at: string
          user_id: string
          username: string
          xp: number | null
        }
        Insert: {
          created_at?: string
          created_at_profile?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          level?: number | null
          role: string
          status?: string | null
          updated_at?: string
          user_id: string
          username: string
          xp?: number | null
        }
        Update: {
          created_at?: string
          created_at_profile?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          level?: number | null
          role?: string
          status?: string | null
          updated_at?: string
          user_id?: string
          username?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_group"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          admin_id: string | null
          created_at: string
          description: string | null
          feedback: string | null
          file_data: string | null
          file_name: string | null
          id: string
          project_link: string | null
          reviewed_at: string | null
          status: string | null
          student_id: string
          submitted_at: string
          title: string
          updated_at: string
          xp_awarded: number | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          feedback?: string | null
          file_data?: string | null
          file_name?: string | null
          id?: string
          project_link?: string | null
          reviewed_at?: string | null
          status?: string | null
          student_id: string
          submitted_at?: string
          title: string
          updated_at?: string
          xp_awarded?: number | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          description?: string | null
          feedback?: string | null
          file_data?: string | null
          file_name?: string | null
          id?: string
          project_link?: string | null
          reviewed_at?: string | null
          status?: string | null
          student_id?: string
          submitted_at?: string
          title?: string
          updated_at?: string
          xp_awarded?: number | null
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          admin_id: string
          amount: number
          created_at: string
          id: string
          reason: string
          student_id: string
          transaction_type: string
        }
        Insert: {
          admin_id: string
          amount: number
          created_at?: string
          id?: string
          reason: string
          student_id: string
          transaction_type: string
        }
        Update: {
          admin_id?: string
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          student_id?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "xp_transactions_student_id_fkey"
            columns: ["student_id"]
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
      calculate_level: {
        Args: { xp_points: number }
        Returns: number
      }
      exec_as_superadmin: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_group_student_count: {
        Args: { group_uuid: string }
        Returns: number
      }
      get_user_role_direct: {
        Args: { user_uuid: string }
        Returns: string
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
