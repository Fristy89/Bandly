package com.bandly.backend.artistdna.application

import com.bandly.backend.artistdna.domain.IdentityProfile
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

    fun reply(bandId: UUID, history: List<ChatTurn>): String =
        generationJobs.runChat(bandId, "identity-chat", BANDLY_SYSTEM_PROMPT, history)

    /** Turns the conversation into a saved Identity Profile — the same
     * saveIdentityProfile a manual form would call, so DNA generation
     * doesn't need to know whether the artist typed answers or talked
     * them through. */
    fun summarize(bandId: UUID, history: List<ChatTurn>): IdentityProfile {
        val transcript = history.joinToString("\n") { turn ->
            "${if (turn.role == ChatRole.USER) "Artist" else "Bandly"}: ${turn.content}"
        }

        val summary = generationJobs.runStructured(
            bandId = bandId,
            module = "identity-chat-summary",
            request = GenerationRequest(systemPrompt = SUMMARY_SYSTEM_PROMPT, userPrompt = transcript),
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
        return artistDnaService.saveIdentityProfile(bandId, answers)
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
            an interview form: ask one thing at a time, follow up naturally on what
            they actually said, and let it wander a little before steering back.
            Keep your own messages short, like texting, not writing an essay —
            usually one or two sentences, sometimes just a follow-up question.

            Over the course of the conversation you need to understand seven
            things about them, but never announce that you're "covering topics":
            why their music needs to exist, what's missing in their scene that
            they fill, how their sound actually sounds, what makes them different
            from artists in their lane, their personality as a performer, who
            they're really making this for, and the feeling they want someone to
            have the moment the music starts. Ask about whichever of these you
            don't have a real answer for yet, in whatever order feels natural
            given what they just told you.

            This app is built to work for everyone, including artists using a
            screen reader — keep your replies plain, well-punctuated sentences
            (no decorative formatting, emoji, or ASCII art) so they read cleanly
            aloud.
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
