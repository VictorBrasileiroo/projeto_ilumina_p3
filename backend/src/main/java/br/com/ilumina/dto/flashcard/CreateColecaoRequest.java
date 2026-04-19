package br.com.ilumina.dto.flashcard;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateColecaoRequest(
        @NotBlank(message = "O titulo e obrigatorio.")
        @Size(max = 255, message = "O titulo deve ter no maximo 255 caracteres.")
        String titulo,

        @Size(max = 255, message = "O tema deve ter no maximo 255 caracteres.")
        String tema,

        Integer qntCards,

        @NotNull(message = "O ID da turma e obrigatorio.")
        UUID turmaId
) {
}