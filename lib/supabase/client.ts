import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return cached client if exists
  if (client) return client
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // During build time or if env vars are missing, return null
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  client = createBrowserClient(supabaseUrl, supabaseKey)
  return client
}
