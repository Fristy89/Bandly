package com.bandly.backend.platform.ai

import reactor.core.publisher.Flux

/**
 * The one seam between Bandly's domain modules and "an LLM." Domain services
 * (ArtistDnaService and, later, Content Studio/Relationships/Grants) depend
 * on this interface only — never on ChatClient, Spring AI, or Anthropic
 * directly. That's what makes [SpringAiGenerationAdapter] swappable for
 * [StubAiGenerationAdapter] via one config flag, and swappable for a
 * different provider later without touching a single domain service.
 *
 * See Bandly Architecture Blueprint §06 (why this is a shared kernel, not a
 * domain module in its own right) and §12 (why generation is async/job-based).
 */
interface AiGenerationPort {

    /** Free-text generation — a single string back, no schema. */
    fun generateText(request: GenerationRequest): String

    /**
     * Structured generation — the model's output is parsed straight into
     * [responseType] (Spring AI's BeanOutputConverter does this by appending
     * format instructions to the prompt and parsing the JSON it gets back).
     *
     * [fallback] is not "what to return if nobody configured an API key" —
     * it's what to return if generation fails for *any* reason (missing key,
     * network error, a model response that didn't parse). Every real
     * integration with an external service needs a degrade-gracefully path;
     * this makes that path a required parameter instead of an afterthought.
     */
    fun <T : Any> generateStructured(request: GenerationRequest, responseType: Class<T>, fallback: () -> T): T

    /** Token-by-token generation, for the SSE/"watch it being written" case. */
    fun streamText(request: GenerationRequest): Flux<String>

    /**
     * Multi-turn conversation — the Identity Chat (IdentityChatService) is
     * the first caller. Separate from [generateText]/[generateStructured]
     * rather than overloading [GenerationRequest] with an optional history
     * list: those two are always exactly one system + one user turn, and
     * conflating "single exchange" with "ongoing conversation" would make
     * both shapes harder to read at every call site, not just this one.
     */
    fun chat(systemPrompt: String, history: List<ChatTurn>): String
}

enum class ChatRole { USER, ASSISTANT }

data class ChatTurn(val role: ChatRole, val content: String)

data class GenerationRequest(
    val systemPrompt: String,
    val userPrompt: String,
)
