package br.com.ilumina.dto.prova;

import br.com.ilumina.entity.Prova.StatusProva;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ProvaDetalheResponse(
        UUID id,
        String titulo,
        String descricao,
        String disciplina,
        Integer qntQuestoes,
        StatusProva status,
        UUID turmaId,
        String turmaNome,
        UUID professorId,
        String professorNome,
        List<QuestaoResponse> questoes,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
