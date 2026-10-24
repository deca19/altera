-- ALTERA 서버 스키마 (Supabase)
-- Supabase 대시보드 > SQL Editor > New query 에 이 파일 전체를 붙여 넣고 Run.
-- 여러 번 실행해도 안전하게 작성되어 있다.

-- 1) 문서 저장소: 앱의 모든 서버 데이터가 경로(path) 단위로 들어간다.
--    data/users/<uid>/altera      내 진행 상황 (본인만)
--    players/<uid>                 관리자 창에 보이는 진행 요약 (본인 쓰기, 관리자 읽기)
--    players/<uid>/inbox/<id>      관리자가 보낸 지급·메시지 (관리자 쓰기, 본인 읽기·삭제)
--    pub/notice, pub/event         전체 공지와 보상 배수 이벤트 (모두 읽기, 관리자 쓰기)
--    admin/secret, admin/log       관리자 비밀번호 해시와 관리 기록 (관리자만)
create table if not exists public.docs (
  path text primary key,
  parent text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint docs_path_len check (char_length(path) between 3 and 300),
  constraint docs_parent_ok check (parent = regexp_replace(path, '/[^/]*$', '')),
  constraint docs_size check (octet_length(data::text) <= 400000)
);
create index if not exists docs_parent_idx on public.docs (parent);

-- 2) 관리자 목록: 여기에 등록된 계정만 관리자 창(deca10x2)을 열 수 있다.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.admins where user_id = auth.uid()); $$;
grant execute on function public.is_admin() to anon, authenticated;

-- 경로 조각 수
create or replace function public.seg_count(p text) returns int
language sql immutable as $$ select coalesce(array_length(string_to_array(p, '/'), 1), 0); $$;

-- 읽기 권한
create or replace function public.can_read_doc(p text) returns boolean
language sql stable security definer set search_path = public
as $$
  select case split_part(p, '/', 1)
    when 'pub' then true
    when 'data' then auth.uid() is not null and split_part(p, '/', 2) = 'users' and split_part(p, '/', 3) = auth.uid()::text
    when 'players' then auth.uid() is not null and (split_part(p, '/', 2) = auth.uid()::text or public.is_admin())
    when 'admin' then public.is_admin()
    else false
  end;
$$;

-- 만들기·수정 권한
create or replace function public.can_write_doc(p text) returns boolean
language sql stable security definer set search_path = public
as $$
  select case split_part(p, '/', 1)
    when 'pub' then public.is_admin() and public.seg_count(p) = 2
    when 'admin' then public.is_admin() and public.seg_count(p) = 2
    when 'data' then auth.uid() is not null and public.seg_count(p) = 4 and split_part(p, '/', 2) = 'users'
                     and split_part(p, '/', 3) = auth.uid()::text and split_part(p, '/', 4) = 'altera'
    when 'players' then auth.uid() is not null and (
                     (public.seg_count(p) = 2 and (split_part(p, '/', 2) = auth.uid()::text or public.is_admin()))
                     or (public.seg_count(p) = 4 and split_part(p, '/', 3) = 'inbox' and public.is_admin()))
    else false
  end;
$$;

-- 삭제 권한 (우편함은 받은 본인도 지울 수 있다)
create or replace function public.can_delete_doc(p text) returns boolean
language sql stable security definer set search_path = public
as $$
  select public.can_write_doc(p)
      or (split_part(p, '/', 1) = 'players' and public.seg_count(p) = 4 and split_part(p, '/', 3) = 'inbox'
          and auth.uid() is not null and split_part(p, '/', 2) = auth.uid()::text);
$$;

alter table public.docs enable row level security;
drop policy if exists docs_select on public.docs;
drop policy if exists docs_insert on public.docs;
drop policy if exists docs_update on public.docs;
drop policy if exists docs_delete on public.docs;
create policy docs_select on public.docs for select using (public.can_read_doc(path));
create policy docs_insert on public.docs for insert with check (public.can_write_doc(path));
create policy docs_update on public.docs for update using (public.can_write_doc(path)) with check (public.can_write_doc(path));
create policy docs_delete on public.docs for delete using (public.can_delete_doc(path));

alter table public.admins enable row level security;
drop policy if exists admins_self on public.admins;
create policy admins_self on public.admins for select using (user_id = auth.uid());

grant select, insert, update, delete on public.docs to anon, authenticated;
grant select on public.admins to authenticated;

-- 3) 실시간 반영 (공지, 이벤트, 우편함, 관리자 창 갱신)
alter table public.docs replica identity full;
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'docs') then
    alter publication supabase_realtime add table public.docs;
  end if;
end $$;

-- 4) 관리자 등록 (사이트에서 내 ID를 복사한 뒤, 아래 줄의 주석을 풀고 ID를 넣어 실행)
-- insert into public.admins (user_id) values ('여기에-내-ID') on conflict do nothing;
