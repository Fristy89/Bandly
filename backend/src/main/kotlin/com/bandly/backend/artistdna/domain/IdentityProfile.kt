package com.bandly.backend.artistdna.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

/**
 * The Artist Identity Profile intake (blueprint §02/§04) — free-text
 * question/answer pairs ("who am I as an artist", "who is this for",
 * "what words fit me, what words don't"). One row per band, overwritten on
 * re-save rather than versioned: it's the *output* (ArtistDnaVersion) that's
 * versioned and worth keeping history of, not every edit to the raw intake.
 *
 * JSONB is deliberate here (one of the two JSONB uses in the whole schema,
 * per blueprint §07): the question set can evolve, and this is always read
 * as a whole to build a prompt, never filtered by individual question.
 */
@Entity
@Table(name = "identity_profiles")
@EntityListeners(AuditingEntityListener::class)
class IdentityProfile(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "band_id", nullable = false, unique = true)
    val bandId: UUID,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    var answers: Map<String, String> = emptyMap(),

    /** ISO 639-1 — "nl" | "de" | "en" today (the Euregio launch market: the
     * Identity Chat, and everything ArtistDnaService generates from this
     * profile, follow it). Defaults to English so profiles saved before
     * this field existed keep working without a migration backfill. */
    @Column(nullable = false, length = 2)
    var language: String = "en",

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)
