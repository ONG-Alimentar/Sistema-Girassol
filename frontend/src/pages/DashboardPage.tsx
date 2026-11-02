import { useAuth } from '../auth/useAuth.ts'

/** Home do app autenticado. */
export function DashboardPage() {
  const { user } = useAuth()
  return (
    <section>
      <h1>Início</h1>
      <p>Bem-vindo(a), {user?.nome ?? user?.email}.</p>
      <p>Use o menu acima para navegar entre os módulos.</p>
    </section>
  )
}
