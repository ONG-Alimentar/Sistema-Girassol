import { Link } from 'react-router-dom'

/** 404 — rota inexistente. */
export function NotFoundPage() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>404 — Página não encontrada</h1>
      <Link to="/">Voltar ao início</Link>
    </main>
  )
}
