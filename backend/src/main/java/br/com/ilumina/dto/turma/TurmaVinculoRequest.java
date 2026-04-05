package br.com.ilumina.dto.turma;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record TurmaVinculoRequest(
        @NotNull(message = "O id do professor é obrigatório.")
        UUID professorId
) {
}
