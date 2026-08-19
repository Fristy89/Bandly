package com.bandly.backend.sites.infrastructure

import com.bandly.backend.sites.domain.Site
import com.bandly.backend.sites.domain.SiteContent
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface SiteRepository : JpaRepository<Site, UUID> {
    fun findByBandId(bandId: UUID): Site?
    fun existsBySubdomain(subdomain: String): Boolean
    fun findBySubdomain(subdomain: String): Site?
    fun findByCustomDomain(customDomain: String): Site?
}

interface SiteContentRepository : JpaRepository<SiteContent, UUID> {
    fun findBySiteId(siteId: UUID): SiteContent?
}
