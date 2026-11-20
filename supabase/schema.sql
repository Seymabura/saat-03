-- ============================================================
-- Saat 03:00 veritabanı şeması
-- Tüm tablo ve fonksiyonlar "saat03_" önekiyle başlar; böylece başka bir
-- projeyle aynı Supabase veritabanını güvenle paylaşabilir.
-- Supabase panelinde: SQL Editor → New query → bu dosyanın tamamını
-- yapıştır → Run. Birden fazla kez çalıştırmak güvenlidir.
-- ============================================================

-- Kulüp açık mı? (Türkiye saatiyle 00:00-04:59)
create or replace function public.saat03_club_open()
returns boolean
language sql
stable
as $$
  select extract(hour from (now() at time zone 'Europe/Istanbul')) < 5;
$$;

-- Bu gecenin başlangıcı (Türkiye saatiyle bugün 00:00)
create or replace function public.saat03_tonight_start()
returns timestamptz
language sql
stable
as $$
  select date_trunc('day', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul';
$$;

-- ---------- Tablolar ----------

-- Herkesin gördüğü mesajlar. Yazara dair HİÇBİR bilgi burada tutulmaz.
create table if not exists public.saat03_messages (
  id uuid primary key default gen_random_uuid(),
  body text not null check (char_length(body) between 2 and 280),
  created_at timestamptz not null default now()
);
create index if not exists saat03_messages_created_at_idx on public.saat03_messages (created_at desc);

-- Spam limiti için gönderim kaydı (IP'nin tuzlanmış özeti; IP'nin kendisi değil)
create table if not exists public.saat03_post_log (
  id bigint generated always as identity primary key,
  author_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists saat03_post_log_author_idx on public.saat03_post_log (author_hash, created_at desc);

-- Şikayetler: aynı kişi aynı mesajı bir kez şikayet edebilir
create table if not exists public.saat03_reports (
  message_id uuid not null references public.saat03_messages (id) on delete cascade,
  reporter_hash text not null,
  created_at timestamptz not null default now(),
  primary key (message_id, reporter_hash)
);

-- Şikayet eşiğini aşıp kaldırılan mesajlar (inceleme için saklanır)
create table if not exists public.saat03_removed_messages (
  id uuid primary key,
  body text not null,
  created_at timestamptz not null,
  removed_at timestamptz not null default now(),
  report_count int not null
);

-- ---------- Güvenlik (RLS) ----------
alter table public.saat03_messages enable row level security;
alter table public.saat03_post_log enable row level security;
alter table public.saat03_reports enable row level security;
alter table public.saat03_removed_messages enable row level security;

-- Ziyaretçiler sadece kulüp açıkken ve sadece bu gecenin mesajlarını okuyabilir.
-- Ekleme/silme izni yok: mesajlar yalnızca sunucudaki fonksiyonlarla yazılır.
drop policy if exists "saat03 gece mesajlarını oku" on public.saat03_messages;
create policy "saat03 gece mesajlarını oku"
  on public.saat03_messages for select
  to anon, authenticated
  using (public.saat03_club_open() and created_at >= public.saat03_tonight_start());

-- post_log, reports ve removed_messages için politika yok = dışarıdan erişim yok.

-- ---------- Sunucu fonksiyonları ----------

create or replace function public.saat03_post_message(p_body text, p_author text)
returns public.saat03_messages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_body text := btrim(p_body);
  v_msg public.saat03_messages;
begin
  if not public.saat03_club_open() then
    raise exception 'closed';
  end if;

  if char_length(v_body) < 2 or char_length(v_body) > 280 then
    raise exception 'length';
  end if;

  -- 30 saniyede 1 mesaj, saatte en fazla 20 mesaj
  if exists (
    select 1 from public.saat03_post_log
    where author_hash = p_author and created_at > now() - interval '30 seconds'
  ) or (
    select count(*) from public.saat03_post_log
    where author_hash = p_author and created_at > now() - interval '1 hour'
  ) >= 20 then
    raise exception 'rate_limited';
  end if;

  insert into public.saat03_messages (body) values (v_body) returning * into v_msg;
  insert into public.saat03_post_log (author_hash) values (p_author);
  return v_msg;
end;
$$;

-- Dönüş: 'ok' | 'already' | 'removed' | 'missing'
create or replace function public.saat03_report_message(p_id uuid, p_reporter text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
  v_inserted int;
begin
  if not exists (select 1 from public.saat03_messages where id = p_id) then
    return 'missing';
  end if;

  insert into public.saat03_reports (message_id, reporter_hash)
  values (p_id, p_reporter)
  on conflict do nothing;
  get diagnostics v_inserted = row_count;

  if v_inserted = 0 then
    return 'already';
  end if;

  select count(*) into v_count from public.saat03_reports where message_id = p_id;

  -- 3 farklı kişi şikayet ederse mesaj duvardan kalkar
  if v_count >= 3 then
    insert into public.saat03_removed_messages (id, body, created_at, report_count)
    select id, body, created_at, v_count from public.saat03_messages where id = p_id
    on conflict (id) do nothing;
    delete from public.saat03_messages where id = p_id;
    return 'removed';
  end if;

  return 'ok';
end;
$$;

-- Fonksiyonları sadece sunucu (service_role) çağırabilir
revoke all on function public.saat03_post_message(text, text) from public, anon, authenticated;
revoke all on function public.saat03_report_message(uuid, text) from public, anon, authenticated;
grant execute on function public.saat03_post_message(text, text) to service_role;
grant execute on function public.saat03_report_message(uuid, text) to service_role;

-- ---------- Canlı akış (Realtime) ----------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'saat03_messages'
  ) then
    alter publication supabase_realtime add table public.saat03_messages;
  end if;
end $$;

-- ---------- Sabah temizliği ----------
-- Her sabah 05:05'te (UTC 02:05) gecenin mesajları silinir. Sadece saat03_ tabloları.
create extension if not exists pg_cron;

select cron.unschedule('saat03-sabah-temizligi')
where exists (select 1 from cron.job where jobname = 'saat03-sabah-temizligi');

select cron.schedule(
  'saat03-sabah-temizligi',
  '5 2 * * *',
  $$
    delete from public.saat03_messages;
    delete from public.saat03_post_log where created_at < now() - interval '1 day';
    delete from public.saat03_removed_messages where removed_at < now() - interval '30 days';
  $$
);
