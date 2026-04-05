package br.com.ilumina.dto.turma;

import br.com.ilumina.entity.Turma.Ensino;
import br.com.ilumina.entity.Turma.Turno;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record UpdateTurmaRequest(
        @Size(max = 60, message = "O nome da turma deve ter no máximo 60 caracteres.")
        String nome,

        @Min(value = 1, message = "O ano deve estar entre 1 e 9.")
        @Max(value = 9, message = "O ano deve estar entre 1 e 9.")
        Integer ano,

        Turno turno,

        Ensino ensino,

        @Min(value = 0, message = "A quantidade de alunos deve ser maior ou igual a 0.")
        Integer qntAlunos
) {
}
