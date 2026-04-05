package br.com.ilumina.dto.turma;

import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.Turno;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateTurmaRequest(
        @NotBlank(message = "O nome da turma é obrigatório.")
        @Size(max = 60, message = "O nome da turma deve ter no máximo 60 caracteres.")
        String nome,

        @NotNull(message = "O ano é obrigatório.")
        @Min(value = 1, message = "O ano deve estar entre 1 e 9.")
        @Max(value = 9, message = "O ano deve estar entre 1 e 9.")
        Integer ano,

        @NotNull(message = "O turno é obrigatório.")
        Turno turno,

        @NotNull(message = "O ensino é obrigatório.")
        Ensino ensino,

        @NotNull(message = "A quantidade de alunos é obrigatória.")
        @Min(value = 0, message = "A quantidade de alunos deve ser maior ou igual a 0.")
        Integer qntAlunos
) {
}
