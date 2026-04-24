-- The Ledger Supabase setup.
--
-- Run this in the Supabase SQL editor, then run:
--
--   select public.ledger_set_access_codes('your invite code', 'your admin code');
--   select public.ledger_set_person_invite_code('danny invite code', 'Danny');
--
-- Do not commit real invite or admin codes. The app sends codes to these RPC
-- functions over HTTPS, and Postgres verifies them against one-way hashes. For
-- stable identities, give each person their own invite code with
-- ledger_set_person_invite_code.

create extension if not exists pgcrypto;

create table if not exists public.ledger_settings (
  setting_key text primary key,
  setting_value text not null,
  updated_at timestamptz not null default now(),
  constraint ledger_settings_known_key check (setting_key in ('invite_code_hash', 'admin_code_hash'))
);

create table if not exists public.ledger_participants (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  display_name_key text not null unique,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint ledger_participants_display_name_not_blank check (length(trim(display_name)) > 0)
);

create table if not exists public.ledger_invites (
  id uuid primary key default gen_random_uuid(),
  invite_code_hash text not null,
  participant_id uuid not null references public.ledger_participants(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  unique (participant_id)
);

create table if not exists public.ledger_wagers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  template_type text not null default 'custom',
  terms text not null,
  source_of_truth text,
  close_date date,
  resolution_date date,
  status text not null default 'open',
  outcome text,
  settlement_notes text,
  payment_status text not null default 'unpaid',
  created_by text not null,
  settled_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  settled_at timestamptz,
  constraint ledger_wagers_title_not_blank check (length(trim(title)) > 0),
  constraint ledger_wagers_terms_not_blank check (length(trim(terms)) > 0),
  constraint ledger_wagers_template_type check (template_type in ('binary', 'multiple_choice', 'metric', 'date', 'custom')),
  constraint ledger_wagers_status check (status in ('open', 'agreed', 'settled', 'voided')),
  constraint ledger_wagers_payment_status check (payment_status in ('unpaid', 'partially_paid', 'paid', 'not_applicable'))
);

create table if not exists public.ledger_positions (
  id uuid primary key default gen_random_uuid(),
  wager_id uuid not null references public.ledger_wagers(id) on delete cascade,
  display_name text not null,
  claim text not null,
  stake_amount numeric(12, 2) not null default 0,
  odds_text text,
  counterparty text,
  state text not null default 'open',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ledger_positions_claim_not_blank check (length(trim(claim)) > 0),
  constraint ledger_positions_stake_not_negative check (stake_amount >= 0),
  constraint ledger_positions_state check (state in ('open', 'proposed', 'accepted', 'countered', 'withdrawn'))
);

create table if not exists public.ledger_events (
  id bigint generated always as identity primary key,
  wager_id uuid references public.ledger_wagers(id) on delete cascade,
  event_type text not null,
  actor_name text not null,
  body jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint ledger_events_actor_not_blank check (length(trim(actor_name)) > 0)
);

create index if not exists ledger_wagers_status_idx on public.ledger_wagers(status);
create index if not exists ledger_wagers_updated_at_idx on public.ledger_wagers(updated_at desc);
create index if not exists ledger_positions_wager_id_idx on public.ledger_positions(wager_id);
create index if not exists ledger_events_wager_id_idx on public.ledger_events(wager_id, created_at desc);

alter table public.ledger_settings enable row level security;
alter table public.ledger_participants enable row level security;
alter table public.ledger_invites enable row level security;
alter table public.ledger_wagers enable row level security;
alter table public.ledger_positions enable row level security;
alter table public.ledger_events enable row level security;

revoke all on table public.ledger_settings from public, anon, authenticated;
revoke all on table public.ledger_participants from public, anon, authenticated;
revoke all on table public.ledger_invites from public, anon, authenticated;
revoke all on table public.ledger_wagers from public, anon, authenticated;
revoke all on table public.ledger_positions from public, anon, authenticated;
revoke all on table public.ledger_events from public, anon, authenticated;
revoke all on sequence public.ledger_events_id_seq from public, anon, authenticated;

create or replace function public.ledger_private_display_name_key(p_display_name text)
returns text
language sql
immutable
as $$
  select lower(regexp_replace(trim(coalesce(p_display_name, '')), '\s+', ' ', 'g'));
$$;

create or replace function public.ledger_private_identity_json(p_participant_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'identity_id', p.id,
    'display_name', p.display_name
  )
  from public.ledger_participants p
  where p.id = p_participant_id;
$$;

create or replace function public.ledger_private_participant_for_invite(p_invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invite_record record;
begin
  for invite_record in
    select id, invite_code_hash, participant_id
    from public.ledger_invites
  loop
    if extensions.crypt(coalesce(p_invite_code, ''), invite_record.invite_code_hash) = invite_record.invite_code_hash then
      update public.ledger_invites
        set last_used_at = now()
      where id = invite_record.id;
      return invite_record.participant_id;
    end if;
  end loop;

  return null;
end;
$$;

create or replace function public.ledger_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ledger_wagers_touch_updated_at on public.ledger_wagers;
create trigger ledger_wagers_touch_updated_at
before update on public.ledger_wagers
for each row execute function public.ledger_touch_updated_at();

drop trigger if exists ledger_positions_touch_updated_at on public.ledger_positions;
create trigger ledger_positions_touch_updated_at
before update on public.ledger_positions
for each row execute function public.ledger_touch_updated_at();

create or replace function public.ledger_set_access_codes(
  p_invite_code text,
  p_admin_code text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if length(trim(coalesce(p_invite_code, ''))) < 6 then
    raise exception 'Invite code must be at least 6 characters.';
  end if;

  if length(trim(coalesce(p_admin_code, ''))) < 8 then
    raise exception 'Admin code must be at least 8 characters.';
  end if;

  insert into public.ledger_settings(setting_key, setting_value, updated_at)
  values
    ('invite_code_hash', extensions.crypt(p_invite_code, extensions.gen_salt('bf')), now()),
    ('admin_code_hash', extensions.crypt(p_admin_code, extensions.gen_salt('bf')), now())
  on conflict (setting_key) do update
    set setting_value = excluded.setting_value,
        updated_at = now();
end;
$$;

create or replace function public.ledger_set_person_invite_code(
  p_invite_code text,
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text := trim(coalesce(p_display_name, ''));
  participant_uuid uuid;
begin
  if length(trim(coalesce(p_invite_code, ''))) < 6 then
    raise exception 'Invite code must be at least 6 characters.';
  end if;

  if length(clean_name) = 0 then
    raise exception 'Display name is required.';
  end if;

  insert into public.ledger_participants(display_name, display_name_key, created_at, last_seen_at)
  values (clean_name, public.ledger_private_display_name_key(clean_name), now(), now())
  on conflict (display_name_key) do update
    set display_name = excluded.display_name,
        last_seen_at = now()
  returning id into participant_uuid;

  insert into public.ledger_invites(invite_code_hash, participant_id, created_at)
  values (extensions.crypt(p_invite_code, extensions.gen_salt('bf')), participant_uuid, now())
  on conflict (participant_id) do update
    set invite_code_hash = excluded.invite_code_hash,
        last_used_at = null;

  return jsonb_build_object('identity', public.ledger_private_identity_json(participant_uuid));
end;
$$;

create or replace function public.ledger_private_invite_ok(p_invite_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_hash text;
begin
  if public.ledger_private_participant_for_invite(p_invite_code) is not null then
    return true;
  end if;

  select setting_value
    into stored_hash
  from public.ledger_settings
  where setting_key = 'invite_code_hash';

  return stored_hash is not null
    and extensions.crypt(coalesce(p_invite_code, ''), stored_hash) = stored_hash;
end;
$$;

create or replace function public.ledger_private_admin_ok(p_admin_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  stored_hash text;
begin
  select setting_value
    into stored_hash
  from public.ledger_settings
  where setting_key = 'admin_code_hash';

  return stored_hash is not null
    and extensions.crypt(coalesce(p_admin_code, ''), stored_hash) = stored_hash;
end;
$$;

create or replace function public.ledger_private_require_invite(p_invite_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.ledger_private_invite_ok(p_invite_code) then
    raise exception 'Invalid invite code.';
  end if;
end;
$$;

create or replace function public.ledger_private_require_admin(p_admin_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.ledger_private_admin_ok(p_admin_code) then
    raise exception 'Invalid admin code.';
  end if;
end;
$$;

create or replace function public.ledger_private_touch_participant(p_display_name text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text := trim(coalesce(p_display_name, ''));
  name_key text := public.ledger_private_display_name_key(p_display_name);
begin
  if length(clean_name) = 0 then
    raise exception 'Display name is required.';
  end if;

  insert into public.ledger_participants(display_name, display_name_key, created_at, last_seen_at)
  values (clean_name, name_key, now(), now())
  on conflict (display_name_key) do update
    set display_name = excluded.display_name,
        last_seen_at = now();
end;
$$;

create or replace function public.ledger_private_participant_for_display_name(p_display_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  participant_id uuid;
begin
  perform public.ledger_private_touch_participant(p_display_name);

  select id
    into participant_id
  from public.ledger_participants
  where display_name_key = public.ledger_private_display_name_key(p_display_name);

  return participant_id;
end;
$$;

create or replace function public.ledger_private_position_json(p_position public.ledger_positions)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p_position.id,
    'wager_id', p_position.wager_id,
    'display_name', p_position.display_name,
    'claim', p_position.claim,
    'stake_amount', p_position.stake_amount,
    'odds_text', p_position.odds_text,
    'counterparty', p_position.counterparty,
    'state', p_position.state,
    'notes', p_position.notes,
    'created_at', p_position.created_at,
    'updated_at', p_position.updated_at
  );
$$;

create or replace function public.ledger_private_event_json(p_event public.ledger_events)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p_event.id,
    'wager_id', p_event.wager_id,
    'event_type', p_event.event_type,
    'actor_name', p_event.actor_name,
    'body', p_event.body,
    'created_at', p_event.created_at
  );
$$;

create or replace function public.ledger_private_wager_json(p_wager_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', w.id,
    'title', w.title,
    'template_type', w.template_type,
    'terms', w.terms,
    'source_of_truth', w.source_of_truth,
    'close_date', w.close_date,
    'resolution_date', w.resolution_date,
    'status', w.status,
    'outcome', w.outcome,
    'settlement_notes', w.settlement_notes,
    'payment_status', w.payment_status,
    'created_by', w.created_by,
    'settled_by', w.settled_by,
    'created_at', w.created_at,
    'updated_at', w.updated_at,
    'settled_at', w.settled_at,
    'positions', coalesce((
      select jsonb_agg(public.ledger_private_position_json(p) order by p.created_at)
      from public.ledger_positions p
      where p.wager_id = w.id
    ), '[]'::jsonb),
    'events', coalesce((
      select jsonb_agg(public.ledger_private_event_json(e) order by e.created_at desc)
      from public.ledger_events e
      where e.wager_id = w.id
    ), '[]'::jsonb)
  )
  from public.ledger_wagers w
  where w.id = p_wager_id;
$$;

create or replace function public.ledger_check_invite(p_invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return jsonb_build_object('ok', public.ledger_private_invite_ok(p_invite_code));
end;
$$;

create or replace function public.ledger_get_identity(p_invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  participant_id uuid;
begin
  perform public.ledger_private_require_invite(p_invite_code);
  participant_id := public.ledger_private_participant_for_invite(p_invite_code);

  return jsonb_build_object(
    'ok', true,
    'identity', case
      when participant_id is null then null
      else public.ledger_private_identity_json(participant_id)
    end
  );
end;
$$;

create or replace function public.ledger_bootstrap_access(
  p_invite_code text,
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  participant_id uuid;
begin
  perform public.ledger_private_require_invite(p_invite_code);
  participant_id := public.ledger_private_participant_for_invite(p_invite_code);

  if participant_id is null then
    participant_id := public.ledger_private_participant_for_display_name(p_display_name);
  elsif length(trim(coalesce(p_display_name, ''))) > 0 then
    update public.ledger_participants
      set display_name = trim(p_display_name),
          display_name_key = public.ledger_private_display_name_key(p_display_name),
          last_seen_at = now()
    where id = participant_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'identity', public.ledger_private_identity_json(participant_id)
  );
end;
$$;

create or replace function public.ledger_list_wagers(p_invite_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  perform public.ledger_private_require_invite(p_invite_code);

  select coalesce(jsonb_agg(public.ledger_private_wager_json(w.id) order by w.updated_at desc), '[]'::jsonb)
    into result
  from public.ledger_wagers w;

  return jsonb_build_object('wagers', result);
end;
$$;

create or replace function public.ledger_create_wager(
  p_invite_code text,
  p_actor_name text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  new_wager_id uuid;
  initial_position jsonb := p_payload -> 'initial_position';
  clean_actor text := trim(coalesce(p_actor_name, ''));
  clean_title text := trim(coalesce(p_payload ->> 'title', ''));
  clean_terms text := trim(coalesce(p_payload ->> 'terms', ''));
  created_position_id uuid;
begin
  perform public.ledger_private_require_invite(p_invite_code);
  perform public.ledger_private_touch_participant(clean_actor);

  if length(clean_title) = 0 or length(clean_terms) = 0 then
    raise exception 'Title and terms are required.';
  end if;

  insert into public.ledger_wagers(
    title,
    template_type,
    terms,
    source_of_truth,
    close_date,
    resolution_date,
    created_by
  )
  values (
    clean_title,
    coalesce(nullif(p_payload ->> 'template_type', ''), 'custom'),
    clean_terms,
    nullif(trim(coalesce(p_payload ->> 'source_of_truth', '')), ''),
    nullif(p_payload ->> 'close_date', '')::date,
    nullif(p_payload ->> 'resolution_date', '')::date,
    clean_actor
  )
  returning id into new_wager_id;

  insert into public.ledger_events(wager_id, event_type, actor_name, body)
  values (
    new_wager_id,
    'created',
    clean_actor,
    jsonb_build_object('summary', clean_actor || ' opened "' || clean_title || '".')
  );

  if jsonb_typeof(initial_position) = 'object'
    and length(trim(coalesce(initial_position ->> 'claim', ''))) > 0 then
    insert into public.ledger_positions(
      wager_id,
      display_name,
      claim,
      stake_amount,
      odds_text,
      counterparty,
      state,
      notes
    )
    values (
      new_wager_id,
      clean_actor,
      trim(initial_position ->> 'claim'),
      coalesce(nullif(initial_position ->> 'stake_amount', '')::numeric, 0),
      nullif(trim(coalesce(initial_position ->> 'odds_text', '')), ''),
      nullif(trim(coalesce(initial_position ->> 'counterparty', '')), ''),
      coalesce(nullif(initial_position ->> 'state', ''), 'open'),
      nullif(trim(coalesce(initial_position ->> 'notes', '')), '')
    )
    returning id into created_position_id;

    insert into public.ledger_events(wager_id, event_type, actor_name, body)
    values (
      new_wager_id,
      'position_added',
      clean_actor,
      jsonb_build_object(
        'position_id', created_position_id,
        'summary', clean_actor || ' added an initial position.'
      )
    );
  end if;

  return public.ledger_private_wager_json(new_wager_id);
end;
$$;

create or replace function public.ledger_add_position(
  p_invite_code text,
  p_wager_id uuid,
  p_actor_name text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_actor text := trim(coalesce(p_actor_name, ''));
  clean_claim text := trim(coalesce(p_payload ->> 'claim', ''));
  new_position public.ledger_positions;
begin
  perform public.ledger_private_require_invite(p_invite_code);
  perform public.ledger_private_touch_participant(clean_actor);

  if length(clean_claim) = 0 then
    raise exception 'Claim is required.';
  end if;

  insert into public.ledger_positions(
    wager_id,
    display_name,
    claim,
    stake_amount,
    odds_text,
    counterparty,
    state,
    notes
  )
  values (
    p_wager_id,
    clean_actor,
    clean_claim,
    coalesce(nullif(p_payload ->> 'stake_amount', '')::numeric, 0),
    nullif(trim(coalesce(p_payload ->> 'odds_text', '')), ''),
    nullif(trim(coalesce(p_payload ->> 'counterparty', '')), ''),
    coalesce(nullif(p_payload ->> 'state', ''), 'open'),
    nullif(trim(coalesce(p_payload ->> 'notes', '')), '')
  )
  returning * into new_position;

  insert into public.ledger_events(wager_id, event_type, actor_name, body)
  values (
    p_wager_id,
    'position_added',
    clean_actor,
    jsonb_build_object(
      'position_id', new_position.id,
      'summary', clean_actor || ' added a position.'
    )
  );

  update public.ledger_wagers
    set status = case
      when new_position.state = 'accepted' and status = 'open' then 'agreed'
      else status
    end
  where id = p_wager_id;

  return public.ledger_private_position_json(new_position);
end;
$$;

create or replace function public.ledger_update_position_state(
  p_invite_code text,
  p_position_id uuid,
  p_actor_name text,
  p_state text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_actor text := trim(coalesce(p_actor_name, ''));
  updated_position public.ledger_positions;
begin
  perform public.ledger_private_require_invite(p_invite_code);
  perform public.ledger_private_touch_participant(clean_actor);

  if p_state not in ('open', 'proposed', 'accepted', 'countered', 'withdrawn') then
    raise exception 'Invalid position state.';
  end if;

  update public.ledger_positions
    set state = p_state
  where id = p_position_id
  returning * into updated_position;

  if updated_position.id is null then
    raise exception 'Position not found.';
  end if;

  insert into public.ledger_events(wager_id, event_type, actor_name, body)
  values (
    updated_position.wager_id,
    'position_state_changed',
    clean_actor,
    jsonb_build_object(
      'position_id', updated_position.id,
      'state', p_state,
      'summary', clean_actor || ' marked a position ' || p_state || '.'
    )
  );

  update public.ledger_wagers
    set status = case
      when p_state = 'accepted' and status = 'open' then 'agreed'
      else status
    end
  where id = updated_position.wager_id;

  return public.ledger_private_position_json(updated_position);
end;
$$;

create or replace function public.ledger_update_display_name(
  p_invite_code text,
  p_current_display_name text,
  p_display_name text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  participant_id uuid;
  old_name text := trim(coalesce(p_current_display_name, ''));
  clean_name text := trim(coalesce(p_display_name, ''));
begin
  perform public.ledger_private_require_invite(p_invite_code);

  if length(clean_name) = 0 then
    raise exception 'Display name is required.';
  end if;

  participant_id := public.ledger_private_participant_for_invite(p_invite_code);

  if participant_id is null then
    select id, display_name
      into participant_id, old_name
    from public.ledger_participants
    where display_name_key = public.ledger_private_display_name_key(p_current_display_name);
  end if;

  if participant_id is null then
    participant_id := public.ledger_private_participant_for_display_name(clean_name);
    old_name := clean_name;
  else
    if length(old_name) = 0 then
      select display_name
        into old_name
      from public.ledger_participants
      where id = participant_id;
    end if;

    update public.ledger_participants
      set display_name = clean_name,
          display_name_key = public.ledger_private_display_name_key(clean_name),
          last_seen_at = now()
    where id = participant_id;
  end if;

  if old_name <> clean_name then
    update public.ledger_wagers
      set created_by = clean_name
    where created_by = old_name;

    update public.ledger_wagers
      set settled_by = clean_name
    where settled_by = old_name;

    update public.ledger_positions
      set display_name = clean_name
    where display_name = old_name;

    update public.ledger_events
      set actor_name = clean_name,
          body = case
            when body ? 'summary' then jsonb_set(
              body,
              '{summary}',
              to_jsonb(replace(body ->> 'summary', old_name, clean_name))
            )
            else body
          end
    where actor_name = old_name
       or body ->> 'summary' like '%' || old_name || '%';
  end if;

  return jsonb_build_object(
    'ok', true,
    'identity', public.ledger_private_identity_json(participant_id)
  );
end;
$$;

create or replace function public.ledger_settle_wager(
  p_admin_code text,
  p_wager_id uuid,
  p_actor_name text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_actor text := trim(coalesce(p_actor_name, ''));
  next_status text := coalesce(nullif(p_payload ->> 'status', ''), 'settled');
begin
  perform public.ledger_private_require_admin(p_admin_code);
  perform public.ledger_private_touch_participant(clean_actor);

  if next_status not in ('settled', 'voided') then
    raise exception 'Settlement status must be settled or voided.';
  end if;

  update public.ledger_wagers
    set status = next_status,
        outcome = nullif(trim(coalesce(p_payload ->> 'outcome', '')), ''),
        settlement_notes = nullif(trim(coalesce(p_payload ->> 'settlement_notes', '')), ''),
        payment_status = coalesce(nullif(p_payload ->> 'payment_status', ''), 'unpaid'),
        settled_by = clean_actor,
        settled_at = now()
  where id = p_wager_id;

  if not found then
    raise exception 'Wager not found.';
  end if;

  insert into public.ledger_events(wager_id, event_type, actor_name, body)
  values (
    p_wager_id,
    next_status,
    clean_actor,
    jsonb_build_object(
      'outcome', nullif(trim(coalesce(p_payload ->> 'outcome', '')), ''),
      'settlement_notes', nullif(trim(coalesce(p_payload ->> 'settlement_notes', '')), ''),
      'payment_status', coalesce(nullif(p_payload ->> 'payment_status', ''), 'unpaid'),
      'summary', clean_actor || ' marked the wager ' || next_status || '.'
    )
  );

  return public.ledger_private_wager_json(p_wager_id);
end;
$$;

create or replace function public.ledger_add_event(
  p_invite_code text,
  p_wager_id uuid,
  p_actor_name text,
  p_event_type text,
  p_body jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_actor text := trim(coalesce(p_actor_name, ''));
  new_event public.ledger_events;
begin
  perform public.ledger_private_require_invite(p_invite_code);
  perform public.ledger_private_touch_participant(clean_actor);

  insert into public.ledger_events(wager_id, event_type, actor_name, body)
  values (p_wager_id, coalesce(nullif(p_event_type, ''), 'note'), clean_actor, coalesce(p_body, '{}'::jsonb))
  returning * into new_event;

  return public.ledger_private_event_json(new_event);
end;
$$;

revoke all on function public.ledger_set_access_codes(text, text) from public, anon, authenticated;
revoke all on function public.ledger_set_person_invite_code(text, text) from public, anon, authenticated;
revoke all on function public.ledger_private_invite_ok(text) from public, anon, authenticated;
revoke all on function public.ledger_private_admin_ok(text) from public, anon, authenticated;
revoke all on function public.ledger_private_require_invite(text) from public, anon, authenticated;
revoke all on function public.ledger_private_require_admin(text) from public, anon, authenticated;
revoke all on function public.ledger_private_touch_participant(text) from public, anon, authenticated;
revoke all on function public.ledger_private_participant_for_display_name(text) from public, anon, authenticated;
revoke all on function public.ledger_private_participant_for_invite(text) from public, anon, authenticated;
revoke all on function public.ledger_private_identity_json(uuid) from public, anon, authenticated;
revoke all on function public.ledger_private_position_json(public.ledger_positions) from public, anon, authenticated;
revoke all on function public.ledger_private_event_json(public.ledger_events) from public, anon, authenticated;
revoke all on function public.ledger_private_wager_json(uuid) from public, anon, authenticated;
revoke all on function public.ledger_private_display_name_key(text) from public, anon, authenticated;
revoke all on function public.ledger_touch_updated_at() from public, anon, authenticated;

grant execute on function public.ledger_check_invite(text) to anon, authenticated;
grant execute on function public.ledger_get_identity(text) to anon, authenticated;
grant execute on function public.ledger_bootstrap_access(text, text) to anon, authenticated;
grant execute on function public.ledger_list_wagers(text) to anon, authenticated;
grant execute on function public.ledger_create_wager(text, text, jsonb) to anon, authenticated;
grant execute on function public.ledger_add_position(text, uuid, text, jsonb) to anon, authenticated;
grant execute on function public.ledger_update_position_state(text, uuid, text, text) to anon, authenticated;
grant execute on function public.ledger_update_display_name(text, text, text) to anon, authenticated;
grant execute on function public.ledger_settle_wager(text, uuid, text, jsonb) to anon, authenticated;
grant execute on function public.ledger_add_event(text, uuid, text, text, jsonb) to anon, authenticated;
