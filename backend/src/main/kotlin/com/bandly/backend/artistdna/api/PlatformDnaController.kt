package com.bandly.backend.artistdna.api

import com.bandly.backend.artistdna.application.ArtistDnaService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Bandly's own Artist DNA, public and unauthenticated — the login screen
 * reads it to show the platform's philosophy (its components, mantra,
 * archetype, palette) before anyone signs in. Lives under the
 * "/api/v1/public/" path that SecurityConfig already permits.
 */
@RestController
@RequestMapping("/api/v1/public/platform-dna")
class PlatformDnaController(private val artistDnaService: ArtistDnaService) {

    @GetMapping
    fun get(): PlatformDnaResponse {
        val version = artistDnaService.platformDnaOrNull()
            ?: return PlatformDnaResponse(
                generated = false,
                components = emptyList(),
                brandMantra = null,
                primaryArchetype = null,
                primaryColor = null,
                secondaryColor = null,
            )
        return PlatformDnaResponse(
            generated = true,
            components = version.dnaComponents,
            brandMantra = version.brandMantra,
            primaryArchetype = version.primaryArchetype,
            primaryColor = version.primaryColor,
            secondaryColor = version.secondaryColor,
        )
    }
}

data class PlatformDnaResponse(
    val generated: Boolean,
    val components: List<String>,
    val brandMantra: String?,
    val primaryArchetype: String?,
    val primaryColor: String?,
    val secondaryColor: String?,
)
