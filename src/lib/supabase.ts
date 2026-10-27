/**
 * Supabase client — lazily loaded singleton.
 *
 * The `@supabase/supabase-js` library is ~65 KB gzipped and is only needed
 * for authenticated mode (real sign-in / sign-up / session restore). The
 * landing page and the offline demo never touch it, so we load it on demand
 * with a dynamic import instead of pulling it into the initial bundle. This
 * keeps it out of the critical path and reduces unused JS on first paint.
 *
 * In demo mode (no env vars set) the URL/key fall back to placeholders and
 * Supabase calls fail gracefully. All authenticated-mode features check for a
 * real session before making API calls, so demo mode is unaffected by a
 * missing Supabase config.
 */
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnon) {
	console.warn(
		'[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. ' +
			'Authenticated mode will not work. Demo mode is unaffected.'
	)
}

// Memoize the in-flight import so concurrent callers share one client instance.
let clientPromise: Promise<SupabaseClient> | null = null

/**
 * Returns the shared Supabase client, importing the library on first use.
 * Await this instead of importing a top-level `supabase` constant so the
 * library stays out of the initial bundle.
 */
export function getSupabase(): Promise<SupabaseClient> {
	if (!clientPromise) {
		clientPromise = import('@supabase/supabase-js').then(({ createClient }) =>
			createClient(
				supabaseUrl || 'https://placeholder.supabase.co',
				supabaseAnon || 'placeholder-anon-key'
			)
		)
	}
	return clientPromise
}
