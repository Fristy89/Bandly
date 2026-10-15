package com.bandly.backend.artistdna.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

enum class DnaStatus { DRAFT, APPROVED }

/**
 * The version marker (blueprint §04/§21, ADR the "Artist DNA as a
 * versioned, first-class entity" decision) — deliberately thin. The actual
 * generated text lives in [GeneratedAsset] rows pointing back at this id;
 * this row is just "a compilation happened, here's its status." Bands.
 * currentDnaVersionId points at whichever version is live.
 */
@Entity
@Table(name = "artist_dna_versions")
class ArtistDnaVersion(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "band_id", nullable = false)
    val bandId: UUID,

    @Column(name = "identity_profile_id", nullable = false)
    val identityProfileId: UUID,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: DnaStatus = DnaStatus.DRAFT,

    /** Reasoned alongside the bios in the same generation call, not a
     * separate decision — see ArtistDnaService.generateDna. Nullable only
     * because versions generated before this field existed won't have it. */
    @Column(name = "primary_color", length = 7)
    var primaryColor: String? = null,

    @Column(name = "secondary_color", length = 7)
    var secondaryColor: String? = null,

    /** The richer profile fields from the 20-question intake — reasoned in
     * the same generation call. Nullable / empty on versions compiled
     * before these existed; the login screen shows the platform band's. */
    @Column(name = "brand_mantra", columnDefinition = "text")
    var brandMantra: String? = null,

    @Column(name = "primary_archetype", length = 60)
    var primaryArchetype: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dna_components", nullable = false, columnDefinition = "jsonb")
    var dnaComponents: List<String> = emptyList(),

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),
)
