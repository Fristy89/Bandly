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

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)
