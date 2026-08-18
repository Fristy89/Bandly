package com.bandly.backend.platform.ai

import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface GenerationJobRepository : JpaRepository<GenerationJob, UUID> {
    fun findAllByBandIdOrderByCreatedAtDesc(bandId: UUID): List<GenerationJob>
}
