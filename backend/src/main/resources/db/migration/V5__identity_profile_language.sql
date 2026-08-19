-- Euregio launch market: Identity Chat and DNA generation both need to
-- know which language the artist is actually working in. Defaults to
-- English so rows saved before this column existed stay valid.

alter table identity_profiles
    add column language varchar(2) not null default 'en';
