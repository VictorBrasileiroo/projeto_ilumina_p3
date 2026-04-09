package br.com.ilumina.dto.prova;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateProvaRequest(
        @Size(max = 255, message = "O título deve ter no máximo 255 caracteres.")
        String titulo,

        @Size(max = 2000, message = "A descrição deve ter no máximo 2000 caracteres.")
        String descricao,

        @Size(max = 100, message = "A disciplina deve ter no máximo 100 caracteres.")
        String disciplina,

        Integer qntQuestoes,

        UUID turmaId
) {
}
