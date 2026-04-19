package br.com.ilumina.dto.flashcard;

import java.util.UUID;

public record ColecaoAlunoResponse(
        UUID id,
        String titulo,
        String tema,
        long totalFlashcards,
        String turmaNome
) {
}