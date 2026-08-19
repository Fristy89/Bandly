package com.bandly.backend.artistdna.domain

/** The Euregio launch market — Identity Chat and DNA generation both read
 * this. An unrecognized code falls back to English rather than failing;
 * "the language picker only ever sends one of these three anyway" isn't a
 * safe assumption to build a prompt-injection point on. */
object SupportedLanguages {
    private val NAMES = mapOf(
        "nl" to "Dutch",
        "de" to "German",
        "en" to "English",
    )

    fun nameFor(code: String): String = NAMES[code.lowercase()] ?: NAMES.getValue("en")

    fun isSupported(code: String): Boolean = NAMES.containsKey(code.lowercase())
}
