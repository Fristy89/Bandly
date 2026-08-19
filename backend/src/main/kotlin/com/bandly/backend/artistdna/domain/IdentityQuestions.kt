package com.bandly.backend.artistdna.domain

/**
 * The canonical Artist Identity Profile questions — the structure a
 * proven brand-positioning worksheet uses (purpose, problem/solution,
 * differentiation, personality, audience), rewritten as questions aimed at
 * an artist rather than a business. The goal of each one is for the artist
 * to end up clearer on their own identity by answering it, not just to
 * fill a database field — see ArtistDnaService, which reasons across these
 * same dimensions when generating bios and a color palette.
 *
 * IdentityProfile.answers stays a plain Map<String,String> keyed by
 * [Question.key] — flexible on purpose, since a frontend intake form isn't
 * built yet and the shape shouldn't be locked down prematurely. This list
 * is the one source of truth for what those keys mean; keep it and the
 * prompt-building in ArtistDnaService in sync by hand.
 */
object IdentityQuestions {

    data class Question(
        val key: String,
        val prompt: String,
        val helperText: String,
    )

    val ALL: List<Question> = listOf(
        Question(
            key = "purpose",
            prompt = "Why does your music need to exist?",
            helperText = "Not what genre you make — why you make it, and what it gives the people who hear it.",
        ),
        Question(
            key = "problem",
            prompt = "What's missing in your scene that you're filling?",
            helperText = "The gap you noticed before you started — in the sound, the message, or the experience.",
        ),
        Question(
            key = "sound",
            prompt = "How would you describe your sound to someone who's never heard it?",
            helperText = "Be specific: genres you blend, reference artists, the feeling in the room.",
        ),
        Question(
            key = "differentiation",
            prompt = "What do you do that other artists in your lane don't?",
            helperText = "Compare yourself to the closest thing you have to competition — what's actually different.",
        ),
        Question(
            key = "personality",
            prompt = "If your artist persona walked into a room, how would people describe them?",
            helperText = "Confident, vulnerable, chaotic, precise — the traits that show up in how you perform, not just what you play.",
        ),
        Question(
            key = "audience",
            prompt = "Who are you actually making this for?",
            helperText = "Picture one real person in your audience. What are they looking for when they find you?",
        ),
        Question(
            key = "feeling",
            prompt = "What do you want someone to feel the moment your music starts?",
            helperText = "One word is fine. This is the feeling everything else — bios, colors, the site — should protect.",
        ),
    )
}
