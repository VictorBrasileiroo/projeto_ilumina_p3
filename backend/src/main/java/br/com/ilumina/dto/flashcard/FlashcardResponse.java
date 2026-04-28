package br.com.ilumina.dto.flashcard;

import java.util.UUID;

public record FlashcardResponse(
        UUID id,
        String textoFrente,
        String textoVerso,
        int ordem
) {
}