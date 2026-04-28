package br.com.ilumina.dto.flashcard;

import br.com.ilumina.entity.Flashcard.StatusColecao;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ColecaoDetalheResponse(
        UUID id,
        String titulo,
        String tema,
        Integer qntCards,
        StatusColecao status,
        String turmaNome,
        long totalFlashcards,
        OffsetDateTime createdAt,
        List<FlashcardResponse> flashcards
) {
}