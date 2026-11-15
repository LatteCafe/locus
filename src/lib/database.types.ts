
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "app_admins": {
                  Row: {
                    "created_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"cosmetics": {
                  Row: {
                    "active": boolean,"created_at": string,"description": string | null,"id": string,"key": string,"kind": string,"name": string,"sort_order": number,"style": NonNullable<Json>,"unlock_params": NonNullable<Json>,"unlock_rule": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"description"?: string | null,"id"?: string,"key": string,"kind": string,"name": string,"sort_order"?: number,"style"?: NonNullable<Json>,"unlock_params"?: NonNullable<Json>,"unlock_rule"?: string
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"description"?: string | null,"id"?: string,"key"?: string,"kind"?: string,"name"?: string,"sort_order"?: number,"style"?: NonNullable<Json>,"unlock_params"?: NonNullable<Json>,"unlock_rule"?: string
                  }
                  Relationships: [
                    
                  ]
                },"friendships": {
                  Row: {
                    "addressee_id": string,"created_at": string,"id": string,"requester_id": string,"status": Database["public"]['Enums']["friendship_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "addressee_id": string,"created_at"?: string,"id"?: string,"requester_id": string,"status"?: Database["public"]['Enums']["friendship_status"],"updated_at"?: string
                  }
                  Update: {
                    "addressee_id"?: string,"created_at"?: string,"id"?: string,"requester_id"?: string,"status"?: Database["public"]['Enums']["friendship_status"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"invitation_joins": {
                  Row: {
                    "created_at": string,"id": string,"invitation_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"invitation_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"invitation_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitation_joins_invitation_id_fkey"
      columns: ["invitation_id"]
isOneToOne: false
      referencedRelation: "invitations"
      referencedColumns: ["id"]
    }
                  ]
                },"invitations": {
                  Row: {
                    "cancelled_at": string | null,"created_at": string,"expires_at": string,"id": string,"message": string | null,"place_id": string,"school_id": string | null,"starts_at": string,"subject": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cancelled_at"?: string | null,"created_at"?: string,"expires_at": string,"id"?: string,"message"?: string | null,"place_id": string,"school_id"?: string | null,"starts_at"?: string,"subject"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "cancelled_at"?: string | null,"created_at"?: string,"expires_at"?: string,"id"?: string,"message"?: string | null,"place_id"?: string,"school_id"?: string | null,"starts_at"?: string,"subject"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitations_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_attribute_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "invitations_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_session_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "invitations_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "places"
      referencedColumns: ["id"]
    }
                  ]
                },"place_ratings": {
                  Row: {
                    "accessibility": number | null,"atmosphere": number,"created_at": string,"food": number | null,"id": string,"outlets": number | null,"place_id": string,"score": number | null,"smell": number | null,"space": number | null,"updated_at": string,"user_id": string,"volume": Database["public"]['Enums']["volume_level"] | null,"washroom": number | null,"wifi": Database["public"]['Enums']["wifi_level"] | null
                  }
                  ComputedFields: never
                  Insert: {
                    "accessibility"?: number | null,"atmosphere": number,"created_at"?: string,"food"?: number | null,"id"?: string,"outlets"?: number | null,"place_id": string,"score"?: number | null,"smell"?: number | null,"space"?: number | null,"updated_at"?: string,"user_id": string,"volume"?: Database["public"]['Enums']["volume_level"] | null,"washroom"?: number | null,"wifi"?: Database["public"]['Enums']["wifi_level"] | null
                  }
                  Update: {
                    "accessibility"?: number | null,"atmosphere"?: number,"created_at"?: string,"food"?: number | null,"id"?: string,"outlets"?: number | null,"place_id"?: string,"score"?: number | null,"smell"?: number | null,"space"?: number | null,"updated_at"?: string,"user_id"?: string,"volume"?: Database["public"]['Enums']["volume_level"] | null,"washroom"?: number | null,"wifi"?: Database["public"]['Enums']["wifi_level"] | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "place_ratings_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_attribute_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "place_ratings_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_session_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "place_ratings_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "places"
      referencedColumns: ["id"]
    }
                  ]
                },"place_suggestions": {
                  Row: {
                    "created_at": string,"id": string,"kind": string,"message": string | null,"place_id": string,"resolved_at": string | null,"suggested_opening_hours": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"kind": string,"message"?: string | null,"place_id": string,"resolved_at"?: string | null,"suggested_opening_hours"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"kind"?: string,"message"?: string | null,"place_id"?: string,"resolved_at"?: string | null,"suggested_opening_hours"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "place_suggestions_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_attribute_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "place_suggestions_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_session_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "place_suggestions_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "places"
      referencedColumns: ["id"]
    }
                  ]
                },"places": {
                  Row: {
                    "address": string | null,"category": Database["public"]['Enums']["place_category"],"created_at": string,"created_by": string | null,"hours_note": string | null,"id": string,"lat": number,"lng": number,"name": string,"opening_hours": string | null,"osm_id": string | null,"photos": (string)[],"school_id": string | null,"updated_at": string,"verified": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"category": Database["public"]['Enums']["place_category"],"created_at"?: string,"created_by"?: string | null,"hours_note"?: string | null,"id"?: string,"lat": number,"lng": number,"name": string,"opening_hours"?: string | null,"osm_id"?: string | null,"photos"?: (string)[],"school_id"?: string | null,"updated_at"?: string,"verified"?: boolean
                  }
                  Update: {
                    "address"?: string | null,"category"?: Database["public"]['Enums']["place_category"],"created_at"?: string,"created_by"?: string | null,"hours_note"?: string | null,"id"?: string,"lat"?: number,"lng"?: number,"name"?: string,"opening_hours"?: string | null,"osm_id"?: string | null,"photos"?: (string)[],"school_id"?: string | null,"updated_at"?: string,"verified"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"courses": (string)[],"created_at": string,"display_name": string | null,"equipped_cosmetic_id": string | null,"first_name": string | null,"id": string,"location_sharing": boolean,"onboarding_completed_at": string | null,"preferred_volume": Database["public"]['Enums']["volume_level"],"rating_weights": Json | null,"referral_code": string,"referred_by": string | null,"school_id": string | null,"updated_at": string,"username": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"courses"?: (string)[],"created_at"?: string,"display_name"?: string | null,"equipped_cosmetic_id"?: string | null,"first_name"?: string | null,"id": string,"location_sharing"?: boolean,"onboarding_completed_at"?: string | null,"preferred_volume"?: Database["public"]['Enums']["volume_level"],"rating_weights"?: Json | null,"referral_code": string,"referred_by"?: string | null,"school_id"?: string | null,"updated_at"?: string,"username"?: string | null
                  }
                  Update: {
                    "avatar_url"?: string | null,"courses"?: (string)[],"created_at"?: string,"display_name"?: string | null,"equipped_cosmetic_id"?: string | null,"first_name"?: string | null,"id"?: string,"location_sharing"?: boolean,"onboarding_completed_at"?: string | null,"preferred_volume"?: Database["public"]['Enums']["volume_level"],"rating_weights"?: Json | null,"referral_code"?: string,"referred_by"?: string | null,"school_id"?: string | null,"updated_at"?: string,"username"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_equipped_cosmetic_fkey"
      columns: ["equipped_cosmetic_id"]
isOneToOne: false
      referencedRelation: "cosmetics"
      referencedColumns: ["id"]
    }
                  ]
                },"referrals": {
                  Row: {
                    "created_at": string,"id": string,"referred_user_id": string,"referrer_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"referred_user_id": string,"referrer_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"referred_user_id"?: string,"referrer_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"sessions": {
                  Row: {
                    "checkin_distance_m": number | null,"checkin_lat": number | null,"checkin_lng": number | null,"created_at": string,"duration_seconds": number | null,"ended_at": string | null,"flagged": boolean,"flagged_reason": string | null,"id": string,"paused_at": string | null,"paused_seconds": number,"place_id": string,"pomodoro_used": boolean,"started_at": string,"subject": string | null,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "checkin_distance_m"?: number | null,"checkin_lat"?: number | null,"checkin_lng"?: number | null,"created_at"?: string,"duration_seconds"?: never,"ended_at"?: string | null,"flagged"?: boolean,"flagged_reason"?: string | null,"id"?: string,"paused_at"?: string | null,"paused_seconds"?: number,"place_id": string,"pomodoro_used"?: boolean,"started_at"?: string,"subject"?: string | null,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "checkin_distance_m"?: number | null,"checkin_lat"?: number | null,"checkin_lng"?: number | null,"created_at"?: string,"duration_seconds"?: never,"ended_at"?: string | null,"flagged"?: boolean,"flagged_reason"?: string | null,"id"?: string,"paused_at"?: string | null,"paused_seconds"?: number,"place_id"?: string,"pomodoro_used"?: boolean,"started_at"?: string,"subject"?: string | null,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sessions_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_attribute_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "sessions_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_session_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "sessions_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "places"
      referencedColumns: ["id"]
    }
                  ]
                },"user_cosmetics": {
                  Row: {
                    "cosmetic_id": string,"id": string,"unlocked_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cosmetic_id": string,"id"?: string,"unlocked_at"?: string,"user_id": string
                  }
                  Update: {
                    "cosmetic_id"?: string,"id"?: string,"unlocked_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_cosmetics_cosmetic_id_fkey"
      columns: ["cosmetic_id"]
isOneToOne: false
      referencedRelation: "cosmetics"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            "admin_suspicious_weeks": {
                  Row: {
                    "display_name": string | null,"far_hours": number | null,"far_hours_pct": number | null,"far_session_count": number | null,"max_distance_m": number | null,"session_count": number | null,"total_hours": number | null,"unlocated_session_count": number | null,"user_id": string,"username": string | null,"week_start": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"my_transcript": {
                  Row: {
                    "category": Database["public"]['Enums']["place_category"],"first_session_at": string | null,"hours": number | null,"last_session_at": string | null,"place_id": string,"place_name": string,"rated_at": string | null,"score": number | null,"session_count": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    {
      foreignKeyName: "sessions_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_attribute_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "sessions_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "place_session_stats"
      referencedColumns: ["place_id"]
    },{
      foreignKeyName: "sessions_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "places"
      referencedColumns: ["id"]
    }
                  ]
                },"place_attribute_stats": {
                  Row: {
                    "avg_accessibility": number | null,"avg_atmosphere": number | null,"avg_food": number | null,"avg_outlets": number | null,"avg_smell": number | null,"avg_space": number | null,"avg_user_score": number | null,"avg_washroom": number | null,"modal_volume": Database["public"]['Enums']["volume_level"] | null,"modal_wifi": Database["public"]['Enums']["wifi_level"] | null,"place_id": string,"rating_count": number | null,"volume_loud_count": number | null,"volume_quiet_count": number | null,"volume_silent_count": number | null,"wifi_fast_count": number | null,"wifi_none_count": number | null,"wifi_slow_count": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"place_session_stats": {
                  Row: {
                    "active_sessions": number | null,"place_id": string,"sessions_30d": number | null,"unique_studiers_30d": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"weekly_hours": {
                  Row: {
                    "distinct_places": number | null,"hours": number | null,"session_count": number | null,"user_id": string,"week_start": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "admin_suspicious_weeks_list":
{ Args: Record<PropertyKey, never>; Returns: {
              "display_name": string | null,
"far_hours": number | null,
"far_hours_pct": number | null,
"far_session_count": number | null,
"max_distance_m": number | null,
"session_count": number | null,
"total_hours": number | null,
"unlocated_session_count": number | null,
"user_id": string,
"username": string | null,
"week_start": string | null
            }[]
                          SetofOptions: {
        from: "*"
        to: "admin_suspicious_weeks"
        isOneToOne: false
        isSetofReturn: true
      } },
"complete_onboarding":
{ Args: { "p_courses": (string)[],"p_display_name": string,"p_first_name": string,"p_preferred_volume": Database["public"]['Enums']["volume_level"],"p_referral_code"?: string,"p_school_id": string,"p_username": string }; Returns: undefined
                           },
"dearmor":
{ Args: { "": string }; Returns: string
                           },
"delete_my_account":
{ Args: Record<PropertyKey, never>; Returns: undefined
                           },
"fips_mode":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"gen_random_uuid":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"gen_salt":
{ Args: { "": string }; Returns: string
                           },
"my_month_stats":
{ Args: { "month_of"?: string }; Returns: {
              "distinct_places": number,"distinct_subjects": number,"hours": number,"month_start": string,"session_count": number
            }[]
                           },
"my_streak":
{ Args: { "min_minutes"?: number }; Returns: number
                           },
"my_week_stats":
{ Args: { "week_of"?: string }; Returns: {
              "distinct_places": number,"hours": number,"session_count": number,"week_start": string
            }[]
                           },
"pgp_armor_headers":
{ Args: { "": string }; Returns: Record<string, unknown>[]
                           },
"streak_leaderboard":
{ Args: { "max_rows"?: number,"min_minutes"?: number,"scope"?: string }; Returns: {
              "avatar_url": string,"display_name": string,"equipped_cosmetic_id": string,"is_me": boolean,"streak_days": number,"user_id": string,"username": string
            }[]
                           },
"username_available":
{ Args: { "candidate": string }; Returns: boolean
                           },
"weekly_hours_leaderboard":
{ Args: { "max_rows"?: number,"scope"?: string,"week_of"?: string }; Returns: {
              "avatar_url": string,"display_name": string,"equipped_cosmetic_id": string,"hours": number,"is_me": boolean,"user_id": string,"username": string
            }[]
                           }
          }
          Enums: {
            "friendship_status": "pending"|"accepted"|"declined"|"blocked","place_category": "library"|"cafe"|"dining_hall"|"classroom"|"coworking"|"outdoor","volume_level": "loud"|"quiet"|"silent","wifi_level": "fast"|"slow"|"none"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "friendship_status": ["pending", "accepted", "declined", "blocked"],"place_category": ["library", "cafe", "dining_hall", "classroom", "coworking", "outdoor"],"volume_level": ["loud", "quiet", "silent"],"wifi_level": ["fast", "slow", "none"]
          }
        }
} as const
