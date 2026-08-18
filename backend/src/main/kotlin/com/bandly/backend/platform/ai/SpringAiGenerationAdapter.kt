package com.bandly.backend.platform.ai

import org.slf4j.LoggerFactory
import org.springframework.ai.chat.client.ChatClient
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component
import reactor.core.publisher.Flux

/**
 * The real integration — this is the file worth reading if you're studying
 * Spring AI itself. Everything below is the fluent ChatClient API:
 * `.prompt().system(...).user(...).call()` for a blocking response,
 * `.entity(Class)` to have Spring AI parse the model's answer straight into
 * a Kotlin data class, `.stream().content()` for a Flux<String> of tokens
 * as they arrive. None of that leaks past this class — see [AiGenerationPort].
 *
 * `ChatClient.Builder` is auto-configured by Spring Boot the moment
 * spring-ai-starter-model-anthropic is on the classpath and
 * spring.ai.anthropic.api-key resolves to a non-blank value (see
 * application.yml — it always resolves, even to a placeholder, so this bean
 * builds cleanly whether or not a real key is set; bandly.ai.enabled below
 * is what actually decides whether this adapter or the stub one is active).
 */
@Component
@ConditionalOnProperty(prefix = "bandly.ai", name = ["enabled"], havingValue = "true")
class SpringAiGenerationAdapter(chatClientBuilder: ChatClient.Builder) : AiGenerationPort {

    private val logger = LoggerFactory.getLogger(SpringAiGenerationAdapter::class.java)
    private val chatClient = chatClientBuilder.build()

    override fun generateText(request: GenerationRequest): String =
        chatClient.prompt()
            .system(request.systemPrompt)
            .user(request.userPrompt)
            .call()
            .content()
            ?: ""

    override fun <T : Any> generateStructured(request: GenerationRequest, responseType: Class<T>, fallback: () -> T): T =
        try {
            chatClient.prompt()
                .system(request.systemPrompt)
                .user(request.userPrompt)
                .call()
                .entity(responseType)
                ?: fallback()
        } catch (ex: Exception) {
            // A bad/missing key, a network hiccup, a response that didn't parse into
            // responseType — all land here. We log and degrade rather than 500 the
            // request; the caller (GenerationJobService) still records the attempt.
            logger.warn("Anthropic call failed, falling back to a stub {}: {}", responseType.simpleName, ex.message)
            fallback()
        }

    override fun streamText(request: GenerationRequest): Flux<String> =
        chatClient.prompt()
            .system(request.systemPrompt)
            .user(request.userPrompt)
            .stream()
            .content()
}
