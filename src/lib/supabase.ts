/**
 * Supabase client — singleton for the whole app.
 *
 * In demo mode (no env vars set) the URL/key will be placeholders and
 * Supabase calls will fail gracefully. All authenticated-mode features
 * check for a real session before making API calls, so demo mode is
 * unaffected by a missing Supabase config.
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnon) {
	console.warn(
		'[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
			'Authenticated mode will not work. Demo mode is unaffected.'
	)
}

export const supabase = createClient(
	supabaseUrl || 'https://placeholder.supabase.co',
	supabaseAnon || 'placeholder-anon-key'
)
