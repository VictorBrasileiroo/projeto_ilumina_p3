package br.com.ilumina.dto.aluno;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAlunoRequest(
        @NotBlank(message = "O nome é obrigatório.")
        @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres.")
        String name,

        @NotBlank(message = "O email é obrigatório.")
        @Email(message = "O email deve ser válido.")
        @Size(max = 100, message = "O email deve ter no máximo 100 caracteres.")
        String email,

        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 6, message = "A senha deve conter pelo menos 6 caracteres.")
        String password,

        @NotBlank(message = "A matrícula é obrigatória.")
        @Size(max = 50, message = "A matrícula deve ter no máximo 50 caracteres.")
        String matricula,

        @NotBlank(message = "O sexo/gênero é obrigatório.")
        @Size(max = 30, message = "O sexo/gênero deve ter no máximo 30 caracteres.")
        String sexo
) {
}
