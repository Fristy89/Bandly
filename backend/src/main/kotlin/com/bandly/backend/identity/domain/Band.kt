package com.bandly.backend.identity.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

/**
 * The tenant root — a solo artist or band workspace.
 * See Bandly Architecture Blueprint §04.
 */
@Entity
@Table(name = "bands")
@EntityListeners(AuditingEntityListener::class)
class Band(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(nullable = false, length = 120)
    var name: String,

    @Column(name = "plan_tier", nullable = false, length = 30)
    var planTier: String = "free",

    // A soft pointer only — no @ManyToOne to ArtistDnaVersion. The identity
    // module's code must never depend on the artistdna module's code (see
    // the dependency graph in blueprint §06); the FK exists at the database
    // level (see V2__artist_dna.sql) but Kotlin-side this is just a UUID.
    @Column(name = "current_dna_version_id")
    var currentDnaVersionId: UUID? = null,

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)
