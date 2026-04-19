package br.com.ilumina.dto.flashcard;

import jakarta.validation.constraints.Size;

public record UpdateColecaoRequest(
        @Size(max = 255, message = "O titulo deve ter no maximo 255 caracteres.")
        String titulo,

        @Size(max = 255, message = "O tema deve ter no maximo 255 caracteres.")
        String tema,

        Integer qntCards
) {
}