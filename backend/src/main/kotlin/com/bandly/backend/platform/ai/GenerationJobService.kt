package com.bandly.backend.platform.ai

import com.bandly.backend.platform.error.NotFoundException
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import java.time.Instant
import java.util.UUID

/**
 * Wraps every [AiGenerationPort] call with the job bookkeeping from
 * blueprint §12 — every domain service (ArtistDnaService today, others
 * later) goes through here rather than calling the port directly, so that
 * bookkeeping only exists in one place.
 */
@Service
class GenerationJobService(
    private val jobs: GenerationJobRepository,
    private val ai: AiGenerationPort,
    private val streams: GenerationStreamRegistry,
) {

    /**
     * Structured generation is used for the rarer, deliberate actions
     * (compiling a full Artist DNA) where the caller wants the finished
     * result, not a stream — so this blocks the request thread on purpose.
     * [AiGenerationPort.generateStructured] already degrades to [fallback]
     * internally on failure, so this rarely reaches the catch block below;
     * it's still there for anything unexpected (e.g. a bug in [fallback]
     * itself), so a job never sits in RUNNING forever.
     *
     * Deliberately not @Transactional: that would hold one DB connection
     * open for the entire duration of the (possibly multi-second) model
     * call, starving the connection pool under any real load. Each
     * jobs.save() below is its own small, auto-committed transaction
     * (JpaRepository.save() provides that per call) instead.
     */
    fun <T : Any> runStructured(
        bandId: UUID,
        module: String,
        request: GenerationRequest,
        responseType: Class<T>,
        fallback: () -> T,
    ): T {
        val job = jobs.save(
            GenerationJob(
                bandId = bandId,
                module = module,
                status = GenerationStatus.RUNNING,
                promptPayload = mapOf("system" to request.systemPrompt, "user" to request.userPrompt),
            ),
        )
        return try {
            val result = ai.generateStructured(request, responseType, fallback)
            job.status = GenerationStatus.DONE
            job.responsePayload = mapOf("content" to result.toString())
            job.completedAt = Instant.now()
            jobs.save(job)
            result
        } catch (ex: Exception) {
            job.status = GenerationStatus.FAILED
            job.error = ex.message
            job.completedAt = Instant.now()
            jobs.save(job)
            throw ex
        }
    }

    /**
     * Kicks off a streamed generation and returns immediately with the job —
     * the caller gets a job id back to hand to the client, which then opens
     * its own connection to [events]. The actual model call runs on
     * whatever scheduler the adapter's Flux uses (Spring AI's WebClient-
     * backed stream, off the request thread); `jobs.save()` inside the
     * doOn* callbacks is safe from that thread because JpaRepository.save()
     * opens its own transaction per call, it doesn't require one already
     * open on the calling thread.
     */
    fun streamText(bandId: UUID, module: String, request: GenerationRequest): GenerationJob {
        val job = jobs.save(
            GenerationJob(
                bandId = bandId,
                module = module,
                status = GenerationStatus.RUNNING,
                promptPayload = mapOf("system" to request.systemPrompt, "user" to request.userPrompt),
            ),
        )
        val sink = streams.open(job.id)
        val buffer = StringBuilder()

        ai.streamText(request)
            .doOnNext { chunk ->
                buffer.append(chunk)
                sink.tryEmitNext(chunk)
            }
            .doOnComplete {
                job.status = GenerationStatus.DONE
                job.responsePayload = mapOf("content" to buffer.toString())
                job.completedAt = Instant.now()
                jobs.save(job)
                sink.tryEmitComplete()
                streams.close(job.id)
            }
            .doOnError { ex ->
                job.status = GenerationStatus.FAILED
                job.error = ex.message
                job.completedAt = Instant.now()
                jobs.save(job)
                sink.tryEmitError(ex)
                streams.close(job.id)
            }
            // Explicit no-op consumers: doOnNext/doOnComplete/doOnError above already
            // do the real work. Reactor treats a bare .subscribe() with an unhandled
            // error as "dropped" and escalates it; passing empty consumers here just
            // tells it that's intentional, not an oversight.
            .subscribe({ }, { })

        return job
    }

    fun events(jobId: UUID): Flux<String> =
        streams.events(jobId) ?: throw NotFoundException("No active generation stream for job $jobId")

    /** One turn of a conversation (IdentityChatService) — same blocking-call
     * shape and job bookkeeping as [runStructured], just no fallback: a
     * failed chat reply should surface as an error to retry, not silently
     * degrade into a fake conversational turn. */
    fun runChat(bandId: UUID, module: String, systemPrompt: String, history: List<ChatTurn>): String {
        val lastUserTurn = history.lastOrNull { it.role == ChatRole.USER }?.content.orEmpty()
        val job = jobs.save(
            GenerationJob(
                bandId = bandId,
                module = module,
                status = GenerationStatus.RUNNING,
                promptPayload = mapOf("system" to systemPrompt, "user" to lastUserTurn),
            ),
        )
        return try {
            val result = ai.chat(systemPrompt, history)
            job.status = GenerationStatus.DONE
            job.responsePayload = mapOf("content" to result)
            job.completedAt = Instant.now()
            jobs.save(job)
            result
        } catch (ex: Exception) {
            job.status = GenerationStatus.FAILED
            job.error = ex.message
            job.completedAt = Instant.now()
            jobs.save(job)
            throw ex
        }
    }
}
