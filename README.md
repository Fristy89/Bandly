# Bandly — The Artist Operating System

Career-backoffice platform voor beginnende artiesten. Zie `Bandly Architecture Blueprint.pdf` /
`Bandly Architectuurblauwdruk.pdf` voor het volledige architectuurdocument — dit repo volgt die
blauwdruk, met Kotlin in plaats van Java voor de backend.

## Stack

- **Backend:** Kotlin + Spring Boot 4 (modular monolith, zie `backend/src/main/kotlin/com/bandly/backend/`)
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind
- **Database:** PostgreSQL (Flyway-migraties)
- **Lokale infra:** Docker Compose — Postgres, MinIO (S3-compatible), Mailhog, Redis

## Status

**M0 — Fundament** (zie roadmap §23 in de blauwdruk): Identity-module met registratie, login,
JWT-refresh en band-aanmaak/uitnodigen is gebouwd. Nog niet gedraaid tegen een echte database —
zie "Aan de slag" hieronder.

## Aan de slag

Vereist: Docker Desktop (nog niet lokaal geïnstalleerd op dit moment — installeer die eerst).

```bash
# 1. Lokale infra opstarten
docker compose up -d

# 2. Backend starten (draait migraties automatisch via Flyway)
cd backend
./gradlew bootRun

# 3. Frontend starten
cd frontend
npm run dev
```

Backend draait op `localhost:8080`, frontend op `localhost:3000`.

### Backend testen

```bash
cd backend
./gradlew test
```

Gebruikt Testcontainers (§18 van de blauwdruk) — vereist een draaiende lokale Docker-daemon.

## Module-indeling

Zie blauwdruk §06. Tot nu toe gebouwd:

- `identity/` — users, bands, band-lidmaatschap, JWT-auth (M0)

Volgende milestones (§23): Artist DNA + AI Generation-kern (M1), Planning & Notifications (M2),
Release Manager & Media (M3), Relationships (M4), Rights & Finance (M5), Grants & Content Studio (M6).

## Belangrijke ontwerpkeuzes

- Wachtwoorden: Argon2id (`SecurityConfig.kt`)
- Access token: kortlevende JWT (15 min), refresh token: opaque, gehasht in de database, geroteerd
  bij elk gebruik, als httpOnly cookie — nooit in localStorage (blauwdruk ADR-04)
- Autorisatie is band-gescoped: elk band-endpoint resolvet `(gebruiker, bandId) → rol` via
  `BandService.requireMembership` / `requireRole`
- Foutafhandeling: RFC 7807 `application/problem+json` via `GlobalExceptionHandler`
