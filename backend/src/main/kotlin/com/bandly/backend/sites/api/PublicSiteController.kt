package com.bandly.backend.sites.api

import com.bandly.backend.platform.error.NotFoundException
import com.bandly.backend.sites.application.SiteService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/**
 * The one endpoint the site-renderer app calls — unauthenticated by design
 * (it's serving a public website, the same trust level as the website
 * itself). Permitted in SecurityConfig alongside the other public paths.
 */
@RestController
@RequestMapping("/api/v1/public/sites")
class PublicSiteController(private val siteService: SiteService) {

    @GetMapping("/by-domain")
    fun byDomain(@RequestParam domain: String): PublicSiteResponse {
        val resolved = siteService.resolveByDomain(domain)
            ?: throw NotFoundException("No published site for domain $domain")
        return PublicSiteResponse(resolved.site.subdomain, resolved.content)
    }
}
