-- ============================================================
-- ENUMS
-- ============================================================

create type post_type as enum ('offering_swap', 'seeking', 'giveaway');
create type post_status as enum ('active', 'completed', 'cancelled');
create type post_plant_role as enum ('offered', 'sought');
create type swap_status as enum ('pending', 'agreed', 'completed', 'cancelled');
create type care_log_type as enum ('watering', 'fertilising', 'repotting', 'pruning', 'misting', 'other');

-- ============================================================
-- PROFILES
-- Extends auth.users — one row per registered user.
-- ============================================================

create table profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  username        text unique not null,
  display_name    text,
  bio             text,
  avatar_url      text,
  location        text,
  avg_rating      numeric(2,1),
  swap_count      integer default 0,
  created_at      timestamptz default now()
);

-- ============================================================
-- PLANTS
-- source_swap_id added after swaps table to resolve circular FK.
-- ============================================================

create table plants (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references profiles(id) on delete cascade not null,
  species         text not null,
  scientific_name text,
  nickname        text,
  description     text,
  photo_urls      text[] default '{}',
  is_public       boolean default true,
  acquired_at     date,
  created_at      timestamptz default now()
);

-- ============================================================
-- POSTS
-- ============================================================

create table posts (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid references profiles(id) on delete cascade not null,
  type        post_type not null,
  status      post_status default 'active',
  title       text not null,
  description text,
  created_at  timestamptz default now()
);

-- ============================================================
-- POST PLANTS
-- Junction: which plants a post offers or seeks.
-- For 'offered': plant_id references the owner's plant record.
-- For 'sought': species_name is a text description (plant may not exist in DB yet).
-- ============================================================

create table post_plants (
  id           uuid primary key default gen_random_uuid(),
  post_id      uuid references posts(id) on delete cascade not null,
  role         post_plant_role not null,
  plant_id     uuid references plants(id) on delete set null,
  species_name text,
  constraint at_least_one_plant_ref check (plant_id is not null or species_name is not null)
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================

create table conversations (
  id              uuid primary key default gen_random_uuid(),
  participant_1   uuid references profiles(id) on delete cascade not null,
  participant_2   uuid references profiles(id) on delete cascade not null,
  post_id         uuid references posts(id) on delete set null,
  last_message_at timestamptz,
  created_at      timestamptz default now()
);

-- ============================================================
-- MESSAGES
-- ============================================================

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  sender_id       uuid references profiles(id) on delete cascade not null,
  content         text not null,
  is_read         boolean default false,
  created_at      timestamptz default now()
);

-- ============================================================
-- SWAPS
-- ============================================================

create table swaps (
  id              uuid primary key default gen_random_uuid(),
  post_id         uuid references posts(id) on delete cascade not null,
  conversation_id uuid references conversations(id) on delete set null,
  initiator_id    uuid references profiles(id) on delete cascade not null,
  receiver_id     uuid references profiles(id) on delete cascade not null,
  offer_note      text,
  status          swap_status default 'pending',
  created_at      timestamptz default now(),
  completed_at    timestamptz
);

-- Resolve circular FK: plants.source_swap_id → swaps
alter table plants add column source_swap_id uuid references swaps(id) on delete set null;

-- ============================================================
-- SWAP REQUESTED PLANTS
-- Which specific post_plants the initiator wants in this swap.
-- References post_plants (not plants directly) to tie the request
-- to a specific post's offering.
-- ============================================================

create table swap_requested_plants (
  swap_id       uuid references swaps(id) on delete cascade not null,
  post_plant_id uuid references post_plants(id) on delete cascade not null,
  primary key (swap_id, post_plant_id)
);

-- ============================================================
-- CARE LOGS
-- ============================================================

create table care_logs (
  id        uuid primary key default gen_random_uuid(),
  plant_id  uuid references plants(id) on delete cascade not null,
  type      care_log_type not null,
  notes     text,
  photo_url text,
  logged_at timestamptz default now()
);

-- ============================================================
-- RATINGS
-- Can only be submitted after swap is completed (enforced by trigger).
-- One rating per direction per swap.
-- ============================================================

create table ratings (
  id             uuid primary key default gen_random_uuid(),
  swap_id        uuid references swaps(id) on delete cascade not null,
  source_user_id uuid references profiles(id) on delete cascade not null,
  target_user_id uuid references profiles(id) on delete cascade not null,
  score          smallint not null check (score between 1 and 5),
  comment        text,
  created_at     timestamptz default now(),
  unique (swap_id, source_user_id)
);
