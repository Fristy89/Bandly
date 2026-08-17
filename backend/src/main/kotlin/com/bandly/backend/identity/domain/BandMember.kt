package com.bandly.backend.identity.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID

/**
 * A user's membership + role within a Band. A row with joinedAt == null and
 * invitedEmail set represents a pending invite for someone without an account yet.
 */
@Entity
@Table(name = "band_members")
class BandMember(
    @Id
    val id: UUID = UUID.randomUUID(),

    @Column(name = "band_id", nullable = false)
    val bandId: UUID,

    @Column(name = "user_id")
    var userId: UUID? = null,

    @Column(name = "invited_email", length = 320)
    var invitedEmail: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var role: BandRole,

    @Column(name = "invited_at", nullable = false)
    var invitedAt: Instant = Instant.now(),

    @Column(name = "joined_at")
    var joinedAt: Instant? = null,
)
