package br.com.ilumina.dto.turma;

import java.util.UUID;

public record TurmaProfessorResponse(
        UUID id,
        String name,
        String email,
        boolean active
) {
}
