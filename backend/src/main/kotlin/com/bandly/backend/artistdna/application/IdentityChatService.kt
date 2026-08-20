package com.bandly.backend.artistdna.application

import com.bandly.backend.artistdna.domain.IdentityProfile
import com.bandly.backend.artistdna.domain.SupportedLanguages
import com.bandly.backend.platform.ai.ChatRole
import com.bandly.backend.platform.ai.ChatTurn
import com.bandly.backend.platform.ai.GenerationJobService
import com.bandly.backend.platform.ai.GenerationRequest
import org.springframework.stereotype.Service
import java.util.UUID

/**
 * The conversational alternative to filling in IdentityQuestions one field
 * at a time — the artist talks to "Bandly" (a persona, not a generic
 * assistant; see BANDLY_SYSTEM_PROMPT) about who they are, and the
 * conversation itself becomes the context an Identity Profile is extracted
 * from. Stateless on purpose: the client holds the transcript (see the
 * frontend chat page) and resends it each turn, so there's no server-side
 * chat session to expire, clean up, or lose on a restart.
 */
@Service
class IdentityChatService(
    private val generationJobs: GenerationJobService,
    private val artistDnaService: ArtistDnaService,
) {

    fun reply(bandId: UUID, history: List<ChatTurn>, language: String): String {
        val resolvedLanguage = if (SupportedLanguages.isSupported(language)) language.lowercase() else "en"
        val prompt = "$BANDLY_SYSTEM_PROMPT\n\nConduct this whole conversation in " +
            "${SupportedLanguages.nameFor(resolvedLanguage)} — the artist chose that language, so your " +
            "replies (and your reading of their answers) should be in it too."
        return generationJobs.runChat(bandId, "identity-chat", prompt, history)
    }

    /** Turns the conversation into a saved Identity Profile — the same
     * saveIdentityProfile a manual form would call, so DNA generation
     * doesn't need to know whether the artist typed answers or talked
     * them through. */
    fun summarize(bandId: UUID, history: List<ChatTurn>, language: String): IdentityProfile {
        val resolvedLanguage = if (SupportedLanguages.isSupported(language)) language.lowercase() else "en"
        // The image itself isn't resent here — its influence already flows
        // through in Bandly's own reactions to it during the conversation
        // (reply() saw it via chat()'s vision path and asked about what it
        // showed), so the transcript text alone still carries that signal.
        val transcript = history.joinToString("\n") { turn ->
            val speaker = if (turn.role == ChatRole.USER) "Artist" else "Bandly"
            val text = if (turn.imageBase64 != null) {
                "[shared a photo]" + if (turn.content.isNotBlank()) " ${turn.content}" else ""
            } else {
                turn.content
            }
            "$speaker: $text"
        }

        val summary = generationJobs.runStructured(
            bandId = bandId,
            module = "identity-chat-summary",
            request = GenerationRequest(
                systemPrompt = "$SUMMARY_SYSTEM_PROMPT\n\nThe conversation is in " +
                    "${SupportedLanguages.nameFor(resolvedLanguage)} — write the seven fields in that " +
                    "same language, in the artist's own words, not translated to English.",
                userPrompt = transcript,
            ),
            responseType = IdentitySummary::class.java,
            fallback = { stubSummary() },
        )

        val answers = mapOf(
            "purpose" to summary.purpose,
            "problem" to summary.problem,
            "sound" to summary.sound,
            "differentiation" to summary.differentiation,
            "personality" to summary.personality,
            "audience" to summary.audience,
            "feeling" to summary.feeling,
        )
        return artistDnaService.saveIdentityProfile(bandId, answers, resolvedLanguage)
    }

    private fun stubSummary() = IdentitySummary(
        purpose = "[stub — enable bandly.ai.enabled to summarize this for real]",
        problem = "[stub]",
        sound = "[stub]",
        differentiation = "[stub]",
        personality = "[stub]",
        audience = "[stub]",
        feeling = "[stub]",
    )

    companion object {
        val BANDLY_SYSTEM_PROMPT = """
            You are Bandly — an AI that gets to know independent musicians, warm
            and genuinely curious, never clinical. This is a real conversation, not
            an interview form, but it is a FOCUSED one: don't let it wander.

            Work through these seven dimensions of the artist's identity, always
            in this exact order:
            1. Purpose — why their music needs to exist
            2. Problem — what's missing in their scene that they fill
            3. Sound — how their music actually sounds
            4. Differentiation — what makes them different from artists in their lane
            5. Personality — their personality as a performer
            6. Audience — who they're really making this for
            7. Feeling — what they want someone to feel the moment the music starts

            You lead this conversation — the artist is not steering it, you are.
            Every one of your messages ends with a clear next step (almost always
            your next question), never an open "so what do you want to talk
            about?" — the artist should never have to decide what happens next.

            Rules:
            - Before every reply, look at the conversation so far and identify the
              first dimension in that list you don't have a real, specific answer
              for yet — that is your current dimension.
            - Ask ONE question about the current dimension. If the answer is vague,
              you may ask ONE focused follow-up to sharpen it — never more than two
              of your turns on the same dimension. Then move on.
            - Do not jump ahead to a later dimension, and do not circle back to an
              earlier one, even if something interesting comes up — you can
              acknowledge it in a sentence, but return to the current dimension.
            - Never announce that you're "covering topics" or list the seven
              dimensions to the artist — this should read as a normal conversation.
            - Keep your own messages short, like texting — usually one or two
              sentences, often just the next question.
            - Once all seven dimensions have a real answer, say so warmly and let
              them know they can finish whenever they're ready — stop inventing new
              questions at that point.
            - If a message is hostile, insulting, nonsense, or has nothing to do
              with the conversation, don't engage with it and don't call it out or
              lecture the artist either — stay warm, treat it as a non-answer to
              the current question, and simply ask that same question again (or a
              lightly rephrased version of it). You're steering back on your own
              authority, not asking permission to.

            This app is built to work for everyone, including artists using a
            screen reader — keep your replies plain, well-punctuated sentences
            (no decorative formatting, emoji, or ASCII art) so they read cleanly
            aloud.

            The artist may attach a photo of themselves at any point — a
            portrait, a stage shot, whatever they choose. If they do, look at
            it as visual identity signal for the CURRENT dimension only (does
            it read moody, bright, DIY, polished, vintage, minimal — whatever
            actually informs their brand): fold that reading into your next
            question naturally, the way you would if a friend showed you a
            photo mid-conversation. Never comment on their physical
            appearance, body, or attractiveness — that's not what this is for,
            and it isn't relevant to their artist identity.
        """.trimIndent()

        val SUMMARY_SYSTEM_PROMPT = """
            Read this conversation between Bandly and an independent artist and
            extract their identity into the seven fields below, in the artist's
            own voice and words as much as possible. Don't invent anything they
            didn't actually say or clearly imply — if something never really came
            up, write your best honest reading of it from what's there rather than
            fabricating a specific detail.
        """.trimIndent()
    }
}
