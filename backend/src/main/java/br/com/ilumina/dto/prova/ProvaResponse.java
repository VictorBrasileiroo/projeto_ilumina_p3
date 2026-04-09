package br.com.ilumina.dto.prova;

import br.com.ilumina.entity.Prova.StatusProva;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ProvaResponse(
        UUID id,
        String titulo,
        String disciplina,
        StatusProva status,
        UUID turmaId,
        String turmaNome,
        UUID professorId,
        String professorNome,
        long totalQuestoes,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
