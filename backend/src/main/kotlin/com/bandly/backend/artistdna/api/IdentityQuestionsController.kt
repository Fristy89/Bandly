package com.bandly.backend.artistdna.api

import com.bandly.backend.artistdna.domain.IdentityQuestions
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class IdentityQuestionResponse(val key: String, val prompt: String, val helperText: String)

/** Same list for every band — not band-scoped, just the canonical question
 * set a future intake form renders (see IdentityQuestions for why these
 * specific questions). */
@RestController
@RequestMapping("/api/v1/dna/identity-questions")
class IdentityQuestionsController {

    @GetMapping
    fun list(): List<IdentityQuestionResponse> =
        IdentityQuestions.ALL.map { IdentityQuestionResponse(it.key, it.prompt, it.helperText) }
}
