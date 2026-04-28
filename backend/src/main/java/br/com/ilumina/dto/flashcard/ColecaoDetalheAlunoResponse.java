package br.com.ilumina.dto.flashcard;

import java.util.List;
import java.util.UUID;

public record ColecaoDetalheAlunoResponse(
        UUID id,
        String titulo,
        String tema,
        long totalFlashcards,
        String turmaNome,
        List<FlashcardAlunoResponse> flashcards
) {
}