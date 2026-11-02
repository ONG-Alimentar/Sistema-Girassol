import { Link } from 'react-router-dom'

/** 403 — autenticado, mas sem permissão para o recurso. */
export function ForbiddenPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>403 — Acesso negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <Link to="/">Voltar ao início</Link>
    </main>
  )
}
