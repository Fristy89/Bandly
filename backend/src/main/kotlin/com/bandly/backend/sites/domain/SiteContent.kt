package com.bandly.backend.sites.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener
import java.time.Instant
import java.util.UUID

/** The JPA row wrapping [SiteContentData] — kept as a separate entity from
 * [Site] (rather than a column on it) so the frequently-rewritten CMS blob
 * doesn't churn the site's own audit row. */
@Entity
@Table(name = "site_contents")
@EntityListeners(AuditingEntityListener::class)
class SiteContent(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "site_id", nullable = false, unique = true)
    val siteId: UUID,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    var content: SiteContentData = SiteContentData(),

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now(),
)
