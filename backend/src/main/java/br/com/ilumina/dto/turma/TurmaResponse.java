package br.com.ilumina.dto.turma;

import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.Turno;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record TurmaResponse(
        UUID id,
        String nome,
        Integer ano,
        Turno turno,
        Ensino ensino,
        Integer qntAlunos,
        boolean active,
        OffsetDateTime createdAt,
        List<TurmaProfessorResponse> professores
) {
}
