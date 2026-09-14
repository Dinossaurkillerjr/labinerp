/**
 * Dev-only sample data — inserts the same sample data the app used to ship
 * with (Financeiro, Vendas, Produtos, Contatos, Tarefas, Canvas) into a
 * LOCAL/DEV Supabase project, for one specific user, using the service-role
 * key (bypasses Row Level Security). Reuses the exact same repository
 * mapping functions the app itself uses (via an injected admin client), so
 * this can never drift from the real row shape.
 *
 * NEVER run this against production — it's for getting a fresh dev project
 * to look like a working ERP instead of empty tables.
 *
 * Usage:
 *   1. Create the target user first (Supabase Dashboard → Authentication → Users → Add user).
 *   2. Fill NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *      (pointing at your DEV project — never production).
 *   3. npm run seed:dev -- <email-ou-user-id>
 */
import { createClient } from "@supabase/supabase-js";
import type { AnySupabaseClient } from "../src/lib/supabase/types";

import { SEED_PRODUCTS } from "../src/lib/catalog/seed";
import { upsertProducts } from "../src/lib/catalog/repository";

import { SEED_CONTACTS } from "../src/lib/contacts/seed";
import { upsertContacts } from "../src/lib/contacts/repository";

import { SEED_TASKS } from "../src/lib/tasks/seed";
import { upsertTasks } from "../src/lib/tasks/repository";

import { SEED_ELEMENTS } from "../src/lib/canvas/seed";
import { upsertCanvasElements } from "../src/lib/canvas/repository";

import {
  SEED_TRANSACTIONS,
  SEED_INSTALLMENT_TRANSACTIONS,
  SEED_INSTALLMENT_GROUPS,
  SEED_RECURRING_RULES,
} from "../src/lib/finance/seed";
import { upsertTransactions, upsertInstallmentGroups, upsertRecurringRules } from "../src/lib/finance/repository";

import { SEED_SALES } from "../src/lib/sales/seed";
import { upsertSales } from "../src/lib/sales/repository";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveUserId(admin: AnySupabaseClient, identifier: string): Promise<string> {
  if (UUID_RE.test(identifier)) return identifier;

  const { data, error } = await admin.auth.admin.listUsers();
  if (error) throw error;
  const user = data.users.find((u) => u.email === identifier);
  if (!user) {
    throw new Error(`Nenhum usuário com e-mail "${identifier}" encontrado. Crie-o antes no painel do Supabase.`);
  }
  return user.id;
}

async function main() {
  const identifier = process.argv[2];
  if (!identifier) {
    console.error("Uso: npm run seed:dev -- <email-ou-user-id>");
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error(
      "Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY em .env.local (rode com --env-file=.env.local)."
    );
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const userId = await resolveUserId(admin, identifier);

  console.log(`Semeando dados de exemplo para o usuário ${userId}...`);

  await Promise.all([
    upsertProducts(userId, SEED_PRODUCTS, admin),
    upsertContacts(userId, SEED_CONTACTS, admin),
    upsertTasks(userId, SEED_TASKS, admin),
    upsertCanvasElements(userId, SEED_ELEMENTS, admin),
    upsertTransactions(userId, [...SEED_TRANSACTIONS, ...SEED_INSTALLMENT_TRANSACTIONS], admin),
    upsertInstallmentGroups(userId, SEED_INSTALLMENT_GROUPS, admin),
    upsertRecurringRules(userId, SEED_RECURRING_RULES, admin),
  ]);

  // Depende de products/contacts já existirem (product_id/contact_id em sales) — roda por último.
  await upsertSales(userId, SEED_SALES, admin);

  console.log("Concluído.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
