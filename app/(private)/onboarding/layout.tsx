import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single()

  /*
   * onboarding já concluído
   */
  if (profile?.onboarding_completed) {
    redirect('/dashboard')
  }

  return <>{children}</>
}