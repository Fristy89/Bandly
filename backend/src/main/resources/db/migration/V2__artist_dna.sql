-- Artist DNA + AI Generation kernel: identity intake, generated brand
-- identity, and the generation-job audit trail. See Bandly Architecture
-- Blueprint §06/§07/§12.

create table identity_profiles (
    id          uuid primary key default gen_random_uuid(),
    band_id     uuid not null unique references bands (id) on delete cascade,
    answers     jsonb not null default '{}'::jsonb,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create table artist_dna_versions (
    id                   uuid primary key default gen_random_uuid(),
    band_id              uuid not null references bands (id) on delete cascade,
    identity_profile_id  uuid not null references identity_profiles (id),
    status               varchar(20) not null default 'DRAFT',
    created_at           timestamptz not null default now()
);

create index artist_dna_versions_band_idx on artist_dna_versions (band_id);

create table generated_assets (
    id             uuid primary key default gen_random_uuid(),
    band_id        uuid not null references bands (id) on delete cascade,
    dna_version_id uuid not null references artist_dna_versions (id) on delete cascade,
    source_module  varchar(40) not null,
    asset_type     varchar(40) not null,
    content        text not null,
    status         varchar(20) not null default 'DRAFT',
    created_at     timestamptz not null default now()
);

create index generated_assets_dna_version_idx on generated_assets (dna_version_id);
create index generated_assets_band_type_idx on generated_assets (band_id, asset_type);

create table generation_jobs (
    id               uuid primary key default gen_random_uuid(),
    band_id          uuid not null references bands (id) on delete cascade,
    module           varchar(60) not null,
    status           varchar(20) not null default 'QUEUED',
    prompt_payload   jsonb not null default '{}'::jsonb,
    response_payload jsonb,
    error            text,
    created_at       timestamptz not null default now(),
    completed_at     timestamptz
);

create index generation_jobs_band_idx on generation_jobs (band_id, created_at desc);

-- Soft pointer from bands to its current DNA version. FK, not a foreign
-- module dependency: the identity module's Kotlin code never imports
-- anything from artistdna (see the comment on Band.currentDnaVersionId).
alter table bands
    add column current_dna_version_id uuid references artist_dna_versions (id);
