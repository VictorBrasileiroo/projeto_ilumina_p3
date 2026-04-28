package br.com.ilumina.dto.turma;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TurmaAlunoVinculoRequest(
        @NotNull(message = "O id do aluno é obrigatório.")
        UUID alunoId
) {
}
