package com.bandly.backend.platform.ai

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.time.Instant
import java.util.UUID

enum class GenerationStatus { QUEUED, RUNNING, DONE, FAILED }

/**
 * One row per generation attempt — the audit trail from blueprint §07/§12.
 * prompt_payload/response_payload are JSONB on purpose: this is the one
 * legitimate use of JSONB in the schema (an append-only log of what was
 * actually sent to and received from the model), never queried by field,
 * so a rigid relational shape would only get in the way.
 */
@Entity
@Table(name = "generation_jobs")
class GenerationJob(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "band_id", nullable = false)
    val bandId: UUID,

    @Column(nullable = false, length = 60)
    val module: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: GenerationStatus = GenerationStatus.QUEUED,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "prompt_payload", nullable = false, columnDefinition = "jsonb")
    var promptPayload: Map<String, String> = emptyMap(),

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "response_payload", columnDefinition = "jsonb")
    var responsePayload: Map<String, String>? = null,

    @Column(columnDefinition = "text")
    var error: String? = null,

    @Column(name = "created_at", nullable = false, updatable = false)
    var createdAt: Instant = Instant.now(),

    @Column(name = "completed_at")
    var completedAt: Instant? = null,
)
