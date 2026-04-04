package br.com.ilumina.dto.auth;

import java.util.Set;
import java.util.UUID;

public record AuthResponse(
        String token,
        String type,
        UUID userId,
        String name,
        String email,
        Set<String> roles
) {
}
