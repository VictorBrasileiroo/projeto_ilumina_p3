package br.com.ilumina.dto.flashcard;

import br.com.ilumina.entity.Flashcard.StatusColecao;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ColecaoResponse(
        UUID id,
        String titulo,
        String tema,
        Integer qntCards,
        StatusColecao status,
        String turmaNome,
        long totalFlashcards,
        OffsetDateTime createdAt
) {
}