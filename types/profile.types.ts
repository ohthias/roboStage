export interface Profile {
  id: string

  username: string | null
  full_name: string | null

  avatar_url: string | null
  bio: string | null

  platform_goal: string | null
  user_role: string | null

  onboarding_completed: boolean

  created_at: string
  updated_at: string | null
}