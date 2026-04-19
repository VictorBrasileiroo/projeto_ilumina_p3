package br.com.ilumina.dto.flashcard;

import jakarta.validation.constraints.NotBlank;

public record CreateFlashcardRequest(
        @NotBlank(message = "O texto da frente e obrigatorio.")
        String textoFrente,

        @NotBlank(message = "O texto do verso e obrigatorio.")
        String textoVerso
) {
}