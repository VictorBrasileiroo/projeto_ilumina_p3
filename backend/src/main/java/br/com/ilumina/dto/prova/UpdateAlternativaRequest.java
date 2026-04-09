package br.com.ilumina.dto.prova;

import jakarta.validation.constraints.NotBlank;

public record UpdateAlternativaRequest(
        @NotBlank(message = "O texto da alternativa é obrigatório.")
        String texto
) {
}
