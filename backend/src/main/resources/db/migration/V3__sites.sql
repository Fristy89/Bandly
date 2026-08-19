-- Site Builder module: one public artist website per band, rendered by the
-- separate site-renderer app (a shared, multi-tenant Next.js app resolving
-- the band from the request domain — not a separate deployment per band).
-- Modeled on the CMS content shape from the Neet Euverslaon reference site,
-- generalized for any Bandly artist. See docs/06 in that project for the
-- original single-tenant version this generalizes.

create table sites (
    id             uuid primary key default gen_random_uuid(),
    band_id        uuid not null unique references bands (id) on delete cascade,
    subdomain      varchar(63) not null unique,
    custom_domain  varchar(255) unique,
    published      boolean not null default false,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

create index sites_subdomain_idx on sites (subdomain);
create index sites_custom_domain_idx on sites (custom_domain) where custom_domain is not null;

create table site_contents (
    id          uuid primary key default gen_random_uuid(),
    site_id     uuid not null unique references sites (id) on delete cascade,
    content     jsonb not null default '{}'::jsonb,
    updated_at  timestamptz not null default now()
);
