import { createPagesBrowserClient, type SupabaseClient } from '@supabase/auth-helpers-nextjs';

export const supabase: SupabaseClient = createPagesBrowserClient();