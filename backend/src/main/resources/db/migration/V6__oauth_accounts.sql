-- Google OAuth login: an account can now exist without a password (an
-- OAuth-only sign-in), and auth_provider tags where it came from so
-- login logic can tell a "local" account from a "google" one on lookup.

alter table users alter column password_hash drop not null;
alter table users add column auth_provider varchar(20) not null default 'local';
