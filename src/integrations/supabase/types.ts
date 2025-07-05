export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      project_team_members: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          team_member_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          team_member_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          team_member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_team_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_team_members_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          name: string
          progress: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          progress?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          progress?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      qa_issue_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          qa_issue_id: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          qa_issue_id?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          qa_issue_id?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_issue_attachments_qa_issue_id_fkey"
            columns: ["qa_issue_id"]
            isOneToOne: false
            referencedRelation: "qa_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_issue_mentions: {
        Row: {
          created_at: string
          id: string
          mentioned_by: string
          mentioned_user_id: string | null
          qa_issue_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mentioned_by: string
          mentioned_user_id?: string | null
          qa_issue_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mentioned_by?: string
          mentioned_user_id?: string | null
          qa_issue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_issue_mentions_mentioned_user_id_fkey"
            columns: ["mentioned_user_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_issue_mentions_qa_issue_id_fkey"
            columns: ["qa_issue_id"]
            isOneToOne: false
            referencedRelation: "qa_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_issues: {
        Row: {
          actual_result: string | null
          assigned_tester_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          expected_result: string | null
          id: string
          issue_type: string | null
          project_id: string | null
          screenshot_url: string | null
          severity: string | null
          status: string | null
          steps_to_reproduce: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_result?: string | null
          assigned_tester_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_result?: string | null
          id?: string
          issue_type?: string | null
          project_id?: string | null
          screenshot_url?: string | null
          severity?: string | null
          status?: string | null
          steps_to_reproduce?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_result?: string | null
          assigned_tester_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          expected_result?: string | null
          id?: string
          issue_type?: string | null
          project_id?: string | null
          screenshot_url?: string | null
          severity?: string | null
          status?: string | null
          steps_to_reproduce?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qa_issues_assigned_tester_id_fkey"
            columns: ["assigned_tester_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_issues_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          project_id: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assignee_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          project_id?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string | null
          current_tasks: number | null
          id: string
          max_capacity: number | null
          name: string
          role: string
          skills: string[] | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          current_tasks?: number | null
          id?: string
          max_capacity?: number | null
          name: string
          role: string
          skills?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string | null
          current_tasks?: number | null
          id?: string
          max_capacity?: number | null
          name?: string
          role?: string
          skills?: string[] | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      test_cases: {
        Row: {
          assigned_tester_id: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          project_id: string | null
          screenshot_url: string | null
          severity: string
          status: string
          test_type: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_tester_id?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          project_id?: string | null
          screenshot_url?: string | null
          severity?: string
          status?: string
          test_type?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_tester_id?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          project_id?: string | null
          screenshot_url?: string | null
          severity?: string
          status?: string
          test_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_assigned_tester_id_fkey"
            columns: ["assigned_tester_id"]
            isOneToOne: false
            referencedRelation: "team_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
