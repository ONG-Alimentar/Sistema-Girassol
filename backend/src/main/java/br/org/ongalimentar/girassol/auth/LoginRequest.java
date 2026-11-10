package br.org.ongalimentar.girassol.auth;

/** Corpo de {@code POST /api/auth/login} — ver frontend/src/api/auth.ts. */
public record LoginRequest(String email, String senha) {
}
