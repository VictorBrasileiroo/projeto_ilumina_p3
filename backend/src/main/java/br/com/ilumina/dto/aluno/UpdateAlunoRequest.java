package br.com.ilumina.dto.aluno;

import jakarta.validation.constraints.Size;

public record UpdateAlunoRequest(
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String name,

        @Size(max = 50, message = "A matrícula deve ter no máximo 50 caracteres.")
        String matricula,

        @Size(max = 30, message = "O sexo/gênero deve ter no máximo 30 caracteres.")
        String sexo
) {
}
