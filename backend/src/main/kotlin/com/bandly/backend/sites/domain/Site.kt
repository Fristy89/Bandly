package com.bandly.backend.sites.domain

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
 * One public website per band, served by the shared site-renderer app —
 * not a separate deployment per band (see the architecture note in
 * SiteService). `subdomain` is always set (e.g. "marlow-bend" resolves at
 * marlow-bend.bandly.site); `customDomain` is optional, filled in once the
 * band connects their own domain via Hostinger.
 */
@Entity
@Table(name = "sites")
@EntityListeners(AuditingEntityListener::class)
class Site(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "band_id", nullable = false, unique = true)
    val bandId: UUID,

    @Column(nullable = false, unique = true, length = 63)
    var subdomain: String,

    @Column(name = "custom_domain", unique = true)
    var customDomain: String? = null,

    @Column(nullable = false)
    var published: Boolean = false,

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)
