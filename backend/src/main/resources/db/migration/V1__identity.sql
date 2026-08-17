-- Identity module: users, bands, band membership, refresh tokens.
-- See Bandly Architecture Blueprint §06/§07 for the full domain model.

create extension if not exists pgcrypto;

create table users (
    id               uuid primary key default gen_random_uuid(),
    email            varchar(320) not null unique,
    password_hash    varchar(255) not null,
    email_verified_at timestamptz,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

create table bands (
    id          uuid primary key default gen_random_uuid(),
    name        varchar(120) not null,
    plan_tier   varchar(30) not null default 'free',
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create table band_members (
    id            uuid primary key default gen_random_uuid(),
    band_id       uuid not null references bands (id) on delete cascade,
    user_id       uuid references users (id) on delete cascade,
    invited_email varchar(320),
    role          varchar(20) not null,
    invited_at    timestamptz not null default now(),
    joined_at     timestamptz,
    constraint band_members_user_or_invite check (
        user_id is not null or invited_email is not null
    )
);

create unique index band_members_band_user_uidx
    on band_members (band_id, user_id)
    where user_id is not null;

create index band_members_user_idx on band_members (user_id);
create index band_members_band_idx on band_members (band_id);

create table refresh_tokens (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null references users (id) on delete cascade,
    token_hash  varchar(255) not null unique,
    expires_at  timestamptz not null,
    created_at  timestamptz not null default now(),
    revoked_at  timestamptz
);

create index refresh_tokens_user_idx on refresh_tokens (user_id);
