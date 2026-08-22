package com.bandly.backend.artistdna.infrastructure

import com.bandly.backend.artistdna.domain.ArtistDnaVersion
import com.bandly.backend.artistdna.domain.GeneratedAsset
import com.bandly.backend.artistdna.domain.IdentityProfile
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface IdentityProfileRepository : JpaRepository<IdentityProfile, UUID> {
    fun findByBandId(bandId: UUID): IdentityProfile?
}

interface ArtistDnaVersionRepository : JpaRepository<ArtistDnaVersion, UUID>

interface GeneratedAssetRepository : JpaRepository<GeneratedAsset, UUID> {
    fun findAllByDnaVersionId(dnaVersionId: UUID): List<GeneratedAsset>

    /** Scoped by bandId, not just id — JpaRepository.findById alone would
     * let one band read or edit another band's asset by guessing a UUID. */
    fun findByIdAndBandId(id: UUID, bandId: UUID): GeneratedAsset?
}
