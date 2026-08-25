package com.bandly.backend.sites.application

import com.bandly.backend.identity.infrastructure.BandRepository
import com.bandly.backend.platform.error.NotFoundException
import com.bandly.backend.sites.domain.ArtistInfo
import com.bandly.backend.sites.domain.BrandPalette
import com.bandly.backend.sites.domain.LogoImage
import com.bandly.backend.sites.domain.LogoMark
import com.bandly.backend.sites.domain.Site
import com.bandly.backend.sites.domain.SiteContent
import com.bandly.backend.sites.domain.SiteContentData
import com.bandly.backend.sites.infrastructure.SiteContentRepository
import com.bandly.backend.sites.infrastructure.SiteRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

data class ResolvedSite(val site: Site, val content: SiteContentData)

/**
 * Architecture note (not obvious from the code alone): this is deliberately
 * NOT "generate and deploy a separate Next.js app per band." One shared
 * site-renderer app is deployed once; every band's site is the same
 * deployable resolved at request time by domain (see resolveByDomain,
 * called from PublicSiteController — the only endpoint the renderer app
 * talks to). That's what keeps this operable at more than a handful of
 * customers — see the architecture discussion this module came out of.
 */
@Service
class SiteService(
    private val sites: SiteRepository,
    private val siteContents: SiteContentRepository,
    private val bands: BandRepository,
) {

    @Transactional
    fun getOrCreateSite(bandId: UUID): Site {
        sites.findByBandId(bandId)?.let { return it }

        val band = bands.findById(bandId).orElseThrow { NotFoundException("Band $bandId not found") }
        val site = sites.save(Site(bandId = bandId, subdomain = uniqueSubdomain(band.name)))
        siteContents.save(
            SiteContent(
                siteId = site.id,
                content = SiteContentData(artist = ArtistInfo(name = band.name)),
            ),
        )
        return site
    }

    fun getContent(bandId: UUID): SiteContentData {
        val site = getOrCreateSite(bandId)
        return siteContents.findBySiteId(site.id)?.content ?: SiteContentData()
    }

    @Transactional
    fun updateContent(bandId: UUID, content: SiteContentData): SiteContentData {
        val site = getOrCreateSite(bandId)
        val row = siteContents.findBySiteId(site.id) ?: SiteContent(siteId = site.id)
        row.content = content
        return siteContents.save(row).content
    }

    /** Also clears logoImage — logoMark only ever renders when logoImage is
     * absent (SignatureMark), so leaving a stale upload in place here would
     * make a freshly generated mark silently invisible. Choosing to
     * (re)generate a wordmark is itself the signal that whatever's
     * generated should actually be what's shown. */
    @Transactional
    fun updateLogoMark(bandId: UUID, logoMark: LogoMark): SiteContentData {
        val site = getOrCreateSite(bandId)
        val row = siteContents.findBySiteId(site.id) ?: SiteContent(siteId = site.id)
        row.content = row.content.copy(logoMark = logoMark, logoImage = null)
        return siteContents.save(row).content
    }

    @Transactional
    fun updateLogoImage(bandId: UUID, logoImage: LogoImage): SiteContentData {
        val site = getOrCreateSite(bandId)
        val row = siteContents.findBySiteId(site.id) ?: SiteContent(siteId = site.id)
        row.content = row.content.copy(logoImage = logoImage)
        return siteContents.save(row).content
    }

    @Transactional
    fun updateBioPhoto(bandId: UUID, dataUri: String): SiteContentData {
        val site = getOrCreateSite(bandId)
        val row = siteContents.findBySiteId(site.id) ?: SiteContent(siteId = site.id)
        row.content = row.content.copy(images = row.content.images.copy(bioPhoto = dataUri))
        return siteContents.save(row).content
    }

    @Transactional
    fun updateBrandPalette(bandId: UUID, primaryColor: String, secondaryColor: String): SiteContentData {
        val site = getOrCreateSite(bandId)
        val row = siteContents.findBySiteId(site.id) ?: SiteContent(siteId = site.id)
        row.content = row.content.copy(brandPalette = BrandPalette(primaryColor, secondaryColor))
        return siteContents.save(row).content
    }

    @Transactional
    fun setPublished(bandId: UUID, published: Boolean): Site {
        val site = getOrCreateSite(bandId)
        site.published = published
        return sites.save(site)
    }

    /** The only thing the public renderer app calls (PublicSiteController).
     * Unpublished sites resolve to null even if the domain matches — a
     * draft site is invisible, not just unlinked. */
    fun resolveByDomain(domain: String): ResolvedSite? {
        val normalized = domain.substringBefore(':').lowercase()
        val bareSubdomain = normalized.substringBefore('.')

        val site = sites.findByCustomDomain(normalized)
            ?: sites.findBySubdomain(bareSubdomain)
            ?: return null

        if (!site.published) return null

        val content = siteContents.findBySiteId(site.id)?.content ?: SiteContentData()
        return ResolvedSite(site, content)
    }

    private fun uniqueSubdomain(bandName: String): String {
        val base = bandName
            .lowercase()
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-')
            .ifBlank { "band" }
            .take(50)

        var candidate = base
        var suffix = 2
        while (sites.existsBySubdomain(candidate)) {
            candidate = "$base-$suffix"
            suffix++
        }
        return candidate
    }
}
