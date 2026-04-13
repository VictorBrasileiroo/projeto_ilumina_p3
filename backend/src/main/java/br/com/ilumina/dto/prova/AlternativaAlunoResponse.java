package br.com.ilumina.dto.prova;

import java.util.UUID;

public record AlternativaAlunoResponse(
        UUID id,
        String letra,
        String texto
) {
}
