package com.bandly.backend.artistdna.application

/**
 * A blunt, deliberately small guard against plain insults in chat input —
 * not a moderation system, and easy to get around with spacing or spelling
 * tricks. It exists only to catch the unambiguous case (an artist typing a
 * straight insult to see what happens) before it ever reaches the model or
 * gets stored. Anything more nuanced — hostile tone without a blocked
 * word, off-topic rambling, a rude phrase this list doesn't happen to
 * cover — is Bandly's own job to handle gracefully via
 * IdentityChatService.BANDLY_SYSTEM_PROMPT; a keyword list can't do
 * contextual redirection, only Claude can.
 */
object ChatModeration {

    private val BLOCKED_WORDS = setOf(
        // Dutch
        "eikel", "klootzak", "kutwijf", "kanker", "hoerenzoon", "lul", "kut", "trut", "debiel",
        // German
        "arschloch", "wichser", "hurensohn", "fotze", "schlampe", "missgeburt",
        // English
        "asshole", "bitch", "bastard", "cunt", "motherfucker", "dickhead",
    )

    fun containsProfanity(text: String): Boolean {
        val normalized = " " + text.lowercase().replace(Regex("[^\\p{L}\\s]"), " ").replace(Regex("\\s+"), " ").trim() + " "
        return BLOCKED_WORDS.any { normalized.contains(" $it ") }
    }
}
