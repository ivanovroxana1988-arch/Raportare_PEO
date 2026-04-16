import { createBrowserClient } from '@supabase/ssr'

// Singleton pattern for browser client - this is safe because
// createBrowserClient automatically handles cookie-based sessions
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // During build time or if env vars are missing, return null
  if (!supabaseUrl || !supabaseKey) {
    return null
  }
  
  // Return cached client if exists
  if (client) return client
  
  client = createBrowserClient(supabaseUrl, supabaseKey)
  return client
}
