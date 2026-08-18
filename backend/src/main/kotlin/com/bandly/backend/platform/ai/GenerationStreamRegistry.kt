package com.bandly.backend.platform.ai

import org.springframework.stereotype.Component
import reactor.core.publisher.Flux
import reactor.core.publisher.Sinks
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap

/**
 * Decouples "start a generation job" from "watch its output" — the two-step
 * shape from blueprint §08 (`POST .../generation-jobs` then
 * `GET .../generation-jobs/{jobId}/events`). Without this, the only way to
 * stream a response is to return the Flux directly from the POST, which
 * only the original HTTP connection could ever subscribe to; a browser
 * EventSource connecting to a *separate* GET request couldn't attach to it.
 *
 * A `replay().all()` sink means a client that connects to /events slightly
 * after the job started still gets every chunk from the beginning, not just
 * what's left. In-memory and per-instance — fine for one Spring Boot
 * instance; a multi-instance deployment would need this backed by
 * Redis pub/sub instead (see blueprint §19, "at meaningful scale").
 */
@Component
class GenerationStreamRegistry {

    private val sinks = ConcurrentHashMap<UUID, Sinks.Many<String>>()

    fun open(jobId: UUID): Sinks.Many<String> =
        sinks.computeIfAbsent(jobId) { Sinks.many().replay().all() }

    fun events(jobId: UUID): Flux<String>? = sinks[jobId]?.asFlux()

    fun close(jobId: UUID) {
        sinks.remove(jobId)
    }
}
