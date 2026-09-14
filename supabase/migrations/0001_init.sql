-- ERP da Marca — schema inicial (Supabase/PostgreSQL)
--
-- Modelado diretamente a partir das entidades existentes em src/lib/*/types.ts.
-- Toda tabela tem `user_id` e RLS: cada usuário só acessa seus próprios dados.
-- Nenhum cálculo financeiro vive aqui — isso continua em lib/finance
-- (calculateResultado, calculateCaixa, etc.), rodando no cliente sobre os
-- dados lidos do banco, exatamente como já rodava sobre os dados do
-- localStorage.
--
-- Como aplicar: `supabase link` no projeto, depois `supabase db push`, ou
-- cole este arquivo inteiro no SQL Editor do painel do Supabase.

-- ============================================================================
-- PRODUTOS (lib/catalog)
-- ============================================================================

create table public.products (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null,
  price integer,
  cost_components jsonb not null default '[]'::jsonb,
  image text,
  category text,
  collection text,
  sku text,
  sizes text[],
  colors text[],
  supplier text,
  description text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_user_id_idx on public.products(user_id);

alter table public.products enable row level security;
create policy "products_select_own" on public.products for select to authenticated using ((select auth.uid()) = user_id);
create policy "products_insert_own" on public.products for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "products_update_own" on public.products for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "products_delete_own" on public.products for delete to authenticated using ((select auth.uid()) = user_id);

-- ============================================================================
-- CONTATOS / CRM (lib/contacts)
-- ============================================================================

create table public.contacts (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null,
  stage_id text,
  tags jsonb not null default '[]'::jsonb,
  whatsapp text,
  instagram text,
  email text,
  custom_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contacts_user_id_idx on public.contacts(user_id);

alter table public.contacts enable row level security;
create policy "contacts_select_own" on public.contacts for select to authenticated using ((select auth.uid()) = user_id);
create policy "contacts_insert_own" on public.contacts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "contacts_update_own" on public.contacts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "contacts_delete_own" on public.contacts for delete to authenticated using ((select auth.uid()) = user_id);

-- ============================================================================
-- FINANCEIRO (lib/finance)
-- ============================================================================

create table public.transactions (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  amount integer not null,
  date date not null,
  category text not null,
  description text not null,
  payment_source text not null,
  status text not null,
  due_date date,
  notes text,
  attachments jsonb not null default '[]'::jsonb,
  relations jsonb, -- { installmentGroupId?, recurrenceId?, saleId? } — evita FK circular com sales
  installment jsonb, -- { number, total }
  edited boolean not null default false,
  edit_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_user_date_idx on public.transactions(user_id, date);

alter table public.transactions enable row level security;
create policy "transactions_select_own" on public.transactions for select to authenticated using ((select auth.uid()) = user_id);
create policy "transactions_insert_own" on public.transactions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "transactions_update_own" on public.transactions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "transactions_delete_own" on public.transactions for delete to authenticated using ((select auth.uid()) = user_id);

-- Categorias criadas pelo usuário — as categorias padrão (DEFAULT_CATEGORIES)
-- continuam sendo uma constante da aplicação, não dados de usuário.
create table public.custom_categories (
  id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  "group" text not null,
  primary key (user_id, id)
);

alter table public.custom_categories enable row level security;
create policy "custom_categories_select_own" on public.custom_categories for select to authenticated using ((select auth.uid()) = user_id);
create policy "custom_categories_insert_own" on public.custom_categories for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "custom_categories_update_own" on public.custom_categories for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "custom_categories_delete_own" on public.custom_categories for delete to authenticated using ((select auth.uid()) = user_id);

create table public.installment_groups (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  total_amount integer not null,
  installments_count integer not null,
  created_at timestamptz not null default now()
);

alter table public.installment_groups enable row level security;
create policy "installment_groups_select_own" on public.installment_groups for select to authenticated using ((select auth.uid()) = user_id);
create policy "installment_groups_insert_own" on public.installment_groups for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "installment_groups_update_own" on public.installment_groups for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "installment_groups_delete_own" on public.installment_groups for delete to authenticated using ((select auth.uid()) = user_id);

create table public.recurring_rules (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount integer not null,
  category text not null,
  payment_source text not null,
  type text not null,
  frequency text not null,
  day_of_month integer not null,
  start_date date not null,
  end_date date,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.recurring_rules enable row level security;
create policy "recurring_rules_select_own" on public.recurring_rules for select to authenticated using ((select auth.uid()) = user_id);
create policy "recurring_rules_insert_own" on public.recurring_rules for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "recurring_rules_update_own" on public.recurring_rules for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "recurring_rules_delete_own" on public.recurring_rules for delete to authenticated using ((select auth.uid()) = user_id);

create table public.month_closings (
  id text not null, -- "yyyy-MM"
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null,
  closed_at timestamptz,
  reopened_at timestamptz,
  primary key (user_id, id)
);

alter table public.month_closings enable row level security;
create policy "month_closings_select_own" on public.month_closings for select to authenticated using ((select auth.uid()) = user_id);
create policy "month_closings_insert_own" on public.month_closings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "month_closings_update_own" on public.month_closings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "month_closings_delete_own" on public.month_closings for delete to authenticated using ((select auth.uid()) = user_id);

-- ============================================================================
-- VENDAS (lib/sales)
-- ============================================================================

create table public.sales (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  contact_id uuid references public.contacts(id) on delete set null,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null,
  coupon_code text,
  subtotal integer,
  discount jsonb, -- { kind, code?, description?, percent?, amount?, acumulativo? }
  shipping_amount integer,
  shipping_cost integer,
  total_amount integer not null,
  channel text not null,
  notes text,
  -- Sem FK para transactions: evitaria uma referência circular (transactions
  -- também aponta de volta para sales via relations->>'saleId', dentro do jsonb).
  transaction_id uuid not null,
  shipping_transaction_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sales_user_id_idx on public.sales(user_id);

alter table public.sales enable row level security;
create policy "sales_select_own" on public.sales for select to authenticated using ((select auth.uid()) = user_id);
create policy "sales_insert_own" on public.sales for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "sales_update_own" on public.sales for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "sales_delete_own" on public.sales for delete to authenticated using ((select auth.uid()) = user_id);

-- ============================================================================
-- TAREFAS (lib/tasks)
-- ============================================================================

create table public.tasks (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null,
  description text,
  priority text,
  due_date date,
  category text,
  checklist jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  relations jsonb, -- { productId?, saleId?, contactId? }
  completed_at timestamptz,
  "order" integer,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tasks_user_id_idx on public.tasks(user_id);

alter table public.tasks enable row level security;
create policy "tasks_select_own" on public.tasks for select to authenticated using ((select auth.uid()) = user_id);
create policy "tasks_insert_own" on public.tasks for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tasks_update_own" on public.tasks for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tasks_delete_own" on public.tasks for delete to authenticated using ((select auth.uid()) = user_id);

-- ============================================================================
-- CANVAS (lib/canvas)
-- ============================================================================

-- Um único elemento polimórfico por linha, como no app: campos comuns como
-- colunas, campos específicos do tipo (content/color/src/points/url/title/
-- label) em `data`. Nenhuma imagem em base64 aqui — `data->>'src'` guarda a
-- URL do Storage (ver bucket canvas-images abaixo).
create table public.canvas_elements (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  x double precision not null,
  y double precision not null,
  width double precision not null,
  height double precision not null,
  z_index integer not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index canvas_elements_user_id_idx on public.canvas_elements(user_id);

alter table public.canvas_elements enable row level security;
create policy "canvas_elements_select_own" on public.canvas_elements for select to authenticated using ((select auth.uid()) = user_id);
create policy "canvas_elements_insert_own" on public.canvas_elements for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "canvas_elements_update_own" on public.canvas_elements for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "canvas_elements_delete_own" on public.canvas_elements for delete to authenticated using ((select auth.uid()) = user_id);

-- Bucket privado para imagens coladas/arrastadas no Canvas.
insert into storage.buckets (id, name, public)
values ('canvas-images', 'canvas-images', false)
on conflict (id) do nothing;

-- Cada usuário só acessa arquivos sob o prefixo <user_id>/... do próprio bucket.
create policy "canvas_images_select_own" on storage.objects for select
  to authenticated using (bucket_id = 'canvas-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "canvas_images_insert_own" on storage.objects for insert
  to authenticated with check (bucket_id = 'canvas-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "canvas_images_update_own" on storage.objects for update
  to authenticated using (bucket_id = 'canvas-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'canvas-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "canvas_images_delete_own" on storage.objects for delete
  to authenticated using (bucket_id = 'canvas-images' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ============================================================================
-- CONFIGURAÇÕES (lib/settings) — um objeto por usuário, não uma coleção.
-- ============================================================================

create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  margin_threshold_percent integer not null default 15,
  dashboard_detailed boolean not null default false,
  hidden_dashboard_widgets text[] not null default '{}',
  pipeline_stages jsonb not null default '[
    {"id":"novo","label":"Novo contato"},
    {"id":"primeiro_contato","label":"Primeiro contato"},
    {"id":"conversando","label":"Conversando"},
    {"id":"interesse","label":"Interesse"},
    {"id":"proposta","label":"Proposta"},
    {"id":"negociacao","label":"Negociação"},
    {"id":"cliente","label":"Cliente"},
    {"id":"perdido","label":"Perdido"}
  ]'::jsonb,
  planning_tracked_category_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;
create policy "settings_select_own" on public.settings for select to authenticated using ((select auth.uid()) = user_id);
create policy "settings_insert_own" on public.settings for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "settings_update_own" on public.settings for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "settings_delete_own" on public.settings for delete to authenticated using ((select auth.uid()) = user_id);

-- ============================================================================
-- PLANEJAMENTO (lib/planning)
-- ============================================================================

create table public.profit_allocations (
  month_id text not null, -- "yyyy-MM"
  user_id uuid not null references auth.users(id) on delete cascade,
  reinvestimento integer not null default 0,
  reserva integer not null default 0,
  retirada integer not null default 0,
  outro integer not null default 0,
  notes text,
  updated_at timestamptz not null default now(),
  primary key (user_id, month_id)
);

alter table public.profit_allocations enable row level security;
create policy "profit_allocations_select_own" on public.profit_allocations for select to authenticated using ((select auth.uid()) = user_id);
create policy "profit_allocations_insert_own" on public.profit_allocations for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profit_allocations_update_own" on public.profit_allocations for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "profit_allocations_delete_own" on public.profit_allocations for delete to authenticated using ((select auth.uid()) = user_id);

create table public.category_budgets (
  category_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  value integer not null,
  primary key (user_id, category_id)
);

alter table public.category_budgets enable row level security;
create policy "category_budgets_select_own" on public.category_budgets for select to authenticated using ((select auth.uid()) = user_id);
create policy "category_budgets_insert_own" on public.category_budgets for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "category_budgets_update_own" on public.category_budgets for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "category_budgets_delete_own" on public.category_budgets for delete to authenticated using ((select auth.uid()) = user_id);
