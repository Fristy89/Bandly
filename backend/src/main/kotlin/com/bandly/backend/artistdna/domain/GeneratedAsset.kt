package com.bandly.backend.artistdna.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

enum class AssetType { SHORT_BIO, LONG_BIO, ELEVATOR_PITCH, ABOUT_THE_ARTIST, TONE_OF_VOICE }
enum class AssetStatus { DRAFT, EDITED, APPROVED }

/**
 * A single AI-produced document, always attributable to the DNA version it
 * was written from (blueprint §04). status starts DRAFT and only ever moves
 * forward via explicit user action (edit or approve) — nothing in this
 * module auto-approves output. sourceModule is a plain string, not an enum
 * tied to a specific module list, because more modules will write rows here
 * later (Content Studio, Grants) without this table needing to change.
 */
@Entity
@Table(name = "generated_assets")
class GeneratedAsset(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "band_id", nullable = false)
    val bandId: UUID,

    @Column(name = "dna_version_id", nullable = false)
    val dnaVersionId: UUID,

    @Column(name = "source_module", nullable = false, length = 40)
    val sourceModule: String,

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_type", nullable = false, length = 40)
    val assetType: AssetType,

    @Column(nullable = false, columnDefinition = "text")
    var content: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: AssetStatus = AssetStatus.DRAFT,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),
)
