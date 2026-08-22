package com.bandly.backend.platform.ai

import org.slf4j.LoggerFactory
import org.springframework.ai.chat.client.ChatClient
import org.springframework.ai.chat.messages.AssistantMessage
import org.springframework.ai.chat.messages.Message
import org.springframework.ai.chat.messages.SystemMessage
import org.springframework.ai.chat.messages.UserMessage
import org.springframework.ai.content.Media
import org.springframework.ai.converter.BeanOutputConverter
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.io.ByteArrayResource
import org.springframework.stereotype.Component
import org.springframework.util.MimeType
import reactor.core.publisher.Flux
import java.util.Base64

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

    // Not .call().content()/.call().entity() (both read only the first
    // Generation) — see chat()'s comment below for the full story. Discovered
    // via generateStructured: ArtistDnaOutput regularly came back as a
    // Jackson "No content to map due to end-of-input" error and a silent
    // fallback to stub output, even though a raw call to the same model with
    // the same prompt succeeded outside the app every time. The model
    // sometimes returns more than one Generation in ChatResponse.results
    // (an empty leading one, the real content in a later one); every call
    // shape here now joins all of them instead of trusting there's exactly
    // one, the same fix chat() already had.
    override fun generateText(request: GenerationRequest): String {
        val response = chatClient.prompt().system(request.systemPrompt).user(request.userPrompt).call().chatResponse()
        return response?.results.orEmpty().joinToString("") { it.output.text.orEmpty() }
    }

    override fun <T : Any> generateStructured(request: GenerationRequest, responseType: Class<T>, fallback: () -> T): T =
        try {
            val converter = BeanOutputConverter(responseType)
            val response = chatClient.prompt()
                .system(request.systemPrompt)
                .user("${request.userPrompt}\n\n${converter.format}")
                .call()
                .chatResponse()
            val text = response?.results.orEmpty().joinToString("") { it.output.text.orEmpty() }
            if (text.isBlank()) fallback() else converter.convert(text)
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

    override fun chat(systemPrompt: String, history: List<ChatTurn>): String {
        val messages: List<Message> = listOf(SystemMessage(systemPrompt)) + history.map(::toMessage)
        // Not .call().content() (which reads only the first Generation) —
        // multi-turn Anthropic responses through this SDK path can come back
        // as more than one Generation in ChatResponse.results (observed: an
        // empty leading one, the real text in the second), so every result's
        // text is concatenated rather than trusting there's exactly one.
        val response = chatClient.prompt().messages(messages).call().chatResponse()
        return response?.results.orEmpty().joinToString("") { it.output.text.orEmpty() }
    }

    /** Vision — Claude supports it natively; a USER turn carrying an image
     * (see ChatTurn) becomes a UserMessage with a Media attachment instead
     * of plain text. Built once here, not duplicated per call site. */
    private fun toMessage(turn: ChatTurn): Message {
        if (turn.role == ChatRole.ASSISTANT) return AssistantMessage(turn.content)

        val imageBase64 = turn.imageBase64
        val mimeType = turn.imageMimeType
        if (imageBase64 == null || mimeType == null) return UserMessage(turn.content)

        return try {
            val bytes = Base64.getDecoder().decode(imageBase64)
            UserMessage.builder()
                .text(turn.content.ifBlank { "Here's a photo." })
                .media(Media(MimeType.valueOf(mimeType), ByteArrayResource(bytes)))
                .build()
        } catch (ex: Exception) {
            logger.warn("Couldn't attach image to chat turn, sending text only: {}", ex.message)
            UserMessage(turn.content)
        }
    }
}
