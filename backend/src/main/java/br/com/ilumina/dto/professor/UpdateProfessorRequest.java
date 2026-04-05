package br.com.ilumina.dto.professor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UpdateProfessorRequest(
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String name,

        @Email(message = "O email deve ser válido.")
        @Size(max = 100, message = "O email deve ter no máximo 100 caracteres.")
        String email,

        @Size(max = 100, message = "A disciplina deve ter no máximo 100 caracteres.")
        String disciplina,

        @Size(max = 30, message = "O sexo/gênero deve ter no máximo 30 caracteres.")
        String sexo
) {
}
