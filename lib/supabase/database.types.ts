// Generado a partir del esquema real del proyecto Supabase (borxeontmmautjxcxmiq).
// No editar a mano: regenerar con `generate_typescript_types` cuando cambie el esquema.

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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          adipose_mass_kg: number | null
          adipose_percentage: number | null
          aks_index: number | null
          assessment_date: string
          bmi: number | null
          bone_mass_kg: number | null
          bone_percentage: number | null
          corrected_arm_girth: number | null
          corrected_calf_girth: number | null
          corrected_thigh_girth: number | null
          created_at: string
          created_by: string
          diameter_bistyloid: number | null
          diameter_femur: number | null
          diameter_humerus: number | null
          fat_free_mass_kg: number | null
          fat_mass_kg: number | null
          fat_percentage: number | null
          girth_calf: number | null
          girth_flexed_arm: number | null
          girth_hip: number | null
          girth_relaxed_arm: number | null
          girth_thigh: number | null
          girth_waist: number | null
          height_cm: number
          id: string
          label: string
          muscle_mass_kg: number | null
          muscle_percentage: number | null
          organization_id: string
          player_id: string
          residual_mass_kg: number | null
          residual_percentage: number | null
          sitting_height_cm: number | null
          skinfold_abdominal: number | null
          skinfold_biceps: number | null
          skinfold_calf: number | null
          skinfold_iliac_crest: number | null
          skinfold_subscapular: number | null
          skinfold_sum_6: number | null
          skinfold_supraspinal: number | null
          skinfold_thigh: number | null
          skinfold_triceps: number | null
          updated_at: string | null
          updated_by: string | null
          weight_kg: number
          wingspan_cm: number | null
        }
        Insert: {
          adipose_mass_kg?: number | null
          adipose_percentage?: number | null
          aks_index?: number | null
          assessment_date: string
          bmi?: number | null
          bone_mass_kg?: number | null
          bone_percentage?: number | null
          corrected_arm_girth?: number | null
          corrected_calf_girth?: number | null
          corrected_thigh_girth?: number | null
          created_at?: string
          created_by: string
          diameter_bistyloid?: number | null
          diameter_femur?: number | null
          diameter_humerus?: number | null
          fat_free_mass_kg?: number | null
          fat_mass_kg?: number | null
          fat_percentage?: number | null
          girth_calf?: number | null
          girth_flexed_arm?: number | null
          girth_hip?: number | null
          girth_relaxed_arm?: number | null
          girth_thigh?: number | null
          girth_waist?: number | null
          height_cm: number
          id?: string
          label: string
          muscle_mass_kg?: number | null
          muscle_percentage?: number | null
          organization_id: string
          player_id: string
          residual_mass_kg?: number | null
          residual_percentage?: number | null
          sitting_height_cm?: number | null
          skinfold_abdominal?: number | null
          skinfold_biceps?: number | null
          skinfold_calf?: number | null
          skinfold_iliac_crest?: number | null
          skinfold_subscapular?: number | null
          skinfold_sum_6?: number | null
          skinfold_supraspinal?: number | null
          skinfold_thigh?: number | null
          skinfold_triceps?: number | null
          updated_at?: string | null
          updated_by?: string | null
          weight_kg: number
          wingspan_cm?: number | null
        }
        Update: {
          adipose_mass_kg?: number | null
          adipose_percentage?: number | null
          aks_index?: number | null
          assessment_date?: string
          bmi?: number | null
          bone_mass_kg?: number | null
          bone_percentage?: number | null
          corrected_arm_girth?: number | null
          corrected_calf_girth?: number | null
          corrected_thigh_girth?: number | null
          created_at?: string
          created_by?: string
          diameter_bistyloid?: number | null
          diameter_femur?: number | null
          diameter_humerus?: number | null
          fat_free_mass_kg?: number | null
          fat_mass_kg?: number | null
          fat_percentage?: number | null
          girth_calf?: number | null
          girth_flexed_arm?: number | null
          girth_hip?: number | null
          girth_relaxed_arm?: number | null
          girth_thigh?: number | null
          girth_waist?: number | null
          height_cm?: number
          id?: string
          label?: string
          muscle_mass_kg?: number | null
          muscle_percentage?: number | null
          organization_id?: string
          player_id?: string
          residual_mass_kg?: number | null
          residual_percentage?: number | null
          sitting_height_cm?: number | null
          skinfold_abdominal?: number | null
          skinfold_biceps?: number | null
          skinfold_calf?: number | null
          skinfold_iliac_crest?: number | null
          skinfold_subscapular?: number | null
          skinfold_sum_6?: number | null
          skinfold_supraspinal?: number | null
          skinfold_thigh?: number | null
          skinfold_triceps?: number | null
          updated_at?: string | null
          updated_by?: string | null
          weight_kg?: number
          wingspan_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_types: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diet_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      food_groups: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_groups_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_types: {
        Row: {
          id: number
          name: string
          sort_order: number
        }
        Insert: {
          id: number
          name: string
          sort_order: number
        }
        Update: {
          id?: number
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      nutrition_plan_diet_types: {
        Row: {
          diet_type_id: string
          plan_id: string
        }
        Insert: {
          diet_type_id: string
          plan_id: string
        }
        Update: {
          diet_type_id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_diet_types_diet_type_id_fkey"
            columns: ["diet_type_id"]
            isOneToOne: false
            referencedRelation: "diet_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_diet_types_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plan_food_portions: {
        Row: {
          food_group_id: string
          meal_type_id: number
          plan_id: string
          portions: number
        }
        Insert: {
          food_group_id: string
          meal_type_id: number
          plan_id: string
          portions?: number
        }
        Update: {
          food_group_id?: string
          meal_type_id?: number
          plan_id?: string
          portions?: number
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_food_portions_food_group_id_fkey"
            columns: ["food_group_id"]
            isOneToOne: false
            referencedRelation: "food_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_food_portions_meal_type_id_fkey"
            columns: ["meal_type_id"]
            isOneToOne: false
            referencedRelation: "meal_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_food_portions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plan_menu_examples: {
        Row: {
          description: string | null
          meal_type_id: number
          plan_id: string
        }
        Insert: {
          description?: string | null
          meal_type_id: number
          plan_id: string
        }
        Update: {
          description?: string | null
          meal_type_id?: number
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_menu_examples_meal_type_id_fkey"
            columns: ["meal_type_id"]
            isOneToOne: false
            referencedRelation: "meal_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plan_menu_examples_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "nutrition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plans: {
        Row: {
          assessment_id: string
          caloric_adjustment_kcal: number | null
          carbs_g: number | null
          carbs_g_per_kg: number | null
          created_at: string
          created_by: string
          diet_type_observation: string | null
          energy_distribution_kcal: number | null
          energy_requirement_kcal: number | null
          fat_g: number | null
          fat_g_per_kg: number | null
          general_recommendations: string | null
          id: string
          nutritional_diagnosis: string | null
          organization_id: string
          protein_g: number | null
          protein_g_per_kg: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          assessment_id: string
          caloric_adjustment_kcal?: number | null
          carbs_g?: number | null
          carbs_g_per_kg?: number | null
          created_at?: string
          created_by: string
          diet_type_observation?: string | null
          energy_distribution_kcal?: number | null
          energy_requirement_kcal?: number | null
          fat_g?: number | null
          fat_g_per_kg?: number | null
          general_recommendations?: string | null
          id?: string
          nutritional_diagnosis?: string | null
          organization_id: string
          protein_g?: number | null
          protein_g_per_kg?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          assessment_id?: string
          caloric_adjustment_kcal?: number | null
          carbs_g?: number | null
          carbs_g_per_kg?: number | null
          created_at?: string
          created_by?: string
          diet_type_observation?: string | null
          energy_distribution_kcal?: number | null
          energy_requirement_kcal?: number | null
          fat_g?: number | null
          fat_g_per_kg?: number | null
          general_recommendations?: string | null
          id?: string
          nutritional_diagnosis?: string | null
          organization_id?: string
          protein_g?: number | null
          protein_g_per_kg?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plans_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          birth_date: string
          category_id: string | null
          created_at: string
          document: string
          full_name: string
          home_club: boolean
          id: string
          organization_id: string
          photo_path: string | null
          position_id: string | null
          race_id: number
          sex: Database["public"]["Enums"]["player_sex"]
          status: Database["public"]["Enums"]["player_status"]
          updated_at: string
        }
        Insert: {
          birth_date: string
          category_id?: string | null
          created_at?: string
          document: string
          full_name: string
          home_club?: boolean
          id?: string
          organization_id: string
          photo_path?: string | null
          position_id?: string | null
          race_id: number
          sex: Database["public"]["Enums"]["player_sex"]
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string
        }
        Update: {
          birth_date?: string
          category_id?: string | null
          created_at?: string
          document?: string
          full_name?: string
          home_club?: boolean
          id?: string
          organization_id?: string
          photo_path?: string | null
          position_id?: string | null
          race_id?: number
          sex?: Database["public"]["Enums"]["player_sex"]
          status?: Database["public"]["Enums"]["player_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          active: boolean
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      races: {
        Row: {
          id: number
          muscle_mass_constant: number
          name: string
        }
        Insert: {
          id: number
          muscle_mass_constant: number
          name: string
        }
        Update: {
          id?: number
          muscle_mass_constant?: number
          name?: string
        }
        Relationships: []
      }
      reference_thresholds: {
        Row: {
          created_at: string
          created_by: string | null
          effective_from: string
          high_cut: number
          id: string
          low_cut: number
          metric: Database["public"]["Enums"]["threshold_metric"]
          organization_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          effective_from?: string
          high_cut: number
          id?: string
          low_cut: number
          metric: Database["public"]["Enums"]["threshold_metric"]
          organization_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          effective_from?: string
          high_cut?: number
          id?: string
          low_cut?: number
          metric?: Database["public"]["Enums"]["threshold_metric"]
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reference_thresholds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reference_thresholds_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["player_status"]
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["player_status"]
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["player_status"]
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_org: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      player_sex: "Hombre" | "Mujer"
      player_status: "active" | "inactive"
      threshold_metric: "skinfold_sum" | "aks_index"
      user_role: "admin" | "nutricionista" | "lider"
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
      player_sex: ["Hombre", "Mujer"],
      player_status: ["active", "inactive"],
      threshold_metric: ["skinfold_sum", "aks_index"],
      user_role: ["admin", "nutricionista", "lider"],
    },
  },
} as const
