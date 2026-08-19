package com.bandly.backend.artistdna.api

import com.bandly.backend.identity.application.BandService
import com.bandly.backend.platform.ai.ChatRole
import com.bandly.backend.platform.ai.ChatTurn
import com.bandly.backend.platform.error.UnauthorizedException
import com.bandly.backend.platform.security.currentUserId
import com.bandly.backend.artistdna.application.IdentityChatService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/v1/bands/{bandId}/dna/chat")
class IdentityChatController(
    private val identityChatService: IdentityChatService,
    private val bandService: BandService,
) {

    @PostMapping
    fun reply(@PathVariable bandId: UUID, @Valid @RequestBody request: ChatRequest): ChatReplyResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val reply = identityChatService.reply(bandId, toTurns(request.history))
        return ChatReplyResponse(reply)
    }

    @PostMapping("/summarize")
    fun summarize(@PathVariable bandId: UUID, @Valid @RequestBody request: ChatRequest): IdentityProfileResponse {
        bandService.requireMembership(bandId, requireAuthenticatedUser())
        val profile = identityChatService.summarize(bandId, toTurns(request.history))
        return IdentityProfileResponse(profile.id, profile.answers, profile.updatedAt)
    }

    private fun toTurns(history: List<ChatTurnRequest>): List<ChatTurn> =
        history.map { ChatTurn(if (it.role.equals("assistant", ignoreCase = true)) ChatRole.ASSISTANT else ChatRole.USER, it.content) }

    private fun requireAuthenticatedUser(): UUID =
        currentUserId() ?: throw UnauthorizedException("Authentication required")
}
