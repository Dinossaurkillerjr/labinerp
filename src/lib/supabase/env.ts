// Fails loudly and early if the required Supabase environment variables are
// missing, instead of letting `createClient` throw a cryptic error deep
// inside some component. See .env.local.example for what to set.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não configurada. Copie .env.local.example para .env.local e preencha com os dados do seu projeto Supabase.`
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

/** Service-role key — server-only, never exposed to the browser. Used only by the dev seed script. */
export function getSupabaseServiceRoleKey(): string {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}
