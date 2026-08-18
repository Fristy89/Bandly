package com.bandly.backend.platform.ai

import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux

/**
 * The default adapter until bandly.ai.enabled=true — the whole app, including
 * every domain module built on top of AiGenerationPort, works end-to-end
 * without an Anthropic key or any network calls. Useful for local dev, demos,
 * and fast/deterministic tests, not just "no key yet."
 */
@Component
@ConditionalOnProperty(prefix = "bandly.ai", name = ["enabled"], havingValue = "false", matchIfMissing = true)
class StubAiGenerationAdapter : AiGenerationPort {

    private val logger = LoggerFactory.getLogger(StubAiGenerationAdapter::class.java)

    override fun generateText(request: GenerationRequest): String {
        logger.info("bandly.ai.enabled=false — returning stub text instead of calling Anthropic")
        return "[stub output — set bandly.ai.enabled=true and ANTHROPIC_API_KEY to see the real model here]"
    }

    override fun <T : Any> generateStructured(request: GenerationRequest, responseType: Class<T>, fallback: () -> T): T {
        logger.info("bandly.ai.enabled=false — returning a stub {} instead of calling Anthropic", responseType.simpleName)
        return fallback()
    }

    override fun streamText(request: GenerationRequest): Flux<String> {
        logger.info("bandly.ai.enabled=false — streaming stub tokens instead of calling Anthropic")
        val words = "This is a stubbed stream — enable bandly.ai.enabled to see real tokens arrive here."
            .split(" ")
        return Flux.fromIterable(words)
            .delayElements(java.time.Duration.ofMillis(80))
            .map { "$it " }
    }
}
