package com.bandly.backend.platform.speech

import jakarta.validation.constraints.NotBlank

data class SynthesizeRequest(
    @field:NotBlank val text: String,
    @field:NotBlank val languageCode: String,
)
