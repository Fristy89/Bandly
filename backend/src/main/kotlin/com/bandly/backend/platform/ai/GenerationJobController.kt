package com.bandly.backend.platform.ai

import com.bandly.backend.identity.application.BandService
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import org.springframework.http.MediaType
import org.springframework.http.codec.ServerSentEvent
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import java.util.UUID

/**
 * Generic across every domain module — Content Studio, Relationships, and
 * Grants will all reuse this same endpoint shape once they call
 * GenerationJobService.streamText themselves, rather than each module
 * growing its own SSE plumbing.
 *
 * Note for whoever wires this into the frontend: the browser's native
 * EventSource API can't send an Authorization header, so a JWT-bearer SSE
 * endpoint like this one needs either a fetch()-based SSE client (reading
 * the stream manually) or a short-lived, single-use token in the URL —
 * deliberately left as a follow-up rather than guessed at here.
 */
@RestController
@RequestMapping("/api/v1/bands/{bandId}/generation-jobs")
class GenerationJobController(
    private val generationJobs: GenerationJobService,
    private val bandService: BandService,
) {

    @GetMapping("/{jobId}/events", produces = [MediaType.TEXT_EVENT_STREAM_VALUE])
    fun events(@PathVariable bandId: UUID, @PathVariable jobId: UUID): Flux<ServerSentEvent<String>> {
        val userId = currentUserId() ?: throw UnauthorizedException("Authentication required")
        bandService.requireMembership(bandId, userId)
        return generationJobs.events(jobId).map { chunk -> ServerSentEvent.builder(chunk).build() }
    }
}
