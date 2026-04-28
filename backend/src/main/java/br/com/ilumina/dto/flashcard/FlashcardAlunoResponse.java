package br.com.ilumina.dto.flashcard;

import java.util.UUID;

public record FlashcardAlunoResponse(
        UUID id,
        String textoFrente,
        String textoVerso,
        int ordem
) {
}