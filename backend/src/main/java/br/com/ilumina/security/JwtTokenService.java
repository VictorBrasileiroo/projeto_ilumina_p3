package br.com.ilumina.security;

import br.com.ilumina.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class JwtTokenService {

    private static final String CLAIM_TOKEN_TYPE = "tokenType";
    private static final String CLAIM_USER_ID = "userId";
    private static final String CLAIM_ROLES = "roles";
    private static final String CLAIM_PROFESSOR_ID = "professorId";
    private static final String CLAIM_ALUNO_ID = "alunoId";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    private final JwtProperties jwtProperties;

    public JwtTokenService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public String generateAccessToken(
            String email,
            UUID userId,
            List<String> roles,
            UUID professorId,
            UUID alunoId
    ) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + jwtProperties.expiration());

        var builder = Jwts.builder()
                .subject(email)
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS)
                .claim(CLAIM_USER_ID, userId.toString())
                .claim(CLAIM_ROLES, roles)
                .issuedAt(now)
            .expiration(expirationDate);

        if (professorId != null) {
            builder.claim(CLAIM_PROFESSOR_ID, professorId.toString());
        }

        if (alunoId != null) {
            builder.claim(CLAIM_ALUNO_ID, alunoId.toString());
        }

        return builder
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String email, UUID userId) {
        Date now = new Date();
        Date expirationDate = new Date(now.getTime() + jwtProperties.refreshExpiration());

        return Jwts.builder()
                .subject(email)
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH)
                .claim(CLAIM_USER_ID, userId.toString())
                .issuedAt(now)
                .expiration(expirationDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractUserId(String token) {
        return extractAllClaims(token).get(CLAIM_USER_ID, String.class);
    }

    public String extractTokenType(String token) {
        return extractAllClaims(token).get(CLAIM_TOKEN_TYPE, String.class);
    }

    public boolean isAccessTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        String tokenType = extractTokenType(token);

        return TOKEN_TYPE_ACCESS.equals(tokenType)
                && username.equals(userDetails.getUsername())
                && !isTokenExpired(token);
    }

    public boolean isRefreshTokenValid(String token, String email, UUID userId) {
        String username = extractUsername(token);
        String tokenType = extractTokenType(token);
        String claimUserId = extractUserId(token);

        return TOKEN_TYPE_REFRESH.equals(tokenType)
                && username != null
                && username.equalsIgnoreCase(email)
                && claimUserId != null
                && claimUserId.equals(userId.toString())
                && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token).getExpiration().before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtProperties.secret().getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}